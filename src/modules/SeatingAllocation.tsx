import { useState, useEffect, useCallback } from 'react';
import { Building2, Grid3X3, Clock, Plus, Edit2, Trash2, Download, Settings, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import {
  PageHeader, StatCard, DataTable, TableRow, Td, StatusBadge,
  ActionButton, FormField, Input, Select, LoadingState, EmptyState
} from '../components/ui';
import Modal from '../components/Modal';

type View = 'rooms' | 'seating' | 'schedule';
type RoomStatus = 'available' | 'occupied' | 'maintenance' | '';

const ROOM_STATUS_STYLES: Record<string, { card: string; selected: string; chartHeader: string; icon: string }> = {
  available: {
    card: 'border-blue-200 bg-blue-50/50 hover:border-blue-300',
    selected: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
    chartHeader: 'bg-blue-600',
    icon: 'bg-blue-100 text-blue-600',
  },
  occupied: {
    card: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300',
    selected: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200',
    chartHeader: 'bg-emerald-600',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  maintenance: {
    card: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
    selected: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
    chartHeader: 'bg-amber-600',
    icon: 'bg-amber-100 text-amber-600',
  },
};

const SEAT_COLS = 5;
const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function buildSeatGrid(capacity: number, allocations: any[]) {
  const occupied = new Map(allocations.map(a => [a.seat_number, a]));
  const seats: { label: string; allocation: any | null }[] = [];
  for (let i = 0; i < capacity; i++) {
    const row = Math.floor(i / SEAT_COLS);
    const col = (i % SEAT_COLS) + 1;
    const label = `${ROW_LABELS[row] ?? 'X'}${col}`;
    seats.push({ label, allocation: occupied.get(label) ?? null });
  }
  return seats;
}

function RoomStatusFilters({
  value,
  onChange,
  counts,
}: {
  value: RoomStatus;
  onChange: (status: RoomStatus) => void;
  counts: Record<string, number>;
}) {
  const options: { id: RoomStatus; label: string }[] = [
    { id: '', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.id || 'all'}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === opt.id
              ? opt.id === 'available' ? 'bg-blue-600 text-white'
                : opt.id === 'occupied' ? 'bg-emerald-600 text-white'
                : opt.id === 'maintenance' ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-white'
              : opt.id === 'available' ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : opt.id === 'occupied' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : opt.id === 'maintenance' ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {opt.label} ({opt.id ? counts[opt.id] ?? 0 : counts.all ?? 0})
        </button>
      ))}
    </div>
  );
}

export default function SeatingAllocation() {
  const [view, setView] = useState<View>('rooms');
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<any>(null);
  const [roomStatusFilter, setRoomStatusFilter] = useState<RoomStatus>('');
  const { toast } = useToast();

  const loadRooms = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('exam_rooms').select('*').order('name');
    setRooms(data ?? []);
    setLoading(false);
  }, []);

  const loadAllocations = useCallback(async () => {
    const { data } = await supabase
      .from('seat_allocations')
      .select('*, students(name, roll_no), exam_rooms(id, name, capacity, status), subjects(name, code)')
      .order('exam_date');
    setAllocations(data ?? []);
  }, []);

  useEffect(() => { loadRooms(); loadAllocations(); }, [loadRooms, loadAllocations]);

  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    const { error } = await supabase.from('exam_rooms').delete().eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Room deleted'); loadRooms(); }
  };

  const autoAllocate = async () => {
    // Fetch approved students without existing allocations
    const { data: allocatedStudentIds } = await supabase.from('seat_allocations').select('student_id');
    const allocatedSet = new Set((allocatedStudentIds ?? []).map(a => a.student_id));

    const { data: students } = await supabase.from('students').select('id, name, roll_no').eq('eligibility_status', 'approved');
    const unallocated = (students ?? []).filter(s => !allocatedSet.has(s.id)).slice(0, 30);

    // Use all rooms (not just available)
    const { data: rms } = await supabase.from('exam_rooms').select('id, name, capacity').order('capacity', { ascending: false });
    const { data: subj } = await supabase.from('subjects').select('id').limit(1);

    if (!unallocated.length) { toast('All eligible students already have seats', 'info'); return; }
    if (!rms?.length) { toast('No rooms available', 'error'); return; }
    if (!subj?.length) { toast('No subjects found', 'error'); return; }

    const inserts: any[] = [];
    let seatCounter = 1;
    const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    for (const student of unallocated) {
      const roomIdx = Math.min(Math.floor((seatCounter - 1) / 20), rms.length - 1);
      const room = rms[roomIdx];
      const seatInRoom = ((seatCounter - 1) % 20) + 1;
      const rowLabel = seatLabels[Math.floor((seatInRoom - 1) / 5)];
      const colNum = ((seatInRoom - 1) % 5) + 1;

      inserts.push({
        student_id: student.id,
        room_id: room.id,
        subject_id: subj[0].id,
        seat_number: `${rowLabel}${colNum}`,
        exam_date: '2024-04-15',
        exam_session: seatCounter % 2 === 0 ? 'afternoon' : 'morning',
      });
      seatCounter++;
    }

    const { error } = await supabase.from('seat_allocations').insert(inserts);
    if (error) toast(error.message, 'error');
    else { toast(`Allocated ${inserts.length} seats successfully`); loadAllocations(); }
  };

  const exportChart = () => {
    const data = allocations.map(a => ({
      Student: a.students?.name,
      'Roll No': a.students?.roll_no,
      Room: a.exam_rooms?.name,
      Seat: a.seat_number,
      Subject: a.subjects?.name,
      Date: a.exam_date,
      Session: a.exam_session,
    }));
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seating-chart-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Seating chart exported');
  };

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = allocations.length;

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const filteredRooms = roomStatusFilter
    ? rooms.filter(r => r.status === roomStatusFilter)
    : rooms;

  const allocationsByRoom = allocations.reduce((acc: Record<string, any[]>, a) => {
    const roomId = a.room_id ?? a.exam_rooms?.id;
    if (!roomId) return acc;
    if (!acc[roomId]) acc[roomId] = [];
    acc[roomId].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Seating & Hall Allocation" subtitle="Manage exam rooms and seating arrangements">
        <ActionButton variant="secondary" onClick={exportChart}><Download className="w-4 h-4" />Export Chart</ActionButton>
        <ActionButton onClick={autoAllocate}><Settings className="w-4 h-4" />Auto Allocate</ActionButton>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value={rooms.length} color="blue" />
        <StatCard label="Total Capacity" value={totalCapacity.toLocaleString()} color="emerald" />
        <StatCard label="Seats Allocated" value={occupied} color="violet" />
        <StatCard label="Available" value={rooms.filter(r => r.status === 'available').length} color="slate" />
      </div>

      <div className="flex gap-2">
        {[{id:'rooms',name:'Room Management',icon:Building2},{id:'seating',name:'Seating Chart',icon:Grid3X3},{id:'schedule',name:'Allocations',icon:Clock}].map(v => (
          <button key={v.id} onClick={() => setView(v.id as View)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              view === v.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <v.icon className="w-4 h-4" />{v.name}
          </button>
        ))}
      </div>

      {view === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-800">Exam Rooms</h2>
              <ActionButton size="sm" onClick={() => { setEditRoom(null); setShowModal(true); }}>
                <Plus className="w-4 h-4" />Add Room
              </ActionButton>
            </div>
            <div className="px-4 pt-4">
              <RoomStatusFilters value={roomStatusFilter} onChange={setRoomStatusFilter} counts={statusCounts} />
            </div>
            {loading ? <LoadingState /> : filteredRooms.length === 0 ? (
              <EmptyState message={`No ${roomStatusFilter || ''} rooms found`.trim()} />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 p-4">
                {filteredRooms.map(room => {
                  const styles = ROOM_STATUS_STYLES[room.status] ?? ROOM_STATUS_STYLES.available;
                  const isSelected = selectedRoom?.id === room.id;
                  const roomSeats = allocationsByRoom[room.id]?.length ?? 0;
                  return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? styles.selected : styles.card
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{room.name}</p>
                        <p className="text-xs text-slate-500">{room.building} · {room.floor}</p>
                      </div>
                      <StatusBadge status={room.status} />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Capacity: <span className="font-medium">{room.capacity}</span>
                      {roomSeats > 0 && (
                        <span className="ml-2 text-emerald-600">· {roomSeats} seats filled</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(room.facilities ?? []).map((f: string) => (
                        <span key={f} className="px-1.5 py-0.5 bg-white/80 text-slate-600 rounded text-xs border border-slate-200">{f}</span>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200"><h2 className="font-semibold text-slate-800">Room Details</h2></div>
            <div className="p-4">
              {selectedRoom ? (
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 ${ROOM_STATUS_STYLES[selectedRoom.status]?.icon ?? 'bg-blue-100 text-blue-600'}`}>
                      <Building2 className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-800">{selectedRoom.name}</p>
                    <p className="text-sm text-slate-500">{selectedRoom.building}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Floor</span>
                    <span className="font-medium text-slate-800">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Capacity</span>
                    <span className="font-medium text-slate-800">{selectedRoom.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge status={selectedRoom.status} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Seats allocated</span>
                    <span className="font-medium text-slate-800">{allocationsByRoom[selectedRoom.id]?.length ?? 0}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setEditRoom(selectedRoom); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
                      <Edit2 className="w-4 h-4" />Edit
                    </button>
                    <button onClick={() => deleteRoom(selectedRoom.id)} className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a room</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'seating' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-semibold text-slate-800">Seating Chart</h2>
              <p className="text-sm text-slate-500 mt-1">Visual layout of seats per room — empty vs occupied</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-4 rounded border-2 border-dashed border-slate-300 bg-slate-50" /> Available seat</span>
              <span className="flex items-center gap-1.5"><span className="w-4 rounded bg-emerald-100 border-2 border-emerald-400" /> Occupied seat</span>
              <span className="flex items-center gap-1.5"><span className="w-4 rounded bg-amber-100 border-2 border-amber-400" /> Maintenance</span>
            </div>
          </div>

          <div className="mb-6">
            <RoomStatusFilters value={roomStatusFilter} onChange={setRoomStatusFilter} counts={statusCounts} />
          </div>

          {filteredRooms.length === 0 ? (
            <EmptyState message={`No ${roomStatusFilter || ''} rooms to display`.trim()} />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRooms.map(room => {
                const roomAllocations = allocationsByRoom[room.id] ?? [];
                const seats = buildSeatGrid(room.capacity, roomAllocations);
                const filled = roomAllocations.length;
                const vacant = room.capacity - filled;
                const styles = ROOM_STATUS_STYLES[room.status] ?? ROOM_STATUS_STYLES.available;
                const isMaintenance = room.status === 'maintenance';

                return (
                  <div key={room.id} className={`border rounded-xl overflow-hidden ${isMaintenance ? 'border-amber-200' : 'border-slate-200'}`}>
                    <div className={`px-4 py-3 text-white text-sm font-medium flex items-center justify-between ${styles.chartHeader}`}>
                      <span>{room.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 capitalize">{room.status}</span>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between text-xs text-slate-600">
                      <span>{filled} occupied · {vacant} available</span>
                      <span>{room.building}</span>
                    </div>
                    <div className="p-3">
                      {isMaintenance ? (
                        <div className="py-8 text-center text-amber-700 bg-amber-50 rounded-lg border border-amber-200 text-sm">
                          Room under maintenance — seating unavailable
                        </div>
                      ) : (
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SEAT_COLS}, minmax(0, 1fr))` }}>
                          {seats.map(({ label, allocation }) => (
                            <div
                              key={label}
                              title={allocation ? `${allocation.students?.name} (${allocation.students?.roll_no})` : `Seat ${label} — available`}
                              className={`aspect-square min-h-[52px] rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                                allocation
                                  ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-800'
                                  : 'bg-slate-50 border-2 border-dashed border-slate-300 text-slate-400'
                              }`}
                            >
                              <span className="font-bold">{label}</span>
                              {allocation ? (
                                <span className="truncate w-full text-center px-0.5 text-[10px] leading-tight">{allocation.students?.roll_no}</span>
                              ) : (
                                <span className="text-[10px]">Open</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={['Student', 'Roll No', 'Room', 'Seat', 'Subject', 'Date', 'Session']}>
            {allocations.length === 0
              ? <tr><td colSpan={7}><EmptyState message="No allocations yet" /></td></tr>
              : allocations.map((a, i) => (
                <TableRow key={i}>
                  <Td className="font-medium text-slate-800">{a.students?.name}</Td>
                  <Td><span className="font-mono text-xs">{a.students?.roll_no}</span></Td>
                  <Td className="text-slate-600">{a.exam_rooms?.name}</Td>
                  <Td><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-mono text-xs">{a.seat_number}</span></Td>
                  <Td className="text-slate-600 text-xs">{a.subjects?.name}</Td>
                  <Td className="text-slate-600">{a.exam_date}</Td>
                  <Td><span className={`px-2 py-0.5 rounded text-xs font-medium ${a.exam_session === 'morning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{a.exam_session}</span></Td>
                </TableRow>
              ))}
          </DataTable>
        </div>
      )}

      {showModal && (
        <Modal title={editRoom ? 'Edit Room' : 'Add Room'} onClose={() => setShowModal(false)}>
          <RoomForm room={editRoom} onClose={() => { setShowModal(false); loadRooms(); }} />
        </Modal>
      )}
    </div>
  );
}

function RoomForm({ room, onClose }: { room: any; onClose: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [facilityInput, setFacilityInput] = useState('');
  const [form, setForm] = useState({
    name: room?.name ?? '', building: room?.building ?? '', floor: room?.floor ?? 'Ground',
    capacity: room?.capacity ?? 40, facilities: room?.facilities ?? [], status: room?.status ?? 'available',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const addFacility = () => {
    if (!facilityInput.trim()) return;
    setForm(p => ({ ...p, facilities: [...p.facilities, facilityInput.trim()] }));
    setFacilityInput('');
  };

  const save = async () => {
    if (!form.name || !form.building) { toast('Name and building required', 'error'); return; }
    setSaving(true);
    const { error } = room
      ? await supabase.from('exam_rooms').update(form).eq('id', room.id)
      : await supabase.from('exam_rooms').insert(form);
    if (error) toast(error.message, 'error');
    else { toast(room ? 'Room updated' : 'Room created'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Room Name" required><Input placeholder="Room 101" value={form.name} onChange={f('name')} /></FormField>
        <FormField label="Building" required><Input placeholder="Main Block" value={form.building} onChange={f('building')} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Floor"><Input placeholder="Ground" value={form.floor} onChange={f('floor')} /></FormField>
        <FormField label="Capacity"><Input type="number" min={10} value={form.capacity} onChange={f('capacity')} /></FormField>
      </div>
      <FormField label="Status">
        <Select value={form.status} onChange={f('status')} options={[{value:'available',label:'Available'},{value:'occupied',label:'Occupied'},{value:'maintenance',label:'Maintenance'}]} />
      </FormField>
      <FormField label="Facilities">
        <div className="flex gap-2">
          <Input placeholder="e.g. AC" value={facilityInput} onChange={e => setFacilityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFacility()} />
          <button onClick={addFacility} className="px-3 py-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.facilities.map((fc: string, i: number) => (
            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {fc}
              <button onClick={() => setForm(p => ({ ...p, facilities: p.facilities.filter((_: string, fi: number) => fi !== i) }))} className="text-blue-500 hover:text-blue-700">×</button>
            </span>
          ))}
        </div>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton loading={saving} onClick={save}>Save Room</ActionButton>
      </div>
    </div>
  );
}
