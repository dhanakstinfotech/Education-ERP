import { useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  Printer,
  Users,
  BookOpen,
  Building,
} from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel';
}

const mockReports: Report[] = [
  { id: '1', type: 'pass-percentage', title: 'Overall Pass Percentage Report - April 2024', generatedAt: '2024-04-10 14:30', generatedBy: 'Admin', format: 'pdf' },
  { id: '2', type: 'subject-wise', title: 'Subject Wise Analysis - CSE Department', generatedAt: '2024-04-09 11:15', generatedBy: 'Dr. Sharma', format: 'excel' },
  { id: '3', type: 'department', title: 'Department Wise Analysis - Semester 6', generatedAt: '2024-04-08 16:45', generatedBy: 'Admin', format: 'pdf' },
  { id: '4', type: 'university', title: 'University Consolidated Report 2024', generatedAt: '2024-04-07 09:00', generatedBy: 'Controller', format: 'pdf' },
];

const departmentStats = [
  { department: 'CSE', appeared: 456, passed: 398, percentage: 87.3, avgGPA: 7.9 },
  { department: 'ECE', appeared: 312, passed: 285, percentage: 91.3, avgGPA: 8.1 },
  { department: 'MECH', appeared: 234, passed: 198, percentage: 84.6, avgGPA: 7.5 },
  { department: 'CIVIL', appeared: 178, passed: 156, percentage: 87.6, avgGPA: 7.7 },
  { department: 'EEE', appeared: 156, passed: 142, percentage: 91.0, avgGPA: 8.0 },
];

const subjectAnalysis = [
  { subject: 'Machine Learning', code: 'CS601', appeared: 245, passed: 212, avgMarks: 68.5, highest: 95, lowest: 23 },
  { subject: 'Computer Networks', code: 'CS602', appeared: 234, passed: 198, avgMarks: 62.3, highest: 89, lowest: 28 },
  { subject: 'Software Engineering', code: 'CS603', appeared: 256, passed: 234, avgMarks: 71.2, highest: 92, lowest: 35 },
];

const chartData = [
  { label: 'O Grade', value: 156, color: 'bg-emerald-500' },
  { label: 'A+ Grade', value: 245, color: 'bg-blue-500' },
  { label: 'A Grade', value: 312, color: 'bg-sky-500' },
  { label: 'B+ Grade', value: 289, color: 'bg-indigo-500' },
  { label: 'B Grade', value: 156, color: 'bg-violet-500' },
  { label: 'F Grade', value: 87, color: 'bg-red-500' },
];

type Tab = 'overview' | 'department' | 'subject' | 'university' | 'history';

const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'overview', name: 'Overview', icon: PieChart },
  { id: 'department', name: 'Department Analysis', icon: Building },
  { id: 'subject', name: 'Subject Analysis', icon: BookOpen },
  { id: 'university', name: 'University Reports', icon: FileText },
  { id: 'history', name: 'Report History', icon: Calendar },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Generate comprehensive reports and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option>Semester 6 - April 2024</option>
            <option>Semester 5 - Nov 2023</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm">
            <Download className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm text-blue-100">Total Students</p>
          <p className="text-3xl font-bold">1,456</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-sm text-emerald-100">Pass Rate</p>
          <p className="text-3xl font-bold">87.3%</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white">
          <p className="text-sm text-violet-100">Avg GPA</p>
          <p className="text-3xl font-bold">7.84</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <p className="text-sm text-amber-100">Distinctions</p>
          <p className="text-3xl font-bold">245</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'department' && <DepartmentTab data={departmentStats} />}
      {activeTab === 'subject' && <SubjectTab data={subjectAnalysis} />}
      {activeTab === 'university' && <UniversityTab />}
      {activeTab === 'history' && <HistoryTab data={mockReports} />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Grade Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Grade Distribution</h2>
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-20 text-sm text-slate-600">{item.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(item.value / 1245) * 100}%` }}
                ></div>
              </div>
              <span className="w-16 text-right font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Export */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Quick Export</h2>
        <div className="space-y-3">
          {[
            { name: 'Consolidated Mark Sheet', format: 'PDF', icon: FileText },
            { name: 'Student Wise Results', format: 'Excel', icon: FileSpreadsheet },
            { name: 'Department Summary', format: 'PDF', icon: Building },
            { name: 'Subject Analysis Report', format: 'Excel', icon: BookOpen },
          ].map((item, idx) => (
            <button
              key={idx}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-800">{item.name}</span>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                {item.format}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DepartmentTab({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Department Wise Analysis</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Appeared</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Passed</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Pass %</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Avg GPA</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((dept) => (
              <tr key={dept.department} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{dept.department}</td>
                <td className="px-6 py-4 text-slate-600">{dept.appeared}</td>
                <td className="px-6 py-4 text-slate-600">{dept.passed}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-emerald-600">{dept.percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                    dept.avgGPA >= 8 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {dept.avgGPA.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectTab({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Subject Wise Analysis</h2>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm">
          <option>All Departments</option>
          <option>CSE</option>
          <option>ECE</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Subject</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Appeared</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Passed</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Avg Marks</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Highest</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Lowest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((subject) => (
              <tr key={subject.code} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{subject.subject}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-mono">{subject.code}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{subject.appeared}</td>
                <td className="px-6 py-4 text-slate-600">{subject.passed}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{subject.avgMarks}%</td>
                <td className="px-6 py-4 font-medium text-emerald-600">{subject.highest}</td>
                <td className="px-6 py-4 font-medium text-red-600">{subject.lowest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UniversityTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">University Reports</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Generate University Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Consolidated Result Sheet', desc: 'All departments combined results' },
          { name: 'Pass Percentage Report', desc: 'University wise pass percentage' },
          { name: 'Grade Distribution', desc: 'Complete grade analysis' },
          { name: 'Final Year Summary', desc: 'Final year student performance' },
        ].map((report, idx) => (
          <div key={idx} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-800">{report.name}</p>
                <p className="text-sm text-slate-500 mt-1">{report.desc}</p>
              </div>
              <Download className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ data }: { data: Report[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800">Report History</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {data.map((report) => (
          <div key={report.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                report.format === 'pdf' ? 'bg-red-100' : 'bg-emerald-100'
              }`}>
                {report.format === 'pdf' ? (
                  <FileText className="w-5 h-5 text-red-600" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800">{report.title}</p>
                <p className="text-sm text-slate-500">Generated by {report.generatedBy} at {report.generatedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <Printer className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <Download className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
