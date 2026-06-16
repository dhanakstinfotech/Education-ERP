/*
# Examination ERP - Full Database Schema

## Overview
Single-tenant public schema for a university Examination Management ERP.
No auth required — anon key can read/write all tables.

## Tables Created

### 1. departments
Stores academic departments (CSE, ECE, etc.)

### 2. programs
Degree programs (B.Tech CSE, M.Tech, MBA etc.) linked to departments.

### 3. academic_years
Academic year records (e.g., 2024-25).

### 4. semesters
Semesters linked to academic years.

### 5. exam_types
Types of exams: Internal Assessment, End Semester Exam, etc.

### 6. subjects
All subjects with credit info, linked to programs, departments, semesters.

### 7. students
Student records with program/semester enrollment.

### 8. exam_rooms
Physical exam rooms with capacity and facilities.

### 9. registrations
Exam registrations per student per exam cycle.

### 10. arrear_registrations
Arrear (repeat) exam registrations for students who failed.

### 11. eligibility_checks
Per-student eligibility status tracking (attendance, fee, internal marks).

### 12. hall_tickets
Generated hall tickets per student.

### 13. hall_ticket_subjects
Subjects listed on each hall ticket with exam date/time/venue.

### 14. seat_allocations
Student-to-room-to-seat mapping for exams.

### 15. question_papers
Question paper metadata linked to subjects.

### 16. questions
Individual questions in the question bank.

### 17. mark_entries
Internal + external marks per student per subject.

### 18. results
Final computed results per student per semester.

### 19. result_subjects
Per-subject result breakdown inside a result record.

### 20. reports
Audit log of generated reports.

## Security
All tables use RLS with anon+authenticated policies (USING true) since this
is a single-tenant admin ERP with no per-user isolation requirement.
*/

-- ───────────────────────── DEPARTMENTS ─────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dept_select" ON departments;
CREATE POLICY "dept_select" ON departments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dept_insert" ON departments;
CREATE POLICY "dept_insert" ON departments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dept_update" ON departments;
CREATE POLICY "dept_update" ON departments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "dept_delete" ON departments;
CREATE POLICY "dept_delete" ON departments FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── PROGRAMS ─────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  duration_years int NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prog_select" ON programs;
CREATE POLICY "prog_select" ON programs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "prog_insert" ON programs;
CREATE POLICY "prog_insert" ON programs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "prog_update" ON programs;
CREATE POLICY "prog_update" ON programs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "prog_delete" ON programs;
CREATE POLICY "prog_delete" ON programs FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── ACADEMIC YEARS ─────────────────────────
CREATE TABLE IF NOT EXISTS academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ay_select" ON academic_years;
CREATE POLICY "ay_select" ON academic_years FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ay_insert" ON academic_years;
CREATE POLICY "ay_insert" ON academic_years FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ay_update" ON academic_years;
CREATE POLICY "ay_update" ON academic_years FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ay_delete" ON academic_years;
CREATE POLICY "ay_delete" ON academic_years FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── SEMESTERS ─────────────────────────
CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sem_select" ON semesters;
CREATE POLICY "sem_select" ON semesters FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sem_insert" ON semesters;
CREATE POLICY "sem_insert" ON semesters FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sem_update" ON semesters;
CREATE POLICY "sem_update" ON semesters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sem_delete" ON semesters;
CREATE POLICY "sem_delete" ON semesters FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── EXAM TYPES ─────────────────────────
CREATE TABLE IF NOT EXISTS exam_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  max_marks int NOT NULL DEFAULT 100,
  passing_marks int NOT NULL DEFAULT 40,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "et_select" ON exam_types;
CREATE POLICY "et_select" ON exam_types FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "et_insert" ON exam_types;
CREATE POLICY "et_insert" ON exam_types FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "et_update" ON exam_types;
CREATE POLICY "et_update" ON exam_types FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "et_delete" ON exam_types;
CREATE POLICY "et_delete" ON exam_types FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── SUBJECTS ─────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  credits int NOT NULL DEFAULT 3,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  semester_number int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sub_select" ON subjects;
CREATE POLICY "sub_select" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sub_insert" ON subjects;
CREATE POLICY "sub_insert" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sub_update" ON subjects;
CREATE POLICY "sub_update" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sub_delete" ON subjects;
CREATE POLICY "sub_delete" ON subjects FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── STUDENTS ─────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
  current_semester int NOT NULL DEFAULT 1,
  attendance_pct numeric(5,2) DEFAULT 0,
  fee_due numeric(10,2) DEFAULT 0,
  internal_marks_pct numeric(5,2) DEFAULT 0,
  eligibility_status text NOT NULL DEFAULT 'pending' CHECK (eligibility_status IN ('pending','approved','rejected')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_program_id ON students(program_id);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stu_select" ON students;
CREATE POLICY "stu_select" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "stu_insert" ON students;
CREATE POLICY "stu_insert" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "stu_update" ON students;
CREATE POLICY "stu_update" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "stu_delete" ON students;
CREATE POLICY "stu_delete" ON students FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── EXAM ROOMS ─────────────────────────
CREATE TABLE IF NOT EXISTS exam_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  building text NOT NULL,
  floor text NOT NULL DEFAULT 'Ground',
  capacity int NOT NULL DEFAULT 40,
  facilities text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE exam_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "room_select" ON exam_rooms;
CREATE POLICY "room_select" ON exam_rooms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "room_insert" ON exam_rooms;
CREATE POLICY "room_insert" ON exam_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "room_update" ON exam_rooms;
CREATE POLICY "room_update" ON exam_rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "room_delete" ON exam_rooms;
CREATE POLICY "room_delete" ON exam_rooms FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── REGISTRATIONS ─────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
  semester_number int NOT NULL,
  exam_type_id uuid REFERENCES exam_types(id) ON DELETE SET NULL,
  subject_ids uuid[] DEFAULT '{}',
  fee_amount numeric(10,2) NOT NULL DEFAULT 0,
  fee_status text NOT NULL DEFAULT 'pending' CHECK (fee_status IN ('paid','pending','waived')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  registered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reg_student_id ON registrations(student_id);
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reg_select" ON registrations;
CREATE POLICY "reg_select" ON registrations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "reg_insert" ON registrations;
CREATE POLICY "reg_insert" ON registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "reg_update" ON registrations;
CREATE POLICY "reg_update" ON registrations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "reg_delete" ON registrations;
CREATE POLICY "reg_delete" ON registrations FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── ARREAR REGISTRATIONS ─────────────────────────
CREATE TABLE IF NOT EXISTS arrear_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  original_semester int NOT NULL,
  attempt_number int NOT NULL DEFAULT 2,
  fee_amount numeric(10,2) NOT NULL DEFAULT 600,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE arrear_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "arrear_select" ON arrear_registrations;
CREATE POLICY "arrear_select" ON arrear_registrations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "arrear_insert" ON arrear_registrations;
CREATE POLICY "arrear_insert" ON arrear_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "arrear_update" ON arrear_registrations;
CREATE POLICY "arrear_update" ON arrear_registrations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "arrear_delete" ON arrear_registrations;
CREATE POLICY "arrear_delete" ON arrear_registrations FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── HALL TICKETS ─────────────────────────
CREATE TABLE IF NOT EXISTS hall_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
  semester_number int NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','generated','downloaded')),
  qr_code text,
  generated_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ht_student_id ON hall_tickets(student_id);
ALTER TABLE hall_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ht_select" ON hall_tickets;
CREATE POLICY "ht_select" ON hall_tickets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ht_insert" ON hall_tickets;
CREATE POLICY "ht_insert" ON hall_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ht_update" ON hall_tickets;
CREATE POLICY "ht_update" ON hall_tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ht_delete" ON hall_tickets;
CREATE POLICY "ht_delete" ON hall_tickets FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── HALL TICKET SUBJECTS ─────────────────────────
CREATE TABLE IF NOT EXISTS hall_ticket_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_ticket_id uuid REFERENCES hall_tickets(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  exam_time text NOT NULL DEFAULT '09:00 - 12:00',
  venue text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hall_ticket_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hts_select" ON hall_ticket_subjects;
CREATE POLICY "hts_select" ON hall_ticket_subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "hts_insert" ON hall_ticket_subjects;
CREATE POLICY "hts_insert" ON hall_ticket_subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "hts_update" ON hall_ticket_subjects;
CREATE POLICY "hts_update" ON hall_ticket_subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "hts_delete" ON hall_ticket_subjects;
CREATE POLICY "hts_delete" ON hall_ticket_subjects FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── SEAT ALLOCATIONS ─────────────────────────
CREATE TABLE IF NOT EXISTS seat_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  room_id uuid REFERENCES exam_rooms(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  seat_number text NOT NULL,
  exam_date date NOT NULL,
  exam_session text NOT NULL DEFAULT 'morning' CHECK (exam_session IN ('morning','afternoon')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seat_room_id ON seat_allocations(room_id);
ALTER TABLE seat_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seat_select" ON seat_allocations;
CREATE POLICY "seat_select" ON seat_allocations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "seat_insert" ON seat_allocations;
CREATE POLICY "seat_insert" ON seat_allocations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "seat_update" ON seat_allocations;
CREATE POLICY "seat_update" ON seat_allocations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "seat_delete" ON seat_allocations;
CREATE POLICY "seat_delete" ON seat_allocations FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── QUESTION PAPERS ─────────────────────────
CREATE TABLE IF NOT EXISTS question_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  total_marks int NOT NULL DEFAULT 80,
  duration_hours int NOT NULL DEFAULT 3,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','finalized')),
  created_by text NOT NULL DEFAULT 'Faculty',
  approved_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "qp_select" ON question_papers;
CREATE POLICY "qp_select" ON question_papers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "qp_insert" ON question_papers;
CREATE POLICY "qp_insert" ON question_papers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "qp_update" ON question_papers;
CREATE POLICY "qp_update" ON question_papers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "qp_delete" ON question_papers;
CREATE POLICY "qp_delete" ON question_papers FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── QUESTIONS ─────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  marks int NOT NULL DEFAULT 10,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_q_subject_id ON questions(subject_id);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "q_select" ON questions;
CREATE POLICY "q_select" ON questions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "q_insert" ON questions;
CREATE POLICY "q_insert" ON questions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "q_update" ON questions;
CREATE POLICY "q_update" ON questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "q_delete" ON questions;
CREATE POLICY "q_delete" ON questions FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── MARK ENTRIES ─────────────────────────
CREATE TABLE IF NOT EXISTS mark_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
  internal_marks numeric(5,2) DEFAULT 0,
  internal_max int NOT NULL DEFAULT 20,
  external_marks numeric(5,2),
  external_max int NOT NULL DEFAULT 80,
  total_marks numeric(5,2),
  grade text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','verified')),
  UNIQUE (student_id, subject_id, academic_year_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_me_student_id ON mark_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_me_subject_id ON mark_entries(subject_id);
ALTER TABLE mark_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "me_select" ON mark_entries;
CREATE POLICY "me_select" ON mark_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "me_insert" ON mark_entries;
CREATE POLICY "me_insert" ON mark_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "me_update" ON mark_entries;
CREATE POLICY "me_update" ON mark_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "me_delete" ON mark_entries;
CREATE POLICY "me_delete" ON mark_entries FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── REVALUATION REQUESTS ─────────────────────────
CREATE TABLE IF NOT EXISTS revaluation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  original_marks numeric(5,2) NOT NULL,
  revised_marks numeric(5,2),
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','completed','rejected')),
  requested_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE revaluation_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rev_select" ON revaluation_requests;
CREATE POLICY "rev_select" ON revaluation_requests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rev_insert" ON revaluation_requests;
CREATE POLICY "rev_insert" ON revaluation_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rev_update" ON revaluation_requests;
CREATE POLICY "rev_update" ON revaluation_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rev_delete" ON revaluation_requests;
CREATE POLICY "rev_delete" ON revaluation_requests FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── RESULTS ─────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id) ON DELETE SET NULL,
  semester_number int NOT NULL,
  total_marks int NOT NULL DEFAULT 500,
  obtained_marks numeric(7,2) NOT NULL DEFAULT 0,
  percentage numeric(5,2),
  gpa numeric(4,2),
  cgpa numeric(4,2),
  result text NOT NULL DEFAULT 'pending' CHECK (result IN ('pass','fail','absent','pending')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','published')),
  UNIQUE (student_id, academic_year_id, semester_number),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_res_student_id ON results(student_id);
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "res_select" ON results;
CREATE POLICY "res_select" ON results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "res_insert" ON results;
CREATE POLICY "res_insert" ON results FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "res_update" ON results;
CREATE POLICY "res_update" ON results FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "res_delete" ON results;
CREATE POLICY "res_delete" ON results FOR DELETE TO anon, authenticated USING (true);

-- ───────────────────────── REPORTS ─────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  generated_by text NOT NULL DEFAULT 'Admin',
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf','excel')),
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rep_select" ON reports;
CREATE POLICY "rep_select" ON reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rep_insert" ON reports;
CREATE POLICY "rep_insert" ON reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rep_update" ON reports;
CREATE POLICY "rep_update" ON reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rep_delete" ON reports;
CREATE POLICY "rep_delete" ON reports FOR DELETE TO anon, authenticated USING (true);
