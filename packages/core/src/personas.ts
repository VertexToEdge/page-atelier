/**
 * Persona Evaluator for reader perspective analysis
 * Used by: Backend - /api/analyze endpoint for multi-perspective evaluation
 * 
 * @tags persona-evaluation, reader-perspective, multi-viewpoint
 */

import { z } from 'zod';
import type { PersonaResult, SettingNote } from './types';
import type { LLMAdapter } from '@page-atelier/llm';

// Zod schema for validation
const PersonaMetricsSchema = z.object({
  satisfaction: z.number().min(0).max(100),
  engagement: z.number().min(0).max(100),
  frustration: z.number().min(0).max(100)
});

const PersonaResultSchema = z.object({
  persona_type: z.enum(['setting_obsessed', 'romance_sub_focused', 'traditional_martial_arts_fan']),
  persona_name: z.string(),
  persona_description: z.string(),
  metrics: PersonaMetricsSchema,
  likes: z.array(z.string()),
  dislikes: z.array(z.string()),
  suggestions: z.array(z.string()),
  overall_reaction: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']),
  sample_comment: z.string().optional()
});

/**
 * Evaluates story from different reader personas' perspectives
 * Used by: Backend - Core analysis pipeline for reader satisfaction prediction
 * 
 * @tags persona-manager, reader-analysis, satisfaction-prediction
 */
export class PersonaEvaluator {
  private personas = {
    setting_obsessed: {
      name: '설정 과몰입형 독자',
      description: '세계관 설정과 파워 시스템의 논리성을 중시하는 독자. 설정 구멍에 민감하고 체계적인 세계관을 선호함.',
      focus: ['세계관 규칙', '파워 시스템', '설정 일관성', '논리적 개연성']
    },
    romance_sub_focused: {
      name: '로판 서브주총러',
      description: '로맨스와 감정선, 캐릭터 관계를 중시하는 독자. 주인공과 서브 캐릭터의 감정 묘사와 관계 발전을 중요시함.',
      focus: ['감정 묘사', '관계 발전', '캐릭터 매력', '로맨스 전개']
    },
    traditional_martial_arts_fan: {
      name: '정통무협팬',
      description: '전통적인 무협 요소와 협객 정신을 중시하는 독자. 무공 수련, 강호 세계, 의리와 복수극을 선호함.',
      focus: ['무공 체계', '협객 정신', '강호 설정', '전통 무협 요소']
    }
  };

  constructor(private llmAdapter: LLMAdapter) {}

  /**
   * Evaluates story from all persona perspectives
   * Used by: Backend - Main analysis flow for comprehensive reader feedback
   * 
   * @tags all-personas, comprehensive-evaluation
   */
  async evaluateAllPersonas(
    text: string,
    settingNote: SettingNote
  ): Promise<PersonaResult[]> {
    const evaluations = await Promise.all([
      this.evaluateAsSettingObsessed(text, settingNote),
      this.evaluateAsRomanceSubFocused(text, settingNote),
      this.evaluateAsTraditionalMartialArtsFan(text, settingNote)
    ]);

    return evaluations;
  }

  /**
   * Evaluates from setting-obsessed reader perspective
   * Used by: Backend - Setting and world-building focused evaluation
   * 
   * @tags setting-obsessed, world-building-evaluation
   */
  async evaluateAsSettingObsessed(
    text: string,
    settingNote: SettingNote
  ): Promise<PersonaResult> {
    const persona = this.personas.setting_obsessed;
    const systemPrompt = `당신은 ${persona.name}입니다. ${persona.description}
작품을 읽고 설정의 논리성과 일관성 관점에서 평가합니다.`;

    const prompt = this.buildEvaluationPrompt(
      text,
      settingNote,
      persona.focus,
      `특히 다음을 중점적으로 평가하세요:
- 세계관 설정이 논리적이고 체계적인가?
- 파워 시스템이 일관되고 균형잡혀 있는가?
- 설정 구멍이나 모순은 없는가?
- 설정이 스토리와 유기적으로 연결되는가?`
    );

    const response = await this.llmAdapter.generateJSON(
      prompt,
      PersonaResultSchema,
      systemPrompt
    );

    return response.data || this.getDefaultPersonaResult('setting_obsessed');
  }

  /**
   * Evaluates from romance-sub-focused reader perspective
   * Used by: Backend - Romance and character relationship evaluation
   * 
   * @tags romance-focused, relationship-evaluation
   */
  async evaluateAsRomanceSubFocused(
    text: string,
    settingNote: SettingNote
  ): Promise<PersonaResult> {
    const persona = this.personas.romance_sub_focused;
    const systemPrompt = `당신은 ${persona.name}입니다. ${persona.description}
작품의 감정선과 캐릭터 관계를 중심으로 평가합니다.`;

    const prompt = this.buildEvaluationPrompt(
      text,
      settingNote,
      persona.focus,
      `특히 다음을 중점적으로 평가하세요:
- 캐릭터들의 감정이 세밀하게 묘사되는가?
- 관계 발전이 자연스럽고 설득력 있는가?
- 주인공과 서브 캐릭터가 매력적인가?
- 로맨스나 감정선이 흥미진진한가?`
    );

    const response = await this.llmAdapter.generateJSON(
      prompt,
      PersonaResultSchema,
      systemPrompt
    );

    return response.data || this.getDefaultPersonaResult('romance_sub_focused');
  }

  /**
   * Evaluates from traditional martial arts fan perspective
   * Used by: Backend - Martial arts and traditional elements evaluation
   * 
   * @tags martial-arts, traditional-evaluation
   */
  async evaluateAsTraditionalMartialArtsFan(
    text: string,
    settingNote: SettingNote
  ): Promise<PersonaResult> {
    const persona = this.personas.traditional_martial_arts_fan;
    const systemPrompt = `당신은 ${persona.name}입니다. ${persona.description}
전통 무협의 관점에서 작품을 평가합니다.`;

    const prompt = this.buildEvaluationPrompt(
      text,
      settingNote,
      persona.focus,
      `특히 다음을 중점적으로 평가하세요:
- 무공 체계가 전통적이고 체계적인가?
- 협객 정신과 의리가 잘 표현되는가?
- 강호 세계관이 생생하게 그려지는가?
- 전통 무협의 정취가 느껴지는가?`
    );

    const response = await this.llmAdapter.generateJSON(
      prompt,
      PersonaResultSchema,
      systemPrompt
    );

    return response.data || this.getDefaultPersonaResult('traditional_martial_arts_fan');
  }

  /**
   * Builds evaluation prompt for persona
   * Used by: Backend - Prompt generation for persona evaluation
   * 
   * @tags prompt-builder, evaluation-prompt
   */
  private buildEvaluationPrompt(
    text: string,
    settingNote: SettingNote,
    focusAreas: string[],
    specificInstructions: string
  ): string {
    return `다음 웹소설을 평가하세요:

텍스트:
${text.substring(0, 4000)}

설정노트:
${JSON.stringify(settingNote, null, 2).substring(0, 2000)}

평가 초점:
${focusAreas.join(', ')}

${specificInstructions}

평가 결과:
1. 메트릭 (각 0-100점)
   - satisfaction: 전반적 만족도
   - engagement: 몰입도
   - frustration: 불만족도/짜증도

2. likes: 마음에 든 점 3-5개
3. dislikes: 마음에 안 든 점 3-5개
4. suggestions: 개선 제안 3-5개
5. overall_reaction: 전반적 반응 (very_positive/positive/neutral/negative/very_negative)
6. sample_comment: 이 독자가 남길만한 댓글 예시 (선택사항)`;
  }

  /**
   * Returns default persona result for fallback
   * Used by: Backend - Fallback when LLM fails
   * 
   * @tags fallback, default-persona
   */
  private getDefaultPersonaResult(
    personaType: 'setting_obsessed' | 'romance_sub_focused' | 'traditional_martial_arts_fan'
  ): PersonaResult {
    const persona = this.personas[personaType];
    return {
      persona_type: personaType,
      persona_name: persona.name,
      persona_description: persona.description,
      metrics: {
        satisfaction: 70,
        engagement: 70,
        frustration: 30
      },
      likes: ['기본적인 스토리 구성', '읽기 편한 문체'],
      dislikes: ['깊이 있는 분석 필요'],
      suggestions: ['더 자세한 묘사 추가', '캐릭터 개발 필요'],
      overall_reaction: 'neutral',
      sample_comment: '더 읽어봐야 알 것 같습니다.'
    };
  }

  /**
   * Calculates average metrics across all personas
   * Used by: Backend - Aggregate metrics calculation
   * 
   * @tags metrics-average, aggregate-calculation
   */
  calculateAverageMetrics(personas: PersonaResult[]): {
    avgSatisfaction: number;
    avgEngagement: number;
    avgFrustration: number;
  } {
    const total = personas.reduce(
      (acc, p) => ({
        satisfaction: acc.satisfaction + p.metrics.satisfaction,
        engagement: acc.engagement + p.metrics.engagement,
        frustration: acc.frustration + p.metrics.frustration
      }),
      { satisfaction: 0, engagement: 0, frustration: 0 }
    );

    const count = personas.length;
    return {
      avgSatisfaction: Math.round(total.satisfaction / count),
      avgEngagement: Math.round(total.engagement / count),
      avgFrustration: Math.round(total.frustration / count)
    };
  }
}

export default PersonaEvaluator;