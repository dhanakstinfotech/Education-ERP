import { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  Shield,
} from 'lucide-react';

interface QuestionPaper {
  id: string;
  subjectCode: string;
  subjectName: string;
  examDate: string;
  totalMarks: number;
  duration: number;
  questions: number;
  status: 'draft' | 'pending' | 'approved' | 'finalized';
  createdBy: string;
  approvedBy?: string;
}

const mockPapers: QuestionPaper[] = [
  { id: '1', subjectCode: 'CS601', subjectName: 'Machine Learning', examDate: '2024-04-15', totalMarks: 80, duration: 3, questions: 8, status: 'finalized', createdBy: 'Dr. Sharma', approvedBy: 'Dr. Patel' },
  { id: '2', subjectCode: 'CS602', subjectName: 'Computer Networks', examDate: '2024-04-16', totalMarks: 80, duration: 3, questions: 8, status: 'approved', createdBy: 'Dr. Kumar', approvedBy: 'Dr. Singh' },
  { id: '3', subjectCode: 'CS603', subjectName: 'Software Engineering', examDate: '2024-04-17', totalMarks: 80, duration: 3, questions: 10, status: 'pending', createdBy: 'Prof. Reddy' },
  { id: '4', subjectCode: 'EC601', subjectName: 'VLSI Design', examDate: '2024-04-15', totalMarks: 80, duration: 3, questions: 8, status: 'draft', createdBy: 'Dr. Verma' },
  { id: '5', subjectCode: 'EC602', subjectName: 'Embedded Systems', examDate: '2024-04-16', totalMarks: 80, duration: 3, questions: 8, status: 'pending', createdBy: 'Dr. Gupta' },
];

const questionBank = [
  { id: '1', subject: 'Machine Learning', question: 'Explain the concept of overfitting in machine learning models.', marks: 10, difficulty: 'medium' },
  { id: '2', subject: 'Machine Learning', question: 'What is a confusion matrix? How is it used to evaluate classification models?', marks: 10, difficulty: 'easy' },
  { id: '3', subject: 'Machine Learning', question: 'Compare and contrast supervised and unsupervised learning approaches.', marks: 15, difficulty: 'medium' },
  { id: '4', subject: 'Machine Learning', question: 'Implement a simple neural network for image classification.', marks: 20, difficulty: 'hard' },
  { id: '5', subject: 'Computer Networks', question: 'Explain the TCP/IP protocol stack with a neat diagram.', marks: 15, difficulty: 'easy' },
  { id: '6', subject: 'Computer Networks', question: 'What are the differences between TCP and UDP protocols?', marks: 10, difficulty: 'easy' },
];

type Tab = 'papers' | 'bank' | 'approval';

const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'papers', name: 'Question Papers', icon: FileText },
  { id: 'bank', name: 'Question Bank', icon: FileQuestion },
  { id: 'approval', name: 'Approval Workflow', icon: CheckCircle },
];

export default function QuestionPaper() {
  const [activeTab, setActiveTab] = useState<Tab>('papers');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Question Paper Management</h1>
          <p className="text-slate-500 mt-1">Question bank, paper creation, and approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            <Lock className="w-5 h-5" />
            <span>Secure Mode</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm">
            <Plus className="w-5 h-5" />
            <span>Create Paper</span>
          </button>
        </div>
      </div>

      {/* Security Alert */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center gap-4">
        <Shield className="w-8 h-8" />
        <div className="flex-1">
          <p className="font-medium">Secure Question Paper System</p>
          <p className="text-sm text-blue-200">All question papers are encrypted and access is logged for security.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Lock className="w-4 h-4" />
          <span>AES-256 Encrypted</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Question Bank</p>
          <p className="text-2xl font-bold text-slate-800">1,245</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Papers Created</p>
          <p className="text-2xl font-bold text-slate-800">156</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">12</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Finalized</p>
          <p className="text-2xl font-bold text-emerald-600">89</p>
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

        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option>All Subjects</option>
            <option>Machine Learning</option>
            <option>Computer Networks</option>
          </select>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option>All Status</option>
            <option>Draft</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
        </div>

        {/* Content */}
        {activeTab === 'papers' && <PapersList data={mockPapers} />}
        {activeTab === 'bank' && <QuestionBankList data={questionBank} />}
        {activeTab === 'approval' && <ApprovalWorkflow data={mockPapers.filter(p => p.status === 'pending' || p.status === 'approved')} />}
      </div>
    </div>
  );
}

function PapersList({ data }: { data: QuestionPaper[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Exam Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Marks</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Questions</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Created By</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((paper) => (
            <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <div>
                  <span className="font-medium text-slate-800">{paper.subjectName}</span>
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-mono">{paper.subjectCode}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600">{paper.examDate}</td>
              <td className="px-4 py-4 text-slate-600">{paper.totalMarks}</td>
              <td className="px-4 py-4 text-slate-600">{paper.questions}</td>
              <td className="px-4 py-4 text-slate-600">{paper.createdBy}</td>
              <td className="px-4 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  paper.status === 'finalized'
                    ? 'bg-emerald-100 text-emerald-700'
                    : paper.status === 'approved'
                    ? 'bg-blue-100 text-blue-700'
                    : paper.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {paper.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="View">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
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

function QuestionBankList({ data }: { data: any[] }) {
  return (
    <div className="p-4 space-y-3">
      {data.map((q) => (
        <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-slate-800">{q.question}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{q.subject}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{q.marks} marks</span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                  q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {q.difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white rounded-lg">
                <Edit2 className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg">
                <Plus className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApprovalWorkflow({ data }: { data: QuestionPaper[] }) {
  return (
    <div className="p-4 space-y-4">
      {data.map((paper) => (
        <div key={paper.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{paper.subjectName}</p>
                <p className="text-sm text-slate-500">{paper.subjectCode} - {paper.examDate}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              paper.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {paper.status}
            </span>
          </div>

          {/* Workflow Steps */}
          <div className="p-4 flex items-center gap-4">
            <WorkflowStep label="Created" status="complete" actor={paper.createdBy} />
            <div className="flex-1 h-0.5 bg-emerald-500"></div>
            <WorkflowStep
              label="Review"
              status={paper.status === 'pending' ? 'current' : 'complete'}
              actor={paper.status !== 'pending' ? paper.approvedBy : 'Pending'}
            />
            <div className={`flex-1 h-0.5 ${paper.status === 'approved' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            <WorkflowStep
              label="Approve"
              status={paper.status === 'approved' ? 'complete' : 'pending'}
              actor={paper.status === 'approved' ? paper.approvedBy : 'Pending'}
            />
          </div>

          {paper.status === 'pending' && (
            <div className="px-4 pb-4 flex justify-end gap-2">
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
                Reject
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WorkflowStep({ label, status, actor }: { label: string; status: 'complete' | 'current' | 'pending'; actor: string }) {
  return (
    <div className="text-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
        status === 'complete' ? 'bg-emerald-500' :
        status === 'current' ? 'bg-blue-500' :
        'bg-slate-200'
      }`}>
        {status === 'complete' && <CheckCircle className="w-5 h-5 text-white" />}
        {status === 'current' && <Clock className="w-5 h-5 text-white" />}
        {status === 'pending' && <div className="w-3 h-3 rounded-full bg-slate-400"></div>}
      </div>
      <p className="text-sm font-medium text-slate-800 mt-2">{label}</p>
      <p className="text-xs text-slate-500">{actor}</p>
    </div>
  );
}
