import { useState, useEffect, useCallback } from 'react';
import { Ticket, QrCode, Download, Search, RefreshCw, Printer, Eye, Users, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, Input, Select, LoadingState, EmptyState
} from '../components/ui';

export default function HallTicket() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hall_tickets')
      .select('*, students(name, roll_no, programs(name)), hall_ticket_subjects(*, subjects(name, code))')
      .order('created_at', { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async (ticketId: string) => {
    const qr = `QR-${Date.now()}`;
    const { error } = await supabase.from('hall_tickets').update({
      status: 'generated', qr_code: qr, generated_at: new Date().toISOString()
    }).eq('id', ticketId);
    if (error) toast(error.message, 'error');
    else { toast('Hall ticket generated'); load(); }
  };

  const markDownloaded = async (ticketId: string) => {
    const { error } = await supabase.from('hall_tickets').update({ status: 'downloaded' }).eq('id', ticketId);
    if (error) toast(error.message, 'error');
    else { toast('Marked as downloaded'); load(); }
  };

  const generateAll = async () => {
    setGenerating(true);
    const pending = tickets.filter(t => t.status === 'pending');
    for (const t of pending) await generate(t.id);
    setGenerating(false);
    toast(`Generated ${pending.length} hall tickets`);
  };

  const filtered = tickets.filter(t => {
    const matchSearch = t.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.students?.roll_no?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: tickets.length,
    generated: tickets.filter(t => t.status === 'generated').length,
    downloaded: tickets.filter(t => t.status === 'downloaded').length,
    pending: tickets.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Hall Ticket Management" subtitle="Generate, manage, and download hall tickets">
        <ActionButton variant="secondary" onClick={() => toast('Bulk print initiated', 'info')}>
          <Printer className="w-4 h-4" />Bulk Print
        </ActionButton>
        <ActionButton loading={generating} onClick={generateAll}>
          <RefreshCw className="w-4 h-4" />Generate All Pending
        </ActionButton>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.total} icon={Users} color="blue" />
        <StatCard label="Generated" value={counts.generated} icon={FileText} color="emerald" />
        <StatCard label="Downloaded" value={counts.downloaded} icon={Download} color="violet" />
        <StatCard label="Pending" value={counts.pending} icon={RefreshCw} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="generated">Generated</option>
              <option value="downloaded">Downloaded</option>
            </select>
          </div>

          {loading ? <LoadingState /> : (
            <DataTable columns={['Roll No', 'Name', 'Program', 'Sem', 'Subjects', 'Status', 'Actions']}>
              {filtered.length === 0
                ? <tr><td colSpan={7}><EmptyState message="No hall tickets found" /></td></tr>
                : filtered.map(t => (
                  <TableRow key={t.id} onClick={() => setSelected(t)}>
                    <Td><span className="font-mono text-xs">{t.students?.roll_no}</span></Td>
                    <Td className="font-medium text-slate-800">{t.students?.name}</Td>
                    <Td className="text-slate-500 text-xs max-w-[120px] truncate">{t.students?.programs?.name ?? '-'}</Td>
                    <Td className="text-slate-500">Sem {t.semester_number}</Td>
                    <Td>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {t.hall_ticket_subjects?.length ?? 0} subj
                      </span>
                    </Td>
                    <Td><StatusBadge status={t.status} /></Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); setSelected(t); }} className="p-1.5 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-500" /></button>
                        {t.status === 'pending' && (
                          <button onClick={e => { e.stopPropagation(); generate(t.id); }} className="p-1.5 hover:bg-blue-50 rounded-lg"><Ticket className="w-4 h-4 text-blue-500" /></button>
                        )}
                        {t.status !== 'pending' && (
                          <button onClick={e => { e.stopPropagation(); markDownloaded(t.id); }} className="p-1.5 hover:bg-emerald-50 rounded-lg"><Download className="w-4 h-4 text-emerald-500" /></button>
                        )}
                      </div>
                    </Td>
                  </TableRow>
                ))}
            </DataTable>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Hall Ticket Preview</h2>
          </div>
          <div className="p-4">
            {selected ? (
              <div className="space-y-4">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h3 className="font-bold text-slate-800">ABC University</h3>
                  <p className="text-xs text-slate-500 mt-1">End Semester Examination 2024</p>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Roll No', selected.students?.roll_no],
                    ['Name', selected.students?.name],
                    ['Program', selected.students?.programs?.name ?? '-'],
                    ['Semester', `Semester ${selected.semester_number}`],
                    ['Status', selected.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>

                {selected.hall_ticket_subjects?.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-slate-50"><th className="px-2 py-2 text-left text-slate-500">Code</th><th className="px-2 py-2 text-left text-slate-500">Subject</th><th className="px-2 py-2 text-left text-slate-500">Date</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {selected.hall_ticket_subjects.map((s: any, i: number) => (
                          <tr key={i}>
                            <td className="px-2 py-2 font-mono">{s.subjects?.code}</td>
                            <td className="px-2 py-2">{s.subjects?.name}</td>
                            <td className="px-2 py-2">{s.exam_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-center py-3 border-t border-slate-200">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex flex-col items-center justify-center gap-1">
                    <QrCode className="w-10 h-10 text-slate-400" />
                    {selected.qr_code && <span className="text-xs text-slate-400 text-center break-all leading-tight px-1">{selected.qr_code.slice(0,12)}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  {selected.status === 'pending' ? (
                    <ActionButton className="flex-1 justify-center" onClick={() => generate(selected.id)}>
                      <Ticket className="w-4 h-4" />Generate
                    </ActionButton>
                  ) : (
                    <ActionButton className="flex-1 justify-center" onClick={() => markDownloaded(selected.id)}>
                      <Download className="w-4 h-4" />Download PDF
                    </ActionButton>
                  )}
                  <button className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Ticket className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click a row to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
