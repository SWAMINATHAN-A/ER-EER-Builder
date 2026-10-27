import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Shuffle,
  Info,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ArrowRight,
  TrendingUp,
  Hash,
  Layers,
  Zap,
  Activity,
  GraduationCap,
  Copy,
  Check,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import {
  generateQuadraticHashingSimulation,
  parseKeysInput,
  generateRandomKeys,
  isPrime,
  getNextPrime,
} from '../utils/quadraticHashing';
import QuadraticQuestionsArena from '../components/QuadraticQuestionsArena.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { subscribeToUserHashingProgress } from '../utils/databaseService.js';

export default function HashingVisualizer() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') === 'questions' ? 'questions' : 'visualizer';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [toastMessage, setToastMessage] = useState('');
  const [hashingProgressMap, setHashingProgressMap] = useState({});

  useEffect(() => {
    const nextTab = searchParams.get('tab') === 'questions' ? 'questions' : 'visualizer';
    setActiveTab(nextTab);
  }, [searchParams]);

  useEffect(() => {
    const unsub = subscribeToUserHashingProgress(user?.uid, (map) => {
      setHashingProgressMap(map || {});
    });
    return () => unsub();
  }, [user?.uid]);

  const hashingSolvedCount = useMemo(() => {
    return Object.values(hashingProgressMap).filter((p) => p.status === 'completed').length;
  }, [hashingProgressMap]);

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    if (newTab === 'questions') {
      setSearchParams({ tab: 'questions' });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);
  const [tableSizeInput, setTableSizeInput] = useState(11);
  const [keysInput, setKeysInput] = useState('23, 45, 12, 56, 34, 78, 89');
  const [c1Input, setC1Input] = useState(1);
  const [c2Input, setC2Input] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [actionConvention, setActionConvention] = useState('standard'); // 'standard': Miss=Collision, Hit=Inserted | 'inverted': Hit=Collision, Miss=Inserted
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [table2ViewMode, setTable2ViewMode] = useState('table'); // 'table' | 'grid'

  const activeRowRef = useRef(null);
  const table2RowRefs = useRef({});

  const parsedKeys = useMemo(() => parseKeysInput(keysInput), [keysInput]);
  const isTablePrime = useMemo(() => isPrime(tableSizeInput), [tableSizeInput]);

  const simulation = useMemo(() => {
    return generateQuadraticHashingSimulation({
      tableSize: Math.max(2, tableSizeInput || 11),
      keys: parsedKeys,
      c1: Number(c1Input) || 0,
      c2: Number(c2Input) || 0,
    });
  }, [tableSizeInput, parsedKeys, c1Input, c2Input]);

  const steps = simulation.steps;
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] || null : null;

  const currentTableState = useMemo(() => {
    if (currentStepIndex < 0 || !steps[currentStepIndex]) {
      return Array.from({ length: Math.max(2, tableSizeInput || 11) }, (_, idx) => ({
        index: idx,
        key: null,
        status: 'empty',
      }));
    }
    return steps[currentStepIndex].tableState;
  }, [currentStepIndex, steps, tableSizeInput]);

  const visibleSteps = useMemo(() => {
    if (currentStepIndex < 0 || steps.length === 0) return [];
    return steps.slice(0, currentStepIndex + 1);
  }, [steps, currentStepIndex]);

  const occupiedSlotsCount = useMemo(() => {
    return currentTableState.filter((s) => s.status === 'occupied').length;
  }, [currentTableState]);

  const timerRef = useRef(null);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [tableSizeInput, keysInput, c1Input, c2Input]);

  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(200, Math.floor(1200 / speedMultiplier));
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, speedMultiplier]);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (currentStep && currentStep.calculatedIndex >= 0 && table2RowRefs.current[currentStep.calculatedIndex]) {
      table2RowRefs.current[currentStep.calculatedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex, currentStep]);

  const formatHashFunc = useCallback((step) => {
    const { currentKey: k, probeIndex: i, calculatedIndex } = step;
    const c1 = Number(c1Input) || 0;
    const c2 = Number(c2Input) || 0;
    const M = Number(tableSizeInput) || 11;

    if (i === 0) {
      return {
        formula: `h(${k}, 0) = (${k} + 0) mod ${M}`,
        evaluation: `${k} mod ${M} = ${calculatedIndex}`,
        compact: `(${k} + 0) mod ${M} = ${calculatedIndex}`,
      };
    }

    let offsetExpr = '';
    if (c1 === 0 && c2 === 1) {
      offsetExpr = `${i}²`;
    } else if (c1 === 1 && c2 === 1) {
      offsetExpr = `${i} + ${i}²`;
    } else if (c1 === 0) {
      offsetExpr = `${c2}·${i}²`;
    } else if (c2 === 0) {
      offsetExpr = `${c1}·${i}`;
    } else {
      offsetExpr = `${c1}·${i} + ${c2}·${i}²`;
    }

    const offsetVal = c1 * i + c2 * i * i;
    const total = k + offsetVal;

    return {
      formula: `h(${k}, ${i}) = (${k} + ${offsetExpr}) mod ${M}`,
      evaluation: `(${k} + ${offsetVal}) mod ${M} = ${total} mod ${M} = ${calculatedIndex}`,
      compact: `(${k} + ${offsetExpr}) mod ${M} = ${calculatedIndex}`,
    };
  }, [c1Input, c2Input, tableSizeInput]);

  const getActionDisplay = useCallback((step) => {
    if (step.actionType === 'collision') {
      return {
        primary: actionConvention === 'standard' ? 'Miss' : 'Hit',
        secondary: 'Collision',
        type: 'collision',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      };
    }
    if (step.actionType === 'insert_success') {
      return {
        primary: actionConvention === 'standard' ? 'Hit' : 'Miss',
        secondary: 'Inserted',
        type: 'insert_success',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      };
    }
    if (step.actionType === 'loop_detected') {
      return {
        primary: 'Cycle',
        secondary: 'Loop Detected',
        type: 'loop_detected',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      };
    }
    return {
      primary: 'Full',
      secondary: 'Table Full',
      type: 'table_full',
      badgeClass: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
    };
  }, [actionConvention]);

  const handleCopyTable1 = useCallback(() => {
    const headers = ['Key', 'Hash Function', 'Action (Hit or Miss)', 'Hash Index'];
    const rows = visibleSteps.map((s) => {
      const hf = formatHashFunc(s);
      const action = getActionDisplay(s);
      return [s.currentKey, hf.compact, `${action.primary} (${action.secondary})`, s.calculatedIndex].join('\t');
    });
    const text = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  }, [visibleSteps, formatHashFunc, getActionDisplay]);

  const handlePlayPause = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else if (currentStepIndex < 0) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else if (currentStepIndex === 0) {
      setCurrentStepIndex(-1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
  };

  const handleRandomize = () => {
    const count = Math.min(Math.floor(tableSizeInput * 0.7), 8) || 5;
    const rand = generateRandomKeys(count, 10, 99);
    setKeysInput(rand.join(', '));
  };

  const handleSimulateInVisualizer = useCallback(({ tableSize, keys, c1, c2 }) => {
    setTableSizeInput(tableSize);
    setKeysInput(keys.join(', '));
    setC1Input(c1);
    setC2Input(c2);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    handleTabChange('visualizer');
    setToastMessage(`Simulating question: M=${tableSize}, ${keys.length} keys, c₁=${c1}, c₂=${c2}`);
    setTimeout(() => setToastMessage(''), 4000);
  }, [handleTabChange]);

  const loadFactor = currentStep ? currentStep.loadFactor : 0;
  const isHighLoadFactor = loadFactor > 0.5;

  return (
    <div id="hashing-visualizer-page" className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F7] dark:bg-[#09090B]">
      {/* Top Tab Bar: Visualizer Studio vs Practice Questions */}
      <div
        id="hashing-top-tabs-bar"
        className="h-11 px-3 sm:px-5 bg-white dark:bg-[#141416] border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-2 sm:gap-3 shrink-0 select-none z-20"
      >
        <div className="flex items-center gap-1 p-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.03] dark:border-white/[0.04]">
          <button
            id="tab-btn-visualizer"
            type="button"
            onClick={() => handleTabChange('visualizer')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'visualizer'
                ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Visualizer Studio</span>
          </button>
          <button
            id="tab-btn-questions"
            type="button"
            onClick={() => handleTabChange('questions')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>GATE & Competitive Questions</span>
            {hashingSolvedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/25 text-white font-black">
                {hashingSolvedCount}
              </span>
            )}
          </button>
        </div>

        {toastMessage && (
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 animate-fadeIn">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
          {activeTab === 'visualizer' ? (
            <span>Quadratic Probing Open-Addressing Engine</span>
          ) : (
            <span>15 Previous Year GATE, ISRO & NET Problems</span>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'questions' ? (
        <QuadraticQuestionsArena onSimulateInVisualizer={handleSimulateInVisualizer} />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Configuration and Control Sidebar */}
        <aside
          id="hashing-config-sidebar"
          className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121214] flex flex-col overflow-y-auto shrink-0 z-10"
        >
          <div className="p-4 sm:p-5 space-y-5">
            {/* Header Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                  <Hash className="h-4 w-4" />
                </div>
                <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Quadratic Probing Studio
                </h1>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Step-by-step collision resolution and math analysis for open addressing hash tables.
              </p>
            </div>

            {/* Parameter Inputs Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Table Parameters
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isTablePrime
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isTablePrime ? 'M is Prime ✓' : 'M is Non-Prime ⚠️'}
                </span>
              </div>

              {/* Table Size Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <label htmlFor="input-table-size">Table Size (M)</label>
                  <span className="text-[10px] text-zinc-400 font-mono">Capacity: {tableSizeInput}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="input-table-size"
                    type="number"
                    min={2}
                    max={37}
                    value={tableSizeInput}
                    onChange={(e) => setTableSizeInput(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-24 px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
                    {[7, 11, 13, 17, 19].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTableSizeInput(p)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          tableSizeInput === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keys Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <label htmlFor="input-keys">Keys to Insert</label>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Shuffle className="w-2.5 h-2.5" />
                    Randomize
                  </button>
                </div>
                <input
                  id="input-keys"
                  type="text"
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  placeholder="e.g. 23, 45, 12, 56, 34"
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {parsedKeys.map((k, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quadratic Formula Constants */}
              <div className="space-y-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <span>Quadratic Formula</span>
                  <span className="text-[10px] font-mono text-zinc-500">c₁, c₂</span>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center font-mono text-xs font-bold text-blue-900 dark:text-blue-200">
                  h(k, i) = (k + {c1Input}·i + {c2Input}·i²) mod {tableSizeInput}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="input-c1" className="text-[10px] text-zinc-500 font-medium">Linear Const (c₁)</label>
                    <input
                      id="input-c1"
                      type="number"
                      step="any"
                      value={c1Input}
                      onChange={(e) => setC1Input(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-c2" className="text-[10px] text-zinc-500 font-medium">Quadratic Const (c₂)</label>
                    <input
                      id="input-c2"
                      type="number"
                      step="any"
                      value={c2Input}
                      onChange={(e) => setC2Input(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Formula Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { setC1Input(1); setC2Input(1); }}
                    className="flex-1 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    c₁=1, c₂=1
                  </button>
                  <button
                    type="button"
                    onClick={() => { setC1Input(0); setC2Input(1); }}
                    className="flex-1 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    c₁=0, c₂=1
                  </button>
                  <button
                    type="button"
                    onClick={() => { setC1Input(0.5); setC2Input(0.5); }}
                    className="flex-1 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    c₁=0.5, c₂=0.5
                  </button>
                </div>
              </div>
            </div>

            {/* Playback Controls & Timeline Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  Timeline & Playback
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Step {steps.length > 0 ? currentStepIndex + 1 : 0} of {steps.length}
                </span>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  id="hashing-step-slider"
                  type="range"
                  min={0}
                  max={Math.max(0, steps.length - 1)}
                  value={currentStepIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(parseInt(e.target.value) || 0);
                  }}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between gap-1.5">
                <button
                  id="btn-step-backward"
                  type="button"
                  onClick={handleStepBackward}
                  disabled={currentStepIndex <= 0}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  title="Step Backward"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  id="btn-play-pause"
                  type="button"
                  onClick={handlePlayPause}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-98 ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlaying ? 'Pause' : currentStepIndex >= steps.length - 1 ? 'Replay' : 'Play Simulation'}</span>
                </button>

                <button
                  id="btn-step-forward"
                  type="button"
                  onClick={handleStepForward}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  title="Step Forward"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  id="btn-reset-simulation"
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-2xs"
                  title="Reset Table"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Multiplier Options */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-medium">
                <span>Speed:</span>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeedMultiplier(s)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        speedMultiplier === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theory & Guarantee Notes */}
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Quadratic Probing Theorem</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400/90 leading-relaxed font-sans">
                If the table size <span className="font-bold">M is prime</span> and the load factor{' '}
                <span className="font-bold">α &lt; 0.5</span>, quadratic probing with{' '}
                <span className="font-mono">c₁ = c₂ = 1</span> (or 1/2) is guaranteed to find an empty slot without infinite cycles.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Canvas and Visualizer Stage */}
        <main
          id="hashing-main-stage"
          className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F5F5F7] dark:bg-[#000000] p-4 sm:p-6 space-y-5"
        >
          {/* Top Live Step & Quick Playback Banner */}
          <div
            id="hashing-current-step-banner"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  {currentStep ? `Key ${currentStep.currentKey}` : currentStepIndex < 0 ? 'Ready' : 'Completed'}
                </span>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {currentStep
                    ? `Inserting key (${currentStep.keyIndex + 1} of ${currentStep.totalKeys}) • Probe i = ${currentStep.probeIndex}`
                    : currentStepIndex < 0
                    ? `Ready to simulate insertion of ${parsedKeys.length} keys`
                    : `Completed all ${parsedKeys.length} keys`}
                </span>
              </div>

              {/* Status Outcome Badge */}
              <div className="flex items-center gap-2">
                {currentStep ? (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs ${
                      currentStep.actionType === 'insert_success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : currentStep.actionType === 'collision'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {currentStep.actionType === 'insert_success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : currentStep.actionType === 'collision' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {currentStep.actionType === 'insert_success'
                        ? `Slot [${currentStep.calculatedIndex}] Empty: Key Inserted`
                        : currentStep.actionType === 'collision'
                        ? `Collision at Slot [${currentStep.calculatedIndex}] (Held by ${
                            currentTableState[currentStep.calculatedIndex]?.key ?? 'another key'
                          })`
                        : currentStep.actionType === 'loop_detected'
                        ? 'Cycle Loop Warning'
                        : 'Table Full'}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
                    Press Play Simulation to start animation
                  </span>
                )}
              </div>
            </div>

            {/* Quick Playback & Scrub Bar on Main Stage */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
              {/* Playback Button Group */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleStepBackward}
                  disabled={currentStepIndex < 0}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Step Backward"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlayPause}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-98 ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pause' : currentStepIndex >= steps.length - 1 ? 'Replay' : 'Play Animation'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStepForward}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Step Forward"
                >
                  <span className="hidden sm:inline">Step</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors"
                  title="Reset Animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="flex-1 min-w-[160px] max-w-sm flex items-center gap-2">
                <input
                  type="range"
                  min={-1}
                  max={Math.max(0, steps.length - 1)}
                  value={currentStepIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[11px] font-mono text-zinc-500 shrink-0 whitespace-nowrap">
                  {currentStepIndex >= 0 ? `${currentStepIndex + 1}/${steps.length}` : `0/${steps.length}`}
                </span>
              </div>

              {/* Speed Multipliers */}
              <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                <span className="text-[10px] text-zinc-400">Speed:</span>
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      speedMultiplier === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Expansion Display */}
            {currentStep ? (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Live Mathematical Computation Breakdown
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {currentStep.formulaExplanation}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-xs text-zinc-400">
                Click Play or Step Forward to start tracing the quadratic probe sequence and fill up Table 1 row by row.
              </div>
            )}
          </div>

          {/* TWO TABLES CONTAINER: Table 1 (Trace) & Table 2 (Hash Table Array) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* TABLE 1: Key Probing & Collision Trace */}
            <div
              id="hashing-table-1-container"
              className="lg:col-span-7 flex flex-col bg-white dark:bg-[#141416] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xs overflow-hidden"
            >
              {/* Table 1 Header Bar */}
              <div className="p-3.5 sm:p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Table 1: Key Probing &amp; Collision Trace</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Step-by-step trace showing repeated keys upon collision with next probe
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActionConvention((prev) => (prev === 'standard' ? 'inverted' : 'standard'))}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                    title="Toggle Hit/Miss convention"
                  >
                    Action mode: <span className="font-bold text-blue-600 dark:text-blue-400">{actionConvention === 'standard' ? 'Miss = Collision' : 'Hit = Collision'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyTable1}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy Table 1 to clipboard"
                  >
                    {copiedTrace ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                    <span>{copiedTrace ? 'Copied' : 'Copy'}</span>
                  </button>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                    {visibleSteps.length} of {steps.length} rows
                  </span>
                </div>
              </div>

              {/* Table 1 Content */}
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-black/[0.06] dark:border-white/[0.06]">
                    <tr>
                      <th className="py-2.5 px-3 w-14">#</th>
                      <th className="py-2.5 px-3">key</th>
                      <th className="py-2.5 px-3">hash-func</th>
                      <th className="py-2.5 px-3">action(hit or miss)</th>
                      <th className="py-2.5 px-3 text-center">hash index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {visibleSteps.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-14 text-center text-zinc-400 dark:text-zinc-600 text-xs">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Activity className="w-6 h-6 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                            <p className="font-semibold text-zinc-600 dark:text-zinc-300">Table 1 is ready to animate.</p>
                            <p className="text-[11px] text-zinc-400 max-w-xs">
                              Press <span className="font-bold text-blue-600 dark:text-blue-400">Play Animation</span> or <span className="font-bold text-zinc-700 dark:text-zinc-300">Step</span> to fill rows one-by-one.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleSteps.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const actionInfo = getActionDisplay(step);
                        const hashFuncInfo = formatHashFunc(step);
                        const isCollisionRetry = step.probeIndex > 0;

                        return (
                          <tr
                            key={idx}
                            ref={isActive ? activeRowRef : null}
                            onClick={() => {
                              setIsPlaying(false);
                              setCurrentStepIndex(idx);
                            }}
                            className={`transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'bg-blue-50/90 dark:bg-blue-950/70 font-semibold ring-1 ring-blue-500/50 shadow-xs'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            {/* # Step Index */}
                            <td className="py-2.5 px-3 text-[11px] font-mono text-zinc-400">
                              <div className="flex items-center gap-1">
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                                )}
                                <span>{idx + 1}</span>
                              </div>
                            </td>

                            {/* key column */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-50 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-black/[0.04] dark:border-white/[0.04]">
                                  {step.currentKey}
                                </span>
                                {isCollisionRetry && (
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-0.5"
                                    title={`Collision recovery: Key ${step.currentKey} retrying at probe ${step.probeIndex}`}
                                  >
                                    ↳ probe {step.probeIndex}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* hash-func column */}
                            <td className="py-2.5 px-3">
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {hashFuncInfo.formula}
                                </span>
                                <span className="font-mono text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                                  = {hashFuncInfo.evaluation || hashFuncInfo.compact}
                                </span>
                              </div>
                            </td>

                            {/* action(hit or miss) column */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${actionInfo.badgeClass}`}
                                >
                                  {actionInfo.type === 'collision' ? (
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                  )}
                                  <span>
                                    {actionInfo.primary} ({actionInfo.secondary})
                                  </span>
                                </span>
                              </div>
                            </td>

                            {/* hash index column */}
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg font-mono text-xs font-black border ${
                                  actionInfo.type === 'collision'
                                    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                                    : 'bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                                }`}
                              >
                                {step.calculatedIndex}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 2: Hash Table Array */}
            <div
              id="hashing-table-2-container"
              className="lg:col-span-5 flex flex-col bg-white dark:bg-[#141416] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xs overflow-hidden"
            >
              {/* Table 2 Header Bar */}
              <div className="p-3.5 sm:p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Table 2: Hash Table Array</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Slots updated simultaneously with Table 1 animations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    M = {tableSizeInput}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    {occupiedSlotsCount}/{tableSizeInput} filled
                  </span>

                  {/* View Mode Toggle: Table vs Card Grid */}
                  <div className="flex items-center p-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg border border-black/[0.04] dark:border-white/[0.04] ml-1">
                    <button
                      type="button"
                      onClick={() => setTable2ViewMode('table')}
                      className={`p-1 rounded-md text-[10px] cursor-pointer transition-colors ${
                        table2ViewMode === 'table'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                      }`}
                      title="Table View (hash index | key value)"
                    >
                      <TableIcon className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTable2ViewMode('grid')}
                      className={`p-1 rounded-md text-[10px] cursor-pointer transition-colors ${
                        table2ViewMode === 'grid'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table 2 Content: Table View */}
              {table2ViewMode === 'table' ? (
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-black/[0.06] dark:border-white/[0.06]">
                      <tr>
                        <th className="py-2.5 px-4 w-32">hash index</th>
                        <th className="py-2.5 px-4">key value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                      {currentTableState.map((slot) => {
                        const isTarget = currentStep && currentStep.calculatedIndex === slot.index;
                        const isCollision = isTarget && currentStep.actionType === 'collision';
                        const isSuccess = isTarget && currentStep.actionType === 'insert_success';
                        const isOccupied = slot.status === 'occupied' && slot.key !== null;

                        return (
                          <tr
                            key={slot.index}
                            ref={(el) => {
                              table2RowRefs.current[slot.index] = el;
                            }}
                            className={`transition-all duration-200 ${
                              isCollision
                                ? 'bg-rose-100/90 dark:bg-rose-950/70 ring-2 ring-rose-500 font-semibold'
                                : isSuccess
                                ? 'bg-emerald-100/90 dark:bg-emerald-950/70 ring-2 ring-emerald-500 font-semibold'
                                : isOccupied
                                ? 'bg-white dark:bg-[#141416] hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100'
                                : 'bg-zinc-50/40 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-500'
                            }`}
                          >
                            {/* hash index column */}
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border ${
                                    isCollision
                                      ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100 border-rose-400'
                                      : isSuccess
                                      ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border-emerald-400'
                                      : isOccupied
                                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-900'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-black/[0.04] dark:border-white/[0.04]'
                                  }`}
                                >
                                  [{slot.index}]
                                </span>

                                {isTarget && (
                                  <span
                                    className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                      isCollision
                                        ? 'bg-rose-600 text-white animate-pulse'
                                        : 'bg-emerald-600 text-white'
                                    }`}
                                  >
                                    {isCollision ? 'Collision Target' : 'Target Slot'}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* key value column */}
                            <td className="py-2.5 px-4">
                              {isOccupied ? (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-50">
                                      {slot.key}
                                    </span>
                                    {isSuccess && (
                                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Just Inserted!
                                      </span>
                                    )}
                                    {isCollision && (
                                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Collision with key {slot.key}!
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                                    <span className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06]">
                                      h'={slot.originalHash}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
                                      {slot.probeCount} probe{slot.probeCount === 1 ? '' : 's'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 italic">
                                    -- Empty --
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                                    Available
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Card Grid View (Alternative toggle) */
                <div className="p-3 max-h-[520px] overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {currentTableState.map((slot) => {
                      const isTarget = currentStep && currentStep.calculatedIndex === slot.index;
                      const isCollision = isTarget && currentStep.actionType === 'collision';
                      const isSuccessTarget = isTarget && currentStep.actionType === 'insert_success';

                      let cardStyle =
                        'bg-zinc-50 dark:bg-zinc-900/40 border-black/[0.06] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200';

                      if (slot.status === 'occupied') {
                        cardStyle =
                          'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-950 dark:text-blue-100 shadow-2xs';
                      }
                      if (isCollision) {
                        cardStyle =
                          'bg-rose-100/80 dark:bg-rose-950/70 border-rose-500 text-rose-950 dark:text-rose-100 ring-2 ring-rose-400 dark:ring-rose-600 scale-102';
                      } else if (isSuccessTarget) {
                        cardStyle =
                          'bg-emerald-100/80 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400 dark:ring-emerald-600 scale-102';
                      }

                      return (
                        <div
                          key={slot.index}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between min-h-[80px] ${cardStyle}`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="w-4 h-4 rounded bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center font-mono">
                              {slot.index}
                            </span>
                            <span className="text-[9px] text-zinc-500">
                              {slot.status === 'occupied' ? 'Occupied' : 'Empty'}
                            </span>
                          </div>
                          <div className="my-1 text-center font-mono text-base font-black">
                            {slot.status === 'occupied' && slot.key !== null ? slot.key : '--'}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-mono text-center">
                            {slot.status === 'occupied' ? `${slot.probeCount} probe` : 'free'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics & Statistical Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Load Factor Metric Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  Load Factor (α = N / M)
                </span>
                <span className="font-mono text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {loadFactor.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isHighLoadFactor ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.round(loadFactor * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>Safe Threshold: α &lt; 0.50</span>
                <span>{occupiedSlotsCount} of {tableSizeInput} slots filled</span>
              </div>
            </div>

            {/* Total Collisions Metric Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Total Collisions Encountered
                </span>
                <span className="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
                  {currentStep ? currentStep.totalCollisionsSoFar : 0}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                Secondary clusters and duplicate slot collisions resolved quadratically.
              </p>
            </div>

            {/* Average Probes per Key */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Average Probes / Key
                </span>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {currentStep && currentStep.successfulInsertions > 0
                    ? (currentStep.totalProbesSoFar / currentStep.successfulInsertions).toFixed(2)
                    : '1.00'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                Average number of table lookups required per successful insertion.
              </p>
            </div>
          </div>
        </main>
      </div>
      )}
    </div>
  );
}
