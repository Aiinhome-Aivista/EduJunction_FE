import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
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
  Sparkles,
  BarChart3,
  CheckCircle,
  XCircle,
  PenTool
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

interface ModelPaperViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    id: number | string;
    board: string;
    classGrade: string;
    subject: string;
    modelTestId?: string;
    status?: string;
  } | null;
  paperData: PaperData | null;
  isLoading: boolean;
}

export const ModelPaperViewerModal: React.FC<ModelPaperViewerModalProps> = ({
  isOpen,
  onClose,
  subscription,
  paperData,
  isLoading,
}) => {
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

  // Timer for test taking
  useEffect(() => {
    let interval: any = null;
    if (isOpen && activeMode === 'TEST' && !isLoading) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, activeMode, isLoading]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setActiveMode('TEST');
      setAnswers({});
      setEvaluationResult(null);
      setElapsedSeconds(0);
      setSelectedSection('ALL');
      setShowSubmitConfirm(false);
      setExpandedSolutions({});
      setAllExpanded(false);
    }
  }, [isOpen, subscription?.id]);

  // Content security: prevent right click and print shortcuts inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (showSubmitConfirm) {
          setShowSubmitConfirm(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showSubmitConfirm]);

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
    if (!subscription?.id) return;
    try {
      setIsSubmitting(true);
      setShowSubmitConfirm(false);

      const res = await ApiServices.evaluateSubjectModelPaper(subscription.id, {
        answers,
        timeSpentSeconds: elapsedSeconds,
      });

      if (res?.data) {
        setEvaluationResult(res.data);
        setActiveMode('RESULT');
      }
    } catch (err: any) {
      console.error('Failed to evaluate model paper:', err);
      alert('Failed to evaluate test paper. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
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
    return Object.values(answers).filter((val) => typeof val === 'string' && val.trim().length > 0).length;
  }, [answers]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const setLabel = subscription?.modelTestId?.includes('SET_')
    ? `Set ${subscription.modelTestId.split('SET_')[1]}`
    : `Set ${paperData?.set_number || 1}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-white w-full max-w-5xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-700/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
              {activeMode === 'RESULT' ? <Award className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white truncate">
                  {paperData?.board || subscription?.board} {paperData?.class_grade || subscription?.classGrade} — {paperData?.subject || subscription?.subject}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                  {setLabel}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                  {activeMode === 'RESULT' ? 'Scorecard & Review' : 'Live Examination'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {activeMode === 'RESULT' ? `Time Spent: ${formatTimer(evaluationResult?.timeSpentSeconds || elapsedSeconds)}` : `Elapsed: ${formatTimer(elapsedSeconds)}`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  {paperData?.max_marks || 80} Total Marks
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Official 2027 Pattern
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-700 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Evaluation Banner (Only in RESULT mode) */}
        {activeMode === 'RESULT' && evaluationResult && (
          <div className="bg-gradient-to-r from-stone-900 via-amber-950/70 to-stone-900 text-white p-5 sm:p-6 border-b border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-400 shrink-0">
                <span className="text-xl font-black">{evaluationResult.totalMarksObtained}</span>
                <span className="text-[10px] font-bold text-stone-400">/ {evaluationResult.maxMarks}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Evaluation Complete</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                    {evaluationResult.grade}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Your Score: {evaluationResult.accuracyPercentage}% Marks Obtained
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  Attempted {evaluationResult.summary.attemptedCount} of {evaluationResult.summary.totalQuestions} Questions • {evaluationResult.summary.correctCount} Correct • {evaluationResult.summary.partialCount} Partial
                </p>
              </div>
            </div>

            {/* Section Breakdown Pills */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
              {evaluationResult.sectionBreakdown.map((sec, sIdx) => (
                <div
                  key={sec.id || sIdx}
                  className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center"
                >
                  <div className="text-[10px] font-bold text-amber-300 uppercase">{sec.name}</div>
                  <div className="text-xs font-black text-white">{sec.marksObtained} / {sec.maxMarks}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Sub-Header Strip */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Section Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSection('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedSection === 'ALL'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 text-amber-400 shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
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
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {activeMode === 'RESULT' && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-stone-100/50">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm font-bold text-stone-700">Loading authentic 2027 Specimen Model Paper...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="py-20 text-center text-stone-400 space-y-2">
              <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">No questions matched your search query.</p>
              <p className="text-xs text-stone-400">Try clearing the search filter or switching sections.</p>
            </div>
          ) : (
            filteredSections.map((section, sIdx) => {
              const secTitle = section.title || section.name;

              return (
                <div key={section.id || sIdx} className="space-y-4">
                  {/* Section Title Banner */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-stone-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {secTitle}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {section.questions.length} Questions • Answer with steps and calculations
                      </p>
                    </div>

                    {activeMode === 'RESULT' && section.marksObtained !== undefined && (
                      <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 text-xs font-black border border-amber-200">
                        Score: {section.marksObtained} / {section.maxMarks} Marks
                      </span>
                    )}
                  </div>

                  {/* Question Cards */}
                  <div className="space-y-3.5">
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
                          className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs hover:border-amber-300/80 transition-all space-y-4"
                        >
                          {/* Question Header & Prompt */}
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                                  Q{qNum}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200">
                                  {qMarks} {qMarks > 1 ? 'Marks' : 'Mark'}
                                </span>
                                {isMcq ? (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                                    Multiple Choice
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                                    Descriptive / Step Answer
                                  </span>
                                )}
                              </div>

                              {/* Marks awarded badge in Result mode */}
                              {evalItem && (
                                <div className="flex items-center gap-2">
                                  {evalItem.marksAwarded >= evalItem.maxMarks ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      +{evalItem.marksAwarded} / {evalItem.maxMarks} Marks
                                    </span>
                                  ) : evalItem.marksAwarded > 0 ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-black border border-amber-200 flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      +{evalItem.marksAwarded} / {evalItem.maxMarks} Marks
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-black border border-rose-200 flex items-center gap-1">
                                      <XCircle className="w-3.5 h-3.5" />
                                      0 / {evalItem.maxMarks} Marks
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Case Study Context if present */}
                            {q.case_title && (
                              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  {q.case_title}
                                </p>
                                {q.case_text && <p className="text-stone-700 text-[11px] leading-relaxed">{q.case_text}</p>}
                              </div>
                            )}

                            {/* Question Text */}
                            <div
                              className="text-xs sm:text-sm font-bold text-stone-900 leading-relaxed pt-1"
                              dangerouslySetInnerHTML={{ __html: q.question }}
                            />
                          </div>

                          {/* ========================================================= */}
                          {/* TEST MODE: Interactive Answer Inputs                      */}
                          {/* ========================================================= */}
                          {activeMode === 'TEST' && (
                            <div className="pt-2">
                              {isMcq && q.options && q.options.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                    Select your answer:
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((opt, optIdx) => {
                                      const optLetter = chr(65 + optIdx);
                                      const isSelected = currentStudentAns.toUpperCase() === optLetter;

                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          onClick={() => handleSelectOption(qKey, optLetter)}
                                          className={`p-3 rounded-xl text-left text-xs font-semibold transition-all flex items-start gap-2.5 border cursor-pointer ${
                                            isSelected
                                              ? 'bg-amber-50 border-amber-500 text-stone-950 font-bold shadow-xs ring-1 ring-amber-500'
                                              : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200 text-stone-700'
                                          }`}
                                        >
                                          <span
                                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
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
                                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold">
                                    <span className="flex items-center gap-1">
                                      <PenTool className="w-3 h-3 text-amber-500" />
                                      Type your complete step-by-step answer:
                                    </span>
                                    <span>{currentStudentAns.length} characters</span>
                                  </div>
                                  <textarea
                                    value={currentStudentAns}
                                    onChange={(e) => handleTextAnswerChange(qKey, e.target.value)}
                                    placeholder="Write your answer here..."
                                    rows={3}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-y"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* RESULT MODE: Student Answer vs Model Solution & Feedback  */}
                          {/* ========================================================= */}
                          {activeMode === 'RESULT' && evalItem && (
                            <div className="pt-2 space-y-3">
                              {/* Student Answer Box */}
                              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-stone-500 block">
                                  Your Submitted Answer:
                                </span>
                                <p className="text-xs font-semibold text-stone-800">
                                  {evalItem.studentAnswer ? evalItem.studentAnswer : <em className="text-stone-400 font-normal">Not Attempted / Left Blank</em>}
                                </p>
                              </div>

                              {/* AI Examiner Feedback */}
                              {evalItem.feedback && (
                                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
                                  <span className="font-bold flex items-center gap-1.5 text-blue-900">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    Examiner Assessment & Remarks:
                                  </span>
                                  <p className="text-stone-700 leading-relaxed text-[11px]">{evalItem.feedback}</p>
                                </div>
                              )}

                              {/* Model Answer Toggle Accordion */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSolution(qKey)}
                                  className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-amber-100/70 text-stone-800 text-xs font-bold flex items-center justify-between transition-colors border border-stone-200 cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5 text-amber-900">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    View Official Model Answer & Marking Scheme
                                  </span>
                                  {isSolutionOpen ? (
                                    <ChevronUp className="w-4 h-4 text-stone-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-stone-500" />
                                  )}
                                </button>

                                {isSolutionOpen && (
                                  <div className="mt-2 p-4 rounded-xl bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-200 space-y-2.5 text-xs animate-in fade-in duration-150">
                                    <div>
                                      <span className="text-[10px] font-black uppercase text-emerald-800 block">
                                        Correct Model Answer:
                                      </span>
                                      <p className="font-bold text-emerald-950 mt-0.5">
                                        {evalItem.correctAnswer}
                                      </p>
                                    </div>
                                    {evalItem.explanation && (
                                      <div className="pt-2 border-t border-emerald-100">
                                        <span className="text-[10px] font-black uppercase text-stone-500 block">
                                          Step-by-Step Marking Rubric & Solution:
                                        </span>
                                        <p className="text-stone-700 mt-0.5 leading-relaxed">
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
        </div>

        {/* ========================================================= */}
        {/* Bottom Floating Bar in TEST Mode                         */}
        {/* ========================================================= */}
        {activeMode === 'TEST' && !isLoading && (
          <div className="bg-white border-t border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                {answeredCount}/{totalQuestions}
              </div>
              <div>
                <div className="text-xs font-black text-stone-900">
                  {answeredCount} of {totalQuestions} Questions Answered
                </div>
                <div className="text-[11px] text-stone-500">
                  {totalQuestions - answeredCount > 0
                    ? `${totalQuestions - answeredCount} unanswered questions remaining`
                    : 'All questions attempted! Ready to submit.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
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
        )}

        {/* Confirmation Modal Before Submission */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-stone-900">
                Ready to Submit Your Model Examination?
              </h3>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                <p><strong>Attempted:</strong> {answeredCount} / {totalQuestions} Questions</p>
                <p><strong>Time Spent:</strong> {formatTimer(elapsedSeconds)}</p>
                {totalQuestions - answeredCount > 0 && (
                  <p className="text-amber-700 font-bold pt-1">
                    ⚠️ You have {totalQuestions - answeredCount} unanswered questions. Unanswered questions will receive 0 marks.
                  </p>
                )}
              </div>

              <p className="text-[11px] text-stone-500">
                Our automated AI grading engine will evaluate all your objective and subjective answers against standard 2027 board rubrics.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  ) : (
                    <span>Yes, Submit & Grade</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function chr(code: number): string {
  return String.fromCharCode(code);
}
