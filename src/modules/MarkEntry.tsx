import { useState, useEffect, useCallback } from 'react';
import { Edit3, TrendingUp, RotateCcw, Search, Download, Upload, Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';

type Tab = 'entry' | 'moderation' | 'revaluation';

export default function MarkEntry() {
  const [activeTab, setActiveTab] = useState<Tab>('entry');
  const [marks, setMarks] = useState<any[]>([]);
  const [revaluations, setRevaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [editingMark, setEditingMark] = useState<any>(null);
  const [showRevalModal, setShowRevalModal] = useState(false);
  const { toast } = useToast();

  const loadMarks = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('mark_entries').select('*, students(name, roll_no), subjects(name, code), academic_years(name)').order('created_at', { ascending: false });
    if (subjectFilter) q = q.eq('subject_id', subjectFilter);
    const { data } = await q;
    setMarks(data ?? []);
    setLoading(false);
  }, [subjectFilter]);

  const loadRevaluations = useCallback(async () => {
    const { data } = await supabase.from('revaluation_requests').select('*, students(name, roll_no), subjects(name, code)').order('created_at', { ascending: false });
    setRevaluations(data ?? []);
  }, []);

  useEffect(() => { loadMarks(); loadRevaluations(); }, [loadMarks, loadRevaluations]);
  useEffect(() => {
    supabase.from('subjects').select('id,name,code').then(({ data }) => setSubjects(data ?? []));
  }, []);

  const saveMark = async (entry: any, externalMarks: number) => {
    const total = Number(entry.internal_marks) + externalMarks;
    const pct = (total / (entry.internal_max + entry.external_max)) * 100;
    const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : pct >= 40 ? 'C' : 'F';
    const { error } = await supabase.from('mark_entries').update({
      external_marks: externalMarks, total_marks: total, grade, status: 'submitted', updated_at: new Date().toISOString()
    }).eq('id', entry.id);
    if (error) toast(error.message, 'error');
    else { toast('Marks saved'); setEditingMark(null); loadMarks(); }
  };

  const verifyMark = async (id: string) => {
    const { error } = await supabase.from('mark_entries').update({ status: 'verified' }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Marks verified'); loadMarks(); }
  };

  const updateRevalStatus = async (id: string, status: string, revisedMarks?: number) => {
    const upd: any = { status };
    if (revisedMarks !== undefined) upd.revised_marks = revisedMarks;
    const { error } = await supabase.from('revaluation_requests').update(upd).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast(`Revaluation ${status}`); loadRevaluations(); }
  };

  const filteredMarks = marks.filter(m =>
    m.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.students?.roll_no?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: marks.length,
    pending: marks.filter(m => m.status === 'pending').length,
    submitted: marks.filter(m => m.status === 'submitted').length,
    verified: marks.filter(m => m.status === 'verified').length,
  };

  // Export marks to CSV
  const exportMarks = () => {
    const data = filteredMarks.map(m => ({
      'Roll No': m.students?.roll_no ?? '',
      'Name': m.students?.name ?? '',
      'Subject': m.subjects?.code ?? '',
      'Internal': m.internal_marks ?? '',
      'Internal Max': m.internal_max ?? 20,
      'External': m.external_marks ?? '',
      'External Max': m.external_max ?? 80,
      'Total': m.total_marks ?? '',
      'Grade': m.grade ?? '',
      'Status': m.status ?? '',
    }));
    if (!data.length) { toast('No data to export', 'info'); return; }
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Marks exported successfully');
  };

  // Import template download
  const downloadImportTemplate = () => {
    const headers = ['student_id', 'subject_id', 'internal_marks', 'external_marks'];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marks-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Import template downloaded');
  };

  // Save all pending marks (mark as submitted if external marks exist)
  const saveAllMarks = async () => {
    const pendingWithMarks = marks.filter(m => m.status === 'pending' && m.external_marks !== null && m.external_marks !== undefined);
    if (!pendingWithMarks.length) { toast('No pending marks with values to save', 'info'); return; }

    let saved = 0;
    for (const entry of pendingWithMarks) {
      const total = Number(entry.internal_marks) + Number(entry.external_marks);
      const pct = (total / (entry.internal_max + entry.external_max)) * 100;
      const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : pct >= 40 ? 'C' : 'F';
      const { error } = await supabase.from('mark_entries').update({
        total_marks: total, grade, status: 'submitted', updated_at: new Date().toISOString()
      }).eq('id', entry.id);
      if (!error) saved++;
    }
    toast(`Saved ${saved} mark entries`);
    loadMarks();
  };

  // Apply moderation (add up to 5 grace marks for borderline cases)
  const applyModeration = async () => {
    const borderline = filteredMarks.filter(m => {
      if (!m.total_marks) return false;
      const pct = (m.total_marks / (m.internal_max + m.external_max)) * 100;
      return pct >= 35 && pct < 40;
    });
    if (!borderline.length) { toast('No students qualify for moderation', 'info'); return; }

    let moderated = 0;
    for (const m of borderline) {
      const currentTotal = m.total_marks;
      const maxTotal = m.internal_max + m.external_max;
      const neededForPass = Math.ceil(maxTotal * 0.4);
      const grace = Math.min(5, neededForPass - currentTotal);
      if (grace <= 0) continue;
      const newTotal = currentTotal + grace;
      const pct = (newTotal / maxTotal) * 100;
      const grade = pct >= 40 ? 'C' : 'F';
      const { error } = await supabase.from('mark_entries').update({
        total_marks: newTotal, grade, moderated: true, status: 'submitted'
      }).eq('id', m.id);
      if (!error) moderated++;
    }
    toast(`Moderation applied to ${moderated} students`);
    loadMarks();
  };

  const TABS = [
    { id: 'entry' as Tab, name: 'Mark Entry', icon: Edit3 },
    { id: 'moderation' as Tab, name: 'Moderation', icon: TrendingUp },
    { id: 'revaluation' as Tab, name: 'Revaluation', icon: RotateCcw },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Mark Entry & Evaluation" subtitle="Enter, verify, and process student marks">
        <ActionButton variant="secondary" onClick={downloadImportTemplate}><Upload className="w-4 h-4" />Import Template</ActionButton>
        <ActionButton variant="secondary" onClick={exportMarks}><Download className="w-4 h-4" />Export</ActionButton>
        <ActionButton onClick={saveAllMarks}><Save className="w-4 h-4" />Save All</ActionButton>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Entries" value={counts.total} color="blue" />
        <StatCard label="Pending Entry" value={counts.pending} color="amber" />
        <StatCard label="Submitted" value={counts.submitted} color="slate" />
        <StatCard label="Verified" value={counts.verified} color="emerald" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}>
              <t.icon className="w-4 h-4" />{t.name}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
          </select>
        </div>

        {loading ? <LoadingState /> : (
          <>
            {activeTab === 'entry' && (
              <DataTable columns={['Roll No', 'Name', 'Subject', 'Internal', 'External', 'Total', 'Grade', 'Status', 'Actions']}>
                {filteredMarks.length === 0
                  ? <tr><td colSpan={9}><EmptyState message="No mark entries found" /></td></tr>
                  : filteredMarks.map(m => {
                    const isEditing = editingMark?.id === m.id;
                    return (
                      <TableRow key={m.id}>
                        <Td><span className="font-mono text-xs">{m.students?.roll_no}</span></Td>
                        <Td className="font-medium text-slate-800">{m.students?.name}</Td>
                        <Td className="text-slate-500 text-xs">{m.subjects?.code}</Td>
                        <Td className="text-slate-600">{m.internal_marks}/{m.internal_max}</Td>
                        <Td>
                          {isEditing ? (
                            <input
                              type="number"
                              defaultValue={editingMark.external_marks ?? ''}
                              id={`ext-${m.id}`}
                              max={m.external_max} min={0}
                              className="w-20 px-2 py-1 border border-blue-500 rounded-lg text-sm focus:outline-none"
                            />
                          ) : (
                            <span className={m.external_marks !== null ? 'text-slate-800' : 'text-slate-400'}>
                              {m.external_marks ?? '-'}/{m.external_max}
                            </span>
                          )}
                        </Td>
                        <Td><span className="font-semibold text-slate-800">{m.total_marks ?? '-'}</span></Td>
                        <Td>
                          {m.grade ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              m.grade === 'O' || m.grade === 'A+' ? 'bg-emerald-100 text-emerald-700' :
                              m.grade === 'A' || m.grade === 'B+' ? 'bg-blue-100 text-blue-700' :
                              m.grade === 'F' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>{m.grade}</span>
                          ) : <span className="text-slate-400">-</span>}
                        </Td>
                        <Td><StatusBadge status={m.status} /></Td>
                        <Td>
                          <div className="flex gap-1">
                            {isEditing ? (
                              <>
                                <button onClick={() => {
                                  const el = document.getElementById(`ext-${m.id}`) as HTMLInputElement;
                                  saveMark(editingMark, Number(el?.value));
                                }} className="p-1.5 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                                <button onClick={() => setEditingMark(null)} className="p-1.5 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4 text-red-500" /></button>
                              </>
                            ) : (
                              <>
                                {m.status !== 'verified' && (
                                  <button onClick={() => setEditingMark(m)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit3 className="w-4 h-4 text-slate-500" /></button>
                                )}
                                {m.status === 'submitted' && (
                                  <button onClick={() => verifyMark(m.id)} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Verify"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                                )}
                              </>
                            )}
                          </div>
                        </Td>
                      </TableRow>
                    );
                  })}
              </DataTable>
            )}

            {activeTab === 'moderation' && (
              <div className="p-6 space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Moderation Rules</p>
                    <p className="text-sm text-amber-700 mt-1">Moderation applies when pass % is below 40% or above 95%. Max moderation: +5 marks.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Pass Percentage</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {marks.length > 0 ? Math.round((marks.filter(m => m.grade && m.grade !== 'F').length / marks.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Average Score</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {marks.filter(m => m.total_marks).length > 0
                        ? (marks.reduce((s, m) => s + (m.total_marks ?? 0), 0) / marks.filter(m => m.total_marks).length).toFixed(1)
                        : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Entries Verified</p>
                    <p className="text-2xl font-bold text-blue-600">{counts.verified}/{counts.total}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ActionButton onClick={applyModeration}>Apply Moderation</ActionButton>
                  <ActionButton variant="secondary" onClick={exportMarks}>Export Distribution</ActionButton>
                </div>
              </div>
            )}

            {activeTab === 'revaluation' && (
              <DataTable columns={['Roll No', 'Student', 'Subject', 'Orig Marks', 'Revised', 'Requested', 'Status', 'Actions']}>
                {revaluations.length === 0
                  ? <tr><td colSpan={8}><EmptyState message="No revaluation requests" /></td></tr>
                  : revaluations.map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td className="text-slate-600 text-xs">{r.subjects?.name}</Td>
                      <Td className="text-slate-600">{r.original_marks}</Td>
                      <Td>
                        {r.revised_marks
                          ? <span className={`font-medium ${r.revised_marks > r.original_marks ? 'text-emerald-600' : 'text-slate-800'}`}>{r.revised_marks}</span>
                          : <span className="text-slate-400">—</span>}
                      </Td>
                      <Td className="text-slate-500 text-xs">{new Date(r.requested_at).toLocaleDateString()}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        <div className="flex gap-1">
                          {r.status === 'pending' && (
                            <>
                              <ActionButton size="sm" variant="success" onClick={() => updateRevalStatus(r.id, 'approved')}>Approve</ActionButton>
                              <ActionButton size="sm" variant="danger" onClick={() => updateRevalStatus(r.id, 'rejected')}>Reject</ActionButton>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <ActionButton size="sm" onClick={() => {
                              const marks = prompt(`Enter revised marks for ${r.students?.name}:`);
                              if (marks) updateRevalStatus(r.id, 'completed', Number(marks));
                            }}>Enter Marks</ActionButton>
                          )}
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}
          </>
        )}
      </div>
    </div>
  );
}
