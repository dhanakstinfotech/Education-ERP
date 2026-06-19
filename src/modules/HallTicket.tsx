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

  const markDownloaded = async (ticketId: string, silent = false) => {
    const { error } = await supabase.from('hall_tickets').update({ status: 'downloaded' }).eq('id', ticketId);
    if (error) toast(error.message, 'error');
    else {
      if (!silent) toast('Marked as downloaded');
      load();
    }
  };

  const generateAll = async () => {
    setGenerating(true);
    const pending = tickets.filter(t => t.status === 'pending');
    for (const t of pending) await generate(t.id);
    setGenerating(false);
    toast(`Generated ${pending.length} hall tickets`);
  };

  // Generate a simple QR code data URL (using a canvas-based approach)
  const generateQRCode = (text: string): string => {
    // Simple QR-style pattern based on the text hash
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 100, 100);

    // Create a pattern based on the text
    ctx.fillStyle = '#000000';
    const size = 4;
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        const idx = (x + y * 25 + hash) % 3;
        if (idx === 0 || idx === 1) {
          // Create QR-like pattern
          if ((x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17)) {
            // Corner markers
            if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
              ctx.fillRect(x * size, y * size, size, size);
            }
          } else if (((x + y + hash) % 7) < 3) {
            ctx.fillRect(x * size, y * size, size, size);
          }
        }
      }
    }

    return canvas.toDataURL();
  };

  const buildTicketHtml = (ticket: any, compact = false) => {
    const qrCode = ticket.qr_code ? generateQRCode(ticket.qr_code) : '';
    const subjects = ticket.hall_ticket_subjects || [];
    const rollNo = ticket.students?.roll_no ?? 'N/A';

    if (compact) {
      return `
        <div class="ticket">
          <div class="header">
            <h1>ABC University</h1>
            <p>End Semester Examination 2024</p>
          </div>
          <div class="content">
            <div class="student-info">
              <div class="info-row"><span>Roll No:</span><span>${rollNo}</span></div>
              <div class="info-row"><span>Name:</span><span>${ticket.students?.name ?? 'N/A'}</span></div>
              <div class="info-row"><span>Program:</span><span>${ticket.students?.programs?.name ?? 'N/A'}</span></div>
              <div class="info-row"><span>Semester:</span><span>Semester ${ticket.semester_number}</span></div>
            </div>
            ${subjects.length > 0 ? `
              <table>
                <thead><tr><th>Code</th><th>Subject</th><th>Date</th></tr></thead>
                <tbody>
                  ${subjects.map((s: any) => `<tr><td>${s.subjects?.code ?? '-'}</td><td>${s.subjects?.name ?? '-'}</td><td>${s.exam_date ?? '-'}</td></tr>`).join('')}
                </tbody>
              </table>
            ` : ''}
            <div class="qr-section">
              <div class="qr-box">
                ${qrCode ? `<img src="${qrCode}" alt="QR" />` : '<div class="qr-placeholder">QR</div>'}
                <p>${ticket.qr_code || ''}</p>
              </div>
            </div>
          </div>
          <div class="footer">Computer-generated hall ticket</div>
        </div>
      `;
    }

    return `
      <div class="ticket">
        <div class="header">
          <h1>ABC University</h1>
          <p>End Semester Examination 2024</p>
        </div>
        <div class="content">
          <h2 style="font-size: 16px; color: #1e40af; margin-bottom: 12px;">Hall Ticket</h2>
          <div class="student-info">
            <div class="info-row"><span>Roll No:</span><span>${rollNo}</span></div>
            <div class="info-row"><span>Name:</span><span>${ticket.students?.name ?? 'N/A'}</span></div>
            <div class="info-row"><span>Program:</span><span>${ticket.students?.programs?.name ?? 'N/A'}</span></div>
            <div class="info-row"><span>Semester:</span><span>Semester ${ticket.semester_number}</span></div>
          </div>
          <div class="instructions">
            <strong>Important Instructions:</strong>
            1. Bring this hall ticket to all examinations.<br>
            2. Carry your college ID card.<br>
            3. Reach the examination hall 30 minutes before the exam.<br>
            4. Electronic devices are strictly prohibited.
          </div>
          ${subjects.length > 0 ? `
            <table>
              <thead>
                <tr><th>Code</th><th>Subject</th><th>Date</th><th>Session</th></tr>
              </thead>
              <tbody>
                ${subjects.map((s: any) => `
                  <tr>
                    <td>${s.subjects?.code ?? '-'}</td>
                    <td>${s.subjects?.name ?? '-'}</td>
                    <td>${s.exam_date ?? '-'}</td>
                    <td>${s.exam_session ?? 'Morning'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          <div class="qr-section">
            <div class="qr-box">
              ${qrCode ? `<img src="${qrCode}" alt="QR Code" />` : '<div style="width:80px;height:80px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;">QR</div>'}
              <p>${ticket.qr_code || 'Scan for verification'}</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>This is a computer-generated hall ticket. No signature required.</p>
        </div>
      </div>
    `;
  };

  const ticketDocument = (ticket: any, compact = false) => {
    const rollNo = ticket.students?.roll_no ?? ticket.id;
    const styles = compact ? `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; padding: 10px; background: #fff; }
      .ticket { max-width: 550px; margin: 10px auto; border: 2px solid #1e40af; border-radius: 8px; overflow: hidden; }
      .header { background: #1e40af; color: white; padding: 12px; text-align: center; }
      .header h1 { font-size: 18px; margin-bottom: 2px; }
      .header p { font-size: 10px; opacity: 0.9; }
      .content { padding: 12px; }
      .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
      .info-row { display: flex; justify-content: space-between; font-size: 11px; }
      .info-row span:first-child { color: #64748b; }
      .info-row span:last-child { font-weight: 600; color: #1e293b; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
      th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; }
      th { background: #f1f5f9; }
      .qr-section { display: flex; justify-content: center; padding: 10px; border-top: 1px solid #e2e8f0; }
      .qr-box { text-align: center; }
      .qr-box img { width: 60px; height: 60px; }
      .qr-box p { font-size: 8px; color: #94a3b8; margin-top: 2px; }
      .qr-placeholder { width: 60px; height: 60px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 10px; }
      .footer { background: #f1f5f9; padding: 8px; text-align: center; font-size: 9px; color: #64748b; }
      .page-break { page-break-before: always; margin-top: 20px; }
      @media print { body { padding: 0; } .ticket { border: none; margin: 0; } .page-break { page-break-before: always; margin-top: 0; } }
    ` : `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #fff; }
      .ticket { max-width: 600px; margin: 0 auto; border: 2px solid #1e40af; border-radius: 8px; overflow: hidden; }
      .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
      .header h1 { font-size: 24px; margin-bottom: 4px; }
      .header p { font-size: 12px; opacity: 0.9; }
      .content { padding: 20px; }
      .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
      .info-row { display: flex; justify-content: space-between; font-size: 13px; }
      .info-row span:first-child { color: #64748b; }
      .info-row span:last-child { font-weight: 600; color: #1e293b; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
      th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
      th { background: #f1f5f9; color: #475569; font-weight: 600; }
      .qr-section { display: flex; justify-content: center; padding: 20px; border-top: 1px solid #e2e8f0; }
      .qr-box { text-align: center; }
      .qr-box img { width: 80px; height: 80px; border: 1px solid #e2e8f0; }
      .qr-box p { font-size: 10px; color: #94a3b8; margin-top: 4px; }
      .footer { background: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b; }
      .instructions { background: #fef3c7; padding: 10px; font-size: 11px; margin: 16px 0; border-radius: 4px; }
      .instructions strong { display: block; margin-bottom: 4px; }
      @media print { body { padding: 0; } .ticket { border: none; } }
    `;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hall Ticket - ${rollNo}</title>
  <style>${styles}</style>
</head>
<body>${buildTicketHtml(ticket, compact)}</body>
</html>`;
  };

  const openTicketInFrame = (html: string, onReady: (win: Window) => void) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    if (!win) {
      document.body.removeChild(iframe);
      toast('Unable to open hall ticket', 'error');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      onReady(win);
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };

  const downloadTicket = (ticket: any) => {
    if (ticket.status === 'pending') {
      toast('Generate the hall ticket before downloading', 'info');
      return;
    }

    const rollNo = ticket.students?.roll_no ?? ticket.id;
    const html = ticketDocument(ticket);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hall-ticket-${rollNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    markDownloaded(ticket.id, true);
    toast('Hall ticket downloaded');
  };

  const printTicket = (ticket: any) => {
    if (ticket.status === 'pending') {
      toast('Generate the hall ticket before printing', 'info');
      return;
    }

    openTicketInFrame(ticketDocument(ticket), win => {
      win.focus();
      win.print();
    });
  };

  // Bulk print all generated tickets
  const bulkPrint = () => {
    const toPrint = tickets.filter(t => t.status === 'generated' || t.status === 'downloaded');
    if (toPrint.length === 0) {
      toast('No generated tickets to print', 'info');
      return;
    }

    const body = toPrint.map((ticket, index) =>
      `${index > 0 ? '<div class="page-break"></div>' : ''}${buildTicketHtml(ticket, true)}`
    ).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Bulk Hall Tickets</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 10px; background: #fff; }
    .ticket { max-width: 550px; margin: 10px auto; border: 2px solid #1e40af; border-radius: 8px; overflow: hidden; }
    .header { background: #1e40af; color: white; padding: 12px; text-align: center; }
    .header h1 { font-size: 18px; margin-bottom: 2px; }
    .header p { font-size: 10px; opacity: 0.9; }
    .content { padding: 12px; }
    .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; font-size: 11px; }
    .info-row span:first-child { color: #64748b; }
    .info-row span:last-child { font-weight: 600; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; }
    th { background: #f1f5f9; }
    .qr-section { display: flex; justify-content: center; padding: 10px; border-top: 1px solid #e2e8f0; }
    .qr-box { text-align: center; }
    .qr-box img { width: 60px; height: 60px; }
    .qr-box p { font-size: 8px; color: #94a3b8; margin-top: 2px; }
    .qr-placeholder { width: 60px; height: 60px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 10px; }
    .footer { background: #f1f5f9; padding: 8px; text-align: center; font-size: 9px; color: #64748b; }
    .page-break { page-break-before: always; margin-top: 20px; }
    @media print { body { padding: 0; } .ticket { border: none; margin: 0; } .page-break { page-break-before: always; margin-top: 0; } }
  </style>
</head>
<body>${body}</body>
</html>`;

    openTicketInFrame(html, win => {
      win.focus();
      win.print();
      toast(`Printing ${toPrint.length} hall tickets`);
    });
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
        <ActionButton variant="secondary" onClick={bulkPrint}>
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
                          <button
                            onClick={e => { e.stopPropagation(); downloadTicket(t); }}
                            className="p-1.5 hover:bg-emerald-50 rounded-lg"
                            title="Download hall ticket"
                          >
                            <Download className="w-4 h-4 text-emerald-500" />
                          </button>
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
                    <ActionButton className="flex-1 justify-center" onClick={() => downloadTicket(selected)}>
                      <Download className="w-4 h-4" />Download PDF
                    </ActionButton>
                  )}
                  <button
                    onClick={() => printTicket(selected)}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                    title="Print hall ticket"
                  >
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
