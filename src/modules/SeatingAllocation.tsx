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

export default function SeatingAllocation() {
  const [view, setView] = useState<View>('rooms');
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<any>(null);
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
      .select('*, students(name, roll_no), exam_rooms(name), subjects(name, code)')
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
    toast('Auto allocation started', 'info');
    // Fetch eligible students and rooms
    const { data: students } = await supabase.from('students').select('id').eq('eligibility_status', 'approved').limit(20);
    const { data: rms } = await supabase.from('exam_rooms').select('id').eq('status', 'available').limit(3);
    const { data: subj } = await supabase.from('subjects').select('id').limit(1);
    if (!students?.length || !rms?.length || !subj?.length) { toast('Not enough data to allocate', 'error'); return; }
    const inserts = students.map((s, i) => ({
      student_id: s.id,
      room_id: rms[i % rms.length].id,
      subject_id: subj[0].id,
      seat_number: `A${i + 1}`,
      exam_date: '2024-04-15',
      exam_session: 'morning',
    }));
    const { error } = await supabase.from('seat_allocations').upsert(inserts);
    if (error) toast(error.message, 'error');
    else { toast('Seats allocated successfully'); loadAllocations(); }
  };

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = allocations.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Seating & Hall Allocation" subtitle="Manage exam rooms and seating arrangements">
        <ActionButton variant="secondary" onClick={() => toast('Chart exported', 'info')}><Download className="w-4 h-4" />Export Chart</ActionButton>
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
            <div className="p-4 border-b border-slate-200 flex justify-between">
              <h2 className="font-semibold text-slate-800">Exam Rooms</h2>
              <ActionButton size="sm" onClick={() => { setEditRoom(null); setShowModal(true); }}>
                <Plus className="w-4 h-4" />Add Room
              </ActionButton>
            </div>
            {loading ? <LoadingState /> : (
              <div className="grid sm:grid-cols-2 gap-4 p-4">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{room.name}</p>
                        <p className="text-xs text-slate-500">{room.building} · {room.floor}</p>
                      </div>
                      <StatusBadge status={room.status} />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Capacity: <span className="font-medium">{room.capacity}</span></p>
                    <div className="flex flex-wrap gap-1">
                      {(room.facilities ?? []).map((f: string) => (
                        <span key={f} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200"><h2 className="font-semibold text-slate-800">Room Details</h2></div>
            <div className="p-4">
              {selectedRoom ? (
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="font-bold text-slate-800">{selectedRoom.name}</p>
                    <p className="text-sm text-slate-500">{selectedRoom.building}</p>
                  </div>
                  {[['Floor', selectedRoom.floor],['Capacity', selectedRoom.capacity],['Status', selectedRoom.status]].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
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
          <h2 className="font-semibold text-slate-800 mb-6">Seating Chart</h2>
          {allocations.length === 0 ? (
            <EmptyState message="No seat allocations yet. Click Auto Allocate to get started." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(
                allocations.reduce((acc: Record<string, any[]>, a) => {
                  const key = a.exam_rooms?.name ?? 'Unknown';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(a);
                  return acc;
                }, {})
              ).map(([roomName, seats]) => (
                <div key={roomName} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-800 text-white text-sm font-medium">{roomName}</div>
                  <div className="p-3 flex flex-wrap gap-2">
                    {seats.map((s: any, i: number) => (
                      <div key={i} className="w-16 h-14 bg-blue-50 border-2 border-blue-200 rounded-lg flex flex-col items-center justify-center text-xs">
                        <span className="font-bold text-blue-700">{s.seat_number}</span>
                        <span className="text-blue-500 truncate w-full text-center px-1">{s.students?.roll_no?.slice(-4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
