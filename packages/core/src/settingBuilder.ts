/**
 * Setting Note Builder for extracting story world settings
 * Used by: Backend - /api/analyze endpoint for initial story analysis
 * 
 * @tags llm, setting-extraction, character-analysis, world-building
 */

import { z } from 'zod';
import type { SettingNote, Character, WorldRule, TimelineEvent } from './types';
import type { LLMAdapter } from '@page-atelier/llm';

// Zod schemas for validation
const CharacterSchema = z.object({
  name: z.string(),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']),
  traits: z.array(z.string()),
  goals: z.array(z.string()),
  relationships: z.array(z.object({
    character: z.string(),
    type: z.enum(['family', 'friend', 'enemy', 'love', 'mentor', 'rival', 'other']),
    description: z.string()
  })),
  speech_pattern: z.string().optional(),
  taboo_actions: z.array(z.string()).optional()
});

const WorldRuleSchema = z.object({
  category: z.enum(['magic', 'society', 'technology', 'culture', 'physics', 'other']),
  rule: z.string(),
  importance: z.enum(['critical', 'high', 'medium', 'low']),
  evidence: z.string().optional()
});

const TimelineEventSchema = z.object({
  timestamp: z.string(),
  event: z.string(),
  involved_characters: z.array(z.string()),
  importance: z.enum(['critical', 'high', 'medium', 'low'])
});

const SettingNoteSchema = z.object({
  title: z.string(),
  genre: z.array(z.string()),
  characters: z.array(CharacterSchema),
  world_rules: z.array(WorldRuleSchema),
  timeline: z.array(TimelineEventSchema),
  summary: z.string()
});

/**
 * Builds comprehensive setting notes from story text
 * Used by: Backend - Core analysis pipeline for world-building extraction
 * 
 * @tags setting-builder, story-analysis, world-extraction
 */
export class SettingBuilder {
  constructor(private llmAdapter: LLMAdapter) {}

  /**
   * Generates complete setting note from story text
   * Used by: Backend - Main analysis flow for initial processing
   * 
   * @tags main-generation, setting-note, comprehensive-analysis
   */
  async generateSettingNote(text: string): Promise<SettingNote> {
    const systemPrompt = `당신은 웹소설 전문 편집자입니다. 주어진 텍스트를 분석하여 작품의 설정노트를 추출합니다.
설정노트는 캐릭터, 세계관 규칙, 타임라인 등 작품의 핵심 설정을 체계적으로 정리한 문서입니다.`;

    const prompt = `다음 웹소설 텍스트를 분석하여 설정노트를 생성하세요:

텍스트:
${text}

요구사항:
1. 캐릭터 분석:
   - 이름과 역할 (주인공/적대자/조연/단역)
   - 성격 특징 3-5개
   - 목표와 동기
   - 다른 캐릭터와의 관계
   - 말투 특징 (있다면)
   - 절대 하지 않는 행동 (있다면)

2. 세계관 규칙:
   - 마법/무공 체계
   - 사회 구조와 계급
   - 기술 수준
   - 문화적 특징
   - 물리 법칙의 특이점

3. 타임라인:
   - 주요 사건들을 시간순으로 정리
   - 각 사건에 연관된 캐릭터

4. 작품 요약:
   - 200자 이내로 전체 줄거리 요약

JSON 형식으로 응답하세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      SettingNoteSchema,
      systemPrompt
    );

    if (!response.success || !response.data) {
      throw new Error(`Failed to generate setting note: ${response.error}`);
    }

    // Post-process and enhance the setting note
    return this.enhanceSettingNote(response.data);
  }

  /**
   * Enhances and validates setting note data
   * Used by: Backend - Post-processing for data quality
   * 
   * @tags enhancement, validation, post-processing
   */
  private enhanceSettingNote(settingNote: SettingNote): SettingNote {
    // Ensure all characters have relationships defined
    const characterNames = new Set(settingNote.characters.map(c => c.name));
    
    settingNote.characters = settingNote.characters.map(character => {
      // Validate relationships reference existing characters
      character.relationships = character.relationships.filter(rel => 
        characterNames.has(rel.character)
      );

      // Add default speech pattern if protagonist lacks one
      if (character.role === 'protagonist' && !character.speech_pattern) {
        character.speech_pattern = '표준어 사용, 정중한 어투';
      }

      return character;
    });

    // Sort timeline events chronologically
    settingNote.timeline.sort((a, b) => {
      // Simple ordering based on chapter mentions or sequence
      return a.timestamp.localeCompare(b.timestamp);
    });

    // Ensure critical world rules have evidence
    settingNote.world_rules = settingNote.world_rules.map(rule => {
      if (rule.importance === 'critical' && !rule.evidence) {
        rule.evidence = '텍스트 전반에 걸쳐 암시됨';
      }
      return rule;
    });

    return settingNote;
  }

  /**
   * Extracts character profiles from text
   * Used by: Backend - Focused character analysis
   * 
   * @tags character-extraction, profile-analysis
   */
  async extractCharacters(text: string): Promise<Character[]> {
    const prompt = `텍스트에서 등장인물들을 추출하고 각 인물의 프로필을 작성하세요:
${text}

각 캐릭터별로 이름, 역할, 성격, 목표, 관계를 상세히 분석하세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      z.array(CharacterSchema),
      '캐릭터 분석 전문가로서 작동합니다.'
    );

    return response.data || [];
  }

  /**
   * Extracts world-building rules from text
   * Used by: Backend - World rules and system extraction
   * 
   * @tags world-rules, system-extraction
   */
  async extractWorldRules(text: string): Promise<WorldRule[]> {
    const prompt = `텍스트에서 세계관 규칙과 설정을 추출하세요:
${text}

마법체계, 사회구조, 기술수준, 문화적 특징 등을 찾아 정리하세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      z.array(WorldRuleSchema),
      '세계관 설정 분석가로서 작동합니다.'
    );

    return response.data || [];
  }

  /**
   * Extracts timeline of events from text
   * Used by: Backend - Chronological event extraction
   * 
   * @tags timeline, event-extraction, chronology
   */
  async extractTimeline(text: string): Promise<TimelineEvent[]> {
    const prompt = `텍스트에서 주요 사건들을 시간순으로 추출하세요:
${text}

각 사건의 시점, 내용, 관련 인물, 중요도를 파악하세요.`;

    const response = await this.llmAdapter.generateJSON(
      prompt,
      z.array(TimelineEventSchema),
      '스토리 타임라인 분석가로서 작동합니다.'
    );

    return response.data || [];
  }
}

export default SettingBuilder;