export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface ExamType {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
  passingMarks: number;
  status: 'active' | 'inactive';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  departmentId: string;
  programId: string;
  semesterId: string;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  duration: number;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  programId: string;
  semesterId: string;
  academicYearId: string;
  attendance: number;
  feeDue: number;
  internalMarks: number;
  eligibilityStatus: 'pending' | 'approved' | 'rejected';
}

export interface ExamRoom {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

export interface SeatAllocation {
  id: string;
  studentId: string;
  roomId: string;
  seatNumber: string;
  examDate: string;
  examSession: 'morning' | 'afternoon';
}

export interface HallTicket {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  program: string;
  semester: string;
  subjects: ExamSubject[];
  examDates: string[];
  qrCode: string;
  status: 'generated' | 'downloaded';
}

export interface ExamSubject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  examDate: string;
  examTime: string;
  venue: string;
}

export interface Question {
  id: string;
  subjectId: string;
  questionText: string;
  options?: string[];
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface QuestionPaper {
  id: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  totalMarks: number;
  duration: number;
  questions: Question[];
  status: 'draft' | 'pending' | 'approved' | 'finalized';
  createdBy: string;
  approvedBy?: string;
}

export interface MarkEntry {
  id: string;
  studentId: string;
  subjectId: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  status: 'pending' | 'submitted' | 'verified';
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  program: string;
  semester: string;
  subjects: SubjectResult[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  gpa: number;
  cgpa: number;
  result: 'pass' | 'fail' | 'absent';
  status: 'pending' | 'approved' | 'published';
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  credits: number;
  creditPoints: number;
}

export interface Report {
  id: string;
  type: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel';
}

export interface Registration {
  id: string;
  studentId: string;
  studentName: string;
  programId: string;
  semesterId: string;
  subjects: string[];
  examType: string;
  feeAmount: number;
  feeStatus: 'paid' | 'pending' | 'waived';
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
}

export interface ArrearRegistration {
  id: string;
  studentId: string;
  subjectId: string;
  originalSemester: string;
  attemptNumber: number;
  feeAmount: number;
  status: 'pending' | 'approved';
}
