import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  ChevronDown,
  AlertTriangle,
  UserCheck,
  DollarSign,
  BookOpen,
  CheckSquare,
} from 'lucide-react';

type Tab = 'attendance' | 'fee' | 'internal' | 'approval';

interface Student {
  id: string;
  rollNo: string;
  name: string;
  program: string;
  semester: string;
  metric: number;
  status: 'pending' | 'approved' | 'rejected';
}

const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'attendance', name: 'Attendance Verification', icon: UserCheck },
  { id: 'fee', name: 'Fee Due Verification', icon: DollarSign },
  { id: 'internal', name: 'Internal Marks', icon: BookOpen },
  { id: 'approval', name: 'Eligibility Approval', icon: CheckSquare },
];

const mockStudents: Student[] = [
  { id: '1', rollNo: '21CS001', name: 'Rahul Sharma', program: 'B.Tech CSE', semester: 'Semester 6', metric: 85, status: 'approved' },
  { id: '2', rollNo: '21CS002', name: 'Priya Patel', program: 'B.Tech CSE', semester: 'Semester 6', metric: 72, status: 'pending' },
  { id: '3', rollNo: '21CS003', name: 'Amit Kumar', program: 'B.Tech CSE', semester: 'Semester 6', metric: 45, status: 'rejected' },
  { id: '4', rollNo: '21CS004', name: 'Sneha Reddy', program: 'B.Tech CSE', semester: 'Semester 6', metric: 91, status: 'approved' },
  { id: '5', rollNo: '21CS005', name: 'Vikram Singh', program: 'B.Tech CSE', semester: 'Semester 6', metric: 68, status: 'pending' },
  { id: '6', rollNo: '21EC001', name: 'Anjali Verma', program: 'B.Tech ECE', semester: 'Semester 6', metric: 78, status: 'approved' },
  { id: '7', rollNo: '21EC002', name: 'Rohan Gupta', program: 'B.Tech ECE', semester: 'Semester 6', metric: 55, status: 'pending' },
  { id: '8', rollNo: '21EC003', name: 'Pooja Sharma', program: 'B.Tech ECE', semester: 'Semester 6', metric: 62, status: 'approved' },
];

const criteria = [
  { name: 'Minimum Attendance', required: 75, unit: '%' },
  { name: 'Fee Clearance', required: 0, unit: 'Rs due' },
  { name: 'Internal Marks', required: 50, unit: '%' },
];

export default function StudentEligibility() {
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const getMetricLabel = (tab: Tab): string => {
    switch (tab) {
      case 'attendance': return 'Attendance (%)';
      case 'fee': return 'Fee Due (Rs)';
      case 'internal': return 'Internal Marks (%)';
      default: return 'Metric';
    }
  };

  const getThreshold = (tab: Tab): number => {
    switch (tab) {
      case 'attendance': return 75;
      case 'fee': return 0;
      case 'internal': return 50;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Student Eligibility</h1>
          <p className="text-slate-500 mt-1">Verify attendance, fee clearance, and internal marks</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Bulk Approve</span>
          </button>
        </div>
      </div>

      {/* Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criteria.map((item) => (
          <div key={item.name} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-700">{item.name}</h3>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{item.required}{item.unit}</p>
          </div>
        ))}
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

        {/* Summary Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-600">Eligible: <strong>156</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-slate-600">Pending: <strong>23</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-600">Not Eligible: <strong>12</strong></span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Programs</option>
            <option>B.Tech CSE</option>
            <option>B.Tech ECE</option>
            <option>B.Tech MECH</option>
          </select>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Semesters</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
            <option>Semester 3</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Semester</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{getMetricLabel(activeTab)}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockStudents.map((student) => {
                const isEligible = activeTab === 'fee'
                  ? student.metric <= getThreshold(activeTab)
                  : student.metric >= getThreshold(activeTab);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-slate-800">{student.rollNo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-slate-800">{student.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600">{student.program}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600">{student.semester}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isEligible ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className={`font-medium ${isEligible ? 'text-emerald-700' : 'text-red-700'}`}>
                          {activeTab === 'fee' ? `Rs ${student.metric}` : `${student.metric}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        student.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : student.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1-8 of 1,245 students</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Previous</button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">3</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
