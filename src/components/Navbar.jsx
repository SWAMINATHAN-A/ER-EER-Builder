import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Database,
  Layers,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Eye,
  Sun,
  Moon,
  ArrowLeftRight,
  ChevronDown,
  Download,
  FileCode,
  FileDown,
  Image as ImageIcon,
  Edit3,
  BookOpen,
  HelpCircle,
  Check,
  Printer,
  Copy,
  GraduationCap,
  Boxes,
  Table,
  LogIn,
  LogOut,
  User,
  FolderArchive,
  Activity,
} from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { useNavbar } from '../context/NavContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { NOTATION_DEFINITIONS } from '../utils/notationAdapter.ts';
import NotationLegendModal from './NotationLegendModal.jsx';
import { subscribeToUserHashingProgress } from '../utils/databaseService.js';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { diagramMode, switchMode, selectedNotation, setSelectedNotation } = useDiagram();
  const {
    isDark,
    toggleTheme,
    diagramTitle,
    setDiagramTitle,
    practiceData,
    practiceActionsRef,
    studioActionsRef,
    learnActionsRef,
    helpActionsRef,
  } = useNavbar();

  const isEer = diagramMode === 'eer';
  const isStudio =
    location.pathname === '/builder' ||
    location.pathname === '/er' ||
    location.pathname === '/eer';
  const isPractice = location.pathname === '/practice';
  const isHashing = location.pathname === '/hashing';
  const isHashingQuestions = isHashing && location.search.includes('tab=questions');
  const isLearn = location.pathname === '/learn';
  const isHelp = location.pathname === '/help';

  const [hashingSolvedCount, setHashingSolvedCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToUserHashingProgress(user?.uid, (map) => {
      const count = Object.values(map || {}).filter((p) => p.status === 'completed').length;
      setHashingSolvedCount(count);
    });
    return () => unsub();
  }, [user?.uid]);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const exportRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap shrink-0 select-none ${
      isActive
        ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold'
        : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.04]'
    }`;

  const handleModeToggle = () => {
    const nextMode = isEer ? 'er' : 'eer';
    switchMode(nextMode);
    if (isStudio) {
      navigate(`/builder?mode=${nextMode}`);
    }
  };

  const handleCopyLearnSummary = () => {
    const summary = `ER & EER Diagram Essentials:\n- Entity: Distinguishable real-world object (Rectangle)\n- Attribute: Characteristic property (Oval; underline for Primary Key)\n- Relationship: Association between entities (Diamond; 1:1, 1:N, M:N)\n- Specialization / Generalization: Superclass to Subclass (ISA circle with d/o)\n- Relational Mapping: Regular entity -> Table, 1:N -> Foreign Key on N side, M:N -> Junction table`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  let dynamicSubtitle = 'Conceptual Modeling';
  if (isStudio) dynamicSubtitle = isEer ? 'EER Canvas' : 'Classical ER Canvas';
  else if (isPractice) dynamicSubtitle = isEer ? 'EER Practice' : 'Classical ER Practice';
  else if (isHashing) dynamicSubtitle = isHashingQuestions ? 'GATE Quadratic Hashing' : 'Quadratic Probing Visualizer';
  else if (isLearn) dynamicSubtitle = 'Theory & Guides';
  else if (isHelp) dynamicSubtitle = 'Documentation';
  else if (location.pathname === '/developed-by') dynamicSubtitle = 'Engineering Team';

  return (
    <header
      id="global-top-navbar"
      className="sticky top-0 z-50 h-14 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7]/90 dark:bg-[#161618]/90 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 shrink-0 select-none transition-colors duration-200"
    >
      <div id="navbar-left-section" className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
        <NavLink
          id="global-brand-link"
          to="/"
          className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 group shrink-0"
        >
          <div
            id="global-brand-icon-box"
            className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
              isEer ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
            }`}
          >
            {isEer ? <Layers className="h-4 w-4" /> : <Database className="h-4 w-4" />}
          </div>
          <div className="hidden xl:flex flex-col">
            <span
              id="global-brand-title"
              className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight"
            >
              ER Diagram Studio
            </span>
            <span
              id="global-brand-subtitle"
              className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight"
            >
              {dynamicSubtitle}
            </span>
          </div>
        </NavLink>

        <nav
          id="global-nav-toggle-group"
          className="hidden md:flex items-center gap-0.5 p-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.04] shrink-0"
        >
          <NavLink
            id="nav-tab-studio"
            to={`/builder?mode=${diagramMode}`}
            className={({ isActive }) =>
              `relative px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap shrink-0 select-none ${
                isStudio
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.04]'
              }`
            }
          >
            Studio
          </NavLink>
          <NavLink id="nav-tab-practice" to="/practice" className={navLinkClass}>
            Practice
          </NavLink>
          <NavLink id="nav-tab-hashing" to="/hashing" className={navLinkClass}>
            Hashing
          </NavLink>
          <NavLink id="nav-tab-learn" to="/learn" className={navLinkClass}>
            Learn
          </NavLink>
          <NavLink id="nav-tab-help" to="/help" className={navLinkClass}>
            Help
          </NavLink>
          <NavLink id="nav-tab-developed-by" to="/developed-by" className={navLinkClass}>
            Developed By
          </NavLink>
        </nav>

        <div className="h-4 w-[1px] bg-black/[0.1] dark:bg-white/[0.1] hidden md:block" />
      </div>

      <div
        id="navbar-center-section"
        className="flex items-center gap-2 min-w-0 flex-1 justify-center max-w-xl px-1"
      >
        {isPractice && (
          <div className="flex items-center gap-2 w-full max-w-md sm:max-w-lg">
            <div className="relative flex-1 min-w-0">
              <select
                id="practice-question-selector"
                value={practiceData.selectedQuestion?.id || ''}
                onChange={(e) => {
                  const found = (practiceData.filteredQuestions.length > 0 ? practiceData.filteredQuestions : practiceData.questionsList)?.find((q) => q.id === e.target.value);
                  if (found && practiceActionsRef.current.setSelectedQuestion) {
                    practiceActionsRef.current.setSelectedQuestion(found);
                  }
                }}
                className="w-full text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-3 pr-8 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] outline-none focus:border-amber-500 truncate cursor-pointer shadow-2xs"
              >
                {(practiceData.filteredQuestions.length > 0 ? practiceData.filteredQuestions : practiceData.questionsList).map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.exam} {q.year}] {q.title}
                  </option>
                ))}
              </select>
            </div>
            {practiceData.selectedQuestion?.difficulty && (
              <span
                id="practice-difficulty-badge"
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 hidden sm:inline-block ${
                  practiceData.selectedQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : practiceData.selectedQuestion.difficulty === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {practiceData.selectedQuestion.difficulty}
              </span>
            )}
          </div>
        )}

        {isStudio && (
          <div className="flex items-center gap-2 w-full max-w-md justify-center">
            <div className="relative flex items-center min-w-0 max-w-[200px] sm:max-w-[240px]">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={diagramTitle}
                  onChange={(e) => setDiagramTitle(e.target.value)}
                  onBlur={() => {
                    if (!diagramTitle.trim()) setDiagramTitle('Untitled Schema');
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!diagramTitle.trim()) setDiagramTitle('Untitled Schema');
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-1 rounded-lg border border-blue-500 outline-none shadow-2xs"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to rename diagram"
                  className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-lg transition-colors truncate cursor-pointer"
                >
                  <span className="truncate">{diagramTitle}</span>
                  <Edit3 className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 opacity-60" />
                </button>
              )}
            </div>

            <button
              id="studio-mode-pill-toggle"
              type="button"
              onClick={handleModeToggle}
              title={`Switch between Classical ER and Enhanced EER (Currently ${isEer ? 'EER' : 'ER'})`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
                isEer
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
              }`}
            >
              {isEer ? <Layers className="w-3.5 h-3.5 text-purple-600" /> : <Database className="w-3.5 h-3.5 text-blue-600" />}
              <span>{isEer ? 'EER Mode' : 'ER Mode'}</span>
              <ArrowLeftRight className="w-3 h-3 opacity-60" />
            </button>

            {/* Notation Switcher Control */}
            <div
              id="studio-notation-picker-group"
              className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] p-0.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] shrink-0"
            >
              <select
                id="studio-notation-select"
                value={selectedNotation}
                onChange={(e) => setSelectedNotation(e.target.value)}
                aria-label="Notation"
                className="text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded-lg border-0 outline-none cursor-pointer shadow-2xs"
              >
                <option value="chen">Chen ER</option>
                <option value="crowsfoot">Crow's Foot</option>
                <option value="uml">UML Class</option>
                <option value="minmax">Min-Max</option>
              </select>
              <button
                id="studio-notation-legend-btn"
                type="button"
                onClick={() => setIsLegendModalOpen(true)}
                title="View Notation Guide & Legend"
                className="p-1 rounded-lg text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {isLearn && (
          <div className="flex items-center gap-2 w-full max-w-md">
            <select
              id="learn-topic-selector"
              onChange={(e) => {
                const topicId = e.target.value;
                const elem = document.getElementById(topicId);
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-3 pr-8 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] outline-none focus:border-blue-500 truncate cursor-pointer shadow-2xs"
            >
              <option value="er-core-components-section">Core Conceptual Elements (Entities, Attributes, Rel)</option>
              <option value="attribute-types-section">Attribute Classifications (Key, Multi, Derived)</option>
              <option value="eer-concepts-section">Specialization & Generalization (ISA Hierarchies)</option>
              <option value="mapping-rules-section">Relational Schema Mapping Rules (7 Steps)</option>
              <option value="video-tutorial-section">Video Walkthrough & Tutorial</option>
              <option value="references-section">Academic Textbooks (Silberschatz/Korth 7th Ed)</option>
            </select>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 shrink-0 hidden sm:inline-block">
              Foundations
            </span>
          </div>
        )}

        {isHelp && (
          <div className="flex items-center gap-2 w-full max-w-md">
            <select
              id="help-step-selector"
              onChange={(e) => {
                const stepId = e.target.value;
                const elem = document.getElementById(stepId);
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pl-3 pr-8 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] outline-none focus:border-blue-500 truncate cursor-pointer shadow-2xs"
            >
              <option value="step-drag-nodes">01: Dragging Shapes onto Canvas</option>
              <option value="step-connect-nodes">02: Connecting Shapes with Edges</option>
              <option value="step-rename-nodes">03: Renaming Labels & Blank Protection</option>
              <option value="step-generate-sql">04: Generating SQL Schema DDL</option>
              <option value="step-download-report">05: Exporting Schema PDF Audit Report</option>
            </select>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 shrink-0 hidden sm:inline-block">
              5 Steps
            </span>
          </div>
        )}

        {isHashing && (
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/[0.03] dark:border-white/[0.04] shadow-2xs">
            <button
              id="navbar-hashing-tab-visualizer"
              type="button"
              onClick={() => navigate('/hashing')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                !isHashingQuestions
                  ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Visualizer
            </button>
            <button
              id="navbar-hashing-tab-questions"
              type="button"
              onClick={() => navigate('/hashing?tab=questions')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                isHashingQuestions
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>GATE Questions</span>
              {hashingSolvedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/25 text-white font-black">
                  {hashingSolvedCount}
                </span>
              )}
            </button>
          </div>
        )}

        {!isStudio && !isPractice && !isLearn && !isHelp && !isHashing && (
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
            Entity-Relationship Diagram Studio
          </div>
        )}
      </div>

      <div id="navbar-right-actions" className="flex items-center gap-2 shrink-0">
        {isPractice && (
          <>
            <button
              id="navbar-practice-solution-btn"
              type="button"
              onClick={() => practiceActionsRef.current.onLoadSolution?.()}
              title="Load model solution diagram"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Model Solution</span>
            </button>

            <button
              id="navbar-practice-autolayout-btn"
              type="button"
              onClick={() => practiceActionsRef.current.onAutoLayout?.()}
              title="Auto-organize diagram hierarchy"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="hidden sm:inline">Auto Layout</span>
            </button>

            <div
              id="practice-notation-picker-group"
              className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] p-0.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] shrink-0"
            >
              <select
                id="practice-notation-select"
                value={selectedNotation}
                onChange={(e) => setSelectedNotation(e.target.value)}
                aria-label="Practice Notation"
                className="text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded-lg border-0 outline-none cursor-pointer shadow-2xs"
              >
                <option value="chen">Chen ER</option>
                <option value="crowsfoot">Crow's Foot</option>
                <option value="uml">UML Class</option>
                <option value="minmax">Min-Max</option>
              </select>
              <button
                id="practice-notation-legend-btn"
                type="button"
                onClick={() => setIsLegendModalOpen(true)}
                title="View Notation Guide & Legend"
                className="p-1 rounded-lg text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </>
        )}

        {isStudio && (
          <>
            <button
              id="navbar-studio-generate-btn"
              type="button"
              onClick={() => (studioActionsRef.current.onGenerate || studioActionsRef.current.onOpenImportAi)?.()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer shadow-2xs"
              title="Generate Schema with AI Prompt or JSON"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Generate</span>
            </button>

            <button
              id="navbar-studio-autolayout-btn"
              type="button"
              onClick={() => studioActionsRef.current.onAutoLayout?.()}
              title="Auto-arrange diagram nodes"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden xl:inline">Auto Layout</span>
            </button>

            <button
              id="navbar-studio-viewsql-btn"
              type="button"
              onClick={() => studioActionsRef.current.onOpenSql?.()}
              title="View & Generate SQL CREATE TABLE statements"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">View SQL</span>
            </button>

            <button
              id="navbar-studio-saved-schemas-btn"
              type="button"
              onClick={() => studioActionsRef.current.onOpenSavedSchemas?.()}
              title="Open Cloud Schema Manager"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
            >
              <FolderArchive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden lg:inline">Schemas</span>
            </button>

            <div className="relative" ref={exportRef}>
              <button
                id="navbar-studio-export-btn"
                type="button"
                onClick={() => setIsExportOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden xs:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] shadow-lg py-1.5 z-50 text-xs font-medium space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      studioActionsRef.current.onExportPng?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>PNG Image (2x HD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      studioActionsRef.current.onExportSvg?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SVG Vector Graphic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      studioActionsRef.current.onOpenSql?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-purple-600" />
                    <span>SQL Schema DDL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportOpen(false);
                      studioActionsRef.current.onExportPdf?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-t border-black/[0.04] dark:border-white/[0.04] pt-1 mt-0.5"
                  >
                    <FileDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>PDF Audit Report</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {isLearn && (
          <>
            <button
              id="navbar-learn-copy-btn"
              type="button"
              onClick={handleCopyLearnSummary}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Copy core ER & EER cheat sheet summary"
            >
              {copiedSummary ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className="hidden md:inline">{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              id="navbar-learn-practice-btn"
              type="button"
              onClick={() => navigate('/practice')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Practice Arena</span>
            </button>

            <button
              id="navbar-learn-studio-btn"
              type="button"
              onClick={() => navigate(`/builder?mode=${diagramMode}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </button>
          </>
        )}

        {isHelp && (
          <>
            <button
              id="navbar-help-print-btn"
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Print operations guide"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden md:inline">Print Guide</span>
            </button>

            <button
              id="navbar-help-practice-btn"
              type="button"
              onClick={() => navigate('/practice')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Practice Arena</span>
            </button>

            <button
              id="navbar-help-studio-btn"
              type="button"
              onClick={() => navigate(`/builder?mode=${diagramMode}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </button>
          </>
        )}

        {isHashing && (
          <>
            {isHashingQuestions ? (
              <button
                type="button"
                onClick={() => navigate('/hashing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Launch Visualizer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/hashing?tab=questions')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Practice Questions</span>
                <span className="sm:hidden">Questions</span>
                {hashingSolvedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white font-black">
                    {hashingSolvedCount}/15
                  </span>
                )}
              </button>
            )}
          </>
        )}

        {!isStudio && !isPractice && !isLearn && !isHelp && !isHashing && (
          <>
            <button
              type="button"
              onClick={() => navigate(`/builder?mode=${diagramMode}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </button>
          </>
        )}

        {user ? (
          <div className="flex items-center gap-1.5 pl-1">
            <div
              title={`Signed in as ${user.displayName || user.email}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] shadow-2xs text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <span className="hidden xl:inline max-w-[90px] truncate text-[11px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white text-zinc-600 hover:text-rose-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-2xs cursor-pointer shrink-0"
            title="Sign In with Firebase"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </NavLink>
        )}

        <button
          id="global-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:text-zinc-900 dark:bg-[#1C1C1E] dark:text-zinc-300 dark:hover:bg-[#2C2C2E] dark:hover:text-zinc-100 cursor-pointer transition-all duration-200 active:scale-95 shrink-0 flex-shrink-0"
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          )}
        </button>
      </div>

      <NotationLegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
        selectedNotation={selectedNotation}
        onSelectNotation={setSelectedNotation}
      />
    </header>
  );
}
