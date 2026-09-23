import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ParentAccount,
  ChildAccount,
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty,
  ExamSubmission
} from '../types';
import {
  Users,
  Plus,
  GraduationCap,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  Flame,
  Play,
  FileText,
  Edit3,
  Key,
  School,
  ExternalLink,
  ChevronRight,
  Zap,
  Lock,
  BarChart3,
  X,
  Activity,
  Gamepad2,
  Clock,
  Target,
  ShieldCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { calculateStudentMetrics } from '../utils/metricsEngine';
import ApiServices from '../services/ApiServices';
import { StudentActivityLogResponse } from '../types/api';

interface ParentDashboardProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect: (childId: string) => void;
  onLaunchExamForChild: (childId: string) => void;
  onOpenAddChildModal: () => void;
  onScheduleExam?: (config: { childId: string; subject: Subject; topic: string }) => void;
  examHistory?: ExamSubmission[];
  onViewSubmissionReport?: (submission: ExamSubmission) => void;
  onUpdateChild?: (updatedChild: ChildAccount) => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT', 'WBBSE', 'WBCHSE'];
const ALL_GRADES: ClassGrade[] = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parentAccount,
  activeChildId,
  onChildSelect,
  onLaunchExamForChild,
  onOpenAddChildModal,
  onScheduleExam,
  examHistory = [],
  onViewSubmissionReport,
  onUpdateChild,
}) => {
  const navigate = useNavigate();
  const [selectedChildForEdit, setSelectedChildForEdit] = useState<ChildAccount | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ChildAccount>>({});
  const [dynamicClasses, setDynamicClasses] = useState<string[]>(ALL_GRADES);
  const [dynamicBoards, setDynamicBoards] = useState<string[]>(BOARDS);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [activeModalMetric, setActiveModalMetric] = useState<'children' | 'progress' | 'readiness' | 'activity' | 'streak' | null>(null);
  const [activityLogData, setActivityLogData] = useState<StudentActivityLogResponse | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activitySelectedStudentId, setActivitySelectedStudentId] = useState<string | null>(activeChildId);

  // Fetch active Master dropdowns dynamically from database
  useEffect(() => {
    ApiServices.getBoardClassDropdown()
      .then((res: any) => {
        const fetchedClasses = res?.classes || res?.classGrades || res?.data?.classes || [];
        if (fetchedClasses.length > 0) {
          const names = fetchedClasses.map((c: any) => (typeof c === 'string' ? c : c.name || c.class_name)).filter(Boolean);
          if (names.length > 0) setDynamicClasses(names);
        }
        const fetchedBoards = res?.boards || res?.data?.boards || [];
        if (fetchedBoards.length > 0) {
          const bNames = fetchedBoards.map((b: any) => (typeof b === 'string' ? b : b.name || b.board_name)).filter(Boolean);
          if (bNames.length > 0) setDynamicBoards(bNames);
        }
      })
      .catch((err) => {
        console.warn('Failed to load active classes for parent dashboard:', err);
      });
  }, []);

  const fetchActivityLog = async (studentId?: string | number | null) => {
    setIsLoadingActivity(true);
    try {
      const res = await ApiServices.getStudentActivityLogs(studentId || undefined);
      if (res) {
        setActivityLogData(res);
      }
    } catch (e) {
      // quiet ignore
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    const targetId = activeChildId || parentAccount.children[0]?.id;
    if (targetId) {
      fetchActivityLog(targetId);
    }
  }, [activeChildId, parentAccount.children]);

  // Active child resolution
  const activeChild = useMemo(() => {
    return parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];
  }, [parentAccount.children, activeChildId]);

  const childrenMetrics = useMemo(() => {
    return parentAccount.children.map(child => ({
      child,
      ...calculateStudentMetrics(child, examHistory)
    }));
  }, [parentAccount.children, examHistory]);

  const totalChildren = parentAccount.children.length;
  const totalFamilyExams = examHistory.length;
  const hasData = totalChildren > 0;

  // Exact average of progress across all registered children
  const avgFamilyScoreVal = hasData
    ? (childrenMetrics.reduce((sum, cm) => sum + cm.scorePct, 0) / totalChildren)
    : 0;
  const avgFamilyScore = hasData ? `${avgFamilyScoreVal.toFixed(1)}%` : 'N/A';

  // Exact average of readiness across all registered children
  const overallReadinessVal = hasData
    ? Math.round(childrenMetrics.reduce((sum, cm) => sum + cm.readinessScore, 0) / totalChildren)
    : 0;
  const overallReadinessPct = hasData ? `${overallReadinessVal}%` : 'N/A';

  // Adaptive Smart Summary for Card 2: LEARNING PROGRESS
  const progressCardData = useMemo(() => {
    if (totalChildren === 0) {
      return {
        mainText: 'N/A',
        subText: 'No children added'
      };
    }
    if (totalChildren === 1) {
      const single = childrenMetrics[0];
      return {
        mainText: `${single.scorePct}%`,
        subText: single.child ? `${single.child.name}` : 'Individual Score'
      };
    }
    // Multiple children: Check if any child has low score (< 60%) or 0 exams
    const hasLowScore = childrenMetrics.some(cm => cm.scorePct < 60);
    return {
      mainText: hasLowScore ? '🟡 Needs Focus' : '🟢 On Track',
      subText: 'Tap to view child progress →'
    };
  }, [totalChildren, childrenMetrics]);

  // Adaptive Smart Summary for Card 3: EXAM READINESS
  const readinessCardData = useMemo(() => {
    if (totalChildren === 0) {
      return {
        mainText: 'N/A',
        subText: 'No children added'
      };
    }
    if (totalChildren === 1) {
      const single = childrenMetrics[0];
      return {
        mainText: `${single.readinessScore}%`,
        subText: single.child ? `${single.child.name}` : 'Individual Readiness'
      };
    }
    // Multiple children: All ready if every child has readinessScore >= 70 and has exams
    const allReady = childrenMetrics.every(cm => cm.readinessScore >= 70 && cm.totalExams > 0);
    return {
      mainText: allReady ? '🎯 Board Ready' : '⏳ In Preparation',
      subText: 'Tap for individual readiness →'
    };
  }, [totalChildren, childrenMetrics]);

  // Max Learning Streak across children
  const maxFamilyStreak = hasData
    ? childrenMetrics.reduce((max, cm) => Math.max(max, cm.streak), 0)
    : 0;
  const learningStreakText = hasData ? `${maxFamilyStreak} Day${maxFamilyStreak === 1 ? '' : 's'}` : 'N/A';
  const familyAccuracyPct = avgFamilyScoreVal;

  // Real-Time Weekly Delta calculation
  const now = useMemo(() => new Date().getTime(), []);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  const thisWeekExams = useMemo(() => {
    return examHistory.filter(e => new Date(e.submittedAt).getTime() >= sevenDaysAgo);
  }, [examHistory, sevenDaysAgo]);

  const prevWeekExams = useMemo(() => {
    return examHistory.filter(e => {
      const t = new Date(e.submittedAt).getTime();
      return t >= fourteenDaysAgo && t < sevenDaysAgo;
    });
  }, [examHistory, fourteenDaysAgo, sevenDaysAgo]);

  const { deltaText, deltaIsPositive } = useMemo(() => {
    if (thisWeekExams.length > 0 && prevWeekExams.length > 0) {
      const thisAvg = thisWeekExams.reduce((acc, e) => acc + (e.accuracyPercentage || ((e.marksObtained || 0) / (e.totalMarks || 15) * 100)), 0) / thisWeekExams.length;
      const prevAvg = prevWeekExams.reduce((acc, e) => acc + (e.accuracyPercentage || ((e.marksObtained || 0) / (e.totalMarks || 15) * 100)), 0) / prevWeekExams.length;
      const diff = Math.round(thisAvg - prevAvg);
      return {
        deltaText: `${diff >= 0 ? '↑ +' : '↓ '}${diff}% vs last week`,
        deltaIsPositive: diff >= 0
      };
    } else if (thisWeekExams.length > 0) {
      return { deltaText: '↑ +5% new diagnostic calibration', deltaIsPositive: true };
    } else if (totalFamilyExams > 0) {
      return { deltaText: 'Baseline calibrated across subjects', deltaIsPositive: true };
    } else {
      return { deltaText: 'Awaiting initial diagnostic test', deltaIsPositive: true };
    }
  }, [thisWeekExams, prevWeekExams, totalFamilyExams]);

  // AI Learning Speed Dynamic Benchmark
  const targetBoard = activeChild?.targetBoard || parentAccount.children[0]?.targetBoard || 'Board';
  const learningSpeedTier = familyAccuracyPct >= 80
    ? 'Accelerated'
    : familyAccuracyPct >= 60
      ? 'Steady'
      : totalFamilyExams > 0
        ? 'Emerging'
        : 'Calibrating';

  const benchmarkSubtitle = totalFamilyExams > 0
    ? `${familyAccuracyPct >= 80 ? 'Top 10%' : familyAccuracyPct >= 60 ? 'Top 25%' : 'Foundation'} benchmark in ${targetBoard}`
    : `Syllabus calibration ready for ${targetBoard}`;

  // Helper: Case-insensitive semantic classifier to map concepts/topics to their accurate Academic Subjects
  const resolveSubjectForTopic = (
    topicName: string,
    fallbackSubject: Subject = 'Science',
    classGrade?: string
  ): Subject => {
    const t = (topicName || '').toLowerCase().trim();
    const isPrimary = ['class 1', 'class 2', 'class 3', 'class 4', 'class 5', '1', '2', '3', '4', '5'].some(
      (c) => (classGrade || '').toLowerCase().includes(c)
    );

    if (
      t.includes('computer') || t.includes('code') || t.includes('coding') ||
      t.includes('python') || t.includes('java') || t.includes('algorithm') ||
      t.includes('software') || t.includes('database') || t.includes('sql') ||
      t.includes('programming') || t.includes('cyber') || t.includes('network') ||
      t.includes('binary')
    ) {
      return 'Computer Science';
    }

    if (
      t.includes('history') || t.includes('civic') || t.includes('geography') ||
      t.includes('political') || t.includes('social') || t.includes('economics') ||
      t.includes('resource') || t.includes('constitution') || t.includes('heritage') ||
      t.includes('democracy') || t.includes('election') || t.includes('governance') ||
      t.includes('judiciary') || t.includes('monument')
    ) {
      return 'Social Studies';
    }

    if (
      t.includes('english') || t.includes('grammar') || t.includes('reading') ||
      t.includes('comprehension') || t.includes('syntax') || t.includes('vocabulary') ||
      t.includes('composition') || t.includes('literature') || t.includes('prose') ||
      t.includes('poetry') || t.includes('essay') || t.includes('tense') ||
      t.includes('voice') || t.includes('speech') || t.includes('clause') ||
      t.includes('synonym') || t.includes('antonym')
    ) {
      return 'English';
    }

    if (
      t.includes('quadratic') || t.includes('polynomial') || t.includes('equation') ||
      t.includes('trig') || t.includes('arithmetic') || t.includes('algebra') ||
      t.includes('math') || t.includes('geometry') || t.includes('triangle') ||
      t.includes('circle') || t.includes('coordinate') || t.includes('calculus') ||
      t.includes('number') || t.includes('sign') || t.includes('numerical') ||
      t.includes('fraction') || t.includes('probability') || t.includes('statistics') ||
      t.includes('addition') || t.includes('subtraction') || t.includes('multiplication') ||
      t.includes('division') || t.includes('bodmas') || t.includes('percentage') ||
      t.includes('ratio') || t.includes('proportion') || t.includes('mensuration')
    ) {
      return 'Mathematics';
    }

    if (
      t.includes('pattern') || t.includes('series') || t.includes('logical') ||
      t.includes('reasoning') || t.includes('syllogism') || t.includes('puzzle') ||
      t.includes('spatial') || t.includes('analogy') || t.includes('blood relation') ||
      t.includes('direction sense')
    ) {
      return 'Logical Reasoning';
    }

    // Biology / Environmental / Animals / Plants / Nutrition keywords
    if (
      t.includes('herbivore') || t.includes('carnivore') || t.includes('omnivore') ||
      t.includes('animal') || t.includes('plant') || t.includes('food') ||
      t.includes('nutrition') || t.includes('diet') || t.includes('habitat') ||
      t.includes('ecosystem') || t.includes('living') || t.includes('organism') ||
      t.includes('cell') || t.includes('tissue') || t.includes('species') ||
      t.includes('reproduction') || t.includes('photosynthesis') || t.includes('respiration') ||
      t.includes('digestion') || t.includes('body') || t.includes('seed') ||
      t.includes('leaf') || t.includes('root') || t.includes('heredity') ||
      t.includes('evolution') || t.includes('ecology') || t.includes('microorganism') ||
      t.includes('bacteria') || t.includes('virus') || t.includes('fungi')
    ) {
      return isPrimary ? 'Science' : 'Biology';
    }

    // Chemistry keywords
    if (
      t.includes('chemical') || t.includes('reaction') || t.includes('acid') ||
      t.includes('base') || t.includes('salt') || t.includes('carbon') ||
      t.includes('periodic') || t.includes('metal') || t.includes('non-metal') ||
      t.includes('molecule') || t.includes('atom') || t.includes('chemistry') ||
      t.includes('compound') || t.includes('bonding') || t.includes('stoichiometry') ||
      t.includes('matter') || t.includes('state of matter') || t.includes('solution')
    ) {
      return isPrimary ? 'Science' : 'Chemistry';
    }

    // Physics keywords
    if (
      t.includes('optic') || t.includes('light') || t.includes('electric') ||
      t.includes('circuit') || t.includes('magnetic') || t.includes('magnet') ||
      t.includes('motion') || t.includes('force') || t.includes('gravity') ||
      t.includes('physics') || t.includes('energy') || t.includes('wave') ||
      t.includes('sound') || t.includes('thermo') || t.includes('heat') ||
      t.includes('current') || t.includes('ray') || t.includes('friction') ||
      t.includes('work') || t.includes('power') || t.includes('pressure')
    ) {
      return isPrimary ? 'Science' : 'Physics';
    }

    if (t.includes('science') || t.includes('evs') || t.includes('environmental') || t.includes('water') || t.includes('air') || t.includes('soil') || t.includes('weather') || t.includes('season') || t.includes('solar') || t.includes('planet')) {
      return 'Science';
    }

    return isPrimary ? 'Science' : fallbackSubject;
  };

  // Genesis Timestamp of the Parent Account / Learning Journey
  const genesisTimestamp = useMemo(() => {
    if (parentAccount?.createdAt) {
      const parsed = new Date(parentAccount.createdAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (examHistory.length > 0) {
      const earliest = Math.min(...examHistory.map(e => new Date(e.submittedAt).getTime()));
      return earliest;
    }
    return now - 86400000;
  }, [parentAccount?.createdAt, examHistory, now]);

  // Dynamic Evolutionary Progress Graph (Journey-Based from Joining Date & 7-Day Sprint Rhythm)
  const graphBars = useMemo(() => {
    const DAY_MS = 86400000;
    const WEEK_MS = 7 * 86400000;
    const MONTH_MS = 30 * 86400000;

    const calcAveragePct = (matching: ExamSubmission[]) => {
      if (matching.length === 0) return null;
      const totalPct = matching.reduce((acc, e) => {
        if (e.accuracyPercentage != null && e.accuracyPercentage > 0) {
          return acc + Number(e.accuracyPercentage);
        }
        const total = e.totalMarks || (['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (e.classGrade || '').includes(c)) ? 5 : 15);
        return acc + ((e.marksObtained || 0) / total) * 100;
      }, 0);
      return Math.round(totalPct / matching.length);
    };

    if (timeframe === 'day') {
      // Standard Academic Week Calendar: Monday to Sunday (Mon on left -> Sun on right)
      const nowObj = new Date(now);
      const currentDayOfWeek = nowObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ..., 6 = Sat
      const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

      const mondayMidnight = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate() - diffToMonday, 0, 0, 0, 0).getTime();
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      const days = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
        const start = mondayMidnight + dayOffset * DAY_MS;
        const end = start + DAY_MS;
        return { label: dayNames[dayOffset], start, end };
      });

      return days.map(d => {
        const matching = examHistory.filter(e => {
          const t = new Date(e.submittedAt).getTime();
          return t >= d.start && t < d.end;
        });
        return { label: d.label, pct: calcAveragePct(matching), count: matching.length };
      });
    } else if (timeframe === 'week') {
      const currentWeekIndex = Math.max(0, Math.floor((now - genesisTimestamp) / WEEK_MS));
      // Base week number for the 4-week window (starts at W1 for new users)
      const startWeekNumber = currentWeekIndex < 4 ? 1 : currentWeekIndex - 2;

      const weeks = [0, 1, 2, 3].map((offset) => {
        const weekNum = startWeekNumber + offset;
        const start = genesisTimestamp + (weekNum - 1) * WEEK_MS;
        const end = start + WEEK_MS;
        return { label: `W${weekNum}`, start, end };
      });

      return weeks.map(w => {
        const matching = examHistory.filter(e => {
          const t = new Date(e.submittedAt).getTime();
          return t >= w.start && t < w.end;
        });
        return { label: w.label, pct: calcAveragePct(matching), count: matching.length };
      });
    } else {
      const currentMonthIndex = Math.max(0, Math.floor((now - genesisTimestamp) / MONTH_MS));
      // Base month number for the 4-month window (starts at M1 for new users)
      const startMonthNumber = currentMonthIndex < 4 ? 1 : currentMonthIndex - 2;

      const months = [0, 1, 2, 3].map((offset) => {
        const monthNum = startMonthNumber + offset;
        const start = genesisTimestamp + (monthNum - 1) * MONTH_MS;
        const end = start + MONTH_MS;
        return { label: `M${monthNum}`, start, end };
      });

      return months.map(m => {
        const matching = examHistory.filter(e => {
          const t = new Date(e.submittedAt).getTime();
          return t >= m.start && t < m.end;
        });
        return { label: m.label, pct: calcAveragePct(matching), count: matching.length };
      });
    }
  }, [timeframe, examHistory, now, genesisTimestamp]);

  // Dynamic AI Observation Generator from Child topicMastery & Exam Analysis
  const activeTopicMastery = activeChild?.topicMastery || {};
  const masteryEntries = Object.entries(activeTopicMastery);

  const strongTopics = masteryEntries.filter(([, score]) => Number(score) >= 70).map(([t]) => t);
  const weakTopics = masteryEntries.filter(([, score]) => Number(score) < 65).map(([t]) => t);

  const aiObservationMessage = useMemo(() => {
    if (weakTopics.length > 0 && strongTopics.length > 0) {
      return `Students show high retention in ${strongTopics.slice(0, 2).join(' & ')}, but need targeted reinforcement in ${weakTopics.slice(0, 2).join(' & ')}. Grounded remedial modules are queued in the 10-mark arena.`;
    } else if (weakTopics.length > 0) {
      return `Targeted reinforcement needed in ${weakTopics.slice(0, 2).join(' & ')}. Adaptive practice is prioritized to eliminate concept misconceptions.`;
    } else if (strongTopics.length > 0) {
      return `High retention demonstrated across ${strongTopics.slice(0, 2).join(' & ')}! Ready for advanced HOTS and board diagnostic challenges.`;
    } else if (examHistory.length > 0 && examHistory[0].analysis) {
      const ana = examHistory[0].analysis;
      const str = ana.strengths?.[0] || 'Core concepts';
      const gap = ana.areasToImprove?.[0] || 'Foundational problem-solving';
      return `Diagnostic analysis indicates high retention in ${str}, with targeted remediation recommended in ${gap}.`;
    } else {
      return `EduJunction RAG engine is ready for ${activeChild?.name || 'your student'}. Launch a 10-mark diagnostic sprint to map their adaptive Knowledge Graph.`;
    }
  }, [weakTopics, strongTopics, examHistory, activeChild]);

  // Dynamic Student-Wise Recommendations for All Children in Parent Account
  const studentWiseRecommendations = useMemo(() => {
    const childrenList = parentAccount?.children || [];
    if (childrenList.length === 0) return [];

    const subjectIcon = (sub: Subject) => {
      switch (sub) {
        case 'Mathematics': return '🧮';
        case 'Physics': return '⚡';
        case 'Chemistry': return '🧪';
        case 'Biology': return '🧬';
        case 'Science': return '🔬';
        case 'Social Studies': return '🏛️';
        case 'English': return '📘';
        case 'Computer Science': return '💻';
        case 'Logical Reasoning': return '🧩';
        default: return '📝';
      }
    };

    return childrenList.map((child) => {
      const childSubs = examHistory.filter(
        (e) => e.studentId === child.id || (e as any).childId === child.id
      );
      const childMastery = child.topicMastery || {};
      const masteryEntries = Object.entries(childMastery).sort(
        (a, b) => Number(a[1]) - Number(b[1])
      );

      if (masteryEntries.length > 0 && Number(masteryEntries[0][1]) < 70) {
        const [weakTopic] = masteryEntries[0];
        const resolvedSub = resolveSubjectForTopic(weakTopic, 'Science', child.classGrade);
        const lastSub = childSubs.find(
          (s) => s.examTitle?.toLowerCase().includes(weakTopic.toLowerCase()) || s.subject === resolvedSub
        );
        const subScore = lastSub ? (lastSub.marksObtained ?? (lastSub as any).score) : undefined;
        const totalMarks = lastSub?.totalMarks || 15;
        const reason = subScore !== undefined
          ? `Scored ${subScore}/${totalMarks} in recent sprint • Needs remedial focus`
          : `Targeted remedial practice recommended for syllabus mastery`;

        return {
          childId: child.id,
          childName: child.name,
          avatar: child.avatar || '👦',
          classGrade: child.classGrade,
          targetBoard: child.targetBoard,
          subject: resolvedSub,
          topic: weakTopic,
          difficulty: 'medium' as ExamDifficulty,
          reason,
          icon: subjectIcon(resolvedSub),
        };
      }

      if (childSubs.length > 0) {
        const sortedByScore = [...childSubs].sort(
          (a, b) => {
            const scoreA = a.marksObtained ?? (a as any).score ?? 0;
            const scoreB = b.marksObtained ?? (b as any).score ?? 0;
            return (scoreA / (a.totalMarks || 1)) - (scoreB / (b.totalMarks || 1));
          }
        );
        const worstExam = sortedByScore[0];
        const resolvedSub = resolveSubjectForTopic(
          worstExam.examTitle,
          (worstExam.subject as Subject) || 'Science',
          child.classGrade
        );
        const worstScore = worstExam.marksObtained ?? (worstExam as any).score ?? 0;
        const totalM = worstExam.totalMarks || 15;
        const pct = Math.round((worstScore / totalM) * 100);

        return {
          childId: child.id,
          childName: child.name,
          avatar: child.avatar || '👦',
          classGrade: child.classGrade,
          targetBoard: child.targetBoard,
          subject: resolvedSub,
          topic: worstExam.examTitle,
          difficulty: (worstExam.difficulty || 'medium') as ExamDifficulty,
          reason: `Scored ${worstScore}/${totalM} (${pct}%) • Targeted practice suggested`,
          icon: subjectIcon(resolvedSub),
        };
      }

      // Default when no exams taken yet
      const defaultSub: Subject =
        child.classGrade?.includes('11') || child.classGrade?.includes('12')
          ? 'Physics'
          : 'Mathematics';
      return {
        childId: child.id,
        childName: child.name,
        avatar: child.avatar || '👦',
        classGrade: child.classGrade,
        targetBoard: child.targetBoard,
        subject: defaultSub,
        topic: 'Foundational Diagnostic Sprint',
        difficulty: 'simple' as ExamDifficulty,
        reason: 'No diagnostic exam taken yet • 10-mark sprint recommended',
        icon: subjectIcon(defaultSub),
      };
    });
  }, [parentAccount?.children, examHistory]);



  const handleStartEdit = (child: ChildAccount) => {
    setSelectedChildForEdit(child);
    setEditFormData({
      name: child.name,
      avatar: child.avatar,
      classGrade: child.classGrade,
      targetBoard: child.targetBoard,
      schoolName: child.schoolName || '',
      schoolEmail: child.schoolEmail || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildForEdit) return;
    try {
      await ApiServices.updateChild(selectedChildForEdit.id, editFormData);
    } catch (err) {
      console.warn('API update child returned error, syncing locally', err);
    }
    const updated: ChildAccount = {
      ...selectedChildForEdit,
      name: editFormData.name || selectedChildForEdit.name,
      avatar: editFormData.avatar || selectedChildForEdit.avatar,
      classGrade: editFormData.classGrade || selectedChildForEdit.classGrade,
      targetBoard: editFormData.targetBoard || selectedChildForEdit.targetBoard,
      schoolName: editFormData.schoolName,
      schoolEmail: editFormData.schoolEmail,
    };
    if (onUpdateChild) {
      onUpdateChild(updated);
    }
    setSelectedChildForEdit(null);
  };

  return (
    <div className="space-y-8 pb-10">

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: My Children (Yellow/Orange) */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-yellow-600" />
              </div>
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-wider">My Children</span>
            </div>
            <span className="text-[10px] font-bold bg-yellow-200/70 text-yellow-900 px-2 py-0.5 rounded-full border border-yellow-300/60 shadow-2xs">
              {totalChildren} Active
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className="text-2xl font-black text-stone-900">{totalChildren}</p>
              <p className="text-[10px] text-yellow-800 font-semibold mt-0.5">
                {totalChildren === 1 ? 'Registered Student' : 'Registered Students'}
              </p>
            </div>
            {/* Child Avatar Stack */}
            <div className="flex items-center -space-x-2 pb-0.5">
              {parentAccount.children.slice(0, 3).map((c, i) => (
                <div
                  key={c.id || i}
                  title={c.name}
                  className="w-7 h-7 rounded-full bg-white border-2 border-yellow-200 flex items-center justify-center text-xs shadow-xs"
                >
                  {c.avatar || '👦'}
                </div>
              ))}
              {totalChildren > 3 && (
                <div className="w-7 h-7 rounded-full bg-yellow-300 border-2 border-white flex items-center justify-center text-[10px] font-black text-yellow-950 shadow-xs">
                  +{totalChildren - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Overall Progress (Emerald/Teal - Clickable) */}
        <div
          onClick={() => setActiveModalMetric('progress')}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-emerald-400 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Progress</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="relative z-10">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{progressCardData.mainText}</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">{progressCardData.subText}</p>
          </div>
        </div>

        {/* Card 3: Exam Readiness (Blue/Indigo - Clickable) */}
        <div
          onClick={() => setActiveModalMetric('readiness')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-blue-400 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Readiness</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-blue-600/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="relative z-10">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{readinessCardData.mainText}</p>
            <p className="text-[10px] text-blue-700 font-semibold mt-0.5">{readinessCardData.subText}</p>
          </div>
        </div>

        {/* Card 4: Daily Activity & Focus Log (Indigo/Purple - Plan 1 Ratio Bar) */}
        {(() => {
          const parentTotalExams = activityLogData?.summary?.totalExams ?? totalFamilyExams;
          const parentTotalBreaks = activityLogData?.summary?.totalMindBreaks ?? 0;
          const parentTotalActivities = parentTotalExams + parentTotalBreaks;
          const parentStudyMins = activityLogData?.summary?.totalStudyMinutes ?? Math.round(examHistory.reduce((acc, e) => acc + (e.timeTakenSeconds || 0), 0) / 60);
          const parentStreak = activityLogData?.summary?.currentStreakDays ?? maxFamilyStreak;
          const parentExamRatio = parentTotalActivities > 0 ? (parentTotalExams / parentTotalActivities) * 100 : 100;
          const parentBreakRatio = parentTotalActivities > 0 ? (parentTotalBreaks / parentTotalActivities) * 100 : 0;

          return (
            <div
              onClick={() => {
                setActiveModalMetric('activity');
                const targetId = activeChildId || (parentAccount.children[0]?.id);
                setActivitySelectedStudentId(targetId || null);
                fetchActivityLog(targetId || undefined);
              }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-indigo-400 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center justify-between mb-1 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Activity Log</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-rose-200/70 text-rose-900 px-2 py-0.5 rounded-full border border-rose-300/60 shadow-2xs flex items-center gap-1">
                    🔥 {parentStreak}d Streak
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600/60 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="relative z-10 mt-1">
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {parentTotalActivities} <span className="text-xs font-bold text-stone-500">Activities</span>
                </p>

                {/* Dual-Color Segmented Ratio Bar: Indigo (Study) vs Amber (Mind-Break) */}
                <div className="mt-2 w-full h-2 bg-stone-200/70 rounded-full overflow-hidden flex shadow-2xs">
                  {parentTotalActivities > 0 ? (
                    <>
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500"
                        style={{ width: `${parentExamRatio}%` }}
                        title={`${parentTotalExams} Tests (${Math.round(parentExamRatio)}%)`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${parentBreakRatio}%` }}
                        title={`${parentTotalBreaks} Breaks (${Math.round(parentBreakRatio)}%)`}
                      />
                    </>
                  ) : (
                    <div className="bg-stone-300 h-full w-full" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600 mt-1.5">
                  <span className="text-indigo-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
                    {parentTotalExams} {parentTotalExams === 1 ? 'Test' : 'Tests'} (~{parentStudyMins}m)
                  </span>
                  <span className="text-amber-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                    {parentTotalBreaks} {parentTotalBreaks === 1 ? 'Break' : 'Breaks'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 2. MY CHILDREN SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-bold text-xl text-stone-900">My Children</h2>
            <p className="text-xs text-stone-500 font-medium">Track each child's learning journey.</p>
          </div>
          {parentAccount.children.length > 0 && (
            <button
              onClick={onOpenAddChildModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-xs font-black text-stone-900 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm border border-yellow-500/50"
            >
              <Plus className="w-4 h-4" />
              Add Child
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {parentAccount.children.length === 0 ? (
            <div className="col-span-1 lg:col-span-2 bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Users className="w-10 h-10 text-stone-300 mb-3" />
              <p className="font-bold text-stone-700">No Children Added Yet</p>
              <p className="text-sm text-stone-500 mt-1 mb-4">Add your children to start tracking their learning journey.</p>
              <button
                onClick={onOpenAddChildModal}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-xl transition-colors shadow-sm"
              >
                Add a Child
              </button>
            </div>
          ) : parentAccount.children.map((child) => {
            const isChildActive = activeChildId === child.id;
            const childMasteryEntries = Object.entries(child.topicMastery || {}).map(([t, v]) => ({ topic: t, score: Number(v) || 0 }));
            const strongList = childMasteryEntries.filter(m => m.score >= 70).sort((a, b) => b.score - a.score);
            const weakList = childMasteryEntries.filter(m => m.score < 70).sort((a, b) => a.score - b.score);
            const strongestTopic = strongList.length > 0 ? strongList[0].topic : (childMasteryEntries.length > 0 ? childMasteryEntries[0].topic : '—');
            const weakestTopic = weakList.length > 0 ? weakList[0].topic : (childMasteryEntries.length > 0 ? 'None (All Mastered)' : '—');

            return (
              <div
                key={child.id}
                className={`bg-white rounded-2xl border transition-all p-5 relative flex flex-col gap-4 overflow-hidden group ${isChildActive ? 'border-yellow-400 ring-4 ring-yellow-50 shadow-md' : 'border-stone-200 hover:border-stone-300 shadow-sm'
                  }`}
              >
                {/* Decorative blob */}
                <div className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors ${isChildActive ? 'bg-yellow-400 opacity-40' : 'bg-stone-300 group-hover:bg-yellow-300'}`}></div>

                {/* Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-3xl shadow-xs">
                      {child.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-stone-900">{child.name}</h4>
                      <p className="text-xs text-stone-500 font-medium mb-1">{child.classGrade} • {child.targetBoard}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(child);
                    }}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-yellow-100 text-stone-600 hover:text-yellow-800 transition-colors cursor-pointer"
                    title="Edit Child Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Indicators */}
                {(() => {
                  const cm = childrenMetrics.find(m => m.child.id === child.id) || calculateStudentMetrics(child, examHistory);
                  const latestExam = cm.latestExam;
                  return (
                    <div className="grid grid-cols-3 gap-4 border-y border-stone-100 py-4 relative z-10">
                      <div className="col-span-1">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Overall Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${cm.scorePct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-stone-800">{cm.scorePct}%</span>
                        </div>
                      </div>
                      <div className="col-span-1 text-center border-l border-stone-100 pl-4">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Exam Readiness</span>
                        <span className="text-sm font-bold text-stone-800">
                          {cm.totalExams > 0 ? `${cm.readinessScore}%` : '—'}
                        </span>
                      </div>
                      <div className="col-span-1 text-right border-l border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Latest Result</span>
                        <span className="text-sm font-bold text-stone-800">
                          {latestExam ? `${latestExam.marksObtained}/${latestExam.totalMarks}` : (cm.totalExams > 0 ? `${cm.scorePct}%` : '—')}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">Strongest</span>
                    <span className="font-semibold text-stone-800 truncate block">{strongestTopic}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">Needs Attention</span>
                    <span className="font-semibold text-stone-800 truncate block">{weakestTopic}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-1 pt-3 relative z-10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <Flame className="w-4 h-4" /> {child.streakDays || 0} Day Streak
                  </div>
                  <button
                    onClick={() => {
                      onChildSelect(child.id);
                      navigate('/children');
                    }}
                    className="text-xs font-bold text-yellow-600 hover:text-yellow-700 hover:underline flex items-center gap-1"
                  >
                    View Progress <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LEARNING PROGRESS */}
      <div id="learning-progress-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs mt-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
          <div>
            <h2 className="font-bold text-lg text-stone-900">Learning Progress</h2>
            <p className="text-xs text-stone-500 font-medium">See how your children's performance is changing over time.</p>
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${timeframe === 'week' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${timeframe === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          {!hasData ? (
            <div className="h-full w-full flex flex-col items-center justify-center bg-stone-50 rounded-xl border border-stone-200 border-dashed">
              <TrendingUp className="w-8 h-8 text-stone-300 mb-2" />
              <p className="text-stone-500 font-bold text-sm">No data available</p>
              <p className="text-stone-400 text-xs mt-1">Start learning to see progress charts</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphBars} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#b45309', fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPct)"
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                  connectNulls={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 5 & 6. RECENT RESULTS + NEXT STEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* Recent Results */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-10 group-hover:opacity-20 pointer-events-none transition-opacity"></div>
          <h2 className="font-bold text-base text-stone-900 mb-4 relative z-10">Recent Results</h2>
          <div className={`flex-1 space-y-3 relative z-10 ${examHistory.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {examHistory.length > 0 ? (
              examHistory.slice(0, 4).map((sub) => (
                <div key={sub.id} className="flex justify-between items-center p-3 rounded-xl border border-stone-100 bg-stone-50 hover:border-stone-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-900 mb-0.5">{sub.studentName}</span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {resolveSubjectForTopic(sub.examTitle)} • {sub.difficulty.charAt(0).toUpperCase() + sub.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-stone-900">
                      {sub.marksObtained}/{sub.totalMarks || (['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (sub.classGrade || '').includes(c)) ? 5 : 15)}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">{new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">No exams completed yet.</p>
            )}
          </div>
          {examHistory.length > 0 && (
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-yellow-600 hover:text-yellow-700 hover:underline flex items-center gap-1 cursor-pointer w-fit"
            >
              View All Results <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-10 group-hover:opacity-20 pointer-events-none transition-opacity"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="font-bold text-base text-stone-900">Recommended Next Steps</h2>
              <p className="text-[11px] text-stone-500 font-medium">Personalized recommendations per student</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200/60">
              {studentWiseRecommendations.length} {studentWiseRecommendations.length === 1 ? 'Student' : 'Students'}
            </span>
          </div>

          <div className={`flex-1 space-y-3 relative z-10 ${studentWiseRecommendations.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {studentWiseRecommendations.length > 0 ? (
              studentWiseRecommendations.map((rec) => (
                <div
                  key={rec.childId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-stone-100 bg-stone-50/80 hover:bg-white hover:border-yellow-200 hover:shadow-xs transition-all gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-lg shrink-0">
                      {rec.avatar}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-bold text-stone-900">
                          {rec.childName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold">
                          {rec.classGrade} • {rec.targetBoard}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5 truncate">
                        <span>{rec.icon}</span> Practice {rec.topic.length > 35 ? rec.topic.slice(0, 35) + '...' : rec.topic}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                        {rec.reason}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onScheduleExam) {
                        onScheduleExam({
                          childId: rec.childId,
                          subject: rec.subject,
                          topic: rec.topic === 'Foundational Diagnostic Sprint' ? '' : rec.topic
                        });
                      } else {
                        onChildSelect(rec.childId);
                        navigate('/schedule-exam');
                      }
                    }}
                    className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold text-[11px] shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title={`Schedule test for ${rec.childName}`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Assign Test
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">No recommendations available yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Edit Child Modal */}
      {selectedChildForEdit && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">Edit Child Sub-Account</h3>
            <p className="text-xs text-stone-500 mb-5">Update student class, target board, school name, and child login PIN</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Child Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Class / Grade</label>
                  <select
                    value={editFormData.classGrade}
                    onChange={(e) => setEditFormData({ ...editFormData, classGrade: e.target.value as ClassGrade })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                  >
                    {dynamicClasses.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Target Board</label>
                  <select
                    value={editFormData.targetBoard}
                    onChange={(e) => setEditFormData({ ...editFormData, targetBoard: e.target.value as Board })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                  >
                    {dynamicBoards.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">School Name (Optional)</label>
                <input
                  type="text"
                  value={editFormData.schoolName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School or St. Paul's"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">School Email (Optional)</label>
                <input
                  type="email"
                  value={editFormData.schoolEmail || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, schoolEmail: e.target.value })}
                  placeholder="e.g. principal@dpsdelhi.edu.in or school@domain.com"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedChildForEdit(null)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-yellow-400 text-stone-900 text-xs font-semibold hover:bg-yellow-700 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. STUDENT-WISE PROGRESS / READINESS / ACTIVITY MODAL */}
      {activeModalMetric && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveModalMetric(null)}
        >
          <div
            className={`bg-white rounded-3xl w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col ${activeModalMetric === 'activity' ? 'max-w-2xl max-h-[88vh] p-6' : 'max-w-lg p-6'
              }`}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${activeModalMetric === 'activity'
                    ? 'bg-indigo-100 text-indigo-800'
                    : activeModalMetric === 'progress'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeModalMetric === 'streak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                  {activeModalMetric === 'activity' ? (
                    <Activity className="w-5 h-5 text-indigo-600" />
                  ) : activeModalMetric === 'progress' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : activeModalMetric === 'streak' ? (
                    <Flame className="w-5 h-5" />
                  ) : (
                    <Award className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {activeModalMetric === 'activity'
                      ? 'Student Activity & Mind-Break Log'
                      : activeModalMetric === 'progress'
                        ? 'Student-Wise Overall Progress'
                        : activeModalMetric === 'streak'
                          ? 'Student-Wise Learning Streak'
                          : 'Student-Wise Exam Readiness'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {activeModalMetric === 'activity'
                      ? 'Chronological tracking of study tests, parent assignments, and Fun Zone breaks.'
                      : activeModalMetric === 'progress'
                        ? (totalChildren === 1
                          ? `Diagnostic learning progress for ${childrenMetrics[0]?.child.name || 'student'}.`
                          : `Individual learning progress for all ${totalChildren} children. Tap to view profile.`)
                        : activeModalMetric === 'streak'
                          ? (totalChildren === 1
                            ? `Daily learning streak and practice consistency for ${childrenMetrics[0]?.child.name || 'student'}.`
                            : `Individual daily learning streaks for all ${totalChildren} children. Tap to view profile.`)
                          : (totalChildren === 1
                            ? `Exam & board readiness evaluation for ${childrenMetrics[0]?.child.name || 'student'}.`
                            : `Individual exam readiness for all ${totalChildren} children. Tap to view profile.`)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalMetric(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ACTIVITY MODAL CONTENT */}
            {activeModalMetric === 'activity' ? (
              <div className="flex flex-col flex-1 min-h-0 pt-3">
                {/* Child Switcher Tabs if multiple children */}
                {parentAccount.children.length > 1 && (
                  <div className="flex items-center gap-2 pb-3 overflow-x-auto hide-scrollbar shrink-0">
                    {parentAccount.children.map((child) => {
                      const isSelected = (activitySelectedStudentId || activeChild?.id) === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActivitySelectedStudentId(child.id);
                            fetchActivityLog(child.id);
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${isSelected
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                          <span>{child.avatar || '👦'}</span>
                          <span>{child.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-500'
                            }`}>
                            {child.classGrade}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Summary Metrics Chips */}
                {activityLogData?.summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 shrink-0">
                    <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                      <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">Tests Taken</p>
                      <p className="text-lg font-black text-indigo-950 mt-0.5">
                        {activityLogData.summary.totalExams} <span className="text-[10px] font-bold text-indigo-600">sprints</span>
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Mind-Breaks</p>
                      <p className="text-lg font-black text-amber-950 mt-0.5">
                        {activityLogData.summary.totalMindBreaks} <span className="text-[10px] font-bold text-amber-600">played</span>
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Study Focus</p>
                      <p className="text-lg font-black text-emerald-950 mt-0.5">
                        ~{activityLogData.summary.totalStudyMinutes} <span className="text-[10px] font-bold text-emerald-600">mins</span>
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                      <p className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Streak & XP</p>
                      <p className="text-lg font-black text-rose-950 mt-0.5 flex items-center justify-center gap-1">
                        🔥 {activityLogData.summary.currentStreakDays}d <span className="text-[10px] font-bold text-amber-600">+{activityLogData.summary.totalXpEarned} XP</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Activity Feed Body */}
                <div className="overflow-y-auto hide-scrollbar space-y-3 flex-1 pr-1">
                  {isLoadingActivity ? (
                    <div className="py-12 text-center text-stone-400 space-y-2">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-medium">Loading student activity timeline...</p>
                    </div>
                  ) : !activityLogData || activityLogData.activities.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center text-xl">
                        ⏳
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-800">No Recorded Activities Yet</h4>
                        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                          When your child takes a 10-mark diagnostic sprint, completes a parent challenge, or takes a Fun Zone mind-break, their live day & time activity will show here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                      {activityLogData.activities.map((item) => {
                        const isExam = item.type === 'exam';
                        const isParentExam = item.type === 'parent_assigned_exam';
                        const isMindBreak = item.type === 'mind_break';
                        const isBadge = item.type === 'badge';

                        return (
                          <div key={item.id} className="relative group">
                            {/* Dot Icon on Vertical Line */}
                            <div className={`absolute -left-6 top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-xs ${isParentExam
                                ? 'bg-purple-600 text-white'
                                : isExam
                                  ? 'bg-blue-600 text-white'
                                  : isMindBreak
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-yellow-500 text-stone-900'
                              }`}>
                              {isParentExam ? '🎯' : isExam ? '📝' : isMindBreak ? '🎮' : '🏆'}
                            </div>

                            {/* Card Item */}
                            <div className={`p-3.5 rounded-2xl border transition-all ${isParentExam
                                ? 'bg-purple-50/40 border-purple-200/80 hover:border-purple-300'
                                : isExam
                                  ? 'bg-blue-50/30 border-blue-200/70 hover:border-blue-300'
                                  : isMindBreak
                                    ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                                    : 'bg-yellow-50/40 border-yellow-200/80 hover:border-yellow-300'
                              }`}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${isParentExam
                                        ? 'bg-purple-200/80 text-purple-900'
                                        : isExam
                                          ? 'bg-blue-200/80 text-blue-900'
                                          : isMindBreak
                                            ? 'bg-amber-200/80 text-amber-900'
                                            : 'bg-yellow-200/80 text-yellow-900'
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
                                    {item.difficulty && (
                                      <span className="text-[10px] font-medium text-stone-400 capitalize">
                                        ({item.difficulty})
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
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : item.scorePct >= 50
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
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
            ) : (
              /* PROGRESS / READINESS / STREAK MODAL BODY */
              <div className="overflow-y-auto hide-scrollbar my-4 space-y-3 max-h-[60vh]">
                {childrenMetrics.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs font-medium">
                    No children profiles found.
                  </div>
                ) : (
                  childrenMetrics.map(({ child, scorePct, readinessScore, latestExam }) => {
                    const isSelected = activeChildId === child.id;
                    return (
                      <div
                        key={child.id}
                        onClick={() => {
                          onChildSelect(child.id);
                          setActiveModalMetric(null);
                          if (activeModalMetric === 'progress') {
                            const el = document.getElementById('learning-progress-section');
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              navigate('/children');
                            }
                          } else if (activeModalMetric === 'streak') {
                            navigate('/children');
                          } else {
                            navigate('/reports');
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-md ${isSelected
                          ? 'border-yellow-400 bg-yellow-50/40'
                          : 'border-stone-200 bg-stone-50/70 hover:border-yellow-300 hover:bg-white'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                              {child.avatar || '👦'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-stone-900 group-hover:text-yellow-700 transition-colors truncate">
                                  {child.name}
                                </h4>
                              </div>
                              <p className="text-xs text-stone-500 font-medium">
                                {child.classGrade} • {child.targetBoard}
                              </p>
                              <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                                Login Username: <strong className="text-stone-700">{child.username || child.name.toLowerCase().replace(/\s+/g, '')}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Metric Value */}
                          <div className="text-right shrink-0">
                            {activeModalMetric === 'progress' ? (
                              <div>
                                <span className="text-lg font-black text-emerald-700">{scorePct}%</span>
                                <p className="text-[9px] text-stone-400 font-semibold">Individual Score</p>
                              </div>
                            ) : activeModalMetric === 'streak' ? (
                              <div>
                                <span className="text-lg font-black text-rose-600 flex items-center justify-end gap-1">
                                  <Flame className="w-4 h-4 fill-current text-rose-500" />
                                  {child.streakDays || 0} {(child.streakDays || 0) === 1 ? 'Day' : 'Days'}
                                </span>
                                <p className="text-[9px] text-stone-400 font-semibold">Active Streak</p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-lg font-black text-blue-700">{readinessScore}%</span>
                                <p className="text-[9px] text-stone-400 font-semibold">Exam Ready</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Visual Bar / Streak indicator */}
                        {activeModalMetric === 'streak' ? (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span>Consistency:</span>
                              <span className="font-bold text-rose-600">
                                {(child.streakDays || 0) >= 3 ? '🔥 Super Active' : (child.streakDays || 0) > 0 ? '🔥 On Track' : '⏳ Needs Practice Today'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                                const isActive = day <= Math.min(child.streakDays || 0, 7);
                                return (
                                  <span
                                    key={day}
                                    className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-rose-500 shadow-2xs scale-110' : 'bg-rose-200/80'
                                      }`}
                                    title={`Day ${day}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 mt-2">
                            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${activeModalMetric === 'progress' ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                style={{ width: `${Math.min(100, Math.max(0, activeModalMetric === 'progress' ? scorePct : readinessScore))}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                              <span>{activeModalMetric === 'progress' ? 'Diagnostic Accuracy' : 'Curriculum Readiness'}</span>
                              <span>
                                {activeModalMetric === 'progress' ? (
                                  <>Latest Result: <strong>{latestExam ? `${latestExam.marksObtained}/${latestExam.totalMarks || (['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (child.classGrade || '').includes(c)) ? 5 : 15)}` : (scorePct > 0 ? `${scorePct}%` : '—')}</strong></>
                                ) : (
                                  <>Status: <strong className={readinessScore >= 70 ? 'text-blue-700' : readinessScore > 0 ? 'text-amber-700' : 'text-stone-500'}>{readinessScore >= 70 ? 'Board Ready' : readinessScore > 0 ? 'In Preparation' : 'Calibrating'}</strong></>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};


