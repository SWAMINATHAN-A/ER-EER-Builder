import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [diagramTitle, setDiagramTitle] = useState('Untitled Schema');

  // Reactive state only for UI display items in the Navbar
  const [practiceData, setPracticeData] = useState({
    selectedQuestion: null,
    questionsList: [],
    filteredQuestions: [],
  });

  // Action refs to store imperative handler functions without triggering re-render cascades
  const practiceActionsRef = useRef({});
  const studioActionsRef = useRef({});
  const learnActionsRef = useRef({});
  const helpActionsRef = useRef({});

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setPracticeConfig = useCallback((config) => {
    if (!config) {
      practiceActionsRef.current = {};
      setPracticeData({ selectedQuestion: null, questionsList: [], filteredQuestions: [] });
      return;
    }

    practiceActionsRef.current = {
      onGenerate: config.onGenerate,
      onAutoLayout: config.onAutoLayout,
      onLoadSolution: config.onLoadSolution,
      onVerify: config.onVerify,
      setSelectedQuestion: config.setSelectedQuestion,
    };

    setPracticeData((prev) => {
      if (
        prev.selectedQuestion?.id === config.selectedQuestion?.id &&
        prev.questionsList?.length === config.questionsList?.length &&
        prev.filteredQuestions?.length === config.filteredQuestions?.length
      ) {
        return prev;
      }
      return {
        selectedQuestion: config.selectedQuestion || null,
        questionsList: config.questionsList || [],
        filteredQuestions: config.filteredQuestions || [],
      };
    });
  }, []);

  const setStudioConfig = useCallback((config) => {
    if (!config) {
      studioActionsRef.current = {};
      return;
    }
    studioActionsRef.current = {
      onGenerate: config.onGenerate,
      onOpenImportAi: config.onOpenImportAi || config.onGenerate,
      onAutoLayout: config.onAutoLayout,
      onOpenSql: config.onOpenSql,
      onExportPng: config.onExportPng,
      onExportSvg: config.onExportSvg,
      onExportPdf: config.onExportPdf,
      onToggleChat: config.onToggleChat,
    };
  }, []);

  const setLearnConfig = useCallback((config) => {
    if (!config) {
      learnActionsRef.current = {};
      return;
    }
    learnActionsRef.current = config;
  }, []);

  const setHelpConfig = useCallback((config) => {
    if (!config) {
      helpActionsRef.current = {};
      return;
    }
    helpActionsRef.current = config;
  }, []);

  return (
    <NavContext.Provider
      value={{
        isDark,
        toggleTheme,
        diagramTitle,
        setDiagramTitle,
        practiceData,
        practiceActionsRef,
        studioActionsRef,
        learnActionsRef,
        helpActionsRef,
        setPracticeConfig,
        setStudioConfig,
        setLearnConfig,
        setHelpConfig,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavProvider');
  }
  return context;
}
