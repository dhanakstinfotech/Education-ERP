import {
  GraduationCap,
  Users,
  ClipboardList,
  Ticket,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  BookOpen,
  Award,
} from 'lucide-react';

const stats = [
  { label: 'Active Exams', value: '24', change: '+3', icon: GraduationCap, color: 'blue' },
  { label: 'Registered Students', value: '4,521', change: '+156', icon: Users, color: 'emerald' },
  { label: 'Pending Approvals', value: '89', change: '-12', icon: ClipboardList, color: 'amber' },
  { label: 'Hall Tickets Generated', value: '3,892', change: '+234', icon: Ticket, color: 'violet' },
];

const recentActivities = [
  { action: 'Exam Schedule Updated', module: 'Exam Master', time: '2 minutes ago', type: 'update' },
  { action: 'Hall Tickets Generated - CSE 6th Sem', module: 'Hall Ticket', time: '15 minutes ago', type: 'success' },
  { action: 'Fee Payment Received - 45 Students', module: 'Registration', time: '1 hour ago', type: 'success' },
  { action: 'Eligibility List Approved', module: 'Student Eligibility', time: '2 hours ago', type: 'approve' },
  { action: 'Question Paper Review Pending', module: 'Question Paper', time: '3 hours ago', type: 'pending' },
  { action: 'Result Uploaded - ECE 4th Sem', module: 'Result Processing', time: '5 hours ago', type: 'success' },
];

const upcomingExams = [
  { subject: 'Data Structures', code: 'CS201', date: '2024-04-15', session: 'Morning', students: 245 },
  { subject: 'Operating Systems', code: 'CS301', date: '2024-04-15', session: 'Afternoon', students: 189 },
  { subject: 'Database Management', code: 'CS202', date: '2024-04-16', session: 'Morning', students: 312 },
  { subject: 'Computer Networks', code: 'CS302', date: '2024-04-16', session: 'Afternoon', students: 167 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Examination Dashboard</h1>
          <p className="text-slate-500 mt-1">Academic Year 2024-25 | Even Semester</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">April 15, 2024</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Quick Actions
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                <p className={`text-sm font-medium mt-2 ${
                  stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {stat.change} this week
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activities</h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-emerald-100' :
                    activity.type === 'pending' ? 'bg-amber-100' :
                    activity.type === 'approve' ? 'bg-blue-100' :
                    'bg-slate-100'
                  }`}>
                    {activity.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                     activity.type === 'pending' ? <Clock className="w-5 h-5 text-amber-600" /> :
                     activity.type === 'approve' ? <TrendingUp className="w-5 h-5 text-blue-600" /> :
                     <AlertCircle className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {activity.module}
                      </span>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Exam Statistics</h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Subjects</p>
                <p className="text-xl font-bold text-slate-800">156</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pass Rate</p>
                <p className="text-xl font-bold text-slate-800">87.3%</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Appearing Students</p>
                <p className="text-xl font-bold text-slate-800">4,521</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Upcoming Exams</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Session</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingExams.map((exam, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800">{exam.subject}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{exam.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{exam.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      exam.session === 'Morning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {exam.session}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{exam.students}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                      Scheduled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
