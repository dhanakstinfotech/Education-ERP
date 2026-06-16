import { useState } from 'react';
import {
  Ticket,
  QrCode,
  Download,
  Search,
  Filter,
  Users,
  FileText,
  RefreshCw,
  CheckCircle,
  Eye,
  Printer,
} from 'lucide-react';

interface HallTicketData {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  program: string;
  semester: string;
  subjects: { code: string; name: string; date: string; time: string }[];
  status: 'pending' | 'generated' | 'downloaded';
}

const mockHallTickets: HallTicketData[] = [
  {
    id: '1',
    studentId: '21CS001',
    studentName: 'Rahul Sharma',
    rollNo: '21CS001',
    program: 'B.Tech CSE',
    semester: 'Semester 6',
    subjects: [
      { code: 'CS601', name: 'Machine Learning', date: '2024-04-15', time: '09:00 - 12:00' },
      { code: 'CS602', name: 'Computer Networks', date: '2024-04-16', time: '09:00 - 12:00' },
      { code: 'CS603', name: 'Software Engineering', date: '2024-04-17', time: '14:00 - 17:00' },
    ],
    status: 'downloaded',
  },
  {
    id: '2',
    studentId: '21CS002',
    studentName: 'Priya Patel',
    rollNo: '21CS002',
    program: 'B.Tech CSE',
    semester: 'Semester 6',
    subjects: [
      { code: 'CS601', name: 'Machine Learning', date: '2024-04-15', time: '09:00 - 12:00' },
      { code: 'CS602', name: 'Computer Networks', date: '2024-04-16', time: '09:00 - 12:00' },
      { code: 'CS603', name: 'Software Engineering', date: '2024-04-17', time: '14:00 - 17:00' },
    ],
    status: 'generated',
  },
  {
    id: '3',
    studentId: '21CS003',
    studentName: 'Amit Kumar',
    rollNo: '21CS003',
    program: 'B.Tech CSE',
    semester: 'Semester 6',
    subjects: [
      { code: 'CS601', name: 'Machine Learning', date: '2024-04-15', time: '09:00 - 12:00' },
      { code: 'CS602', name: 'Computer Networks', date: '2024-04-16', time: '09:00 - 12:00' },
    ],
    status: 'pending',
  },
  {
    id: '4',
    studentId: '21EC001',
    studentName: 'Anjali Verma',
    rollNo: '21EC001',
    program: 'B.Tech ECE',
    semester: 'Semester 6',
    subjects: [
      { code: 'EC601', name: 'VLSI Design', date: '2024-04-15', time: '09:00 - 12:00' },
      { code: 'EC602', name: 'Embedded Systems', date: '2024-04-16', time: '14:00 - 17:00' },
    ],
    status: 'generated',
  },
];

const stats = [
  { label: 'Total Eligible', value: 2456, icon: Users, color: 'blue' },
  { label: 'Generated', value: 1890, icon: FileText, color: 'emerald' },
  { label: 'Downloaded', value: 1345, icon: Download, color: 'violet' },
  { label: 'Pending', value: 566, icon: RefreshCw, color: 'amber' },
];

export default function HallTicket() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<HallTicketData | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hall Ticket Management</h1>
          <p className="text-slate-500 mt-1">Generate, manage, and download hall tickets</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <Printer className="w-5 h-5" />
            <span>Bulk Print</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <RefreshCw className="w-5 h-5" />
            <span>Generate All</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-50`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Roll No or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <option>Generated</option>
                <option>Downloaded</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Program</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Semester</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subjects</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockHallTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(ticket)}>
                    <td className="px-4 py-4 font-mono text-slate-800">{ticket.rollNo}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{ticket.studentName}</td>
                    <td className="px-4 py-4 text-slate-600">{ticket.program}</td>
                    <td className="px-4 py-4 text-slate-600">{ticket.semester}</td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        {ticket.subjects.length} subjects
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        ticket.status === 'downloaded'
                          ? 'bg-violet-100 text-violet-700'
                          : ticket.status === 'generated'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="View">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-blue-50 rounded-lg" title="Generate">
                          <Ticket className="w-4 h-4 text-blue-500" />
                        </button>
                        <button className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Download">
                          <Download className="w-4 h-4 text-emerald-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Hall Ticket Preview</h2>
          </div>
          <div className="p-4">
            {selectedStudent ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">ABC University</h3>
                  <p className="text-sm text-slate-500">End Semester Examination 2024</p>
                </div>

                {/* Student Info */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Roll No:</span>
                    <span className="font-medium text-slate-800">{selectedStudent.rollNo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-medium text-slate-800">{selectedStudent.studentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Program:</span>
                    <span className="font-medium text-slate-800">{selectedStudent.program}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Semester:</span>
                    <span className="font-medium text-slate-800">{selectedStudent.semester}</span>
                  </div>
                </div>

                {/* Subjects Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-2 py-2 text-left font-medium text-slate-600">Code</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600">Subject</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudent.subjects.map((sub, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-2 font-mono">{sub.code}</td>
                          <td className="px-2 py-2">{sub.name}</td>
                          <td className="px-2 py-2">{sub.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center py-4 border-t border-slate-200">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-400" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Select a student to preview hall ticket</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
