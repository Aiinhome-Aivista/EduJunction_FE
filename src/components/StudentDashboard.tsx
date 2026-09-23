import React, { useState, useMemo, useEffect } from 'react';
import {
  ChildAccount,
  ExamSubmission,
  LearningPathNode,
  Badge,
  Subject,
} from '../types';
import { ScheduledExam, StudentActivityLogResponse } from '../types/api';
import ApiServices from '../services/ApiServices';
import {
  Zap,
  Flame,
  Target,
  Award,
  Play,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  Gamepad2,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  BarChart3,
  BookOpen,
  PieChart as PieChartIcon,
  CalendarClock,
  Activity,
  X,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { calculateStudentMetrics } from '../utils/metricsEngine';

interface StudentDashboardProps {
  activeChild: ChildAccount;
  examHistory: ExamSubmission[];
  learningNodes?: LearningPathNode[];
  allBadges?: Badge[];
  onNavigateToArena: (config?: { subject?: Subject; topic?: string }) => void;
  onNavigateToLearningPath: () => void;
  onNavigateToGamification: () => void;
  onNavigateToFunZone: () => void;
  onViewSubmissionReport: (submission: ExamSubmission) => void;
}

const DYNAMIC_PALETTE = [
  '#f59e0b', // Amber / Gold
  '#1c1917', // Dark Stone / Black
  '#eab308', // Warm Yellow
  '#44403c', // Charcoal
  '#d97706', // Deep Gold
  '#78716c', // Warm Grey
  '#b45309', // Dark Amber
  '#292524', // Rich Black
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeChild,
  examHistory,
  learningNodes = [],
  allBadges = [],
  onNavigateToArena,
  onNavigateToLearningPath,
  onNavigateToGamification,
  onNavigateToFunZone,
  onViewSubmissionReport,
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  // Unified Student Analytics Metrics (SSOT)
  const metrics = useMemo(() => {
    return calculateStudentMetrics(activeChild, examHistory);
  }, [activeChild, examHistory]);

  const studentExams = metrics.childExams;
  const accuracyPct = metrics.scorePct;
  const readinessPct = metrics.readinessScore;

  // Check if student is in Junior Grade (Class 1 - Class 4)
  const isKid = ['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some((c) =>
    (activeChild.classGrade || '').includes(c)
  );
  const defaultTotalMarks = isKid ? 5 : 15;

  // Total XP & Level calculation (250 XP per Level)
  const xp = activeChild.xp || 0;
  const currentLevel = activeChild.level || (Math.floor(xp / 250) + 1);
  const currentLevelBaseXP = (currentLevel - 1) * 250;
  const xpInCurrentLevel = Math.max(0, xp - currentLevelBaseXP);
  const xpProgress = Math.min(100, Math.max(0, (xpInCurrentLevel / 250) * 100));

  const getTierTitle = (lvl: number) => {
    if (lvl >= 10) return 'Grandmaster Polymath 👑';
    if (lvl >= 6) return 'Master Thinker 🥇';
    if (lvl >= 3) return 'Apprentice Explorer 🥈';
    return 'Novice Scholar 🥉';
  };

  const streakDays = activeChild.streakDays || 0;

  // Unlocked badges count (checks earnedBadgeIds from backend / child account)
  const earnedBadgeIds = activeChild.earnedBadgeIds || (activeChild as any).badges || [];
  const unlockedBadgesCount = earnedBadgeIds.length;

  // Identify next recommended topic from learning path or mastery
  const nextRecommendedTopic = useMemo(() => {
    const inProgress = learningNodes.find((n) => n.status === 'in_progress');
    if (inProgress) return inProgress;
    const lockedOrAvail = learningNodes.find((n) => n.status === 'available');
    if (lockedOrAvail) return lockedOrAvail;
    if (learningNodes.length > 0) return learningNodes[0];
    return null;
  }, [learningNodes]);

  // Real Application Topic Mastery Calculation (Safe normalization & sorting)
  const topicMasteryEntries = useMemo(() => {
    return Object.entries(activeChild.topicMastery || {}).map(([topic, rawScore]) => {
      let score = Number(rawScore) || 0;
      if (score <= 5 && score > 0) score = score * 20;
      return { topic, score: Math.min(100, Math.max(0, Math.round(score))) };
    });
  }, [activeChild.topicMastery]);

  const strongTopics = useMemo(() => {
    return topicMasteryEntries
      .filter((t) => t.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [topicMasteryEntries]);

  const weakTopics = useMemo(() => {
    return topicMasteryEntries
      .filter((t) => t.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [topicMasteryEntries]);

  // Dynamic Subject-wise Marks & Score distribution calculated directly from database records
  const subjectMarksChartData = useMemo(() => {
    const subjectMap = new Map<string, { totalObtained: number; totalPossible: number; examsCount: number }>();

    studentExams.forEach((sub) => {
      const subjectName = (sub.subject || 'General Practice').trim();
      const current = subjectMap.get(subjectName) || { totalObtained: 0, totalPossible: 0, examsCount: 0 };
      current.totalObtained += (sub.marksObtained || 0);
      current.totalPossible += (sub.totalMarks || defaultTotalMarks);
      current.examsCount += 1;
      subjectMap.set(subjectName, current);
    });

    return Array.from(subjectMap.entries()).map(([subject, data], index) => {
      const accuracy = data.totalPossible > 0
        ? Math.round((data.totalObtained / data.totalPossible) * 100)
        : 0;

      return {
        name: subject,
        value: data.totalObtained, // Pie slice sized by marks obtained
        marksObtained: data.totalObtained,
        totalPossible: data.totalPossible,
        accuracyPct: accuracy,
        examsCount: data.examsCount,
        color: DYNAMIC_PALETTE[index % DYNAMIC_PALETTE.length],
      };
    });
  }, [studentExams, defaultTotalMarks]);

  const totalSubjectMarks = useMemo(() => {
    return subjectMarksChartData.reduce((acc, curr) => acc + curr.marksObtained, 0);
  }, [subjectMarksChartData]);

  // Performance progress chart data
  const chartData = useMemo(() => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    if (timeframe === 'week') {
      const today = new Date();
      // Calculate Monday of the current week (0 is Sunday, 1 is Monday ... 6 is Saturday)
      const dayOfWeek = today.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7; // days since Monday (0 for Mon, 6 for Sun)

      const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diffToMonday);
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
        const dayLabel = days[offset];
        const dayStart = d.getTime();
        const dayEnd = dayStart + DAY_MS;

        const matching = studentExams.filter((e) => {
          const t = new Date(e.submittedAt).getTime();
          return t >= dayStart && t < dayEnd;
        });

        const score = matching.length > 0
          ? Math.round(matching.reduce((acc, curr) => acc + ((curr.marksObtained / (curr.totalMarks || defaultTotalMarks)) * 100), 0) / matching.length)
          : null;

        return { label: dayLabel, score };
      });
    } else {
      // 4 weeks window
      return [4, 3, 2, 1].map((w) => {
        const wEnd = now - (w - 1) * 7 * DAY_MS;
        const wStart = now - w * 7 * DAY_MS;
        const matching = studentExams.filter((e) => {
          const t = new Date(e.submittedAt).getTime();
          return t >= wStart && t < wEnd;
        });
        const score = matching.length > 0
          ? Math.round(matching.reduce((acc, curr) => acc + ((curr.marksObtained / (curr.totalMarks || defaultTotalMarks)) * 100), 0) / matching.length)
          : null;
        return { label: `W${5 - w}`, score };
      });
    }
  }, [studentExams, timeframe, defaultTotalMarks]);

  const [assignedExams, setAssignedExams] = useState<ScheduledExam[]>([]);
  const [unlockedModelPapers, setUnlockedModelPapers] = useState<any[]>([]);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<StudentActivityLogResponse | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const fetchStudentActivityLog = async () => {
    setIsLoadingActivity(true);
    try {
      const res = await ApiServices.getMyActivityLogs();
      if (res) {
        setActivityLog(res);
      }
    } catch (e) {
      // quiet ignore
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [examRes, logRes, subsRes] = await Promise.allSettled([
          ApiServices.getAssignedExams(),
          ApiServices.getMyActivityLogs(),
          ApiServices.getMySubjectSubscriptions(activeChild?.id)
        ]);
        if (isMounted) {
          if (examRes.status === 'fulfilled' && examRes.value?.assignedExams) {
            setAssignedExams(examRes.value.assignedExams);
          }
          if (logRes.status === 'fulfilled' && logRes.value) {
            setActivityLog(logRes.value);
          }
          if (subsRes.status === 'fulfilled' && subsRes.value?.subscriptions) {
            setUnlockedModelPapers(subsRes.value.subscriptions);
          }
        }
      } catch (e) {
        // quiet ignore
      }
    })();
    return () => { isMounted = false; };
  }, [activeChild.id]);

  return (
    <div className="space-y-6 pb-12">

      {/* ── PARENT ASSIGNED EXAM BANNER (IF ANY) ────────────────────────── */}
      {assignedExams.length > 0 && (() => {
        const firstExam = assignedExams[0];
        const nowMs = Date.now();
        const isDueSet = !!firstExam.dueDate;
        const dueMs = isDueSet ? new Date(firstExam.dueDate!).getTime() : null;
        const isOverdue = isDueSet && dueMs !== null && dueMs < nowMs;
        const isDueSoon = isDueSet && dueMs !== null && dueMs >= nowMs && (dueMs - nowMs) <= 24 * 60 * 60 * 1000;

        return (
          <div className="rounded-3xl p-5 sm:p-6 text-stone-950 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-2 border-yellow-300 shadow-amber-500/10">
            <div className="flex items-start sm:items-center gap-3.5 z-10">
              <div className="w-12 h-12 rounded-2xl bg-stone-950/10 border border-stone-950/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
                {isOverdue ? '⚠️' : '📝'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-950/10 border border-stone-950/20 text-[11px] font-extrabold text-stone-900 tracking-wide">
                    <CalendarClock className="w-3.5 h-3.5 text-stone-950" />
                    <span>Parent Assigned Challenge ({assignedExams.length} Pending)</span>
                  </div>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950 text-yellow-400 text-[11px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                      ⚠️ Overdue
                    </span>
                  )}
                  {isDueSoon && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[11px] font-bold border border-stone-800">
                      ⏳ Due in 24 Hours
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-stone-950 mt-1">
                  {firstExam.subject} {firstExam.chapterTopic ? `— ${firstExam.chapterTopic}` : ''}
                </h3>
                <p className="text-xs text-stone-900 font-bold mt-0.5">
                  {firstExam.questionCount} Questions • {firstExam.timeLimitMinutes} Mins • {firstExam.difficulty.toUpperCase()}
                  {firstExam.dueDate ? ` • Due: ${new Date(firstExam.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}${new Date(firstExam.dueDate).getHours() !== 0 || new Date(firstExam.dueDate).getMinutes() !== 0
                      ? ` at ${new Date(firstExam.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : ''
                    }` : ''}
                  {firstExam.parentInstructions ? ` • "${firstExam.parentInstructions}"` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToArena}
              className="px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 z-10 hover:scale-105 bg-stone-950 hover:bg-stone-800 text-yellow-400 shadow-stone-900/20 active:scale-95"
            >
              <span>{isOverdue ? 'Complete Overdue Test' : 'Start Assigned Test'}</span>
              <ArrowRight className="w-4 h-4 text-yellow-400" />
            </button>
          </div>
        );
      })()}



      {/* ── 4 TOP METRIC CARDS (COMPACT PARENT-DASHBOARD MATCHING SIZE) ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: XP & Level (Amber/Yellow) */}
        <div
          onClick={onNavigateToGamification}
          className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-amber-400 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-1 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
              </div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Level {currentLevel}</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
              {getTierTitle(currentLevel)}
            </span>
          </div>
          <div className="relative z-10 mt-1">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{xp} <span className="text-xs font-bold text-stone-500">XP</span></p>
            <div className="mt-1.5 w-full bg-amber-200/70 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="text-[10px] font-semibold text-amber-800 mt-1 flex justify-between">
              <span>{Math.round(xpProgress)}% to Lvl {currentLevel + 1}</span>
            </p>
          </div>
        </div>


        {/* Card 2: Streak & Activity Log (Yellow/Black/Light Grey Theme) */}
        {(() => {
          const studentTotalExams = activityLog?.summary?.totalExams ?? studentExams.length;
          const studentTotalBreaks = activityLog?.summary?.totalMindBreaks ?? 0;
          const studentTotalActivities = studentTotalExams + studentTotalBreaks;
          const studentStudyMins = activityLog?.summary?.totalStudyMinutes ?? Math.round(studentExams.reduce((acc, e) => acc + (e.timeTakenSeconds || 0), 0) / 60);
          const studentStreak = activityLog?.summary?.currentStreakDays ?? streakDays;
          const studentExamRatio = studentTotalActivities > 0 ? (studentTotalExams / studentTotalActivities) * 100 : 100;
          const studentBreakRatio = studentTotalActivities > 0 ? (studentTotalBreaks / studentTotalActivities) * 100 : 0;

          return (
            <div
              onClick={() => {
                setIsActivityModalOpen(true);
                fetchStudentActivityLog();
              }}
              className="bg-gradient-to-br from-stone-50 via-white to-amber-50/40 p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-amber-400 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center justify-between mb-1 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 shadow-xs flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Activity Log</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs flex items-center gap-1">
                    🔥 {studentStreak}d Streak
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="relative z-10 mt-1">
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {studentTotalActivities} <span className="text-xs font-bold text-stone-500">Activities</span>
                </p>

                {/* Dual-Color Segmented Ratio Bar: Black (Study) vs Amber (Mind-Break) */}
                <div className="mt-2 w-full h-2 bg-stone-200/80 rounded-full overflow-hidden flex shadow-2xs">
                  {studentTotalActivities > 0 ? (
                    <>
                      <div
                        className="bg-stone-900 h-full transition-all duration-500"
                        style={{ width: `${studentExamRatio}%` }}
                        title={`${studentTotalExams} Tests (${Math.round(studentExamRatio)}%)`}
                      />
                      <div
                        className="bg-amber-400 h-full transition-all duration-500"
                        style={{ width: `${studentBreakRatio}%` }}
                        title={`${studentTotalBreaks} Breaks (${Math.round(studentBreakRatio)}%)`}
                      />
                    </>
                  ) : (
                    <div className="bg-stone-300 h-full w-full" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600 mt-1.5">
                  <span className="text-stone-900 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 inline-block"></span>
                    {studentTotalExams} {studentTotalExams === 1 ? 'Test' : 'Tests'} (~{studentStudyMins}m)
                  </span>
                  <span className="text-amber-800 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                    {studentTotalBreaks} {studentTotalBreaks === 1 ? 'Break' : 'Breaks'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Card 3: Overall Readiness / Accuracy (Yellow/Black Theme) */}
        <div className="bg-gradient-to-br from-stone-50 via-white to-amber-50/30 p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-amber-400 hover:scale-[1.01] transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-300 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-1 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 shadow-xs flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Accuracy</span>
            </div>
          </div>
          <div className="relative z-10 mt-1">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{accuracyPct}%</p>
            <p className="text-[10px] text-stone-500 font-semibold mt-1 truncate">
              {studentExams.length > 0
                ? `Based on ${studentExams.length} ${studentExams.length === 1 ? 'challenge' : 'challenges'}`
                : 'No challenges completed yet'}
            </p>
          </div>
        </div>

        {/* Card 4: Badges (Yellow/Black Theme) */}
        <div
          onClick={onNavigateToGamification}
          className="bg-gradient-to-br from-amber-50/60 via-stone-50 to-stone-100 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-amber-400 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-1 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Badges</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="relative z-10 mt-1">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{unlockedBadgesCount} <span className="text-xs font-bold text-stone-500">Unlocked</span></p>
            <p className="text-[10px] text-amber-800 font-bold mt-1 flex items-center gap-1">
              View Trophy Cabinet <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      {/* ── MIDDLE GRID: 2 ACTION CARDS (LEFT 2 COLS) + SUBJECT PIE CHART (RIGHT 1 COL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left 2 Cols: Quick Launch & Adaptive Learning Path Quest */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Active Diagnostic Launch Card */}
          <div className="flex-1 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base">
                    {isKid ? 'Fun Adventure Practice' : 'Quick Diagnostic Practice'}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {isKid
                      ? '5 Questions • 5 Marks • ~10 Minutes'
                      : ['Class 11', 'Class 12', 'NEET', 'IIT'].some(c => (activeChild.classGrade || '').includes(c))
                        ? '10 Questions • 20 Marks • ~25 Minutes'
                        : '10 Questions • 15 Marks • ~15 Minutes'}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-stone-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-700" /> Ready
              </span>
            </div>

            <div className="flex-1 rounded-2xl bg-stone-50 border border-stone-200/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Configured Target:</div>
                <div className="font-black text-stone-900 text-sm">
                  {activeChild.classGrade} &bull; {activeChild.curriculumBoard} (All Core Subjects)
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  Dynamically calibrates questions according to your previous strengths &amp; weak areas.
                </p>
              </div>
              <button
                onClick={onNavigateToArena}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isKid ? 'Start Adventure Quest' : 'Launch Challenge'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Adaptive Learning Path Quest */}
          <div className="flex-1 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-sm">
                  🧭
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base">Next in Adaptive Learning Path</h3>
                  <p className="text-xs text-stone-500 font-medium">Curriculum mastery sequence for your class</p>
                </div>
              </div>
              {/* <button
                onClick={onNavigateToLearningPath}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                View Full Path <ChevronRight className="w-3.5 h-3.5" />
              </button> */}
            </div>

            {nextRecommendedTopic ? (
              <div className="flex-1 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-stone-50 via-white to-amber-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-stone-900 border border-amber-200 text-[10px] font-black uppercase">
                    <span>{nextRecommendedTopic.subject}</span> &bull; <span>Node {nextRecommendedTopic.nodeId}</span>
                  </div>
                  <h4 className="font-black text-stone-900 text-sm sm:text-base">{nextRecommendedTopic.topicName}</h4>
                  <p className="text-xs text-stone-600 font-medium line-clamp-1">{nextRecommendedTopic.description}</p>
                </div>
                <button
                  onClick={onNavigateToLearningPath}
                  className="shrink-0 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 hover:text-stone-950 text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Continue Quest <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex-1 rounded-2xl bg-stone-50 border border-stone-200/60 p-4 sm:p-5 flex items-center justify-center text-center text-xs text-stone-500">
                <p>No active learning nodes yet. Take your first diagnostic exam to generate your personalized learning path!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Dynamic Subject Marks Distribution PieChart */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-500" />
                  Subject Performance
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Marks &amp; score distribution</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                {subjectMarksChartData.length} Subjects
              </span>
            </div>

            {subjectMarksChartData.length > 0 ? (
              <div className="mt-3">
                {/* Donut Chart */}
                <div className="h-44 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-stone-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-stone-800 space-y-1">
                                <p className="font-black text-yellow-400">{data.name}</p>
                                <p className="text-stone-300">
                                  Marks: <span className="font-bold text-white">{data.marksObtained}/{data.totalPossible}</span> ({data.accuracyPct}%)
                                </p>
                                <p className="text-[10px] text-stone-400 font-medium">
                                  {data.examsCount} {data.examsCount === 1 ? 'Exam' : 'Exams'} Taken
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={subjectMarksChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {subjectMarksChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-black text-stone-900">{totalSubjectMarks}</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Marks</span>
                  </div>
                </div>

                {/* Subject Legend & Accuracy Pill List */}
                <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {subjectMarksChartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-stone-800 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-stone-600 text-[11px]">{item.marksObtained} pts</span>
                        <span className="font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md text-[10px]">
                          {item.accuracyPct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-stone-400">
                <PieChartIcon className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p>No subject data yet.</p>
                <p className="text-[11px] text-stone-400 mt-1">Take a challenge to see your subject marks breakdown!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECOND VIEW: PROGRESS TREND & TOPIC DIAGNOSTICS ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Learning Progress Trend */}
        <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-black text-stone-900 text-base">Learning Progress Over Time</h3>
              <p className="text-xs text-stone-500 font-medium">Diagnostic accuracy trend</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeframe === 'week' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeframe === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentProgressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value;
                      return (
                        <div className="bg-stone-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg">
                          <p className="font-bold">{label}</p>
                          <p className="text-yellow-400 font-extrabold">{val !== null ? `${val}% Accuracy` : 'No challenges taken'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#studentProgressGrad)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Topic Mastery Diagnostics */}
        <div className="h-full">
          <div className="h-full rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Topic Mastery
                </h3>
                <span className="text-[10px] font-bold text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg">
                  Topic Insights
                </span>
              </div>

              {/* Strongest */}
              <div className="space-y-2">
                <div className="text-[11px] font-black text-stone-900 uppercase tracking-wider flex items-center gap-1">
                  <span>⭐</span> Strong Topics ({strongTopics.length})
                </div>
                {strongTopics.length > 0 ? (
                  <div className="space-y-1.5">
                    {strongTopics.map(({ topic }) => (
                      <div key={topic} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                        <span className="font-bold text-stone-800 truncate max-w-[160px]" title={topic}>{topic}</span>
                        <span className="text-[10px] font-bold text-stone-950 bg-amber-400 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                          🌟 Mastered
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">Take more tests to reveal your strongest topics.</p>
                )}
              </div>

              {/* Needs Attention */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="text-[11px] font-black text-stone-900 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>📌</span> Needs Revision ({weakTopics.length})
                  </span>
                  <span className="text-[9px] font-medium text-stone-400">Click to practice</span>
                </div>
                {weakTopics.length > 0 ? (
                  <div className="space-y-1.5">
                    {weakTopics.map(({ topic, score }) => {
                      const inferSubject = (topicName: string): Subject => {
                        const t = (topicName || '').toLowerCase();
                        if (/histor|civic|democra|geog|social|sst|govern|politic|map|judiciar/i.test(t)) return 'Social Studies';
                        if (/math|algebra|calculus|trigono|arithmetic|fraction|geometr|equation|probab|statistic|bodmas|number/i.test(t)) return 'Mathematics';
                        if (/python|oop|sql|data struct|algorithm|stack|queue|comput|code|cyber|network/i.test(t)) return 'Computer Science';
                        if (/chemi|reaction|kinetics|solution|acid|base|organic|polymer|electrochem|compound/i.test(t)) return 'Chemistry';
                        if (/physic|motion|force|optics|electric|magnet|gravity|light|sound|energy|thermodynam/i.test(t)) return 'Physics';
                        if (/bio|cell|plant|animal|reproduct|genetic|dna|organism|ecolog|evolut|human/i.test(t)) return 'Biology';
                        if (/gramm|tense|voice|idiom|speech|letter|clause|poem|liter|synonym|english/i.test(t)) return 'English';
                        if (/reason|analogy|series|pattern|logic|puzzle/i.test(t)) return 'Logical Reasoning';
                        return 'Science';
                      };

                      return (
                        <div
                          key={topic}
                          onClick={() => onNavigateToArena({ subject: inferSubject(topic), topic })}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-amber-50/80 border border-stone-200 hover:border-amber-300 text-xs transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                          title={`Click to start targeted remedial sprint on: ${topic}`}
                        >
                          <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                            <Target className="w-3.5 h-3.5 text-stone-700 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-stone-800 truncate">{topic}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                            {score >= 60 ? '📈 Practice' : '🎯 Sprint'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : strongTopics.length > 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-stone-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>All tested topics mastered! Keep it up!</span>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No major weak topics identified! Keep it up!</p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (weakTopics.length > 0) {
                  const targetTopic = weakTopics[0].topic;
                  const t = (targetTopic || '').toLowerCase();
                  let sub: Subject = 'Science';
                  if (/histor|civic|democra|geog|social|sst/i.test(t)) sub = 'Social Studies';
                  else if (/math|algebra|calculus|trigono|fraction|geometr|equation/i.test(t)) sub = 'Mathematics';
                  else if (/python|oop|sql|data struct|algorithm|comput/i.test(t)) sub = 'Computer Science';
                  else if (/chemi|reaction|kinetics|solution/i.test(t)) sub = 'Chemistry';
                  else if (/physic|motion|force|optics|electric/i.test(t)) sub = 'Physics';
                  else if (/bio|cell|plant|animal|genetic/i.test(t)) sub = 'Biology';
                  else if (/gramm|tense|voice|english/i.test(t)) sub = 'English';
                  onNavigateToArena({ subject: sub, topic: targetTopic });
                } else {
                  onNavigateToArena();
                }
              }}
              className="w-full mt-3 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-black rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              {weakTopics.length > 0 ? (
                <>
                  <Target className="w-4 h-4 text-stone-950" /> Improve Weak Areas ({weakTopics[0].topic.slice(0, 18)}...)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" /> Practice Next Challenge
                </>
              )}
            </button>
          </div>
        </div>
      </div>



      {/* ── RECENT CHALLENGES SECTION ────────────────────────────────────────── */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-black text-stone-900 text-base">Recent Diagnostic Challenges</h3>
            <p className="text-xs text-stone-500 font-medium">History of your latest tests and scores</p>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
            {studentExams.length} Total Submissions
          </span>
        </div>

        {studentExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {studentExams.slice(0, 4).map((sub) => {
              const subTotalMarks = sub.totalMarks || defaultTotalMarks;
              const scorePct = Math.round((sub.marksObtained / subTotalMarks) * 100);
              const dateStr = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={sub.id}
                  onClick={() => onViewSubmissionReport(sub)}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200/70 hover:border-amber-200 transition-all cursor-pointer shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                        {sub.subject || 'Diagnostic Exam'}
                      </div>
                      <div className="text-[10px] text-stone-400 font-medium">
                        {dateStr} &bull; {sub.examType || (isKid ? '5-Mark Adventure Quest' : '15-Mark Challenge')}
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${scorePct >= 75 ? 'bg-amber-400 text-stone-950 shadow-2xs' : scorePct >= 50 ? 'bg-stone-200 text-stone-900' : 'bg-stone-900 text-amber-300'}`}>
                      {scorePct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 text-xs">
                    <span className="font-bold text-stone-600">
                      Score: <strong className="text-stone-900">{sub.marksObtained}/{subTotalMarks}</strong>
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      View Report <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-stone-400">
            <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            No challenges taken yet. Take your first test to see detailed scores and reports!
          </div>
        )}
      </div>

      {/* ── STUDENT DAILY ACTIVITY & MIND-BREAK LOG MODAL ────────────────── */}
      {isActivityModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsActivityModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    My Learning & Mind-Break Log
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track your daily test sprints, Fun Zone breaks, and streak journey.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Metrics Chips */}
            {activityLog?.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 shrink-0">
                <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-center">
                  <p className="text-[10px] font-bold text-stone-900 uppercase tracking-wider">Active Streak</p>
                  <p className="text-lg font-black text-stone-950 mt-0.5">
                    🔥 {activityLog.summary.currentStreakDays} <span className="text-[10px] font-bold text-amber-800">Days</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-center">
                  <p className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">Tests Taken</p>
                  <p className="text-lg font-black text-stone-900 mt-0.5">
                    {activityLog.summary.totalExams} <span className="text-[10px] font-bold text-stone-600">sprints</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Mind-Breaks</p>
                  <p className="text-lg font-black text-amber-950 mt-0.5">
                    {activityLog.summary.totalMindBreaks} <span className="text-[10px] font-bold text-amber-700">played</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-stone-900 border border-stone-800 text-center text-white">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Study Time</p>
                  <p className="text-lg font-black text-white mt-0.5">
                    ~{activityLog.summary.totalStudyMinutes} <span className="text-[10px] font-bold text-amber-400">mins</span>
                  </p>
                </div>
              </div>
            )}

            {/* Daily Practice Streak Motivation Pill */}
            <div className="mb-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-300/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <span className="text-xs text-stone-900 font-semibold">
                  <strong>Daily Practice Streak:</strong> Practice every day to build learning momentum and unlock milestone badges!
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg shrink-0">
                {activityLog?.summary?.currentStreakDays ?? streakDays}d Active
              </span>
            </div>

            {/* Activity Feed Body */}
            <div className="overflow-y-auto hide-scrollbar space-y-3 flex-1 pr-1">
              {isLoadingActivity ? (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium">Loading your learning timeline...</p>
                </div>
              ) : !activityLog || activityLog.activities.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800">Start Your Learning Journey!</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Take a 10-mark diagnostic test or play a Fun Zone game to start logging your day-by-day progress.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {activityLog.activities.map((item) => {
                    const isExam = item.type === 'exam';
                    const isParentExam = item.type === 'parent_assigned_exam';
                    const isMindBreak = item.type === 'mind_break';
                    const isBadge = item.type === 'badge';

                    return (
                      <div key={item.id} className="relative group">
                        {/* Dot Icon on Vertical Line */}
                        <div className={`absolute -left-6 top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-xs ${isParentExam
                            ? 'bg-stone-900 text-amber-400'
                            : isExam
                              ? 'bg-amber-500 text-stone-950'
                              : isMindBreak
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-stone-700 text-amber-300'
                          }`}>
                          {isParentExam ? '🎯' : isExam ? '📝' : isMindBreak ? '🎮' : '🏆'}
                        </div>

                        {/* Card Item */}
                        <div className={`p-3.5 rounded-2xl border transition-all ${isParentExam
                            ? 'bg-stone-50 border-stone-300 hover:border-amber-400'
                            : isExam
                              ? 'bg-amber-50/40 border-amber-200/70 hover:border-amber-400'
                              : isMindBreak
                                ? 'bg-stone-50 border-amber-200/80 hover:border-amber-300'
                                : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                          }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${isParentExam
                                    ? 'bg-stone-900 text-amber-300'
                                    : isExam
                                      ? 'bg-amber-400 text-stone-950'
                                      : isMindBreak
                                        ? 'bg-amber-200 text-stone-900'
                                        : 'bg-stone-200 text-stone-800'
                                  }`}>
                                  {isParentExam
                                    ? 'Parent Assignment'
                                    : isExam
                                      ? 'Practice Test'
                                      : isMindBreak
                                        ? 'Fun Zone Mind-Break'
                                        : 'Milestone Badge'}
                                </span>
                                {item.subject && (
                                  <span className="text-[11px] font-semibold text-stone-600">
                                    • {item.subject}
                                  </span>
                                )}
                              </div>

                              <h5 className="text-xs sm:text-sm font-bold text-stone-900 mt-1">
                                {item.title}
                              </h5>
                              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>

                            {/* Right Side: Date/Time & Score/XP */}
                            <div className="text-right shrink-0">
                              <div className="text-[11px] font-bold text-stone-700">
                                {item.formattedTime}
                              </div>
                              <div className="text-[10px] font-medium text-stone-400">
                                {item.formattedDate}
                              </div>

                              <div className="flex items-center justify-end gap-1.5 mt-1.5 flex-wrap">
                                {item.scorePct !== undefined && item.scorePct !== null && (
                                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${item.scorePct >= 70
                                      ? 'bg-amber-400 text-stone-950 shadow-2xs'
                                      : item.scorePct >= 50
                                        ? 'bg-stone-200 text-stone-900'
                                        : 'bg-stone-900 text-amber-300'
                                    }`}>
                                    {item.marksObtained !== undefined && item.marksObtained !== null && item.totalMarks
                                      ? `${item.marksObtained}/${item.totalMarks}`
                                      : `${item.scorePct}%`}
                                  </span>
                                )}
                                {item.xpEarned > 0 && (
                                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                                    +{item.xpEarned} XP
                                  </span>
                                )}
                                {item.durationMinutes !== undefined && item.durationMinutes !== null && item.durationMinutes > 0 && (
                                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    {item.durationMinutes}m
                                  </span>
                                )}
                              </div>
                            </div>
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
      )}
    </div>
  );
};
