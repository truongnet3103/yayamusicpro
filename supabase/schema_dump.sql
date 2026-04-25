-- YayaMusic CRM — Full Schema Dump
-- Generated: 2026-04-25T05:21:12.496Z

CREATE TABLE IF NOT EXISTS public.attendance_records (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  attendance_date date NOT NULL,
  status text NOT NULL,
  check_in_time time,
  check_out_time time,
  marked_by uuid,
  marked_at timestamptz DEFAULT now(),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capabilities (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.class_sessions (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  school_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  session_date date NOT NULL,
  start_time time,
  end_time time,
  status text NOT NULL DEFAULT 'scheduled'::text,
  claimed_at timestamptz,
  claim_notes text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classes (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  course_id uuid NOT NULL,
  teacher_id uuid,
  code text NOT NULL,
  name text NOT NULL,
  section text,
  room text,
  schedule text,
  start_date date,
  end_date date,
  max_students int4,
  status text NOT NULL DEFAULT 'active'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  schedule_days _text DEFAULT '{}'::text[],
  start_time time,
  end_time time,
  slot_id uuid
);

CREATE TABLE IF NOT EXISTS public.courses (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  grade_level text,
  credits numeric,
  is_active bool NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  enrollment_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active'::text,
  dropped_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notif_delivery_log (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  channel text NOT NULL,
  attempt_number int4 DEFAULT 1,
  status text NOT NULL,
  response_code text,
  response_message text,
  provider text,
  provider_message_id text,
  attempted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notif_events (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_name text NOT NULL,
  event_description text,
  default_enabled bool DEFAULT true,
  available_for_roles _text DEFAULT ARRAY['student'::text, 'parent'::text, 'teacher'::text, 'admin'::text],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notif_queue (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  channel text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  icon text,
  priority text DEFAULT 'normal'::text,
  event_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending'::text,
  read_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notif_subscriptions (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  in_app_enabled bool DEFAULT true,
  push_enabled bool DEFAULT false,
  email_enabled bool DEFAULT false,
  sms_enabled bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notif_templates (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  channel text NOT NULL,
  role text NOT NULL,
  title_template text NOT NULL,
  body_template text NOT NULL,
  action_url_template text,
  icon text,
  priority text DEFAULT 'normal'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  sender_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'normal'::text,
  status text NOT NULL DEFAULT 'unread'::text,
  read_at timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parents (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text,
  email text,
  phone text,
  alternate_phone text,
  address text,
  city text,
  state text,
  relationship text,
  occupation text,
  is_primary_contact bool DEFAULT false,
  is_emergency_contact bool DEFAULT true,
  can_pickup bool DEFAULT true,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_capabilities (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  capability_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_system_role bool NOT NULL DEFAULT false,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_slots (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  label text NOT NULL,
  period text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_domains (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  domain text NOT NULL,
  is_primary bool DEFAULT false,
  is_verified bool DEFAULT false,
  verification_token text,
  verified_at timestamptz,
  ssl_enabled bool DEFAULT false,
  ssl_certificate jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schools (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  country text NOT NULL DEFAULT 'Philippines'::text,
  timezone text NOT NULL DEFAULT 'Asia/Manila'::text,
  logo_url text,
  is_active bool NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  slug text NOT NULL,
  branding jsonb DEFAULT '{"logo": {}, "theme": {"border_radius": "8px"}, "colors": {"accent": "#F59E0B", "primary": "#3B82F6", "secondary": "#8B5CF6"}, "typography": {"font_family": "Inter, system-ui, sans-serif"}}'::jsonb,
  features jsonb DEFAULT '{"grading": {"enabled": true}, "reports": {"enabled": true}, "messaging": {"enabled": false}, "attendance": {"enabled": true}, "mobile_app": {"enabled": false}, "parent_portal": {"enabled": true}}'::jsonb,
  subscription_tier text DEFAULT 'basic'::text,
  subscription_status text DEFAULT 'active'::text,
  trial_ends_at timestamptz,
  subscription_renews_at timestamptz,
  max_students int4 DEFAULT 100,
  max_teachers int4 DEFAULT 10,
  max_admins int4 DEFAULT 3,
  max_storage_gb int4 DEFAULT 5,
  website text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.student_parents (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  parent_id uuid NOT NULL,
  relationship text NOT NULL,
  is_primary bool DEFAULT false,
  can_pickup bool DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid,
  student_code text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text,
  date_of_birth date,
  gender text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  emergency_contact_name text,
  emergency_contact_phone text,
  enrollment_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active'::text,
  grade_level text,
  section text,
  photo_url text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid NOT NULL,
  employee_code text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  hire_date date DEFAULT CURRENT_DATE,
  specialization text,
  qualification text,
  status text NOT NULL DEFAULT 'active'::text,
  photo_url text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (  id uuid NOT NULL,
  school_id uuid,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  user_type text NOT NULL,
  is_active bool NOT NULL DEFAULT true,
  last_login_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- CONSTRAINTS
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.user_profiles(id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE public.attendance_records ADD PRIMARY KEY (id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (student_id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (class_id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (class_id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (class_id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (student_id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (student_id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (attendance_date);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (attendance_date);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_class_id_student_id_attendance_date_key UNIQUE (attendance_date);
ALTER TABLE public.capabilities ADD PRIMARY KEY (id);
ALTER TABLE public.capabilities ADD CONSTRAINT capabilities_name_key UNIQUE (name);
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.user_profiles(id);
ALTER TABLE public.class_sessions ADD PRIMARY KEY (id);
ALTER TABLE public.classes ADD CONSTRAINT classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE public.classes ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.classes ADD CONSTRAINT classes_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.schedule_slots(id);
ALTER TABLE public.classes ADD CONSTRAINT classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
ALTER TABLE public.classes ADD PRIMARY KEY (id);
ALTER TABLE public.classes ADD CONSTRAINT classes_school_id_code_key UNIQUE (school_id);
ALTER TABLE public.classes ADD CONSTRAINT classes_school_id_code_key UNIQUE (school_id);
ALTER TABLE public.classes ADD CONSTRAINT classes_school_id_code_key UNIQUE (code);
ALTER TABLE public.classes ADD CONSTRAINT classes_school_id_code_key UNIQUE (code);
ALTER TABLE public.courses ADD CONSTRAINT courses_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.courses ADD PRIMARY KEY (id);
ALTER TABLE public.courses ADD CONSTRAINT courses_school_id_code_key UNIQUE (school_id);
ALTER TABLE public.courses ADD CONSTRAINT courses_school_id_code_key UNIQUE (school_id);
ALTER TABLE public.courses ADD CONSTRAINT courses_school_id_code_key UNIQUE (code);
ALTER TABLE public.courses ADD CONSTRAINT courses_school_id_code_key UNIQUE (code);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE public.enrollments ADD PRIMARY KEY (id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_class_id_student_id_key UNIQUE (student_id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_class_id_student_id_key UNIQUE (student_id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_class_id_student_id_key UNIQUE (class_id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_class_id_student_id_key UNIQUE (class_id);
ALTER TABLE public.notif_delivery_log ADD CONSTRAINT notif_delivery_log_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notif_queue(id);
ALTER TABLE public.notif_delivery_log ADD PRIMARY KEY (id);
ALTER TABLE public.notif_events ADD PRIMARY KEY (id);
ALTER TABLE public.notif_events ADD CONSTRAINT notif_events_event_type_key UNIQUE (event_type);
ALTER TABLE public.notif_queue ADD CONSTRAINT notif_queue_event_type_fkey FOREIGN KEY (event_type) REFERENCES public.notif_events(event_type);
ALTER TABLE public.notif_queue ADD CONSTRAINT notif_queue_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.notif_queue ADD PRIMARY KEY (id);
ALTER TABLE public.notif_subscriptions ADD CONSTRAINT notif_subscriptions_event_type_fkey FOREIGN KEY (event_type) REFERENCES public.notif_events(event_type);
ALTER TABLE public.notif_subscriptions ADD PRIMARY KEY (id);
ALTER TABLE public.notif_subscriptions ADD CONSTRAINT notif_subscriptions_user_id_event_type_key UNIQUE (event_type);
ALTER TABLE public.notif_subscriptions ADD CONSTRAINT notif_subscriptions_user_id_event_type_key UNIQUE (event_type);
ALTER TABLE public.notif_subscriptions ADD CONSTRAINT notif_subscriptions_user_id_event_type_key UNIQUE (user_id);
ALTER TABLE public.notif_subscriptions ADD CONSTRAINT notif_subscriptions_user_id_event_type_key UNIQUE (user_id);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_fkey FOREIGN KEY (event_type) REFERENCES public.notif_events(event_type);
ALTER TABLE public.notif_templates ADD PRIMARY KEY (id);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (event_type);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (event_type);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (event_type);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (channel);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (channel);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (channel);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (role);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (role);
ALTER TABLE public.notif_templates ADD CONSTRAINT notif_templates_event_type_channel_role_key UNIQUE (role);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.user_profiles(id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.user_profiles(id);
ALTER TABLE public.notifications ADD PRIMARY KEY (id);
ALTER TABLE public.parents ADD CONSTRAINT parents_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.parents ADD CONSTRAINT parents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
ALTER TABLE public.parents ADD PRIMARY KEY (id);
ALTER TABLE public.parents ADD CONSTRAINT parents_user_id_key UNIQUE (user_id);
ALTER TABLE public.role_capabilities ADD CONSTRAINT role_capabilities_capability_id_fkey FOREIGN KEY (capability_id) REFERENCES public.capabilities(id);
ALTER TABLE public.role_capabilities ADD CONSTRAINT role_capabilities_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
ALTER TABLE public.role_capabilities ADD PRIMARY KEY (id);
ALTER TABLE public.role_capabilities ADD CONSTRAINT role_capabilities_role_id_capability_id_key UNIQUE (capability_id);
ALTER TABLE public.role_capabilities ADD CONSTRAINT role_capabilities_role_id_capability_id_key UNIQUE (capability_id);
ALTER TABLE public.role_capabilities ADD CONSTRAINT role_capabilities_role_id_capability_id_key UNIQUE (role_id);
ALTER TABLE public.role_capabilities ADD CONSTRAINT role_capabilities_role_id_capability_id_key UNIQUE (role_id);
ALTER TABLE public.roles ADD CONSTRAINT roles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.roles ADD PRIMARY KEY (id);
ALTER TABLE public.roles ADD CONSTRAINT roles_school_id_name_key UNIQUE (school_id);
ALTER TABLE public.roles ADD CONSTRAINT roles_school_id_name_key UNIQUE (name);
ALTER TABLE public.roles ADD CONSTRAINT roles_school_id_name_key UNIQUE (school_id);
ALTER TABLE public.roles ADD CONSTRAINT roles_school_id_name_key UNIQUE (name);
ALTER TABLE public.schedule_slots ADD CONSTRAINT schedule_slots_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.schedule_slots ADD PRIMARY KEY (id);
ALTER TABLE public.school_domains ADD CONSTRAINT school_domains_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.school_domains ADD PRIMARY KEY (id);
ALTER TABLE public.school_domains ADD CONSTRAINT school_domains_domain_key UNIQUE (domain);
ALTER TABLE public.schools ADD PRIMARY KEY (id);
ALTER TABLE public.schools ADD CONSTRAINT schools_code_key UNIQUE (code);
ALTER TABLE public.schools ADD CONSTRAINT schools_slug_key UNIQUE (slug);
ALTER TABLE public.student_parents ADD CONSTRAINT student_parents_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id);
ALTER TABLE public.student_parents ADD CONSTRAINT student_parents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
ALTER TABLE public.student_parents ADD PRIMARY KEY (id);
ALTER TABLE public.student_parents ADD CONSTRAINT student_parents_student_id_parent_id_key UNIQUE (parent_id);
ALTER TABLE public.student_parents ADD CONSTRAINT student_parents_student_id_parent_id_key UNIQUE (parent_id);
ALTER TABLE public.student_parents ADD CONSTRAINT student_parents_student_id_parent_id_key UNIQUE (student_id);
ALTER TABLE public.student_parents ADD CONSTRAINT student_parents_student_id_parent_id_key UNIQUE (student_id);
ALTER TABLE public.students ADD CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.students ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
ALTER TABLE public.students ADD PRIMARY KEY (id);
ALTER TABLE public.students ADD CONSTRAINT students_school_id_student_code_key UNIQUE (student_code);
ALTER TABLE public.students ADD CONSTRAINT students_school_id_student_code_key UNIQUE (student_code);
ALTER TABLE public.students ADD CONSTRAINT students_school_id_student_code_key UNIQUE (school_id);
ALTER TABLE public.students ADD CONSTRAINT students_school_id_student_code_key UNIQUE (school_id);
ALTER TABLE public.students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
ALTER TABLE public.teachers ADD PRIMARY KEY (id);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_school_id_employee_code_key UNIQUE (employee_code);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_school_id_employee_code_key UNIQUE (school_id);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_school_id_employee_code_key UNIQUE (school_id);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_school_id_employee_code_key UNIQUE (employee_code);
ALTER TABLE public.teachers ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.null(null);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
ALTER TABLE public.user_profiles ADD PRIMARY KEY (id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.user_profiles(id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id);
ALTER TABLE public.user_roles ADD PRIMARY KEY (id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (role_id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (role_id);



-- INDEXES
CREATE UNIQUE INDEX attendance_records_class_id_student_id_attendance_date_key ON public.attendance_records USING btree (class_id, student_id, attendance_date);
CREATE UNIQUE INDEX capabilities_name_key ON public.capabilities USING btree (name);
CREATE INDEX idx_class_sessions_class_id ON public.class_sessions USING btree (class_id);
CREATE INDEX idx_class_sessions_school_date ON public.class_sessions USING btree (school_id, session_date);
CREATE INDEX idx_class_sessions_teacher_id ON public.class_sessions USING btree (teacher_id);
CREATE UNIQUE INDEX classes_school_id_code_key ON public.classes USING btree (school_id, code);
CREATE UNIQUE INDEX courses_school_id_code_key ON public.courses USING btree (school_id, code);
CREATE UNIQUE INDEX enrollments_class_id_student_id_key ON public.enrollments USING btree (class_id, student_id);
CREATE UNIQUE INDEX notif_events_event_type_key ON public.notif_events USING btree (event_type);
CREATE UNIQUE INDEX notif_subscriptions_user_id_event_type_key ON public.notif_subscriptions USING btree (user_id, event_type);
CREATE UNIQUE INDEX notif_templates_event_type_channel_role_key ON public.notif_templates USING btree (event_type, channel, role);
CREATE UNIQUE INDEX parents_user_id_key ON public.parents USING btree (user_id);
CREATE UNIQUE INDEX role_capabilities_role_id_capability_id_key ON public.role_capabilities USING btree (role_id, capability_id);
CREATE UNIQUE INDEX roles_school_id_name_key ON public.roles USING btree (school_id, name);
CREATE INDEX idx_schedule_slots_school_id ON public.schedule_slots USING btree (school_id, sort_order);
CREATE UNIQUE INDEX idx_school_domains_one_primary ON public.school_domains USING btree (school_id, is_primary) WHERE (is_primary = true);
CREATE UNIQUE INDEX school_domains_domain_key ON public.school_domains USING btree (domain);
CREATE INDEX idx_schools_slug ON public.schools USING btree (slug);
CREATE UNIQUE INDEX schools_code_key ON public.schools USING btree (code);
CREATE UNIQUE INDEX schools_slug_key ON public.schools USING btree (slug);
CREATE UNIQUE INDEX student_parents_student_id_parent_id_key ON public.student_parents USING btree (student_id, parent_id);
CREATE UNIQUE INDEX students_school_id_student_code_key ON public.students USING btree (school_id, student_code);
CREATE UNIQUE INDEX students_user_id_key ON public.students USING btree (user_id);
CREATE UNIQUE INDEX teachers_school_id_employee_code_key ON public.teachers USING btree (school_id, employee_code);
CREATE UNIQUE INDEX teachers_user_id_key ON public.teachers USING btree (user_id);
CREATE UNIQUE INDEX user_roles_user_id_role_id_key ON public.user_roles USING btree (user_id, role_id);


-- RLS POLICIES
-- Table: attendance_records | Policy: Attendance context-aware access | Cmd: SELECT
CREATE POLICY "Attendance context-aware access" ON public.attendance_records
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))) AND ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['admin'::text, 'it_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (classes c
     JOIN teachers t ON ((t.id = c.teacher_id)))
  WHERE ((c.id = attendance_records.class_id) AND (t.user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM students s
  WHERE ((s.id = attendance_records.student_id) AND (s.user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM (student_parents sp
     JOIN parents p ON ((p.id = sp.parent_id)))
  WHERE ((sp.student_id = attendance_records.student_id) AND (p.user_id = ( SELECT auth.uid() AS uid))))))));

-- Table: attendance_records | Policy: Attendance delete | Cmd: DELETE
CREATE POLICY "Attendance delete" ON public.attendance_records
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = attendance_records.school_id))))));

-- Table: attendance_records | Policy: Attendance insert | Cmd: INSERT
CREATE POLICY "Attendance insert" ON public.attendance_records
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK (((EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = attendance_records.school_id))))) OR (EXISTS ( SELECT 1
   FROM (teachers t
     JOIN classes c ON ((c.teacher_id = t.id)))
  WHERE ((t.user_id = ( SELECT auth.uid() AS uid)) AND (c.id = attendance_records.class_id))))));

-- Table: attendance_records | Policy: Attendance update | Cmd: UPDATE
CREATE POLICY "Attendance update" ON public.attendance_records
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING (((EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = attendance_records.school_id))))) OR (EXISTS ( SELECT 1
   FROM (teachers t
     JOIN classes c ON ((c.teacher_id = t.id)))
  WHERE ((t.user_id = ( SELECT auth.uid() AS uid)) AND (c.id = attendance_records.class_id))))));

-- Table: capabilities | Policy: Capabilities public read | Cmd: SELECT
CREATE POLICY "Capabilities public read" ON public.capabilities
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (true);

-- Table: class_sessions | Policy: Class sessions delete | Cmd: DELETE
CREATE POLICY "Class sessions delete" ON public.class_sessions
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = class_sessions.school_id))))));

-- Table: class_sessions | Policy: Class sessions insert | Cmd: INSERT
CREATE POLICY "Class sessions insert" ON public.class_sessions
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK (((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = class_sessions.school_id))))) OR (EXISTS ( SELECT 1
   FROM teachers
  WHERE ((teachers.user_id = ( SELECT auth.uid() AS uid)) AND (teachers.id = class_sessions.teacher_id) AND (teachers.school_id = class_sessions.school_id))))));

-- Table: class_sessions | Policy: Class sessions select | Cmd: SELECT
CREATE POLICY "Class sessions select" ON public.class_sessions
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text, 'staff'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = class_sessions.school_id))))) OR (EXISTS ( SELECT 1
   FROM teachers
  WHERE ((teachers.user_id = ( SELECT auth.uid() AS uid)) AND (teachers.id = class_sessions.teacher_id)))) OR (EXISTS ( SELECT 1
   FROM ((parents p
     JOIN student_parents sp ON ((sp.parent_id = p.id)))
     JOIN enrollments e ON ((e.student_id = sp.student_id)))
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (e.class_id = class_sessions.class_id) AND (e.status = 'active'::text))))));

-- Table: class_sessions | Policy: Class sessions update | Cmd: UPDATE
CREATE POLICY "Class sessions update" ON public.class_sessions
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING (((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = class_sessions.school_id))))) OR (EXISTS ( SELECT 1
   FROM teachers
  WHERE ((teachers.user_id = ( SELECT auth.uid() AS uid)) AND (teachers.id = class_sessions.teacher_id))))));

-- Table: class_sessions | Policy: class_sessions delete | Cmd: DELETE
CREATE POLICY "class_sessions delete" ON public.class_sessions
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['admin'::text, 'super_admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = class_sessions.school_id))))));

-- Table: class_sessions | Policy: class_sessions insert | Cmd: INSERT
CREATE POLICY "class_sessions insert" ON public.class_sessions
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK (((teacher_id IN ( SELECT teachers.id
   FROM teachers
  WHERE (teachers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['admin'::text, 'super_admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = class_sessions.school_id)))))));

-- Table: class_sessions | Policy: class_sessions select | Cmd: SELECT
CREATE POLICY "class_sessions select" ON public.class_sessions
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((teacher_id IN ( SELECT teachers.id
   FROM teachers
  WHERE (teachers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['admin'::text, 'super_admin'::text, 'it_admin'::text, 'staff'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = class_sessions.school_id)))))));

-- Table: class_sessions | Policy: class_sessions update | Cmd: UPDATE
CREATE POLICY "class_sessions update" ON public.class_sessions
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING (((teacher_id IN ( SELECT teachers.id
   FROM teachers
  WHERE (teachers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['admin'::text, 'super_admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = class_sessions.school_id)))))));

-- Table: classes | Policy: Classes context-aware access | Cmd: SELECT
CREATE POLICY "Classes context-aware access" ON public.classes
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))) AND ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['admin'::text, 'it_admin'::text, 'super_admin'::text]))))) OR (teacher_id IN ( SELECT teachers.id
   FROM teachers
  WHERE (teachers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM students
  WHERE ((students.user_id = ( SELECT auth.uid() AS uid)) AND (students.school_id = classes.school_id)))) OR (EXISTS ( SELECT 1
   FROM parents
  WHERE ((parents.user_id = ( SELECT auth.uid() AS uid)) AND (parents.school_id = classes.school_id)))))));

-- Table: classes | Policy: Classes delete | Cmd: DELETE
CREATE POLICY "Classes delete" ON public.classes
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = classes.school_id))))));

-- Table: classes | Policy: Classes insert | Cmd: INSERT
CREATE POLICY "Classes insert" ON public.classes
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = classes.school_id))))));

-- Table: classes | Policy: Classes update | Cmd: UPDATE
CREATE POLICY "Classes update" ON public.classes
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = classes.school_id))))));

-- Table: courses | Policy: Courses delete | Cmd: DELETE
CREATE POLICY "Courses delete" ON public.courses
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = courses.school_id))))));

-- Table: courses | Policy: Courses insert | Cmd: INSERT
CREATE POLICY "Courses insert" ON public.courses
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = courses.school_id))))));

-- Table: courses | Policy: Courses school access | Cmd: SELECT
CREATE POLICY "Courses school access" ON public.courses
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = 'super_admin'::text)))) OR (school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid))))));

-- Table: courses | Policy: Courses update | Cmd: UPDATE
CREATE POLICY "Courses update" ON public.courses
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = courses.school_id))))));

-- Table: enrollments | Policy: Enrollments context-aware access | Cmd: SELECT
CREATE POLICY "Enrollments context-aware access" ON public.enrollments
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))) AND ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['admin'::text, 'it_admin'::text, 'super_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM teachers
  WHERE ((teachers.user_id = ( SELECT auth.uid() AS uid)) AND (teachers.school_id = enrollments.school_id)))) OR (EXISTS ( SELECT 1
   FROM students
  WHERE ((students.id = enrollments.student_id) AND (students.user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM (student_parents sp
     JOIN parents p ON ((p.id = sp.parent_id)))
  WHERE ((sp.student_id = enrollments.student_id) AND (p.user_id = ( SELECT auth.uid() AS uid))))))));

-- Table: enrollments | Policy: Enrollments delete | Cmd: DELETE
CREATE POLICY "Enrollments delete" ON public.enrollments
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = enrollments.school_id))))));

-- Table: enrollments | Policy: Enrollments insert | Cmd: INSERT
CREATE POLICY "Enrollments insert" ON public.enrollments
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = enrollments.school_id))))));

-- Table: enrollments | Policy: Enrollments update | Cmd: UPDATE
CREATE POLICY "Enrollments update" ON public.enrollments
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = enrollments.school_id))))));

-- Table: notif_delivery_log | Policy: Users view own delivery logs | Cmd: SELECT
CREATE POLICY "Users view own delivery logs" ON public.notif_delivery_log
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM notif_queue nq
  WHERE ((nq.id = notif_delivery_log.notification_id) AND (nq.user_id = ( SELECT auth.uid() AS uid))))));

-- Table: notif_events | Policy: Anyone can view events | Cmd: SELECT
CREATE POLICY "Anyone can view events" ON public.notif_events
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (true);

-- Table: notif_queue | Policy: Users update own notifications | Cmd: UPDATE
CREATE POLICY "Users update own notifications" ON public.notif_queue
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((user_id = ( SELECT auth.uid() AS uid)));
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

-- Table: notif_queue | Policy: Users view own notifications | Cmd: SELECT
CREATE POLICY "Users view own notifications" ON public.notif_queue
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((user_id = ( SELECT auth.uid() AS uid)));

-- Table: notif_subscriptions | Policy: Users delete own subscriptions | Cmd: DELETE
CREATE POLICY "Users delete own subscriptions" ON public.notif_subscriptions
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((user_id = ( SELECT auth.uid() AS uid)));

-- Table: notif_subscriptions | Policy: Users insert own subscriptions | Cmd: INSERT
CREATE POLICY "Users insert own subscriptions" ON public.notif_subscriptions
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

-- Table: notif_subscriptions | Policy: Users update own subscriptions | Cmd: UPDATE
CREATE POLICY "Users update own subscriptions" ON public.notif_subscriptions
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((user_id = ( SELECT auth.uid() AS uid)));
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

-- Table: notif_subscriptions | Policy: Users view own subscriptions | Cmd: SELECT
CREATE POLICY "Users view own subscriptions" ON public.notif_subscriptions
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((user_id = ( SELECT auth.uid() AS uid)));

-- Table: notif_templates | Policy: Anyone can view templates | Cmd: SELECT
CREATE POLICY "Anyone can view templates" ON public.notif_templates
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (true);

-- Table: notifications | Policy: Users see own notifications | Cmd: SELECT
CREATE POLICY "Users see own notifications" ON public.notifications
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((recipient_id = ( SELECT auth.uid() AS uid)));

-- Table: parents | Policy: Parents context-aware access | Cmd: SELECT
CREATE POLICY "Parents context-aware access" ON public.parents
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))) AND ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['admin'::text, 'it_admin'::text]))))) OR (user_id = ( SELECT auth.uid() AS uid)))));

-- Table: parents | Policy: Parents delete | Cmd: DELETE
CREATE POLICY "Parents delete" ON public.parents
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = parents.school_id))))));

-- Table: parents | Policy: Parents insert | Cmd: INSERT
CREATE POLICY "Parents insert" ON public.parents
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = parents.school_id))))));

-- Table: parents | Policy: Parents update | Cmd: UPDATE
CREATE POLICY "Parents update" ON public.parents
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = parents.school_id))))));

-- Table: role_capabilities | Policy: Role capabilities school access | Cmd: SELECT
CREATE POLICY "Role capabilities school access" ON public.role_capabilities
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM roles r
  WHERE ((r.id = role_capabilities.role_id) AND (r.school_id IN ( SELECT user_profiles.school_id
           FROM user_profiles
          WHERE (user_profiles.id = ( SELECT auth.uid() AS uid))))))));

-- Table: roles | Policy: Roles school access | Cmd: SELECT
CREATE POLICY "Roles school access" ON public.roles
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))));

-- Table: schedule_slots | Policy: schedule_slots_select | Cmd: SELECT
CREATE POLICY "schedule_slots_select" ON public.schedule_slots
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = schedule_slots.school_id))))));

-- Table: schedule_slots | Policy: schedule_slots_write | Cmd: ALL
CREATE POLICY "schedule_slots_write" ON public.schedule_slots
  AS PERMISSIVE FOR ALL
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = schedule_slots.school_id))))));
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = schedule_slots.school_id))))));

-- Table: school_domains | Policy: School admins manage domains | Cmd: ALL
CREATE POLICY "School admins manage domains" ON public.school_domains
  AS PERMISSIVE FOR ALL
  TO {authenticated}
  USING (((school_id = get_user_school_id()) OR is_super_admin()));
  WITH CHECK (((school_id = get_user_school_id()) OR is_super_admin()));

-- Table: schools | Policy: Schools delete | Cmd: DELETE
CREATE POLICY "Schools delete" ON public.schools
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text]))))));

-- Table: schools | Policy: Schools insert | Cmd: INSERT
CREATE POLICY "Schools insert" ON public.schools
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text]))))));

-- Table: schools | Policy: Schools update | Cmd: UPDATE
CREATE POLICY "Schools update" ON public.schools
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text]))))));

-- Table: schools | Policy: Users access own school | Cmd: SELECT
CREATE POLICY "Users access own school" ON public.schools
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))));

-- Table: student_parents | Policy: Student parents context-aware access | Cmd: SELECT
CREATE POLICY "Student parents context-aware access" ON public.student_parents
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['admin'::text, 'it_admin'::text, 'super_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM (teachers t
     JOIN parents p ON ((p.id = student_parents.parent_id)))
  WHERE ((t.user_id = ( SELECT auth.uid() AS uid)) AND (t.school_id = p.school_id)))) OR (parent_id IN ( SELECT parents.id
   FROM parents
  WHERE (parents.user_id = ( SELECT auth.uid() AS uid))))));

-- Table: student_parents | Policy: Student parents delete | Cmd: DELETE
CREATE POLICY "Student parents delete" ON public.student_parents
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN parents p ON ((p.id = student_parents.parent_id)))
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = p.school_id))))));

-- Table: student_parents | Policy: Student parents insert | Cmd: INSERT
CREATE POLICY "Student parents insert" ON public.student_parents
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN parents p ON ((p.id = student_parents.parent_id)))
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = p.school_id))))));

-- Table: student_parents | Policy: Student parents update | Cmd: UPDATE
CREATE POLICY "Student parents update" ON public.student_parents
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN parents p ON ((p.id = student_parents.parent_id)))
  WHERE ((up.id = ( SELECT auth.uid() AS uid)) AND (up.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((up.user_type = 'super_admin'::text) OR (up.school_id = p.school_id))))));

-- Table: students | Policy: Students context-aware access | Cmd: SELECT
CREATE POLICY "Students context-aware access" ON public.students
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid)))) AND ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['admin'::text, 'it_admin'::text, 'super_admin'::text]))))) OR (EXISTS ( SELECT 1
   FROM teachers
  WHERE ((teachers.user_id = ( SELECT auth.uid() AS uid)) AND (teachers.school_id = students.school_id)))) OR (user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM parents
  WHERE ((parents.user_id = ( SELECT auth.uid() AS uid)) AND (parents.school_id = students.school_id)))))));

-- Table: students | Policy: Students delete | Cmd: DELETE
CREATE POLICY "Students delete" ON public.students
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = students.school_id))))));

-- Table: students | Policy: Students insert | Cmd: INSERT
CREATE POLICY "Students insert" ON public.students
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = students.school_id))))));

-- Table: students | Policy: Students update | Cmd: UPDATE
CREATE POLICY "Students update" ON public.students
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = students.school_id))))));

-- Table: teachers | Policy: Teachers delete | Cmd: DELETE
CREATE POLICY "Teachers delete" ON public.teachers
  AS PERMISSIVE FOR DELETE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = teachers.school_id))))));

-- Table: teachers | Policy: Teachers insert | Cmd: INSERT
CREATE POLICY "Teachers insert" ON public.teachers
  AS PERMISSIVE FOR INSERT
  TO {authenticated}
  USING (true);
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = teachers.school_id))))));

-- Table: teachers | Policy: Teachers school access | Cmd: SELECT
CREATE POLICY "Teachers school access" ON public.teachers
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = 'super_admin'::text)))) OR (school_id IN ( SELECT user_profiles.school_id
   FROM user_profiles
  WHERE (user_profiles.id = ( SELECT auth.uid() AS uid))))));

-- Table: teachers | Policy: Teachers update | Cmd: UPDATE
CREATE POLICY "Teachers update" ON public.teachers
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = ( SELECT auth.uid() AS uid)) AND (user_profiles.user_type = ANY (ARRAY['super_admin'::text, 'it_admin'::text, 'admin'::text])) AND ((user_profiles.user_type = 'super_admin'::text) OR (user_profiles.school_id = teachers.school_id))))));

-- Table: user_profiles | Policy: Users update own profile | Cmd: UPDATE
CREATE POLICY "Users update own profile" ON public.user_profiles
  AS PERMISSIVE FOR UPDATE
  TO {authenticated}
  USING ((id = ( SELECT auth.uid() AS uid)));
  WITH CHECK ((id = ( SELECT auth.uid() AS uid)));

-- Table: user_profiles | Policy: Users view school profiles | Cmd: SELECT
CREATE POLICY "Users view school profiles" ON public.user_profiles
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING (((id = auth.uid()) OR (school_id = get_user_school_id()) OR is_super_admin()));

-- Table: user_roles | Policy: User roles school access | Cmd: SELECT
CREATE POLICY "User roles school access" ON public.user_roles
  AS PERMISSIVE FOR SELECT
  TO {authenticated}
  USING ((EXISTS ( SELECT 1
   FROM user_profiles up
  WHERE ((up.id = user_roles.user_id) AND (up.school_id IN ( SELECT user_profiles.school_id
           FROM user_profiles
          WHERE (user_profiles.id = ( SELECT auth.uid() AS uid))))))));



-- TRIGGERS
-- BEFORE UPDATE ON attendance_records: update_attendance_records_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON class_sessions: set_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON classes: update_classes_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON courses: update_courses_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON enrollments: update_enrollments_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON parents: update_parents_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON roles: update_roles_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON school_domains: set_school_domains_updated_at
EXECUTE FUNCTION update_school_domains_updated_at()

-- BEFORE UPDATE ON schools: update_schools_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON students: update_students_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON teachers: update_teachers_updated_at
EXECUTE FUNCTION update_updated_at_column()

-- BEFORE UPDATE ON user_profiles: update_user_profiles_updated_at
EXECUTE FUNCTION update_updated_at_column()



-- FUNCTIONS
-- Function: get_parent_children

BEGIN
  RETURN QUERY
  SELECT sp.student_id
  FROM student_parents sp
  WHERE sp.parent_id = p_parent_id;
END;


-- Function: get_teacher_classes

BEGIN
  RETURN QUERY
  SELECT c.id
  FROM classes c
  WHERE c.teacher_id = p_teacher_id;
END;


-- Function: get_user_capabilities

BEGIN
  RETURN QUERY
  SELECT DISTINCT c.name
  FROM capabilities c
  JOIN role_capabilities rc ON rc.capability_id = c.id
  JOIN user_roles ur ON ur.role_id = rc.role_id
  WHERE ur.user_id = p_user_id;
END;


-- Function: get_user_school_id

  SELECT school_id FROM user_profiles WHERE id = auth.uid()


-- Function: has_feature

      DECLARE
        school_id_var uuid;
        features_var jsonb;
      BEGIN
        SELECT school_id INTO school_id_var
        FROM user_profiles WHERE id = auth.uid();
        
        IF school_id_var IS NULL THEN
          RETURN false;
        END IF;
        
        SELECT features INTO features_var
        FROM schools WHERE id = school_id_var;
        
        RETURN COALESCE((features_var->feature_name->>'enabled')::boolean, false);
      END;
      

-- Function: has_feature

DECLARE
  v_features jsonb;
  v_feature_config jsonb;
BEGIN
  SELECT features INTO v_features
  FROM schools
  WHERE id = p_school_id;

  IF v_features IS NULL THEN
    RETURN false;
  END IF;

  v_feature_config := v_features -> p_feature;

  IF v_feature_config IS NULL THEN
    RETURN false;
  END IF;

  IF p_sub_feature IS NOT NULL THEN
    RETURN COALESCE((v_feature_config -> p_sub_feature)::boolean, false);
  ELSE
    RETURN COALESCE((v_feature_config -> 'enabled')::boolean, false);
  END 

-- Function: has_feature

DECLARE
  tier text;
BEGIN
  SELECT subscription_tier INTO tier
  FROM schools
  WHERE id = school_uuid;
  
  IF tier IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM feature_flags
    WHERE feature = feature_name
      AND enabled_tiers @> ARRAY[tier]::text[]
      AND is_active = true
  );
END;


-- Function: is_student_in_teacher_class

BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments e
    JOIN classes c ON c.id = e.class_id
    WHERE c.teacher_id = p_teacher_id
    AND e.student_id = p_student_id
    AND e.status = 'active'
  );
END;


-- Function: is_student_linked_to_parent

BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_parents
    WHERE student_id = p_student_id
    AND parent_id = p_parent_id
  );
END;


-- Function: is_super_admin

  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND user_type = 'super_admin'
  )


-- Function: rls_auto_enable

DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table

-- Function: slugify

      BEGIN
        RETURN lower(regexp_replace($1, '[^a-zA-Z0-9]+', '-', 'g'));
      END;
      

-- Function: update_school_domains_updated_at

      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      

-- Function: update_updated_at_column

BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;


-- Function: user_has_capability

BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_user_capabilities(p_user_id)
    WHERE capability_name = p_capability
  );
END;


