import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty,
  Exam,
  ChildAccount,
  ParentAccount,
  ExamSubmission
} from '../types';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Calculator,
  Layers,
  Award,
  Zap,
  CalendarClock,
  Loader2
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface ExamArenaProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  activePersona?: 'parent' | 'child';
  onChildSelect: (childId: string) => void;
  presetSubject?: Subject;
  presetDifficulty?: ExamDifficulty;
  presetTopic?: string;
  initialExam?: Exam | null;
  onClearInitialExam?: () => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const GRADES: ClassGrade[] = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
interface DbTopic {
  id: number;
  name: string;
}

interface DbChapter {
  id: number;
  name: string;
  topics: DbTopic[];
}

interface DbSubject {
  id: number;
  name: string;
  chapters: DbChapter[];
}

export const getExamBlueprint = (grade: string = 'Class 10') => {
  const g = (grade || '').toLowerCase().trim();
  if (['class 11', 'class 12', 'neet', 'iit'].some(c => g.includes(c))) {
    return {
      questionCount: 10,
      totalMarks: 20,
      durationMinutes: 25,
      breakdown: 'Structured HOTS & Competitive Multi-Mark Problems',
      badgeText: '10 Questions • 20 Marks • Competitive Drill',
      titleLabel: '20-Mark Competitive Exam',
      buttonText: 'Start 20-Mark Diagnostic Exam',
    };
  }
  if (['class 9', 'class 10'].some(c => g.includes(c))) {
    return {
      questionCount: 10,
      totalMarks: 15,
      durationMinutes: 20,
      breakdown: '5 Questions (1-Mark MCQ) + 5 Questions (2-Mark SAQ)',
      badgeText: '10 Questions • 15 Marks • Board Readiness',
      titleLabel: '15-Mark Board Readiness Exam',
      buttonText: 'Start 15-Mark Diagnostic Exam',
    };
  }
  // Class 5 to 8 (e.g. Class 8 = 15 Marks)
  return {
    questionCount: 10,
    totalMarks: 15,
    durationMinutes: 15,
    breakdown: '5 Questions (1-Mark MCQ) + 5 Questions (2-Mark SAQ)',
    badgeText: '10 Questions • 15 Marks • Adaptive Diagnostic',
    titleLabel: '15-Mark Diagnostic Exam',
    buttonText: 'Start 15-Mark Diagnostic Exam',
  };
};

export const ExamArena: React.FC<ExamArenaProps> = ({
  parentAccount,
  activeChildId,
  activePersona = 'parent',
  onChildSelect,
  onExamComplete,
  presetSubject,
  presetDifficulty,
  presetTopic,
  initialExam,
  onClearInitialExam,
}) => {
  const isStudentPersona = activePersona === 'child';
  // Current active child
  const activeChild = parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];

  // Config State
  const [selectedBoard, setSelectedBoard] = useState<Board>(activeChild?.targetBoard || 'CBSE');
  const [selectedGrade, setSelectedGrade] = useState<ClassGrade>(activeChild?.classGrade || 'Class 10');
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(presetSubject || 'Mathematics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficulty>(presetDifficulty || 'medium');
  const [activeTopic, setActiveTopic] = useState<string | null>(presetTopic || null);

  const hasAutoStartedRef = useRef<string | null>(null);

  // Synchronize board and class when activeChild changes
  useEffect(() => {
    if (activeChild) {
      if (activeChild.targetBoard) setSelectedBoard(activeChild.targetBoard);
      if (activeChild.classGrade) setSelectedGrade(activeChild.classGrade);
    }
  }, [activeChild?.id, activeChild?.targetBoard, activeChild?.classGrade]);

  // Dynamically fetch mapped subjects from Database (subject_master) based on board & class
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSubjects(true);

    const targetBoard = selectedBoard || activeChild?.targetBoard || 'CBSE';
    const targetGrade = selectedGrade || activeChild?.classGrade || 'Class 10';

    ApiServices.getCurriculumOptions({
      board: targetBoard,
      classGrade: targetGrade,
      studentId: activeChild?.id,
    })
      .then((res: any) => {
        if (!isMounted) return;
        const fetched: DbSubject[] = res?.subjects || res?.data?.subjects || [];
        const subjectNames = fetched.map((s) => s.name).filter(Boolean);
        setDbSubjects(subjectNames);

        if (subjectNames.length > 0) {
          setSelectedSubject((prev) => {
            if (prev && subjectNames.includes(prev)) {
              return prev;
            }
            if (presetSubject && subjectNames.includes(presetSubject)) {
              return presetSubject;
            }
            return subjectNames[0] as Subject;
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load database curriculum subjects:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBoard, selectedGrade, activeChild?.id]);

  useEffect(() => {
    if (presetSubject) {
      setSelectedSubject(presetSubject);
    }
  }, [presetSubject]);

  useEffect(() => {
    if (presetTopic) {
      setActiveTopic(presetTopic);
    }
  }, [presetTopic]);

  const [assignedExam, setAssignedExam] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiServices.getAssignedExams();
        if (res && res.assignedExams && res.assignedExams.length > 0) {
          const match = res.assignedExams[0];
          setAssignedExam(match);
        } else {
          setAssignedExam(null);
        }
      } catch (e) {
        setAssignedExam(null);
      }
    })();
  }, [activeChildId]);

  const blueprint = useMemo(() => {
    const g = (selectedGrade || '').toLowerCase().trim();
    if (['class 11', 'class 12', 'neet', 'iit'].some(c => g.includes(c))) {
      return {
        questionCount: 10,
        totalMarks: 20,
        durationMinutes: 25,
        breakdown: 'Structured HOTS & Competitive Multi-Mark Problems',
        badgeText: '10 Questions • 20 Marks • Competitive Drill',
        titleLabel: '20-Mark Competitive Exam',
        buttonText: 'Start 20-Mark Diagnostic Exam',
      };
    }
    if (['class 9', 'class 10'].some(c => g.includes(c))) {
      return {
        questionCount: 10,
        totalMarks: 15,
        durationMinutes: 20,
        breakdown: '5 Questions (1-Mark MCQ) + 5 Questions (2-Mark SAQ)',
        badgeText: '10 Questions • 15 Marks • Board Readiness',
        titleLabel: '15-Mark Board Readiness Exam',
        buttonText: 'Start 15-Mark Diagnostic Exam',
      };
    }
    // Class 5 to 8
    return {
      questionCount: 10,
      totalMarks: 15,
      durationMinutes: 15,
      breakdown: '5 Questions (1-Mark MCQ) + 5 Questions (2-Mark SAQ)',
      badgeText: '10 Questions • 15 Marks • Adaptive Diagnostic',
      titleLabel: '15-Mark Diagnostic Exam',
      buttonText: 'Start 15-Mark Diagnostic Exam',
    };
  }, [selectedGrade]);

  // Exam taking state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(initialExam || null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    initialExam?.timeLimitMinutes ? initialExam.timeLimitMinutes * 60 : 15 * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [generationStep, setGenerationStep] = useState('');

  // Adaptive Engine State
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'simple' | 'medium' | 'hard'>('simple');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState<number>(0);
  const [adaptiveNotification, setAdaptiveNotification] = useState<{ type: 'up' | 'down'; message: string } | null>(null);

  // Handle preloaded / quick test exam
  useEffect(() => {
    if (initialExam) {
      setActiveExam(initialExam);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setFlaggedQuestions({});
      setTimeSpentPerQuestion({});
      setAdaptiveDifficulty('simple');
      setConsecutiveCorrect(0);
      setConsecutiveWrong(0);
      setAdaptiveNotification(null);
      setTimeRemainingSeconds((initialExam.timeLimitMinutes || 15) * 60);
      if (onClearInitialExam) {
        onClearInitialExam();
      }
    }
  }, [initialExam]);

  // Sync defaults when active child changes
  useEffect(() => {
    if (activeChild) {
      setSelectedBoard(activeChild.targetBoard);
      setSelectedGrade(activeChild.classGrade);
    }
  }, [activeChildId]);

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (activeExam && timeRemainingSeconds > 0 && !showConfirmSubmit && !isSubmitting) {
      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeExam, timeRemainingSeconds, showConfirmSubmit, isSubmitting]);

  // Per-question elapsed time tracking
  useEffect(() => {
    let qTimer: any;
    if (activeExam && !showConfirmSubmit && !isSubmitting && activeExam.questions && activeExam.questions[currentQuestionIdx]) {
      const qId = activeExam.questions[currentQuestionIdx].id;
      qTimer = setInterval(() => {
        setTimeSpentPerQuestion((prev) => ({
          ...prev,
          [qId]: (prev[qId] || 0) + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(qTimer);
  }, [activeExam, currentQuestionIdx, showConfirmSubmit, isSubmitting]);

  const handleStartExam = async (startAssigned: boolean = false) => {
    setIsGenerating(true);
    setGenerationStep(presetTopic ? `Building Remedial Sprint for ${presetTopic}...` : 'Generating Diagnostic Exam...');

    try {
      if (!activeChildId) return;

      const isAssignedTest = Boolean(startAssigned && assignedExam);
      const targetSub = isAssignedTest ? (assignedExam.subject as Subject) : (presetSubject || selectedSubject);
      const targetDiff = isAssignedTest ? (assignedExam.difficulty as ExamDifficulty) : selectedDifficulty;
      const targetQCount = isAssignedTest ? (assignedExam.questionCount || 10) : blueprint.questionCount;
      const targetDuration = isAssignedTest ? (assignedExam.timeLimitMinutes || 15) : blueprint.durationMinutes;

      const targetScheduledId = isAssignedTest ? assignedExam?.id : undefined;
      const targetTopic = isAssignedTest ? assignedExam?.chapterTopic : (presetTopic || activeTopic || undefined);

      const { exam } = await ApiServices.generateExam({
        studentId: activeChildId,
        board: selectedBoard,
        classGrade: selectedGrade,
        subject: targetSub,
        difficulty: targetDiff,
        questionCount: targetQCount,
        timeLimitMinutes: targetDuration,
        scheduledExamId: targetScheduledId,
        chapterTopic: targetTopic,
      });

      if (targetScheduledId) {
        (exam as any).scheduledExamId = targetScheduledId;
      }

      setActiveExam(exam);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setFlaggedQuestions({});
      setTimeSpentPerQuestion({});
      setAdaptiveDifficulty('simple');
      setConsecutiveCorrect(0);
      setConsecutiveWrong(0);
      setAdaptiveNotification(null);
      setTimeRemainingSeconds((exam.timeLimitMinutes || targetDuration || 15) * 60);

      // Reset scroll position to top
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const scrollContainers = document.querySelectorAll('.overflow-y-auto');
        scrollContainers.forEach((el) => { el.scrollTop = 0; });
      }, 30);
    } catch (err) {
      console.error('Error generating exam:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Scroll to top whenever active exam changes
  useEffect(() => {
    if (activeExam) {
      const resetScroll = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const scrollContainers = document.querySelectorAll('.overflow-y-auto');
        scrollContainers.forEach((el) => { el.scrollTop = 0; });
      };
      resetScroll();
      const timer = setTimeout(resetScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [activeExam]);

  // Set active topic when navigated with presetTopic, without auto-launching exam
  useEffect(() => {
    if (
      presetTopic &&
      hasAutoStartedRef.current !== presetTopic &&
      !activeExam &&
      !isGenerating &&
      activeChildId
    ) {
      hasAutoStartedRef.current = presetTopic;
      // Do not auto-launch test; let user review configuration and click Start when ready
    }
  }, [presetTopic, activeChildId, activeExam, isGenerating]);

  const handleSelectAnswer = (questionId: string, answerValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerValue
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam || isSubmitting) return;
    setIsSubmitting(true);

    const totalSecondsSpent = (activeExam.timeLimitMinutes || 15) * 60 - timeRemainingSeconds;
    const scheduledIdToSubmit = (activeExam as any).scheduledExamId || (activeExam as any).scheduled_exam_id || undefined;

    try {
      const { submission } = await ApiServices.submitExam(
        activeExam.id,
        {
          answers,
          timeSpentPerQuestion,
          timeTakenSeconds: Math.max(10, totalSecondsSpent),
          scheduledExamId: scheduledIdToSubmit,
        }
      );
      onExamComplete(submission);
    } catch (err) {
      console.error('Error evaluating exam:', err);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
      setActiveExam(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  // If in active exam mode
  if (activeExam) {
    const currentQ = activeExam.questions[currentQuestionIdx];
    const totalQuestions = activeExam.questions.length;
    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim() !== '').length;
    const remainingCount = totalQuestions - answeredCount;
    const progressPct = Math.round((answeredCount / totalQuestions) * 100);
    const isLowTime = timeRemainingSeconds < 180;
    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 hide-scrollbar">

        {/* ═══════════════ TOP HEADER BAR (Scrolls with page) ═══════════════ */}
        <div className="max-w-6xl mx-auto px-4 pt-3 pb-2">
          <div className={`rounded-2xl overflow-hidden shadow-sm transition-all duration-500 ${isLowTime
            ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500'
            : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500'
            }`}
            style={{ boxShadow: isLowTime ? '0 4px 20px rgba(239,68,68,0.20)' : '0 4px 20px rgba(251,191,36,0.20)' }}
          >
              {/* Decorative shimmer strip */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-white/40 rounded-full" />
                <div className="absolute top-0 -left-32 w-64 h-full bg-white/10 rotate-12 blur-2xl" />
                <div className="absolute top-0 right-0 w-48 h-full bg-white/5 -rotate-12 blur-2xl" />
              </div>

              <div className="relative w-full px-5 sm:px-6 py-2.5 flex items-center justify-between gap-4">

                {/* Left — Exam Title & Badges */}
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  {/* 1st Line: Title */}
                  <div className="flex items-center">
                    <span className="text-stone-900 font-black text-xs sm:text-sm md:text-base truncate drop-shadow-xs">
                      {activeExam.title}
                    </span>
                  </div>
                  {/* 2nd Line: Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-stone-900/15 text-stone-900 border border-stone-900/20 shrink-0 backdrop-blur-xs">
                      {activeExam.totalMarks || 15} Marks
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/50 text-stone-800 border border-white/60 shrink-0 backdrop-blur-xs">
                      {activeExam.board} • {activeExam.classGrade}
                    </span>
                  </div>
                </div>


                {/* Right — Timer + Submit */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Timer */}
                  <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border font-mono font-black text-sm sm:text-base transition-all duration-300 ${isLowTime
                    ? 'bg-white text-rose-600 border-white animate-pulse shadow-md'
                    : timeRemainingSeconds < 600
                      ? 'bg-amber-600/30 border-amber-700/40 text-stone-900'
                      : 'bg-white/40 border-white/60 text-stone-900 backdrop-blur-xs'
                    }`}>
                    <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLowTime ? 'text-rose-500' : 'text-stone-800'}`} />
                    <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="finish-exam-btn"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-yellow-400 text-xs sm:text-sm font-bold shadow-md shadow-stone-900/20 transition-all duration-150 border border-stone-800"
                  >
                    Submit
                  </button>
                </div>
              </div>

              {/* Progress Bar — aligned with content, narrow pill */}
              <div className="w-full px-4 pb-2 pt-0.5 flex justify-center">
                <div className="w-24 h-1.5 bg-stone-900/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-200 rounded-full transition-all duration-700 shadow-2xs"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        {/* ═══════════════ BODY ═══════════════ */}
        <div className="max-w-6xl mx-auto px-4 py-3 pb-12">

          {/* Mobile Stats Row */}
          <div className="sm:hidden flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-700 font-bold text-sm">{answeredCount} Answered</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 border border-stone-200">
              <HelpCircle className="w-4 h-4 text-stone-400" />
              <span className="text-stone-600 font-bold text-sm">{remainingCount} Remaining</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

            {/* ═══ LEFT — Question Card (3 cols) ═══ */}
            <div className="lg:col-span-3 space-y-4">

              {/* Adaptive Banner */}
              {adaptiveNotification && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold border shadow-sm animate-in slide-in-from-top-2 duration-300 ${adaptiveNotification.type === 'up'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{adaptiveNotification.message}</span>
                  <button onClick={() => setAdaptiveNotification(null)} className="ml-auto text-current opacity-40 hover:opacity-70">✕</button>
                </div>
              )}

              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">

                {/* Card Top Bar */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-stone-50 border-b border-stone-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Q Number */}
                    <span className="w-8 h-8 rounded-lg bg-stone-900 text-white text-xs font-black flex items-center justify-center">
                      {currentQuestionIdx + 1}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">of {totalQuestions}</span>

                    {/* Difficulty Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${(currentQ.difficulty || adaptiveDifficulty) === 'hard'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : (currentQ.difficulty || adaptiveDifficulty) === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                      {(currentQ.difficulty || adaptiveDifficulty)}
                    </span>

                    {/* Type Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {currentQ.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Time on Q */}
                    <span className="text-xs font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeSpentPerQuestion[currentQ.id] || 0}s
                    </span>
                    {/* Marks */}
                    <span className="text-xs font-bold text-stone-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-lg">
                      {currentQ.marks || 1} {(currentQ.marks || 1) > 1 ? 'Marks' : 'Mark'}
                    </span>
                    {/* Flag */}
                    <button
                      id="flag-question-btn"
                      onClick={() => toggleFlagQuestion(currentQ.id)}
                      title="Flag for review"
                      className={`p-1.5 rounded-lg border transition-colors ${flaggedQuestions[currentQ.id]
                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'border-stone-200 text-stone-300 hover:text-stone-500 hover:border-stone-300'
                        }`}
                    >
                      <Flag className={`w-4 h-4 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Topic Row */}
                {currentQ.topic && (
                  <div className="px-5 pt-3 pb-0">
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-medium bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full">
                      <BookOpen className="w-3 h-3" /> {currentQ.topic}
                    </span>
                  </div>
                )}

                {/* Question Text */}
                <div className="px-5 pt-4 pb-3">
                  <p className="text-stone-900 text-base sm:text-lg font-medium leading-relaxed whitespace-pre-line">
                    {currentQ.questionText}
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-stone-100" />

                {/* Answer Area */}
                <div className="px-5 py-4 space-y-3">

                  {/* MCQ */}
                  {(currentQ.type === 'mcq' || currentQ.type === 'logical') && currentQ.options && currentQ.options.length > 0 && (
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const cleanText = opt.replace(/^(?:option\s+)?\(?[A-Da-d]\)?[\).\:\-]?\s*/i, '').trim();
                        const isSelected = answers[currentQ.id]?.toUpperCase() === letter
                          || answers[currentQ.id]?.trim().toLowerCase() === cleanText.toLowerCase()
                          || answers[currentQ.id] === opt;
                        return (
                          <label
                            key={oIdx}
                            id={`question-${currentQuestionIdx}-opt-${oIdx}`}
                            onClick={() => handleSelectAnswer(currentQ.id, letter)}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] ${isSelected
                              ? 'bg-yellow-50 border-yellow-400 shadow-sm shadow-yellow-100'
                              : 'bg-white border-stone-150 hover:border-stone-300 hover:bg-stone-50/50'
                              }`}
                          >
                            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${isSelected ? 'bg-yellow-400 text-stone-900 border-2 border-yellow-400' : 'border-2 border-stone-300 text-stone-400 bg-white'
                              }`}>
                              {letter}
                            </div>
                            <span className={`text-sm sm:text-base leading-snug ${isSelected ? 'text-stone-900 font-semibold' : 'text-stone-700'}`}>
                              {cleanText || opt}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-yellow-500 ml-auto shrink-0 mt-0.5" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* SAQ */}
                  {currentQ.type === 'saq' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Your Answer <span className="text-amber-500">(Short Answer — {currentQ.marks || 2} Marks)</span>
                      </label>
                      <textarea
                        id="saq-answer-input"
                        rows={4}
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="Write your explanation, formula or step-by-step solution..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 text-stone-900 text-sm sm:text-base outline-none transition-all resize-none"
                      />
                    </div>
                  )}

                  {/* Numerical */}
                  {currentQ.type === 'numerical' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Numerical Answer <span className="text-amber-500">(Exact value)</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <Calculator className="w-5 h-5 text-stone-300 shrink-0" />
                        <input
                          id="numerical-answer-input"
                          type="text"
                          value={answers[currentQ.id] || ''}
                          onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                          placeholder="e.g. 6 or -8.5 or 3.14"
                          className="flex-1 max-w-xs px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 text-stone-900 font-mono text-base outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-stone-400 ml-7">Do not include units unless requested.</p>
                    </div>
                  )}

                  {/* Objective */}
                  {currentQ.type === 'objective' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Objective Answer <span className="text-amber-500">(Key term / phrase)</span>
                      </label>
                      <input
                        id="objective-answer-input"
                        type="text"
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="e.g. Total Internal Reflection"
                        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 text-stone-900 text-sm sm:text-base outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between px-5 py-4 bg-stone-50 border-t border-stone-100">
                  <button
                    id="prev-question-btn"
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-stone-200 text-sm font-semibold text-stone-700 hover:bg-white hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {/* Centre progress text */}
                  <div className="hidden sm:flex flex-col items-center">
                    <span className="text-xs text-stone-400 font-medium">
                      Q {currentQuestionIdx + 1} of {totalQuestions}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {activeExam.questions.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === currentQuestionIdx ? 'w-5 bg-yellow-400' :
                            answers[activeExam.questions[i].id]?.trim() ? 'w-2.5 bg-emerald-400' :
                              'w-2.5 bg-stone-200'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {currentQuestionIdx < totalQuestions - 1 ? (
                    <button
                      id="next-question-btn"
                      onClick={() => {
                        if (!activeExam) return;
                        const currentQ = activeExam.questions[currentQuestionIdx];
                        const userAns = (answers[currentQ.id] || '').trim();

                        if (userAns) {
                          // Answered — track consecutive correct streak; reset wrong streak
                          const nextCorrect = consecutiveCorrect + 1;
                          setConsecutiveWrong(0);
                          if (nextCorrect >= 2) {
                            if (adaptiveDifficulty === 'simple') {
                              setAdaptiveDifficulty('medium');
                              setAdaptiveNotification({
                                type: 'up',
                                message: '🚀 2 consecutive correct answers! Escalating difficulty to MEDIUM level.',
                              });
                            } else if (adaptiveDifficulty === 'medium') {
                              setAdaptiveDifficulty('hard');
                              setAdaptiveNotification({
                                type: 'up',
                                message: '🔥 Great mastery! Escalating difficulty to HARD level.',
                              });
                            }
                            setConsecutiveCorrect(0);
                          } else {
                            setConsecutiveCorrect(nextCorrect);
                          }
                        } else {
                          // Skipped / unanswered — track consecutive wrong streak; reset correct streak
                          const nextWrong = consecutiveWrong + 1;
                          setConsecutiveCorrect(0);
                          if (nextWrong >= 2) {
                            if (adaptiveDifficulty === 'hard') {
                              setAdaptiveDifficulty('medium');
                              setAdaptiveNotification({
                                type: 'down',
                                message: '📉 2 consecutive unanswered questions. Adjusting to MEDIUM difficulty.',
                              });
                            } else if (adaptiveDifficulty === 'medium') {
                              setAdaptiveDifficulty('simple');
                              setAdaptiveNotification({
                                type: 'down',
                                message: '📉 Difficulty adjusted to EASY level. Keep going!',
                              });
                            }
                            setConsecutiveWrong(0);
                          } else {
                            setConsecutiveWrong(nextWrong);
                          }
                        }
                        setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1));
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-700 active:scale-95 text-white text-sm font-bold shadow-sm transition-all"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id="submit-final-exam-btn"
                      onClick={() => setShowConfirmSubmit(true)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 active:scale-95 text-stone-900 text-sm font-bold shadow-sm shadow-yellow-200 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit ({activeExam.totalMarks || 15}M)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ RIGHT — Sidebar (1 col) ═══ */}
            <div className="lg:col-span-1 space-y-4">

              {/* Progress Summary Card */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4">
                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Progress</h3>

                {/* Circular-ish progress */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="23" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                      <circle
                        cx="28" cy="28" r="23" fill="none"
                        stroke={progressPct === 100 ? '#10b981' : '#fbbf24'}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 23}`}
                        strokeDashoffset={`${2 * Math.PI * 23 * (1 - progressPct / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-stone-900">{progressPct}%</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-stone-900 leading-none">{answeredCount}<span className="text-stone-300 text-base font-semibold">/{totalQuestions}</span></p>
                    <p className="text-xs text-stone-400 mt-0.5">questions answered</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                      Answered
                    </span>
                    <span className="font-bold text-stone-900">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-200 inline-block" />
                      Unanswered
                    </span>
                    <span className="font-bold text-stone-900">{remainingCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      Flagged
                    </span>
                    <span className="font-bold text-stone-900">{Object.values(flaggedQuestions).filter(Boolean).length}</span>
                  </div>
                </div>
              </div>

              {/* Question Palette */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4">
                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Question Palette</h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {activeExam.questions.map((q, idx) => {
                    const isCurrent = idx === currentQuestionIdx;
                    const isAnswered = !!answers[q.id]?.trim();
                    const isFlagged = !!flaggedQuestions[q.id];

                    return (
                      <button
                        key={q.id}
                        id={`palette-q-${idx + 1}`}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Flagged)' : ''}`}
                        className={`relative h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 ${isCurrent
                          ? 'bg-stone-900 text-white ring-2 ring-stone-900 ring-offset-1 shadow-md'
                          : isFlagged
                            ? 'bg-amber-400 text-amber-950 shadow-sm'
                            : isAnswered
                              ? 'bg-emerald-400 text-white shadow-sm'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                      >
                        {idx + 1}
                        {isFlagged && !isCurrent && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-stone-900 inline-block" />Current</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" />Answered</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-stone-100 inline-block border border-stone-200" />Pending</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />Flagged</span>
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* ═══════════════ CONFIRM SUBMIT MODAL ═══════════════ */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">Submit Exam?</h3>
                  <p className="text-xs text-stone-400">{activeExam.totalMarks || blueprint.totalMarks} Marks • {activeExam.title}</p>
                </div>
              </div>

              {/* Stats summary in modal */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xl font-black text-emerald-600">{answeredCount}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold uppercase">Answered</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-xl font-black text-stone-600">{remainingCount}</p>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">Skipped</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  <p className="text-xl font-black text-yellow-600">{totalQuestions}</p>
                  <p className="text-[10px] text-yellow-500 font-semibold uppercase">Total</p>
                </div>
              </div>

              {remainingCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4 text-xs text-amber-800 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>{remainingCount} unanswered question{remainingCount > 1 ? 's' : ''} will receive 0 marks.</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  id="cancel-submit-modal-btn"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-all"
                >
                  Continue Test
                </button>
                <button
                  id="confirm-submit-exam-btn"
                  disabled={isSubmitting}
                  onClick={handleSubmitExam}
                  className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-stone-900 text-sm font-black shadow-sm disabled:opacity-75 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Evaluating...</span></>
                  ) : (
                    'Submit & View Results'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Configuration & Exam Setup Screen
  return (
    <div className="max-w-6xl mx-auto pt-0 pb-6 space-y-1.5">
      {/* Hero Welcome Banner (Clean, Light Landing-Page Style) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-orange-50/50 rounded-3xl p-4 sm:p-5 border border-yellow-200/80 shadow-xs">
        {/* Soft Ambient Glow Accents (matching landing page hero) */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-yellow-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-yellow-200 text-yellow-800 text-xs font-bold shadow-xs">
            <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>{blueprint.badgeText}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Exam Preparedness & Knowledge Assessment
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
            Calibrated for Classes 10 & 12 across CBSE, ICSE, ISC.
            Grounding Your Test In Authentic Syllabus Runbooks With Instant Misconception Analysis.
          </p>

          {/* Active Candidate Badge */}
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-yellow-200/80 shadow-xs mt-1">
            <span className="text-xl p-1 bg-yellow-100/70 rounded-xl border border-yellow-200/60">{activeChild?.avatar || '👦'}</span>
            <div>
              <span className="text-stone-500 text-[10px] block font-semibold uppercase tracking-wider">Active Candidate Persona</span>
              <span className="font-bold text-stone-900 text-xs sm:text-sm">{activeChild?.name} <span className="text-yellow-700 font-semibold">({activeChild?.classGrade} • {activeChild?.targetBoard})</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Configuration Form */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Configure {blueprint.titleLabel}</h2>
            <p className="text-xs text-stone-500">Select board, grade, subject, and target challenge level</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs">
              {blueprint.questionCount} Questions • {blueprint.totalMarks} Marks
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {assignedExam && (
            <div className="md:col-span-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
                  📝
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-100 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Parent Assigned Challenge • {assignedExam.questionCount} Questions ({assignedExam.timeLimitMinutes} Mins)</span>
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    {assignedExam.subject} {assignedExam.chapterTopic ? `— ${assignedExam.chapterTopic}` : ''} • {(assignedExam.difficulty || 'simple').toUpperCase()}
                  </div>
                  {assignedExam.parentInstructions && (
                    <p className="text-xs text-yellow-100 mt-1 italic">"{assignedExam.parentInstructions}"</p>
                  )}
                </div>
              </div>
              <button
                id="start-assigned-challenge-btn"
                disabled={isGenerating}
                onClick={() => handleStartExam(true)}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-yellow-400 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-105 transition-all disabled:opacity-60"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Assigned Challenge ({assignedExam.questionCount} Qs)</span>
              </button>
            </div>
          )}

          {activeTopic && (
            <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md">
                      Targeted Remedial Sprint
                    </span>
                    <span className="text-xs font-bold text-stone-700">({selectedSubject})</span>
                  </div>
                  <p className="text-sm font-black text-stone-900 mt-0.5">Focus Topic: {activeTopic}</p>
                  <p className="text-[11px] text-rose-700">Adaptive exam calibrated to strengthen and master this specific topic.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTopic(null)}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
              >
                Clear & Reset
              </button>
            </div>
          )}

          {isStudentPersona ? (
            /* Student View: Auto-locked Enrolled Syllabus Banner */
            <div className="md:col-span-2 bg-gradient-to-r from-yellow-50/90 via-amber-50/70 to-yellow-50/90 rounded-2xl p-4 sm:p-5 border border-yellow-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs border border-yellow-200 shrink-0">
                  {activeChild?.avatar || '🎓'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{activeChild?.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-stone-900">
                      Enrolled Student
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Curriculum Board: <strong className="text-yellow-950 font-bold">{selectedBoard}</strong></span>
                    <span className="text-stone-300">•</span>
                    <span>Grade / Class: <strong className="text-yellow-950 font-bold">{selectedGrade}</strong></span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-yellow-200">
                <span className="text-[11px] font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-300">
                  ✓ Self-Practice Diagnostic
                </span>
                <span className="text-[10px] text-stone-400">Adaptive {blueprint.totalMarks}-Mark Challenge</span>
              </div>
            </div>
          ) : (
            /* Parent View: Full Cross-Board & Syllabus Calibration Freedom */
            <>
              <div className="md:col-span-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Parent Cross-Board Calibration:</strong> You have full freedom to benchmark <strong>{activeChild?.name}</strong> against other exam boards (e.g. ICSE, Cambridge, IIT-JEE Foundation) to test cross-syllabus readiness.
                </span>
              </div>

              {/* Board Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  1. Target Curriculum / Exam Board
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOARDS.map((b) => (
                    <button
                      key={b}
                      id={`board-btn-${b}`}
                      type="button"
                      onClick={() => setSelectedBoard(b)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${selectedBoard === b
                        ? 'bg-yellow-400 text-stone-900 border-yellow-400 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade / Class Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  2. Student Class / Grade (Class 1 to 12)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      id={`grade-btn-${g.replace(/\s+/g, '')}`}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${selectedGrade === g
                        ? 'bg-yellow-400 text-stone-900 border-yellow-400 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subject Selector (Dynamically populated from database subject_master) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {isStudentPersona ? '1. Select Subject for Practice' : '3. Subject'}
              </label>
              {isLoadingSubjects && (
                <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Fetching mapped subjects...
                </span>
              )}
            </div>
            <select
              id="subject-dropdown-select"
              value={selectedSubject}
              disabled={isLoadingSubjects || dbSubjects.length === 0}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-hidden disabled:bg-stone-100 disabled:text-stone-400"
            >
              {isLoadingSubjects ? (
                <option value="">Fetching mapped subjects from database...</option>
              ) : dbSubjects.length === 0 ? (
                <option value="">No subjects mapped in database for {selectedGrade} ({selectedBoard})</option>
              ) : (
                dbSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))
              )}
            </select>
          </div>

          {/* Difficulty Level (Always Unlocked & Interactive) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {isStudentPersona ? '2. Challenge Difficulty Level' : '4. Exam Level'}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['simple', 'medium', 'hard'] as ExamDifficulty[]).map((d) => {
                const isSel = selectedDifficulty === d;
                const labels: Record<ExamDifficulty, { title: string; subtitle: string }> = {
                  simple: { title: 'Simple', subtitle: 'Foundation' },
                  medium: { title: 'Medium', subtitle: 'Proficiency' },
                  hard: { title: 'Hard', subtitle: 'HOTS / Olympiad' }
                };
                return (
                  <button
                    key={d}
                    id={`diff-btn-${d}`}
                    type="button"
                    onClick={() => setSelectedDifficulty(d)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all ${isSel
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                  >
                    <div className="font-bold text-xs capitalize">{labels[d].title}</div>
                    <div className={`text-[10px] ${isSel ? 'text-stone-300' : 'text-stone-400'}`}>
                      {labels[d].subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RAG Knowledge Blueprint Preview */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-8">
          <p className="text-xs text-stone-600 leading-relaxed">
            Generating <strong className="text-stone-900">{blueprint.questionCount} questions ({blueprint.totalMarks} Marks)</strong> for <strong className="text-stone-900">{selectedGrade} {selectedBoard} {selectedSubject} ({selectedDifficulty.toUpperCase()})</strong> — {blueprint.breakdown}.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-stone-500">
            Estimated duration: <strong className="text-stone-800">{blueprint.durationMinutes} minutes</strong> • {blueprint.totalMarks} Marks
          </div>

          <button
            id="start-exam-generate-btn"
            disabled={isGenerating}
            onClick={() => handleStartExam(false)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-900 font-bold text-sm shadow-md shadow-yellow-200 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <span>{generationStep || 'Building RAG Diagnostic...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-stone-900" />
                <span>{activeTopic ? `Start Remedial Sprint: ${activeTopic}` : blueprint.buttonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
