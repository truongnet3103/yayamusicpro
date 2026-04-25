-- ============================================================
-- CMS Content Tables — Landing Page Management
-- ============================================================

-- 1. Khoá học (courses catalog for landing page)
CREATE TABLE IF NOT EXISTS public.cms_courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT false,
  icon        text,                     -- SVG string or icon key
  number_label text NOT NULL DEFAULT '01',
  title       text NOT NULL,
  subtitle    text,
  description text NOT NULL,
  duration    text,                     -- "3 tháng — 2 năm"
  age_range   text,                     -- "8 tuổi trở lên"
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Bài viết / Tin tức
CREATE TABLE IF NOT EXISTS public.cms_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT false,
  category    text NOT NULL DEFAULT 'news',  -- 'news' | 'event' | 'highlight'
  title       text NOT NULL,
  subtitle    text,
  body        text,
  image_url   text,
  event_date  date,
  event_venue text,
  cta_label   text,
  cta_url     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Testimonials
CREATE TABLE IF NOT EXISTS public.cms_testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT false,
  quote       text NOT NULL,
  author_name text NOT NULL,
  author_role text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 4. Hero stats
CREATE TABLE IF NOT EXISTS public.cms_stats (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  label       text NOT NULL,   -- "Học viên"
  value       integer NOT NULL DEFAULT 0,
  suffix      text DEFAULT '',  -- "+", "%", ""
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_cms_courses_school     ON public.cms_courses(school_id, published, order_index);
CREATE INDEX IF NOT EXISTS idx_cms_posts_school       ON public.cms_posts(school_id, published, order_index);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_school ON public.cms_testimonials(school_id, published, order_index);
CREATE INDEX IF NOT EXISTS idx_cms_stats_school       ON public.cms_stats(school_id, published, order_index);

-- ── Auto-update updated_at ──
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_courses_updated_at') THEN
    CREATE TRIGGER trg_cms_courses_updated_at BEFORE UPDATE ON public.cms_courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_posts_updated_at') THEN
    CREATE TRIGGER trg_cms_posts_updated_at BEFORE UPDATE ON public.cms_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_testimonials_updated_at') THEN
    CREATE TRIGGER trg_cms_testimonials_updated_at BEFORE UPDATE ON public.cms_testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_stats_updated_at') THEN
    CREATE TRIGGER trg_cms_stats_updated_at BEFORE UPDATE ON public.cms_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ── RLS ──
ALTER TABLE public.cms_courses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_stats        ENABLE ROW LEVEL SECURITY;

-- Public can read published content (for landing page)
CREATE POLICY "cms_courses_public_read"      ON public.cms_courses      FOR SELECT USING (published = true);
CREATE POLICY "cms_posts_public_read"        ON public.cms_posts        FOR SELECT USING (published = true);
CREATE POLICY "cms_testimonials_public_read" ON public.cms_testimonials FOR SELECT USING (published = true);
CREATE POLICY "cms_stats_public_read"        ON public.cms_stats        FOR SELECT USING (published = true);

-- Super admin & IT admin: full access (use service role or check via user_profiles)
CREATE POLICY "cms_courses_admin_all" ON public.cms_courses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND user_type IN ('super_admin', 'it_admin')
  ));

CREATE POLICY "cms_posts_admin_all" ON public.cms_posts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND user_type IN ('super_admin', 'it_admin')
  ));

CREATE POLICY "cms_testimonials_admin_all" ON public.cms_testimonials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND user_type IN ('super_admin', 'it_admin')
  ));

CREATE POLICY "cms_stats_admin_all" ON public.cms_stats FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND user_type IN ('super_admin', 'it_admin')
  ));

-- ── Seed default data ──
INSERT INTO public.cms_courses (order_index, published, number_label, title, description, duration, age_range) VALUES
(1, true, '01', 'Piano Cổ Điển & Đương Đại',
  'Từ kỹ thuật cơ bản đến biểu diễn nâng cao — chương trình được thiết kế theo chuẩn quốc tế ABRSM, phù hợp mọi lứa tuổi.',
  '6 tháng — 3 năm', 'Mọi độ tuổi'),
(2, true, '02', 'Guitar Đệm Hát, Solo & Fingerstyle',
  'Từ hợp âm đệm hát cơ bản đến solo giai điệu và kỹ thuật fingerstyle — đàn được ngay những bản nhạc bạn yêu thích.',
  '3 tháng — 2 năm', '8 tuổi trở lên'),
(3, true, '03', 'Nhạc Lý & Thanh Nhạc',
  'Nền tảng lý thuyết âm nhạc vững chắc kết hợp kỹ thuật hơi thở, phát âm và biểu diễn thanh nhạc chuyên nghiệp.',
  '3 tháng — 2 năm', '10 tuổi trở lên');

INSERT INTO public.cms_stats (order_index, published, label, value, suffix) VALUES
(1, true, 'Học viên', 2400, '+'),
(2, true, 'Năm kinh nghiệm', 18, ''),
(3, true, 'Tỷ lệ hài lòng', 98, '%'),
(4, true, 'Giảng viên', 42, '');

INSERT INTO public.cms_testimonials (order_index, published, quote, author_name, author_role) VALUES
(1, true,
  'YayaMusic đã thay đổi cách chúng tôi quản lý trung tâm. Điểm danh giờ đây thật dễ dàng, và sự tương tác của phụ huynh tăng lên rõ rệt.',
  'Nguyễn Thị Lan', 'Giám đốc, Trung tâm Âm nhạc Thăng Long'),
(2, true,
  'Phần mềm rất trực quan và dễ dùng. Tôi có thể theo dõi tiến độ từng học viên và liên lạc với phụ huynh chỉ trong vài cú nhấp chuột.',
  'Trần Văn Minh', 'Giảng viên Piano'),
(3, true,
  'Con tôi học guitar tại đây được 1 năm và tiến bộ vượt bậc. Hệ thống thông báo giúp tôi luôn nắm bắt được lịch học và bài tập của con.',
  'Phạm Hồng Nhung', 'Phụ huynh học viên');
