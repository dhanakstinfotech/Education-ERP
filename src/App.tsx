import { useState, useEffect } from 'react';
import {
  LayoutDashboard, GraduationCap, Users, ClipboardList, Ticket,
  Building2, FileQuestion, CheckSquare, BarChart3, FileText, Menu, X, ChevronRight,
} from 'lucide-react';
import { ToastProvider } from './components/Toast';
import { seedDatabase } from './lib/seed';
import { runMigrations } from './lib/migrate';
import ExamMaster from './modules/ExamMaster';
import StudentEligibility from './modules/StudentEligibility';
import ExamRegistration from './modules/ExamRegistration';
import HallTicket from './modules/HallTicket';
import SeatingAllocation from './modules/SeatingAllocation';
import QuestionPaper from './modules/QuestionPaper';
import MarkEntry from './modules/MarkEntry';
import ResultProcessing from './modules/ResultProcessing';
import Reports from './modules/Reports';
import Dashboard from './components/Dashboard';

const modules = [
  { id: 'exam-master', name: 'Exam Master', icon: GraduationCap, component: ExamMaster },
  { id: 'student-eligibility', name: 'Student Eligibility', icon: Users, component: StudentEligibility },
  { id: 'exam-registration', name: 'Exam Registration', icon: ClipboardList, component: ExamRegistration },
  { id: 'hall-ticket', name: 'Hall Ticket', icon: Ticket, component: HallTicket },
  { id: 'seating', name: 'Seating & Hall', icon: Building2, component: SeatingAllocation },
  { id: 'question-paper', name: 'Question Paper', icon: FileQuestion, component: QuestionPaper },
  { id: 'mark-entry', name: 'Mark Entry', icon: CheckSquare, component: MarkEntry },
  { id: 'result', name: 'Result Processing', icon: FileText, component: ResultProcessing },
  { id: 'reports', name: 'Reports', icon: BarChart3, component: Reports },
];

function App() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    (async () => {
      await runMigrations();
      await seedDatabase();
      setSeeded(true);
    })();
  }, []);

  const ActiveComponent = activeModule
    ? (modules.find(m => m.id === activeModule)?.component ?? Dashboard)
    : Dashboard;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">ExamERP</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-800">ExamERP</span>
              </div>
              <nav className="p-3 space-y-1">
                <button onClick={() => { setActiveModule(null); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${!activeModule ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <LayoutDashboard className="w-5 h-5" /><span className="font-medium">Dashboard</span>
                </button>
                {modules.map(module => (
                  <button key={module.id} onClick={() => { setActiveModule(module.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeModule === module.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <module.icon className="w-5 h-5" />
                    <span className="font-medium">{module.name}</span>
                    {activeModule === module.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30 ${sidebarOpen ? 'lg:w-64' : 'lg:w-[68px]'}`}>
          <div className="h-16 flex items-center px-4 border-b border-slate-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-slate-800 text-xl whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>ExamERP</span>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto space-y-1">
            <button onClick={() => setActiveModule(null)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all ${!activeModule ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Dashboard</span>
            </button>

            <div className={`pt-2 pb-1 px-2 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modules</span>
            </div>

            {modules.map(module => (
              <button key={module.id} onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all ${activeModule === module.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <module.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{module.name}</span>
                {activeModule === module.id && sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors text-sm">
              <Menu className="w-5 h-5" />
              <span className={`font-medium transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Collapse</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-[68px]'}`}>
          <div className="p-4 lg:p-8">
            {seeded ? <ActiveComponent /> : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-slate-400">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p>Initializing database...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
