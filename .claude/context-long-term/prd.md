# 페이지 아틀리에 (Page Atelier)

LLM 기반 웹소설 작가를 위한 **사전 피드백·검수 도구** — 프로덕션의 테스트 파이프라인처럼, 연재 전 챕터를 자동 점검(E2E)하고, 가상 독자에게서 정량·정성 피드백을 받습니다.

---

## 1. 배경 & 문제 정의

장기 연재는 설정 누수, 캐릭터 붕괴, 세계관 충돌, 독자 피로도 등 **품질 리스크**가 누적되기 쉽습니다. 작가는 마감과 병행해 스스로 점검하기 어려우며, 베타리더 확보에도 비용·시간이 듭니다.

**페이지 아틀리에**는 LLM을 이용해 (1) 기존 연재분으로부터 **설정노트**를 자동 구축하고, (2) 신규 연재분에 대해 **개연성/설정/캐릭터**를 점검하며, (3) **가상 독자 페르소나**의 평가를 생성하여 **점수/코멘트**를 표준 JSON으로 제공합니다.

> 데모 제약: 퍼블릭 라이선스 **홍길동전**만 사용, 지식그래프·RAG 비사용(프롬프트만), 원문 데이터는 **코드에 하드코딩**, 2시간 내 구현 가능한 범위.

---

## 2. 목표 (2시간 MVP)

**Must-have**

1. **설정노트 자동 생성**: 인물/관계/세계규칙/타임라인 골자 추출
2. **신규 연재분 자동 점검**: 개연성, 설정오류, 캐릭터 붕괴 감지 + 중요 이슈 하이라이트
3. **가상 독자 3종 페르소나 평가**: 각자 관점 코멘트 + 만족도/피로도/몰입도 점수
4. **표준 JSON 출력**: 화면/다운로드 모두 가능, 스키마 준수 검증
5. **단일 화면 UI**: 좌측 입력(신규 분), 우측 결과(설정/검수/페르소나 탭)

**Nice-to-have** (시간 여유 시)

- 이슈 위치 표시(문장/문단 인덱스)
- 개선 제안 리라이팅(문체 유지)

**Out-of-scope (데모)**

- 실제 독자 데이터 기반 학습/분석, RAG/지식 그래프, 다국어 지원, 협업 멀티유저

---

## 3. 사용자 & JTBD

- **사용자**: 웹소설 작가(개인), 편집자(품질 1차 검수)
- **JTBD**: "연재 직전 챕터의 **위험 신호**를 빠르게 찾고, 타깃 독자의 **반응을 시뮬레이션**해 수정 우선순위를 정하고 싶다"

---

## 4. 핵심 유저 플로우 (홍길동전 데모)

1. 작품 선택: 기본값 **홍길동전** (코드 내 하드코딩)
2. \[생성] 설정·등장인물 분석(기연재 텍스트 → 설정노트)
3. 신규 연재분 텍스트 입력
4. \[검사] 설정노트를 기준으로 **개연성/설정/캐릭터** 점검
5. \[생성] 가상 독자 **페르소나** 3종(설정 과몰입/로판 서브주총러/정통무협팬)
6. \[평가] 페르소나별 코멘트/점수(JSON 스키마)
7. \[리포트] 종합 점수 + 수정 액션 아이템

---

## 5. 기능 요구사항

### 5.1 설정노트 자동 생성 (Setting Builder)

- 입력: 작품 전체 텍스트(홍길동전)
- 출력(요약):

  - **Characters**: 이름, 별칭, 성향, 핵심가치, 금기, 말투·행동 패턴
  - **Relations**: 주체-대상-관계유형(친족/권력/적대/은혜)
  - **World Rules**: 사회/법/신분, 초월 능력/제약, 문화 규범
  - **Timeline**: 주요 사건 시퀀스(상태 변화 중심)

- 제약: 1화면 요약(LLM 콘텍스트 내), JSON 스키마 생산

### 5.2 신규 연재분 자동 점검 (Consistency Check)

- 카테고리: **개연성(논리/인과)**, **설정오류(세계관/규칙 위반)**, **캐릭터 붕괴(성향/금기 위반)**
- 각 카테고리별 점수(0\~1)와 **이슈 항목 리스트**(유형, 증거문장, 위반 규칙, 영향도)
- 중요 이슈는 UI에서 강조

### 5.3 가상 독자 페르소나 평가 (Persona Review Synth)

- 기본 제공 페르소나(데모 프리셋):

  1. **설정 과몰입형**: 세계관 정합성, 떡밥 회수에 예민
  2. **로판 서브주총러**: 관계구도/감정선, 서브 남주 매력에 반응
  3. **정통무협팬**: 무공/의협/명분, 호쾌한 전개 선호

- 각 페르소나별로 **만족도/몰입도/피로도** 점수 및 요약 코멘트 제공

### 5.4 리포트 & 액션

- 종합점수(가중합) + **권장 수정 액션 3개** 자동 생성
- JSON 다운로드(.json) 및 클립보드 복사

---

## 6. 비기능 요구사항

- **속도**: 단일 분석 트리거 기준 10\~25초 내(모델 응답 의존)
- **재현성**: 프롬프트 고정, seed/temperature 낮춤
- **프라이버시**: 입력 텍스트를 외부 저장하지 않음
- **국문 우선**: 출력/코멘트 한국어

---

## 7. 데이터 모델 & JSON 스키마

### 7.1 설정노트 스키마 (요약)

```json
{
  "characters": [
    {
      "id": "hong_gidong",
      "name": "홍길동",
      "traits": ["의협", "불의에 저항"],
      "taboos": ["약자 학대"],
      "speech_style": "정중하나 단호"
    }
  ],
  "relations": [
    {
      "from": "hong_gidong",
      "to": "아버지",
      "type": "혈연/서자",
      "tension": "신분제 갈등"
    }
  ],
  "world_rules": [
    { "rule": "신분제 사회에서 서자는 제약을 받는다" },
    { "rule": "도적질은 부정의로 간주" }
  ],
  "timeline": [
    { "id": "t1", "event": "출생과 서자로서의 한", "impact": "명분 축적" }
  ]
}
```

### 7.2 분석 결과 스키마 (요약)

```json
{
  "chapter_id": "2025-09-22-draft-01",
  "consistency_checks": {
    "continuity": {
      "score": 0.6,
      "issues": [
        {
          "type": "contradiction",
          "span": { "start": 120, "end": 180 },
          "quote": "…비범한 능력으로 방탕…",
          "violated_rule": "홍길동의 금기: 약자 학대/방탕 회피",
          "impact": "high",
          "suggestion": "능력 사용 동기에 의협/정의 명분을 부여"
        }
      ]
    },
    "character": { "score": 0.4, "issues": [] },
    "world_rules": { "score": 0.8, "issues": [] }
  },
  "personas": [
    {
      "id": "immersion_setting_geek",
      "name": "설정 과몰입",
      "fit": 0.3,
      "satisfaction": 0.2,
      "immersion": 0.3,
      "fatigue": 0.6,
      "comment": "주인공의 가치와 상충하는 행태로 개연성이 약합니다."
    },
    {
      "id": "romance_sub",
      "name": "로판 서브주총러",
      "fit": 0.5,
      "satisfaction": 0.6,
      "immersion": 0.5,
      "fatigue": 0.4,
      "comment": "관계 갈등 동기 보강 시 감정선이 설득력 있어질 듯."
    },
    {
      "id": "classic_martial",
      "name": "정통무협팬",
      "fit": 0.4,
      "satisfaction": 0.5,
      "immersion": 0.4,
      "fatigue": 0.5,
      "comment": "의협·명분이 흐릿합니다. 사건의 의(義) 정당성 보강 필요."
    }
  ],
  "overall": {
    "score": 0.47,
    "verdict": "REVISE",
    "reasons": ["캐릭터 금기 위반 가능성", "명분/동기 약함"],
    "actions": [
      "홍길동의 행동 동기를 약자 구제 혹은 불의 처단으로 재정렬",
      "방탕 묘사 축소 또는 강제적 상황 제시(함정/위장)",
      "사건 전후 결과가 의로 귀결됨을 명확히 표현"
    ]
  }
}
```

### 7.3 검증을 위한 JSON Schema (개요)

- `consistency_checks.continuity|character|world_rules.score`: number \[0,1]
- `issues[].type`: enum(`contradiction`, `omission`, `tone_shift`, `rule_violation`)
- `personas[].{fit,satisfaction,immersion,fatigue}`: number \[0,1]
- `overall.verdict`: enum(`PASS`, `REVISE`, `BLOCK`)

---

## 8. 프롬프트 설계 (템플릿)

### 8.1 시스템 지침 (공통)

- 역할: "웹소설 편집자 + 품질 엔지니어"
- 금칙: 스포일러 유발 금지(신규분 밖 스토리 예측/누설 X)
- 출력: **반드시 JSON** (스키마 준수), 불확실 시 `issues[].confidence` 낮게 표기

### 8.2 설정노트 생성 프롬프트

```
[ROLE] 너는 장르소설 편집자다. 아래 전체 텍스트를 분석하여 캐릭터/관계/세계규칙/타임라인을 JSON으로 요약하라.
[CONSTRAINTS] 간결·정합성, 원문 재서술 금지, 추측 최소화.
[OUTPUT_SCHEMA] {characters[], relations[], world_rules[], timeline[]}
[TEXT] <<홍길동전 원문 전체>>
```

### 8.3 신규분 점검 프롬프트

```
[ROLE] 너는 품질 엔지니어다. 설정노트와 신규분을 비교해 개연성/설정/캐릭터를 점검하라.
[INPUT_A] 설정노트(JSON)
[INPUT_B] 신규분(plain)
[OUTPUT_SCHEMA] {consistency_checks{continuity,character,world_rules}}
[GUIDE] 위반 규칙, 증거 문장, 영향도(high/med/low), 제안 포함. 점수는 0~1.
```

### 8.4 페르소나 평가 프롬프트

```
[ROLE] 너는 특정 독자 페르소나다. 아래 프로파일에 부합하는 관점으로 신규분을 평가하라.
[PERSONA] 이름/선호/트리거/지루 포인트
[INPUTS] 설정노트(JSON) + 신규분(plain)
[OUTPUT_SCHEMA] {fit, satisfaction, immersion, fatigue, comment}
```

### 8.5 종합 리포트 프롬프트

```
[ROLE] 총괄 편집자. 모든 결과를 통합해 overall.score(가중합), verdict, actions 3가지를 산출하라.
[WEIGHTS] continuity 0.4, character 0.35, world_rules 0.25; 페르소나 fit 평균을 ±0.05로 보정.
```

---

## 9. API 설계 (MVP)

### 9.1 엔드포인트

- `POST /api/analyze`

  - Body: `{ newChapter: string }`
  - Steps: (1) 설정노트 캐시 로드(홍길동전), (2) 점검, (3) 페르소나 3종, (4) 종합 리포트
  - Response: **7.2 스키마** JSON

- `GET /api/personas`

  - Response: 페르소나 프리셋 목록(JSON)

### 9.2 타입 정의 (TypeScript 발췌)

```ts
export type Issue = {
  type: "contradiction" | "omission" | "tone_shift" | "rule_violation";
  span?: { start: number; end: number };
  quote?: string;
  violated_rule?: string;
  impact: "low" | "med" | "high";
  suggestion?: string;
  confidence?: number;
};
export type Check = { score: number; issues: Issue[] };
export type PersonaResult = {
  id: string;
  name: string;
  fit: number;
  satisfaction: number;
  immersion: number;
  fatigue: number;
  comment: string;
};
export type Analysis = {
  chapter_id: string;
  consistency_checks: {
    continuity: Check;
    character: Check;
    world_rules: Check;
  };
  personas: PersonaResult[];
  overall: {
    score: number;
    verdict: "PASS" | "REVISE" | "BLOCK";
    reasons: string[];
    actions: string[];
  };
};
```

---

## 10. 프런트엔드 UI 스펙 (단일 페이지)

- 상단: **Page Atelier** 로고 + \[설정노트 생성] \[분석하기] 버튼
- 좌측 패널: 신규 연재분 입력(TextArea, 글자수 표시)
- 우측 탭:

  1. **검수 결과**: 카테고리별 점수바, 이슈 테이블(유형/증거/제안)
  2. **페르소나**: 3개 카드(점수 레이더·코멘트)
  3. **JSON**: 원시 결과, \[복사]/\[다운로드]

- 토스트: 오류/성공 알림

---

## 11. 아키텍처 & 모노레포 구조

### 11.1 선택 기술 스택 (2시간 기준 단순·신뢰성 우선)

- **프런트엔드**: Next.js(App Router) + TypeScript + Tailwind + shadcn/ui
- **백엔드**: Next.js API Routes(서버리스 핸들러) 또는 Fastify(선택) — MVP는 Next.js API로 충분
- **LLM 클라이언트**: provider-agnostic 인터페이스(`/packages/llm`) — Gemini/대체모델 교체 가능
- **패키지 매니저/빌드**: pnpm + Turborepo
- **테스트/품질**: Vitest, ESLint, Prettier

### 11.2 디렉터리 레이아웃

```
page-atelier/ (repo root)
├─ apps/
│  └─ web/ (Next.js)
│     ├─ app/
│     │  ├─ page.tsx (UI)
│     │  └─ api/
│     │     └─ analyze/route.ts (POST)
│     └─ components/
├─ packages/
│  ├─ core/ (스키마, 스코어러, 프롬프트 템플릿)
│  ├─ llm/ (LLM 어댑터: generateJSON(prompt))
│  └─ data/ (홍길동전 원문 JSON, 설정노트 캐시)
├─ .github/workflows/ci.yml (lint/typecheck)
└─ README.md
```

### 11.3 주요 모듈 (요약)

- `packages/core/settingBuilder.ts`: 원문→설정노트 프롬프트 생성/후처리
- `packages/core/checker.ts`: 설정 vs 신규분 비교, 이슈 정렬/가중치
- `packages/core/personas.ts`: 3종 페르소나 프로필/프롬프트
- `packages/core/aggregate.ts`: 가중합·verdict 로직
- `packages/llm/index.ts`: `generateJSON<T>(prompt, schema)` 공통 함수(재시도/검증)

---

## 12. 예시 입력·출력 (요청하신 문장)

**입력 예시**

> "홍길동전 외전이 시작되면서 비범한 능력을 이용해 방탕한 생활을 시작함"

**핵심 지적(발췌)**

- 캐릭터 붕괴 가능: 홍길동의 **의협/금욕** 정체성과 상충 → 동기/명분 보강 필요
- 개연성 약화: 방탕의 **강제성**(위장/함정/정보수집) 부여 시 허용 가능
- 권장 액션: 사건 귀결이 \*\*의(義)\*\*로 닫히게 구조 조정

---

## 13. 테스트 계획 (15\~20분)

- 유닛: 스키마 검증(Zod), 가중합 계산, 이슈 정렬
- 통합: `/api/analyze`에 더미 입력→스키마 유효성 통과 확인
- 수동: UI에서 입력·분석·JSON 다운로드 동작 확인

---

## 14. 배포 & 운영 (데모)

- 로컬 우선; 필요 시 Vercel 1클릭 배포
- CI: PR 기준 **lint + typecheck + build**

---

## 15. 리스크 & 대응

- **콘텍스트 초과**: 홍길동전 분량 요약 후 캐시, 단계별 프롬프트(설정→검수→평가)
- **환각/일관성**: JSON Schema 강제, self-check 프롬프트, score 근거에 증거문장 포함
- **톤 불일치**: 캐릭터 금기·가치 사용해 판별, 제안은 원문 톤 유지

---

## 16. 수용 기준 (MVP Done)

- [ ] `/api/analyze`가 7.2 스키마 JSON을 반환한다
- [ ] UI에서 점수바·이슈 테이블·페르소나 카드가 렌더된다
- [ ] JSON 다운로드가 동작한다
- [ ] 같은 입력에 대해 큰 편차 없이 결과가 재현된다(온도 ≤ 0.3)

---

## 17. 로드맵(데모 이후)

- RAG/지식 그래프로 설정 일관성 강화, 인물·사건 지식베이스 구축
- 장르별 페르소나 확장(현판/로판/던전/학원물 등), 가중치 튜너
- 작가 스타일 보존 리라이팅, 다화자 감정선 추적 시각화
- 협업 편집(코멘트/버전), 카카오페이지 연재 툴 연동

---

## 18. 라이선스 & 윤리

- **홍길동전** 등 퍼블릭 도메인 텍스트만 데모에 사용
- 외부로 텍스트 저장·학습 금지(데모 내 일회성 처리)

---

### 부록 A. 페르소나 프리셋 (요약 프로필)

- **설정 과몰입**: 정합성·떡밥·회수율 중시, 클리셰 경계 → 허점·장기 떡밥 미회수에 민감
- **로판 서브주총러**: 서브 남주 매력·관계 긴장·감정선 일관성, 과도한 고구마/피해의식 싫어함
- **정통무협팬**: 의협·명분·사파/정파 구도 선호, 무공 합리성/수련 서사 중요

### 부록 B. 가중치 기본값

- continuity 0.40, character 0.35, world_rules 0.25
- persona_fit_mean ∈ \[0,1] → overall ±0.05 보정
