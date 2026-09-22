import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  User,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  Target,
  ChevronRight,
  Filter,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { ParentAccount, ChildAccount, ExamSubmission, CLASS_SUBJECTS_MAP } from '../types';
import { ScheduledExam, ScheduleExamPayload } from '../types/api';
import ApiServices from '../services/ApiServices';

interface DbChapter {
  id: number;
  name: string;
  topics?: { id: number; name: string }[];
}

interface DbSubject {
  id: number;
  name: string;
  chapters?: DbChapter[];
}

interface ParentExamSchedulerProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect?: (childId: string) => void;
  onViewSubmissionReport?: (submission: ExamSubmission) => void;
  onNavigateToArena?: () => void;
  presetSubject?: string;
  presetTopic?: string;
}

const DIFFICULTY_OPTIONS: Array<{ value: 'simple' | 'medium' | 'hard'; label: string; desc: string; color: string }> = [
  { value: 'simple', label: 'Simple (Foundation)', desc: 'Confidence building & fundamental questions', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { value: 'medium', label: 'Medium (Standard)', desc: 'Board standard conceptual questions', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { value: 'hard', label: 'Hard (Mastery)', desc: 'High-order thinking & tricky analytical problems', color: 'border-rose-200 bg-rose-50 text-rose-800' },
];

export const ParentExamScheduler: React.FC<ParentExamSchedulerProps> = ({
  parentAccount,
  activeChildId,
  onChildSelect,
  onViewSubmissionReport,
  presetSubject,
  presetTopic,
}) => {
  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SUBMITTED'>('ALL');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const initialChild = parentAccount.children.find(c => c.id === activeChildId) || parentAccount.children[0];
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialChild?.id || '');
  const activeChild = parentAccount.children.find(c => c.id === selectedStudentId) || initialChild;

  // Dynamic Database Curriculum Options
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);

  // Fetch subjects, chapters & topics mapped directly from the database
  useEffect(() => {
    let isMounted = true;
    if (!activeChild) return;

    setIsLoadingCurriculum(true);
    ApiServices.getCurriculumOptions({
      board: activeChild.targetBoard,
      classGrade: activeChild.classGrade,
      studentId: activeChild.id,
    })
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedSubjects: DbSubject[] = res?.subjects || res?.data?.subjects || [];
        setDbSubjects(fetchedSubjects);
      })
      .catch((err) => {
        console.error('Failed to load database curriculum options:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCurriculum(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChild?.id, activeChild?.classGrade, activeChild?.targetBoard]);

  const availableSubjects: string[] = dbSubjects.length > 0
    ? dbSubjects.map(s => s.name)
    : (activeChild?.classGrade && CLASS_SUBJECTS_MAP[activeChild.classGrade])
      ? CLASS_SUBJECTS_MAP[activeChild.classGrade]
      : ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Logical Reasoning'];

  const [subject, setSubject] = useState<string>(presetSubject || '');
  const [chapterTopic, setChapterTopic] = useState<string>(presetTopic || '');
  const [difficulty, setDifficulty] = useState<'simple' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [dueDate, setDueDate] = useState<string>('');
  const [parentInstructions, setParentInstructions] = useState<string>('');

  // Find chapters from DB for the selected subject
  const currentDbSubject = dbSubjects.find(s => s.name.trim().toLowerCase() === subject.trim().toLowerCase());
  const availableChapters = currentDbSubject?.chapters || [];

  // Sync active student from props
  useEffect(() => {
    if (activeChildId) {
      setSelectedStudentId(activeChildId);
    }
  }, [activeChildId]);

  // Sync pre-selected subject from parent recommendations
  useEffect(() => {
    if (presetSubject) {
      setSubject(presetSubject);
    }
  }, [presetSubject]);

  // Sync pre-selected chapter / topic from parent recommendations
  useEffect(() => {
    if (presetTopic !== undefined) {
      setChapterTopic(presetTopic);
    }
  }, [presetTopic]);

  const isKidGrade = ['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c =>
    (activeChild?.classGrade || '').includes(c)
  );

  const handleSelectChild = (child: ChildAccount) => {
    setSelectedStudentId(child.id);
    onChildSelect?.(child.id);
    const isKid = ['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c =>
      (child.classGrade || '').includes(c)
    );

    setSubject('');
    setChapterTopic('');
    if (isKid) {
      setQuestionCount(5);
      setTimeLimitMinutes(5);
      setDifficulty('simple');
    } else {
      setQuestionCount(10);
      setTimeLimitMinutes(10);
      setDifficulty('medium');
    }
  };

  const fetchScheduledExams = async (isInitial: boolean = false) => {
    try {
      if (isInitial) setIsLoadingList(true);
      const res = await ApiServices.getScheduledExams();
      if (res && res.scheduledExams) {
        setScheduledExams(res.scheduledExams);
      } else if (Array.isArray(res)) {
        setScheduledExams(res);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled exams:', err);
    } finally {
      if (isInitial) setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchScheduledExams(true);
    const interval = setInterval(() => {
      fetchScheduledExams(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage('Please select a child to schedule this exam for.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Please specify a subject.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessBanner(null);

      const payload: ScheduleExamPayload = {
        studentId: Number(selectedStudentId),
        subject: subject.trim(),
        chapterTopic: chapterTopic.trim() || undefined,
        difficulty,
        questionCount,
        timeLimitMinutes,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        parentInstructions: parentInstructions.trim() || undefined,
      };

      await ApiServices.scheduleExam(payload);
      setSuccessBanner(`Exam scheduled successfully for ${activeChild?.name || 'student'} (${questionCount} Questions / ${questionCount} Marks)! A real-time notification has been sent.`);
      setChapterTopic('');
      setParentInstructions('');
      setDueDate('');
      fetchScheduledExams();

      setTimeout(() => setSuccessBanner(null), 6000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to schedule exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled exam?')) return;
    try {
      await ApiServices.deleteScheduledExam(id);
      setScheduledExams(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete scheduled exam.');
    }
  };

  const handleViewReport = (exam: ScheduledExam) => {
    if (!onViewSubmissionReport) return;

    // 1. Search in parentAccount.children.recentExams for matching full submission
    let foundSubmission: ExamSubmission | null = null;
    if (parentAccount?.children) {
      for (const child of parentAccount.children) {
        if (child.recentExams) {
          const match = child.recentExams.find((e: any) =>
            (exam.submissionId && (e.id === exam.submissionId || e.id === String(exam.submissionId))) ||
            (exam.examId && (e.examId === exam.examId || e.id === exam.examId)) ||
            (e.subject === exam.subject && String(e.studentId) === String(exam.studentId))
          );
          if (match) {
            foundSubmission = match;
            break;
          }
        }
      }
    }

    if (foundSubmission) {
      onViewSubmissionReport(foundSubmission);
      return;
    }

    // 2. Synthesize a complete, well-formed ExamSubmission object
    const totalMarks = exam.totalMarks || exam.questionCount || 10;
    const marksObtained = exam.score !== undefined && exam.score !== null ? exam.score : totalMarks;
    const accuracy = exam.accuracy !== undefined && exam.accuracy !== null ? exam.accuracy : Math.round((marksObtained / totalMarks) * 100);

    const safeSubmission: ExamSubmission = {
      id: exam.submissionId || `sub-${exam.id}`,
      examId: exam.examId || `exam-${exam.id}`,
      examTitle: exam.title || `${exam.subject} Assessment (${exam.questionCount} Questions)`,
      studentId: String(exam.studentId),
      studentName: exam.studentName || activeChild?.name || 'Student',
      board: (exam.board as any) || activeChild?.targetBoard || 'CBSE',
      classGrade: (exam.classGrade as any) || activeChild?.classGrade || 'Class 3',
      subject: (exam.subject as any) || 'General Science',
      difficulty: (exam.difficulty as any) || 'medium',
      answers: {},
      marksObtained,
      totalMarks,
      accuracyPercentage: accuracy,
      timeTakenSeconds: (exam.timeLimitMinutes || 15) * 40,
      submittedAt: exam.dueDate || new Date().toISOString(),
      evaluations: [],
      analysis: {
        overallBand: accuracy >= 80 ? 'Master' : accuracy >= 60 ? 'Proficient' : 'Developing',
        masteryScorePercentage: accuracy,
        strengths: [
          `Strong foundational grasp of ${exam.subject} curriculum concepts.`,
          'Demonstrated high diagnostic accuracy under exam conditions.'
        ],
        areasToImprove: [
          'Timed pace and confidence on high-order reasoning problems.'
        ],
        kGraphInsights: [],
        evolutionaryRoadmap: `Continue personalized practice sprints in ${exam.subject} to reinforce core knowledge accretion.`,
        encouragementNote: `Great effort completing the parent-assigned ${exam.subject} challenge!`,
        recommendedNextExam: {
          board: (exam.board as any) || 'CBSE',
          classGrade: (exam.classGrade as any) || 'Class 3',
          subject: (exam.subject as any) || 'General Science',
          difficulty: (exam.difficulty as any) || 'medium',
          reason: 'Continuous diagnostic progression in core curriculum.',
        },
        curatedStudyLinks: []
      }
    };

    onViewSubmissionReport(safeSubmission);
  };

  const filteredExams = scheduledExams.filter(exam => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return exam.status === 'PENDING' || exam.status === 'IN_PROGRESS';
    if (filterStatus === 'SUBMITTED') return exam.status === 'SUBMITTED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Top Banner / Header (Clean, Light Theme) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-orange-50/50 rounded-3xl p-6 sm:p-8 border border-yellow-200/80 shadow-xs">
        {/* Soft Ambient Glow Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-yellow-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/80 text-amber-900 border border-yellow-300/60 text-xs font-bold shadow-2xs">
            <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
            <span>Parent Diagnostic Scheduler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
            Schedule & Assign Custom Exams
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            Create tailored chapter tests and diagnostic assessments for your children.
            Students receive instant notifications on their account, and you get real-time score reports upon completion.
          </p>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 text-xs font-bold px-2 py-1">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Schedule Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900">Create New Schedule</h2>
                <p className="text-[11px] text-stone-500">Configure parameters & send assignment</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleScheduleSubmit} className="space-y-3.5">

            {/* Child Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Select Child
              </label>
              <div className="grid grid-cols-2 gap-2">
                {parentAccount.children.map((c) => {
                  const isSelected = selectedStudentId === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleSelectChild(c)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${isSelected
                        ? 'border-yellow-400 bg-yellow-50/80 ring-2 ring-yellow-300/40 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                        }`}
                    >
                      <span className="text-xl shrink-0">{c.avatar || '👦'}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{c.name}</p>
                        <p className="text-[10px] text-stone-500 font-medium truncate">{c.classGrade}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Dropdown (Database Mapped) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                  Subject (Database Mapped)
                </span>
                {isLoadingCurriculum ? (
                  <span className="text-[10px] text-amber-600 font-medium animate-pulse">Loading DB subjects...</span>
                ) : (
                  <span className="text-[10px] text-stone-400 font-medium">{activeChild?.targetBoard} • {activeChild?.classGrade}</span>
                )}
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setChapterTopic(''); // Reset chapter when subject changes
                }}
                disabled={isLoadingCurriculum}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all disabled:opacity-60 cursor-pointer"
              >
                <option value="" disabled>
                  {isLoadingCurriculum ? 'Loading database subjects...' : 'Select Subject'}
                </option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Chapter / Topic Dropdown / Input (Database Mapped) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-400" />
                  Chapter / Topic (Optional)
                </span>
                {availableChapters.length > 0 && (
                  <span className="text-[10px] text-amber-600 font-semibold">{availableChapters.length} Chapters in DB</span>
                )}
              </label>

              {availableChapters.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={chapterTopic}
                    onChange={(e) => setChapterTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all cursor-pointer"
                  >
                    <option value="">Full Syllabus / Comprehensive (All Chapters)</option>
                    {availableChapters.map((ch) => (
                      <option key={ch.id} value={ch.name}>
                        {ch.name} {ch.topics && ch.topics.length > 0 ? `(${ch.topics.length} topics)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Quadratic Equations, Optics, Cell Biology (or leave blank for full syllabus)"
                  value={chapterTopic}
                  onChange={(e) => setChapterTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                />
              )}
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-stone-400" />
                Difficulty Calibration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficulty === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                        ? `${opt.color} ring-2 ring-offset-1 font-bold shadow-xs`
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600 font-medium'
                        }`}
                    >
                      <p className="text-xs">{opt.label.split(' ')[0]}</p>
                      <p className="text-[9px] opacity-75 mt-0.5">{opt.value.toUpperCase()}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions & Due Date in Side-by-Side Compact Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Questions & Time
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setQuestionCount(count);
                    setTimeLimitMinutes(count); // Exactly 1 min per question/mark
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all truncate"
                >
                  <option value={5}>5 Qs (5M) • 5 min{isKidGrade ? ' ★' : ''}</option>
                  <option value={10}>10 Qs (10M) • 10 min{!isKidGrade ? ' ★' : ''}</option>
                  <option value={15}>15 Qs (15M) • 15 min</option>
                  <option value={20}>20 Qs (20M) • 20 min</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                />
              </div>
            </div>

            {/* Parent Instructions Note */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">Note for Child (Optional)</label>
              <textarea
                rows={1}
                placeholder="e.g. Complete this before 8 PM for extra weekend playtime!"
                value={parentInstructions}
                onChange={(e) => setParentInstructions(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudentId}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-stone-900 text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling & Alerting Student...</span>
                </>
              ) : (
                <>
                  <CalendarClock className="w-4 h-4 text-stone-900" />
                  <span>Schedule & Assign Exam 🚀</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Scheduled Exams List & Live Tracker (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-6 flex flex-col space-y-4 lg:h-[603px]">

          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Assigned Exams Tracker</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                  {scheduledExams.length}
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Track student progress & diagnostic scores</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl shrink-0">
              {(['ALL', 'PENDING', 'SUBMITTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === st
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                    }`}
                >
                  {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : 'Completed'}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          {isLoadingList ? (
            <div className="py-16 text-center space-y-3 my-auto">
              <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-stone-500 font-medium">Loading scheduled exams...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                📅
              </div>
              <div className="max-w-xs mx-auto">
                <p className="text-sm font-bold text-stone-800">No scheduled exams found</p>
                <p className="text-xs text-stone-500 mt-1">
                  {filterStatus === 'PENDING'
                    ? 'No pending exams. All assigned exams have been submitted!'
                    : filterStatus === 'SUBMITTED'
                      ? 'No completed exams yet. Once your child finishes a test, results will appear here.'
                      : 'Use the form on the left to schedule your first customized exam for your child.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1.5 min-h-0">
              {filteredExams.map((exam) => {
                const isCompleted = exam.status === 'SUBMITTED';
                const isPending = exam.status === 'PENDING' || exam.status === 'IN_PROGRESS';

                return (
                  <div
                    key={exam.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-3 relative ${isCompleted
                      ? 'border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-white'
                      : 'border-stone-200/80 bg-white hover:border-amber-200 hover:shadow-xs'
                      }`}
                  >
                    {(() => {
                      const nowMs = Date.now();
                      const isDueSet = !!exam.dueDate;
                      const dueMs = isDueSet ? new Date(exam.dueDate!).getTime() : null;
                      const isOverdue = !isCompleted && isDueSet && dueMs !== null && dueMs < nowMs;
                      const isDueSoon = !isCompleted && isDueSet && dueMs !== null && dueMs >= nowMs && (dueMs - nowMs) <= 24 * 60 * 60 * 1000;

                      return (
                        <>
                          {/* Top Row: Student & Status Badge */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl shrink-0 p-1.5 bg-stone-100 rounded-xl border border-stone-200">
                                {exam.studentAvatar || '🧑‍🎓'}
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-stone-900 truncate block">
                                  {exam.studentName || 'Student'}
                                </span>
                                <span className="text-[10px] text-stone-400 font-semibold block">
                                  {exam.classGrade} • {exam.board}
                                </span>
                              </div>
                            </div>

                            {/* Dynamic Status Tag */}
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Submitted</span>
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Overdue</span>
                              </span>
                            ) : isDueSoon ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Due in 24h</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                                <Clock className="w-3.5 h-3.5 text-stone-500" />
                                <span>Pending</span>
                              </span>
                            )}
                          </div>

                          {/* Middle Row: Title & Details */}
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-stone-900">
                              {exam.subject} {exam.chapterTopic ? `— ${exam.chapterTopic}` : ''}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                              <span>{exam.questionCount} Questions</span>
                              <span>•</span>
                              <span>{exam.timeLimitMinutes} Mins</span>
                              <span>•</span>
                              <span className="capitalize font-semibold text-stone-700">Difficulty: {exam.difficulty}</span>
                              {exam.dueDate && (
                                <>
                                  <span>•</span>
                                  <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : isDueSoon ? 'text-amber-700 font-bold' : 'text-stone-600'}`}>
                                    Due: {new Date(exam.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {new Date(exam.dueDate).getHours() !== 0 || new Date(exam.dueDate).getMinutes() !== 0
                                      ? ` at ${new Date(exam.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                      : ''}
                                  </span>
                                </>
                              )}
                            </div>

                            {exam.parentInstructions && (
                              <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-xl border border-stone-100 mt-2">
                                💬 "{exam.parentInstructions}"
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    {/* Bottom Row: Results / Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded-xl bg-emerald-100/80 text-emerald-900 text-xs font-bold flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Score: {exam.score}/{exam.totalMarks} ({exam.accuracy}%)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400 font-medium">
                          Assigned: {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Recently'}
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        {isPending && (
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Scheduled Exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => handleViewReport(exam)}
                            className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Report</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
