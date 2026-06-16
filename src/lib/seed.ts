import { supabase } from './supabase';

// Deterministic UUIDs for cross-table references
const IDS = {
  // Departments
  deptCSE: 'd1000000-0000-0000-0000-000000000001',
  deptECE: 'd1000000-0000-0000-0000-000000000002',
  deptMECH: 'd1000000-0000-0000-0000-000000000003',
  deptCIVIL: 'd1000000-0000-0000-0000-000000000004',
  deptEEE: 'd1000000-0000-0000-0000-000000000005',
  deptMBA: 'd1000000-0000-0000-0000-000000000006',

  // Programs
  progBTechCSE: 'p1000000-0000-0000-0000-000000000001',
  progBTechECE: 'p1000000-0000-0000-0000-000000000002',
  progBTechMECH: 'p1000000-0000-0000-0000-000000000003',
  progMTechCSE: 'p1000000-0000-0000-0000-000000000004',
  progMBA: 'p1000000-0000-0000-0000-000000000005',

  // Academic Years
  ay2425: 'a1000000-0000-0000-0000-000000000001',
  ay2324: 'a1000000-0000-0000-0000-000000000002',

  // Exam Types
  etIA1: 'e1000000-0000-0000-0000-000000000001',
  etIA2: 'e1000000-0000-0000-0000-000000000002',
  etESE: 'e1000000-0000-0000-0000-000000000003',
  etMOD: 'e1000000-0000-0000-0000-000000000004',

  // Semesters
  sem1: 's1000000-0000-0000-0000-000000000001',
  sem2: 's1000000-0000-0000-0000-000000000002',
  sem3: 's1000000-0000-0000-0000-000000000003',
  sem4: 's1000000-0000-0000-0000-000000000004',
  sem5: 's1000000-0000-0000-0000-000000000005',
  sem6: 's1000000-0000-0000-0000-000000000006',

  // Subjects (CSE)
  cs201: 'b1000000-0000-0000-0000-000000000001',
  cs202: 'b1000000-0000-0000-0000-000000000002',
  cs301: 'b1000000-0000-0000-0000-000000000003',
  cs302: 'b1000000-0000-0000-0000-000000000004',
  cs601: 'b1000000-0000-0000-0000-000000000005',
  cs602: 'b1000000-0000-0000-0000-000000000006',
  cs603: 'b1000000-0000-0000-0000-000000000007',
  // Subjects (ECE)
  ec201: 'b1000000-0000-0000-0000-000000000008',
  ec601: 'b1000000-0000-0000-0000-000000000009',
  ec602: 'b1000000-0000-0000-0000-000000000010',

  // Students
  st001: 'f1000000-0000-0000-0000-000000000001',
  st002: 'f1000000-0000-0000-0000-000000000002',
  st003: 'f1000000-0000-0000-0000-000000000003',
  st004: 'f1000000-0000-0000-0000-000000000004',
  st005: 'f1000000-0000-0000-0000-000000000005',
  st006: 'f1000000-0000-0000-0000-000000000006',
  st007: 'f1000000-0000-0000-0000-000000000007',
  st008: 'f1000000-0000-0000-0000-000000000008',
  st009: 'f1000000-0000-0000-0000-000000000009',
  st010: 'f1000000-0000-0000-0000-000000000010',
  st011: 'f1000000-0000-0000-0000-000000000011',
  st012: 'f1000000-0000-0000-0000-000000000012',

  // Rooms
  room101: 'r1000000-0000-0000-0000-000000000001',
  room102: 'r1000000-0000-0000-0000-000000000002',
  room201: 'r1000000-0000-0000-0000-000000000003',
  hallA: 'r1000000-0000-0000-0000-000000000004',
  hallB: 'r1000000-0000-0000-0000-000000000005',
};

export async function seedDatabase() {
  // Check if already seeded
  const { data: existing } = await supabase.from('departments').select('id').limit(1);
  if (existing && existing.length > 0) return;

  // 1. Departments
  await supabase.from('departments').upsert([
    { id: IDS.deptCSE, code: 'CSE', name: 'Computer Science & Engineering' },
    { id: IDS.deptECE, code: 'ECE', name: 'Electronics & Communication Engineering' },
    { id: IDS.deptMECH, code: 'MECH', name: 'Mechanical Engineering' },
    { id: IDS.deptCIVIL, code: 'CIVIL', name: 'Civil Engineering' },
    { id: IDS.deptEEE, code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { id: IDS.deptMBA, code: 'MBA', name: 'Master of Business Administration' },
  ], { onConflict: 'id' });

  // 2. Programs
  await supabase.from('programs').upsert([
    { id: IDS.progBTechCSE, code: 'BTECH-CSE', name: 'B.Tech Computer Science', department_id: IDS.deptCSE, duration_years: 4, status: 'active' },
    { id: IDS.progBTechECE, code: 'BTECH-ECE', name: 'B.Tech Electronics', department_id: IDS.deptECE, duration_years: 4, status: 'active' },
    { id: IDS.progBTechMECH, code: 'BTECH-MECH', name: 'B.Tech Mechanical', department_id: IDS.deptMECH, duration_years: 4, status: 'active' },
    { id: IDS.progMTechCSE, code: 'MTECH-CSE', name: 'M.Tech Computer Science', department_id: IDS.deptCSE, duration_years: 2, status: 'active' },
    { id: IDS.progMBA, code: 'MBA-GENERAL', name: 'MBA General Management', department_id: IDS.deptMBA, duration_years: 2, status: 'active' },
  ], { onConflict: 'id' });

  // 3. Academic Years
  await supabase.from('academic_years').upsert([
    { id: IDS.ay2425, name: '2024-25', start_date: '2024-06-01', end_date: '2025-04-30', status: 'active' },
    { id: IDS.ay2324, name: '2023-24', start_date: '2023-06-01', end_date: '2024-04-30', status: 'inactive' },
  ], { onConflict: 'id' });

  // 4. Exam Types
  await supabase.from('exam_types').upsert([
    { id: IDS.etIA1, name: 'Internal Assessment 1', code: 'IA1', max_marks: 20, passing_marks: 8, status: 'active' },
    { id: IDS.etIA2, name: 'Internal Assessment 2', code: 'IA2', max_marks: 20, passing_marks: 8, status: 'active' },
    { id: IDS.etESE, name: 'End Semester Exam', code: 'ESE', max_marks: 80, passing_marks: 32, status: 'active' },
    { id: IDS.etMOD, name: 'Model Examination', code: 'MOD', max_marks: 80, passing_marks: 32, status: 'inactive' },
  ], { onConflict: 'id' });

  // 5. Semesters
  await supabase.from('semesters').upsert([
    { id: IDS.sem1, name: 'Semester 1', academic_year_id: IDS.ay2425, start_date: '2024-06-01', end_date: '2024-11-30', status: 'inactive' },
    { id: IDS.sem2, name: 'Semester 2', academic_year_id: IDS.ay2425, start_date: '2024-12-01', end_date: '2025-04-30', status: 'inactive' },
    { id: IDS.sem3, name: 'Semester 3', academic_year_id: IDS.ay2425, start_date: '2024-06-01', end_date: '2024-11-30', status: 'inactive' },
    { id: IDS.sem4, name: 'Semester 4', academic_year_id: IDS.ay2425, start_date: '2024-12-01', end_date: '2025-04-30', status: 'inactive' },
    { id: IDS.sem5, name: 'Semester 5', academic_year_id: IDS.ay2425, start_date: '2024-06-01', end_date: '2024-11-30', status: 'inactive' },
    { id: IDS.sem6, name: 'Semester 6', academic_year_id: IDS.ay2425, start_date: '2024-12-01', end_date: '2025-04-30', status: 'active' },
  ], { onConflict: 'id' });

  // 6. Subjects
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

  // 7. Students (12 students)
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

  // 8. Exam Rooms
  await supabase.from('exam_rooms').upsert([
    { id: IDS.room101, name: 'Room 101', building: 'Main Block', floor: 'Ground', capacity: 40, facilities: ['Projector', 'AC', 'CCTV'], status: 'occupied' },
    { id: IDS.room102, name: 'Room 102', building: 'Main Block', floor: 'Ground', capacity: 50, facilities: ['Projector', 'AC'], status: 'occupied' },
    { id: IDS.room201, name: 'Room 201', building: 'Main Block', floor: 'First', capacity: 45, facilities: ['Projector', 'AC', 'CCTV'], status: 'available' },
    { id: IDS.hallA, name: 'Hall A', building: 'Exam Hall', floor: 'Ground', capacity: 120, facilities: ['Projector', 'AC', 'CCTV', 'Mic'], status: 'occupied' },
    { id: IDS.hallB, name: 'Hall B', building: 'Exam Hall', floor: 'Ground', capacity: 100, facilities: ['Projector', 'AC'], status: 'available' },
  ], { onConflict: 'id' });

  // 9. Registrations
  await supabase.from('registrations').upsert([
    { student_id: IDS.st001, academic_year_id: IDS.ay2425, semester_number: 6, exam_type_id: IDS.etESE, subject_ids: [IDS.cs601, IDS.cs602, IDS.cs603], fee_amount: 3600, fee_status: 'paid', status: 'approved' },
    { student_id: IDS.st002, academic_year_id: IDS.ay2425, semester_number: 6, exam_type_id: IDS.etESE, subject_ids: [IDS.cs601, IDS.cs602, IDS.cs603], fee_amount: 3600, fee_status: 'pending', status: 'pending' },
    { student_id: IDS.st004, academic_year_id: IDS.ay2425, semester_number: 6, exam_type_id: IDS.etESE, subject_ids: [IDS.cs601, IDS.cs602, IDS.cs603], fee_amount: 3600, fee_status: 'paid', status: 'approved' },
    { student_id: IDS.st007, academic_year_id: IDS.ay2425, semester_number: 6, exam_type_id: IDS.etESE, subject_ids: [IDS.ec601, IDS.ec602], fee_amount: 2400, fee_status: 'waived', status: 'approved' },
    { student_id: IDS.st008, academic_year_id: IDS.ay2425, semester_number: 6, exam_type_id: IDS.etESE, subject_ids: [IDS.ec601, IDS.ec602], fee_amount: 2400, fee_status: 'pending', status: 'rejected' },
  ]);

  // 10. Arrear Registrations
  await supabase.from('arrear_registrations').upsert([
    { student_id: IDS.st011, subject_id: IDS.cs201, original_semester: 3, attempt_number: 2, fee_amount: 600, status: 'approved' },
    { student_id: IDS.st012, subject_id: IDS.cs301, original_semester: 5, attempt_number: 3, fee_amount: 600, status: 'pending' },
    { student_id: IDS.st008, subject_id: IDS.ec201, original_semester: 3, attempt_number: 2, fee_amount: 600, status: 'approved' },
  ]);

  // 11. Hall Tickets
  const htIds = [
    'h1000000-0000-0000-0000-000000000001',
    'h1000000-0000-0000-0000-000000000002',
    'h1000000-0000-0000-0000-000000000003',
    'h1000000-0000-0000-0000-000000000004',
  ];
  await supabase.from('hall_tickets').upsert([
    { id: htIds[0], student_id: IDS.st001, academic_year_id: IDS.ay2425, semester_number: 6, status: 'downloaded', qr_code: 'QR-21CS001-SEM6-2024', generated_at: '2024-03-20T10:00:00Z' },
    { id: htIds[1], student_id: IDS.st002, academic_year_id: IDS.ay2425, semester_number: 6, status: 'generated', qr_code: 'QR-21CS002-SEM6-2024', generated_at: '2024-03-20T10:05:00Z' },
    { id: htIds[2], student_id: IDS.st004, academic_year_id: IDS.ay2425, semester_number: 6, status: 'downloaded', qr_code: 'QR-21CS004-SEM6-2024', generated_at: '2024-03-20T10:10:00Z' },
    { id: htIds[3], student_id: IDS.st007, academic_year_id: IDS.ay2425, semester_number: 6, status: 'generated', qr_code: 'QR-21EC001-SEM6-2024', generated_at: '2024-03-20T10:15:00Z' },
  ], { onConflict: 'id' });

  await supabase.from('hall_ticket_subjects').upsert([
    { hall_ticket_id: htIds[0], subject_id: IDS.cs601, exam_date: '2024-04-15', exam_time: '09:00 - 12:00', venue: 'Hall A' },
    { hall_ticket_id: htIds[0], subject_id: IDS.cs602, exam_date: '2024-04-16', exam_time: '09:00 - 12:00', venue: 'Room 101' },
    { hall_ticket_id: htIds[0], subject_id: IDS.cs603, exam_date: '2024-04-17', exam_time: '14:00 - 17:00', venue: 'Room 102' },
    { hall_ticket_id: htIds[1], subject_id: IDS.cs601, exam_date: '2024-04-15', exam_time: '09:00 - 12:00', venue: 'Hall A' },
    { hall_ticket_id: htIds[1], subject_id: IDS.cs602, exam_date: '2024-04-16', exam_time: '09:00 - 12:00', venue: 'Room 101' },
    { hall_ticket_id: htIds[2], subject_id: IDS.cs601, exam_date: '2024-04-15', exam_time: '09:00 - 12:00', venue: 'Hall A' },
    { hall_ticket_id: htIds[2], subject_id: IDS.cs602, exam_date: '2024-04-16', exam_time: '09:00 - 12:00', venue: 'Room 101' },
    { hall_ticket_id: htIds[2], subject_id: IDS.cs603, exam_date: '2024-04-17', exam_time: '14:00 - 17:00', venue: 'Room 102' },
    { hall_ticket_id: htIds[3], subject_id: IDS.ec601, exam_date: '2024-04-15', exam_time: '09:00 - 12:00', venue: 'Room 201' },
    { hall_ticket_id: htIds[3], subject_id: IDS.ec602, exam_date: '2024-04-16', exam_time: '14:00 - 17:00', venue: 'Room 201' },
  ]);

  // 12. Seat Allocations
  await supabase.from('seat_allocations').upsert([
    { student_id: IDS.st001, room_id: IDS.hallA, subject_id: IDS.cs601, seat_number: 'A1', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st002, room_id: IDS.hallA, subject_id: IDS.cs601, seat_number: 'A2', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st004, room_id: IDS.hallA, subject_id: IDS.cs601, seat_number: 'A3', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st005, room_id: IDS.hallA, subject_id: IDS.cs601, seat_number: 'A4', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st006, room_id: IDS.hallA, subject_id: IDS.cs601, seat_number: 'B1', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st007, room_id: IDS.room201, subject_id: IDS.ec601, seat_number: 'A1', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st009, room_id: IDS.room201, subject_id: IDS.ec601, seat_number: 'A2', exam_date: '2024-04-15', exam_session: 'morning' },
    { student_id: IDS.st010, room_id: IDS.room201, subject_id: IDS.ec601, seat_number: 'A3', exam_date: '2024-04-15', exam_session: 'morning' },
  ]);

  // 13. Question Papers
  const qpIds = [
    'q1000000-0000-0000-0000-000000000001',
    'q1000000-0000-0000-0000-000000000002',
    'q1000000-0000-0000-0000-000000000003',
    'q1000000-0000-0000-0000-000000000004',
    'q1000000-0000-0000-0000-000000000005',
  ];
  await supabase.from('question_papers').upsert([
    { id: qpIds[0], subject_id: IDS.cs601, exam_date: '2024-04-15', total_marks: 80, duration_hours: 3, status: 'finalized', created_by: 'Dr. Sharma', approved_by: 'Dr. Patel' },
    { id: qpIds[1], subject_id: IDS.cs602, exam_date: '2024-04-16', total_marks: 80, duration_hours: 3, status: 'approved', created_by: 'Dr. Kumar', approved_by: 'Dr. Singh' },
    { id: qpIds[2], subject_id: IDS.cs603, exam_date: '2024-04-17', total_marks: 80, duration_hours: 3, status: 'pending', created_by: 'Prof. Reddy' },
    { id: qpIds[3], subject_id: IDS.ec601, exam_date: '2024-04-15', total_marks: 80, duration_hours: 3, status: 'draft', created_by: 'Dr. Verma' },
    { id: qpIds[4], subject_id: IDS.ec602, exam_date: '2024-04-16', total_marks: 80, duration_hours: 3, status: 'pending', created_by: 'Dr. Gupta' },
  ], { onConflict: 'id' });

  // 14. Questions (bank)
  await supabase.from('questions').upsert([
    { subject_id: IDS.cs601, question_text: 'Explain the concept of overfitting in machine learning models and how regularization helps.', marks: 10, difficulty: 'medium' },
    { subject_id: IDS.cs601, question_text: 'What is a confusion matrix? Describe how precision, recall, and F1-score are derived from it.', marks: 10, difficulty: 'easy' },
    { subject_id: IDS.cs601, question_text: 'Compare and contrast supervised and unsupervised learning with real-world examples.', marks: 15, difficulty: 'medium' },
    { subject_id: IDS.cs601, question_text: 'Implement a decision tree classifier from scratch. Explain the Gini impurity criterion.', marks: 20, difficulty: 'hard' },
    { subject_id: IDS.cs602, question_text: 'Explain the TCP/IP protocol stack with a neat diagram and the role of each layer.', marks: 15, difficulty: 'easy' },
    { subject_id: IDS.cs602, question_text: 'What are the differences between TCP and UDP? Provide use cases for each.', marks: 10, difficulty: 'easy' },
    { subject_id: IDS.cs602, question_text: 'Describe the process of DHCP IP address assignment in detail.', marks: 15, difficulty: 'medium' },
    { subject_id: IDS.cs603, question_text: 'What is software engineering? Explain the SDLC phases with a diagram.', marks: 10, difficulty: 'easy' },
    { subject_id: IDS.cs603, question_text: 'Compare Waterfall and Agile methodologies. When should each be used?', marks: 15, difficulty: 'medium' },
    { subject_id: IDS.ec601, question_text: 'Explain CMOS fabrication process and its advantages over NMOS.', marks: 20, difficulty: 'hard' },
    { subject_id: IDS.ec601, question_text: 'What is timing analysis in VLSI? Explain setup and hold time violations.', marks: 15, difficulty: 'medium' },
  ]);

  // 15. Mark Entries
  await supabase.from('mark_entries').upsert([
    { student_id: IDS.st001, subject_id: IDS.cs601, academic_year_id: IDS.ay2425, internal_marks: 18, internal_max: 20, external_marks: 65, external_max: 80, total_marks: 83, grade: 'A', status: 'verified' },
    { student_id: IDS.st001, subject_id: IDS.cs602, academic_year_id: IDS.ay2425, internal_marks: 16, internal_max: 20, external_marks: 60, external_max: 80, total_marks: 76, grade: 'B+', status: 'verified' },
    { student_id: IDS.st001, subject_id: IDS.cs603, academic_year_id: IDS.ay2425, internal_marks: 17, internal_max: 20, external_marks: 68, external_max: 80, total_marks: 85, grade: 'A', status: 'submitted' },
    { student_id: IDS.st002, subject_id: IDS.cs601, academic_year_id: IDS.ay2425, internal_marks: 15, internal_max: 20, external_marks: 58, external_max: 80, total_marks: 73, grade: 'B+', status: 'submitted' },
    { student_id: IDS.st002, subject_id: IDS.cs602, academic_year_id: IDS.ay2425, internal_marks: 12, internal_max: 20, external_marks: 50, external_max: 80, total_marks: 62, grade: 'B', status: 'submitted' },
    { student_id: IDS.st003, subject_id: IDS.cs601, academic_year_id: IDS.ay2425, internal_marks: 12, internal_max: 20, external_marks: null, external_max: 80, total_marks: null, grade: null, status: 'pending' },
    { student_id: IDS.st004, subject_id: IDS.cs601, academic_year_id: IDS.ay2425, internal_marks: 19, internal_max: 20, external_marks: 72, external_max: 80, total_marks: 91, grade: 'A+', status: 'verified' },
    { student_id: IDS.st004, subject_id: IDS.cs602, academic_year_id: IDS.ay2425, internal_marks: 18, internal_max: 20, external_marks: 71, external_max: 80, total_marks: 89, grade: 'A', status: 'verified' },
    { student_id: IDS.st004, subject_id: IDS.cs603, academic_year_id: IDS.ay2425, internal_marks: 20, internal_max: 20, external_marks: 75, external_max: 80, total_marks: 95, grade: 'O', status: 'verified' },
    { student_id: IDS.st007, subject_id: IDS.ec601, academic_year_id: IDS.ay2425, internal_marks: 16, internal_max: 20, external_marks: 62, external_max: 80, total_marks: 78, grade: 'B+', status: 'submitted' },
    { student_id: IDS.st007, subject_id: IDS.ec602, academic_year_id: IDS.ay2425, internal_marks: 15, internal_max: 20, external_marks: 58, external_max: 80, total_marks: 73, grade: 'B+', status: 'submitted' },
  ], { onConflict: 'student_id, subject_id, academic_year_id' });

  // 16. Revaluation Requests
  await supabase.from('revaluation_requests').upsert([
    { student_id: IDS.st012, subject_id: IDS.cs301, original_marks: 45, reason: 'Answer not evaluated properly', status: 'pending' },
    { student_id: IDS.st011, subject_id: IDS.cs201, original_marks: 38, reason: 'Partial marks not awarded', status: 'approved' },
    { student_id: IDS.st008, subject_id: IDS.ec201, original_marks: 52, revised_marks: 58, reason: 'Marks addition error', status: 'completed' },
    { student_id: IDS.st003, subject_id: IDS.cs602, original_marks: 29, reason: 'Incomplete evaluation', status: 'pending' },
  ]);

  // 17. Results
  await supabase.from('results').upsert([
    { student_id: IDS.st001, academic_year_id: IDS.ay2425, semester_number: 6, total_marks: 300, obtained_marks: 244, percentage: 81.3, gpa: 8.13, cgpa: 7.98, result: 'pass', status: 'approved' },
    { student_id: IDS.st002, academic_year_id: IDS.ay2425, semester_number: 6, total_marks: 300, obtained_marks: 208, percentage: 69.3, gpa: 6.93, cgpa: 7.21, result: 'pass', status: 'pending' },
    { student_id: IDS.st004, academic_year_id: IDS.ay2425, semester_number: 6, total_marks: 300, obtained_marks: 275, percentage: 91.7, gpa: 9.17, cgpa: 8.89, result: 'pass', status: 'approved' },
    { student_id: IDS.st007, academic_year_id: IDS.ay2425, semester_number: 6, total_marks: 200, obtained_marks: 151, percentage: 75.5, gpa: 7.55, cgpa: 7.78, result: 'pass', status: 'pending' },
  ], { onConflict: 'student_id, academic_year_id, semester_number' });

  // 18. Report history
  await supabase.from('reports').upsert([
    { type: 'pass-percentage', title: 'Overall Pass Percentage Report - April 2024', generated_by: 'Admin', format: 'pdf' },
    { type: 'subject-wise', title: 'Subject Wise Analysis - CSE Department', generated_by: 'Dr. Sharma', format: 'excel' },
    { type: 'department', title: 'Department Wise Analysis - Semester 6', generated_by: 'Admin', format: 'pdf' },
    { type: 'university', title: 'University Consolidated Report 2024', generated_by: 'Controller', format: 'pdf' },
  ]);
}
