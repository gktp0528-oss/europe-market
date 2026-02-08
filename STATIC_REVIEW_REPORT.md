# 정적 리뷰 보고서 (실서비스 기준)

- 작성일: 2026-02-08 (검증 보완: 2026-02-08)
- 대상: 현재 저장소 전체 코드베이스(React + Vite + Supabase)

## 요약
현재 코드는 빠른 프로토타입 단계에 가깝고, 실서비스 기준으로는 **데이터 무결성/보안/확장성** 관련 선행 수정이 필요합니다.
검증 결과 기존 8개 항목은 전부 코드로 확인되었으며, 보안·안정성 관련 **11개 추가 이슈**를 보완합니다.

---

## 지금 고쳐야 할 부분 (출시 전)

### P0 — 즉시 수정 필수

1. `P0` 채팅방 중복 생성 위험(무결성)
- 근거: `src/pages/ChatRoom.jsx:147-162`에서 `new` 채팅 시 바로 `insert`하고, 중복 체크 유틸 `src/lib/chat.js:3`은 미사용 상태.
- 근거: `schema.sql:2`에 참여자 쌍 + `post_id` 유니크 제약 부재. `post_id` 컬럼 자체도 schema.sql에 정의되어 있지 않음.
- 영향: 동일 상대/게시글에 대화방 분산, 메시지 히스토리 파편화.
- 조치: DB 유니크 인덱스 + 서버 함수(RPC)로 "찾거나 생성" 원자화.

2. `P0` 클라이언트에서 집계 작업 수행 + 무인가 노출(운영 위험)
- 근거: `src/pages/Home.jsx:77`의 `handleForceAggregation`, `src/lib/aggregation.js:7`의 `updateTop10Snapshot`.
- 근거: `src/pages/Home.jsx:155-172`에서 "집계 Trigger" 버튼이 `zIndex: 9999`로 모든 방문자에게 노출됨. 인증/관리자 체크 없음.
- 영향: 임의 방문자가 전체 `posts` 테이블 스캔 + 9개국 upsert 트리거 가능. DoS/비용 남용 위험.
- 조치: 서버 크론/배치로 이전, 클라이언트 트리거 완전 제거. 최소한 즉시 버튼 숨김 처리.

3. `P0` `posts` 테이블 RLS 정책 부재(보안)
- 근거: `schema.sql`에 `conversations`/`messages` RLS만 정의. `posts` 테이블에는 RLS 정책이 없음.
- 근거: Write 4개 페이지에서 `.insert()`, `ProductDetail.jsx:56-59`에서 `.update()` 직접 수행.
- 영향: 아무 인증 사용자가 타인 게시글을 UPDATE/DELETE 가능. 게시글 위변조 위험.
- 조치: `posts` 테이블에 소유자 기반 RLS 정책 추가 (SELECT: 모두 허용, INSERT/UPDATE/DELETE: `user_id = auth.uid()` 조건).

4. `P0` 비로그인 상태에서 게시글 작성 가능(인증 가드 부재)
- 근거: Write 4개 페이지에서 `user_id: user?.id`로 삽입 — `WriteUsed.jsx:129`, `WriteJob.jsx:149`, `WriteTutoring.jsx:93`, `WriteMeetup.jsx:154`.
- 영향: 세션 만료 시 `user?.id`가 `undefined` → `user_id: NULL`로 저장되어 소유자 없는 고아 게시글 생성.
- 조치: 라우트 레벨 인증 가드 추가 + 폼 제출 시 `user` null 체크.

### P1 — 출시 전 수정 권장

5. `P1` 조회수 증가 로직 불일치/경쟁 상태
- 근거: `src/pages/ProductDetail.jsx:56`은 read-modify-write, `src/pages/JobDetail.jsx:66`은 RPC.
- 영향: 동시 접근 시 조회수 유실.
- 조치: 전 상세 페이지를 원자적 RPC로 통일.

6. `P1` XSS 취약 패턴 존재
- 근거: `src/components/SuccessModal.jsx:32`의 `dangerouslySetInnerHTML`.
- 상태: 현재 호출처 4곳 모두 하드코딩 문자열이므로 잠재적 위험. 사용자 입력이 전달되는 순간 취약점으로 직결.
- 조치: HTML 주입 제거(줄바꿈 처리 로직으로 대체).

7. `P1` 페이징 없는 전체 조회 + `select('*')`
- 근거: `src/pages/CategoryClothes.jsx:21`, `src/pages/MyPosts.jsx:21` 등 12곳 이상.
- 근거: 코드 전체에 `.limit()` / `.range()` 호출이 0건.
- 영향: 데이터 증가 시 응답 지연/모바일 메모리 압박.
- 조치: 필드 축소 + cursor pagination + 인덱스 점검.

8. `P1` 품질 게이트 미통과 상태
- 근거: `npm run lint` 결과 `24 errors, 11 warnings` (검증 완료, 정확 일치).
- 영향: 리그레션 탐지 실패, 유지보수 비용 증가.
- 조치: lint 0 에러/0 경고를 CI 차단 조건으로 설정.

9. `P1` 번들 과대 + 라우트 eager import
- 근거: `src/App.jsx` 19개 페이지 전부 정적 import, `React.lazy` 사용 0건, 빌드 결과 JS `509.73 kB` 경고.
- 영향: 초기 로딩 지연(TTI 악화).
- 조치: `React.lazy` 기반 route-level code splitting.

10. `P1` 마이그레이션 소스 불완전(재현성 리스크)
- 근거: `schema.sql`에 `posts`, `popular_snapshots`, `profiles` 테이블 정의 부재. `conversations.post_id` 컬럼도 누락.
- 근거: `add_user_id_to_posts.sql`이 별도 존재하여 DB 변경이 파편화된 상태.
- 영향: 신규 환경 재구축 시 스키마 드리프트.
- 조치: 단일 migration 체계로 통합.

11. `P1` `conversations` UPDATE RLS 정책 부재
- 근거: `schema.sql`에 SELECT/INSERT 정책만 정의. UPDATE 정책 없음.
- 근거: `src/pages/ChatRoom.jsx:208`에서 `.update({ last_message, updated_at })` 호출.
- 영향: `last_message` 갱신이 조용히 실패하거나, 대시보드에서 별도 추가한 경우 관리 불가.
- 조치: 참여자 기반 UPDATE 정책 추가.

12. `P1` 파일 업로드 검증 부재(보안)
- 근거: Write 4개 페이지의 이미지 업로드 — `WriteUsed.jsx:90-97`, `WriteJob.jsx:104-121`, `WriteMeetup.jsx:109-126`.
- 문제점: 파일 크기 제한 없음, MIME 타입 검증 없음, 파일명 미정제(`img.file.name.split('.').pop()`), `Math.random()` 사용(예측 가능).
- 영향: 악의적 대용량 파일/비이미지 파일 업로드 가능.
- 조치: 클라이언트+서버 양측에서 파일 크기/타입 검증, 파일명에 `crypto.randomUUID()` 사용.

13. `P1` 입력 길이 제한 없음
- 근거: Write 4개 페이지의 모든 `<input>`, `<textarea>`에 `maxLength` 미설정. 서버측 검증도 없음.
- 영향: 수 MB 문자열 저장 가능, DB 비용/렌더링 성능 문제.
- 조치: 클라이언트 `maxLength` + DB 컬럼 길이 제약 추가.

---

## 나중에 리팩토링해도 되는 부분

1. 카테고리/상세/작성 페이지 중복 제거
- 대상: `src/pages/Category*.jsx`, `*Detail.jsx`, `Write*.jsx`.

2. `time_ago` 저장 방식 개선
- 근거: `src/pages/WriteUsed.jsx:125` 등에서 `'방금 전'` 문자열 저장.
- 개선: 저장 대신 표시 시 계산.

3. 파일 업로드 UX/성능 개선
- 근거: `src/pages/WriteMeetup.jsx:109` 순차 업로드.
- 개선: 병렬화, 압축, 실패 재시도.

4. 오브젝트 URL 정리
- 근거: `src/pages/WriteUsed.jsx:48` 등 `URL.createObjectURL` 해제 누락.

5. 죽은 코드 정리
- 미사용 페이지: `src/pages/DetailPageStyle1.jsx`, `src/pages/DetailPageStyle2.jsx`, `src/pages/DetailPageStyle3.jsx`.
- 미사용 유틸: `src/lib/chat.js`, `src/lib/locationUtils.js`.
- 미사용 컴포넌트: `src/pages/Home.jsx:227-243`의 `ItemCard`.

6. `framer-motion` 미사용 의존성 제거
- 근거: `package.json`에 `"framer-motion": "^12.33.0"` 존재하나 `src/` 전체에서 import 0건.
- 개선: `npm uninstall framer-motion`으로 번들 경량화.

7. Search 페이지 구현
- 근거: `src/pages/Search.jsx:12`의 `handleSearch`가 `console.log`만 수행하는 스텁 상태.
- 개선: 실제 검색 로직 구현 또는 라우트에서 제거.

8. "하은님" 하드코딩 제거
- 근거: `WriteUsed.jsx:270`, `WriteJob.jsx:307`, `WriteTutoring.jsx:237`, `MyPage.jsx:91,149` 등에서 고정 문자열 사용.
- 개선: `user.display_name` 등 실제 사용자명으로 대체.

9. LocationPicker localhost 폴백 수정
- 근거: `src/components/LocationPicker.jsx:14`에서 환경변수 미설정 시 `http://localhost:2322/api` 호출.
- 개선: 프로덕션 기본 URL 설정 또는 환경변수 필수화.

---

## 구조적 한계 요약
- 현재 구조는 기능 추가 속도는 빠르지만 카테고리/도메인 확장 시 수정 지점이 과다합니다.
- 서비스 규모가 커질수록 데이터 접근 계층 부재(직접 Supabase 호출 분산)와 중복 UI/로직이 병목이 됩니다.
- **보안 계층(RLS, 인증 가드, 입력 검증)이 전반적으로 미비**하여 출시 전 일괄 점검이 필요합니다.
