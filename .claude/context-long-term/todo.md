# 페이지 아틀리에 (Page Atelier) 개발 계획

## 프로젝트 개요
LLM 기반 웹소설 작가를 위한 사전 피드백·검수 도구 MVP (2시간 구현 목표)

## 진행 현황
- **Phase 1-4 완료**: 백엔드 및 Core 로직 구현 완료
- **현재 Phase 5**: 프론트엔드 UI 구현 진행 예정
- **완료율**: 60% (Phase 1-4 of 7)

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

### 2단계: 데이터 모델 정의 (10분) ✅ 완료
- [x] TypeScript 타입 정의 - Issue, Check, PersonaResult, Analysis 타입 구현
  - packages/core/src/types.ts 작성 완료 (155줄)
  - SettingNote, ConsistencyCheck, PersonaResult, AggregateReport, Analysis 타입

- [x] 홍길동전 데이터 준비 - packages/data에 원문 처리
  - packages/data/src/honggildongjeon.ts 구현 (127줄)
  - example.txt에서 텍스트 읽기 및 챕터 파싱

### 3단계: Core 패키지 구현 (30분) ✅ 완료
- [x] LLM 어댑터 구현 - packages/llm/src/index.ts (241줄)
- [x] 설정노트 생성 모듈 - packages/core/src/settingBuilder.ts (174줄)
- [x] 일관성 체크 모듈 - packages/core/src/checker.ts (237줄)
- [x] 페르소나 평가 모듈 - packages/core/src/personas.ts (273줄)
- [x] 종합 리포트 생성 모듈 - packages/core/src/aggregate.ts (337줄)

### 4단계: API 구현 (15분) ✅ 완료
- [x] API 엔드포인트 구현 - apps/web/app/api/analyze/route.ts (219줄)
- [x] 프롬프트 템플릿 작성 - packages/core/src/prompts/index.ts (198줄)
- [x] JSON 스키마 검증 로직 - Zod 활용한 입출력 검증

### 5단계: 프론트엔드 구현 (35분) 🔄 진행 예정
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
  - 만족도/몰입도/피로도 바 차트

- [ ] JSON 탭 컴포넌트 구현 - 원시 JSON 표시, 복사/다운로드 기능
  - JSONTab 컴포넌트
  - Syntax highlighting
  - 클립보드 복사 및 파일 다운로드 기능

- [ ] 로딩 및 에러 처리 UI 구현 - 토스트 알림, 로딩 스피너
  - Toast 컴포넌트 (shadcn/ui)
  - Loading 상태 관리
  - 에러 바운더리

### 6단계: 품질 보증 (10분)
- [ ] ESLint 및 Prettier 설정
- [ ] 기본 유닛 테스트 작성

### 7단계: 테스트 및 문서화 (15분)
- [ ] 통합 테스트 - API 엔드포인트 동작 확인
- [ ] 수동 테스트 - UI 전체 플로우 검증
- [ ] README 문서 작성
- [ ] CI/CD 설정

## 주요 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **LLM**: Gemini API (provider-agnostic 설계)
- **Build**: pnpm, Turborepo
- **Test**: Vitest
- **Quality**: ESLint, Prettier

## 수용 기준 체크리스트
- [x] `/api/analyze`가 정의된 JSON 스키마를 반환
- [ ] UI에서 점수바, 이슈 테이블, 페르소나 카드 정상 렌더링
- [ ] JSON 다운로드 기능 동작
- [x] 동일 입력에 대해 일관된 결과 생성 (temperature ≤ 0.3)

## 참고사항
- 홍길동전 데이터는 example.txt에서 읽도록 변경
- Gemini API 키는 .env.local 파일에서 읽도록 설정
- 데모용으로 홍길동전 퍼블릭 도메인 텍스트만 사용