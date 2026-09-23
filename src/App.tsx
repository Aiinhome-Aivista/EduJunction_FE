import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ParentAccount,
  ChildAccount,
  ExamSubmission,
  AppPersona,
  LearningPathNode,
  Badge,
  LeaderboardEntry,
  TeacherContact,
  ParentTeacherMessage,
  SharedDossier,
  PTMSchedule,
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty,
  Exam,
} from './types';
import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle,
  FileText,
  Bell,
  Sparkles,
  ShieldCheck,
  Info,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  Play,
  Award,
  Layers,
  BarChart3,
  Menu,
  X,
  Clock,
  Compass,
  Trophy,
  MessageSquare,
  Flame,
  Zap,
  Share2,
  Smile,
  Gamepad2,
  LogOut,
  Loader2,
  CalendarClock,
  CheckCheck
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, PageAccess } from './components/Sidebar';
import { AIChatWidget } from './components/AIChatWidget2';
import { ExamArena } from './components/ExamArena';
import { KidsExamArena } from './components/KidsExamArena';
import { DiagnosticReport } from './components/DiagnosticReport';
import { ParentDashboard } from './components/ParentDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ChildrenPage } from './components/ChildrenPage';
import { ReportsPage } from './components/ReportsPage';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { BlogSection } from './components/BlogSection';
import { AboutSection } from './components/AboutSection';
import { LegalSection } from './components/LegalSection';
import { AddChildModal } from './components/AddChildModal';
import { AdaptiveLearningPath } from './components/AdaptiveLearningPath';
import { GamificationHub } from './components/GamificationHub';
import { ParentTeacherCommunication } from './components/ParentTeacherCommunication';
import { FunZone } from './components/FunZone';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { PublicDossierView } from './components/PublicDossierView';
import { ParentExamScheduler } from './components/ParentExamScheduler';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AppNotification } from './types/api';
import { calculateStudentMetrics } from './utils/metricsEngine';
import ApiServices, {
  getStoredTokens,
  clearTokens,
  decodeTokenPayload,
} from './services/ApiServices';

const getInitialPublicDossierToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname || '';
  if (pathname.includes('/share/dossier/')) {
    const parts = pathname.split('/share/dossier/');
    if (parts[1]) {
      const token = parts[1].split('/')[0].split('?')[0].split('#')[0].trim();
      if (token) return token;
    }
  }
  const params = new URLSearchParams(window.location.search);
  const qToken = params.get('dossier') || params.get('token') || params.get('shareToken');
  if (qToken) return qToken.trim();

  const hash = window.location.hash || '';
  if (hash.includes('dossier=')) {
    const match = hash.match(/dossier=([^&]+)/);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

export default function App() {
  // Public Shared Dossier Portal Router
  const [publicDossierToken, setPublicDossierToken] = useState<string | null>(getInitialPublicDossierToken);

  useEffect(() => {
    const onLocationChange = () => {
      setPublicDossierToken(getInitialPublicDossierToken());
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  // ------------------------------------------------------------
  // Auth bootstrap. Nothing about the account is hardcoded anymore —
  // this reads whatever tokens (if any) are already in sessionStorage and
  // decides whether to show LandingPage or the app shell.
  // ------------------------------------------------------------
  const [authRole, setAuthRole] = useState<string | null>(() => {
    const tokens = getStoredTokens();
    if (!tokens) return null;
    const payload = decodeTokenPayload(tokens.accessToken);
    return payload?.role ?? null;
  });
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [pageAccess, setPageAccess] = useState<PageAccess[]>([]);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // Navigation & View State
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.substring(1).split('/')[0] || 'dashboard';
  const setActiveTab = (tab: string) => {
    setActiveSubmissionReport(null);
    navigate('/' + tab);
  };
  const [activePersona, setActivePersona] = useState<AppPersona>('parent');
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [showChildAddedSuccess, setShowChildAddedSuccess] = useState(false);

  // Core Data State — all loaded from the backend, none of it seeded from mock data
  const [parentAccount, setParentAccount] = useState<ParentAccount | null>(null);
  const [examHistory, setExamHistory] = useState<ExamSubmission[]>([]);
  const [activeSubmissionReport, setActiveSubmissionReport] = useState<ExamSubmission | null>(null);

  // Automatically dismiss active report view whenever the route Junction changes via sidebar or navigation
  useEffect(() => {
    setActiveSubmissionReport(null);
  }, [location.pathname]);

  // Adaptive Learning, Gamification & PTC State
  const [learningNodes, setLearningNodes] = useState<LearningPathNode[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Modals & UI States
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showQuickTestChildModal, setShowQuickTestChildModal] = useState(false);
  const [isQuickTestLoading, setIsQuickTestLoading] = useState(false);
  const [preloadedExam, setPreloadedExam] = useState<Exam | null>(null);
  const [arenaPresetSubject, setArenaPresetSubject] = useState<Subject | undefined>(undefined);
  const [arenaPresetTopic, setArenaPresetTopic] = useState<string | undefined>(undefined);
  const [schedulerPresetSubject, setSchedulerPresetSubject] = useState<string | undefined>(undefined);
  const [schedulerPresetTopic, setSchedulerPresetTopic] = useState<string | undefined>(undefined);
  const personaMenuRef = useRef<HTMLDivElement>(null);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Enforce collapsed sidebar by default on persona/role changes
  useEffect(() => {
    setIsSidebarCollapsed(true);
  }, [authRole, activePersona]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Close Persona and Notification dropdown menus when clicking anywhere outside
  useEffect(() => {
    if (!showPersonaMenu && !showNotificationMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (showPersonaMenu && personaMenuRef.current && !personaMenuRef.current.contains(target)) {
        setShowPersonaMenu(false);
      }
      if (showNotificationMenu && notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setShowNotificationMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPersonaMenu, showNotificationMenu]);

  const normalizedRole = (authRole || '').toUpperCase();
  const isAdminSession = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';
  const isTeacherSession = normalizedRole === 'TEACHER';
  const isStudentSession = normalizedRole === 'STUDENT';
  const isParentSession = normalizedRole === 'PARENT';
  const activeChild = parentAccount?.children.find((c) => c.id === activeChildId) || parentAccount?.children[0];
  const isParentActive = !isStudentSession && activePersona === 'parent';
  const totalFamilyXP = parentAccount?.children.reduce((acc, c) => acc + (c.xp || 0), 0) || 0;
  const totalChildrenCount = parentAccount?.children.length || 0;

  // ------------------------------------------------------------
  // Data loading — 2-Phase approach for fast workspace display.
  // Phase 1 (Bootstrap): Minimal profile only → workspace shows immediately.
  // Phase 2 (Background): Full dashboard data loads quietly in background.
  // ------------------------------------------------------------

  // Phase 1: Fast minimal parent profile load (just enough to show workspace)
  const loadParentProfileOnly = useCallback(async () => {
    const [meData, permsData] = await Promise.all([
      ApiServices.getMe(),
      ApiServices.getMenuPermissions(),
    ]);
    const profile = meData?.profile || meData;
    const pageAccess = Array.isArray(permsData) ? permsData : (permsData?.permissions || []);
    // Set minimal parentAccount so workspace renders immediately
    setParentAccount({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: 'parent',
      children: [],
      createdAt: profile.createdAt,
    });
    setPageAccess(pageAccess);
    return pageAccess;
  }, []);

  // Phase 2: Full parent dashboard data in background (non-blocking)
  const loadParentAndChildren = useCallback(async () => {
    const dashboardData = await ApiServices.getParentDashboard();
    const { profile, children: enrichedChildren, recentExams, pageAccess } = dashboardData;

    setParentAccount({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: 'parent',
      children: enrichedChildren,
      createdAt: profile.createdAt,
    });
    setExamHistory(recentExams);
    setPageAccess(pageAccess);
    setActiveChildId((prev) => (prev || (enrichedChildren && enrichedChildren[0] ? enrichedChildren[0].id : null)));
    return pageAccess;
  }, []);

  // Phase 1: Fast minimal student profile load (just enough to show workspace)
  const loadStudentProfileOnly = useCallback(async () => {
    const [meData, permsData] = await Promise.all([
      ApiServices.getStudentMe(),
      ApiServices.getMenuPermissions(),
    ]);
    const profile = meData?.profile || meData;
    const pageAccess = Array.isArray(permsData) ? permsData : (permsData?.permissions || []);
    const studentChild: ChildAccount = {
      ...profile,
      recentExams: [],
    };
    setParentAccount({
      id: `student-parent-${profile.id}`,
      name: profile.name,
      email: profile.email || '',
      role: 'parent',
      children: [studentChild],
      createdAt: profile.createdAt || new Date().toISOString(),
    });
    setActiveChildId(profile.id);
    setActivePersona('child');
    setPageAccess(pageAccess);
    return pageAccess;
  }, []);

  // Phase 2: Full student dashboard data in background (non-blocking)
  const loadStudentData = useCallback(async () => {
    const dashboardData = await ApiServices.getStudentDashboard();
    const { profile, recentExams, learningPath, pageAccess } = dashboardData;

    const studentChild: ChildAccount = {
      ...profile,
      recentExams: recentExams || []
    };

    setParentAccount({
      id: `student-parent-${profile.id}`,
      name: profile.name,
      email: profile.email || '',
      role: 'parent',
      children: [studentChild],
      createdAt: profile.createdAt || new Date().toISOString(),
    });
    setExamHistory(recentExams || []);
    setPageAccess(pageAccess || []);
    setActiveChildId(profile.id);
    setActivePersona('child');
    if (learningPath) {
      setLearningNodes(learningPath);
    }
    return pageAccess || [];
  }, []);

  const loadGamification = useCallback(async () => {
    const [badgeList, leaderboardList] = await Promise.all([
      ApiServices.listBadges(),
      ApiServices.leaderboard('all_time'),
    ]);
    setBadges(badgeList);
    setLeaderboard(
      leaderboardList.map((entry: LeaderboardEntry) => ({
        ...entry,
        isCurrentStudent: entry.studentId === activeChildId,
      }))
    );
  }, [activeChildId]);

  const loadLearningPath = useCallback(async (childId: string) => {
    if (isStudentSession) {
      const nodes = await ApiServices.getStudentLearningPath();
      setLearningNodes(nodes);
    } else {
      const nodes = await ApiServices.getChildLearningPath(childId);
      setLearningNodes(nodes);
    }
  }, [isStudentSession]);

  const fetchNotifications = useCallback(async () => {
    if (!authRole) return;
    try {
      const res = await ApiServices.getNotifications();
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadNotifCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Quietly ignore network/auth errors on background poll
    }
  }, [authRole]);

  // Real-Time Notification Polling (Optimized: every 60 seconds lightweight check)
  useEffect(() => {
    if (!authRole) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [authRole, fetchNotifications]);

  const handleMarkNotificationRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await ApiServices.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await ApiServices.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      handleMarkNotificationRead(notif.id);
    }
    setShowNotificationMenu(false);

    const isSubmitted = notif.type === 'EXAM_SUBMITTED' || notif.type === 'SCHEDULED_EXAM_COMPLETED' || notif.metadata?.status === 'SUBMITTED';

    if (notif.type === 'MODEL_EXAM_ASSIGNED' || notif.metadata?.type === 'MODEL_EXAM') {
      if (notif.actionUrl) {
        window.location.href = notif.actionUrl;
      } else if (notif.metadata?.subscriptionId) {
        window.location.href = `/model-exam/${notif.metadata.subscriptionId}`;
      } else {
        setActiveTab('pricing');
      }
      return;
    }

    if (notif.type === 'EXAM_ASSIGNED' && !isSubmitted) {
      setActiveTab('arena');
      return;
    }

    if (isSubmitted || notif.metadata?.submissionId || notif.metadata?.examId) {
      // 1. If child specified, activate that child
      if (notif.metadata?.studentId) {
        setActiveChildId(String(notif.metadata.studentId));
      }

      // 2. Refresh parent data in background to ensure latest examHistory is up to date
      if (authRole === 'parent') {
        loadParentAndChildren().catch(() => { });
      }

      // 3. Search in examHistory
      let found: ExamSubmission | null = null;
      if (examHistory && examHistory.length > 0) {
        found = examHistory.find(e =>
          (notif.metadata?.submissionId && (e.id === notif.metadata.submissionId || e.id === String(notif.metadata.submissionId))) ||
          (notif.metadata?.examId && (e.examId === notif.metadata.examId || e.id === notif.metadata.examId)) ||
          (e.subject === notif.metadata?.subject && String(e.studentId) === String(notif.metadata?.studentId))
        ) || null;
      }

      // 4. Search in parentAccount.children.recentExams
      if (!found && parentAccount?.children) {
        for (const child of parentAccount.children) {
          if (child.recentExams) {
            const m = child.recentExams.find((e: any) =>
              (notif.metadata?.submissionId && (e.id === notif.metadata.submissionId || e.id === String(notif.metadata.submissionId))) ||
              (notif.metadata?.examId && (e.examId === notif.metadata.examId || e.id === notif.metadata.examId)) ||
              (e.subject === notif.metadata?.subject && String(e.studentId) === String(notif.metadata?.studentId))
            );
            if (m) {
              found = m;
              break;
            }
          }
        }
      }

      // 5. Construct complete fallback submission if metadata exists
      if (!found && notif.metadata) {
        const meta = notif.metadata;
        const marksObtained = meta.marksObtained !== undefined ? Number(meta.marksObtained) : 0;
        const totalMarks = meta.totalMarks !== undefined ? Number(meta.totalMarks) : 10;
        const accuracy = meta.accuracy !== undefined ? Number(meta.accuracy) : Math.round((marksObtained / (totalMarks || 1)) * 100);
        const studentName = meta.studentName || 'Student';
        const subjectName = meta.subject || 'Science';

        const matchingChild = parentAccount?.children.find(c => String(c.id) === String(meta.studentId));

        found = {
          id: meta.submissionId || `sub-${notif.id}`,
          examId: meta.examId || `exam-${notif.id}`,
          examTitle: `${studentName}'s ${subjectName} Assessment`,
          studentId: String(meta.studentId || ''),
          studentName: studentName,
          board: (matchingChild?.targetBoard as any) || 'CBSE',
          classGrade: (matchingChild?.classGrade as any) || 'Class 8',
          subject: subjectName as any,
          difficulty: 'medium' as any,
          answers: {},
          marksObtained,
          totalMarks,
          accuracyPercentage: accuracy,
          timeTakenSeconds: 600,
          submittedAt: notif.createdAt || new Date().toISOString(),
          evaluations: [],
          analysis: {
            overallBand: accuracy >= 80 ? 'Master' : accuracy >= 60 ? 'Proficient' : 'Developing',
            masteryScorePercentage: accuracy,
            strengths: [`Consistent conceptual understanding in ${subjectName} curriculum topics.`],
            areasToImprove: ['Timed speed and confidence on high-order questions.'],
            kGraphInsights: [],
            evolutionaryRoadmap: `Continue personalized practice in ${subjectName} to reinforce mastery.`,
            encouragementNote: `Exam completed with ${accuracy}% score!`,
            recommendedNextExam: {
              board: (matchingChild?.targetBoard as any) || 'CBSE',
              classGrade: (matchingChild?.classGrade as any) || 'Class 8',
              subject: subjectName as any,
              difficulty: 'medium' as any,
              reason: 'Diagnostic continuity.',
            },
            curatedStudyLinks: []
          }
        };
      }

      if (found) {
        handleOpenSubmissionReport(found);
      }
      setActiveTab('reports');
      return;
    }

    if (notif.actionUrl) {
      const cleanUrl = notif.actionUrl.startsWith('/') ? notif.actionUrl.substring(1) : notif.actionUrl;
      setActiveTab(cleanUrl);
    }
  };

  const handleOpenSubmissionReport = useCallback(async (sub: ExamSubmission) => {
    setActiveSubmissionReport(sub);
    if ((!sub.evaluations || sub.evaluations.length === 0) && sub.id) {
      try {
        const fullReport = await ApiServices.getExamSubmission(sub.id);
        if (fullReport) {
          setActiveSubmissionReport((prev) => (prev?.id === sub.id ? { ...prev, ...fullReport } : prev));
        }
      } catch (err) {
        console.warn('Could not fetch full submission details:', err);
      }
    }
  }, []);



  // 2-Phase Bootstrap:
  // Phase 1 — Fast: Load minimal profile only → workspace renders immediately (no more long spinner)
  // Phase 2 — Background: Load full dashboard data silently after workspace is visible
  // Bootstrap data loading on auth role change
  useEffect(() => {
    if (!authRole) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsBootstrapping(true);
      setBootstrapError(null);
      try {
        const isRoot = location.pathname === '/' || location.pathname === '';
        if (isAdminSession) {
          // Admin: menu perms
          const perms = await ApiServices.getMenuPermissions();
          if (!cancelled) {
            setPageAccess(perms);
            const isPermitted = perms.some((p: PageAccess) => p.pageRoute === location.pathname);
            if ((isRoot || !isPermitted) && perms.length > 0) navigate(perms[0].pageRoute, { replace: true });
          }
        } else if (isTeacherSession) {
          // Teacher: menu perms
          const perms = await ApiServices.getMenuPermissions();
          if (!cancelled) {
            setPageAccess(perms);
            const isPermitted = perms.some((p: PageAccess) => p.pageRoute === location.pathname);
            if ((isRoot || !isPermitted) && perms.length > 0) navigate(perms[0].pageRoute, { replace: true });
          }
        } else if (isStudentSession) {
          // Student: load full student dashboard data before showing workspace
          const perms = await loadStudentData();
          if (!cancelled) {
            const isPermitted = perms.some((p: PageAccess) => p.pageRoute === location.pathname);
            if ((isRoot || !isPermitted) && perms.length > 0) navigate(perms[0].pageRoute, { replace: true });
          }
        } else if (isParentSession) {
          // Parent: load full parent dashboard data + children before showing workspace
          const perms = await loadParentAndChildren();
          if (!cancelled) {
            const isPermitted = perms.some((p: PageAccess) => p.pageRoute === location.pathname);
            if ((isRoot || !isPermitted) && perms.length > 0) navigate(perms[0].pageRoute, { replace: true });
          }
        } else {
          clearTokens();
          setAuthRole(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          const isAuthError =
            err?.status === 401 ||
            err?.statusCode === 401 ||
            err?.code === 'TOKEN_EXPIRED' ||
            err?.code === 'TOKEN_INVALID' ||
            err?.code === 'UNAUTHORIZED' ||
            (typeof err?.message === 'string' && (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')));

          if (isAuthError) {
            clearTokens();
            setAuthRole(null);
            setBootstrapError(null);
          } else {
            const message = err?.message || 'Could not load your account. Please try logging in again.';
            setBootstrapError(message);
          }
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authRole, isAdminSession, isTeacherSession, isStudentSession, isParentSession, loadParentAndChildren, loadStudentData]);

  // On-demand gamification loading (Only calls API when user navigates to Leaderboard/Gamification)
  useEffect(() => {
    if (activeTab === 'gamification') {
      loadGamification();
    }
  }, [activeTab, loadGamification]);

  // On-demand learning path loading (Only calls API when user navigates to Learning Path)
  useEffect(() => {
    if (activeTab === 'learning-path' && activeChild) {
      loadLearningPath(activeChild.id);
    }
  }, [activeTab, activeChild?.id, loadLearningPath]);

  // ------------------------------------------------------------
  // Auth handlers
  // ------------------------------------------------------------
  const handleAuthenticated = (role: string) => {
    setBootstrapError(null);
    setIsBootstrapping(true);
    const upperRole = role.toUpperCase();
    setAuthRole(upperRole);
    setAuthModalMode(null);
    setIsSidebarCollapsed(true);
    if (upperRole === 'PARENT') {
      navigate('/dashboard', { replace: true });
    } else if (upperRole === 'STUDENT') {
      navigate('/dashboard', { replace: true });
    } else if (upperRole === 'TEACHER') {
      navigate('/dashboard', { replace: true });
    } else if (upperRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  const handleLogout = async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens) await ApiServices.logout({ refreshToken: tokens.refreshToken });
    } catch {
      // best-effort — clear local state regardless
    }
    clearTokens();
    setAuthRole(null);
    setAuthModalMode(null);
    setParentAccount(null);
    setActiveChildId(null);
    setExamHistory([]);
    setShowPersonaMenu(false);
    navigate('/', { replace: true });
  };

  // Persona Handlers
  const handleSwitchToParent = () => {
    if (isStudentSession) return;
    setActivePersona('parent');
    setActiveTab('dashboard');
    setShowPersonaMenu(false);
  };

  const handleSwitchToChild = (childId: string) => {
    const target = parentAccount?.children.find((c) => c.id === childId);
    if (!target) return;
    setActiveChildId(childId);
    setShowPersonaMenu(false);
  };

  // Exam submission is now handled server-side by ExamArena's call to
  // POST /exams/{id}/submit (XP, badges, mastery, learning Junction, streak,
  // average score are all computed by the backend — see
  // helper/gamification_engine.py, helper/mastery_engine.py, etc.). This
  // handler's job shrinks to: show the report, then resync from the server
  // so the dashboard/gamification/learning-Junction views reflect what changed.
  const handleExamComplete = async (submission: ExamSubmission) => {
    setExamHistory((prev) => [submission, ...prev]);
    setActiveSubmissionReport(submission);

    try {
      if (isStudentSession) {
        await loadStudentData();
      } else {
        await loadParentAndChildren();
      }
      await loadGamification();
      if (activeChildId) await loadLearningPath(activeChildId);
      fetchNotifications().catch(() => { });
    } catch {
      // Non-fatal — the report itself already rendered from the submit
      // response; a stale sidebar stat will self-correct on next navigation.
    }
  };

  const handleLaunchTopicExam = (_config: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    topic: string;
  }) => {
    setActiveTab('arena');
  };

  // Retake or jump to next exam
  const handleRetakeOrNextExam = () => {
    setActiveSubmissionReport(null);
    setActiveTab('arena');
  };


  // Add child
  const handleAddChild = async (
    childData: {
      name: string;
      username: string;
      avatar?: string;
      classGrade: string;
      targetBoard: string;
      schoolName?: string;
      schoolEmail?: string;
      password?: string;
    }
  ) => {
    const created = await ApiServices.addChild({
      name: childData.name,
      username: childData.username,
      avatar: childData.avatar || '👦',
      classGrade: childData.classGrade,
      targetBoard: childData.targetBoard,
      schoolName: childData.schoolName,
      schoolEmail: childData.schoolEmail,
      password: childData.password,
    });
    setParentAccount((prev) => (prev ? { ...prev, children: [...prev.children, { ...created, topicMastery: {} }] } : prev));
    setActiveChildId(created.id);
    setShowChildAddedSuccess(true);
  };

  // Update child
  const handleUpdateChild = async (updatedChild: ChildAccount) => {
    const saved = await ApiServices.updateChild(updatedChild.id, {
      name: updatedChild.name,
      avatar: updatedChild.avatar,
      classGrade: updatedChild.classGrade,
      targetBoard: updatedChild.targetBoard,
      schoolName: updatedChild.schoolName,
      schoolEmail: updatedChild.schoolEmail,
    });
    setParentAccount((prev) =>
      prev
        ? { ...prev, children: prev.children.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)) }
        : prev
    );
  };

  // Award XP from Fun Zone Games & Brain Breaks — server-validated & capped
  // (see controller/gamification_controller.py:award_xp_route).
  const handleAwardXP = async (amount: number, reason: string) => {
    if (!activeChildId) return;
    const { xp, level } = await ApiServices.awardXp({ studentId: activeChildId, amount, reason });
    setParentAccount((prev) =>
      prev
        ? { ...prev, children: prev.children.map((c) => (c.id === activeChildId ? { ...c, xp, level } : c)) }
        : prev
    );
    loadGamification().catch(() => { });
  };

  // Launch Quick Test from Database for a specific student
  const handleLaunchQuickTest = async (childId: string) => {
    try {
      setIsQuickTestLoading(true);
      setShowQuickTestChildModal(false);
      const res = await ApiServices.generateQuickTest(childId, 10);
      const exam = res?.exam || res?.data?.exam || (res?.questions ? res : null);
      if (exam) {
        setPreloadedExam(exam);
        setActiveChildId(childId);
        setActiveTab('arena');
      } else {
        console.error('Unexpected quick test response structure:', res);
        alert('Could not load diagnostic exam from database response.');
      }
    } catch (err: any) {
      console.error('Failed to generate quick test:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to generate diagnostic quick test from database.');
    } finally {
      setIsQuickTestLoading(false);
    }
  };

  const handleStartQuickTestClick = () => {
    if (!parentAccount || !parentAccount.children || parentAccount.children.length === 0) return;
    if (parentAccount.children.length === 1) {
      handleLaunchQuickTest(parentAccount.children[0].id);
    } else {
      setShowQuickTestChildModal(true);
    }
  };

  const getPageTitle = () => {
    if (activeSubmissionReport) return 'Diagnostic Dossier & Analysis';
    switch (activeTab) {
      case 'dashboard': return isParentActive ? 'Parent Dashboard' : `${activeChild?.name}'s Study Dashboard`;
      case 'arena': return ['Class 1', 'Class 2', 'Class 3', 'Class 4'].includes(activeChild?.classGrade || '') ? 'Kids Magic Exam Arena ✨' : '10-Mark Diagnostic Exam Arena';
      case 'learning-path': return 'Adaptive Learning Paths & RAG Knowledge Engine';
      case 'gamification': return 'Academic Leaderboard & Badge Hall of Fame';
      case 'ptc': return 'Parent-Teacher Communication & Dossier Bridge';
      case 'fun-zone': return 'Brain Breaks, Anecdotes & Speed Games Arcade';
      case 'pricing': return 'Subscription & Plan Management';
      case 'admin': return 'Super Admin & RAG Runbook Engine';
      case 'blog': return 'Curriculum Taxonomy & Pedagogical Blog';
      case 'about': return 'About EduJunction & RAG Intelligence';
      case 'legal': return 'Academic Policies & Disclaimers';
      default: return 'EduJunction Workspace';
    }
  };

  // ------------------------------------------------------------
  // Render Public Academic Dossier (Zero login required for educators)
  // ------------------------------------------------------------
  if (publicDossierToken) {
    return (
      <PublicDossierView
        shareToken={publicDossierToken}
        onExit={() => {
          window.history.pushState({}, '', '/');
          setPublicDossierToken(null);
        }}
      />
    );
  }

  // ------------------------------------------------------------
  // Render: If not logged in, show the LandingPage. If the visitor
  // clicks Login/Sign Up, show the LoginPage modal. Once authenticated,
  // bootstrap the app shell.
  // ------------------------------------------------------------
  if (!authRole) {
    return (
      <div className="relative w-full h-full min-h-screen overflow-x-hidden">
        {/* Main Landing Page */}
        <LandingPage
          onOpenAuth={(mode) => setAuthModalMode(mode || 'login')}
        />

        {/* Slide-over panel for LoginPage */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${authModalMode ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {authModalMode && (
            <LoginPage
              onAuthenticated={handleAuthenticated}
              initialMode={authModalMode}
              onClose={() => setAuthModalMode(null)}
            />
          )}
        </div>

        {/* Backdrop */}
        {authModalMode && (
          <div
            className="fixed inset-0 bg-stone-900/50 z-40 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setAuthModalMode(null)}
          />
        )}
      </div>
    );
  }

  if (isBootstrapping) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-50/90 backdrop-blur-xs px-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-xl shadow-yellow-400/30 animate-bounce">
              <GraduationCap size={32} />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl bg-yellow-400/30 blur-md -z-10 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="text-xl font-black tracking-tight">
              <span className="text-stone-900">Edu</span><span className="text-yellow-500">Junction</span>
            </div>
            <p className="text-xs font-semibold text-stone-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-600" />
              <span>Loading your personalized dashboard...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-stone-700">{bootstrapError}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // Admin-only session: render just the SuperAdminPanel — there's no
  // "family" for an ADMIN/SUPER_ADMIN account to show a parent dashboard for.
  if (isAdminSession) {
    return (
      <div className="min-h-screen w-full bg-stone-50 flex flex-col">
        <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-stone-900">EduJunction — Admin Console</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <SuperAdminPanel
            parentAccount={{
              id: '', name: 'Admin', email: '', role: 'parent',
              children: [], createdAt: '',
            }}
          />
        </div>
        {/* Floating AI Chat Widget */}
        <AIChatWidget activeChild={activeChild} isStudent={false} role="admin" />
      </div>
    );
  }

  // Teacher-only session: render Teacher Portal
  if (isTeacherSession) {
    return (
      <div className="min-h-screen w-full bg-stone-50 flex flex-col">
        <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-stone-900">EduJunction — Teacher Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>
        <div className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Welcome, Educator! 🧑‍🏫</h2>
            <p className="text-sm text-stone-600">
              You are logged in with a Teacher account. This portal receives diagnostic dossiers and enables communication with parents.
            </p>
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 space-y-2">
              <p className="font-semibold">Parent & Student Dashboard Testing:</p>
              <p className="text-xs text-yellow-700">
                To experience the full Parent Dashboard, 10-Mark Diagnostic Exam Arena, Gamification Hub, and Adaptive Learning Junctions, please sign in with a <strong>Parent</strong> account or create a new account from the login screen.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Sign out / Switch account
            </button>
          </div>
        </div>
        {/* Floating AI Chat Widget */}
        <AIChatWidget activeChild={activeChild} isStudent={false} role="teacher" />
      </div>
    );
  }


  if (activeTab === 'landing') {
    return (
      <div className="relative w-full h-full min-h-screen overflow-x-hidden">
        <LandingPage
          onOpenAuth={(mode) => setAuthModalMode(mode || 'login')}
        />
      </div>
    );
  }

  const dummyParentAccount: ParentAccount = {
    id: 'dummy',
    name: 'Loading...',
    email: '',
    role: 'parent',
    children: [],
    createdAt: new Date().toISOString()
  };

  const currentParentAccount = parentAccount || dummyParentAccount;

  return (
    <div className="flex h-screen w-full bg-[#FFFDF8] font-sans text-stone-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (High Density Theme with Global Collapse / Expand) */}
      <div className={`fixed inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} ${mobileSidebarOpen ? 'w-72 sm:w-64 translate-x-0 shadow-2xl' : '-translate-x-full'} print:hidden`}>
        <Sidebar
          pageAccess={pageAccess}
          isSidebarCollapsed={isSidebarCollapsed}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          onNavigate={() => setActiveSubmissionReport(null)}
          activePersona={activePersona}
          activeChildName={activeChild?.name}
        />
      </div>

      {/* Main Workspace Area (High Density Theme) */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative print:w-full print:block print:overflow-visible print:p-0 print:m-0">
        {(isBootstrapping || ((!isAdminSession && !isTeacherSession) && !parentAccount)) && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
            <p className="text-sm font-bold text-stone-700">Loading your workspace...</p>
          </div>
        )}

        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${(isBootstrapping || ((!isAdminSession && !isTeacherSession) && !parentAccount)) ? 'blur-sm pointer-events-none opacity-60' : ''} print:w-full print:block print:overflow-visible`}>
          {/* Top Header Bar */}
          <header className="h-14 lg:h-16 bg-gradient-to-r from-yellow-50/90 via-white/90 to-orange-50/90 backdrop-blur-xl border-b border-stone-200/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-20 sticky top-0 print:hidden">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Mobile-only Sidebar Toggle (hidden on desktop) */}
              <button
                id="mobile-sidebar-toggle"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-yellow-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>


              <h1 className="text-base sm:text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500 truncate">
                Welcome, {isParentActive ? (parentAccount?.name || 'Parent') : (activeChild?.name || 'Student')} <span className="text-stone-800">👋</span>
              </h1>
            </div>

            {/* Persona Menu & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-stone-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>

              {/* Real-Time Notification Bell & Dropdown */}
              <div className="relative" ref={notificationMenuRef}>
                <button
                  onClick={() => {
                    const willOpen = !showNotificationMenu;
                    setShowNotificationMenu(willOpen);
                    setShowPersonaMenu(false);
                    if (willOpen) {
                      fetchNotifications();
                    }
                  }}
                  className="relative p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-xs">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>

                {showNotificationMenu && (
                  <div className="absolute right-0 mt-2 w-[360px] sm:w-[380px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-stone-200/70 p-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col gap-2 max-h-[480px] overflow-hidden">

                    {/* Header */}
                    <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">Notifications</span>
                        {unreadNotifCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[11px] font-semibold text-yellow-700 hover:text-yellow-800 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all as read</span>
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 p-1 max-h-[380px]">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-lg mx-auto">
                            🔔
                          </div>
                          <p className="text-xs font-bold text-stone-800">All caught up!</p>
                          <p className="text-[11px] text-stone-400">No notifications at the moment.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isSubmitted = notif.type === 'EXAM_SUBMITTED' || notif.type === 'SCHEDULED_EXAM_COMPLETED' || notif.metadata?.status === 'SUBMITTED';
                          const isModelExam = notif.type === 'MODEL_EXAM_ASSIGNED' || notif.metadata?.type === 'MODEL_EXAM';
                          const isPending = (notif.type === 'EXAM_ASSIGNED' || isModelExam) && !isSubmitted;

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 rounded-2xl border transition-all duration-150 flex items-start gap-3 cursor-pointer group text-left ${!notif.isRead
                                ? 'bg-gradient-to-r from-amber-50/70 via-yellow-50/40 to-white border-amber-200/80 shadow-xs'
                                : 'bg-white hover:bg-stone-50/80 border-stone-200/60 opacity-85 hover:opacity-100'
                                }`}
                            >
                              {/* Icon Badge */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm mt-0.5 border shadow-2xs ${isModelExam
                                ? 'bg-amber-400/30 border-amber-400 text-stone-900'
                                : isPending
                                  ? 'bg-amber-100/90 border-amber-200 text-amber-800'
                                  : isSubmitted
                                    ? 'bg-emerald-100/90 border-emerald-200 text-emerald-800'
                                    : 'bg-yellow-100 border-yellow-200 text-yellow-800'
                                }`}>
                                {isModelExam ? '📜' : isPending ? '📝' : isSubmitted ? '🎯' : '🔔'}
                              </div>

                              {/* Text Body */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                                  <h4 className={`text-xs truncate ${!notif.isRead ? 'font-bold text-stone-900' : 'font-semibold text-stone-700'}`}>
                                    {notif.title}
                                  </h4>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Dynamic Status Badge */}
                                    {isModelExam ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-950 border border-amber-300 shadow-2xs">
                                        🎯 2027 Model Paper
                                      </span>
                                    ) : isPending ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/80 shadow-2xs">
                                        ⏳ Pending
                                      </span>
                                    ) : isSubmitted ? (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                                        ✓ Submitted
                                      </span>
                                    ) : null}
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[10px] text-stone-400">
                                  <span>
                                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                  </span>
                                  <span className="text-yellow-700 font-semibold group-hover:underline flex items-center gap-0.5">
                                    {isModelExam ? 'Start Model Exam →' : isPending ? 'Start Exam →' : isSubmitted ? 'View Report →' : 'View →'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>
                )}
              </div>

              <div className="relative" ref={personaMenuRef}>
                <button
                  id="header-persona-switcher"
                  onClick={() => {
                    setShowPersonaMenu((prev) => !prev);
                    setShowNotificationMenu(false);
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-50 to-amber-50 border border-yellow-200 shadow-sm flex items-center justify-center text-xl hover:scale-105 transition-transform cursor-pointer"
                  title={isParentActive ? `Parent Account (${parentAccount?.name})` : `Active Student (${activeChild?.name})`}
                >
                  {isParentActive ? '👨‍👩‍👧‍👦' : activeChild?.avatar || '👤'}
                </button>

                {/* Dropdown Menu Modal */}
                {showPersonaMenu && (
                  <div
                    id="persona-dropdown-menu"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {isStudentSession ? (
                      <div className="p-3">
                        <div className="flex items-center gap-3 p-2 bg-yellow-50/80 rounded-xl border border-yellow-200/60 mb-2">
                          <span className="text-2xl">{activeChild?.avatar || '👦'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-stone-900 truncate">{activeChild?.name}</p>
                            <p className="text-[10px] text-stone-500 truncate">{activeChild?.classGrade} • {activeChild?.targetBoard}</p>
                            <p className="text-[10px] text-amber-700 font-semibold truncate">{activeChild?.username || activeChild?.name.toLowerCase().replace(/\s+/g, '')}</p>
                          </div>
                        </div>
                        <div className="my-1 border-t border-stone-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-stone-600 hover:bg-stone-100 hover:text-stone-900 font-medium transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-stone-400" />
                          <span>Log out</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleSwitchToParent}
                          className={`w-full px-4 py-2.5 border-b border-stone-100 rounded-t-2xl flex items-center justify-between text-left transition-colors hover:bg-stone-50 ${isParentActive ? 'bg-yellow-50/60' : 'bg-stone-50/60'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                              {(parentAccount?.name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 truncate">{parentAccount?.name} (Parent)</p>
                              <p className="text-[10px] text-stone-500 truncate">{parentAccount?.email || 'Parent Account'}</p>
                            </div>
                          </div>
                          {isParentActive && <CheckCircle className="w-4 h-4 text-yellow-600 shrink-0" />}
                        </button>

                        <div className="p-1 space-y-0.5">
                          <div className="my-1 px-3 py-1">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Children Profiles</p>
                          </div>

                          {(parentAccount?.children || []).length === 0 ? (
                            <div className="px-3 py-2 flex flex-col items-center justify-center text-center">
                              <span className="text-stone-300 mb-1">👦👧</span>
                              <p className="text-[10px] text-stone-500 font-medium">No children added yet</p>
                            </div>
                          ) : (parentAccount?.children || []).map((child) => {
                            const cm = calculateStudentMetrics(child, examHistory);
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleSwitchToChild(child.id)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors text-stone-700 hover:bg-stone-100 cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-base">{child.avatar}</span>
                                  <div>
                                    <div className="font-medium text-stone-900">{child.name}</div>
                                    <div className="text-[10px] text-stone-500">
                                      {child.classGrade} • {child.targetBoard} • Avg {cm.scorePct}%
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}

                          <div className="my-1 border-t border-stone-100" />

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-800 font-medium transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable Main Content Frame (High Density Theme) */}
          <div className="flex-1 overflow-y-auto bg-stone-50 px-4 sm:px-6 lg:px-8 pt-1 pb-6 print:p-0 print:m-0 print:bg-white print:w-full print:block print:overflow-visible">


            {activeSubmissionReport ? (
              <DiagnosticReport
                submission={activeSubmissionReport}
                onRetakeOrNextExam={handleRetakeOrNextExam}
                onBackToDashboard={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('dashboard');
                }}
                onNavigateToLearningPath={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('learning-path');
                }}
                onNavigateToFunZone={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('fun-zone');
                }}
              />
            ) : (
              <>
                {(activeTab === 'dashboard' || activeTab === 'home') && (
                  isParentActive && parentAccount ? (
                    <ParentDashboard
                      parentAccount={parentAccount}
                      activeChildId={activeChildId}
                      onChildSelect={(cId) => {
                        setActiveChildId(cId);
                      }}
                      onLaunchExamForChild={(cId) => {
                        setActiveChildId(cId);
                        setActiveTab('arena');
                      }}
                      onScheduleExam={(config) => {
                        setActiveSubmissionReport(null);
                        setActiveChildId(config.childId);
                        setSchedulerPresetSubject(config.subject);
                        setSchedulerPresetTopic(config.topic);
                        setActiveTab('schedule-exam');
                      }}
                      onOpenAddChildModal={() => setShowAddChildModal(true)}
                      examHistory={examHistory}
                      onViewSubmissionReport={handleOpenSubmissionReport}
                      onUpdateChild={handleUpdateChild}
                    />
                  ) : activeChild ? (
                    <StudentDashboard
                      activeChild={activeChild}
                      examHistory={examHistory}
                      learningNodes={learningNodes}
                      allBadges={badges}
                      onNavigateToArena={(config) => {
                        setActiveSubmissionReport(null);
                        setArenaPresetSubject(config?.subject);
                        setArenaPresetTopic(config?.topic);
                        setActiveTab('arena');
                      }}
                      onNavigateToLearningPath={() => {
                        setActiveSubmissionReport(null);
                        setActiveTab('learning-path');
                      }}
                      onNavigateToGamification={() => {
                        setActiveSubmissionReport(null);
                        setActiveTab('gamification');
                      }}
                      onNavigateToFunZone={() => {
                        setActiveSubmissionReport(null);
                        setActiveTab('fun-zone');
                      }}
                      onViewSubmissionReport={handleOpenSubmissionReport}
                    />
                  ) : null
                )}

                {activeTab === 'children' && parentAccount && (
                  <ChildrenPage
                    parentAccount={parentAccount}
                    activeChildId={activeChildId}
                    onChildSelect={setActiveChildId}
                    onNavigateToArena={() => setActiveTab('arena')}
                    examHistory={examHistory}
                  />
                )}

                {activeTab === 'reports' && parentAccount && (
                  <ReportsPage
                    examHistory={examHistory}
                    parentAccount={parentAccount}
                    isStudent={!isParentActive}
                    onViewSubmissionReport={handleOpenSubmissionReport}
                  />
                )}

                {activeTab === 'schedule-exam' && parentAccount && (
                  <ParentExamScheduler
                    parentAccount={parentAccount}
                    activeChildId={activeChildId}
                    onChildSelect={setActiveChildId}
                    onViewSubmissionReport={handleOpenSubmissionReport}
                    onNavigateToArena={() => setActiveTab('arena')}
                    presetSubject={schedulerPresetSubject}
                    presetTopic={schedulerPresetTopic}
                  />
                )}

                {activeTab === 'arena' && (
                  isParentActive ? (
                    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-stone-200 text-center shadow-xs space-y-4 my-10 animate-in fade-in zoom-in-95 duration-150">
                      <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto text-3xl shadow-xs">
                        🧑‍🎓
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-stone-900 tracking-tight">Student Exam Arena</h2>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-md mx-auto">
                          Exams and diagnostic challenges are taken directly by students using their own unique username & password.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-left text-xs space-y-1.5 max-w-md mx-auto">
                        <p className="font-bold text-stone-800">How students practice:</p>
                        <ul className="list-disc pl-4 text-stone-600 space-y-1 text-[11px]">
                          <li>Student logs in with their unique username & password</li>
                          <li>Generates unlimited RAG-aligned curriculum exams</li>
                          <li>Earns XP, badges, and powers their adaptive learning Junction</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Return to Parent Dashboard
                      </button>
                    </div>
                  ) : ['Class 1', 'Class 2', 'Class 3', 'Class 4'].includes(activeChild?.classGrade || '') ? (
                    <KidsExamArena
                      parentAccount={currentParentAccount}
                      activeChildId={activeChildId}
                      activePersona={activePersona}
                      onChildSelect={(cId) => setActiveChildId(cId)}
                      onExamComplete={handleExamComplete}
                      initialExam={preloadedExam}
                      onClearInitialExam={() => setPreloadedExam(null)}
                      presetSubject={arenaPresetSubject}
                    />
                  ) : (
                    <ExamArena
                      parentAccount={currentParentAccount}
                      activeChildId={activeChildId}
                      activePersona={activePersona}
                      onChildSelect={(cId) => setActiveChildId(cId)}
                      onExamComplete={handleExamComplete}
                      initialExam={preloadedExam}
                      onClearInitialExam={() => setPreloadedExam(null)}
                      presetSubject={arenaPresetSubject}
                      presetTopic={arenaPresetTopic}
                    />
                  )
                )}

                {activeTab === 'learning-path' && activeChild && (
                  <AdaptiveLearningPath
                    activeChild={activeChild}
                    learningNodes={learningNodes}
                    onLaunchTopicExam={handleLaunchTopicExam}
                  />
                )}

                {activeTab === 'gamification' && activeChild && (
                  <GamificationHub
                    activeChild={activeChild}
                    allBadges={badges}
                    leaderboard={leaderboard}
                    activePersona={activePersona}
                    examHistory={examHistory}
                  />
                )}

                {activeTab === 'fun-zone' && (
                  <FunZone
                    activeChild={activeChild}
                    onAwardXP={handleAwardXP}
                    onLaunchExam={() => {
                      setActiveSubmissionReport(null);
                      setActiveTab('arena');
                    }}
                  />
                )}

                {activeTab === 'admin' && (
                  <SuperAdminPanel
                    parentAccount={parentAccount || { id: '', name: '', email: '', role: 'parent', children: [] }}
                  />
                )}

                {(activeTab === 'pricing' || activeTab === 'subscription') && (
                  <SubscriptionPlans
                    studentId={activeChild ? Number(activeChild.id) : undefined}
                    studentName={activeChild?.name || parentAccount?.name}
                    studentEmail={parentAccount?.email}
                    defaultBoard={activeChild?.targetBoard || 'CBSE'}
                    defaultClass={activeChild?.classGrade || 'Class 10'}
                    childrenList={isParentActive ? (parentAccount?.children || []) : []}
                    isParent={isParentActive}
                  />
                )}

                {activeTab === 'blog' && <BlogSection />}
                {activeTab === 'about' && <AboutSection />}
                {activeTab === 'legal' && <LegalSection />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Child Sub-Account Modal */}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onAddChild={handleAddChild}
        parentEmail={currentParentAccount?.email}
      />

      {/* Floating AI Chat Widget - Hidden during live exams to prevent cheating */}
      {activeTab !== 'arena' && activeTab !== 'exam' && activeTab !== 'kids-arena' && (
        <AIChatWidget
          activeChild={activeChild}
          childrenList={parentAccount?.children || []}
          isStudent={isStudentSession || activePersona === 'child'}
          role={isStudentSession || activePersona === 'child' ? 'student' : 'parent'}
        />
      )}
    </div>
  );
}
