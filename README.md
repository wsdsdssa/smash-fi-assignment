# Coin List Dashboard

## 사용한 기술 스택
- Next.js (App Router) & React 19
- TypeScript
- Tailwind CSS
- Zustand + persist (즐겨찾기 상태 영속화)
- @tanstack/react-query (서버 상태 관리)
- @tanstack/react-virtual (가상 스크롤)
- react-hot-toast (피드백 토스트)
- ESLint, TypeScript, Tailwind PostCSS

## 프로젝트 실행 방법
1. 저장소 클론 후 의존성 설치
   ```bash
   npm install
   ```
2. 개발 서버 실행
   ```bash
   npm run dev
   ```
3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 구현한 주요 요소
- CoinGecko API를 활용한 실시간 코인 목록 조회 및 정렬 (가격, 24h 변동률, 거래량, 시가총액)
- 즐겨찾기(Zustand + localStorage) 및 즐겨찾기 탭 분리, 토스트 피드백
- 검색어/정렬 상태를 조합한 리스트 필터링
- @tanstack/react-virtual을 이용한 가상 스크롤 + IntersectionObserver 기반 무한 스크롤
- Tailwind 기반 다크 모드 UI, 반응형 레이아웃, Hover/Focus 인터랙션

## 시간 내 구현하지 못한 부분 & 보완하고 싶은 점
- CoinGecko 무료 API는 `price`, `24h change` 정렬을 서버 측에서 지원하지 않아 클라이언트 정렬로 보완 (완전한 정확도 한계)
- Skeleton UI 미구현 및 로딩 상태가 매끄럽지 못함
- 공식 API rate limit 때문에 로딩 UX를 더 세밀하게 다듬지 못함

## AI 활용 내용
- Cursor로 설계/리팩토링 아이디어와 코드 베이스 설명을 얻고, 일부 코드 초안을 작성했습니다.
- Tailwind 임의 값 문법, TanStack Virtual 사용법 등 문서 확인을 AI 보조 도구로 지원받았습니다.
