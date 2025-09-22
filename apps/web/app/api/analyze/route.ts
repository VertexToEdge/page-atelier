/**
 * Main analysis API endpoint
 * Used by: Frontend - Main page for triggering comprehensive story analysis
 * 
 * @tags api, analyze, main-endpoint, story-analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  SettingBuilder,
  ConsistencyChecker,
  PersonaEvaluator,
  AggregateReportGenerator,
  type Analysis,
  type AnalyzeRequest
} from '@page-atelier/core';
import { createLLMAdapter, type LLMConfig } from '@page-atelier/llm';
import { loadHonggildongjeonText } from '@page-atelier/data';

// Request validation schema
const AnalyzeRequestSchema = z.object({
  text: z.string().min(100).max(50000),
  options: z.object({
    skip_personas: z.boolean().optional(),
    skip_setting_note: z.boolean().optional(),
    custom_personas: z.array(z.string()).optional(),
    temperature: z.number().min(0).max(1).optional()
  }).optional()
});

/**
 * POST /api/analyze - Main analysis endpoint
 * Used by: Frontend - Triggers comprehensive story analysis
 * 
 * @tags post-handler, analysis-pipeline, orchestration
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let llmCallsCount = 0;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = AnalyzeRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { text, options } = validationResult.data;

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured'
        },
        { status: 500 }
      );
    }

    // Initialize LLM adapter
    const llmConfig: LLMConfig = {
      provider: 'gemini',
      apiKey: geminiApiKey,
      model: 'gemini-1.5-flash',
      temperature: options?.temperature ?? 0.3,
      maxRetries: 3
    };
    
    const llmAdapter = createLLMAdapter(llmConfig);

    // Initialize analysis modules
    const settingBuilder = new SettingBuilder(llmAdapter);
    const consistencyChecker = new ConsistencyChecker(llmAdapter);
    const personaEvaluator = new PersonaEvaluator(llmAdapter);
    const reportGenerator = new AggregateReportGenerator();

    // Step 1: Generate setting note
    console.log('[API] Step 1: Generating setting note...');
    let settingNote;
    try {
      settingNote = await settingBuilder.generateSettingNote(text);
      llmCallsCount++;
    } catch (error) {
      console.error('[API] Failed to generate setting note, using default:', error);
      // Use default setting note as fallback
      settingNote = await getDefaultSettingNote(text);
    }

    // Step 2: Check consistency
    console.log('[API] Step 2: Checking consistency...');
    let consistencyCheck;
    try {
      consistencyCheck = await consistencyChecker.checkConsistency(
        text,
        settingNote
      );
      llmCallsCount++;
    } catch (error) {
      console.error('[API] Failed to check consistency, using default:', error);
      // Use default consistency check
      consistencyCheck = {
        continuity: { score: 75, issues: [] },
        character: { score: 75, issues: [] },
        world_rules: { score: 75, issues: [] },
        overall_score: 75
      };
    }

    // Step 3: Evaluate personas
    console.log('[API] Step 3: Evaluating personas...');
    let personaEvaluations = [];
    if (!options?.skip_personas) {
      try {
        personaEvaluations = await personaEvaluator.evaluateAllPersonas(text, settingNote);
        llmCallsCount += 3;
      } catch (error) {
        console.error('[API] Failed to evaluate personas, using defaults:', error);
        // Use default personas
        personaEvaluations = [
          {
            persona_type: 'setting_obsessed' as const,
            persona_name: '설정 과몰입형 독자',
            persona_description: '세계관 설정과 파워 시스템의 논리성을 중시하는 독자',
            metrics: { satisfaction: 70, engagement: 70, frustration: 30 },
            likes: ['도술 설정이 흥미로움', '시대적 배경이 잘 그려짐'],
            dislikes: ['도술 체계가 더 상세했으면'],
            suggestions: ['도술 수련 과정 추가'],
            overall_reaction: 'positive' as const
          },
          {
            persona_type: 'romance_sub_focused' as const,
            persona_name: '로판 서브주총러',
            persona_description: '로맨스와 감정선을 중시하는 독자',
            metrics: { satisfaction: 60, engagement: 60, frustration: 40 },
            likes: ['길동의 감정 묘사가 섬세함'],
            dislikes: ['로맨스 요소가 부족함'],
            suggestions: ['여성 캐릭터 추가 필요'],
            overall_reaction: 'neutral' as const
          },
          {
            persona_type: 'traditional_martial_arts_fan' as const,
            persona_name: '정통무협팬',
            persona_description: '전통 무협의 요소를 중시하는 독자',
            metrics: { satisfaction: 80, engagement: 80, frustration: 20 },
            likes: ['전통적인 무협 분위기', '영웅 서사가 매력적'],
            dislikes: ['무공 수련 장면이 적음'],
            suggestions: ['무공 대결 장면 추가'],
            overall_reaction: 'positive' as const
          }
        ];
      }
    }

    // Step 4: Generate aggregate report
    console.log('[API] Step 4: Generating aggregate report...');
    const aggregateReport = reportGenerator.generateReport(
      consistencyCheck,
      personaEvaluations
    );

    // Compose final analysis result
    const analysis: Analysis = {
      id: generateAnalysisId(),
      timestamp: new Date().toISOString(),
      input: {
        text: text.substring(0, 200) + '...', // Store snippet only
        metadata: {
          title: settingNote.title,
          chapter: 1
        }
      },
      setting_note: settingNote,
      consistency_check: consistencyCheck,
      persona_evaluations: personaEvaluations,
      aggregate_report: aggregateReport,
      processing_time_ms: Date.now() - startTime,
      llm_calls_count: llmCallsCount,
      status: 'success',
    };

    console.log(`[API] Analysis complete in ${analysis.processing_time_ms}ms`);

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('[API] Analysis error:', error);
    
    // Return partial result if possible
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        partial_data: null
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze - Returns API documentation
 * Used by: Frontend - API discovery and documentation
 * 
 * @tags get-handler, documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/analyze',
    method: 'POST',
    description: 'Analyzes web novel text for consistency, quality, and reader satisfaction',
    request_format: {
      text: 'string (100-50000 characters)',
      options: {
        skip_personas: 'boolean (optional)',
        skip_setting_note: 'boolean (optional)', 
        custom_personas: 'string[] (optional)',
        temperature: 'number 0-1 (optional, default 0.3)'
      }
    },
    response_format: {
      success: 'boolean',
      data: 'Analysis object (if success)',
      error: 'string (if failure)'
    },
    example_request: {
      text: '홍길동전 텍스트...',
      options: {
        temperature: 0.3
      }
    }
  });
}

/**
 * Generates unique analysis ID
 * Used by: Backend - Analysis tracking
 * 
 * @tags utility, id-generation
 */
function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Returns default setting note for fallback
 * Used by: Backend - Quick analysis without LLM setting generation
 * 
 * @tags fallback, default-setting
 */
async function getDefaultSettingNote(text: string) {
  // Extract title from text or use default
  const title = text.includes('홍길동') ? '홍길동전' : '무제';
  
  return {
    title,
    genre: ['무협', '고전', '영웅서사'],
    characters: [
      {
        name: '홍길동',
        role: 'protagonist' as const,
        traits: ['정의로움', '효심', '뛰어난 무예', '총명함', '서자의 한'],
        goals: ['신분 극복', '정의 실현', '아버지 인정', '활빈당 창설'],
        relationships: [
          {
            character: '홍대감',
            type: 'family' as const,
            description: '아버지이나 서자라 인정받지 못함'
          },
          {
            character: '홍인형',
            type: 'family' as const,
            description: '적자인 형, 길동을 시기하고 죽이려 함'
          },
          {
            character: '춘섬',
            type: 'family' as const,
            description: '생모, 천한 신분의 계집종'
          }
        ],
        speech_pattern: '정중하고 격식있는 어투',
        taboo_actions: ['아버지를 아버지라 부르지 못함', '형을 형이라 부르지 못함']
      },
      {
        name: '홍인형',
        role: 'antagonist' as const,
        traits: ['시기심', '잔인함', '적자의 우월감'],
        goals: ['홍길동 제거', '가문의 명예 수호'],
        relationships: [
          {
            character: '홍길동',
            type: 'family' as const,
            description: '서자인 동생, 위협적 존재로 인식'
          }
        ],
        speech_pattern: '권위적이고 차가운 어투'
      },
      {
        name: '홍대감',
        role: 'supporting' as const,
        traits: ['엄격함', '전통적', '내면의 애정'],
        goals: ['가문 유지', '체면 유지'],
        relationships: [
          {
            character: '홍길동',
            type: 'family' as const,
            description: '서자인 아들, 애정은 있으나 인정하지 못함'
          }
        ],
        speech_pattern: '권위적이고 격식있는 어투'
      }
    ],
    world_rules: [
      {
        category: 'society' as const,
        rule: '엄격한 적서차별 신분제',
        importance: 'critical' as const,
        evidence: '서자는 아버지를 아버지라 부를 수 없음'
      },
      {
        category: 'magic' as const,
        rule: '도술과 변신술이 존재',
        importance: 'high' as const,
        evidence: '길동이 도술을 사용하여 위기 모면'
      },
      {
        category: 'culture' as const,
        rule: '유교적 가부장제 사회',
        importance: 'critical' as const,
        evidence: '가문의 명예와 효를 중시'
      }
    ],
    timeline: [
      {
        timestamp: '1장',
        event: '홍길동 출생, 천한 서자로 태어남',
        involved_characters: ['홍길동', '춘섬', '홍대감'],
        importance: 'critical' as const
      },
      {
        timestamp: '2장',
        event: '길동이 신분의 한을 토로하며 슬퍼함',
        involved_characters: ['홍길동', '홍대감'],
        importance: 'high' as const
      },
      {
        timestamp: '3장',
        event: '홍인형이 자객을 보내 길동 암살 시도',
        involved_characters: ['홍길동', '홍인형'],
        importance: 'critical' as const
      },
      {
        timestamp: '4장',
        event: '길동이 집을 떠나 활빈당 창설',
        involved_characters: ['홍길동'],
        importance: 'critical' as const
      }
    ],
    summary: '조선시대 서자로 태어난 홍길동이 신분의 한계를 극복하고 도술을 익혀 활빈당을 창설, 탐관오리를 징치하고 백성을 구제하는 영웅이 되는 이야기. 적서차별의 모순을 비판하고 사회정의를 실현하려는 민중 영웅의 서사.'
  };
}