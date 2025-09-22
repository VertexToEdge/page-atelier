# 페이지 아틀리에 (Page Atelier) 개발 계획

## 프로젝트 개요
LLM 기반 웹소설 작가를 위한 사전 피드백·검수 도구 MVP (2시간 구현 목표)

## 작업 순서 및 예상 시간

### 1단계: 프로젝트 초기화 (15분) ✅ 완료
- [x] 프로젝트 초기 설정 - 모노레포 구조 및 패키지 매니저 세팅
  - pnpm 설치 및 초기화 (package.json)
  - Turborepo 설정 (turbo.json:1-22)
  - 기본 .gitignore, .nvmrc 파일 생성
  
- [x] 디렉터리 구조 생성 - apps/web, packages/core, packages/llm, packages/data
  ```
  page-atelier/
  ├─ apps/
  │  └─ web/ (Next.js)
  ├─ packages/
  │  ├─ core/ (비즈니스 로직)
  │  ├─ llm/ (LLM 어댑터)
  │  └─ data/ (홍길동전 데이터)
  ```

- [x] 의존성 설치 - Next.js, TypeScript, Tailwind CSS, shadcn/ui 설정
  - Next.js 14 with App Router (apps/web/package.json:10-21)
  - TypeScript 5.x (각 패키지별 tsconfig.json 설정)
  - Tailwind CSS v4 + shadcn/ui 컴포넌트 라이브러리 (components.json)
  - dotenv 패키지 추가 (Gemini API 키 관리용)
  
**주요 변경사항:**
- 홍길동전 데이터는 example.txt에서 읽도록 변경
- Gemini API 키는 .env 파일에서 읽도록 설정

### 2단계: 데이터 모델 정의 (10분) ✅ 완료
- [x] TypeScript 타입 정의 - Issue, Check, PersonaResult, Analysis 타입 구현
  - packages/core/src/types.ts 작성 완료 (155줄)
  - 모든 JSON 스키마 인터페이스 정의
    - SettingNote (캐릭터, 관계, 세계관 규칙, 타임라인)
    - ConsistencyCheck (개연성, 캐릭터, 세계관 점수)
    - PersonaResult (3종 페르소나 평가)
    - AggregateReport (verdict, 가중합 점수, 액션아이템)
    - Analysis (전체 분석 결과)

- [x] 홍길동전 데이터 준비 - packages/data에 원문 처리
  - packages/data/src/honggildongjeon.ts 구현 (127줄)
  - example.txt에서 텍스트 읽기 기능
  - 챕터 파싱 기능 (== 마커 기반)
  - 샘플 데이터 폴백 구현

### 3단계: Core 패키지 구현 (30분)
- [ ] LLM 어댑터 구현 - packages/llm/index.ts에 generateJSON 함수 구현
  - Provider-agnostic 인터페이스 설계
  - Gemini/OpenAI 어댑터 구현
  - 재시도 로직 및 에러 핸들링

- [ ] 설정노트 생성 모듈 구현 - packages/core/settingBuilder.ts 작성
  - Characters, Relations, World Rules, Timeline 추출
  - 프롬프트 템플릿 구현
  - JSON 후처리 로직

- [ ] 일관성 체크 모듈 구현 - packages/core/checker.ts 작성
  - 개연성(continuity) 점검
  - 캐릭터(character) 일관성 검사
  - 세계관 규칙(world_rules) 위반 감지

- [ ] 페르소나 평가 모듈 구현 - packages/core/personas.ts에 3종 페르소나 구현
  - 설정 과몰입형 페르소나
  - 로판 서브주총러 페르소나
  - 정통무협팬 페르소나
  - 각 페르소나별 평가 프롬프트

- [ ] 종합 리포트 생성 모듈 구현 - packages/core/aggregate.ts 작성
  - 가중합 점수 계산 (continuity 0.4, character 0.35, world_rules 0.25)
  - Verdict 결정 로직 (PASS/REVISE/BLOCK)
  - 액션 아이템 생성

### 4단계: API 구현 (15분)
- [ ] API 엔드포인트 구현 - POST /api/analyze 라우트 작성
  - app/api/analyze/route.ts 구현
  - 전체 분석 파이프라인 오케스트레이션
  - 에러 핸들링 및 응답 포맷팅

- [ ] 프롬프트 템플릿 작성 - 설정노트, 점검, 페르소나, 종합 리포트용
  - packages/core/prompts/ 디렉터리에 템플릿 관리
  - Temperature 0.3 이하 설정

- [ ] JSON 스키마 검증 로직 구현 - Zod 또는 JSON Schema 활용
  - 입력 검증 미들웨어
  - 출력 스키마 준수 확인

### 5단계: 프론트엔드 구현 (35분)
- [ ] 메인 페이지 UI 구현 - 좌측 입력 패널, 우측 결과 탭 레이아웃
  - app/page.tsx 메인 레이아웃
  - Responsive 2-column 그리드
  - 헤더 (로고 + 액션 버튼)

- [ ] 검수 결과 탭 컴포넌트 구현 - 점수바, 이슈 테이블 표시
  - ConsistencyCheckTab 컴포넌트
  - 점수 시각화 (Progress Bar)
  - 이슈 테이블 (유형, 증거, 제안 표시)

- [ ] 페르소나 탭 컴포넌트 구현 - 3개 페르소나 카드 및 점수 표시
  - PersonasTab 컴포넌트
  - 페르소나별 카드 UI
  - 만족도/몰입도/피로도 레이더 차트 또는 바 차트

- [ ] JSON 탭 컴포넌트 구현 - 원시 JSON 표시, 복사/다운로드 기능
  - JSONTab 컴포넌트
  - Syntax highlighting (prismjs 또는 similar)
  - 클립보드 복사 및 파일 다운로드 기능

- [ ] 로딩 및 에러 처리 UI 구현 - 토스트 알림, 로딩 스피너
  - Toast 컴포넌트 (shadcn/ui)
  - Loading 상태 관리
  - 에러 바운더리

### 6단계: 품질 보증 (10분)
- [ ] ESLint 및 Prettier 설정 - 코드 품질 도구 구성
  - .eslintrc.json 설정
  - .prettierrc 설정
  - husky pre-commit hook

- [ ] 기본 유닛 테스트 작성 - 스키마 검증, 가중합 계산 테스트
  - Vitest 설정
  - Core 함수들 테스트

### 7단계: 테스트 및 문서화 (15분)
- [ ] 통합 테스트 - API 엔드포인트 동작 확인
  - /api/analyze 엔드포인트 테스트
  - 더미 입력으로 스키마 검증

- [ ] 수동 테스트 - UI 전체 플로우 검증 및 JSON 다운로드 확인
  - 홍길동전 샘플 텍스트로 전체 플로우 테스트
  - 각 탭 기능 확인
  - JSON 다운로드 및 클립보드 복사 테스트

- [ ] README 문서 작성 - 프로젝트 설명 및 실행 방법
  - 프로젝트 소개
  - 설치 및 실행 가이드
  - API 문서

- [ ] CI/CD 설정 - GitHub Actions 워크플로우 구성
  - .github/workflows/ci.yml
  - Lint, Typecheck, Build 자동화

## 주요 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **LLM**: Gemini API (provider-agnostic 설계)
- **Build**: pnpm, Turborepo
- **Test**: Vitest
- **Quality**: ESLint, Prettier

## 예상 타임라인
- 총 소요시간: 2시간
- 버퍼 시간: 10분

## 수용 기준 체크리스트
- [ ] `/api/analyze`가 정의된 JSON 스키마를 반환
- [ ] UI에서 점수바, 이슈 테이블, 페르소나 카드 정상 렌더링
- [ ] JSON 다운로드 기능 동작
- [ ] 동일 입력에 대해 일관된 결과 생성 (temperature ≤ 0.3)

## 리스크 및 대응
1. **LLM 콘텍스트 초과**: 홍길동전 텍스트 요약 후 캐싱
2. **환각/일관성 문제**: JSON Schema 강제, 증거 문장 포함
3. **시간 부족**: Core 기능 우선 구현, UI 단순화

## 참고사항
- 데모용으로 홍길동전 퍼블릭 도메인 텍스트만 사용
- 외부 데이터 저장 없음 (일회성 처리)
- 추후 확장: RAG, 지식그래프, 다양한 페르소나 추가