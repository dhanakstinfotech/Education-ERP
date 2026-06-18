import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download, CheckCircle, XCircle, Eye, CreditCard, RefreshCw, UserPlus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';

type Tab = 'registration' | 'arrear' | 'fee' | 'approval';

const TABS = [
  { id: 'registration' as Tab, name: 'Exam Registrations', icon: UserPlus },
  { id: 'arrear' as Tab, name: 'Arrear Registrations', icon: RefreshCw },
  { id: 'fee' as Tab, name: 'Fee Collection', icon: CreditCard },
  { id: 'approval' as Tab, name: 'Pending Approvals', icon: CheckCircle },
];

export default function ExamRegistration() {
  const [activeTab, setActiveTab] = useState<Tab>('registration');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [arrears, setArrears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showArrearModal, setShowArrearModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const { toast } = useToast();

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('registrations')
      .select('*, students(name, roll_no, programs(name)), academic_years(name), exam_types(name)')
      .order('created_at', { ascending: false });
    setRegistrations(data ?? []);
    setLoading(false);
  }, []);

  const loadArrears = useCallback(async () => {
    const { data } = await supabase
      .from('arrear_registrations')
      .select('*, students(name, roll_no, programs(name)), subjects(name, code)')
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

  const deleteRegistration = async (id: string) => {
    if (!confirm('Delete this registration?')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Registration deleted'); loadRegistrations(); }
  };

  const deleteArrear = async (id: string) => {
    if (!confirm('Delete this arrear registration?')) return;
    const { error } = await supabase.from('arrear_registrations').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Arrear registration deleted'); loadArrears(); }
  };

  const totalCollected = registrations.filter(r => r.fee_status === 'paid').reduce((s, r) => s + Number(r.fee_amount), 0);
  const totalPending = registrations.filter(r => r.fee_status === 'pending').reduce((s, r) => s + Number(r.fee_amount), 0);
  const pendingApprovals = registrations.filter(r => r.status === 'pending').length;
  const arrearPending = arrears.filter(a => a.status === 'pending').length;

  const filteredRegs = registrations.filter(r =>
    r.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.students?.roll_no?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArrears = arrears.filter(a =>
    a.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.students?.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
    a.subjects?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportRegistrations = () => {
    const data = filteredRegs.map(r => ({
      'Roll No': r.students?.roll_no ?? '',
      'Name': r.students?.name ?? '',
      'Program': r.students?.programs?.name ?? '',
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

  const exportArrears = () => {
    const data = filteredArrears.map(a => ({
      'Roll No': a.students?.roll_no ?? '',
      'Name': a.students?.name ?? '',
      'Subject': a.subjects?.name ?? '',
      'Subject Code': a.subjects?.code ?? '',
      'Original Semester': a.original_semester,
      'Attempt': a.attempt_number,
      'Fee': a.fee_amount,
      'Status': a.status,
    }));
    if (!data.length) { toast('No arrears to export', 'info'); return; }
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arrear-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Arrears exported');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Registration" subtitle="Manage student registrations, arrears, and fee collection">
        <ActionButton variant="secondary" onClick={activeTab === 'arrear' ? exportArrears : exportRegistrations}>
          <Download className="w-4 h-4" />Export
        </ActionButton>
        {activeTab === 'arrear' ? (
          <ActionButton onClick={() => setShowArrearModal(true)}>
            <RefreshCw className="w-4 h-4" />New Arrear Registration
          </ActionButton>
        ) : (
          <ActionButton onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />New Registration
          </ActionButton>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Registrations" value={registrations.length} icon={UserPlus} color="blue" />
        <StatCard label="Fee Collected" value={`₹${totalCollected.toLocaleString()}`} icon={CreditCard} color="emerald" />
        <StatCard label="Fee Pending" value={`₹${totalPending.toLocaleString()}`} icon={DollarSign} color="amber" />
        <StatCard label="Pending Approvals" value={pendingApprovals + arrearPending} icon={CheckCircle} color="violet" />
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
            {/* Exam Registrations Tab */}
            {activeTab === 'registration' && (
              <DataTable columns={['Roll No', 'Student Name', 'Program', 'Sem', 'Exam Type', 'Fee', 'Fee Status', 'Status', 'Actions']}>
                {filteredRegs.length === 0
                  ? <tr><td colSpan={9}><EmptyState message="No registrations found" /></td></tr>
                  : filteredRegs.map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td className="text-slate-500 text-xs max-w-[120px] truncate">{r.students?.programs?.name ?? r.academic_years?.name ?? '-'}</Td>
                      <Td className="text-slate-500">Sem {r.semester_number}</Td>
                      <Td className="text-slate-500 text-xs">{r.exam_types?.name ?? 'Regular'}</Td>
                      <Td className="font-medium text-slate-800">₹{r.fee_amount?.toLocaleString()}</Td>
                      <Td><StatusBadge status={r.fee_status} /></Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedReg(r)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="View">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(r.id, 'approved')} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              </button>
                              <button onClick={() => updateStatus(r.id, 'rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                                <XCircle className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          {r.fee_status === 'pending' && (
                            <button onClick={() => updateFeeStatus(r.id, 'paid')} className="p-1.5 hover:bg-amber-50 rounded-lg" title="Mark Paid">
                              <DollarSign className="w-4 h-4 text-amber-500" />
                            </button>
                          )}
                          <button onClick={() => deleteRegistration(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {/* Arrear Registrations Tab */}
            {activeTab === 'arrear' && (
              <DataTable columns={['Roll No', 'Student', 'Program', 'Subject', 'Attempt', 'Fee', 'Status', 'Actions']}>
                {filteredArrears.length === 0
                  ? <tr><td colSpan={8}><EmptyState message="No arrear registrations" /></td></tr>
                  : filteredArrears.map(a => (
                    <TableRow key={a.id}>
                      <Td><span className="font-mono text-xs">{a.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{a.students?.name}</Td>
                      <Td className="text-slate-500 text-xs">{a.students?.programs?.name ?? '-'}</Td>
                      <Td>
                        <div>
                          <span className="text-slate-800 text-sm">{a.subjects?.name}</span>
                          <span className="block text-xs text-slate-400 font-mono">{a.subjects?.code}</span>
                        </div>
                      </Td>
                      <Td className="text-slate-500">Attempt {a.attempt_number} (Sem {a.original_semester})</Td>
                      <Td className="font-medium text-slate-800">₹{a.fee_amount}</Td>
                      <Td><StatusBadge status={a.status} /></Td>
                      <Td>
                        <div className="flex gap-1">
                          {a.status === 'pending' && (
                            <>
                              <button onClick={() => updateArrearStatus(a.id, 'approved')} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              </button>
                              <button onClick={() => updateArrearStatus(a.id, 'rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                                <XCircle className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          {a.status === 'approved' && (
                            <button onClick={() => updateArrearStatus(a.id, 'completed')} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Mark Completed">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            </button>
                          )}
                          <button onClick={() => deleteArrear(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {/* Fee Collection Tab */}
            {activeTab === 'fee' && (
              <DataTable columns={['Roll No', 'Student', 'Program', 'Fee Amount', 'Fee Status', 'Reg Status', 'Actions']}>
                {filteredRegs.filter(r => r.fee_status !== 'paid').length === 0
                  ? <tr><td colSpan={7}><EmptyState message="All fees collected!" /></td></tr>
                  : filteredRegs.filter(r => r.fee_status !== 'paid').map(r => (
                    <TableRow key={r.id}>
                      <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                      <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                      <Td className="text-slate-500 text-xs">{r.students?.programs?.name ?? '-'}</Td>
                      <Td><span className="font-semibold text-red-600">₹{r.fee_amount?.toLocaleString()}</span></Td>
                      <Td><StatusBadge status={r.fee_status} /></Td>
                      <Td><StatusBadge status={r.status} /></Td>
                      <Td>
                        <div className="flex gap-2">
                          <ActionButton size="sm" onClick={() => updateFeeStatus(r.id, 'paid')}>
                            <DollarSign className="w-3 h-3" />Mark Paid
                          </ActionButton>
                          <ActionButton size="sm" variant="secondary" onClick={() => updateFeeStatus(r.id, 'waived')}>
                            Waive
                          </ActionButton>
                        </div>
                      </Td>
                    </TableRow>
                  ))}
              </DataTable>
            )}

            {/* Pending Approvals Tab */}
            {activeTab === 'approval' && (
              <DataTable columns={['Type', 'Roll No', 'Student', 'Details', 'Fee', 'Status', 'Actions']}>
                {(() => {
                  const pendingRegs = filteredRegs.filter(r => r.status === 'pending');
                  const pendingArrs = filteredArrears.filter(a => a.status === 'pending');
                  if (pendingRegs.length === 0 && pendingArrs.length === 0) {
                    return <tr><td colSpan={7}><EmptyState message="No pending approvals" /></td></tr>;
                  }
                  return (
                    <>
                      {pendingRegs.map(r => (
                        <TableRow key={r.id}>
                          <Td>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Exam Reg</span>
                          </Td>
                          <Td><span className="font-mono text-xs">{r.students?.roll_no}</span></Td>
                          <Td className="font-medium text-slate-800">{r.students?.name}</Td>
                          <Td className="text-slate-500 text-xs">Sem {r.semester_number} - {r.exam_types?.name ?? 'Regular'}</Td>
                          <Td>
                            <span className={`font-medium ${r.fee_status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                              ₹{r.fee_amount?.toLocaleString()}
                            </span>
                            <span className={`ml-1 text-xs ${r.fee_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              ({r.fee_status})
                            </span>
                          </Td>
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
                      {pendingArrs.map(a => (
                        <TableRow key={a.id}>
                          <Td>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Arrear</span>
                          </Td>
                          <Td><span className="font-mono text-xs">{a.students?.roll_no}</span></Td>
                          <Td className="font-medium text-slate-800">{a.students?.name}</Td>
                          <Td className="text-slate-500 text-xs">{a.subjects?.name} (Attempt {a.attempt_number})</Td>
                          <Td>
                            <span className="font-medium text-slate-800">₹{a.fee_amount}</span>
                          </Td>
                          <Td><StatusBadge status={a.status} /></Td>
                          <Td>
                            <div className="flex gap-2">
                              <ActionButton size="sm" variant="success" onClick={() => updateArrearStatus(a.id, 'approved')}>
                                <CheckCircle className="w-3 h-3" />Approve
                              </ActionButton>
                              <ActionButton size="sm" variant="danger" onClick={() => updateArrearStatus(a.id, 'rejected')}>
                                <XCircle className="w-3 h-3" />Reject
                              </ActionButton>
                            </div>
                          </Td>
                        </TableRow>
                      ))}
                    </>
                  );
                })()}
              </DataTable>
            )}
          </>
        )}
      </div>

      {/* New Registration Modal */}
      {showModal && (
        <Modal title="New Exam Registration" onClose={() => setShowModal(false)} size="lg">
          <RegistrationForm onClose={() => { setShowModal(false); loadRegistrations(); }} />
        </Modal>
      )}

      {/* New Arrear Registration Modal */}
      {showArrearModal && (
        <Modal title="New Arrear Registration" onClose={() => setShowArrearModal(false)} size="lg">
          <ArrearForm onClose={() => { setShowArrearModal(false); loadArrears(); }} />
        </Modal>
      )}

      {/* View Registration Modal */}
      {selectedReg && (
        <Modal title="Registration Details" onClose={() => setSelectedReg(null)}>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Roll No</p>
                <p className="font-mono text-sm font-semibold text-slate-800">{selectedReg.students?.roll_no}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Student Name</p>
                <p className="font-semibold text-slate-800">{selectedReg.students?.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Program</p>
                <p className="text-sm text-slate-700">{selectedReg.students?.programs?.name ?? selectedReg.academic_years?.name ?? '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Semester</p>
                <p className="text-sm text-slate-700">Semester {selectedReg.semester_number}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Exam Type</p>
                <p className="text-sm text-slate-700">{selectedReg.exam_types?.name ?? 'Regular'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Fee Amount</p>
                <p className="text-sm font-semibold text-slate-800">₹{selectedReg.fee_amount?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Fee Status</p>
                <StatusBadge status={selectedReg.fee_status} />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Registration Status</p>
                <StatusBadge status={selectedReg.status} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {selectedReg.status === 'pending' && (
                <>
                  <ActionButton variant="success" onClick={() => { updateStatus(selectedReg.id, 'approved'); setSelectedReg(null); }}>
                    <CheckCircle className="w-4 h-4" />Approve
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => { updateStatus(selectedReg.id, 'rejected'); setSelectedReg(null); }}>
                    <XCircle className="w-4 h-4" />Reject
                  </ActionButton>
                </>
              )}
              {selectedReg.fee_status === 'pending' && (
                <ActionButton onClick={() => { updateFeeStatus(selectedReg.id, 'paid'); setSelectedReg(null); }}>
                  <DollarSign className="w-4 h-4" />Mark Paid
                </ActionButton>
              )}
              <ActionButton variant="secondary" onClick={() => setSelectedReg(null)}>Close</ActionButton>
            </div>
          </div>
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

function ArrearForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: '', subject_id: '', original_semester: 3, attempt_number: 1, fee_amount: 500, status: 'pending',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    supabase.from('students').select('id,name,roll_no').then(({ data }) => setStudents(data ?? []));
    supabase.from('subjects').select('id,name,code').then(({ data }) => setSubjects(data ?? []));
  }, []);

  const save = async () => {
    if (!form.student_id || !form.subject_id) { toast('Student and subject required', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('arrear_registrations').insert(form);
    if (error) toast(error.message, 'error');
    else { toast('Arrear registration created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <FormField label="Student" required>
        <Select value={form.student_id} onChange={f('student_id')} placeholder="Select student"
          options={students.map(s => ({ value: s.id, label: `${s.roll_no} - ${s.name}` }))} />
      </FormField>
      <FormField label="Subject" required>
        <Select value={form.subject_id} onChange={f('subject_id')} placeholder="Select subject"
          options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Original Semester">
          <Select value={String(form.original_semester)} onChange={f('original_semester')}
            options={[1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Semester ${n}` }))} />
        </FormField>
        <FormField label="Attempt Number">
          <Select value={String(form.attempt_number)} onChange={f('attempt_number')}
            options={[1,2,3,4,5].map(n => ({ value: String(n), label: `Attempt ${n}` }))} />
        </FormField>
      </div>
      <FormField label="Fee Amount (₹)">
        <Input type="number" value={form.fee_amount} onChange={f('fee_amount')} />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}>Create Arrear Registration</ActionButton>
      </div>
    </div>
  );
}
