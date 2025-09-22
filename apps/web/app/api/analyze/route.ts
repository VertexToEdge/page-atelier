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
    const settingNote = options?.skip_setting_note 
      ? await getDefaultSettingNote(text)
      : await settingBuilder.generateSettingNote(text);
    llmCallsCount++;

    // Step 2: Check consistency
    console.log('[API] Step 2: Checking consistency...');
    const consistencyCheck = await consistencyChecker.checkConsistency(
      text,
      settingNote
    );
    llmCallsCount++;

    // Step 3: Evaluate personas
    console.log('[API] Step 3: Evaluating personas...');
    const personaEvaluations = options?.skip_personas
      ? []
      : await personaEvaluator.evaluateAllPersonas(text, settingNote);
    llmCallsCount += options?.skip_personas ? 0 : 3;

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
    genre: ['무협', '고전'],
    characters: [
      {
        name: '홍길동',
        role: 'protagonist' as const,
        traits: ['정의로움', '효심', '무예'],
        goals: ['신분 극복', '정의 실현'],
        relationships: [],
        speech_pattern: '정중한 어투'
      }
    ],
    world_rules: [
      {
        category: 'society' as const,
        rule: '엄격한 신분제 사회',
        importance: 'critical' as const,
        evidence: '서자 차별'
      }
    ],
    timeline: [
      {
        timestamp: '1장',
        event: '홍길동 출생과 성장',
        involved_characters: ['홍길동'],
        importance: 'critical' as const
      }
    ],
    summary: text.substring(0, 200)
  };
}