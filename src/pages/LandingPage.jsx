import { useNavigate } from 'react-router-dom';
import { useDiagram } from '../context/DiagramContext.jsx';
import {
  Boxes,
  GitFork,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Cpu,
  GitPullRequest,
  Workflow,
  Hash,
  GraduationCap,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { switchMode } = useDiagram();

  const handleSelectEr = () => {
    switchMode('er');
    navigate('/builder?mode=er');
  };

  const handleSelectEer = () => {
    switchMode('eer');
    navigate('/builder?mode=eer');
  };

  return (
    <div
      id="landing-selection-page"
      className="h-full w-full overflow-y-auto bg-[#F5F5F7] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
    >
      <div id="landing-content-container" className="max-w-5xl w-full mx-auto space-y-10 my-auto">
        {/* Header section */}
        <div id="landing-hero-header" className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Database Architecture & Conceptual Modeling
          </div>
          <h1
            id="landing-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Select Modeling System
          </h1>
          <p
            id="landing-description"
            className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed"
          >
            Choose between standard <strong className="text-zinc-900 dark:text-zinc-200">Entity-Relationship (ER)</strong> and advanced <strong className="text-zinc-900 dark:text-zinc-200">Enhanced Entity-Relationship (EER)</strong> paradigms to launch your tailored design canvas and schema toolset.
          </p>
        </div>

        {/* System Selection Cards */}
        <div id="modeling-systems-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Standard ER Diagram System */}
          <div
            id="select-er-card"
            onClick={handleSelectEr}
            className="group relative rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161618] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                  Standard Model
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  ER Diagram System
                </h2>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  Classic Peter Chen Conceptual Modeling
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                  Ideal for traditional relational database design. Construct strong & weak entities, key and descriptive attributes, and binary relationships with cardinality ratios.
                </p>
              </div>

              {/* ER Visual Diagram Mini-Preview */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-3">
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Component Architecture
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold text-center text-[11px]">
                    Customer
                  </div>
                  <div className="text-zinc-400 font-mono text-[10px]">1</div>
                  <div className="w-7 h-7 rotate-45 border border-amber-500 bg-white dark:bg-zinc-800 flex items-center justify-center">
                    <span className="-rotate-45 text-[8px] font-bold text-amber-600 dark:text-amber-400">Places</span>
                  </div>
                  <div className="text-zinc-400 font-mono text-[10px]">N</div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold text-center text-[11px]">
                    Order
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Strong & Weak Entities with Primary / Foreign Keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>1:1, 1:N, and M:N Associative Cardinalities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Relational Schema SQL DDL Generator</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                id="launch-er-btn"
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] shadow-sm transition-all duration-200 group-hover:shadow-md cursor-pointer"
              >
                <span>Launch ER Studio</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 2: Enhanced EER Diagram System */}
          <div
            id="select-eer-card"
            onClick={handleSelectEer}
            className="group relative rounded-3xl border border-purple-500/30 dark:border-purple-500/40 bg-white dark:bg-[#161618] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99] ring-1 ring-purple-500/20"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                  Enhanced Model
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  EER Diagram System
                </h2>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                  Enhanced Entity-Relationship & Hierarchy Modeling
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                  Engineered for complex enterprise domains with object-oriented extensions. Model Superclasses, Subclasses, Disjoint `(d)` / Overlap `(o)` constraints, and Total completeness.
                </p>
              </div>

              {/* EER Visual Diagram Mini-Preview */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-3">
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Specialization Hierarchy
                </div>
                <div className="flex flex-col items-center gap-2 text-xs">
                  <div className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-600 text-blue-800 dark:text-blue-200 font-semibold text-center text-[11px]">
                    Vehicle (Superclass)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-600 bg-white dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-purple-700 dark:text-purple-300">
                      d
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">Total ISA</span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-600 text-cyan-800 dark:text-cyan-200 font-semibold text-[10px]">
                      Car (Subclass)
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-600 text-cyan-800 dark:text-cyan-200 font-semibold text-[10px]">
                      Truck (Subclass)
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Generalization & Specialization (Superclass / Subclass)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Disjoint `(d)` vs Overlapping `(o)` & Category `(U)` Nodes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Table-Per-Type (TPT) Subclass Foreign Key SQL Generator</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                id="launch-eer-btn"
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-[#9333EA] hover:bg-[#7E22CE] shadow-sm transition-all duration-200 group-hover:shadow-md cursor-pointer"
              >
                <span>Launch EER Studio</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Additional Interactive Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            id="landing-hashing-card"
            onClick={() => navigate('/hashing')}
            className="p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161618] hover:border-blue-500/50 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Hash className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  New Visualizer
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Quadratic Probing Hashing Studio
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Step-by-step interactive simulation for open addressing hash tables with collision tracking, intermediate formula arithmetic, and load factor guarantees.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Open Hashing Visualizer</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div
            id="landing-practice-card"
            onClick={() => navigate('/practice')}
            className="p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161618] hover:border-amber-500/50 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Competitive Exam Mode
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Diagram Analysis & Practice Arena
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Analyze pre-built schemas, answer relational normalization questions, and verify cardinality constraints against GATE & ISRO problem sets.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Practice Arena</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div
          id="system-comparison-section"
          className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161618] p-6 sm:p-8 space-y-5 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Paradigms & Technical Capabilities
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Compare theoretical models and practical tooling between ER and EER
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/learn')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read Full Textbook Guide
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Modeling Feature</th>
                  <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400">ER System</th>
                  <th className="py-2.5 px-3 text-purple-600 dark:text-purple-400">EER System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-medium">Entity & Attribute Modeling</td>
                  <td className="py-2.5 px-3">Strong, Weak, Simple, Multi-valued</td>
                  <td className="py-2.5 px-3">Full ER + Superclass & Subclass Attributes</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Hierarchy & Specialization</td>
                  <td className="py-2.5 px-3 text-zinc-400">Basic associative tables</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    Disjoint (d), Overlap (o), Total / Partial
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Relational SQL Mapping</td>
                  <td className="py-2.5 px-3">Standard 3NF normalization DDL</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    Table-Per-Type (TPT) with Superclass FKs
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">AI Prompt & JSON Architecture</td>
                  <td className="py-2.5 px-3">Classical ER generation</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    EER Schema generation with ISA inheritance
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Team Attribution */}
        <footer
          id="landing-footer"
          className="pt-8 pb-12 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">ER Diagram Studio</span>
            <span>•</span>
            <span>Database Systems Conceptual Modeling</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/developed-by')}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Developed By & Team Credits →
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
