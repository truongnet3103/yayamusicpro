-- Bảng cấu hình khung giờ học cho từng trung tâm
-- Mỗi trung tâm tự định nghĩa các slot (sáng/chiều/tối, giờ bắt đầu/kết thúc)
-- Khi tạo lớp, admin chọn slot thay vì gõ tay giờ

CREATE TABLE schedule_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,           -- VD: "Sáng 1", "Chiều 2", "Tối 1"
  period      TEXT NOT NULL            -- 'morning' | 'afternoon' | 'evening'
                CHECK (period IN ('morning', 'afternoon', 'evening')),
  start_time  TIME NOT NULL,           -- VD: 08:00
  end_time    TIME NOT NULL,           -- VD: 09:30
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;

-- Select: admin/super_admin/staff/teacher/parent/student in same school
CREATE POLICY "schedule_slots_select" ON schedule_slots
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND (user_type = 'super_admin' OR school_id = schedule_slots.school_id)
    )
  );

-- Insert/Update/Delete: admin/super_admin only
CREATE POLICY "schedule_slots_write" ON schedule_slots
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = schedule_slots.school_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
        AND user_type IN ('super_admin', 'admin')
        AND (user_type = 'super_admin' OR school_id = schedule_slots.school_id)
    )
  );

-- Index để query nhanh theo school
CREATE INDEX idx_schedule_slots_school_id ON schedule_slots(school_id, sort_order);

-- Thêm cột slot_id vào classes để link tới config slot
ALTER TABLE classes ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES schedule_slots(id) ON DELETE SET NULL;
