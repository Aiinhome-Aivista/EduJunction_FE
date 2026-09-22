import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  ShieldCheck,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  BarChart3,
  CheckCircle,
  XCircle,
  PenTool,
  ArrowLeft,
  GraduationCap,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface QuestionItem {
  key?: string;
  num?: number;
  question: string;
  type?: string;
  options?: string[];
  marks?: number;
  case_title?: string;
  case_text?: string;
  correct_answer?: string;
  explanation?: string;
}

interface SectionItem {
  id?: string;
  name: string;
  title?: string;
  type?: string;
  marksObtained?: number;
  maxMarks?: number;
  percentage?: number;
  attempted?: number;
  totalQuestions?: number;
  questions: QuestionItem[];
}

interface PaperData {
  title?: string;
  board?: string;
  class_grade?: string;
  subject?: string;
  set_number?: number;
  time_allowed?: string;
  max_marks?: number;
  instructions?: string[];
  sections: SectionItem[];
}

interface QuestionEvaluationItem {
  key: string;
  num: number;
  sectionName: string;
  sectionTitle: string;
  question: string;
  type: string;
  options?: string[];
  marksAwarded: number;
  maxMarks: number;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  feedback: string;
  matchedKeywords?: string[];
  missedKeywords?: string[];
}

interface EvaluationResultData {
  subscriptionId: number | string;
  board: string;
  classGrade: string;
  subject: string;
  setNumber: number;
  totalMarksObtained: number;
  maxMarks: number;
  accuracyPercentage: number;
  grade: string;
  timeSpentSeconds: number;
  summary: {
    totalQuestions: number;
    attemptedCount: number;
    correctCount: number;
    partialCount: number;
    incorrectCount: number;
  };
  sectionBreakdown: SectionItem[];
  questionEvaluations: QuestionEvaluationItem[];
}

export const ModelExamPage: React.FC = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userRole = (localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || '').toUpperCase();
  const isViewOnly = userRole === 'PARENT' || searchParams.get('mode') === 'view';

  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'TEST' | 'RESULT'>('TEST');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultData | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [activeCanvasKey, setActiveCanvasKey] = useState<string | null>(null);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState<boolean>(false);
  const [drawnDiagrams, setDrawnDiagrams] = useState<Record<string, string>>({});

  // Helper to focus first unanswered question when user chooses to 'Go Back'
  const handleGoBackToFirstUnanswered = () => {
    setShowSubmitConfirm(false);
    setSelectedSection('ALL');

    if (!paperData?.sections) return;

    // Flatten all questions
    const allQs: { key: string }[] = [];
    paperData.sections.forEach((sec, sIdx) => {
      sec.questions.forEach((q, qIdx) => {
        allQs.push({ key: q.key || `s${sIdx}_q${qIdx}` });
      });
    });

    const firstUnanswered = allQs.find((q) => !answers[q.key]?.trim() && !drawnDiagrams[q.key]);
    if (firstUnanswered) {
      setTimeout(() => {
        const el = document.getElementById(`q_card_${firstUnanswered.key}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-amber-400');
          setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 3000);
        }
      }, 150);
    }
  };

  // Load paper on mount
  useEffect(() => {
    if (!subscriptionId) {
      setError('Subscription ID not found');
      setIsLoading(false);
      return;
    }

    const loadPaper = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await ApiServices.previewSubjectModelPaper(subscriptionId);
        const data = res?.data !== undefined ? res.data : res;
        if (data) {
          const rawPaper = data.paper || data;
          const normalized: PaperData = {
            board: data.board || rawPaper.board || 'CBSE',
            class_grade: data.classGrade || data.class_grade || rawPaper.class_grade || rawPaper.classGrade || 'Class 10',
            subject: data.subject || rawPaper.subject || 'Mathematics',
            set_number: data.setNumber || data.set_number || rawPaper.set_number || rawPaper.setNumber || 1,
            time_allowed: data.timeAllowed || data.time_allowed || rawPaper.time_allowed || rawPaper.timeAllowed || '3 Hours (180 Minutes)',
            max_marks: data.maxMarks || data.max_marks || rawPaper.max_marks || rawPaper.maxMarks || 80,
            instructions: data.instructions || rawPaper.instructions || [],
            sections: data.sections || rawPaper.sections || [],
          };
          setPaperData(normalized);
        } else {
          setError('Failed to load examination paper');
        }
      } catch (err: any) {
        console.error('Failed to load paper:', err);
        setError(err?.response?.data?.message || err?.message || 'Unable to access model question paper. Please ensure you are logged in and have purchased this pass.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaper();
  }, [subscriptionId]);

  const totalAllowedSeconds = useMemo(() => {
    if (!paperData?.time_allowed) return 10800;
    const str = paperData.time_allowed.toLowerCase();
    if (str.includes('min')) {
      const match = str.match(/(\d+)\s*min/);
      if (match) return parseInt(match[1]) * 60;
    }
    if (str.includes('hour') || str.includes('hr')) {
      const match = str.match(/(\d+)\s*h/);
      if (match) return parseInt(match[1]) * 3600;
    }
    return 10800;
  }, [paperData]);

  const remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);

  // Timer for test taking (Reverse Countdown & Auto-Submit on Time Up) - only for student taking exam
  useEffect(() => {
    let interval: any = null;
    if (!isViewOnly && activeMode === 'TEST' && !isLoading && !error) {
      if (remainingSeconds <= 0 && !isSubmitting && !isTimeUpModalOpen) {
        setIsTimeUpModalOpen(true);
        setShowSubmitConfirm(false);
        handleSubmitTest();
        return;
      }

      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isViewOnly, activeMode, isLoading, error, remainingSeconds, isSubmitting, isTimeUpModalOpen]);

  // Content security: prevent right click and print shortcuts inside page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectOption = (qKey: string, optLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qKey]: optLetter,
    }));
  };

  const handleTextAnswerChange = (qKey: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qKey]: text,
    }));
  };

  const toggleSolution = (key: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    if (!evaluationResult?.questionEvaluations) return;

    const newMap: Record<string, boolean> = {};
    evaluationResult.questionEvaluations.forEach((item) => {
      newMap[item.key] = nextState;
    });
    setExpandedSolutions(newMap);
  };

  // Submit test for automated grading
  const handleSubmitTest = async () => {
    if (!subscriptionId) return;
    try {
      setIsSubmitting(true);
      setShowSubmitConfirm(false);

      // Merge text answers + drawn diagrams cleanly for evaluation payload
      const finalAnswersPayload: Record<string, string> = { ...answers };
      Object.keys(drawnDiagrams).forEach((key) => {
        if (drawnDiagrams[key]) {
          const textPart = answers[key] || '';
          finalAnswersPayload[key] = `${textPart}\n[🎨 Diagram Drawing: ${drawnDiagrams[key]}]`.trim();
        }
      });

      const res = await ApiServices.evaluateSubjectModelPaper(subscriptionId, {
        answers: finalAnswersPayload,
        timeSpentSeconds: elapsedSeconds,
      });

      const data = res?.data !== undefined ? res.data : res;

      if (data) {
        setEvaluationResult(data);
        setActiveMode('RESULT');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Failed to evaluate model paper:', err);
      alert('Failed to evaluate test paper. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    if (window.confirm('Are you sure you want to re-take this test? Your previous answers will be cleared.')) {
      setAnswers({});
      setDrawnDiagrams({});
      setEvaluationResult(null);
      setActiveMode('TEST');
      setElapsedSeconds(0);
      setSelectedSection('ALL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExit = () => {
    if (activeMode === 'TEST' && (Object.keys(answers).length > 0 || Object.keys(drawnDiagrams).length > 0)) {
      if (window.confirm('Are you sure you want to exit the exam? Your unsaved progress will be lost.')) {
        navigate('/pricing');
      }
    } else {
      navigate('/pricing');
    }
  };

  const sectionsToRender = useMemo(() => {
    if (activeMode === 'RESULT' && evaluationResult) {
      return evaluationResult.sectionBreakdown || [];
    }
    return paperData?.sections || [];
  }, [activeMode, paperData, evaluationResult]);

  const filteredSections = useMemo(() => {
    if (!sectionsToRender) return [];
    return sectionsToRender
      .filter((sec) => selectedSection === 'ALL' || sec.name === selectedSection)
      .map((sec) => {
        if (!searchQuery.trim()) return sec;
        const q = searchQuery.toLowerCase();
        const matchedQuestions = sec.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.options?.some((opt) => opt.toLowerCase().includes(q))
        );
        return {
          ...sec,
          questions: matchedQuestions,
        };
      })
      .filter((sec) => sec.questions.length > 0);
  }, [sectionsToRender, selectedSection, searchQuery]);

  const totalQuestions = useMemo(() => {
    if (!sectionsToRender) return 0;
    return sectionsToRender.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0);
  }, [sectionsToRender]);

  const answeredCount = useMemo(() => {
    const textKeys = Object.keys(answers).filter((val) => typeof val === 'string' && val.trim().length > 0);
    const diagKeys = Object.keys(drawnDiagrams).filter((val) => !!drawnDiagrams[val]);
    return new Set([...textKeys, ...diagKeys]).size;
  }, [answers, drawnDiagrams]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setLabel = `Set ${paperData?.set_number || 1}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-base font-bold text-stone-300">Loading your authentic 2027 Specimen Model Exam...</p>
      </div>
    );
  }

  if (error || !paperData) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-stone-900">Unable to Load Examination</h2>
          <p className="text-xs text-stone-600 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all shadow-sm cursor-pointer"
          >
            Return to Pricing & Passes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-stone-100 flex flex-col select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white border-b border-stone-700/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white truncate">
                  {paperData.board} {paperData.class_grade} — {paperData.subject}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                  {setLabel}
                </span>
                {activeMode === 'RESULT' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/40">
                    Scorecard &amp; Review
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Header controls — Timer + Marks + Rubric (right side) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isViewOnly ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-2xs">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Parent Preview (Read-Only)</span>
              </div>
            ) : (
              /* Reverse Countdown / Time Remaining info */
              <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border transition-all ${
                activeMode === 'TEST' && remainingSeconds <= 300
                  ? 'bg-amber-400 text-stone-950 border-amber-300 animate-pulse ring-2 ring-amber-400/60 font-black'
                  : 'bg-white/10 border-white/15 text-white'
              }`}>
                <span className="font-black text-base sm:text-lg leading-none font-mono">
                  {activeMode === 'RESULT'
                    ? formatTimer(evaluationResult?.timeSpentSeconds || elapsedSeconds)
                    : formatTimer(remainingSeconds)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
                  {activeMode === 'RESULT' ? 'Time Spent' : 'Time Remaining'}
                </span>
              </div>
            )}

            {/* Marks */}
            <div className="hidden sm:flex flex-col items-center px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30">
              <span className="text-amber-300 font-black text-base sm:text-lg leading-none">
                {paperData.max_marks || 80}
              </span>
              <span className="text-amber-400/80 text-[10px] font-semibold uppercase tracking-wider">Marks</span>
            </div>

            {/* Standard Board Rubric */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 text-[11px] font-bold">Board Rubric</span>
            </div>

            {/* Close / Return Button */}
            <button
              type="button"
              onClick={handleExit}
              className="py-1.5 px-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-stone-600"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isViewOnly ? 'Close View' : 'Exit Exam'}</span>
            </button>

            {activeMode === 'RESULT' && !isViewOnly && (
              <button
                type="button"
                onClick={handleRetake}
                className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-take</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Evaluation Banner (Only in RESULT mode) */}
      {activeMode === 'RESULT' && evaluationResult && (
        <div className="bg-gradient-to-r from-stone-900 via-amber-950/70 to-stone-900 text-white border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-400 shrink-0 shadow-lg">
                <span className="text-2xl font-black">{evaluationResult.totalMarksObtained}</span>
                <span className="text-xs font-bold text-stone-400">/ {evaluationResult.maxMarks}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Evaluation Completed</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                    {evaluationResult.grade}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  Overall Score: {evaluationResult.accuracyPercentage}% Marks Obtained
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  Attempted {evaluationResult.summary.attemptedCount} of {evaluationResult.summary.totalQuestions} Questions • {evaluationResult.summary.correctCount} Correct • {evaluationResult.summary.partialCount} Partial
                </p>
              </div>
            </div>

            {/* Section Breakdown Pills */}
            <div className="flex flex-wrap items-center gap-2.5 justify-center md:justify-end">
              {evaluationResult.sectionBreakdown.map((sec, sIdx) => (
                <div
                  key={sec.id || sIdx}
                  className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center"
                >
                  <div className="text-[10px] font-bold text-amber-300 uppercase">{sec.name}</div>
                  <div className="text-sm font-black text-white">{sec.marksObtained} / {sec.maxMarks}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions Accordion in TEST mode */}
      {activeMode === 'TEST' && paperData.instructions && paperData.instructions.length > 0 && (
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="font-bold text-amber-950 flex items-center gap-1.5 hover:text-amber-800 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>General Instructions & Pattern Guidelines</span>
              {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showInstructions && (
            <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200 text-xs text-stone-700 space-y-1 animate-in fade-in duration-150">
              {paperData.instructions.map((inst, i) => (
                <p key={i} className="text-[11px] leading-relaxed text-stone-600">• {inst}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Section Tabs Strip */}
      <div className="bg-white border-b border-stone-200 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Section Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSection('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedSection === 'ALL'
                  ? 'bg-amber-400 text-stone-950 shadow-xs font-black'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              All Sections ({totalQuestions})
            </button>
            {sectionsToRender.map((sec, idx) => {
              const secName = sec.name || `Section ${idx + 1}`;
              const isSelected = selectedSection === secName;
              return (
                <button
                  key={sec.id || idx}
                  type="button"
                  onClick={() => setSelectedSection(secName)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 text-amber-400 shadow-xs font-black'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-200/70 border border-stone-200'
                  }`}
                >
                  <span>{secName}</span>
                  <span className="text-[10px] opacity-70">({sec.questions.length})</span>
                </button>
              );
            })}
          </div>

          {/* Search and Action Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions & topics..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>

            {activeMode === 'RESULT' && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {allExpanded ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    <span>Collapse Solutions</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>View All Solutions</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Examination Questions Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8 pb-32">
        {filteredSections.length === 0 ? (
          <div className="py-24 text-center text-stone-400 space-y-2 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
            <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-base font-bold text-stone-700">No questions found matching your filter.</p>
            <p className="text-xs text-stone-400">Try clearing the search query or selecting All Sections.</p>
          </div>
        ) : (
          filteredSections.map((section, sIdx) => {
            const secTitle = section.title || section.name;

            return (
              <div key={section.id || sIdx} className="space-y-4">
                {/* Section Title Banner */}
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      {secTitle}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {section.questions.length} Questions • Provide step-by-step derivations and clear reasoning
                    </p>
                  </div>

                  {activeMode === 'RESULT' && section.marksObtained !== undefined && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-black border border-amber-200 self-start sm:self-auto">
                      Score: {section.marksObtained} / {section.maxMarks} Marks
                    </span>
                  )}
                </div>

                {/* Questions Grid */}
                <div className="space-y-4">
                  {section.questions.map((q, qIdx) => {
                    const qKey = q.key || `s${sIdx}_q${qIdx}`;
                    const qNum = q.num || qIdx + 1;
                    const qMarks = q.marks || 1;
                    const qType = (q.type || 'saq').toLowerCase();
                    const isMcq = qType === 'mcq' || (q.options && q.options.length > 0);
                    const currentStudentAns = answers[qKey] || '';

                    // Result mode data
                    const evalItem = activeMode === 'RESULT' && evaluationResult
                      ? evaluationResult.questionEvaluations?.find((e) => e.key === qKey || e.num === qNum)
                      : null;

                    const isSolutionOpen = expandedSolutions[qKey];

                    return (
                      <div
                        key={qKey}
                        id={`q_card_${qKey}`}
                        className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs hover:border-amber-300 transition-all space-y-4"
                      >
                        {/* Question Header & Prompt */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                Q{qNum}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
                                {qMarks} {qMarks > 1 ? 'Marks' : 'Mark'}
                              </span>
                              {isMcq ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-stone-900 border border-amber-300 text-xs font-bold">
                                  Multiple Choice
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-lg bg-stone-900 text-amber-300 text-xs font-bold">
                                  Descriptive / Step Answer
                                </span>
                              )}
                            </div>

                            {/* Marks awarded badge in Result mode */}
                            {evalItem && (
                              <div className="flex items-center gap-2">
                                {evalItem.marksAwarded >= evalItem.maxMarks ? (
                                  <span className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 text-xs font-black border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle className="w-4 h-4 text-stone-950" />
                                    +{evalItem.marksAwarded} / {evalItem.maxMarks} Marks
                                  </span>
                                ) : evalItem.marksAwarded > 0 ? (
                                  <span className="px-3 py-1 rounded-xl bg-stone-200 text-stone-900 text-xs font-black border border-stone-300 flex items-center gap-1.5 shadow-2xs">
                                    <AlertCircle className="w-4 h-4 text-stone-700" />
                                    +{evalItem.marksAwarded} / {evalItem.maxMarks} Marks
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-xl bg-stone-900 text-stone-100 text-xs font-black border border-stone-700 flex items-center gap-1.5 shadow-2xs">
                                    <XCircle className="w-4 h-4 text-stone-400" />
                                    0 / {evalItem.maxMarks} Marks
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Case Study Context if present */}
                          {q.case_title && (
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                                {q.case_title}
                              </p>
                              {q.case_text && <p className="text-stone-700 text-xs leading-relaxed">{q.case_text}</p>}
                            </div>
                          )}

                          {/* Question Text */}
                          <div
                            className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed pt-1"
                            dangerouslySetInnerHTML={{ __html: q.question }}
                          />
                        </div>

                        {/* ========================================================= */}
                        {/* TEST MODE: Parent Read-Only or Student Interactive Inputs */}
                        {/* ========================================================= */}
                        {activeMode === 'TEST' && (
                          <div className="pt-2 space-y-3">
                            {isViewOnly ? (
                              /* ── Parent Read-Only Mode ── */
                              <div className="space-y-3">
                                {isMcq && q.options && q.options.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                      Options:
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {q.options.map((opt, optIdx) => {
                                        const optLetter = chr(65 + optIdx);
                                        return (
                                          <div
                                            key={optIdx}
                                            className="p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold flex items-start gap-3 border bg-stone-50/70 border-stone-200 text-stone-800"
                                          >
                                            <span className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-black shrink-0">
                                              {optLetter}
                                            </span>
                                            <span className="leading-snug pt-0.5">{opt}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Model Answer Accordion for Parent View */}
                                {(q.correct_answer || q.explanation) && (
                                  <div className="pt-1">
                                    <button
                                      type="button"
                                      onClick={() => toggleSolution(qKey)}
                                      className="w-full py-2.5 px-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100 text-stone-900 text-xs font-bold flex items-center justify-between transition-colors border border-amber-200 cursor-pointer"
                                    >
                                      <span className="flex items-center gap-2 font-bold text-amber-950">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                        View Model Answer &amp; Solution Details
                                      </span>
                                      {isSolutionOpen ? (
                                        <ChevronUp className="w-4 h-4 text-amber-800" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-amber-800" />
                                      )}
                                    </button>

                                    {isSolutionOpen && (
                                      <div className="mt-2 p-4 rounded-2xl bg-white border border-amber-300/80 space-y-2 text-xs animate-in fade-in duration-150 shadow-2xs">
                                        {q.correct_answer && (
                                          <div>
                                            <span className="text-[10px] font-black uppercase text-amber-900 block">
                                              Correct Model Answer:
                                            </span>
                                            <div className="text-stone-900 font-bold mt-0.5">{q.correct_answer}</div>
                                          </div>
                                        )}
                                        {q.explanation && (
                                          <div className="pt-1.5 border-t border-amber-100">
                                            <span className="text-[10px] font-black uppercase text-amber-900 block">
                                              Step-by-Step Solution &amp; Marking Scheme:
                                            </span>
                                            <div className="text-stone-700 leading-relaxed mt-0.5 whitespace-pre-line">{q.explanation}</div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* ── Student Interactive Test Mode ── */
                              <div>
                                {isMcq && q.options && q.options.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                      Select your answer:
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {q.options.map((opt, optIdx) => {
                                        const optLetter = chr(65 + optIdx);
                                        const isSelected = currentStudentAns.toUpperCase() === optLetter;

                                        return (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            onClick={() => handleSelectOption(qKey, optLetter)}
                                            className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold transition-all flex items-start gap-3 border cursor-pointer ${
                                              isSelected
                                                ? 'bg-amber-50 border-amber-500 text-stone-950 font-bold shadow-xs ring-2 ring-amber-400'
                                                : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200 text-stone-700'
                                            }`}
                                          >
                                            <span
                                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                                isSelected
                                                  ? 'bg-amber-500 text-stone-950'
                                                  : 'bg-stone-200 text-stone-600'
                                              }`}
                                            >
                                              {optLetter}
                                            </span>
                                            <span className="leading-snug pt-0.5">{opt}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                                      <span className="flex items-center gap-1.5">
                                        <PenTool className="w-3.5 h-3.5 text-amber-500" />
                                        Type your complete step-by-step answer:
                                      </span>
                                      <span>{currentStudentAns.length} characters</span>
                                    </div>
                                    <textarea
                                      value={currentStudentAns}
                                      onChange={(e) => handleTextAnswerChange(qKey, e.target.value)}
                                      placeholder="Write your definitions, mathematical derivations, calculations, and final answer here..."
                                      rows={4}
                                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-y shadow-2xs"
                                    />

                                    {/* Math Quick Toolbar & Diagram Canvas Scratchpad */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                        <span className="text-stone-400 font-bold mr-1">Quick Symbols:</span>
                                        {['√', 'π', 'θ', 'Δ', '∫', 'Σ', '²', '±', '≠', '≈', '÷', '×'].map((sym) => (
                                          <button
                                            key={sym}
                                            type="button"
                                            onClick={() => handleTextAnswerChange(qKey, (currentStudentAns || '') + sym)}
                                            className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-bold border border-stone-200 cursor-pointer text-xs"
                                          >
                                            {sym}
                                          </button>
                                        ))}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => setActiveCanvasKey(qKey)}
                                        className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-700 text-amber-300 font-bold text-xs border border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Draw Diagram / Sketch 🎨</span>
                                      </button>
                                    </div>

                                    {/* Display Attached Drawing Preview if present */}
                                    {drawnDiagrams[qKey] && (
                                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 shadow-2xs">
                                        <div className="flex items-center gap-3">
                                          <img
                                            src={drawnDiagrams[qKey]}
                                            alt="Attached Diagram"
                                            className="w-24 h-24 object-contain rounded-xl border border-amber-300 bg-white shadow-xs"
                                          />
                                          <div>
                                            <span className="text-xs font-bold text-stone-950 block">
                                              🎨 Attached Hand-Drawn Diagram / Sketch
                                            </span>
                                            <span className="text-[11px] text-stone-600">
                                              Your figure will be evaluated with your step-by-step text answer.
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setActiveCanvasKey(qKey)}
                                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-900 text-xs font-bold border border-amber-300 cursor-pointer transition-all"
                                          >
                                            Redraw ✏️
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setDrawnDiagrams((prev) => {
                                                const copy = { ...prev };
                                                delete copy[qKey];
                                                return copy;
                                              });
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold border border-stone-300 cursor-pointer transition-all"
                                          >
                                            Remove 🗑️
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* RESULT MODE: Student Answer vs Model Solution & Feedback  */}
                        {/* ========================================================= */}
                        {activeMode === 'RESULT' && evalItem && (
                          <div className="pt-2 space-y-3.5">
                            {/* Student Answer Box */}
                            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-stone-500 block">
                                Your Submitted Answer:
                              </span>
                              <div className="text-xs sm:text-sm font-semibold text-stone-800">
                                {evalItem.studentAnswer ? (
                                  evalItem.studentAnswer.includes('[🎨 Diagram Drawing:') ? (
                                    <div className="space-y-2">
                                      <p>{evalItem.studentAnswer.split('[🎨 Diagram Drawing:')[0].trim() || <em className="text-stone-400 font-normal">No text typed</em>}</p>
                                      <div className="p-3 bg-white rounded-2xl border border-stone-200 inline-block">
                                        <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">
                                          🎨 Submitted Student Sketch / Diagram:
                                        </span>
                                        <img
                                          src={evalItem.studentAnswer.split('[🎨 Diagram Drawing: ')[1]?.split(']')[0]}
                                          alt="Submitted Diagram"
                                          className="max-h-52 rounded-xl border border-purple-200"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <p>{evalItem.studentAnswer}</p>
                                  )
                                ) : (
                                  <em className="text-stone-400 font-normal">Not Attempted / Left Blank</em>
                                )}
                              </div>
                            </div>

                            {/* AI Examiner Feedback */}
                            {evalItem.feedback && (
                              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-700 text-xs text-stone-100 space-y-1">
                                <span className="font-bold flex items-center gap-1.5 text-amber-300 text-xs">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  Examiner Assessment & Feedback:
                                </span>
                                <p className="text-stone-300 leading-relaxed text-xs">{evalItem.feedback}</p>
                              </div>
                            )}

                            {/* Model Answer Toggle Accordion */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleSolution(qKey)}
                                className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-amber-100/70 text-stone-800 text-xs font-bold flex items-center justify-between transition-colors border border-stone-200 cursor-pointer"
                              >
                                <span className="flex items-center gap-2 text-stone-900 font-bold">
                                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                  View Official Model Answer & Marking Scheme
                                </span>
                                {isSolutionOpen ? (
                                  <ChevronUp className="w-4 h-4 text-stone-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-stone-500" />
                                )}
                              </button>

                              {isSolutionOpen && (
                                <div className="mt-2.5 p-5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200 space-y-3 text-xs animate-in fade-in duration-150">
                                  <div>
                                    <span className="text-[10px] font-black uppercase text-stone-900 block">
                                      Correct Model Answer:
                                    </span>
                                    <p className="font-bold text-stone-950 text-xs sm:text-sm mt-0.5">
                                      {evalItem.correctAnswer}
                                    </p>
                                  </div>
                                  {evalItem.explanation && (
                                    <div className="pt-2.5 border-t border-amber-100">
                                      <span className="text-[10px] font-black uppercase text-stone-500 block">
                                        Step-by-Step Marking Rubric & Explanation:
                                      </span>
                                      <p className="text-stone-700 mt-1 leading-relaxed text-xs">
                                        {evalItem.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        {isViewOnly && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 text-center text-xs text-amber-900 font-bold flex items-center justify-center gap-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You are viewing this 2027 Specimen Model Question Paper in Parent Read-Only Mode. Answering and test submission are reserved for students taking the timed exam.</span>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* Sticky Bottom Submit Bar in Student TEST Mode             */}
      {/* ========================================================= */}
      {activeMode === 'TEST' && !isViewOnly && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 sm:p-4 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Compact answered info — left side */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="font-black text-stone-900 text-sm">{answeredCount}/{totalQuestions}</span>
              <span className="hidden sm:inline">Questions Answered</span>
              {totalQuestions - answeredCount > 0 && (
                <span className="hidden sm:inline text-amber-600 font-semibold">
                  · {totalQuestions - answeredCount} remaining
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Grading & Evaluating Paper...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-stone-950" />
                    <span>Submit Exam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time's Up Auto-Submit Modal */}
      {isTimeUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <Clock className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-stone-900">
              ⏰ Time's Up! (সময় সম্পূর্ণ শেষ)
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              আপনার পরীক্ষার নির্ধারিত সময় শেষ হয়ে গেছে। আপনার লিখিত উত্তরগুলি স্বয়ংক্ৰিয়ভাবে ইভালুয়েশনের জন্য জমা নেওয়া হচ্ছে...
            </p>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-2 text-xs text-amber-900 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Submitting your paper &amp; generating AI grade sheet...</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {showSubmitConfirm && (() => {
        const unansweredCount = totalQuestions - answeredCount;
        const hasOver15Mins = remainingSeconds > 15 * 60;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <Send className="w-7 h-7" />
              </div>

              <h3 className="text-base font-black text-stone-900">
                Submit Your Model Examination?
              </h3>

              {unansweredCount > 0 && hasOver15Mins ? (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Plenty of Time Remaining!</span>
                  </div>
                  <p className="text-xs text-stone-800 font-semibold leading-relaxed">
                    You still have plenty of time left! You have <strong className="text-amber-700 font-black text-sm">{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong>. Would you like to review and give them a last try (Go Back), or submit your paper now?
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 text-left space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Great Job Completing Your Exam!</span>
                  </div>
                  <p className="text-xs text-stone-800 font-semibold leading-relaxed">
                    Great work! Ready to evaluate your result? Click below to complete your submission and generate your detailed performance scorecard &amp; AI analysis.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-900 font-bold border-t border-emerald-200/70">
                    <span>Attempted: {answeredCount}/{totalQuestions} Questions</span>
                    <span>Time Left: {formatTimer(remainingSeconds)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {unansweredCount > 0 && hasOver15Mins ? (
                  <>
                    <button
                      type="button"
                      onClick={handleGoBackToFirstUnanswered}
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4 text-stone-950" />
                      <span>Go Back (Last Try)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>Finish & Submit</span>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSubmitConfirm(false)}
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Continue Exam
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                      ) : (
                        <span>Evaluate Result &amp; Grade</span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Interactive Drawing Canvas Modal */}
      {activeCanvasKey && (
        <DiagramCanvasModal
          isOpen={!!activeCanvasKey}
          qKey={activeCanvasKey}
          onClose={() => setActiveCanvasKey(null)}
          onSave={(dataUrl) => {
            setDrawnDiagrams((prev) => ({
              ...prev,
              [activeCanvasKey]: dataUrl,
            }));
          }}
        />
      )}
    </div>
  );
};

interface DiagramCanvasModalProps {
  isOpen: boolean;
  qKey: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

const DiagramCanvasModal: React.FC<DiagramCanvasModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#000000');
  const [lineWidth, setLineWidth] = React.useState(3);
  const [isEraser, setIsEraser] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">🎨</span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-stone-900">Interactive Canvas — Draw Diagram / Sketch</h3>
              <p className="text-[11px] text-stone-500">Draw geometry, ray diagrams, circuits, graphs, or calculations</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-900 font-bold">✕</button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stone-600 mr-1 text-[11px]">Color:</span>
            {['#000000', '#2563eb', '#dc2626', '#059669', '#d97706', '#9333ea'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setColor(c); setIsEraser(false); }}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                  !isEraser && color === c ? 'border-amber-400 scale-110 shadow-xs' : 'border-white'
                }`}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-stone-600 text-[11px] mr-1">Stroke:</span>
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer ${
                  lineWidth === w ? 'bg-amber-400 text-stone-950 font-black' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {w === 2 ? 'Thin' : w === 4 ? 'Medium' : 'Thick'}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEraser(!isEraser)}
              className={`px-3 py-1 rounded-xl font-bold text-xs cursor-pointer border ${
                isEraser ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-stone-700 border-stone-200'
              }`}
            >
              🧹 Eraser
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="px-3 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs cursor-pointer"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Canvas Element */}
        <div className="border-2 border-dashed border-purple-200 rounded-2xl overflow-hidden bg-white shadow-inner flex justify-center touch-none">
          <canvas
            ref={canvasRef}
            width={600}
            height={320}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-w-full bg-white cursor-crosshair"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Attach Drawn Diagram to Answer 🎨</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function chr(code: number): string {
  return String.fromCharCode(code);
}
