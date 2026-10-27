import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Hash,
  Search,
  Check,
  Lightbulb,
  ArrowRight,
  Play,
  RotateCcw,
  Cloud,
  Save,
  CheckCheck,
  Layers,
  Sparkles,
  Info,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  saveHashingQuestionProgress,
  subscribeToUserHashingProgress,
} from '../utils/databaseService.js';
import { QUADRATIC_PRACTICE_QUESTIONS } from '../data/quadraticQuestions';

export default function QuadraticQuestionsArena({ onSimulateInVisualizer }) {
  const { user } = useAuth();

  const [questionsList] = useState(QUADRATIC_PRACTICE_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState(QUADRATIC_PRACTICE_QUESTIONS[0]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // User answers state: { [subQuestionId]: value }
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [subFeedback, setSubFeedback] = useState({}); // { [subQuestionId]: { isCorrect, expected, userVal, explanation } }

  // Progress state
  const [progressMap, setProgressMap] = useState({});
  const progressMapRef = useRef({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState('');

  // Hints progressive disclosure: { [hintIndex]: boolean }
  const [revealedHints, setRevealedHints] = useState({});
  const [isSolutionExpanded, setIsSolutionExpanded] = useState(false);

  // Subscribe to progress on mount and user change
  useEffect(() => {
    const unsubscribe = subscribeToUserHashingProgress(user?.uid, (map) => {
      const pMap = map || {};
      setProgressMap(pMap);
      progressMapRef.current = pMap;

      // If active question has saved answers, restore them
      if (selectedQuestion) {
        const saved = pMap[selectedQuestion.id];
        if (saved?.userSubAnswers) {
          setUserAnswers((prev) => ({ ...saved.userSubAnswers, ...prev }));
        }
      }
    });
    return () => unsubscribe();
  }, [user?.uid, selectedQuestion?.id]);

  // Load question state when changing selectedQuestion
  const handleSelectQuestion = useCallback((q) => {
    setSelectedQuestion(q);
    const saved = progressMapRef.current[q.id];
    if (saved?.userSubAnswers) {
      setUserAnswers(saved.userSubAnswers);
    } else {
      setUserAnswers({});
    }
    setIsSubmitted(false);
    setSubFeedback({});
    setRevealedHints({});
    setIsSolutionExpanded(false);
  }, []);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questionsList.filter((q) => {
      const matchCat = categoryFilter === 'All' || q.category === categoryFilter;
      const matchDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        q.statement.toLowerCase().includes(query) ||
        q.exam.toLowerCase().includes(query) ||
        q.year.includes(query) ||
        q.keys.some((k) => k.toString().includes(query));
      return matchCat && matchDiff && matchSearch;
    });
  }, [questionsList, categoryFilter, difficultyFilter, searchQuery]);

  // Next / Previous navigation
  const currentIndexInFiltered = filteredQuestions.findIndex((q) => q.id === selectedQuestion?.id);

  const handlePrevQuestion = () => {
    if (currentIndexInFiltered > 0) {
      handleSelectQuestion(filteredQuestions[currentIndexInFiltered - 1]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndexInFiltered < filteredQuestions.length - 1) {
      handleSelectQuestion(filteredQuestions[currentIndexInFiltered + 1]);
    }
  };

  // Answer change handler
  const handleAnswerChange = (subId, val) => {
    setUserAnswers((prev) => ({
      ...prev,
      [subId]: val,
    }));
  };

  // Check / Verify answers
  const handleVerifyAnswers = async () => {
    if (!selectedQuestion) return;

    let correctCount = 0;
    const total = selectedQuestion.subQuestions.length;
    const feedback = {};

    selectedQuestion.subQuestions.forEach((sq) => {
      const userVal = userAnswers[sq.id];
      let isCorrect = false;

      if (sq.type === 'numerical') {
        const parsedUser = parseFloat(userVal);
        const parsedExpected = parseFloat(sq.correctAnswer);
        isCorrect = !isNaN(parsedUser) && Math.abs(parsedUser - parsedExpected) < 0.001;
      } else if (sq.type === 'mcq') {
        isCorrect = String(userVal || '').trim().toLowerCase() === String(sq.correctAnswer).trim().toLowerCase();
      } else {
        isCorrect = String(userVal || '').trim().toLowerCase() === String(sq.correctAnswer).trim().toLowerCase();
      }

      if (isCorrect) correctCount++;

      feedback[sq.id] = {
        isCorrect,
        expected: sq.correctAnswer,
        userVal: userVal ?? '(no answer)',
        explanation: sq.explanation,
      };
    });

    setSubFeedback(feedback);
    setIsSubmitted(true);

    const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const isPerfect = score === 100;
    const isCompleted = isPerfect || score >= 70;

    try {
      const updatedProg = await saveHashingQuestionProgress(user?.uid, selectedQuestion.id, {
        status: isCompleted ? 'completed' : 'in-progress',
        score,
        isPerfect,
        userSubAnswers: userAnswers,
        mistakesCount: total - correctCount,
      });

      setProgressMap((prev) => ({
        ...prev,
        [selectedQuestion.id]: updatedProg,
      }));
      progressMapRef.current[selectedQuestion.id] = updatedProg;
      setSaveStatusText(isCompleted ? 'Solved & Saved!' : 'Progress Saved');
      setTimeout(() => setSaveStatusText(''), 2500);
    } catch (err) {
      console.warn('Error saving hashing question progress:', err);
    }
  };

  // Manual save progress
  const handleSaveProgress = async () => {
    if (!selectedQuestion) return;
    setIsSaving(true);
    try {
      const prev = progressMapRef.current[selectedQuestion.id] || {};
      const updatedProg = await saveHashingQuestionProgress(user?.uid, selectedQuestion.id, {
        status: prev.status || 'in-progress',
        score: prev.score ?? null,
        isPerfect: prev.isPerfect || false,
        userSubAnswers: userAnswers,
        mistakesCount: prev.mistakesCount ?? 0,
      });
      setProgressMap((prevMap) => ({
        ...prevMap,
        [selectedQuestion.id]: updatedProg,
      }));
      progressMapRef.current[selectedQuestion.id] = updatedProg;
      setSaveStatusText(user ? 'Saved to Cloud' : 'Saved Locally');
      setTimeout(() => setSaveStatusText(''), 2500);
    } catch (err) {
      console.error('Error saving progress:', err);
      setSaveStatusText('Save Failed');
      setTimeout(() => setSaveStatusText(''), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset current question answers
  const handleResetAnswers = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setSubFeedback({});
  };

  // Toggle hint
  const toggleHint = (idx) => {
    setRevealedHints((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Progress stats
  const totalSolved = useMemo(() => {
    return Object.values(progressMap).filter((p) => p.status === 'completed').length;
  }, [progressMap]);

  const solvedPercentage = useMemo(() => {
    return Math.round((totalSolved / (questionsList.length || 1)) * 100);
  }, [totalSolved, questionsList.length]);

  return (
    <div id="quadratic-questions-arena" className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F7] dark:bg-[#09090B]">
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Sidebar: Filter, Stats & Questions List */}
        <aside
          id="quadratic-questions-sidebar"
          className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121214] flex flex-col overflow-y-auto shrink-0 z-10"
        >
          <div className="p-4 sm:p-5 space-y-4">
            {/* Header Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-2xs">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  GATE & Competitive Questions
                </h2>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Previous year GATE, ISRO & UGC NET questions for Quadratic Probing with step-by-step verification.
              </p>
            </div>

            {/* Overall Progress & Cloud Sync Banner */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Progress:</span>
                  <span className="font-bold text-zinc-950 dark:text-white">
                    {totalSolved} of {questionsList.length} Solved
                  </span>
                </div>
                {user ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Cloud className="w-3 h-3" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                    Local Cache
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${solvedPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{solvedPercentage}% Mastery</span>
                <span>{questionsList.length - totalSolved} remaining</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, year, or keys..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>Categories</span>
                <span>{filteredQuestions.length} Questions</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  'All',
                  'Collision Resolution',
                  'Probe Sequence',
                  'Search & Cost',
                  'Table State',
                  'Theory & Clustering',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Selector Bar with Prev/Next buttons */}
            <div className="p-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-black/[0.06] dark:border-white/[0.06] flex items-center gap-1.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentIndexInFiltered <= 0}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
                title="Previous question"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={selectedQuestion?.id || ''}
                onChange={(e) => {
                  const found = questionsList.find((q) => q.id === e.target.value);
                  if (found) handleSelectQuestion(found);
                }}
                className="flex-1 min-w-0 py-1 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-black/[0.08] dark:border-white/[0.08] outline-none focus:border-purple-500 truncate cursor-pointer shadow-2xs"
              >
                {filteredQuestions.map((q, idx) => {
                  const prog = progressMap[q.id];
                  const isCompleted = prog?.status === 'completed';
                  return (
                    <option key={q.id} value={q.id}>
                      {isCompleted ? '✓ ' : ''}Q{idx + 1}: [{q.exam} {q.year}] {q.title}
                      {isCompleted && prog?.score != null ? ` (${prog.score}%)` : ''}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={currentIndexInFiltered >= filteredQuestions.length - 1}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
                title="Next question"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Questions Cards List */}
            <div className="space-y-2 pt-1">
              {filteredQuestions.map((q, idx) => {
                const isSelected = selectedQuestion?.id === q.id;
                const prog = progressMap[q.id];
                const isCompleted = prog?.status === 'completed';
                const score = prog?.score;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestion(q)}
                    className={`w-full p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 ring-2 ring-purple-500/30'
                        : 'bg-zinc-50/60 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border-black/[0.06] dark:border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {q.exam} {q.year}
                      </span>
                      <div className="flex items-center gap-1">
                        {isCompleted && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            {score != null ? `${score}%` : 'Solved'}
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded-md ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-2 leading-snug">
                      {q.title}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500 font-mono">
                      <span>M={q.tableSize}</span>
                      <span>•</span>
                      <span>{q.keys.length} keys</span>
                      <span>•</span>
                      <span className="truncate">{q.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area: Question Statement, Parameters, Subquestions & Solutions */}
        <main
          id="quadratic-question-details-pane"
          className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F5F5F7] dark:bg-[#000000] p-4 sm:p-6 space-y-5"
        >
          {selectedQuestion ? (
            <>
              {/* Question Header Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono">
                      {selectedQuestion.exam} {selectedQuestion.year}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {selectedQuestion.paper}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {progressMap[selectedQuestion.id]?.status === 'completed' && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Completed ({progressMap[selectedQuestion.id]?.score}%)
                      </span>
                    )}

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                        selectedQuestion.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : selectedQuestion.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>

                <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                  {selectedQuestion.title}
                </h1>

                {/* Problem Statement Box */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-purple-500" />
                    Problem Statement
                  </div>
                  <p>{selectedQuestion.statement}</p>
                </div>

                {/* Key Mathematical Parameters Card */}
                <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[10px]">Table Size (M):</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-300 shadow-2xs">
                        {selectedQuestion.tableSize}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[10px]">Formula:</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-300 shadow-2xs">
                        {selectedQuestion.hashFormulaDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[10px]">Keys:</span>
                      <div className="flex items-center gap-1">
                        {selectedQuestion.keys.map((k, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs text-[11px]"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Simulate in Visualizer Studio Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSimulateInVisualizer) {
                        onSimulateInVisualizer({
                          tableSize: selectedQuestion.tableSize,
                          keys: selectedQuestion.keys,
                          c1: selectedQuestion.c1,
                          c2: selectedQuestion.c2,
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
                    title="Load these parameters into Visualizer Studio and simulate live"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Simulate in Visualizer</span>
                  </button>
                </div>
              </div>

              {/* Subquestions & Answering Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Questions to Solve ({selectedQuestion.subQuestions.length})
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Standard GATE NAT / MCQ Format
                    </span>
                  </div>

                  {saveStatusText && (
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 animate-pulse">
                      {saveStatusText}
                    </span>
                  )}
                </div>

                {/* Subquestions List */}
                <div className="space-y-4">
                  {selectedQuestion.subQuestions.map((sq, sqIdx) => {
                    const feedback = subFeedback[sq.id];
                    const hasSubmitted = isSubmitted && feedback;
                    const isCorrect = feedback?.isCorrect;

                    return (
                      <div
                        key={sq.id}
                        className={`p-4 rounded-xl border transition-all ${
                          hasSubmitted
                            ? isCorrect
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                            : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-black/[0.06] dark:border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center">
                                {sqIdx + 1}
                              </span>
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                {sq.type === 'numerical' ? 'NAT (Numerical Answer)' : 'Multiple Choice (MCQ)'}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                              {sq.prompt}
                            </div>
                          </div>

                          {hasSubmitted && (
                            <div className="shrink-0">
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950">
                                  <XCircle className="w-3.5 h-3.5" /> Incorrect
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Input Area based on type */}
                        <div className="mt-3">
                          {sq.type === 'numerical' ? (
                            <div className="flex items-center gap-2 max-w-xs">
                              <input
                                type="number"
                                step="any"
                                value={userAnswers[sq.id] ?? ''}
                                onChange={(e) => handleAnswerChange(sq.id, e.target.value)}
                                placeholder="Enter numerical answer..."
                                className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 outline-none focus:border-purple-500 shadow-2xs"
                              />
                            </div>
                          ) : sq.options ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {sq.options.map((opt, optIdx) => {
                                const isChecked = userAnswers[sq.id] === opt;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleAnswerChange(sq.id, opt)}
                                    className={`p-2.5 rounded-xl text-left text-xs font-medium transition-all border flex items-center gap-2.5 cursor-pointer ${
                                      isChecked
                                        ? 'bg-purple-100/70 dark:bg-purple-950/60 border-purple-500 text-purple-950 dark:text-purple-100 font-bold shadow-2xs'
                                        : 'bg-white dark:bg-zinc-800 border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                        isChecked
                                          ? 'border-purple-600 bg-purple-600 text-white'
                                          : 'border-zinc-400 dark:border-zinc-500'
                                      }`}
                                    >
                                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="leading-tight">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>

                        {/* Feedback & Explanation Card */}
                        {hasSubmitted && (
                          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-black/[0.06] dark:border-white/[0.06] text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-zinc-400">Expected:</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {sq.correctAnswer}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                              {sq.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyAnswers}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Check & Submit Answers</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetAnswers}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-2xs"
                      title="Clear Answers"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveProgress}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hints Progressive Disclosure Card */}
              {selectedQuestion.hints && selectedQuestion.hints.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Progressive Hints ({selectedQuestion.hints.length} Available)</span>
                  </div>

                  <div className="space-y-2">
                    {selectedQuestion.hints.map((hint, hIdx) => {
                      const isRevealed = Boolean(revealedHints[hIdx]);
                      return (
                        <div
                          key={hIdx}
                          className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                              Hint {hIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleHint(hIdx)}
                              className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                              {isRevealed ? 'Hide' : 'Reveal Hint'}
                            </button>
                          </div>
                          {isRevealed && (
                            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans pt-1">
                              {hint}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detailed Mathematical Solution Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span>Comprehensive Step-by-Step Mathematical Trace</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSolutionExpanded((prev) => !prev)}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    {isSolutionExpanded ? 'Collapse Solution' : 'View Full Solution'}
                  </button>
                </div>

                {isSolutionExpanded && (
                  <div className="space-y-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                      {selectedQuestion.explanation}
                    </div>

                    {/* Final Expected Hash Table State Display */}
                    {selectedQuestion.expectedTableState && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Final Table State (Slots 0 to {selectedQuestion.tableSize - 1})
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
                          {selectedQuestion.expectedTableState.map((slot) => (
                            <div
                              key={slot.index}
                              className={`p-2.5 rounded-xl border flex flex-col justify-between text-center min-h-[70px] ${
                                slot.key !== null
                                  ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100'
                                  : 'bg-zinc-50 dark:bg-zinc-900/40 border-black/[0.06] dark:border-white/[0.06] text-zinc-400'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-400">
                                <span>[{slot.index}]</span>
                                {slot.probeCount && <span>{slot.probeCount}p</span>}
                              </div>
                              <div className="text-base font-mono font-black my-1 text-zinc-900 dark:text-zinc-50">
                                {slot.key !== null ? slot.key : '--'}
                              </div>
                              <div className="text-[8px] text-zinc-400">
                                {slot.key !== null ? `h'=${slot.originalHash}` : 'empty'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-sm">
              Select a question from the sidebar to start solving.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
