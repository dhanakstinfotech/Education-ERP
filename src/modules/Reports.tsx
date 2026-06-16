import { useState, useEffect, useCallback } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, FileSpreadsheet, FileText, Printer, Building, BookOpen, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { PageHeader, ActionButton, LoadingState } from '../components/ui';

type Tab = 'overview' | 'department' | 'subject' | 'university' | 'history';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({ total: 0, pass: 0, fail: 0, avgGpa: 0 });
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);

    // Load academic years
    const { data: years } = await supabase.from('academic_years').select('id,name').order('name', { ascending: false });
    setAcademicYears(years ?? []);

    // Overall result stats
    const { data: results } = await supabase.from('results').select('result, gpa, students(programs(departments(code)))');
    if (results) {
      const passCount = results.filter(r => r.result === 'pass').length;
      const avgGpa = results.length > 0
        ? results.reduce((s, r) => s + (r.gpa ?? 0), 0) / results.length : 0;
      setStats({ total: results.length, pass: passCount, fail: results.length - passCount, avgGpa });

      // Department stats
      const byDept: Record<string, { appeared: number; passed: number; gpaSum: number }> = {};
      results.forEach(r => {
        const dept = (r.students as any)?.programs?.departments?.code ?? 'Unknown';
        if (!byDept[dept]) byDept[dept] = { appeared: 0, passed: 0, gpaSum: 0 };
        byDept[dept].appeared++;
        if (r.result === 'pass') byDept[dept].passed++;
        byDept[dept].gpaSum += r.gpa ?? 0;
      });
      setDeptStats(Object.entries(byDept).map(([dept, d]) => ({
        department: dept,
        appeared: d.appeared,
        passed: d.passed,
        percentage: d.appeared > 0 ? Math.round((d.passed / d.appeared) * 100) : 0,
        avgGPA: d.appeared > 0 ? (d.gpaSum / d.appeared).toFixed(2) : '—',
      })));
    }

    // Subject stats from mark_entries
    const { data: marks } = await supabase.from('mark_entries').select('subject_id, external_marks, total_marks, subjects(name, code)');
    if (marks) {
      const bySubject: Record<string, { name: string; code: string; count: number; passCount: number; totalMarks: number; highest: number; lowest: number }> = {};
      marks.forEach(m => {
        const key = m.subject_id;
        const subj = (m.subjects as any);
        if (!bySubject[key]) bySubject[key] = { name: subj?.name ?? 'Unknown', code: subj?.code ?? '', count: 0, passCount: 0, totalMarks: 0, highest: 0, lowest: 999 };
        const entry = bySubject[key];
        entry.count++;
        const marks100 = m.total_marks ?? 0;
        entry.totalMarks += marks100;
        if (marks100 > entry.highest) entry.highest = marks100;
        if (marks100 < entry.lowest) entry.lowest = marks100;
        if (marks100 >= 40) entry.passCount++;
      });
      setSubjectStats(Object.values(bySubject).map(s => ({
        ...s,
        avgMarks: s.count > 0 ? (s.totalMarks / s.count).toFixed(1) : '—',
        lowest: s.lowest === 999 ? 0 : s.lowest,
      })));
    }

    // Report history
    const { data: rep } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    setReportHistory(rep ?? []);

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generateReport = async (type: string, title: string, format: 'pdf' | 'excel') => {
    const { error } = await supabase.from('reports').insert({ type, title, generated_by: 'Admin', format, filters: { year: selectedYear } });
    if (error) toast(error.message, 'error');
    else { toast(`Report generated: ${title}`); load(); }
  };

  const passRate = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0;

  const TABS: { id: Tab; name: string; icon: React.ElementType }[] = [
    { id: 'overview', name: 'Overview', icon: PieChart },
    { id: 'department', name: 'Department', icon: Building },
    { id: 'subject', name: 'Subject', icon: BookOpen },
    { id: 'university', name: 'University Reports', icon: FileText },
    { id: 'history', name: 'History', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive analysis and report generation">
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Years</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <ActionButton onClick={() => generateReport('custom', 'Custom Report ' + new Date().toLocaleDateString(), 'pdf')}>
          <Download className="w-4 h-4" />Generate Report
        </ActionButton>
      </PageHeader>

      {/* Gradient Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, from: 'from-blue-500', to: 'to-blue-600' },
          { label: 'Pass Rate', value: `${passRate}%`, from: 'from-emerald-500', to: 'to-emerald-600' },
          { label: 'Avg GPA', value: stats.avgGpa.toFixed(2), from: 'from-violet-500', to: 'to-violet-600' },
          { label: 'Reports Generated', value: reportHistory.length, from: 'from-amber-500', to: 'to-amber-600' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-xl p-4 text-white`}>
            <p className="text-sm opacity-80">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <t.icon className="w-4 h-4" />{t.name}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 mb-5">Result Distribution</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Pass', value: stats.pass, color: 'bg-emerald-500', total: stats.total },
                    { label: 'Fail', value: stats.fail, color: 'bg-red-500', total: stats.total },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="w-12 text-sm text-slate-600">{item.label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}></div>
                      </div>
                      <span className="w-10 text-right font-medium text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Export */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 mb-5">Quick Export</h2>
                <div className="space-y-2">
                  {[
                    { name: 'Consolidated Mark Sheet', format: 'pdf' as const, type: 'consolidated' },
                    { name: 'Student Wise Results', format: 'excel' as const, type: 'student-wise' },
                    { name: 'Department Summary', format: 'pdf' as const, type: 'department' },
                    { name: 'Subject Analysis Report', format: 'excel' as const, type: 'subject-wise' },
                  ].map(item => (
                    <button
                      key={item.name}
                      onClick={() => generateReport(item.type, `${item.name} - ${new Date().toLocaleDateString()}`, item.format)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.format === 'pdf' ? <FileText className="w-5 h-5 text-red-500" /> : <FileSpreadsheet className="w-5 h-5 text-emerald-500" />}
                        <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        item.format === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{item.format.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'department' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-semibold text-slate-800">Department Wise Analysis</h2>
                <div className="flex gap-2">
                  <ActionButton size="sm" variant="secondary" onClick={() => generateReport('department', 'Dept Analysis ' + new Date().toLocaleDateString(), 'excel')}><FileSpreadsheet className="w-4 h-4" />Excel</ActionButton>
                  <ActionButton size="sm" variant="secondary" onClick={() => generateReport('department', 'Dept Analysis ' + new Date().toLocaleDateString(), 'pdf')}><FileText className="w-4 h-4" />PDF</ActionButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50">
                    {['Department', 'Appeared', 'Passed', 'Pass %', 'Avg GPA', 'Trend'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptStats.length === 0
                      ? <tr><td colSpan={6} className="py-10 text-center text-slate-400">No data available</td></tr>
                      : deptStats.map(d => (
                        <tr key={d.department} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-800">{d.department}</td>
                          <td className="px-6 py-4 text-slate-600">{d.appeared}</td>
                          <td className="px-6 py-4 text-slate-600">{d.passed}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-200 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${d.percentage}%` }}></div>
                              </div>
                              <span className="font-medium text-emerald-600">{d.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">{d.avgGPA}</span></td>
                          <td className="px-6 py-4"><TrendingUp className="w-5 h-5 text-emerald-500" /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subject' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800">Subject Wise Analysis</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50">
                    {['Subject', 'Code', 'Appeared', 'Passed', 'Avg Marks', 'Highest', 'Lowest'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjectStats.length === 0
                      ? <tr><td colSpan={7} className="py-10 text-center text-slate-400">No data available</td></tr>
                      : subjectStats.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-xs">{s.code}</span></td>
                          <td className="px-6 py-4 text-slate-600">{s.count}</td>
                          <td className="px-6 py-4 text-slate-600">{s.passCount}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{s.avgMarks}</td>
                          <td className="px-6 py-4 font-medium text-emerald-600">{s.highest}</td>
                          <td className="px-6 py-4 font-medium text-red-600">{s.lowest}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'university' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-slate-800">University Consolidated Reports</h2>
                <ActionButton onClick={() => generateReport('university', 'University Report ' + new Date().toLocaleDateString(), 'pdf')}>
                  <Plus className="w-4 h-4" />Generate
                </ActionButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Consolidated Result Sheet', desc: 'All departments combined results' },
                  { name: 'Pass Percentage Report', desc: 'University wise pass percentage analysis' },
                  { name: 'Grade Distribution Report', desc: 'Complete grade distribution breakdown' },
                  { name: 'Final Year Summary', desc: 'Final year student performance overview' },
                  { name: 'Arrear Statistics', desc: 'Students with arrear subjects' },
                  { name: 'Revaluation Summary', desc: 'Revaluation request statistics' },
                ].map((report, idx) => (
                  <button key={idx}
                    onClick={() => generateReport('university', report.name + ' ' + new Date().toLocaleDateString(), 'pdf')}
                    className="p-4 border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-blue-700">{report.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{report.desc}</p>
                      </div>
                      <Download className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800">Report History ({reportHistory.length})</h2>
              </div>
              {reportHistory.length === 0
                ? <div className="py-12 text-center text-slate-400">No reports generated yet</div>
                : <div className="divide-y divide-slate-100">
                  {reportHistory.map(r => (
                    <div key={r.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.format === 'pdf' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                          {r.format === 'pdf' ? <FileText className="w-5 h-5 text-red-600" /> : <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{r.title}</p>
                          <p className="text-xs text-slate-500">By {r.generated_by} · {new Date(r.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toast('Printing...', 'info')} className="p-2 hover:bg-slate-100 rounded-lg"><Printer className="w-4 h-4 text-slate-500" /></button>
                        <button onClick={() => toast('Downloading...', 'info')} className="p-2 hover:bg-slate-100 rounded-lg"><Download className="w-4 h-4 text-slate-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
