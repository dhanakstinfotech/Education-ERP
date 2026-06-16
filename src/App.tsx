import { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardList,
  Ticket,
  Building2,
  FileQuestion,
  CheckSquare,
  BarChart3,
  FileText,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
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

  const ActiveComponent = activeModule
    ? modules.find((m) => m.id === activeModule)?.component
    : Dashboard;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">ExamERP</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-700">Modules</h2>
            </div>
            <nav className="p-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeModule === module.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
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
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30 ${
          sidebarOpen ? 'lg:w-72' : 'lg:w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-slate-800 text-xl whitespace-nowrap transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              ExamERP
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="mb-4">
            <button
              onClick={() => setActiveModule(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                !activeModule
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                Dashboard
              </span>
            </button>
          </div>

          <div className="mb-2 px-2">
            <span className={`text-xs font-semibold text-slate-400 uppercase tracking-wider ${sidebarOpen ? '' : 'sr-only'}`}>
              Modules
            </span>
          </div>

          <div className="space-y-1">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeModule === module.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <module.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium whitespace-nowrap transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {module.name}
                </span>
                {activeModule === module.id && sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className={`text-sm font-medium transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <div className="p-4 lg:p-8">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}

export default App;
