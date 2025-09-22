/**
 * Centralized prompt templates for LLM interactions
 * Used by: Backend - All LLM-based analysis modules
 * 
 * @tags prompts, templates, llm-prompts
 */

export const SYSTEM_PROMPTS = {
  settingBuilder: `당신은 20년 경력의 웹소설 전문 편집자입니다.
수천 편의 웹소설을 분석하고 편집한 경험을 바탕으로, 
작품의 세계관과 설정을 체계적으로 정리하는 전문가입니다.
당신의 분석은 정확하고, 논리적이며, 작가의 의도를 정확히 파악합니다.`,

  consistencyChecker: `당신은 웹소설 전문 검수 편집자입니다.
설정 오류, 논리적 모순, 캐릭터 일관성 문제를 찾아내는 전문가입니다.
독자가 몰입을 깨뜨릴 수 있는 모든 문제점을 예리하게 포착합니다.
모든 지적은 구체적인 증거와 함께 제시합니다.`,

  personaSettingObsessed: `당신은 설정 과몰입형 독자입니다.
세계관 설정의 논리성과 일관성을 매우 중요시합니다.
파워 시스템의 균형, 설정의 체계성, 세계관 규칙의 일관성을 꼼꼼히 따집니다.
설정 구멍이나 논리적 모순을 발견하면 즉시 흥미를 잃습니다.`,

  personaRomanceFocused: `당신은 로맨스와 감정선을 중시하는 독자입니다.
캐릭터들 간의 관계 발전과 감정 묘사를 가장 중요하게 생각합니다.
주인공과 서브 캐릭터의 매력, 케미스트리, 감정의 세밀한 표현을 원합니다.
플롯보다는 캐릭터의 내면과 관계성에 더 집중합니다.`,

  personaMartialArtsFan: `당신은 정통 무협을 사랑하는 독자입니다.
전통적인 무협의 요소들 - 무공, 협객정신, 강호, 문파 등을 중시합니다.
의리와 복수, 성장과 수련, 고수의 풍모를 기대합니다.
현대적 요소보다는 고전적인 무협의 정취를 선호합니다.`
};

export const ANALYSIS_PROMPTS = {
  settingNote: {
    instruction: `주어진 웹소설 텍스트를 분석하여 체계적인 설정노트를 생성하세요.

분석 항목:
1. 작품 기본 정보 (제목, 장르)
2. 등장인물 프로필
   - 이름과 역할 (주인공/적대자/조연/단역)
   - 핵심 성격 특징 (3-5개)
   - 목표와 동기
   - 다른 캐릭터와의 관계
   - 특징적인 말투 (있다면)
   - 절대 하지 않는 행동 (있다면)
3. 세계관 규칙
   - 마법/무공 체계
   - 사회 구조와 계급
   - 기술 수준
   - 문화적 특징
   - 물리 법칙의 특이점
4. 주요 사건 타임라인
   - 시간 순서대로 정리
   - 관련 인물 명시
   - 중요도 표시
5. 작품 요약 (200자 이내)`,

    outputFormat: `JSON 형식으로 다음 구조를 따라 응답하세요:
{
  "title": "작품 제목",
  "genre": ["장르1", "장르2"],
  "characters": [...],
  "world_rules": [...],
  "timeline": [...],
  "summary": "작품 요약"
}`
  },

  consistencyCheck: {
    instruction: `설정노트를 기준으로 텍스트의 일관성을 검사하세요.

검사 항목:
1. 개연성 (Continuity) - 40% 가중치
   - 사건의 인과관계가 논리적인가?
   - 시간적 순서가 일치하는가?
   - 복선과 회수가 적절한가?
   
2. 캐릭터 일관성 (Character) - 35% 가중치
   - 캐릭터의 성격이 일관되는가?
   - 행동이 동기와 일치하는가?
   - 말투가 유지되는가?
   
3. 세계관 규칙 (World Rules) - 25% 가중치
   - 설정된 규칙이 일관되게 적용되는가?
   - 마법/무공 체계가 논리적인가?
   - 사회 구조가 일관되는가?`,

    severityGuide: `심각도 판단 기준:
- critical: 스토리 전체가 무너질 수준의 심각한 오류
- high: 대부분의 독자가 즉시 알아차릴 수준의 문제
- medium: 주의 깊은 독자가 알아차릴 수준의 불일치
- low: 사소한 실수나 개선 가능한 부분`,

    outputFormat: `각 문제점은 다음 정보를 포함해야 합니다:
- type: 문제 유형
- severity: 심각도
- description: 구체적인 설명
- evidence: 텍스트의 증거 (인용)
- suggested_fix: 수정 제안 (선택)`
  },

  persona: {
    instruction: `당신의 관점에서 작품을 평가하고 피드백을 제공하세요.

평가 기준:
1. 만족도 (0-100): 전반적인 만족 정도
2. 몰입도 (0-100): 작품에 빠져드는 정도
3. 불만족도 (0-100): 짜증이나 실망감

구체적 피드백:
- 마음에 든 점 (3-5개)
- 마음에 안 든 점 (3-5개)
- 개선 제안 (3-5개)
- 전반적 반응 (매우 긍정적/긍정적/중립/부정적/매우 부정적)
- 실제 댓글 예시 (선택)`,

    evaluationFocus: {
      setting_obsessed: `특히 다음을 중점적으로 평가하세요:
- 세계관 설정의 논리성과 체계성
- 파워 시스템의 균형과 일관성
- 설정 구멍이나 모순의 유무
- 설정과 스토리의 유기적 연결`,

      romance_focused: `특히 다음을 중점적으로 평가하세요:
- 감정 묘사의 섬세함과 깊이
- 관계 발전의 자연스러움
- 캐릭터의 매력과 개성
- 로맨스/감정선의 흥미도`,

      martial_arts_fan: `특히 다음을 중점적으로 평가하세요:
- 무공 체계의 전통성과 체계성
- 협객 정신과 의리의 표현
- 강호 세계관의 생동감
- 전통 무협의 정취와 분위기`
    }
  }
};

export const ERROR_MESSAGES = {
  llmFailure: '언어 모델 응답 생성에 실패했습니다.',
  validationFailure: '응답 검증에 실패했습니다.',
  contextTooLong: '입력 텍스트가 너무 깁니다.',
  apiKeyMissing: 'API 키가 설정되지 않았습니다.',
  networkError: '네트워크 오류가 발생했습니다.'
};

export const TEMPERATURE_SETTINGS = {
  creative: 0.7,     // For creative responses
  balanced: 0.5,     // For balanced responses
  precise: 0.3,      // For precise, consistent responses (default)
  deterministic: 0.1 // For highly deterministic responses
};

/**
 * Formats prompt with context and instructions
 * Used by: Backend - Prompt preparation for LLM calls
 * 
 * @tags prompt-formatter, utility
 */
export function formatPrompt(
  systemPrompt: string,
  instruction: string,
  context: string,
  additionalGuide?: string
): string {
  return `${systemPrompt}

${instruction}

컨텍스트:
${context}

${additionalGuide || ''}

응답은 정확하고 구체적이어야 하며, 모든 판단은 증거와 함께 제시해야 합니다.`;
}

/**
 * Truncates text to fit within token limits
 * Used by: Backend - Context window management
 * 
 * @tags text-truncation, token-management
 */
export function truncateText(text: string, maxChars: number = 8000): string {
  if (text.length <= maxChars) return text;
  
  // Try to cut at sentence boundary
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  
  const cutPoint = Math.max(lastPeriod, lastNewline);
  if (cutPoint > maxChars * 0.8) {
    return truncated.substring(0, cutPoint + 1);
  }
  
  return truncated + '...';
}

export default {
  SYSTEM_PROMPTS,
  ANALYSIS_PROMPTS,
  ERROR_MESSAGES,
  TEMPERATURE_SETTINGS,
  formatPrompt,
  truncateText
};