import { useState } from 'react';
import {
  UserPlus,
  RefreshCw,
  CreditCard,
  CheckCircle,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';

type Tab = 'registration' | 'arrear' | 'fee' | 'approval';

interface Registration {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  program: string;
  semester: string;
  subjects: number;
  feeAmount: number;
  feeStatus: 'paid' | 'pending' | 'waived';
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
}

const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'registration', name: 'Student Registration', icon: UserPlus },
  { id: 'arrear', name: 'Arrear Registration', icon: RefreshCw },
  { id: 'fee', name: 'Fee Collection', icon: CreditCard },
  { id: 'approval', name: 'Registration Approval', icon: CheckCircle },
];

const mockRegistrations: Registration[] = [
  { id: '1', studentId: '21CS001', studentName: 'Rahul Sharma', rollNo: '21CS001', program: 'B.Tech CSE', semester: 'Semester 6', subjects: 6, feeAmount: 3600, feeStatus: 'paid', status: 'approved', registeredAt: '2024-03-15' },
  { id: '2', studentId: '21CS002', studentName: 'Priya Patel', rollNo: '21CS002', program: 'B.Tech CSE', semester: 'Semester 6', subjects: 6, feeAmount: 3600, feeStatus: 'pending', status: 'pending', registeredAt: '2024-03-14' },
  { id: '3', studentId: '21CS003', studentName: 'Amit Kumar', rollNo: '21CS003', program: 'B.Tech CSE', semester: 'Semester 6', subjects: 5, feeAmount: 3000, feeStatus: 'pending', status: 'pending', registeredAt: '2024-03-14' },
  { id: '4', studentId: '21CS004', studentName: 'Sneha Reddy', rollNo: '21CS004', program: 'B.Tech CSE', semester: 'Semester 6', subjects: 6, feeAmount: 3600, feeStatus: 'paid', status: 'approved', registeredAt: '2024-03-13' },
  { id: '5', studentId: '21EC001', studentName: 'Anjali Verma', rollNo: '21EC001', program: 'B.Tech ECE', semester: 'Semester 6', subjects: 6, feeAmount: 3600, feeStatus: 'waived', status: 'approved', registeredAt: '2024-03-12' },
  { id: '6', studentId: '21EC002', studentName: 'Rohan Gupta', rollNo: '21EC002', program: 'B.Tech ECE', semester: 'Semester 6', subjects: 5, feeAmount: 3000, feeStatus: 'pending', status: 'rejected', registeredAt: '2024-03-11' },
];

const arrearData = [
  { id: '1', rollNo: '20CS045', name: 'Kiran Das', subject: 'Data Structures', originalSem: 'Semester 3', attempt: 2, fee: 600, status: 'approved' },
  { id: '2', rollNo: '20CS067', name: 'Meena Jaya', subject: 'Operating Systems', originalSem: 'Semester 5', attempt: 3, fee: 600, status: 'pending' },
  { id: '3', rollNo: '20EC023', name: 'Vikash Roy', subject: 'Digital Electronics', originalSem: 'Semester 3', attempt: 2, fee: 600, status: 'approved' },
];

const feeSummary = [
  { label: 'Total Collected', amount: 245600, color: 'emerald' },
  { label: 'Pending Amount', amount: 78900, color: 'amber' },
  { label: 'Waived Amount', amount: 18600, color: 'slate' },
];

export default function ExamRegistration() {
  const [activeTab, setActiveTab] = useState<Tab>('registration');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Exam Registration</h1>
          <p className="text-slate-500 mt-1">Manage student registrations, arrears, and fee collection</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            <span>New Registration</span>
          </button>
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {feeSummary.map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 text-${item.color}-600`}>
              Rs {item.amount.toLocaleString()}
            </p>
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

        {/* Search and Filters */}
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
          </select>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'registration' && <RegistrationTable data={mockRegistrations} />}
        {activeTab === 'arrear' && <ArrearTable data={arrearData} />}
        {activeTab === 'fee' && <FeeCollectionTable data={mockRegistrations} />}
        {activeTab === 'approval' && <ApprovalTable data={mockRegistrations} />}
      </div>
    </div>
  );
}

function RegistrationTable({ data }: { data: Registration[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Semester</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subjects</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fee Amount</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fee Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-mono text-slate-800">{item.rollNo}</td>
              <td className="px-4 py-4 font-medium text-slate-800">{item.studentName}</td>
              <td className="px-4 py-4 text-slate-600">{item.program}</td>
              <td className="px-4 py-4 text-slate-600">{item.semester}</td>
              <td className="px-4 py-4">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  {item.subjects} subjects
                </span>
              </td>
              <td className="px-4 py-4 font-medium text-slate-800">Rs {item.feeAmount}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.feeStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.feeStatus === 'waived'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.feeStatus}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="View">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                    <XCircle className="w-4 h-4 text-red-500" />
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

function ArrearTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Original Sem</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Attempt</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fee</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-mono text-slate-800">{item.rollNo}</td>
              <td className="px-4 py-4 font-medium text-slate-800">{item.name}</td>
              <td className="px-4 py-4 text-slate-600">{item.subject}</td>
              <td className="px-4 py-4 text-slate-600">{item.originalSem}</td>
              <td className="px-4 py-4">
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-sm">Attempt {item.attempt}</span>
              </td>
              <td className="px-4 py-4 font-medium text-slate-800">Rs {item.fee}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Register
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeeCollectionTable({ data }: { data: Registration[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount Due</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Payment Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.filter(d => d.feeStatus !== 'paid').map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-mono text-slate-800">{item.rollNo}</td>
              <td className="px-4 py-4 font-medium text-slate-800">{item.studentName}</td>
              <td className="px-4 py-4 text-slate-600">{item.program}</td>
              <td className="px-4 py-4">
                <span className="font-medium text-red-600">Rs {item.feeAmount}</span>
              </td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.feeStatus === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.feeStatus}
                </span>
              </td>
              <td className="px-4 py-4">
                <button className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                  Collect Fee
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalTable({ data }: { data: Registration[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subjects</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fee Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Registered</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.filter(d => d.status === 'pending').map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-mono text-slate-800">{item.rollNo}</td>
              <td className="px-4 py-4 font-medium text-slate-800">{item.studentName}</td>
              <td className="px-4 py-4 text-slate-600">{item.subjects} subjects</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  item.feeStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.feeStatus}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.registeredAt}</td>
              <td className="px-4 py-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                    <XCircle className="w-4 h-4" />
                    Reject
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
