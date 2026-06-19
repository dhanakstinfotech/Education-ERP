import { motion } from 'framer-motion';
import {
  Users, ClipboardList, Award, Calendar, TrendingUp, CheckCircle,
} from 'lucide-react';

const floatCards = [
  { label: 'Pass Rate', value: '94%', icon: Award, className: 'top-8 -left-4 animate-float' },
  { label: 'Upcoming', value: '12 Exams', icon: Calendar, className: 'top-4 -right-2 animate-float-delayed' },
  { label: 'Growth', value: '+18%', icon: TrendingUp, className: 'bottom-16 -right-6 animate-float' },
];

export default function HeroMockup() {
  return (
    <div className="relative">
      {floatCards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.15 }}
          className={`absolute z-10 hidden lg:flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-card border border-white/60 ${card.className}`}
        >
          <card.icon className="w-4 h-4 text-brand-primary" />
          <div>
            <p className="text-[10px] text-slate-500">{card.label}</p>
            <p className="text-sm font-bold text-slate-800">{card.value}</p>
          </div>
        </motion.div>
      ))}

      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-glow p-1">
        <div className="bg-slate-900 rounded-t-xl px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-slate-400 ml-2">ExamERP Dashboard</span>
        </div>
        <div className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-b-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Students', value: '12,480', icon: Users, color: 'bg-blue-50 text-blue-600' },
              { label: 'Registrations', value: '3,240', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Hall Tickets', value: '2,890', icon: CheckCircle, color: 'bg-violet-50 text-violet-600' },
              { label: 'Pass Rate', value: '94%', icon: Award, color: 'bg-amber-50 text-amber-600' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold text-slate-800">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-5 gap-3 h-36">
            <div className="md:col-span-3 bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">Result Analytics</p>
              <div className="flex items-end gap-1.5 h-20">
                {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-brand-primary to-blue-400 rounded-t opacity-80"
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">Upcoming Exams</p>
              <div className="space-y-2">
                {['CS601 — Apr 15', 'EC602 — Apr 17', 'MA301 — Apr 19'].map(exam => (
                  <div key={exam} className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                    {exam}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
