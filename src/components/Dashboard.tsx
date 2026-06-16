import { useState, useEffect } from 'react';
import { GraduationCap, Users, ClipboardList, Ticket, CheckCircle, Clock, TrendingUp, AlertCircle, Calendar, BookOpen, Award, BarChart3, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoadingState } from './ui';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, registrations: 0, hallTickets: 0, results: 0, passRate: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [stuRes, regRes, htRes, resRes, markRes, qpRes] = await Promise.all([
        supabase.from('students').select('id, status').eq('status', 'active'),
        supabase.from('registrations').select('id, status, created_at, students(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('hall_tickets').select('id, status').neq('status', 'pending'),
        supabase.from('results').select('id, result, created_at'),
        supabase.from('mark_entries').select('id, status'),
        supabase.from('question_papers').select('id, exam_date, subjects(name, code), status').eq('status', 'finalized').order('exam_date').limit(5),
      ]);

      const passCount = (resRes.data ?? []).filter(r => r.result === 'pass').length;
      const passRate = resRes.data?.length ? Math.round((passCount / resRes.data.length) * 100) : 0;

      setStats({
        students: stuRes.data?.length ?? 0,
        registrations: regRes.data?.length ?? 0,
        hallTickets: htRes.data?.length ?? 0,
        results: resRes.data?.length ?? 0,
        passRate,
      });

      // Build recent activities from registrations + mark entries
      const activities: any[] = [];
      (regRes.data ?? []).slice(0, 3).forEach(r => {
        activities.push({
          action: `Registration ${r.status} — ${r.students?.name}`,
          module: 'Registration',
          time: new Date(r.created_at).toLocaleString(),
          type: r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : 'pending',
        });
      });
      (markRes.data ?? []).slice(0, 3).forEach(() => {
        activities.push({ action: 'Mark entry submitted', module: 'Mark Entry', time: 'Recently', type: 'success' });
      });
      setRecentActivities(activities.slice(0, 6));

      // Upcoming exams from finalized question papers
      setUpcomingExams((qpRes.data ?? []).map(qp => ({
        subject: qp.subjects?.name ?? 'Unknown',
        code: qp.subjects?.code ?? '',
        date: qp.exam_date,
        session: 'Morning',
        status: 'Scheduled',
      })));

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const statCards = [
    { label: 'Active Students', value: stats.students.toLocaleString(), icon: Users, color: 'blue', sub: 'enrolled' },
    { label: 'Registrations', value: stats.registrations.toLocaleString(), icon: ClipboardList, color: 'emerald', sub: 'this cycle' },
    { label: 'Hall Tickets', value: stats.hallTickets.toLocaleString(), icon: Ticket, color: 'violet', sub: 'generated' },
    { label: 'Pass Rate', value: `${stats.passRate}%`, icon: Award, color: 'amber', sub: 'this semester' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Examination Dashboard</h1>
          <p className="text-slate-500 mt-1">Live overview of the examination management system</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1.5">{stat.sub}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
          </div>
          <div className="p-5">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No recent activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      act.type === 'success' ? 'bg-emerald-100' :
                      act.type === 'pending' ? 'bg-amber-100' :
                      act.type === 'error' ? 'bg-red-100' : 'bg-slate-100'
                    }`}>
                      {act.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                       act.type === 'pending' ? <Clock className="w-4 h-4 text-amber-600" /> :
                       act.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                       <TrendingUp className="w-4 h-4 text-slate-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{act.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{act.module}</span>
                        <span className="text-xs text-slate-400">{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100"><h2 className="text-lg font-semibold text-slate-800">System Stats</h2></div>
          <div className="p-5 space-y-5">
            {[
              { icon: BookOpen, color: 'blue', label: 'Pass Rate', value: `${stats.passRate}%` },
              { icon: Award, color: 'emerald', label: 'Results Published', value: stats.results },
              { icon: Building2, color: 'amber', label: 'Registrations', value: stats.registrations },
              { icon: BarChart3, color: 'violet', label: 'Hall Tickets Generated', value: stats.hallTickets },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-11 h-11 bg-${item.color}-50 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-xl font-bold text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Upcoming Exams (Finalized Papers)</h2>
        </div>
        {upcomingExams.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No finalized exam papers yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['Subject', 'Code', 'Date', 'Session', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingExams.map((exam, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{exam.subject}</td>
                    <td className="px-6 py-4 text-slate-500">{exam.code}</td>
                    <td className="px-6 py-4 text-slate-600">{exam.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">{exam.session}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{exam.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
