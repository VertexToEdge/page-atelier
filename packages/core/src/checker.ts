/**
 * Consistency Checker for story validation
 * Used by: Backend - /api/analyze endpoint for consistency validation
 * 
 * @tags consistency-check, validation, story-analysis
 */

import { z } from 'zod';
import type { ConsistencyCheck, Issue, SettingNote } from './types';
import type { LLMAdapter } from '@page-atelier/llm';

// Zod schemas for validation
const IssueSchema = z.object({
  type: z.enum(['continuity', 'character', 'world_rules']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string(),
  evidence: z.array(z.string()),
  suggested_fix: z.string().optional(),
  location: z.object({
    chapter: z.number().optional(),
    paragraph: z.number().optional(),
    line: z.string().optional()
  }).optional()
});

const ConsistencyCheckSchema = z.object({
  continuity: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(IssueSchema)
  }),
  character: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(IssueSchema)
  }),
  world_rules: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(IssueSchema)
  }),
  overall_score: z.number().min(0).max(100)
});

/**
 * Performs comprehensive consistency checks on story text
 * Used by: Backend - Core analysis pipeline for validation
 * 
 * @tags checker, story-validation, consistency-analysis
 */
export class ConsistencyChecker {
  private readonly weights = {
    continuity: 0.4,
    character: 0.35,
    world_rules: 0.25
  };

  constructor(private llmAdapter: LLMAdapter) {}

  /**
   * Runs complete consistency check on story text
   * Used by: Backend - Main analysis flow for consistency validation
   * 
   * @tags main-check, comprehensive-validation
   */
  async checkConsistency(
    text: string,
    settingNote: SettingNote
  ): Promise<ConsistencyCheck> {
    const systemPrompt = `당신은 웹소설 전문 검수 편집자입니다. 
주어진 설정노트를 기준으로 텍스트의 일관성을 검사합니다.
모든 문제점은 구체적인 증거와 함께 제시해야 합니다.`;

    const prompt = `다음 텍스트의 일관성을 검사하세요:

설정노트:
${JSON.stringify(settingNote, null, 2).substring(0, 3000)}

검사할 텍스트:
${text.substring(0, 5000)}

검사 항목:
1. 개연성 (Continuity) - 40% 가중치
   - 사건의 인과관계
   - 시간적 순서
   - 논리적 흐름
   - 복선과 회수

2. 캐릭터 일관성 (Character) - 35% 가중치
   - 성격 일관성
   - 행동 패턴
   - 말투 유지
   - 동기 일치

3. 세계관 규칙 (World Rules) - 25% 가중치
   - 설정된 규칙 준수
   - 마법/무공 체계 일관성
   - 사회 구조 유지

각 항목별로:
- 점수 (0-100)
- 발견된 문제들 (type, severity, description, evidence, suggested_fix)
- 전체 가중평균 점수

심각도 기준:
- critical: 스토리 붕괴 수준
- high: 독자가 즉시 알아차릴 수준
- medium: 주의깊은 독자가 알아차릴 수준
- low: 사소한 불일치`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      ConsistencyCheckSchema,
      systemPrompt
    );

    if (!response.success || !response.data) {
      // Return default check if LLM fails
      return this.getDefaultCheck();
    }

    // Ensure weighted score is calculated correctly
    return this.calculateWeightedScore(response.data);
  }

  /**
   * Checks continuity and plot consistency
   * Used by: Backend - Focused continuity analysis
   * 
   * @tags continuity-check, plot-validation
   */
  async checkContinuity(
    text: string,
    settingNote: SettingNote
  ): Promise<{ score: number; issues: Issue[] }> {
    const prompt = `텍스트의 개연성과 연속성을 검사하세요:
${text.substring(0, 3000)}

설정노트의 타임라인:
${JSON.stringify(settingNote.timeline, null, 2)}

사건의 인과관계, 시간순서, 논리적 흐름을 점검하고 문제점을 찾으세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      z.object({
        score: z.number(),
        issues: z.array(IssueSchema)
      }),
      '개연성 검사 전문가로서 작동합니다.'
    );

    return response.data || { score: 85, issues: [] };
  }

  /**
   * Checks character consistency
   * Used by: Backend - Character behavior validation
   * 
   * @tags character-check, behavior-validation
   */
  async checkCharacterConsistency(
    text: string,
    settingNote: SettingNote
  ): Promise<{ score: number; issues: Issue[] }> {
    const prompt = `캐릭터의 일관성을 검사하세요:
${text.substring(0, 3000)}

캐릭터 설정:
${JSON.stringify(settingNote.characters, null, 2).substring(0, 2000)}

각 캐릭터의 성격, 행동, 말투가 설정과 일치하는지 검증하세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      z.object({
        score: z.number(),
        issues: z.array(IssueSchema)
      }),
      '캐릭터 일관성 검사 전문가로서 작동합니다.'
    );

    return response.data || { score: 85, issues: [] };
  }

  /**
   * Checks world rules compliance
   * Used by: Backend - World-building consistency validation
   * 
   * @tags world-rules-check, setting-validation
   */
  async checkWorldRules(
    text: string,
    settingNote: SettingNote
  ): Promise<{ score: number; issues: Issue[] }> {
    const prompt = `세계관 규칙 준수를 검사하세요:
${text.substring(0, 3000)}

세계관 규칙:
${JSON.stringify(settingNote.world_rules, null, 2).substring(0, 2000)}

설정된 규칙들이 텍스트에서 일관되게 적용되는지 검증하세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      z.object({
        score: z.number(),
        issues: z.array(IssueSchema)
      }),
      '세계관 일관성 검사 전문가로서 작동합니다.'
    );

    return response.data || { score: 85, issues: [] };
  }

  /**
   * Calculates weighted overall score
   * Used by: Backend - Score aggregation
   * 
   * @tags scoring, weighted-average
   */
  private calculateWeightedScore(check: ConsistencyCheck): ConsistencyCheck {
    const weightedScore = 
      check.continuity.score * this.weights.continuity +
      check.character.score * this.weights.character +
      check.world_rules.score * this.weights.world_rules;

    return {
      ...check,
      overall_score: Math.round(weightedScore)
    };
  }

  /**
   * Returns default check for fallback scenarios
   * Used by: Backend - Fallback when LLM fails
   * 
   * @tags fallback, default-values
   */
  private getDefaultCheck(): ConsistencyCheck {
    return {
      continuity: {
        score: 75,
        issues: []
      },
      character: {
        score: 75,
        issues: []
      },
      world_rules: {
        score: 75,
        issues: []
      },
      overall_score: 75
    };
  }

  /**
   * Filters issues by severity
   * Used by: Backend - Issue prioritization
   * 
   * @tags issue-filter, severity-sorting
   */
  filterIssuesBySeverity(
    issues: Issue[],
    minSeverity: 'critical' | 'high' | 'medium' | 'low'
  ): Issue[] {
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    const minIndex = severityOrder.indexOf(minSeverity);
    
    return issues.filter(issue => {
      const issueIndex = severityOrder.indexOf(issue.severity);
      return issueIndex <= minIndex;
    });
  }
}

export default ConsistencyChecker;