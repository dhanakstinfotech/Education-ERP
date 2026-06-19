import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Menu, X, Check, ChevronDown, ChevronRight, Download,
  Calendar, Users, Building2, Shield, BarChart3, Ticket, Grid3X3,
  FileText, ClipboardList, BookOpen, Award, Lock, Cloud, Database,
  Eye, Zap, Layers, ArrowRight, Star, Phone, Mail, Linkedin, Twitter,
  LayoutDashboard, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import HeroMockup from '../components/landing/HeroMockup';
import { FadeIn, AnimatedCounter, SectionHeader } from '../components/landing/landingUtils';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const NAV_LINKS = [
  { label: 'Benefits', href: '#benefits' },
  { label: 'Product', href: '#product' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadBrochure = () => {
    const content = `ExamERP — Examination Management Platform\n\nTransform examination management from weeks to minutes.\n\n• Automated exam scheduling\n• Hall ticket generation\n• Smart seating allocation\n• Result publishing & analytics\n• Multi-campus support\n\nVisit: examerp.com | Contact: sales@examerp.com`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ExamERP-Brochure.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const screenshots = [
    { title: 'Dashboard', desc: 'Real-time exam operations overview', color: 'from-blue-500 to-brand-primary' },
    { title: 'Exam Creation', desc: 'Configure exams, subjects & schedules', color: 'from-violet-500 to-purple-600' },
    { title: 'Timetable Generator', desc: 'Conflict-free automated scheduling', color: 'from-emerald-500 to-teal-600' },
    { title: 'Hall Tickets', desc: 'Generate & distribute digitally', color: 'from-amber-500 to-orange-500' },
    { title: 'Results Publishing', desc: 'Publish results in minutes', color: 'from-rose-500 to-pink-600' },
    { title: 'Reports & Analytics', desc: 'Accreditation-ready insights', color: 'from-cyan-500 to-blue-600' },
  ];

  const workflow = [
    { step: 'Create Exam', icon: ClipboardList },
    { step: 'Schedule Timetable', icon: Calendar },
    { step: 'Generate Hall Tickets', icon: Ticket },
    { step: 'Conduct Examination', icon: BookOpen },
    { step: 'Evaluate Papers', icon: FileText },
    { step: 'Publish Results', icon: Award },
    { step: 'Analytics & Reports', icon: BarChart3 },
  ];

  const features = [
    'Automated Exam Scheduling', 'Hall Ticket Generation', 'Smart Seating Allocation',
    'Evaluation Workflow', 'Internal Assessment Management', 'Results Processing',
    'Grade Calculation', 'Analytics Dashboard', 'Accreditation Reports',
    'Multi-Campus Management', 'Student Portal', 'Faculty Portal',
  ];

  const faqs = [
    { q: 'Can ExamERP support multiple campuses?', a: 'Yes. ExamERP is built for multi-campus and multi-institution deployments with centralized administration and campus-level controls.' },
    { q: 'Is the platform cloud-based?', a: 'ExamERP is fully cloud-hosted with secure access from anywhere. On-premise deployment is available for enterprise clients.' },
    { q: 'Can results be published online?', a: 'Results can be published instantly to student portals with role-based access, notifications, and revaluation workflows.' },
    { q: 'Does it support accreditation reporting?', a: 'Yes. Generate NAAC, NBA, and custom accreditation reports with audit-ready data exports.' },
    { q: 'Can existing student data be migrated?', a: 'Our team provides full data migration support from legacy systems, spreadsheets, and existing ERP platforms.' },
    { q: 'Is training provided?', a: 'Comprehensive onboarding, admin training, and faculty workshops are included with every deployment.' },
  ];

  return (
    <div className="min-h-screen bg-brand-surface text-slate-800">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ExamERP</span>
          </button>
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors">
                {l.label}
              </button>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={onLaunchApp} className="text-sm font-medium text-slate-600 hover:text-brand-primary px-4 py-2">
              Sign In
            </button>
            <button onClick={() => scrollTo('#contact')} className="text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark px-5 py-2.5 rounded-xl transition-colors shadow-soft">
              Request Demo
            </button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-slate-200 bg-white overflow-hidden">
              <div className="p-4 space-y-1">
                {NAV_LINKS.map(l => (
                  <button key={l.href} onClick={() => scrollTo(l.href)} className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">{l.label}</button>
                ))}
                <button onClick={() => { onLaunchApp(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Sign In</button>
                <button onClick={() => scrollTo('#contact')} className="w-full mt-2 bg-brand-primary text-white font-semibold py-3 rounded-xl">Request Demo</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SECTION 1 — HERO */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-brand-surface to-brand-secondary/5" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Enterprise Examination Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Transform Examination Management from{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">Weeks to Minutes</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                Automate exam scheduling, hall tickets, seating arrangements, evaluation workflows, result publishing, and analytics through a single intelligent platform.
              </p>
              <ul className="mt-8 space-y-3">
                {['100% Digital Exam Operations', 'Reduce Administrative Effort by 70%', 'Multi-Campus Support', 'Real-Time Reports & Analytics'].map(b => (
                  <li key={b} className="flex items-center gap-2.5 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-brand-secondary/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brand-secondary" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <button onClick={() => scrollTo('#contact')} className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-xl shadow-card transition-all hover:shadow-glow">
                  Request Demo <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={downloadBrochure} className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> Download Brochure
                </button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <HeroMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — STATS */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 50000, suffix: '+', label: 'Exams Managed', icon: ClipboardList },
              { value: 100000, suffix: '+', label: 'Students Supported', icon: Users },
              { value: 100, suffix: '+', label: 'Institutions', icon: Building2 },
              { value: 99.9, suffix: '%', label: 'Result Accuracy', icon: Award, isDecimal: true },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-brand-surface border border-slate-100 hover:shadow-card transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <s.icon className="w-6 h-6 text-brand-primary group-hover:text-white" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {s.isDecimal ? (
                      <span>99.9%</span>
                    ) : (
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    )}
                  </p>
                  <p className="mt-1 text-slate-600 font-medium">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — STAKEHOLDERS */}
      <section id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Built for Every Stakeholder in the Examination Ecosystem" subtitle="Purpose-built workflows for every role — from examination controllers to institutional leadership." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Examination Controller', icon: Calendar, color: 'brand-primary', items: ['Exam Planning', 'Timetable Generation', 'Seating Allocation', 'Hall Ticket Management'], desc: 'Orchestrate the entire exam cycle from a unified command center.' },
              { title: 'Faculty', icon: BookOpen, color: 'brand-secondary', items: ['Internal Marks Entry', 'Evaluation Workflow', 'Attendance Tracking', 'Result Approval'], desc: 'Streamlined tools for assessment, evaluation, and approvals.' },
              { title: 'Students', icon: GraduationCap, color: 'brand-accent', items: ['Hall Tickets', 'Results Access', 'Notifications', 'Revaluation Requests'], desc: 'Self-service access to tickets, results, and exam updates.' },
              { title: 'Management', icon: BarChart3, color: 'violet-600', items: ['Analytics Dashboard', 'Institutional Reports', 'Performance Tracking', 'Accreditation Reports'], desc: 'Data-driven insights for strategic academic decisions.' },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} className="h-full p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color === 'brand-primary' ? 'bg-blue-50' : card.color === 'brand-secondary' ? 'bg-emerald-50' : card.color === 'brand-accent' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                    <card.icon className={`w-6 h-6 ${card.color === 'brand-primary' ? 'text-brand-primary' : card.color === 'brand-secondary' ? 'text-brand-secondary' : card.color === 'brand-accent' ? 'text-brand-accent' : 'text-violet-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {card.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — SCREENSHOTS */}
      <section id="product" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="See ExamERP in Action" subtitle="Explore the modules that power end-to-end examination management." />
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {screenshots.map((s, i) => (
              <button key={s.title} onClick={() => setActiveScreenshot(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeScreenshot === i ? 'bg-brand-primary text-white shadow-soft' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {s.title}
              </button>
            ))}
          </div>
          <FadeIn>
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-slate-900 rounded-t-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">{['bg-red-400', 'bg-amber-400', 'bg-emerald-400'].map(c => <span key={c} className={`w-3 h-3 rounded-full ${c}`} />)}</div>
                <span className="text-xs text-slate-400 ml-2">{screenshots[activeScreenshot].title}</span>
              </div>
              <button onClick={() => setLightbox(activeScreenshot)} className="w-full group cursor-pointer">
                <div className={`bg-gradient-to-br ${screenshots[activeScreenshot].color} p-8 md:p-12 rounded-b-2xl min-h-[320px] flex flex-col items-center justify-center text-white transition-transform group-hover:scale-[1.01]`}>
                  <LayoutDashboard className="w-16 h-16 mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold">{screenshots[activeScreenshot].title}</h3>
                  <p className="mt-2 text-white/80">{screenshots[activeScreenshot].desc}</p>
                  <span className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm backdrop-blur-sm">
                    <Eye className="w-4 h-4" /> Click to preview
                  </span>
                </div>
              </button>
            </div>
          </FadeIn>
        </div>
        <AnimatePresence>
          {lightbox !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className={`bg-gradient-to-br ${screenshots[lightbox].color} rounded-2xl p-12 max-w-2xl w-full text-white text-center`} onClick={e => e.stopPropagation()}>
                <LayoutDashboard className="w-20 h-20 mx-auto mb-4 opacity-80" />
                <h3 className="text-3xl font-bold">{screenshots[lightbox].title}</h3>
                <p className="mt-3 text-white/80 text-lg">{screenshots[lightbox].desc}</p>
                <button onClick={() => setLightbox(null)} className="mt-8 px-6 py-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">Close</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 5 — WORKFLOW */}
      <section id="workflow" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="End-to-End Examination Lifecycle Automation" />
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-0">
            {workflow.map((w, i) => (
              <FadeIn key={w.step} delay={i * 0.08} className="flex items-center">
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center p-4 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm w-36 md:w-40 text-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-3">
                    <w.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{w.step}</p>
                </motion.div>
                {i < workflow.length - 1 && (
                  <ChevronRight className="hidden md:block w-6 h-6 text-brand-primary/40 mx-1 flex-shrink-0" />
                )}
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Comprehensive Examination Management Features" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <FadeIn key={f} delay={(i % 4) * 0.05}>
                <motion.div whileHover={{ y: -4 }} className="p-5 rounded-xl bg-brand-surface border border-slate-100 hover:border-brand-primary/30 hover:shadow-soft transition-all flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">{f}</span>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — WHY CHOOSE */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Why Institutions Choose ExamERP" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Automated Scheduling', desc: 'No manual timetable preparation. AI-assisted conflict detection.', icon: Calendar },
              { title: 'Smart Seating Allocation', desc: 'Conflict-free seating plans across halls and campuses.', icon: Grid3X3 },
              { title: 'Result Automation', desc: 'Publish results in minutes, not days.', icon: Zap },
              { title: 'Accreditation Ready Reports', desc: 'NAAC and NBA compliance support built in.', icon: FileText },
              { title: 'Multi-Campus Architecture', desc: 'Manage multiple institutions from one platform.', icon: Layers },
              { title: 'Real-Time Analytics', desc: 'Data-driven decision making at every level.', icon: BarChart3 },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card transition-all h-full">
                  <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
                    <c.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="font-bold text-slate-900">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — COMPARISON */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Why Switch from Legacy Exam Systems?" />
          <FadeIn>
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-card">
              <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200">
                <div className="p-4 md:p-5 font-semibold text-slate-500 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400" /> Legacy Systems</div>
                <div className="p-4 md:p-5 font-semibold text-brand-primary flex items-center gap-2 border-l border-slate-200"><CheckCircle className="w-5 h-5 text-brand-secondary" /> ExamERP</div>
              </div>
              {[
                ['Manual Scheduling', 'Automated Scheduling'],
                ['Spreadsheet Dependency', 'Centralized Platform'],
                ['Delayed Results', 'Instant Result Publishing'],
                ['Limited Reporting', 'Advanced Analytics'],
                ['High Administrative Effort', 'Reduced Operational Cost'],
              ].map(([legacy, modern]) => (
                <div key={legacy} className="grid grid-cols-2 border-b border-slate-100 last:border-0">
                  <div className="p-4 md:p-5 text-sm text-slate-600 flex items-center gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0" />{legacy}</div>
                  <div className="p-4 md:p-5 text-sm text-slate-800 font-medium flex items-center gap-2 border-l border-slate-100 bg-brand-secondary/5"><Check className="w-4 h-4 text-brand-secondary flex-shrink-0" />{modern}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <button onClick={() => scrollTo('#contact')} className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-accent hover:bg-amber-500 text-white font-semibold rounded-xl shadow-card transition-colors">
                Book a Free Consultation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 9 — TESTIMONIALS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Trusted by Educational Institutions" />
          <div className="flex flex-wrap justify-center gap-8 mb-12 opacity-60">
            {['ABC Engineering', 'XYZ Arts & Science', 'National College', 'Global University', 'Tech Institute'].map(name => (
              <span key={name} className="text-lg font-bold text-slate-400">{name}</span>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { quote: 'Reduced examination processing time from 10 days to 2 days.', role: 'Controller of Examinations', org: 'ABC Engineering College' },
              { quote: 'ExamERP eliminated manual errors and significantly improved operational efficiency.', role: 'Principal', org: 'XYZ Arts & Science College' },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-brand-accent text-brand-accent" />)}</div>
                  <p className="text-slate-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="font-semibold text-slate-900">{t.role}</p>
                    <p className="text-sm text-slate-500">{t.org}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 — SECURITY */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Enterprise Security & Compliance" subtitle="Bank-grade security architecture designed for educational institutions." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Role-Based Access Control', icon: Lock },
              { label: 'Audit Logs', icon: Eye },
              { label: 'Cloud Hosted Infrastructure', icon: Cloud },
              { label: 'Daily Automated Backups', icon: Database },
              { label: 'Data Encryption', icon: Shield },
              { label: 'Secure Authentication', icon: CheckCircle },
              { label: 'High Availability Architecture', icon: Zap },
              { label: 'Disaster Recovery Support', icon: Layers },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={(i % 4) * 0.05}>
                <div className="p-5 rounded-xl bg-brand-surface border border-slate-100 flex items-center gap-3 hover:shadow-soft transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{s.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {['ISO 27001', 'SOC 2', 'GDPR', 'SSL/TLS'].map(badge => (
              <span key={badge} className="px-5 py-2.5 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">{badge} Ready</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11 — FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Frequently Asked Questions" />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                    {faq.q}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-slate-600 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 12 — FINAL CTA */}
      <section id="contact" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary to-brand-primary-dark p-10 md:p-16 text-center text-white shadow-glow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-6">
                  <Clock className="w-4 h-4" /> Limited demo slots available this month
                </span>
                <h2 className="text-3xl md:text-4xl font-bold">Ready to Digitize Your Examination Process?</h2>
                <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Book a personalized demo and discover how ExamERP can automate your entire examination lifecycle while reducing administrative workload and improving accuracy.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <button onClick={onLaunchApp} className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-primary font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                    Schedule Demo <Calendar className="w-4 h-4" />
                  </button>
                  <a href="mailto:sales@examerp.com" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                    <Phone className="w-4 h-4" /> Contact Sales
                  </a>
                </div>
                <p className="mt-6 text-sm text-blue-200">No credit card required · Free consultation · Setup in days, not months</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">ExamERP</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">Enterprise examination management for schools, colleges, universities, and multi-campus institutions.</p>
              <div className="flex gap-3 mt-6">
                {[Linkedin, Twitter, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-brand-primary transition-colors" aria-label="Social link">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Solutions', links: ['Universities', 'Colleges', 'Schools', 'Multi-Campus'] },
              { title: 'Resources', links: ['Documentation', 'API', 'Support', 'Status'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} ExamERP. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <button onClick={onLaunchApp} className="hover:text-white transition-colors font-medium text-brand-secondary">Launch App →</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
