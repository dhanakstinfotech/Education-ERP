import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download, CheckCircle, XCircle, Eye, CreditCard, RefreshCw, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';

type Tab = 'registration' | 'arrear' | 'fee' | 'approval';

const TABS = [
  { id: 'registration' as Tab, name: 'Student Registration', icon: UserPlus },
  { id: 'arrear' as Tab, name: 'Arrear Registration', icon: RefreshCw },
  { id: 'fee' as Tab, name: 'Fee Collection', icon: CreditCard },
  { id: 'approval' as Tab, name: 'Approval', icon: CheckCircle },
];

export default function ExamRegistration() {
  const [activeTab, setActiveTab] = useState<Tab>('registration');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [arrears, setArrears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('registrations')
      .select('*, students(name, roll_no), academic_years(name), exam_types(name)')
      .order('created_at', { ascending: false });
    setRegistrations(data ?? []);
    setLoading(false);
  }, []);

  const loadArrears = useCallback(async () => {
    const { data } = await supabase
      .from('arrear_registrations')
      .select('*, students(name, roll_no), subjects(name, code)')
      .order('created_at', { ascending: false });
    setArrears(data ?? []);
  }, []);

  useEffect(() => { loadRegistrations(); loadArrears(); }, [loadRegistrations, loadArrears]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast(`Registration ${status}`); loadRegistrations(); }
  };

  const updateFeeStatus = async (id: string, fee_status: string) => {
    const { error } = await supabase.from('registrations').update({ fee_status }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Fee status updated'); loadRegistrations(); }
  };

  const updateArrearStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('arrear_registrations').update({ status }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast(`Arrear ${status}`); loadArrears(); }
  };

  const totalCollected = registrations.filter(r => r.fee_status === 'paid').reduce((s, r) => s + Number(r.fee_amount), 0);
  const totalPending = registrations.filter(r => r.fee_status === 'pending').reduce((s, r) => s + Number(r.fee_amount), 0);

  const filteredRegs = registrations.filter(r =>
    r.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.students?.roll_no?.toLowerCase().includes(search.toLowerCase())
  );

  // Export registrations to CSV
  const exportRegistrations = () => {
    const data = filteredRegs.map(r => ({
      'Roll No': r.students?.roll_no ?? '',
      'Name': r.students?.name ?? '',
      'Academic Year': r.academic_years?.name ?? '',
      'Semester': r.semester_number,
      'Exam Type': r.exam_types?.name ?? '',
      'Fee Amount': r.fee_amount,
      'Fee Status': r.fee_status,
      'Status': r.status,
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
    a.download = `exam-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Registrations exported');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Registration" subtitle="Manage student registrations, arrears, and fee collection">
        <ActionButton variant="secondary" onClick={exportRegistrations}><Download className="w-4 h-4" />Export</ActionButton>
        <ActionButton onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />New Registration</ActionButton>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Registered" value={registrations.length} icon={UserPlus} color="blue" />
        <StatCard label="Fee Collected" value={`₹${totalCollected.toLocaleString()}`} icon={CreditCard} color="emerald" />
        <StatCard label="Fee Pending" value={`₹${totalPending.toLocaleString()}`} icon={CreditCard} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}>
              <t.icon className="w-4 h-4" />{t.name}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search Roll No or Name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <LoadingState /> : (
          <>
            {activeTab === 'registration' && (
              <DataTable columns={['Roll No', 'Student Name', 'Program', 'Sem', 'Exam Type', 'Fee', 'Fee Status', 'Status', 'Actions']}>
                {filteredRegs.length === 0
                  ? <tr><td colSpan={9}><EmptyState message="No registrations" /></td></tr>
                  : filteredRegs.map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td className="text-slate-500 text-xs">{r.academic_years?.name ?? '-'}</Td>
                      <Td className="text-slate-500">Sem {r.semester_number}</Td>
                      <Td className="text-slate-500 text-xs">{r.exam_types?.name ?? '-'}</Td>
                      <Td className="font-medium text-slate-800">₹{r.fee_amount}</Td>
                      <Td><StatusBadge status={r.fee_status} /></Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        <div className="flex gap-1">
                          {r.status === 'pending' && <>
                            <button onClick={() => updateStatus(r.id, 'approved')} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                            <button onClick={() => updateStatus(r.id, 'rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject"><XCircle className="w-4 h-4 text-red-500" /></button>
                          </>}
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {activeTab === 'arrear' && (
              <DataTable columns={['Roll No', 'Student', 'Subject', 'Orig Sem', 'Attempt', 'Fee', 'Status', 'Actions']}>
                {arrears.length === 0
                  ? <tr><td colSpan={8}><EmptyState message="No arrear registrations" /></td></tr>
                  : arrears.map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td className="text-slate-600">{r.subjects?.name ?? '-'}</Td>
                      <Td className="text-slate-500">Sem {r.original_semester}</Td>
                      <Td><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Attempt {r.attempt_number}</span></Td>
                      <Td className="font-medium text-slate-800">₹{r.fee_amount}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        {r.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => updateArrearStatus(r.id, 'approved')} className="p-1.5 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                            <button onClick={() => updateArrearStatus(r.id, 'rejected')} className="p-1.5 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4 text-red-500" /></button>
                          </div>
                        )}
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {activeTab === 'fee' && (
              <DataTable columns={['Roll No', 'Student', 'Amount', 'Fee Status', 'Reg Status', 'Action']}>
                {filteredRegs.filter(r => r.fee_status !== 'paid').length === 0
                  ? <tr><td colSpan={6}><EmptyState message="All fees collected!" icon={<CheckCircle className="w-12 h-12" />} /></td></tr>
                  : filteredRegs.filter(r => r.fee_status !== 'paid').map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td><span className="font-semibold text-red-600">₹{r.fee_amount}</span></Td>
                      <Td><StatusBadge status={r.fee_status} /></Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        <button
                          onClick={() => updateFeeStatus(r.id, 'paid')}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                        >
                          Mark Paid
                        </button>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {activeTab === 'approval' && (
              <DataTable columns={['Roll No', 'Student', 'Sem', 'Fee Status', 'Registered At', 'Status', 'Actions']}>
                {filteredRegs.filter(r => r.status === 'pending').length === 0
                  ? <tr><td colSpan={7}><EmptyState message="No pending approvals" /></td></tr>
                  : filteredRegs.filter(r => r.status === 'pending').map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td className="text-slate-500">Sem {r.semester_number}</Td>
                      <Td><StatusBadge status={r.fee_status} /></Td>
                      <Td className="text-slate-500 text-xs">{new Date(r.registered_at).toLocaleDateString()}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        <div className="flex gap-2">
                          <ActionButton size="sm" variant="success" onClick={() => updateStatus(r.id, 'approved')}>
                            <CheckCircle className="w-3 h-3" />Approve
                          </ActionButton>
                          <ActionButton size="sm" variant="danger" onClick={() => updateStatus(r.id, 'rejected')}>
                            <XCircle className="w-3 h-3" />Reject
                          </ActionButton>
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}
          </>
        )}
      </div>

      {showModal && (
        <Modal title="New Exam Registration" onClose={() => setShowModal(false)} size="lg">
          <RegistrationForm onClose={() => { setShowModal(false); loadRegistrations(); }} />
        </Modal>
      )}
    </div>
  );
}

function RegistrationForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: '', academic_year_id: '', semester_number: 6,
    exam_type_id: '', fee_amount: 3600, fee_status: 'pending', status: 'pending',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    supabase.from('students').select('id,name,roll_no').then(({ data }) => setStudents(data ?? []));
    supabase.from('academic_years').select('id,name').then(({ data }) => setAcademicYears(data ?? []));
    supabase.from('exam_types').select('id,name').then(({ data }) => setExamTypes(data ?? []));
  }, []);

  const save = async () => {
    if (!form.student_id || !form.academic_year_id) { toast('Student and academic year required', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('registrations').insert(form);
    if (error) toast(error.message, 'error');
    else { toast('Registration created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Student" required>
        <Select value={form.student_id} onChange={f('student_id')} placeholder="Select student"
          options={students.map(s => ({ value: s.id, label: `${s.roll_no} - ${s.name}` }))} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Academic Year" required>
          <Select value={form.academic_year_id} onChange={f('academic_year_id')} placeholder="Select year"
            options={academicYears.map(a => ({ value: a.id, label: a.name }))} />
        </FormField>
        <FormField label="Semester">
          <Select value={String(form.semester_number)} onChange={f('semester_number')}
            options={[1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Semester ${n}` }))} />
        </FormField>
      </div>
      <FormField label="Exam Type">
        <Select value={form.exam_type_id} onChange={f('exam_type_id')} placeholder="Select exam type"
          options={examTypes.map(e => ({ value: e.id, label: e.name }))} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fee Amount (₹)"><Input type="number" value={form.fee_amount} onChange={f('fee_amount')} /></FormField>
        <FormField label="Fee Status">
          <Select value={form.fee_status} onChange={f('fee_status')} options={[{value:'pending',label:'Pending'},{value:'paid',label:'Paid'},{value:'waived',label:'Waived'}]} />
        </FormField>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}>Create Registration</ActionButton>
      </div>
    </div>
  );
}
