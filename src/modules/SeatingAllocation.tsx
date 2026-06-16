import { useState } from 'react';
import {
  Building2,
  Grid3X3,
  Users,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Download,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  allocated: number;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

interface SeatMap {
  row: string;
  seats: { number: number; student?: { rollNo: string; name: string }; status: 'empty' | 'occupied' }[];
}

const mockRooms: Room[] = [
  { id: '1', name: 'Room 101', building: 'Main Block', floor: 'Ground', capacity: 40, allocated: 35, facilities: ['Projector', 'AC', 'CCTV'], status: 'occupied' },
  { id: '2', name: 'Room 102', building: 'Main Block', floor: 'Ground', capacity: 50, allocated: 48, facilities: ['Projector', 'AC'], status: 'occupied' },
  { id: '3', name: 'Room 201', building: 'Main Block', floor: 'First', capacity: 45, allocated: 0, facilities: ['Projector', 'AC', 'CCTV'], status: 'available' },
  { id: '4', name: 'Room 202', building: 'Main Block', floor: 'First', capacity: 40, allocated: 0, facilities: ['Projector'], status: 'maintenance' },
  { id: '5', name: 'Hall A', building: 'Exam Hall', floor: 'Ground', capacity: 120, allocated: 112, facilities: ['Projector', 'AC', 'CCTV', 'Mic'], status: 'occupied' },
  { id: '6', name: 'Hall B', building: 'Exam Hall', floor: 'Ground', capacity: 100, allocated: 0, facilities: ['Projector', 'AC'], status: 'available' },
];

const seatLayout: SeatMap[] = [
  { row: 'A', seats: [
    { number: 1, student: { rollNo: '21CS001', name: 'Rahul S' }, status: 'occupied' },
    { number: 2, status: 'empty' },
    { number: 3, student: { rollNo: '21CS002', name: 'Priya P' }, status: 'occupied' },
    { number: 4, status: 'empty' },
  ]},
  { row: 'B', seats: [
    { number: 1, student: { rollNo: '21CS003', name: 'Amit K' }, status: 'occupied' },
    { number: 2, status: 'empty' },
    { number: 3, student: { rollNo: '21CS004', name: 'Sneha R' }, status: 'occupied' },
    { number: 4, status: 'empty' },
  ]},
  { row: 'C', seats: [
    { number: 1, status: 'empty' },
    { number: 2, student: { rollNo: '21CS005', name: 'Vikram' }, status: 'occupied' },
    { number: 3, status: 'empty' },
    { number: 4, student: { rollNo: '21CS006', name: 'Anjali V' }, status: 'occupied' },
  ]},
];

const examSchedule = [
  { date: '2024-04-15', session: 'Morning', subject: 'Data Structures', students: 245, rooms: ['Room 101', 'Room 102', 'Hall A'] },
  { date: '2024-04-15', session: 'Afternoon', subject: 'Operating Systems', students: 189, rooms: ['Room 101', 'Room 201'] },
  { date: '2024-04-16', session: 'Morning', subject: 'Database Systems', students: 312, rooms: ['Hall A', 'Hall B'] },
];

export default function SeatingAllocation() {
  const [activeView, setActiveView] = useState<'rooms' | 'seating' | 'schedule'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Seating & Hall Allocation</h1>
          <p className="text-slate-500 mt-1">Manage exam rooms, seating arrangements, and allocations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            <Download className="w-5 h-5" />
            <span>Export Chart</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm">
            <Settings className="w-5 h-5" />
            <span>Auto Allocate</span>
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'rooms', name: 'Room Management', icon: Building2 },
          { id: 'seating', name: 'Seating Chart', icon: Grid3X3 },
          { id: 'schedule', name: 'Exam Schedule', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeView === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Rooms</p>
          <p className="text-2xl font-bold text-slate-800">24</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Capacity</p>
          <p className="text-2xl font-bold text-slate-800">1,450</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Allocated</p>
          <p className="text-2xl font-bold text-emerald-600">195</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Available</p>
          <p className="text-2xl font-bold text-blue-600">1,255</p>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Exam Rooms</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {mockRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRoom?.id === room.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{room.name}</h3>
                      <p className="text-sm text-slate-500">{room.building} - {room.floor}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      room.status === 'occupied'
                        ? 'bg-emerald-100 text-emerald-700'
                        : room.status === 'available'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Capacity: {room.capacity}</span>
                    <span className="text-slate-800 font-medium">
                      {room.allocated}/{room.capacity} seated
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {room.facilities.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">Room Details</h2>
            </div>
            <div className="p-4">
              {selectedRoom ? (
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{selectedRoom.name}</h3>
                    <p className="text-sm text-slate-500">{selectedRoom.building}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Floor</span>
                      <span className="font-medium text-slate-800">{selectedRoom.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-medium text-slate-800">{selectedRoom.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allocated</span>
                      <span className="font-medium text-slate-800">{selectedRoom.allocated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available</span>
                      <span className="font-medium text-emerald-600">{selectedRoom.capacity - selectedRoom.allocated}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.facilities.map((f) => (
                        <span key={f} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a room to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === 'seating' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Seating Arrangement - Room 101</h2>
              <p className="text-sm text-slate-500">Data Structures - April 15, 2024 (Morning)</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm">
                <option>Room 101</option>
                <option>Room 102</option>
                <option>Hall A</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Auto Arrange
              </button>
            </div>
          </div>
          <div className="p-6">
            {/* Classroom Layout */}
            <div className="flex flex-col items-center gap-6">
              {/* Board */}
              <div className="w-full max-w-md py-3 bg-slate-800 text-white text-center rounded-lg font-medium">
                EXAMINATION BOARD
              </div>

              {/* Seating Grid */}
              <div className="space-y-2">
                {seatLayout.map((row) => (
                  <div key={row.row} className="flex items-center gap-4">
                    <span className="w-6 font-bold text-slate-400">{row.row}</span>
                    <div className="flex gap-3">
                      {row.seats.map((seat, idx) => (
                        <div
                          key={idx}
                          className={`w-20 h-16 rounded-lg border-2 flex flex-col items-center justify-center text-xs ${
                            seat.status === 'occupied'
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="font-medium">{row.row}{seat.number}</span>
                          {seat.student && (
                            <span className="text-xs truncate w-full text-center px-1">
                              {seat.student.rollNo}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
                  <span className="text-slate-600">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-50 border-2 border-slate-200"></div>
                  <span className="text-slate-600">Empty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Session</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Students</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rooms</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examSchedule.map((schedule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{schedule.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        schedule.session === 'Morning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {schedule.session}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{schedule.subject}</td>
                    <td className="px-6 py-4 text-slate-800">{schedule.students}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {schedule.rooms.map((room) => (
                          <span key={room} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                            {room}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                          <Grid3X3 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                          <Download className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
