import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Search, Download, Filter, Users, UserCheck, DollarSign, BookOpen, CheckSquare, Plus, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';

type Tab = 'attendance' | 'fee' | 'internal' | 'approval';

const TABS: { id: Tab; name: string; icon: React.ElementType; field: string; threshold: number; unit: string }[] = [
  { id: 'attendance', name: 'Attendance', icon: UserCheck, field: 'attendance_pct', threshold: 75, unit: '%' },
  { id: 'fee', name: 'Fee Due', icon: DollarSign, field: 'fee_due', threshold: 0, unit: '₹' },
  { id: 'internal', name: 'Internal Marks', icon: BookOpen, field: 'internal_marks_pct', threshold: 50, unit: '%' },
  { id: 'approval', name: 'Approval', icon: CheckSquare, field: 'eligibility_status', threshold: 0, unit: '' },
];

export default function StudentEligibility() {
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editStudent, setEditStudent] = useState<any>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('students').select('*, programs(name, code)').order('roll_no');
    if (programFilter) q = q.eq('program_id', programFilter);
    const { data } = await q;
    setStudents(data ?? []);
    setLoading(false);
  }, [programFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    supabase.from('programs').select('id,name').then(({ data }) => setPrograms(data ?? []));
  }, []);

  const updateEligibility = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('students').update({ eligibility_status: status }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast(`Student ${status}`); load(); }
  };

  const bulkApprove = async () => {
    if (!selected.length) { toast('Select students first', 'info'); return; }
    const { error } = await supabase.from('students').update({ eligibility_status: 'approved' }).in('id', selected);
    if (error) toast(error.message, 'error');
    else { toast(`${selected.length} students approved`); setSelected([]); load(); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  const approved = students.filter(s => s.eligibility_status === 'approved').length;
  const pending = students.filter(s => s.eligibility_status === 'pending').length;
  const rejected = students.filter(s => s.eligibility_status === 'rejected').length;

  const tab = TABS.find(t => t.id === activeTab)!;

  const isEligible = (s: any) => {
    if (activeTab === 'fee') return s.fee_due <= 0;
    if (activeTab === 'attendance') return s.attendance_pct >= 75;
    if (activeTab === 'internal') return s.internal_marks_pct >= 50;
    return s.eligibility_status === 'approved';
  };

  const getMetricDisplay = (s: any) => {
    if (activeTab === 'attendance') return `${s.attendance_pct}%`;
    if (activeTab === 'fee') return `₹${s.fee_due}`;
    if (activeTab === 'internal') return `${s.internal_marks_pct}%`;
    return s.eligibility_status;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Eligibility" subtitle="Verify attendance, fee clearance, and internal marks">
        <ActionButton variant="secondary" onClick={() => toast('Exported', 'info')}><Download className="w-4 h-4" />Export</ActionButton>
        <ActionButton onClick={bulkApprove}><CheckCircle className="w-4 h-4" />Bulk Approve ({selected.length})</ActionButton>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Eligible / Approved" value={approved} icon={CheckCircle} color="emerald" />
        <StatCard label="Pending Review" value={pending} icon={Users} color="amber" />
        <StatCard label="Not Eligible" value={rejected} icon={XCircle} color="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
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

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search Roll No or Name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? <LoadingState /> : (
          <DataTable columns={['', 'Roll No', 'Name', 'Program', 'Sem', tab.name, 'Eligibility', 'Actions']}>
            {filtered.length === 0
              ? <tr><td colSpan={8}><EmptyState message="No students found" /></td></tr>
              : filtered.map(s => (
                <TableRow key={s.id}>
                  <Td>
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300"
                      checked={selected.includes(s.id)}
                      onChange={e => setSelected(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} />
                  </Td>
                  <Td><span className="font-mono text-sm">{s.roll_no}</span></Td>
                  <Td className="font-medium text-slate-800">{s.name}</Td>
                  <Td className="text-slate-500 text-xs">{s.programs?.name ?? '-'}</Td>
                  <Td className="text-slate-500">Sem {s.current_semester}</Td>
                  <Td>
                    <span className={`font-medium text-sm ${isEligible(s) ? 'text-emerald-600' : 'text-red-600'}`}>
                      {getMetricDisplay(s)}
                    </span>
                  </Td>
                  <Td><StatusBadge status={s.eligibility_status} /></Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditStudent(s)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Edit">
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      {s.eligibility_status !== 'approved' && (
                        <button onClick={() => updateEligibility(s.id, 'approved')} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </button>
                      )}
                      {s.eligibility_status !== 'rejected' && (
                        <button onClick={() => updateEligibility(s.id, 'rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </Td>
                </TableRow>
              ))}
          </DataTable>
        )}

        <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      {editStudent && (
        <Modal title="Edit Student Metrics" onClose={() => setEditStudent(null)}>
          <StudentMetricsForm student={editStudent} onClose={() => { setEditStudent(null); load(); }} />
        </Modal>
      )}
    </div>
  );
}

function StudentMetricsForm({ student, onClose }: { student: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    attendance_pct: student.attendance_pct ?? 0,
    fee_due: student.fee_due ?? 0,
    internal_marks_pct: student.internal_marks_pct ?? 0,
    eligibility_status: student.eligibility_status ?? 'pending',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('students').update(form).eq('id', student.id);
    if (error) toast(error.message, 'error');
    else { toast('Student updated'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        <p className="font-semibold text-slate-800">{student.name}</p>
        <p className="text-sm text-slate-500">{student.roll_no}</p>
      </div>
      <FormField label="Attendance (%)">
        <Input type="number" min={0} max={100} step={0.1} value={form.attendance_pct} onChange={f('attendance_pct')} />
      </FormField>
      <FormField label="Fee Due (₹)">
        <Input type="number" min={0} value={form.fee_due} onChange={f('fee_due')} />
      </FormField>
      <FormField label="Internal Marks (%)">
        <Input type="number" min={0} max={100} step={0.1} value={form.internal_marks_pct} onChange={f('internal_marks_pct')} />
      </FormField>
      <FormField label="Eligibility Status">
        <Select value={form.eligibility_status} onChange={f('eligibility_status')}
          options={[{value:'pending',label:'Pending'},{value:'approved',label:'Approved'},{value:'rejected',label:'Rejected'}]} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}>Save Changes</ActionButton>
      </div>
    </div>
  );
}
