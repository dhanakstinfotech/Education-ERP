import { useState } from 'react';
import {
  Edit3,
  CheckSquare,
  TrendingUp,
  RotateCcw,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface MarkEntry {
  id: string;
  rollNo: string;
  studentName: string;
  subjectCode: string;
  subjectName: string;
  internalMarks: number;
  internalMax: number;
  externalMarks: number | null;
  externalMax: number;
  totalMarks: number | null;
  grade: string;
  status: 'pending' | 'submitted' | 'verified';
}

const mockMarks: MarkEntry[] = [
  { id: '1', rollNo: '21CS001', studentName: 'Rahul Sharma', subjectCode: 'CS601', subjectName: 'Machine Learning', internalMarks: 18, internalMax: 20, externalMarks: 65, externalMax: 80, totalMarks: 83, grade: 'A', status: 'verified' },
  { id: '2', rollNo: '21CS002', studentName: 'Priya Patel', subjectCode: 'CS601', subjectName: 'Machine Learning', internalMarks: 15, internalMax: 20, externalMarks: 58, externalMax: 80, totalMarks: 73, grade: 'B+', status: 'submitted' },
  { id: '3', rollNo: '21CS003', studentName: 'Amit Kumar', subjectCode: 'CS601', subjectName: 'Machine Learning', internalMarks: 12, internalMax: 20, externalMarks: null, externalMax: 80, totalMarks: null, grade: '-', status: 'pending' },
  { id: '4', rollNo: '21CS004', studentName: 'Sneha Reddy', subjectCode: 'CS601', subjectName: 'Machine Learning', internalMarks: 19, internalMax: 20, externalMarks: 72, externalMax: 80, totalMarks: 91, grade: 'A+', status: 'verified' },
  { id: '5', rollNo: '21CS005', studentName: 'Vikram Singh', subjectCode: 'CS601', subjectName: 'Machine Learning', internalMarks: 16, internalMax: 20, externalMarks: 45, externalMax: 80, totalMarks: 61, grade: 'B', status: 'submitted' },
];

const revaluationRequests = [
  { id: '1', rollNo: '20CS067', studentName: 'Meena Jaya', subject: 'Operating Systems', originalMarks: 45, requestedAt: '2024-03-20', status: 'pending' },
  { id: '2', rollNo: '20CS045', studentName: 'Kiran Das', subject: 'Data Structures', originalMarks: 38, requestedAt: '2024-03-18', status: 'approved' },
  { id: '3', rollNo: '20EC023', studentName: 'Vikash Roy', subject: 'Digital Electronics', originalMarks: 52, requestedAt: '2024-03-15', status: 'completed', revisedMarks: 58 },
];

type Tab = 'entry' | 'moderation' | 'revaluation';

const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'entry', name: 'Mark Entry', icon: Edit3 },
  { id: 'moderation', name: 'Moderation', icon: TrendingUp },
  { id: 'revaluation', name: 'Revaluation', icon: RotateCcw },
];

export default function MarkEntry() {
  const [activeTab, setActiveTab] = useState<Tab>('entry');
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Mark Entry & Evaluation</h1>
          <p className="text-slate-500 mt-1">Enter, verify, and process student marks</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            <Upload className="w-5 h-5" />
            <span>Import</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm">
            <Save className="w-5 h-5" />
            <span>Save All</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Entries</p>
          <p className="text-2xl font-bold text-slate-800">4,521</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Pending Entry</p>
          <p className="text-2xl font-bold text-amber-600">234</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="text-2xl font-bold text-blue-600">3,892</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Verified</p>
          <p className="text-2xl font-bold text-emerald-600">2,456</p>
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

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option>Select Subject</option>
            <option>CS601 - Machine Learning</option>
            <option>CS602 - Computer Networks</option>
            <option>CS603 - Software Engineering</option>
          </select>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option>All Status</option>
            <option>Pending</option>
            <option>Submitted</option>
            <option>Verified</option>
          </select>
        </div>

        {/* Content */}
        {activeTab === 'entry' && <MarkEntryTable data={mockMarks} />}
        {activeTab === 'moderation' && <ModerationPanel />}
        {activeTab === 'revaluation' && <RevaluationTable data={revaluationRequests} />}
      </div>
    </div>
  );
}

function MarkEntryTable({ data }: { data: MarkEntry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [marks, setMarks] = useState<{ [key: string]: string }>({});

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Internal (20)</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">External (80)</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Grade</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((entry) => {
            const isEditing = editingId === entry.id;
            const externalValue = marks[entry.id] ?? entry.externalMarks?.toString() ?? '';

            return (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-mono text-slate-800">{entry.rollNo}</td>
                <td className="px-4 py-4 font-medium text-slate-800">{entry.studentName}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{entry.internalMarks}</span>
                    <span className="text-slate-400">/ {entry.internalMax}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {isEditing ? (
                    <input
                      type="number"
                      value={externalValue}
                      onChange={(e) => setMarks({ ...marks, [entry.id]: e.target.value })}
                      className="w-20 px-2 py-1 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      max={80}
                      min={0}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${entry.externalMarks !== null ? 'text-slate-800' : 'text-slate-400'}`}>
                        {entry.externalMarks ?? '-'}
                      </span>
                      <span className="text-slate-400">/ {entry.externalMax}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`font-bold ${
                    entry.totalMarks && entry.totalMarks >= 50 ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {entry.totalMarks ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                    entry.grade === 'A+' ? 'bg-emerald-100 text-emerald-700' :
                    entry.grade === 'A' ? 'bg-blue-100 text-blue-700' :
                    entry.grade === 'B+' ? 'bg-sky-100 text-sky-700' :
                    entry.grade === 'B' ? 'bg-slate-100 text-slate-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {entry.grade}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    entry.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-700'
                      : entry.status === 'submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(entry.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                          disabled={entry.status === 'verified'}
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-emerald-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ModerationPanel() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Moderation Rules</p>
          <p className="text-sm text-amber-700 mt-1">
            Moderation can only be applied if the pass percentage is below 40% or above 95%.
            Maximum moderation allowed: +5 marks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-500 mb-2">Subject</p>
          <p className="font-medium text-slate-800">Machine Learning</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-500 mb-2">Pass Percentage</p>
          <p className="font-medium text-emerald-600">87.5%</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-500 mb-2">Average Score</p>
          <p className="font-medium text-slate-800">68.3 / 100</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
          Apply Moderation
        </button>
        <button className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
          View Distribution
        </button>
      </div>
    </div>
  );
}

function RevaluationTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Original Marks</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Revised Marks</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Requested</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-mono text-slate-800">{req.rollNo}</td>
              <td className="px-4 py-4 font-medium text-slate-800">{req.studentName}</td>
              <td className="px-4 py-4 text-slate-600">{req.subject}</td>
              <td className="px-4 py-4 text-slate-800">{req.originalMarks}</td>
              <td className="px-4 py-4">
                {req.revisedMarks ? (
                  <span className={`${req.revisedMarks > req.originalMarks ? 'text-emerald-600' : 'text-slate-800'} font-medium`}>
                    {req.revisedMarks}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-4 text-slate-600">{req.requestedAt}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  req.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : req.status === 'approved'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {req.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">
                        Reject
                      </button>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Enter Marks
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
