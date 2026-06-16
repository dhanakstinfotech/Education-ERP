import { useState } from 'react';
import {
  FileText,
  Calculator,
  CheckCircle,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Send,
  BarChart3,
} from 'lucide-react';

interface Result {
  id: string;
  rollNo: string;
  studentName: string;
  program: string;
  semester: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  gpa: number;
  cgpa: number;
  result: 'pass' | 'fail' | 'absent';
  status: 'pending' | 'approved' | 'published';
}

const mockResults: Result[] = [
  { id: '1', rollNo: '21CS001', studentName: 'Rahul Sharma', program: 'B.Tech CSE', semester: 'Semester 6', totalMarks: 500, obtainedMarks: 423, percentage: 84.6, gpa: 8.46, cgpa: 8.12, result: 'pass', status: 'published' },
  { id: '2', rollNo: '21CS002', studentName: 'Priya Patel', program: 'B.Tech CSE', semester: 'Semester 6', totalMarks: 500, obtainedMarks: 378, percentage: 75.6, gpa: 7.56, cgpa: 7.89, result: 'pass', status: 'approved' },
  { id: '3', rollNo: '21CS003', studentName: 'Amit Kumar', program: 'B.Tech CSE', semester: 'Semester 6', totalMarks: 500, obtainedMarks: 198, percentage: 39.6, gpa: 3.96, cgpa: 5.23, result: 'fail', status: 'pending' },
  { id: '4', rollNo: '21CS004', studentName: 'Sneha Reddy', program: 'B.Tech CSE', semester: 'Semester 6', totalMarks: 500, obtainedMarks: 467, percentage: 93.4, gpa: 9.34, cgpa: 8.89, result: 'pass', status: 'approved' },
  { id: '5', rollNo: '21EC001', studentName: 'Anjali Verma', program: 'B.Tech ECE', semester: 'Semester 6', totalMarks: 500, obtainedMarks: 412, percentage: 82.4, gpa: 8.24, cgpa: 7.78, result: 'pass', status: 'pending' },
];

const gradeScale = [
  { grade: 'O', range: '90-100', points: 10 },
  { grade: 'A+', range: '80-89', points: 9 },
  { grade: 'A', range: '70-79', points: 8 },
  { grade: 'B+', range: '60-69', points: 7 },
  { grade: 'B', range: '50-59', points: 6 },
  { grade: 'C', range: '40-49', points: 5 },
  { grade: 'F', range: '0-39', points: 0 },
];

export default function ResultProcessing() {
  const [activeSection, setActiveSection] = useState<'results' | 'grades' | 'approval' | 'publish'>('results');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Result Processing</h1>
          <p className="text-slate-500 mt-1">Calculate grades, process results, and publish</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            <Calculator className="w-5 h-5" />
            <span>Calculate GPA</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm">
            <Send className="w-5 h-5" />
            <span>Publish Results</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="text-2xl font-bold text-slate-800">1,245</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Pass Rate</p>
          <p className="text-2xl font-bold text-emerald-600">87.3%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Average GPA</p>
          <p className="text-2xl font-bold text-blue-600">7.84</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">156</p>
        </div>
      </div>

      {/* Grade Scale */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Grade Scale</h3>
        <div className="flex flex-wrap gap-2">
          {gradeScale.map((g) => (
            <div key={g.grade} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <span className={`font-bold ${g.grade === 'F' ? 'text-red-600' : 'text-slate-800'}`}>{g.grade}</span>
              <span className="text-sm text-slate-500">{g.range}%</span>
              <span className="text-sm text-slate-400">({g.points})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'results', name: 'Results', icon: FileText },
          { id: 'grades', name: 'Grade Calculation', icon: BarChart3 },
          { id: 'approval', name: 'Approval', icon: CheckCircle },
          { id: 'publish', name: 'Publish', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search */}
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
            <option>All Programs</option>
            <option>B.Tech CSE</option>
            <option>B.Tech ECE</option>
          </select>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Published</option>
          </select>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Marks</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">%</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">GPA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">CGPA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Result</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockResults.map((result) => (
                <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-mono text-slate-800">{result.rollNo}</td>
                  <td className="px-4 py-4 font-medium text-slate-800">{result.studentName}</td>
                  <td className="px-4 py-4 text-slate-600">{result.program}</td>
                  <td className="px-4 py-4 text-slate-800">{result.obtainedMarks}/{result.totalMarks}</td>
                  <td className="px-4 py-4">
                    <span className={`font-medium ${
                      result.percentage >= 75 ? 'text-emerald-600' :
                      result.percentage >= 50 ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {result.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                      result.gpa >= 8 ? 'bg-emerald-100 text-emerald-700' :
                      result.gpa >= 6 ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {result.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-800">{result.cgpa.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      result.result === 'pass'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {result.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      result.status === 'published'
                        ? 'bg-violet-100 text-violet-700'
                        : result.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <Download className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1-5 of 1,245 results</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Previous</button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">2</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
