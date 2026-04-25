-- ============================================================
-- CMS: Thêm price_groups vào cms_courses + seed dữ liệu thực tế
-- ============================================================

-- 1. Thêm cột price_groups (JSONB) vào cms_courses
ALTER TABLE public.cms_courses
  ADD COLUMN IF NOT EXISTS price_groups jsonb DEFAULT '[]'::jsonb;

-- 2. Thêm tags và excerpt vào cms_posts
ALTER TABLE public.cms_posts
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excerpt text;

-- ── Xóa seed data cũ, thêm dữ liệu thực tế ──────────────────

-- Xóa courses cũ (không có school_id)
DELETE FROM public.cms_courses WHERE school_id IS NULL;

-- ── Seed khóa học Piano ──────────────────────────────────────
INSERT INTO public.cms_courses (order_index, published, number_label, title, subtitle, description, duration, age_range, price_groups) VALUES
(1, true, '01', 'Piano', 'Cổ Điển & Đương Đại',
  'Chương trình piano được thiết kế theo chuẩn quốc tế ABRSM, phù hợp mọi lứa tuổi từ 4 tuổi trở lên. Học viên được học từ kỹ thuật cơ bản đến biểu diễn nâng cao.',
  '4 tháng / 32 buổi / 60 phút mỗi buổi', 'Từ 4 tuổi',
  '[
    {
      "group": "Từ 4 – 6 tuổi",
      "items": [
        {"level": "Trình độ 1", "original": "6.400.000 ₫", "sale": "5.400.000 ₫"},
        {"level": "Trình độ 2", "original": "6.800.000 ₫", "sale": "5.800.000 ₫"},
        {"level": "Trình độ 3", "original": "7.000.000 ₫", "sale": "6.000.000 ₫"}
      ]
    },
    {
      "group": "Từ 7 – 15 tuổi",
      "items": [
        {"level": "Trình độ 1", "original": "6.800.000 ₫", "sale": "5.800.000 ₫"},
        {"level": "Trình độ 2", "original": "7.200.000 ₫", "sale": "6.200.000 ₫"},
        {"level": "Trình độ 3", "original": "7.500.000 ₫", "sale": "6.000.000 ₫"}
      ]
    },
    {
      "group": "Từ 16 – 35 tuổi",
      "items": [
        {"level": "Trình độ 1", "original": "7.200.000 ₫", "sale": "6.200.000 ₫"},
        {"level": "Trình độ 2", "original": "7.400.000 ₫", "sale": "6.400.000 ₫"},
        {"level": "Trình độ 3", "original": "7.700.000 ₫", "sale": "6.700.000 ₫"}
      ]
    },
    {
      "group": "1 kèm 1",
      "items": [
        {"level": "Cá nhân hóa", "original": null, "sale": "500.000 ₫ / giờ"}
      ]
    }
  ]'::jsonb
),

-- ── Seed khóa học Guitar ────────────────────────────────────
(2, true, '02', 'Guitar', 'Đệm Hát, Solo & Fingerstyle',
  'Từ hợp âm đệm hát cơ bản đến solo giai điệu và kỹ thuật fingerstyle. Lộ trình cá nhân hóa theo năng khiếu, kết hợp vững chắc giữa nhạc lý và thực hành.',
  '4 tháng / 32 buổi / 60 phút mỗi buổi', 'Từ 8 tuổi',
  '[
    {
      "group": "1 buổi / tuần",
      "items": [
        {"level": "Cơ bản", "original": "2.500.000 ₫", "sale": "2.000.000 ₫"},
        {"level": "Nâng cao", "original": "3.300.000 ₫", "sale": "2.800.000 ₫"}
      ]
    },
    {
      "group": "2 buổi / tuần",
      "items": [
        {"level": "Cơ bản", "original": "4.300.000 ₫", "sale": "3.800.000 ₫"},
        {"level": "Nâng cao", "original": "5.100.000 ₫", "sale": "4.600.000 ₫"}
      ]
    },
    {
      "group": "3 buổi / tuần",
      "items": [
        {"level": "Cơ bản", "original": "5.900.000 ₫", "sale": "5.400.000 ₫"},
        {"level": "Nâng cao", "original": "6.500.000 ₫", "sale": "6.000.000 ₫"}
      ]
    },
    {
      "group": "1 kèm 1",
      "items": [
        {"level": "Cá nhân hóa", "original": null, "sale": "500.000 ₫ / giờ"}
      ]
    }
  ]'::jsonb
),

-- ── Seed khóa học Thanh Nhạc ────────────────────────────────
(3, true, '03', 'Thanh Nhạc', 'Nhạc Lý & Kỹ Thuật Hơi Thở',
  'Nền tảng lý thuyết âm nhạc vững chắc kết hợp kỹ thuật hơi thở, phát âm và biểu diễn thanh nhạc chuyên nghiệp. Phù hợp học viên muốn theo đuổi ca hát học thuật.',
  '3 tháng — 2 năm', 'Từ 10 tuổi', '[]'::jsonb
);

-- ── Seed bài viết blog mẫu ───────────────────────────────────

DELETE FROM public.cms_posts WHERE school_id IS NULL;

INSERT INTO public.cms_posts (order_index, published, category, title, subtitle, excerpt, body, tags) VALUES
(1, true, 'news',
  '5 Lý Do Học Piano Giúp Trẻ Phát Triển Toàn Diện',
  'Nghiên cứu khoa học và kinh nghiệm thực tế',
  'Nhiều nghiên cứu đã chứng minh rằng học nhạc cụ — đặc biệt là piano — có tác động tích cực sâu sắc đến sự phát triển trí tuệ và cảm xúc của trẻ em.',
  'Nhiều nghiên cứu khoa học đã chứng minh rằng học nhạc cụ, đặc biệt là piano, có tác động tích cực sâu sắc đến sự phát triển toàn diện của trẻ em. Dưới đây là 5 lý do mà các chuyên gia tâm lý và giáo dục đặc biệt nhấn mạnh.

**1. Tăng cường khả năng tập trung và kỷ luật**
Khi học piano, trẻ phải đọc bản nhạc, kiểm soát hai tay độc lập và lắng nghe âm thanh đồng thời. Quá trình này rèn luyện não bộ tập trung cao độ trong thời gian dài.

**2. Phát triển trí nhớ và khả năng học tập**
Ghi nhớ các đoạn nhạc, hợp âm và kỹ thuật tương đương với việc luyện tập trí nhớ có hệ thống. Nhiều học viên YayaMusic cho thấy kết quả học tập ở trường được cải thiện rõ rệt sau 6 tháng học nhạc.

**3. Xây dựng sự tự tin và khả năng biểu đạt**
Biểu diễn trước khán giả — dù nhỏ — giúp trẻ vượt qua nỗi sợ đám đông và học cách truyền đạt cảm xúc qua nghệ thuật.

**4. Phát triển trí tuệ cảm xúc (EQ)**
Âm nhạc là ngôn ngữ của cảm xúc. Học cách diễn đạt buồn vui, hứng khởi hay trầm lắng qua từng nốt nhạc giúp trẻ nhận biết và điều tiết cảm xúc của bản thân tốt hơn.

**5. Tạo nền tảng cho tư duy sáng tạo**
Improv (ứng tấu) và sáng tác là những kỹ năng mà học viên YayaMusic được khuyến khích từ sớm. Đây là nền tảng quan trọng cho tư duy đổi mới trong mọi lĩnh vực.',
  ARRAY['piano', 'giáo dục', 'trẻ em', 'phát triển']),

(2, true, 'news',
  'Bắt Đầu Học Guitar Ở Tuổi Nào Là Phù Hợp Nhất?',
  'Giải đáp thắc mắc thường gặp của phụ huynh',
  'Câu hỏi về độ tuổi học guitar phù hợp là một trong những điều phụ huynh hỏi nhiều nhất tại YayaMusic. Câu trả lời phụ thuộc vào nhiều yếu tố hơn bạn nghĩ.',
  'Câu hỏi về độ tuổi bắt đầu học guitar là điều phụ huynh hỏi nhiều nhất khi đến YayaMusic. Câu trả lời không đơn giản chỉ là một con số — nó phụ thuộc vào thể chất, tâm lý và mục tiêu của từng bé.

**Về mặt thể chất**
Ngón tay của trẻ cần đủ sức để bấm dây guitar đúng cách. Với guitar acoustic tiêu chuẩn, độ tuổi lý tưởng là từ 8-9 tuổi. Với guitar size nhỏ (1/4, 1/2), trẻ 6-7 tuổi đã có thể bắt đầu.

**Về mặt tư duy**
Học guitar đòi hỏi khả năng đọc hợp âm, nhớ thế bấm và phối hợp hai tay. Trẻ từ 7-8 tuổi thường đã có đủ khả năng tập trung để tiếp thu.

**Người lớn thì sao?**
Tại YayaMusic, học viên lớn tuổi nhất của chúng tôi là 62 tuổi. Người lớn thường tiến bộ rất nhanh ở giai đoạn đầu nhờ khả năng tự học và hiểu lý thuyết tốt hơn.

**Kết luận của YayaMusic**
Không có "quá sớm" hay "quá muộn" để học nhạc. Điều quan trọng nhất là đam mê và sự kiên nhẫn.',
  ARRAY['guitar', 'phụ huynh', 'bắt đầu', 'lời khuyên']),

(3, true, 'event',
  'Hòa Nhạc Cuối Năm 2025 — Đêm Nhạc Cổ Điển',
  'Học viên YayaMusic biểu diễn tại Nhà Văn Hóa Thanh Niên',
  'YayaMusic tổ chức đêm hòa nhạc thường niên, nơi các học viên có cơ hội biểu diễn trước khán giả trong không gian chuyên nghiệp.',
  'YayaMusic trân trọng kính mời quý phụ huynh, học viên và tất cả những người yêu âm nhạc đến tham dự đêm hòa nhạc cuối năm 2025.

**Thông tin sự kiện**
- Thời gian: 19:00, Thứ Bảy, ngày 20/12/2025
- Địa điểm: Nhà Văn Hóa Thanh Niên TP.HCM
- Vào cửa tự do

**Chương trình biểu diễn**
- Piano: Các tác phẩm của Chopin, Mozart và Beethoven
- Guitar: Fingerstyle và nhạc đệm hát
- Thanh nhạc: Aria cổ điển và bài hát đương đại
- Tiết mục đặc biệt: Hòa tấu ensemble của 15 học viên tiêu biểu

**Ý nghĩa**
Đây không chỉ là buổi biểu diễn mà còn là cột mốc đánh dấu hành trình nỗ lực của từng học viên trong suốt năm qua. Mỗi nốt nhạc trên sân khấu là thành quả của hàng trăm giờ luyện tập.',
  ARRAY['sự kiện', 'hòa nhạc', 'biểu diễn', '2025']),

(4, true, 'news',
  'Tại Sao Học Nhạc 1-1 Hiệu Quả Hơn Học Nhóm?',
  'Ưu điểm của lớp học cá nhân tại YayaMusic',
  'Tại YayaMusic, chúng tôi cung cấp cả hai hình thức học. Nhưng với mục tiêu đạt trình độ chuyên nghiệp, lớp 1-1 luôn có những ưu điểm vượt trội.',
  'Nhiều học viên đến YayaMusic thắc mắc: học nhóm và học 1-1 khác nhau như thế nào? Liệu có đáng để đầu tư vào lớp cá nhân không?

**Lớp 1-1: Hoàn toàn cá nhân hóa**
Giáo viên điều chỉnh tốc độ dạy theo khả năng tiếp thu của từng người. Nếu bạn tiến nhanh, bạn sẽ học nhanh hơn chương trình. Nếu cần thêm thời gian cho một kỹ thuật, giáo viên sẽ không vội vàng.

**Phản hồi tức thì**
Trong lớp nhóm, giáo viên chia sẻ thời gian với nhiều học viên. Trong lớp 1-1, mọi lỗi nhỏ đều được phát hiện và sửa ngay lập tức — điều này ngăn hình thành thói quen xấu từ sớm.

**Xây dựng mối quan hệ**
Sau vài tháng học 1-1, giáo viên hiểu rõ điểm mạnh, điểm yếu và phong cách âm nhạc của từng học viên. Sự kết nối này tạo ra động lực học tập bền vững.

**Khi nào nên chọn học nhóm?**
Học nhóm phù hợp khi học viên muốn trải nghiệm âm nhạc theo hướng xã hội, học ensemble (hòa tấu), hoặc khi ngân sách là ưu tiên chính.',
  ARRAY['phương pháp', 'học 1-1', 'lời khuyên', 'giảng dạy']);
