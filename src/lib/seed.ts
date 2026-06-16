import { supabase } from './supabase';

// IDs matching what is already in the database (inserted via migration)
const IDS = {
  // Departments (seeded in initial schema migration)
  deptCSE: 'd1000000-0000-0000-0000-000000000001',
  deptECE: 'd1000000-0000-0000-0000-000000000002',
  deptMECH: 'd1000000-0000-0000-0000-000000000003',
  deptCIVIL: 'd1000000-0000-0000-0000-000000000004',
  deptEEE: 'd1000000-0000-0000-0000-000000000005',
  deptMBA: 'd1000000-0000-0000-0000-000000000006',

  // Programs
  progBTechCSE: '00000002-0000-0000-0000-000000000001',
  progBTechECE: '00000002-0000-0000-0000-000000000002',
  progBTechMECH: '00000002-0000-0000-0000-000000000003',
  progMTechCSE: '00000002-0000-0000-0000-000000000004',
  progMBA: '00000002-0000-0000-0000-000000000005',

  // Academic Years
  ay2425: 'a1000000-0000-0000-0000-000000000001',
  ay2324: 'a1000000-0000-0000-0000-000000000002',

  // Exam Types
  etIA1: 'e1000000-0000-0000-0000-000000000001',
  etIA2: 'e1000000-0000-0000-0000-000000000002',
  etESE: 'e1000000-0000-0000-0000-000000000003',
  etMOD: 'e1000000-0000-0000-0000-000000000004',

  // Semesters
  sem1: '00000004-0000-0000-0000-000000000001',
  sem2: '00000004-0000-0000-0000-000000000002',
  sem3: '00000004-0000-0000-0000-000000000003',
  sem4: '00000004-0000-0000-0000-000000000004',
  sem5: '00000004-0000-0000-0000-000000000005',
  sem6: '00000004-0000-0000-0000-000000000006',

  // Subjects (CSE)
  cs201: '00000005-0000-0000-0000-000000000001',
  cs202: '00000005-0000-0000-0000-000000000002',
  cs301: '00000005-0000-0000-0000-000000000003',
  cs302: '00000005-0000-0000-0000-000000000004',
  cs601: '00000005-0000-0000-0000-000000000005',
  cs602: '00000005-0000-0000-0000-000000000006',
  cs603: '00000005-0000-0000-0000-000000000007',
  // Subjects (ECE)
  ec201: '00000005-0000-0000-0000-000000000008',
  ec601: '00000005-0000-0000-0000-000000000009',
  ec602: '00000005-0000-0000-0000-000000000010',

  // Students
  st001: '00000007-0000-0000-0000-000000000001',
  st002: '00000007-0000-0000-0000-000000000002',
  st003: '00000007-0000-0000-0000-000000000003',
  st004: '00000007-0000-0000-0000-000000000004',
  st005: '00000007-0000-0000-0000-000000000005',
  st006: '00000007-0000-0000-0000-000000000006',
  st007: '00000007-0000-0000-0000-000000000007',
  st008: '00000007-0000-0000-0000-000000000008',
  st009: '00000007-0000-0000-0000-000000000009',
  st010: '00000007-0000-0000-0000-000000000010',
  st011: '00000007-0000-0000-0000-000000000011',
  st012: '00000007-0000-0000-0000-000000000012',

  // Rooms
  room101: '00000006-0000-0000-0000-000000000001',
  room102: '00000006-0000-0000-0000-000000000002',
  room201: '00000006-0000-0000-0000-000000000003',
  hallA: '00000006-0000-0000-0000-000000000004',
  hallB: '00000006-0000-0000-0000-000000000005',
};

export async function seedDatabase() {
  // Guard: skip if data already exists (migration already populated everything)
  const { data: existing } = await supabase.from('students').select('id').limit(1);
  if (existing && existing.length > 0) return;

  // Fallback seed — only runs if DB is completely empty.
  // Primary data is seeded via the SQL migration: seed_comprehensive_data

  // Departments
  await supabase.from('departments').upsert([
    { id: IDS.deptCSE, code: 'CSE', name: 'Computer Science & Engineering' },
    { id: IDS.deptECE, code: 'ECE', name: 'Electronics & Communication Engineering' },
    { id: IDS.deptMECH, code: 'MECH', name: 'Mechanical Engineering' },
    { id: IDS.deptCIVIL, code: 'CIVIL', name: 'Civil Engineering' },
    { id: IDS.deptEEE, code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { id: IDS.deptMBA, code: 'MBA', name: 'Master of Business Administration' },
  ], { onConflict: 'id' });

  // Programs
  await supabase.from('programs').upsert([
    { id: IDS.progBTechCSE, code: 'BTECH-CSE', name: 'B.Tech Computer Science', department_id: IDS.deptCSE, duration_years: 4, status: 'active' },
    { id: IDS.progBTechECE, code: 'BTECH-ECE', name: 'B.Tech Electronics', department_id: IDS.deptECE, duration_years: 4, status: 'active' },
    { id: IDS.progBTechMECH, code: 'BTECH-MECH', name: 'B.Tech Mechanical', department_id: IDS.deptMECH, duration_years: 4, status: 'active' },
    { id: IDS.progMTechCSE, code: 'MTECH-CSE', name: 'M.Tech Computer Science', department_id: IDS.deptCSE, duration_years: 2, status: 'active' },
    { id: IDS.progMBA, code: 'MBA-GENERAL', name: 'MBA General Management', department_id: IDS.deptMBA, duration_years: 2, status: 'active' },
  ], { onConflict: 'id' });

  // Academic Years
  await supabase.from('academic_years').upsert([
    { id: IDS.ay2425, name: '2024-25', start_date: '2024-06-01', end_date: '2025-04-30', status: 'active' },
    { id: IDS.ay2324, name: '2023-24', start_date: '2023-06-01', end_date: '2024-04-30', status: 'inactive' },
  ], { onConflict: 'id' });

  // Exam Types
  await supabase.from('exam_types').upsert([
    { id: IDS.etIA1, name: 'Internal Assessment 1', code: 'IA1', max_marks: 20, passing_marks: 8, status: 'active' },
    { id: IDS.etIA2, name: 'Internal Assessment 2', code: 'IA2', max_marks: 20, passing_marks: 8, status: 'active' },
    { id: IDS.etESE, name: 'End Semester Exam', code: 'ESE', max_marks: 80, passing_marks: 32, status: 'active' },
    { id: IDS.etMOD, name: 'Model Examination', code: 'MOD', max_marks: 80, passing_marks: 32, status: 'inactive' },
  ], { onConflict: 'id' });

  // Semesters
  await supabase.from('semesters').upsert([
    { id: IDS.sem1, name: 'Semester 1', academic_year_id: IDS.ay2425, start_date: '2024-06-01', end_date: '2024-11-30', status: 'inactive' },
    { id: IDS.sem2, name: 'Semester 2', academic_year_id: IDS.ay2425, start_date: '2024-12-01', end_date: '2025-04-30', status: 'inactive' },
    { id: IDS.sem3, name: 'Semester 3', academic_year_id: IDS.ay2425, start_date: '2024-06-01', end_date: '2024-11-30', status: 'inactive' },
    { id: IDS.sem4, name: 'Semester 4', academic_year_id: IDS.ay2425, start_date: '2024-12-01', end_date: '2025-04-30', status: 'inactive' },
    { id: IDS.sem5, name: 'Semester 5', academic_year_id: IDS.ay2425, start_date: '2024-06-01', end_date: '2024-11-30', status: 'inactive' },
    { id: IDS.sem6, name: 'Semester 6', academic_year_id: IDS.ay2425, start_date: '2024-12-01', end_date: '2025-04-30', status: 'active' },
  ], { onConflict: 'id' });

  // Subjects
  await supabase.from('subjects').upsert([
    { id: IDS.cs201, code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 3 },
    { id: IDS.cs202, code: 'CS202', name: 'Database Management Systems', credits: 4, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 3 },
    { id: IDS.cs301, code: 'CS301', name: 'Operating Systems', credits: 3, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 5 },
    { id: IDS.cs302, code: 'CS302', name: 'Computer Networks', credits: 3, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 5 },
    { id: IDS.cs601, code: 'CS601', name: 'Machine Learning', credits: 4, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 6 },
    { id: IDS.cs602, code: 'CS602', name: 'Cloud Computing', credits: 3, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 6 },
    { id: IDS.cs603, code: 'CS603', name: 'Software Engineering', credits: 3, department_id: IDS.deptCSE, program_id: IDS.progBTechCSE, semester_number: 6 },
    { id: IDS.ec201, code: 'EC201', name: 'Digital Electronics', credits: 4, department_id: IDS.deptECE, program_id: IDS.progBTechECE, semester_number: 3 },
    { id: IDS.ec601, code: 'EC601', name: 'VLSI Design', credits: 4, department_id: IDS.deptECE, program_id: IDS.progBTechECE, semester_number: 6 },
    { id: IDS.ec602, code: 'EC602', name: 'Embedded Systems', credits: 3, department_id: IDS.deptECE, program_id: IDS.progBTechECE, semester_number: 6 },
  ], { onConflict: 'id' });

  // Students (12 core students)
  await supabase.from('students').upsert([
    { id: IDS.st001, roll_no: '21CS001', name: 'Rahul Sharma', email: 'rahul.sharma@abc.edu', phone: '9876543210', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 85.5, fee_due: 0, internal_marks_pct: 78, eligibility_status: 'approved' },
    { id: IDS.st002, roll_no: '21CS002', name: 'Priya Patel', email: 'priya.patel@abc.edu', phone: '9876543211', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 72.3, fee_due: 2400, internal_marks_pct: 65, eligibility_status: 'pending' },
    { id: IDS.st003, roll_no: '21CS003', name: 'Amit Kumar', email: 'amit.kumar@abc.edu', phone: '9876543212', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 44.2, fee_due: 3600, internal_marks_pct: 42, eligibility_status: 'rejected' },
    { id: IDS.st004, roll_no: '21CS004', name: 'Sneha Reddy', email: 'sneha.reddy@abc.edu', phone: '9876543213', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 91.8, fee_due: 0, internal_marks_pct: 88, eligibility_status: 'approved' },
    { id: IDS.st005, roll_no: '21CS005', name: 'Vikram Singh', email: 'vikram.singh@abc.edu', phone: '9876543214', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 68.4, fee_due: 1200, internal_marks_pct: 59, eligibility_status: 'pending' },
    { id: IDS.st006, roll_no: '21CS006', name: 'Deepa Nair', email: 'deepa.nair@abc.edu', phone: '9876543215', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 88.9, fee_due: 0, internal_marks_pct: 82, eligibility_status: 'approved' },
    { id: IDS.st007, roll_no: '21EC001', name: 'Anjali Verma', email: 'anjali.verma@abc.edu', phone: '9876543216', program_id: IDS.progBTechECE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 78.6, fee_due: 0, internal_marks_pct: 74, eligibility_status: 'approved' },
    { id: IDS.st008, roll_no: '21EC002', name: 'Rohan Gupta', email: 'rohan.gupta@abc.edu', phone: '9876543217', program_id: IDS.progBTechECE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 55.3, fee_due: 1800, internal_marks_pct: 48, eligibility_status: 'pending' },
    { id: IDS.st009, roll_no: '21EC003', name: 'Pooja Krishnan', email: 'pooja.k@abc.edu', phone: '9876543218', program_id: IDS.progBTechECE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 82.1, fee_due: 0, internal_marks_pct: 77, eligibility_status: 'approved' },
    { id: IDS.st010, roll_no: '21EC004', name: 'Arjun Pillai', email: 'arjun.pillai@abc.edu', phone: '9876543219', program_id: IDS.progBTechECE, academic_year_id: IDS.ay2425, current_semester: 6, attendance_pct: 94.2, fee_due: 0, internal_marks_pct: 91, eligibility_status: 'approved' },
    { id: IDS.st011, roll_no: '20CS045', name: 'Kiran Das', email: 'kiran.das@abc.edu', phone: '9876543220', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 7, attendance_pct: 75.0, fee_due: 0, internal_marks_pct: 52, eligibility_status: 'approved' },
    { id: IDS.st012, roll_no: '20CS067', name: 'Meena Jaya', email: 'meena.jaya@abc.edu', phone: '9876543221', program_id: IDS.progBTechCSE, academic_year_id: IDS.ay2425, current_semester: 7, attendance_pct: 79.3, fee_due: 600, internal_marks_pct: 61, eligibility_status: 'pending' },
  ], { onConflict: 'id' });
}
