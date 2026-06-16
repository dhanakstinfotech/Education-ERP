import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Send, Eye, CheckCircle, Calculator, BarChart3, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, LoadingState, EmptyState, Input, Select
} from '../components/ui';

const GRADE_SCALE = [
  { grade: 'O', min: 90, points: 10 },
  { grade: 'A+', min: 80, points: 9 },
  { grade: 'A', min: 70, points: 8 },
  { grade: 'B+', min: 60, points: 7 },
  { grade: 'B', min: 50, points: 6 },
  { grade: 'C', min: 40, points: 5 },
  { grade: 'F', min: 0, points: 0 },
];

type Section = 'results' | 'approval' | 'publish';

export default function ResultProcessing() {
  const [section, setSection] = useState<Section>('results');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('results')
      .select('*, students(name, roll_no, programs(name)), academic_years(name)')
      .order('created_at', { ascending: false });
    setResults(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const calculateGPA = async () => {
    setCalculating(true);
    // For each result, compute GPA from mark_entries
    const { data: marks } = await supabase.from('mark_entries').select('student_id, total_marks, internal_max, external_max, subjects(credits)');
    if (!marks?.length) { toast('No mark entries found', 'error'); setCalculating(false); return; }

    const byStudent: Record<string, any[]> = {};
    marks.forEach(m => {
      if (!byStudent[m.student_id]) byStudent[m.student_id] = [];
      byStudent[m.student_id].push(m);
    });

    for (const [studentId, entries] of Object.entries(byStudent)) {
      const totalCredits = entries.reduce((s, e) => s + (e.subjects?.credits ?? 3), 0);
      const creditPoints = entries.reduce((s, e) => {
        const maxMarks = (e.internal_max ?? 20) + (e.external_max ?? 80);
        const pct = ((e.total_marks ?? 0) / maxMarks) * 100;
        const gradeEntry = GRADE_SCALE.find(g => pct >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
        return s + gradeEntry.points * (e.subjects?.credits ?? 3);
      }, 0);
      const gpa = totalCredits > 0 ? creditPoints / totalCredits : 0;
      const totalObtained = entries.reduce((s, e) => s + (e.total_marks ?? 0), 0);
      const totalMax = entries.reduce((s, e) => s + (e.internal_max ?? 20) + (e.external_max ?? 80), 0);
      const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const hasFail = entries.some(e => {
        const max = (e.internal_max ?? 20) + (e.external_max ?? 80);
        const p = ((e.total_marks ?? 0) / max) * 100;
        return p < 40;
      });

      await supabase.from('results').upsert({
        student_id: studentId,
        academic_year_id: entries[0]?.academic_year_id ?? null,
        semester_number: 6,
        total_marks: totalMax,
        obtained_marks: totalObtained,
        percentage: Math.round(pct * 100) / 100,
        gpa: Math.round(gpa * 100) / 100,
        cgpa: Math.round(gpa * 100) / 100,
        result: hasFail ? 'fail' : 'pass',
        status: 'pending',
      }, { onConflict: 'student_id, academic_year_id, semester_number' });
    }
    toast('GPA calculated for all students');
    load();
    setCalculating(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('results').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast(`Result ${status}`); load(); }
  };

  const bulkPublish = async () => {
    const approved = results.filter(r => r.status === 'approved').map(r => r.id);
    if (!approved.length) { toast('No approved results to publish', 'info'); return; }
    const { error } = await supabase.from('results').update({ status: 'published' }).in('id', approved);
    if (error) toast(error.message, 'error');
    else { toast(`${approved.length} results published`); load(); }
  };

  const filtered = results.filter(r => {
    const matchSearch = r.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.students?.roll_no?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const passCount = results.filter(r => r.result === 'pass').length;
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;
  const avgGpa = results.length > 0
    ? (results.reduce((s, r) => s + (r.gpa ?? 0), 0) / results.length).toFixed(2)
    : '—';

  const SECTIONS = [
    { id: 'results' as Section, name: 'Results', icon: FileText },
    { id: 'approval' as Section, name: 'Approval', icon: CheckCircle },
    { id: 'publish' as Section, name: 'Publish', icon: Send },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Result Processing" subtitle="Calculate grades, process and publish results">
        <ActionButton loading={calculating} onClick={calculateGPA}><Calculator className="w-4 h-4" />Calculate GPA</ActionButton>
        <ActionButton onClick={bulkPublish}><Send className="w-4 h-4" />Publish Approved</ActionButton>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={results.length} color="blue" />
        <StatCard label="Pass Rate" value={`${passRate}%`} color="emerald" />
        <StatCard label="Average GPA" value={avgGpa} color="violet" />
        <StatCard label="Pending Approval" value={results.filter(r => r.status === 'pending').length} color="amber" />
      </div>

      {/* Grade scale */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Grade Scale</p>
        <div className="flex flex-wrap gap-2">
          {GRADE_SCALE.map(g => (
            <div key={g.grade} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-sm">
              <span className={`font-bold ${g.grade === 'F' ? 'text-red-600' : 'text-slate-800'}`}>{g.grade}</span>
              <span className="text-slate-500">{g.min}%+</span>
              <span className="text-slate-400 text-xs">({g.points} pts)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              section === s.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <s.icon className="w-4 h-4" />{s.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
        </div>

        {loading ? <LoadingState /> : (
          <DataTable columns={['Roll No', 'Student', 'Program', 'Marks', '%', 'GPA', 'CGPA', 'Result', 'Status', 'Actions']}>
            {filtered.length === 0
              ? <tr><td colSpan={10}><EmptyState message="No results found. Click Calculate GPA to process." /></td></tr>
              : filtered.filter(r => section === 'results' || section === 'publish' || r.status === 'pending').map(r => (
                <TableRow key={r.id}>
                  <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                  <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                  <Td className="text-slate-500 text-xs max-w-[120px] truncate">{r.students?.programs?.name ?? '-'}</Td>
                  <Td className="text-slate-600">{r.obtained_marks}/{r.total_marks}</Td>
                  <Td>
                    <span className={`font-medium ${
                      r.percentage >= 75 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-blue-600' : 'text-red-600'
                    }`}>{r.percentage}%</span>
                  </Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      r.gpa >= 8 ? 'bg-emerald-100 text-emerald-700' :
                      r.gpa >= 6 ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>{r.gpa?.toFixed(2) ?? '—'}</span>
                  </Td>
                  <Td className="font-medium text-slate-800">{r.cgpa?.toFixed(2) ?? '—'}</Td>
                  <Td><StatusBadge status={r.result} /></Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <ActionButton size="sm" variant="success" onClick={() => updateStatus(r.id, 'approved')}>
                          <CheckCircle className="w-3 h-3" />Approve
                        </ActionButton>
                      )}
                      {r.status === 'approved' && (
                        <ActionButton size="sm" onClick={() => updateStatus(r.id, 'published')}>
                          <Send className="w-3 h-3" />Publish
                        </ActionButton>
                      )}
                    </div>
                  </Td>
                </TableRow>
              ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
