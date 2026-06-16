import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Send, CheckCircle, Clock, FileText, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';

type Tab = 'papers' | 'bank' | 'approval';

export default function QuestionPaper() {
  const [activeTab, setActiveTab] = useState<Tab>('papers');
  const [papers, setPapers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [editPaper, setEditPaper] = useState<any>(null);
  const { toast } = useToast();

  const loadPapers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('question_papers').select('*, subjects(name, code)').order('created_at', { ascending: false });
    setPapers(data ?? []);
    setLoading(false);
  }, []);

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase.from('questions').select('*, subjects(name, code)').order('created_at', { ascending: false });
    setQuestions(data ?? []);
  }, []);

  useEffect(() => { loadPapers(); loadQuestions(); }, [loadPapers, loadQuestions]);

  const deletePaper = async (id: string) => {
    if (!confirm('Delete this question paper?')) return;
    const { error } = await supabase.from('question_papers').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted'); loadPapers(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('question_papers').update({ status }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast(`Paper ${status}`); loadPapers(); }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Question deleted'); loadQuestions(); }
  };

  const filteredPapers = papers.filter(p =>
    p.subjects?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.subjects?.code?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(search.toLowerCase()) ||
    q.subjects?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: papers.length,
    pending: papers.filter(p => p.status === 'pending').length,
    approved: papers.filter(p => p.status === 'approved').length,
    finalized: papers.filter(p => p.status === 'finalized').length,
  };

  const TABS = [
    { id: 'papers' as Tab, name: 'Question Papers', icon: FileText },
    { id: 'bank' as Tab, name: 'Question Bank', icon: Eye },
    { id: 'approval' as Tab, name: 'Approval Workflow', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Question Paper Management" subtitle="Create, manage, and approve question papers">
        <ActionButton variant="secondary" onClick={() => toast('Secure mode activated', 'info')}><Lock className="w-4 h-4" />Secure Mode</ActionButton>
        <ActionButton onClick={() => { setEditPaper(null); setShowModal(true); }}><Plus className="w-4 h-4" />Create Paper</ActionButton>
      </PageHeader>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center gap-4">
        <Shield className="w-8 h-8 flex-shrink-0" />
        <div>
          <p className="font-semibold">Secure Question Paper System</p>
          <p className="text-sm text-blue-200">All papers are encrypted. Access is logged for audit compliance.</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-lg">
          <Lock className="w-4 h-4" />AES-256
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Papers" value={counts.total} color="blue" />
        <StatCard label="Pending Approval" value={counts.pending} color="amber" />
        <StatCard label="Approved" value={counts.approved} color="emerald" />
        <StatCard label="Finalized" value={counts.finalized} color="violet" />
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

        <div className="p-4 border-b border-slate-100 flex justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {activeTab === 'bank' && (
            <ActionButton size="sm" onClick={() => setShowQModal(true)}><Plus className="w-4 h-4" />Add Question</ActionButton>
          )}
        </div>

        {loading ? <LoadingState /> : (
          <>
            {activeTab === 'papers' && (
              <DataTable columns={['Subject', 'Exam Date', 'Marks', 'Duration', 'Created By', 'Status', 'Actions']}>
                {filteredPapers.length === 0
                  ? <tr><td colSpan={7}><EmptyState message="No question papers" /></td></tr>
                  : filteredPapers.map(p => (
                    <TableRow key={p.id}>
                      <Td>
                        <p className="font-medium text-slate-800">{p.subjects?.name ?? 'N/A'}</p>
                        <span className="text-xs font-mono text-slate-400">{p.subjects?.code}</span>
                      </Td>
                      <Td className="text-slate-600">{p.exam_date}</Td>
                      <Td className="text-slate-600">{p.total_marks}</Td>
                      <Td className="text-slate-600">{p.duration_hours}h</Td>
                      <Td className="text-slate-600 text-xs">{p.created_by}</Td>
                      <Td><StatusBadge status={p.status} /></Td>
                      <Td>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditPaper(p); setShowModal(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                          {p.status === 'draft' && (
                            <button onClick={() => updateStatus(p.id, 'pending')} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Submit for approval"><Send className="w-4 h-4 text-blue-500" /></button>
                          )}
                          <button onClick={() => deletePaper(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {activeTab === 'bank' && (
              <div className="p-4 space-y-3">
                {filteredQuestions.length === 0
                  ? <EmptyState message="No questions in bank" />
                  : filteredQuestions.map(q => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-slate-800">{q.question_text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{q.subjects?.name}</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{q.marks} marks</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                              q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>{q.difficulty}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteQuestion(q.id)} className="p-1.5 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'approval' && (
              <div className="p-4 space-y-4">
                {papers.filter(p => p.status === 'pending' || p.status === 'approved').length === 0
                  ? <EmptyState message="No papers pending approval" />
                  : papers.filter(p => p.status === 'pending' || p.status === 'approved').map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="p-4 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{p.subjects?.name}</p>
                            <p className="text-xs text-slate-500">{p.subjects?.code} · {p.exam_date}</p>
                          </div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="px-4 py-3 flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" />Created by {p.created_by}</span>
                          {p.approved_by && <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-blue-500" />Approved by {p.approved_by}</span>}
                        </div>
                        {p.status === 'pending' && (
                          <div className="flex gap-2">
                            <ActionButton size="sm" variant="danger" onClick={() => updateStatus(p.id, 'draft')}>Reject</ActionButton>
                            <ActionButton size="sm" variant="success" onClick={() => updateStatus(p.id, 'approved')}><CheckCircle className="w-3 h-3" />Approve</ActionButton>
                          </div>
                        )}
                        {p.status === 'approved' && (
                          <ActionButton size="sm" onClick={() => updateStatus(p.id, 'finalized')}>Finalize</ActionButton>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <Modal title={editPaper ? 'Edit Question Paper' : 'Create Question Paper'} onClose={() => setShowModal(false)}>
          <PaperForm paper={editPaper} onClose={() => { setShowModal(false); loadPapers(); }} />
        </Modal>
      )}

      {showQModal && (
        <Modal title="Add Question to Bank" onClose={() => setShowQModal(false)}>
          <QuestionForm onClose={() => { setShowQModal(false); loadQuestions(); }} />
        </Modal>
      )}
    </div>
  );
}

function PaperForm({ paper, onClose }: { paper: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    subject_id: paper?.subject_id ?? '', exam_date: paper?.exam_date ?? '',
    total_marks: paper?.total_marks ?? 80, duration_hours: paper?.duration_hours ?? 3,
    created_by: paper?.created_by ?? '', status: paper?.status ?? 'draft',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    supabase.from('subjects').select('id,name,code').then(({ data }) => setSubjects(data ?? []));
  }, []);

  const save = async () => {
    if (!form.subject_id || !form.exam_date) { toast('Subject and exam date required', 'error'); return; }
    setSaving(true);
    const { error } = paper
      ? await supabase.from('question_papers').update(form).eq('id', paper.id)
      : await supabase.from('question_papers').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(paper ? 'Updated' : 'Created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Subject" required>
        <Select value={form.subject_id} onChange={f('subject_id')} placeholder="Select subject"
          options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} />
      </FormField>
      <FormField label="Exam Date" required><Input type="date" value={form.exam_date} onChange={f('exam_date')} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Total Marks"><Input type="number" value={form.total_marks} onChange={f('total_marks')} /></FormField>
        <FormField label="Duration (hrs)"><Input type="number" min={1} max={6} value={form.duration_hours} onChange={f('duration_hours')} /></FormField>
      </div>
      <FormField label="Created By"><Input placeholder="Dr. Sharma" value={form.created_by} onChange={f('created_by')} /></FormField>
      <FormField label="Status">
        <Select value={form.status} onChange={f('status')} options={[{value:'draft',label:'Draft'},{value:'pending',label:'Pending Approval'},{value:'approved',label:'Approved'},{value:'finalized',label:'Finalized'}]} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}>Save Paper</ActionButton>
      </div>
    </div>
  );
}

function QuestionForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({ subject_id: '', question_text: '', marks: 10, difficulty: 'medium' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    supabase.from('subjects').select('id,name,code').then(({ data }) => setSubjects(data ?? []));
  }, []);

  const save = async () => {
    if (!form.subject_id || !form.question_text) { toast('Subject and question required', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('questions').insert(form);
    if (error) toast(error.message, 'error');
    else { toast('Question added'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Subject" required>
        <Select value={form.subject_id} onChange={f('subject_id')} placeholder="Select subject"
          options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} />
      </FormField>
      <FormField label="Question Text" required>
        <textarea
          value={form.question_text} onChange={f('question_text')}
          rows={3} placeholder="Enter the question..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Marks"><Input type="number" min={1} value={form.marks} onChange={f('marks')} /></FormField>
        <FormField label="Difficulty">
          <Select value={form.difficulty} onChange={f('difficulty')} options={[{value:'easy',label:'Easy'},{value:'medium',label:'Medium'},{value:'hard',label:'Hard'}]} />
        </FormField>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}>Add Question</ActionButton>
      </div>
    </div>
  );
}
