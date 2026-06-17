import { useState, useEffect, useCallback } from 'react';
import { Calendar, BookOpen, Settings, Layers, GraduationCap, Plus, Search, Edit2, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, ErrorState, EmptyState
} from '../components/ui';

type Tab = 'academic-year' | 'semester' | 'exam-types' | 'subject-mapping' | 'program-mapping';

const TABS: { id: Tab; name: string; icon: React.ElementType }[] = [
  { id: 'academic-year', name: 'Academic Year', icon: Calendar },
  { id: 'semester', name: 'Semester', icon: Layers },
  { id: 'exam-types', name: 'Exam Types', icon: Settings },
  { id: 'subject-mapping', name: 'Subject Mapping', icon: BookOpen },
  { id: 'program-mapping', name: 'Program Mapping', icon: GraduationCap },
];

export default function ExamMaster() {
  const [activeTab, setActiveTab] = useState<Tab>('academic-year');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openCreate = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (item: any) => { setEditItem(item); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditItem(null); };
  const handleSaved = () => { closeModal(); setRefreshKey(k => k + 1); };

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Master Management" subtitle="Configure academic years, semesters, exam types and mappings">
        <ActionButton onClick={openCreate}><Plus className="w-4 h-4" /> Add New</ActionButton>
      </PageHeader>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />{tab.name}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input className="pl-10" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {activeTab === 'academic-year' && <AcademicYears search={search} onEdit={openEdit} refreshKey={refreshKey} />}
        {activeTab === 'semester' && <Semesters search={search} onEdit={openEdit} refreshKey={refreshKey} />}
        {activeTab === 'exam-types' && <ExamTypes search={search} onEdit={openEdit} refreshKey={refreshKey} />}
        {activeTab === 'subject-mapping' && <Subjects search={search} onEdit={openEdit} refreshKey={refreshKey} />}
        {activeTab === 'program-mapping' && <Programs search={search} onEdit={openEdit} refreshKey={refreshKey} />}
      </div>

      {showModal && (
        <Modal title={`${editItem ? 'Edit' : 'Add'} ${TABS.find(t => t.id === activeTab)?.name}`} onClose={closeModal}>
          {activeTab === 'academic-year' && <AcademicYearForm item={editItem} onClose={handleSaved} />}
          {activeTab === 'semester' && <SemesterForm item={editItem} onClose={handleSaved} />}
          {activeTab === 'exam-types' && <ExamTypeForm item={editItem} onClose={handleSaved} />}
          {activeTab === 'subject-mapping' && <SubjectForm item={editItem} onClose={handleSaved} />}
          {activeTab === 'program-mapping' && <ProgramForm item={editItem} onClose={handleSaved} />}
        </Modal>
      )}
    </div>
  );
}

// ─── Academic Years ───────────────────────────────────────────
function AcademicYears({ search, onEdit, refreshKey }: { search: string; onEdit: (item: any) => void; refreshKey: number }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('academic_years').select('*').order('name', { ascending: false });
    if (error) setError(error.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const del = async (id: string) => {
    if (!confirm('Delete this academic year?')) return;
    const { error } = await supabase.from('academic_years').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted successfully'); load(); }
  };

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <DataTable columns={['Name', 'Start Date', 'End Date', 'Status', 'Actions']}>
      {filtered.length === 0 ? (
        <tr><td colSpan={5}><EmptyState message="No academic years found" /></td></tr>
      ) : filtered.map(r => (
        <TableRow key={r.id}>
          <Td><span className="font-semibold text-slate-800">{r.name}</span></Td>
          <Td className="text-slate-600">{r.start_date}</Td>
          <Td className="text-slate-600">{r.end_date}</Td>
          <Td><StatusBadge status={r.status} /></Td>
          <Td>
            <div className="flex gap-2">
              <button onClick={() => onEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-500" /></button>
              <button onClick={() => del(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </Td>
        </TableRow>
      ))}
    </DataTable>
  );
}

function AcademicYearForm({ item, onClose }: { item: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: item?.name ?? '', start_date: item?.start_date ?? '', end_date: item?.end_date ?? '', status: item?.status ?? 'active' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!form.name || !form.start_date || !form.end_date) { toast('All fields required', 'error'); return; }
    setSaving(true);
    const { error } = item
      ? await supabase.from('academic_years').update(form).eq('id', item.id)
      : await supabase.from('academic_years').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(item ? 'Updated' : 'Created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Year Name" required><Input placeholder="e.g. 2024-25" value={form.name} onChange={f('name')} /></FormField>
      <FormField label="Start Date" required><Input type="date" value={form.start_date} onChange={f('start_date')} /></FormField>
      <FormField label="End Date" required><Input type="date" value={form.end_date} onChange={f('end_date')} /></FormField>
      <FormField label="Status"><Select value={form.status} onChange={f('status')} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}><Save className="w-4 h-4" />Save</ActionButton>
      </div>
    </div>
  );
}

// ─── Semesters ────────────────────────────────────────────────
function Semesters({ search, onEdit, refreshKey }: { search: string; onEdit: (item: any) => void; refreshKey: number }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('semesters').select('*, academic_years(name)').order('name');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const del = async (id: string) => {
    if (!confirm('Delete this semester?')) return;
    const { error } = await supabase.from('semesters').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted'); load(); }
  };

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <LoadingState />;

  return (
    <DataTable columns={['Name', 'Academic Year', 'Start Date', 'End Date', 'Status', 'Actions']}>
      {filtered.length === 0
        ? <tr><td colSpan={6}><EmptyState message="No semesters found" /></td></tr>
        : filtered.map(r => (
          <TableRow key={r.id}>
            <Td className="font-semibold text-slate-800">{r.name}</Td>
            <Td className="text-slate-600">{r.academic_years?.name ?? '-'}</Td>
            <Td className="text-slate-600">{r.start_date}</Td>
            <Td className="text-slate-600">{r.end_date}</Td>
            <Td><StatusBadge status={r.status} /></Td>
            <Td>
              <div className="flex gap-2">
                <button onClick={() => onEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                <button onClick={() => del(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </Td>
          </TableRow>
        ))}
    </DataTable>
  );
}

function SemesterForm({ item, onClose }: { item: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: item?.name ?? '', academic_year_id: item?.academic_year_id ?? '',
    start_date: item?.start_date ?? '', end_date: item?.end_date ?? '', status: item?.status ?? 'active',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    supabase.from('academic_years').select('id,name').then(({ data }) => setAcademicYears(data ?? []));
  }, []);

  const save = async () => {
    if (!form.name || !form.academic_year_id) { toast('All fields required', 'error'); return; }
    setSaving(true);
    const { error } = item
      ? await supabase.from('semesters').update(form).eq('id', item.id)
      : await supabase.from('semesters').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(item ? 'Updated' : 'Created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Semester Name" required><Input placeholder="e.g. Semester 6" value={form.name} onChange={f('name')} /></FormField>
      <FormField label="Academic Year" required>
        <Select value={form.academic_year_id} onChange={f('academic_year_id')} placeholder="Select year"
          options={academicYears.map(y => ({ value: y.id, label: y.name }))} />
      </FormField>
      <FormField label="Start Date"><Input type="date" value={form.start_date} onChange={f('start_date')} /></FormField>
      <FormField label="End Date"><Input type="date" value={form.end_date} onChange={f('end_date')} /></FormField>
      <FormField label="Status"><Select value={form.status} onChange={f('status')} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}><Save className="w-4 h-4" />Save</ActionButton>
      </div>
    </div>
  );
}

// ─── Exam Types ───────────────────────────────────────────────
function ExamTypes({ search, onEdit, refreshKey }: { search: string; onEdit: (item: any) => void; refreshKey: number }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('exam_types').select('*').order('name');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const del = async (id: string) => {
    if (!confirm('Delete this exam type?')) return;
    const { error } = await supabase.from('exam_types').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted'); load(); }
  };

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <LoadingState />;

  return (
    <DataTable columns={['Name', 'Code', 'Max Marks', 'Passing Marks', 'Status', 'Actions']}>
      {filtered.length === 0
        ? <tr><td colSpan={6}><EmptyState message="No exam types found" /></td></tr>
        : filtered.map(r => (
          <TableRow key={r.id}>
            <Td className="font-semibold text-slate-800">{r.name}</Td>
            <Td><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-mono text-xs">{r.code}</span></Td>
            <Td className="text-slate-600">{r.max_marks}</Td>
            <Td className="text-slate-600">{r.passing_marks}</Td>
            <Td><StatusBadge status={r.status} /></Td>
            <Td>
              <div className="flex gap-2">
                <button onClick={() => onEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                <button onClick={() => del(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </Td>
          </TableRow>
        ))}
    </DataTable>
  );
}

function ExamTypeForm({ item, onClose }: { item: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: item?.name ?? '', code: item?.code ?? '', max_marks: item?.max_marks ?? 80, passing_marks: item?.passing_marks ?? 32, status: item?.status ?? 'active' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const save = async () => {
    if (!form.name || !form.code) { toast('Name and code required', 'error'); return; }
    setSaving(true);
    const { error } = item
      ? await supabase.from('exam_types').update(form).eq('id', item.id)
      : await supabase.from('exam_types').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(item ? 'Updated' : 'Created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Exam Type Name" required><Input placeholder="e.g. Internal Assessment 1" value={form.name} onChange={f('name')} /></FormField>
      <FormField label="Code" required><Input placeholder="e.g. IA1" value={form.code} onChange={f('code')} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Max Marks"><Input type="number" value={form.max_marks} onChange={f('max_marks')} /></FormField>
        <FormField label="Passing Marks"><Input type="number" value={form.passing_marks} onChange={f('passing_marks')} /></FormField>
      </div>
      <FormField label="Status"><Select value={form.status} onChange={f('status')} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}><Save className="w-4 h-4" />Save</ActionButton>
      </div>
    </div>
  );
}

// ─── Subjects ─────────────────────────────────────────────────
function Subjects({ search, onEdit, refreshKey }: { search: string; onEdit: (item: any) => void; refreshKey: number }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('subjects').select('*, departments(code), programs(name)').order('code');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const del = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted'); load(); }
  };

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())
  );
  if (loading) return <LoadingState />;

  return (
    <DataTable columns={['Code', 'Subject Name', 'Credits', 'Dept', 'Program', 'Semester', 'Actions']}>
      {filtered.length === 0
        ? <tr><td colSpan={7}><EmptyState message="No subjects found" /></td></tr>
        : filtered.map(r => (
          <TableRow key={r.id}>
            <Td><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-xs">{r.code}</span></Td>
            <Td className="font-semibold text-slate-800">{r.name}</Td>
            <Td className="text-slate-600">{r.credits}</Td>
            <Td><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{r.departments?.code ?? '-'}</span></Td>
            <Td className="text-slate-600 max-w-[160px] truncate">{r.programs?.name ?? '-'}</Td>
            <Td className="text-slate-600">Sem {r.semester_number}</Td>
            <Td>
              <div className="flex gap-2">
                <button onClick={() => onEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                <button onClick={() => del(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </Td>
          </TableRow>
        ))}
    </DataTable>
  );
}

function SubjectForm({ item, onClose }: { item: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: item?.code ?? '', name: item?.name ?? '', credits: item?.credits ?? 3,
    department_id: item?.department_id ?? '', program_id: item?.program_id ?? '',
    semester_number: item?.semester_number ?? 1, status: item?.status ?? 'active',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    supabase.from('departments').select('id,code').then(({ data }) => setDepartments(data ?? []));
    supabase.from('programs').select('id,name').then(({ data }) => setPrograms(data ?? []));
  }, []);

  const save = async () => {
    if (!form.code || !form.name) { toast('Code and name required', 'error'); return; }
    setSaving(true);
    const { error } = item
      ? await supabase.from('subjects').update(form).eq('id', item.id)
      : await supabase.from('subjects').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(item ? 'Updated' : 'Created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Subject Code" required><Input placeholder="CS601" value={form.code} onChange={f('code')} /></FormField>
        <FormField label="Credits"><Input type="number" min={1} max={6} value={form.credits} onChange={f('credits')} /></FormField>
      </div>
      <FormField label="Subject Name" required><Input placeholder="Machine Learning" value={form.name} onChange={f('name')} /></FormField>
      <FormField label="Department">
        <Select value={form.department_id} onChange={f('department_id')} placeholder="Select department"
          options={departments.map(d => ({ value: d.id, label: d.code }))} />
      </FormField>
      <FormField label="Program">
        <Select value={form.program_id} onChange={f('program_id')} placeholder="Select program"
          options={programs.map(p => ({ value: p.id, label: p.name }))} />
      </FormField>
      <FormField label="Semester Number">
        <Select value={String(form.semester_number)} onChange={f('semester_number')}
          options={[1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Semester ${n}` }))} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}><Save className="w-4 h-4" />Save</ActionButton>
      </div>
    </div>
  );
}

// ─── Programs ─────────────────────────────────────────────────
function Programs({ search, onEdit, refreshKey }: { search: string; onEdit: (item: any) => void; refreshKey: number }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('programs').select('*, departments(code,name)').order('name');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const del = async (id: string) => {
    if (!confirm('Delete this program?')) return;
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Deleted'); load(); }
  };

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <LoadingState />;

  return (
    <DataTable columns={['Code', 'Program Name', 'Department', 'Duration', 'Status', 'Actions']}>
      {filtered.length === 0
        ? <tr><td colSpan={6}><EmptyState message="No programs found" /></td></tr>
        : filtered.map(r => (
          <TableRow key={r.id}>
            <Td><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-mono text-xs">{r.code}</span></Td>
            <Td className="font-semibold text-slate-800">{r.name}</Td>
            <Td><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{r.departments?.code ?? '-'}</span></Td>
            <Td className="text-slate-600">{r.duration_years} yrs</Td>
            <Td><StatusBadge status={r.status} /></Td>
            <Td>
              <div className="flex gap-2">
                <button onClick={() => onEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4 text-slate-500" /></button>
                <button onClick={() => del(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </Td>
          </TableRow>
        ))}
    </DataTable>
  );
}

function ProgramForm({ item, onClose }: { item: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({ code: item?.code ?? '', name: item?.name ?? '', department_id: item?.department_id ?? '', duration_years: item?.duration_years ?? 4, status: item?.status ?? 'active' });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    supabase.from('departments').select('id,code,name').then(({ data }) => setDepartments(data ?? []));
  }, []);

  const save = async () => {
    if (!form.code || !form.name) { toast('Code and name required', 'error'); return; }
    setSaving(true);
    const { error } = item
      ? await supabase.from('programs').update(form).eq('id', item.id)
      : await supabase.from('programs').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(item ? 'Updated' : 'Created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Program Code" required><Input placeholder="BTECH-CSE" value={form.code} onChange={f('code')} /></FormField>
      <FormField label="Program Name" required><Input placeholder="B.Tech Computer Science" value={form.name} onChange={f('name')} /></FormField>
      <FormField label="Department">
        <Select value={form.department_id} onChange={f('department_id')} placeholder="Select department"
          options={departments.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }))} />
      </FormField>
      <FormField label="Duration (Years)"><Input type="number" min={1} max={6} value={form.duration_years} onChange={f('duration_years')} /></FormField>
      <FormField label="Status"><Select value={form.status} onChange={f('status')} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} /></FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}><Save className="w-4 h-4" />Save</ActionButton>
      </div>
    </div>
  );
}
