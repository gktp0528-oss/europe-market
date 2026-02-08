-- ============================================================
-- P0-3: posts 테이블 RLS 정책 추가
-- P1-11: conversations UPDATE 정책 추가
--
-- 실행 방법: Supabase Dashboard → SQL Editor → 아래 내용 붙여넣기 후 Run
-- 실행일: ____-__-__
-- ============================================================

BEGIN;

-- 1. posts 테이블 RLS 활성화
-- (이미 활성화되어 있으면 무시됨)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. 기존 posts 정책이 있으면 삭제 (중복 방지)
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- 3. posts RLS 정책 생성
-- SELECT: 누구나 게시글 조회 가능
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT
  USING (true);

-- INSERT: 인증된 사용자만, 본인 user_id로만 생성 가능
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 본인 게시글만 수정 가능
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 본인 게시글만 삭제 가능
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- 4. conversations UPDATE 정책 (last_message 갱신용)
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

COMMIT;
