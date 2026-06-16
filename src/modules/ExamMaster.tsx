import { useState } from 'react';
import {
  Calendar,
  BookOpen,
  Settings,
  Layers,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MoreVertical,
  Save,
  X,
} from 'lucide-react';

type Tab = 'academic-year' | 'semester' | 'exam-types' | 'subject-mapping' | 'program-mapping';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

interface Semester {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

interface ExamType {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
  passingMarks: number;
  status: 'active' | 'inactive';
}

interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  program: string;
  semester: string;
}

interface Program {
  id: string;
  code: string;
  name: string;
  department: string;
  duration: number;
  status: 'active' | 'inactive';
}

const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'academic-year', name: 'Academic Year', icon: Calendar },
  { id: 'semester', name: 'Semester', icon: Layers },
  { id: 'exam-types', name: 'Exam Types', icon: Settings },
  { id: 'subject-mapping', name: 'Subject Mapping', icon: BookOpen },
  { id: 'program-mapping', name: 'Program Mapping', icon: GraduationCap },
];

const mockAcademicYears: AcademicYear[] = [
  { id: '1', name: '2024-25', startDate: '2024-06-01', endDate: '2025-04-30', status: 'active' },
  { id: '2', name: '2023-24', startDate: '2023-06-01', endDate: '2024-04-30', status: 'inactive' },
  { id: '3', name: '2022-23', startDate: '2022-06-01', endDate: '2023-04-30', status: 'inactive' },
];

const mockSemesters: Semester[] = [
  { id: '1', name: 'Semester 1', academicYear: '2024-25', startDate: '2024-06-01', endDate: '2024-11-30', status: 'active' },
  { id: '2', name: 'Semester 2', academicYear: '2024-25', startDate: '2024-12-01', endDate: '2025-04-30', status: 'inactive' },
  { id: '3', name: 'Semester 3', academicYear: '2024-25', startDate: '2024-06-01', endDate: '2024-11-30', status: 'active' },
];

const mockExamTypes: ExamType[] = [
  { id: '1', name: 'Internal Assessment 1', code: 'IA1', maxMarks: 20, passingMarks: 8, status: 'active' },
  { id: '2', name: 'Internal Assessment 2', code: 'IA2', maxMarks: 20, passingMarks: 8, status: 'active' },
  { id: '3', name: 'End Semester Exam', code: 'ESE', maxMarks: 80, passingMarks: 32, status: 'active' },
  { id: '4', name: 'Model Exam', code: 'MOD', maxMarks: 80, passingMarks: 32, status: 'inactive' },
];

const mockSubjects: Subject[] = [
  { id: '1', code: 'CS201', name: 'Data Structures', credits: 4, department: 'CSE', program: 'B.Tech', semester: 'Semester 3' },
  { id: '2', code: 'CS202', name: 'Database Systems', credits: 4, department: 'CSE', program: 'B.Tech', semester: 'Semester 3' },
  { id: '3', code: 'CS301', name: 'Operating Systems', credits: 3, department: 'CSE', program: 'B.Tech', semester: 'Semester 5' },
  { id: '4', code: 'EC201', name: 'Digital Electronics', credits: 4, department: 'ECE', program: 'B.Tech', semester: 'Semester 3' },
];

const mockPrograms: Program[] = [
  { id: '1', code: 'BTECH-CSE', name: 'B.Tech Computer Science', department: 'CSE', duration: 4, status: 'active' },
  { id: '2', code: 'BTECH-ECE', name: 'B.Tech Electronics', department: 'ECE', duration: 4, status: 'active' },
  { id: '3', code: 'MTECH-CSE', name: 'M.Tech Computer Science', department: 'CSE', duration: 2, status: 'active' },
  { id: '4', code: 'MBA', name: 'Master of Business Admin', department: 'MBA', duration: 2, status: 'active' },
];

export default function ExamMaster() {
  const [activeTab, setActiveTab] = useState<Tab>('academic-year');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Exam Master Management</h1>
          <p className="text-slate-500 mt-1">Configure academic years, semesters, exam types, and mappings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'academic-year' && <AcademicYearTable data={mockAcademicYears} />}
          {activeTab === 'semester' && <SemesterTable data={mockSemesters} />}
          {activeTab === 'exam-types' && <ExamTypeTable data={mockExamTypes} />}
          {activeTab === 'subject-mapping' && <SubjectTable data={mockSubjects} />}
          {activeTab === 'program-mapping' && <ProgramTable data={mockPrograms} />}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={`Add New ${tabs.find(t => t.id === activeTab)?.name}`} onClose={() => setShowModal(false)}>
          <FormContent tab={activeTab} onClose={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  );
}

function AcademicYearTable({ data }: { data: AcademicYear[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Start Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">End Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <span className="font-medium text-slate-800">{item.name}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.startDate}</td>
              <td className="px-4 py-4 text-slate-600">{item.endDate}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SemesterTable({ data }: { data: Semester[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Academic Year</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Start Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">End Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <span className="font-medium text-slate-800">{item.name}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.academicYear}</td>
              <td className="px-4 py-4 text-slate-600">{item.startDate}</td>
              <td className="px-4 py-4 text-slate-600">{item.endDate}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExamTypeTable({ data }: { data: ExamType[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Max Marks</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Passing Marks</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <span className="font-medium text-slate-800">{item.name}</span>
              </td>
              <td className="px-4 py-4">
                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded font-mono">{item.code}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.maxMarks}</td>
              <td className="px-4 py-4 text-slate-600">{item.passingMarks}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubjectTable({ data }: { data: Subject[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-xs font-semibold text-slate-500 uppercase">Code</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Credits</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Semester</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded font-mono">{item.code}</span>
              </td>
              <td className="px-4 py-4">
                <span className="font-medium text-slate-800">{item.name}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.credits}</td>
              <td className="px-4 py-4">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{item.department}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.program}</td>
              <td className="px-4 py-4 text-slate-600">{item.semester}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgramTable({ data }: { data: Program[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Duration</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-sm rounded font-mono">{item.code}</span>
              </td>
              <td className="px-4 py-4">
                <span className="font-medium text-slate-800">{item.name}</span>
              </td>
              <td className="px-4 py-4">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{item.department}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.duration} Years</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormContent({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  return (
    <div className="p-5 space-y-4">
      {tab === 'academic-year' && (
        <>
          <Input label="Academic Year Name" placeholder="e.g., 2024-25" />
          <Input label="Start Date" type="date" />
          <Input label="End Date" type="date" />
        </>
      )}
      {tab === 'semester' && (
        <>
          <Input label="Semester Name" placeholder="e.g., Semester 1" />
          <Select label="Academic Year" options={['2024-25', '2023-24', '2022-23']} />
          <Input label="Start Date" type="date" />
          <Input label="End Date" type="date" />
        </>
      )}
      {tab === 'exam-types' && (
        <>
          <Input label="Exam Type Name" placeholder="e.g., Internal Assessment 1" />
          <Input label="Code" placeholder="e.g., IA1" />
          <Input label="Maximum Marks" type="number" />
          <Input label="Passing Marks" type="number" />
        </>
      )}
      {tab === 'subject-mapping' && (
        <>
          <Input label="Subject Code" placeholder="e.g., CS201" />
          <Input label="Subject Name" placeholder="e.g., Data Structures" />
          <Input label="Credits" type="number" />
          <Select label="Department" options={['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']} />
          <Select label="Program" options={['B.Tech', 'M.Tech', 'MBA', 'MCA']} />
          <Select label="Semester" options={['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6']} />
        </>
      )}
      {tab === 'program-mapping' && (
        <>
          <Input label="Program Code" placeholder="e.g., BTECH-CSE" />
          <Input label="Program Name" placeholder="e.g., B.Tech Computer Science" />
          <Select label="Department" options={['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA']} />
          <Input label="Duration (Years)" type="number" />
        </>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onClose} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
          Cancel
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
}

function Input({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
