import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Zap,
  Trophy,
  ShieldCheck,
  Check,
  X,
  Lock,
  AlertCircle,
  Loader2,
  ChevronDown,
  Printer,
} from 'lucide-react';
import ApiServices from '../services/ApiServices';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';

interface QuestionItem {
  id: number;
  questionNumber: number;
  questionText: string;
  options: string[];
  imageUrl?: string | null;
  marks: number;
  difficulty: string;
  topic: string;
}

interface QuestionReview {
  questionId: number;
  questionText: string;
  options?: string[];
  userAnswer: string;
  userAnswerLetter?: string | null;
  correctAnswer: string;
  correctAnswerLetter?: string | null;
  isCorrect: boolean;
  explanation: string;
}

const GUEST_TEST_COUNT_KEY = 'edujunction_quick_test_count';
const MAX_FREE_TESTS = 2;

export const QuickTestPage: React.FC = () => {
  const navigate = useNavigate();

  // Quota & Gatekeeper State
  const [completedTestsCount, setCompletedTestsCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(GUEST_TEST_COUNT_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  // Master Data Dynamic State (from DB /api/v1/master/board_class_dropdown and /api/v1/master/curriculum-options)
  const [dbBoards, setDbBoards] = useState<string[]>(['CBSE', 'ICSE', 'ISC']);
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>({});
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState<boolean>(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);

  // Selector Form State (Empty by default with Select Board/Class/Subject placeholders)
  const [board, setBoard] = useState<string>('');
  const [classGrade, setClassGrade] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'Physics' | 'Chemistry' | 'Biology'>('all');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reset selected branch if subject/class/board changes
  useEffect(() => {
    setSelectedBranch('all');
  }, [board, classGrade, subject]);

  // Result filter state (All / Correct / Incorrect)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Active Exam State
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(300); // 5 mins
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Result & Review State
  const [isExamCompleted, setIsExamCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalMarks, setTotalMarks] = useState<number>(5);
  const [percentage, setPercentage] = useState<number>(0);
  const [reviews, setReviews] = useState<QuestionReview[]>([]);

  const timerRef = useRef<any>(null);

  // 1. Fetch active Boards & Classes dynamically from database on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMasters(true);

    ApiServices.getBoardClassDropdown()
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedBoards = res?.boards || res?.data?.boards || [];
        const boardNames: string[] = fetchedBoards.map((b: any) => (typeof b === 'string' ? b : b.name)).filter(Boolean);
        const map = res?.boardClassesMap || res?.data?.boardClassesMap || {};

        if (boardNames.length > 0) {
          setDbBoards(boardNames);
        }
        if (map && Object.keys(map).length > 0) {
          setBoardClassesMap(map);
        }
      })
      .catch((err) => {
        console.warn('Failed to load master board/class dropdown from DB:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMasters(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available classes dynamically based on the selected board
  const availableClasses: string[] = React.useMemo(() => {
    if (board && boardClassesMap[board] && boardClassesMap[board].length > 0) {
      return boardClassesMap[board];
    }
    if (board === 'ISC') return ['Class 11', 'Class 12'];
    if (board === 'ICSE') return ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    if (board === 'CBSE') return ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    return [];
  }, [board, boardClassesMap]);

  // Ensure selected class is reset if board changes or becomes invalid
  useEffect(() => {
    if (!board) {
      setClassGrade('');
      setSubject('');
      return;
    }
    if (classGrade && availableClasses.length > 0 && !availableClasses.includes(classGrade)) {
      setClassGrade('');
      setSubject('');
    }
  }, [board, availableClasses, classGrade]);

  // 2. Fetch subjects dynamically from Database based on selected board & class
  useEffect(() => {
    let isMounted = true;
    if (!board || !classGrade) {
      setDbSubjects([]);
      return;
    }

    setIsLoadingSubjects(true);
    ApiServices.getCurriculumOptions({
      board,
      classGrade,
    })
      .then((res: any) => {
        if (!isMounted) return;
        const fetched: any[] = res?.subjects || res?.data?.subjects || [];
        const subjectNames: string[] = fetched
          .map((s: any) => (typeof s === 'string' ? s : s.name || s.subject_name))
          .filter(Boolean);

        if (subjectNames.length > 0) {
          setDbSubjects(subjectNames);
        } else {
          setDbSubjects([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load database subjects for quick test:', err);
        if (isMounted) {
          setDbSubjects([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [board, classGrade]);

  // Available subjects directly from DB
  const availableSubjects: string[] = React.useMemo(() => {
    if (!board || !classGrade) return [];
    return dbSubjects;
  }, [board, classGrade, dbSubjects]);

  // Ensure selected subject is reset if class changes or becomes invalid
  useEffect(() => {
    if (!classGrade) {
      setSubject('');
      return;
    }
    if (subject && availableSubjects.length > 0 && !availableSubjects.includes(subject)) {
      setSubject('');
    }
  }, [availableSubjects, subject, classGrade]);

  // Keyboard shortcut listener during active test
  useEffect(() => {
    if (!examStarted || isExamCompleted || !questions[currentIdx]) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 1, 2, 3, 4 or A, B, C, D to pick option
      const key = e.key.toUpperCase();
      let optionLetter = '';
      if (key === '1' || key === 'A') optionLetter = 'A';
      else if (key === '2' || key === 'B') optionLetter = 'B';
      else if (key === '3' || key === 'C') optionLetter = 'C';
      else if (key === '4' || key === 'D') optionLetter = 'D';

      if (optionLetter && questions[currentIdx].options[optionLetter.charCodeAt(0) - 65]) {
        handleSelectOption(questions[currentIdx].id, optionLetter);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentIdx < questions.length - 1) {
          setCurrentIdx((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIdx > 0) {
          setCurrentIdx((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [examStarted, isExamCompleted, currentIdx, questions]);

  // Timer countdown
  useEffect(() => {
    if (examStarted && !isExamCompleted && timeRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, isExamCompleted, answers]);

  // Start Quick Demo Test
  const handleStartExam = async () => {
    if (!board || !classGrade || !subject) {
      setFetchError('Please select Board, Class, and Subject to start your test.');
      return;
    }

    if (completedTestsCount >= MAX_FREE_TESTS) {
      setShowPaywallModal(true);
      return;
    }

    try {
      setIsLoadingQuestions(true);
      setFetchError(null);

      const res: any = await ApiServices.getQuickDemoQuestions(board, classGrade, subject, selectedBranch);
      const data = res?.data || res;
      const qList: QuestionItem[] = data?.questions || [];

      if (!qList || qList.length === 0) {
        const branchMsg = selectedBranch !== 'all' ? ` (${selectedBranch})` : '';
        setFetchError(`No MCQs found for ${board} ${classGrade} ${subject}${branchMsg}. Please choose another subject or domain.`);
        return;
      }

      setQuestions(qList);
      setExamTitle(data?.title || `Quick Demo Test — ${classGrade} ${board} ${subject}${selectedBranch !== 'all' ? ` (${selectedBranch})` : ''}`);
      setCurrentIdx(0);
      setAnswers({});
      setTimeRemainingSeconds((data?.timeLimitMinutes || 5) * 60);
      setIsExamCompleted(false);
      setReviews([]);
      setExamStarted(true);
    } catch (err: any) {
      console.error('Failed to load demo questions:', err);
      setFetchError(err?.response?.data?.message || err?.message || 'Failed to load demo questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Submit Test & Evaluate instantaneously via Python
  const handleSubmitTest = async () => {
    if (isSubmitting || isExamCompleted) return;

    try {
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      // Convert answers map
      const payloadAnswers: Record<string, string> = {};
      Object.keys(answers).forEach((k) => {
        payloadAnswers[k] = answers[Number(k)];
      });

      const res: any = await ApiServices.evaluateQuickDemo(payloadAnswers);
      const data = res?.data || res;

      setScore(data?.score ?? 0);
      setTotalMarks(data?.totalMarks ?? questions.length);
      setPercentage(data?.percentage ?? 0);
      setReviews(data?.review || []);
      setIsExamCompleted(true);
      setExamStarted(false);

      // Increment test quota
      const newCount = completedTestsCount + 1;
      setCompletedTestsCount(newCount);
      localStorage.setItem(GUEST_TEST_COUNT_KEY, newCount.toString());
      if (newCount >= MAX_FREE_TESTS) {
        setShowPaywallModal(true);
      }
    } catch (err: any) {
      console.error('Failed to evaluate demo test:', err);
      alert('Failed to evaluate test. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle option click
  const handleSelectOption = (questionId: number, optionLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quick-test-page min-h-screen bg-[#FFFDF8] font-sans text-stone-900 flex flex-col selection:bg-amber-200">
      <PublicHeader />

      <div className="border-b border-amber-200/70 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-amber-900 text-xs font-extrabold">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Instant Quick Test Demo
          </span>
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-black border ${completedTestsCount >= MAX_FREE_TESTS
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : completedTestsCount === 1
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
          >
            {completedTestsCount >= MAX_FREE_TESTS
              ? '🏆 2 of 2 Free Tests Used'
              : `⚡ Free Demo: ${MAX_FREE_TESTS - completedTestsCount} of ${MAX_FREE_TESTS} Remaining`}
          </span>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Return to Home"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">

        {/* ============================================================== */}
        {/* VIEW 1: SETUP SCREEN (When not started & tests available)      */}
        {/* ============================================================== */}
        {!examStarted && !isExamCompleted && completedTestsCount < MAX_FREE_TESTS && (
          <div className="bg-gradient-to-b from-white via-white to-amber-50/20 rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/30 p-6 sm:p-9 lg:p-11 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-200/30 via-yellow-100/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/20 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

            {/* Header */}
            <div className="text-center max-w-5xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-950 text-xs font-black mb-3 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Zero Login Required • Instant Evaluation</span>
              </div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-normal [word-spacing:0.25em] leading-tight"
                style={{ wordSpacing: '0.25em' }}
              >
                TAKE A <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent">FREE QUICK TEST</span>
              </h1>
              <p className="mt-2.5 text-stone-800 text-xs sm:text-sm lg:text-[15px] font-semibold leading-relaxed sm:whitespace-nowrap">
                Experience EduJunction's syllabus-accurate question bank and instant evaluation with detailed solutions in just 5 minutes.
              </p>
            </div>

            {/* Guided 3-Step Database Dropdowns */}
            <div className="mt-8 grid sm:grid-cols-3 gap-4 sm:gap-5 relative z-10">

              {/* 1. BOARD */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-600 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Target Board</span>
                  </span>
                  {board && <span className="text-[10px] text-emerald-600 font-bold lowercase flex items-center gap-0.5"><Check className="w-3 h-3" /> selected</span>}
                </label>
                <div className="relative group">
                  <select
                    value={board}
                    onChange={(e) => {
                      setBoard(e.target.value);
                      setClassGrade('');
                      setSubject('');
                      setFetchError(null);
                    }}
                    className={`w-full px-4 py-3.5 pr-10 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 hover:border-amber-400 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition-all cursor-pointer appearance-none shadow-xs ${!board ? 'text-stone-700 font-bold' : 'text-stone-950 font-black'
                      }`}
                  >
                    <option value="" className="text-stone-700 font-bold">Select Your Board</option>
                    {dbBoards.map((b) => (
                      <option key={b} value={b} className="text-stone-900 font-bold">
                        {b} Board
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600 group-hover:text-stone-800 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 2. CLASS */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-600 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${board ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-500'}`}>2</span>
                    <span>Class / Grade</span>
                  </span>
                  {classGrade && <span className="text-[10px] text-emerald-600 font-bold lowercase flex items-center gap-0.5"><Check className="w-3 h-3" /> selected</span>}
                </label>
                <div className="relative group">
                  <select
                    value={classGrade}
                    onChange={(e) => {
                      setClassGrade(e.target.value);
                      setSubject('');
                      setFetchError(null);
                    }}
                    disabled={!board}
                    className={`w-full px-4 py-3.5 pr-10 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 hover:border-amber-400 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition-all cursor-pointer appearance-none disabled:bg-stone-100/90 disabled:border-stone-200 disabled:text-stone-500 disabled:cursor-not-allowed shadow-xs ${!classGrade ? 'text-stone-700 font-bold' : 'text-stone-950 font-black'
                      }`}
                  >
                    <option value="" className="text-stone-700 font-bold">
                      {board ? 'Select Your Class' : 'Select Board First'}
                    </option>
                    {availableClasses.map((c) => (
                      <option key={c} value={c} className="text-stone-900 font-bold">
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600 group-hover:text-stone-800 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 3. SUBJECT */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-600 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${classGrade ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-500'}`}>3</span>
                    <span>Subject</span>
                  </span>
                  {subject && <span className="text-[10px] text-emerald-600 font-bold lowercase flex items-center gap-0.5"><Check className="w-3 h-3" /> selected</span>}
                </label>
                <div className="relative group">
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setFetchError(null);
                    }}
                    disabled={!classGrade || isLoadingSubjects}
                    className={`w-full px-4 py-3.5 pr-10 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 hover:border-amber-400 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition-all cursor-pointer appearance-none disabled:bg-stone-100/90 disabled:border-stone-200 disabled:text-stone-500 disabled:cursor-not-allowed shadow-xs ${!subject ? 'text-stone-700 font-bold' : 'text-stone-950 font-black'
                      }`}
                  >
                    <option value="" className="text-stone-700 font-bold">
                      {isLoadingSubjects ? 'Loading subjects...' : classGrade ? 'Select Your Subject' : 'Select Class First'}
                    </option>
                    {availableSubjects.map((s) => (
                      <option key={s} value={s} className="text-stone-900 font-bold">
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600 group-hover:text-stone-800 transition-colors">
                    {isLoadingSubjects ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Science Domain / Sub-Branch Selector (CBSE & General Science) */}
            {String(subject || '').toLowerCase().trim() === 'science' && (
              <div className="mt-4 p-3.5 sm:p-4 bg-gradient-to-r from-amber-50/90 via-yellow-50/70 to-orange-50/50 rounded-2xl border border-yellow-200/90 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Science Domain Focus
                  </span>
                  <span className="text-[10px] text-amber-900 font-bold bg-white px-2.5 py-0.5 rounded-full border border-yellow-300 shadow-2xs">
                    {selectedBranch === 'all' ? 'Full Mixed Syllabus' : `${selectedBranch} Target Practice`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'all', label: 'All Science', icon: '🌐', desc: 'Mixed Blueprint' },
                    { id: 'Physics', label: 'Physics', icon: '⚡', desc: 'Light, Electricity...' },
                    { id: 'Chemistry', label: 'Chemistry', icon: '🧪', desc: 'Reactions, Acids...' },
                    { id: 'Biology', label: 'Biology', icon: '🧬', desc: 'Life, Heredity...' },
                  ].map((b) => {
                    const isSelected = selectedBranch === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        id={`quick-branch-btn-${b.id}`}
                        onClick={() => setSelectedBranch(b.id as any)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                          ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs ring-2 ring-amber-300 ring-offset-1 font-bold scale-[1.02]'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-yellow-300'
                          }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className="text-sm">{b.icon}</span>
                          <span>{b.label}</span>
                        </div>
                        <div className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-amber-950 font-medium' : 'text-stone-400'}`}>
                          {b.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {fetchError && (
              <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fetchError}</span>
              </div>
            )}

            {/* Features Strip (Pill Badges) */}
            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-stone-700 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>5 High-Yield MCQs</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>5-Minute Timer</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-900 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>100% Free • No Sign Up</span>
              </div>
            </div>

            {/* Start CTA Button */}
            <div className="mt-8 text-center relative z-10">
              <button
                type="button"
                disabled={!board || !classGrade || !subject || isLoadingQuestions || completedTestsCount >= MAX_FREE_TESTS}
                onClick={handleStartExam}
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-black text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
              >
                {isLoadingQuestions ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Start Quick Test</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {(!board || !classGrade || !subject) && (
                <p className="mt-3 text-xs font-semibold text-stone-500">
                  👉 Choose your Target Board, Class, and Subject above to begin
                </p>
              )}
              {board && classGrade && subject && (
                <p className="mt-3 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> All parameters selected! Click to launch your practice test
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1B: DEDICATED MILESTONE & UNLOCK CONVERSION SCREEN        */}
        {/* (When completedTestsCount >= MAX_FREE_TESTS & not in active exam)*/}
        {/* ============================================================== */}
        {!examStarted && !isExamCompleted && completedTestsCount >= MAX_FREE_TESTS && (
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/60 rounded-3xl border border-amber-200/90 shadow-2xl shadow-amber-500/10 p-6 sm:p-10 lg:p-12 relative overflow-hidden text-center animate-in fade-in duration-300">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/40 via-yellow-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Floating Hero Trophy */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center shadow-2xl shadow-amber-400/40 ring-8 ring-amber-100/80 transform hover:scale-105 transition-transform duration-300">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-stone-950" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs sm:text-sm font-black shadow-md border-2 border-white">
                  ✓
                </div>
              </div>

              {/* Pill Milestone */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-xs font-black mb-3.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>2 of 2 Free Demo Tests Completed</span>
              </div>

              {/* Main Headline */}
              <h2
                className="text-2xl sm:text-4xl font-black text-stone-900 tracking-normal [word-spacing:0.25em] leading-tight max-w-2xl"
                style={{ wordSpacing: '0.25em' }}
              >
                Well Done! Your Next Learning Step Is{' '}
                <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Just Ahead
                </span>
              </h2>

              <p className="mt-3 text-stone-700 text-xs sm:text-sm lg:text-base font-medium max-w-2xl leading-relaxed">
              Your two free demo tests are complete. Create a free account to save your progress and continue with personalized practice, instant feedback, and your Study Buddy.
              </p>
            </div>

            {/* 4 Feature Unlocks (2x2 Grid) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-4xl mx-auto text-left relative z-10">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900">Unlimited Mock Tests</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Chapter-wise, term-end, and full-syllabus tests calibrated for CBSE, ICSE & ISC from Class 5 to 12.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900">50,000+ Question Bank</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      10-year past solved board papers with official marking rubrics and step-by-step model solutions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900"> Instant Step-by-Step Evaluation</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Instant doubt solving, misconception diagnostics, and tailored textbook concept explanations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900">Continuous Progress Tracking</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Weak-area diagnosis, percentile benchmarks, and synchronized parent-student insight reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversion CTA Group */}
            <div className="mt-8 pt-6 border-t border-amber-200/70 relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => navigate('/?auth=register')}
                className="group inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-black text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer w-full sm:w-auto"
              >
                <span>Create Free Account Now</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Free Forever Tier • Instant Access in 30 Seconds • No Credit Card</span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-stone-200/60 text-xs text-stone-600 flex items-center gap-1.5">
                <span>Already registered with us?</span>
                <button
                  type="button"
                  onClick={() => navigate('/?auth=login')}
                  className="font-black text-amber-700 hover:text-amber-800 underline cursor-pointer"
                >
                  Log In to Your Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: ACTIVE 5-MCQ EXAM ARENA                                */}
        {/* ============================================================== */}
        {examStarted && !isExamCompleted && currentQ && (
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/30 overflow-hidden flex flex-col">
            {/* Top Bar: Timer, Question Counter & Topic */}
            <div className="px-5 py-4 bg-stone-50/90 border-b border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-stone-900 text-white font-black text-xs flex items-center justify-center">
                  {currentIdx + 1}
                </span>
                <div>
                  <div className="text-xs font-bold text-stone-800">
                    Question {currentIdx + 1} of {questions.length}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    {currentQ.topic}
                  </div>
                </div>
              </div>

              {/* 5-Min Timer */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-mono border ${timeRemainingSeconds < 60
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : 'bg-white border-stone-200 text-stone-700 shadow-2xs'
                    }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${timeRemainingSeconds < 60 ? 'text-rose-600' : 'text-amber-600'}`} />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 h-1.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1.5 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question Text */}
              <div className="space-y-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                  Multiple Choice • 1 Mark
                </span>
                <p className="text-stone-900 text-base sm:text-lg font-bold leading-relaxed whitespace-pre-line">
                  {currentQ.questionText}
                </p>

                {/* Optional Image / Diagram */}
                {currentQ.imageUrl && (
                  <div className="my-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center">
                    <img
                      src={currentQ.imageUrl.startsWith('http') ? currentQ.imageUrl : (import.meta.env.VITE_API_BASE_URL || '') + currentQ.imageUrl}
                      alt="Question Diagram"
                      className="max-h-60 w-auto object-contain rounded-xl bg-white p-2 border border-stone-200"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 font-semibold">🖼️ Refer to diagram above</span>
                  </div>
                )}
              </div>

              {/* 4 Interactive MCQ Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const cleanText = opt.replace(/^(?:option\s+)?\(?[A-Da-d]\)?[\).\:\-]?\s*/i, '').trim();
                  const isSelected = answers[currentQ.id] === letter;

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, letter)}
                      className={`w-full text-left p-4 rounded-2xl border-2 flex items-start gap-3.5 transition-all duration-200 cursor-pointer ${isSelected
                        ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/30'
                        : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-stone-50/60'
                        }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5 transition-colors ${isSelected
                          ? 'bg-amber-400 text-stone-950 border-2 border-amber-500 shadow-xs'
                          : 'border-2 border-stone-300 text-stone-500 bg-white'
                          }`}
                      >
                        {letter}
                      </div>
                      <span className={`text-sm sm:text-base font-semibold leading-relaxed ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-700'}`}>
                        {cleanText || opt}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-amber-600 ml-auto shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Question Pips Palette */}
              <div className="hidden sm:flex items-center gap-1.5">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${currentIdx === idx
                      ? 'bg-stone-900 text-white ring-2 ring-amber-400'
                      : answers[q.id]
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'bg-stone-200/80 text-stone-600 hover:bg-stone-300'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Next or Submit */}
              {isLastQuestion ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitTest}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Grading Answers...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Test ({answeredCount}/5)</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: INSTANT RESULT & EXPLANATION SCORECARD                */}
        {/* ============================================================== */}
        {isExamCompleted && (
          <div className="space-y-6 print-results">
            {/* Top Score Banner */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/40 p-6 sm:p-8 text-center relative overflow-hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                aria-label="Print demo test results"
                title="Print results"
              >
                <Printer className="h-4 w-4" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-stone-950 mx-auto shadow-lg shadow-amber-400/30 mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
                {percentage >= 80 ? '🎉 Outstanding Performance!' : percentage >= 60 ? '👍 Great Effort!' : 'Keep Practicing!'}
              </h2>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-4xl font-black text-amber-600">{score}</span>
                <span className="text-2xl font-bold text-stone-400">/ {totalMarks} Marks</span>
                <span className="ml-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                  {percentage}%
                </span>
              </div>
              <p className="mt-2 text-stone-600 text-xs sm:text-sm font-medium">
                Instant evaluation complete! Review your question-by-question breakdown with textbook solutions below.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {completedTestsCount < MAX_FREE_TESTS ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsExamCompleted(false);
                      setExamStarted(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Take 2nd Free Test (1 Left)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPaywallModal(true)}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Unlock Full Question Bank</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/?auth=register')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all"
                >
                  <span>Register Free to Save Progress</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Detailed Question Review List with Interactive Filter Tabs */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>Question Breakdown & Explanations</span>
                </h3>

                {/* Interactive Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${reviewFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    All ({reviews.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('correct')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${reviewFilter === 'correct'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                  >
                    ✓ Correct ({reviews.filter((r) => r.isCorrect).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('incorrect')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${reviewFilter === 'incorrect'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-rose-700 hover:text-rose-900'
                      }`}
                  >
                    ✗ Incorrect ({reviews.filter((r) => !r.isCorrect).length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {reviews
                  .filter((item) => {
                    if (reviewFilter === 'correct') return item.isCorrect;
                    if (reviewFilter === 'incorrect') return !item.isCorrect;
                    return true;
                  })
                  .map((item, idx) => (
                    <div
                      key={item.questionId}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${item.isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black text-stone-700">Question {idx + 1}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {item.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct (+1 Mark)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect (0 Marks)
                            </>
                          )}
                        </span>
                      </div>

                      {/* Question */}
                      <p className="text-sm sm:text-base font-bold text-stone-900 mb-3">
                        {item.questionText}
                      </p>

                      {/* All 4 Options Breakdown */}
                      {(() => {
                        const optList = item.options && item.options.length > 0
                          ? item.options
                          : (questions.find((q) => q.id === item.questionId)?.options || []);

                        if (!optList || optList.length === 0) return null;

                        return (
                          <div className="space-y-2 mb-3.5">
                            {optList.map((opt, oIdx) => {
                              const letter = String.fromCharCode(65 + oIdx);
                              const cleanOptText = opt.replace(/^(?:option\s+)?\(?[A-Da-d]\)?[\).\:\-]?\s*/i, '').trim();

                              const isCorrectOpt = item.correctAnswerLetter
                                ? item.correctAnswerLetter.toUpperCase() === letter
                                : item.correctAnswer.toLowerCase().includes(cleanOptText.toLowerCase());

                              const isUserChoice = item.userAnswerLetter
                                ? item.userAnswerLetter.toUpperCase() === letter
                                : item.userAnswer.toLowerCase().includes(cleanOptText.toLowerCase());

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${isCorrectOpt
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-400/40'
                                    : isUserChoice
                                      ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold ring-1 ring-rose-400/40'
                                      : 'bg-white border-stone-200 text-stone-700'
                                    }`}
                                >
                                  <div className="flex items-center gap-2 sm:gap-2.5">
                                    <span
                                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${isCorrectOpt
                                        ? 'bg-emerald-600 text-white'
                                        : isUserChoice
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                                        }`}
                                    >
                                      {letter}
                                    </span>
                                    <span className="leading-snug">{cleanOptText}</span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-black">
                                    {isCorrectOpt && isUserChoice && (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                        <span>Correct & Your Choice</span>
                                      </span>
                                    )}
                                    {isCorrectOpt && !isUserChoice && (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                        <span>Correct Answer</span>
                                      </span>
                                    )}
                                    {!isCorrectOpt && isUserChoice && (
                                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                        <XCircle className="w-3 h-3 text-rose-700" />
                                        <span>Your Choice</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* Answers Comparison */}
                      <div className="grid sm:grid-cols-2 gap-2 text-xs font-semibold mb-3">
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Your Choice:</span>
                          <span className={item.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {item.userAnswer}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Correct Answer:</span>
                          <span className="text-emerald-700 font-bold">{item.correctAnswer}</span>
                        </div>
                      </div>

                      {/* Explanation */}
                      {item.explanation && (
                        <div className="p-3 rounded-xl bg-white/80 border border-stone-200 text-xs font-medium text-stone-700 leading-relaxed">
                          <span className="font-black text-amber-800 block mb-0.5">💡 Concept Explanation:</span>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* VIEW 4: CONVERSION PAYWALL MODAL (When Quota Reached)          */}
      {/* ============================================================== */}
      {showPaywallModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowPaywallModal(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 overflow-hidden text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-stone-950 mx-auto shadow-lg shadow-amber-400/30 mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-stone-900 tracking-tight">
              Well done! Ready to keep learning? 🎉
            </h3>
            <p className="mt-2 text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
              Create a free account to save your progress and unlock personalized practice, instant AI feedback, and your Study Buddy. Get started in under a minute.
            </p>

            {/* Value Props */}
            <div className="mt-5 text-left p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs font-bold text-stone-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited chapter-wise and full-syllabus mock tests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>10-year past solved board papers with AI step rubrics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Continuous weakness diagnostics & performance charts</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPaywallModal(false);
                  navigate('/?auth=register');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/25 cursor-pointer transition-all"
              >
                Create Free Account (30s)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaywallModal(false);
                  navigate('/?auth=login');
                }}
                className="w-full py-3.5 px-6 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Log In
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPaywallModal(false)}
              className="mt-4 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              Maybe later, take me back
            </button>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};
