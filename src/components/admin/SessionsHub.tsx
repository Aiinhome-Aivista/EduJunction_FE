import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  ChevronRight,
  User,
  ShieldAlert,
  Loader2,
  Compass,
  Home,
  CreditCard,
  BookOpen,
  Sparkles,
  LayoutDashboard,
  Calendar,
  FileText,
  Eye,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';

interface TelemetryStats {
  activeSessions: number;
  totalEventsToday: number;
  failedEventsToday: number;
  successRatePercent: number;
  avgLatencyMs: number;
  inactivityTimeoutMinutes: number;
}

interface SessionRecord {
  id: string;
  userId: number | null;
  userName: string;
  userEmail: string | null;
  userRole: string;
  ipAddress: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | string;
  startedAt: string | null;
  lastActivityAt: string | null;
  isActive: boolean;
  eventCount: number;
  errorCount: number;
  lastAction: string;
  lastStatus: string;
}

interface TimelineEvent {
  id: string;
  eventName: string;
  category: string;
  inputPayload: any;
  resultSummary: any;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED';
  executionTimeMs: number;
  errorMessage: string | null;
  ipAddress: string | null;
  createdAt: string | null;
}

interface PageVisitStep {
  id: string;
  pageTitle: string;
  route: string;
  iconType: 'home' | 'pricing' | 'blog' | 'arena' | 'dashboard' | 'reports' | 'schedule' | 'generic';
  enteredAt: string;
  leftAt: string | null;
  durationSeconds: number;
  durationFormatted: string;
  isCurrentPage: boolean;
  actionsCount: number;
  highlights: string[];
}

export const SessionsHub: React.FC = () => {
  // Stats state
  const [stats, setStats] = useState<TelemetryStats>({
    activeSessions: 0,
    totalEventsToday: 0,
    failedEventsToday: 0,
    successRatePercent: 100,
    avgLatencyMs: 0,
    inactivityTimeoutMinutes: 10,
  });

  // Sessions list state
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Journey drawer state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(false);
  const [timelineData, setTimelineData] = useState<{ session: any; events: TimelineEvent[] } | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'journey' | 'activities'>('journey');

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await ApiServices.getTelemetryStats(timeoutMinutes);
      const data = res?.data || res;
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load telemetry stats', err);
    }
  }, [timeoutMinutes]);

  // Load Sessions List
  const loadSessions = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await ApiServices.getTelemetrySessions({
          page,
          pageSize: 20,
          search: search.trim(),
          status: statusFilter,
          timeoutMinutes,
        });

        const data = res?.data || res;
        if (data && data.sessions) {
          setSessions(data.sessions);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load sessions', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter, timeoutMinutes]
  );

  useEffect(() => {
    loadStats();
    loadSessions();
  }, [loadStats, loadSessions]);

  // Open User Journey Drawer (with optional silent background refresh)
  const openJourney = async (sessionId: string, silent = false) => {
    setSelectedSessionId(sessionId);
    if (!silent) {
      setTimelineLoading(true);
      setTimelineData(null);
      setDrawerActiveTab('journey');
    }
    try {
      const res = await ApiServices.getTelemetryTimeline(sessionId, timeoutMinutes);
      const data = res?.data || res;
      if (data) {
        setTimelineData(data);
      }
    } catch (err) {
      console.error('Failed to load journey', err);
    } finally {
      if (!silent) {
        setTimelineLoading(false);
      }
    }
  };

  // Always-on Auto-refresh interval (every 3.5 seconds for real-time live monitoring)
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
      loadSessions(true);
      if (selectedSessionId) {
        openJourney(selectedSessionId, true);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [loadStats, loadSessions, selectedSessionId, timeoutMinutes]);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      const diffSecs = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      return `${diffHrs}h ago`;
    } catch {
      return isoString;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds <= 0) return '< 10s';
    const s = Math.round(seconds);
    if (s < 15) return '< 15s';
    if (s < 60) return `${s}s`;
    const mins = Math.floor(s / 60);
    const remainingSecs = s % 60;
    if (mins < 60) {
      return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getDeviceIcon = (deviceType?: string) => {
    const d = (deviceType || '').toLowerCase();
    if (d === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-stone-500" />;
    if (d === 'tablet') return <Tablet className="w-3.5 h-3.5 text-stone-500" />;
    return <Laptop className="w-3.5 h-3.5 text-stone-500" />;
  };

  const getActionLabel = (rawName?: string | null) => {
    if (!rawName) return 'Home / Landing Page';
    const name = rawName.trim();

    // Human-readable Page Views
    if (name.startsWith('PAGE_VIEW:')) {
      const page = name.replace('PAGE_VIEW:', '').trim();
      if (page === '/' || page === '/home' || page === '/landing' || page === 'Home Page') return 'Home / Landing Page';
      if (page.includes('Pricing') || page.includes('subscription')) return 'Pricing & Subscription Plans';
      if (page.includes('Feature')) return 'Platform Features';
      if (page.includes('Arena') || page.includes('exam') || page.includes('Mock')) return 'Diagnostic Mock Test Arena';
      if (page.includes('Dashboard')) return 'Study Performance Dashboard';
      if (page.includes('Journal') || page.includes('blog')) return 'EduJunction Journal';
      if (page.includes('Children')) return 'Children Management';
      if (page.includes('Report')) return 'Diagnostic Score Reports';
      if (page.includes('Schedule')) return 'Exam Scheduler';
      return page.replace(/^\//, '').replace(/-/g, ' ');
    }

    // Human-readable API Actions (NEVER display raw URLs!)
    if (name.includes('/subscription-plans')) return 'Pricing & Subscription Plans';
    if (name.includes('/blogs')) return 'EduJunction Journal';
    if (name.includes('/master/board_class_dropdown') || name.includes('/curriculum-options')) return 'Curriculum Selection';
    if (name.includes('/auth/login')) return 'Sign In Portal';
    if (name.includes('/auth/register')) return 'Registration Portal';
    if (name.includes('/students/dashboard') || name.includes('/parents/dashboard')) return 'Dashboard Overview';
    if (name.includes('/exams/submit') || name.includes('/submit')) return 'Exam Answer Submission';
    if (name.includes('/mock-tests') || name.includes('/exams')) return 'Diagnostic Mock Test Arena';
    if (name.includes('/gamification')) return 'XP & Leaderboard';
    if (name.includes('/learning-path')) return 'Adaptive Learning Path';
    if (name.includes('seo') || name.includes('metadata') || name.includes('captcha') || name.includes('notification')) {
      return 'Home / Landing Page';
    }

    if (name.startsWith('GET /api') || name.startsWith('POST /api')) {
      return 'Exploring Platform';
    }

    return name;
  };

  const getActivityDetails = (e: TimelineEvent) => {
    const raw = e.eventName || '';
    let title = 'Platform Interaction';
    let categoryLabel = 'ACTION';
    let badgeTheme = 'bg-stone-100 text-stone-700 border-stone-200';
    let icon = <Activity className="w-3.5 h-3.5 text-stone-500" />;

    if (raw.startsWith('PAGE_VIEW:')) {
      title = `Navigated to ${raw.replace('PAGE_VIEW:', '').trim()}`;
      categoryLabel = 'PAGE VISIT';
      badgeTheme = 'bg-blue-50 text-blue-700 border-blue-200';
      icon = <Compass className="w-3.5 h-3.5 text-blue-600" />;
    } else if (raw.includes('/subscription-plans')) {
      title = 'Explored Subscription Plans & Pricing';
      categoryLabel = 'PRICING';
      badgeTheme = 'bg-amber-50 text-amber-800 border-amber-200';
      icon = <CreditCard className="w-3.5 h-3.5 text-amber-600" />;
    } else if (raw.includes('/blogs')) {
      title = 'Read Educational Journal & Articles';
      categoryLabel = 'JOURNAL';
      badgeTheme = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <BookOpen className="w-3.5 h-3.5 text-emerald-600" />;
    } else if (raw.includes('/master/board_class_dropdown') || raw.includes('/curriculum-options')) {
      title = 'Selected Curriculum Board / Class';
      categoryLabel = 'CURRICULUM';
      badgeTheme = 'bg-amber-50 text-amber-800 border-amber-200';
      icon = <Home className="w-3.5 h-3.5 text-amber-600" />;
    } else if (raw.includes('/auth/login')) {
      title = 'User Login Authentication';
      categoryLabel = 'SIGN IN';
      badgeTheme = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />;
    } else if (raw.includes('/auth/register')) {
      title = 'Account Registration Request';
      categoryLabel = 'REGISTER';
      badgeTheme = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      icon = <User className="w-3.5 h-3.5 text-indigo-600" />;
    } else if (raw.includes('/auth/captcha')) {
      title = 'Generated Security Verification Captcha';
      categoryLabel = 'SECURITY';
      badgeTheme = 'bg-stone-100 text-stone-600 border-stone-200';
      icon = <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />;
    } else if (raw.includes('/students/dashboard') || raw.includes('/parents/dashboard')) {
      title = 'Loaded Dashboard Statistics';
      categoryLabel = 'DASHBOARD';
      badgeTheme = 'bg-blue-50 text-blue-700 border-blue-200';
      icon = <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />;
    } else if (raw.includes('/mock-tests') || raw.includes('/exams')) {
      title = 'Accessed Diagnostic Mock Test Arena';
      categoryLabel = 'MOCK TEST';
      badgeTheme = 'bg-yellow-50 text-yellow-800 border-yellow-200';
      icon = <Sparkles className="w-3.5 h-3.5 text-yellow-600" />;
    } else if (raw.includes('/submit')) {
      title = 'Submitted Exam Answers For Grading';
      categoryLabel = 'SUBMISSION';
      badgeTheme = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    } else if (raw.includes('/notifications')) {
      title = 'Checked Platform Notifications';
      categoryLabel = 'SYSTEM';
      badgeTheme = 'bg-stone-100 text-stone-600 border-stone-200';
      icon = <Zap className="w-3.5 h-3.5 text-stone-500" />;
    } else {
      title = getActionLabel(raw);
      categoryLabel = 'ACTIVITY';
    }

    return { title, categoryLabel, badgeTheme, icon };
  };

  // ── Compute Human-Friendly Page Journey ──────────────────────────
  const computedPageJourney = useMemo((): PageVisitStep[] => {
    if (!timelineData || !timelineData.session) return [];

    const session = timelineData.session;
    const events = timelineData.events || [];

    // Filter out background noise
    const validEvents = events.filter((e) => {
      const name = (e.eventName || '').toLowerCase();
      if (name.includes('/seo/metadata')) return false;
      if (name.includes('/notifications')) return false;
      if (name.includes('/auth/captcha')) return false;
      if (name.includes('/admin/telemetry')) return false;
      return true;
    });

    const resolveStepInfo = (e: TimelineEvent) => {
      const raw = e.eventName || '';
      let pageTitle = 'Home / Landing Page';
      let route = '/';
      let iconType: PageVisitStep['iconType'] = 'home';
      let highlight = '';

      if (raw.startsWith('PAGE_VIEW:')) {
        const page = raw.replace('PAGE_VIEW:', '').trim();
        pageTitle = page || 'Home / Landing Page';
        const lower = pageTitle.toLowerCase();
        if (lower.includes('pricing') || lower.includes('subscription')) {
          route = '/pricing';
          iconType = 'pricing';
        } else if (lower.includes('journal') || lower.includes('blog')) {
          route = '/blog';
          iconType = 'blog';
        } else if (lower.includes('arena') || lower.includes('mock')) {
          route = '/arena';
          iconType = 'arena';
        } else if (lower.includes('dashboard')) {
          route = '/dashboard';
          iconType = 'dashboard';
        } else if (lower.includes('report')) {
          route = '/reports';
          iconType = 'reports';
        } else if (lower.includes('schedule')) {
          route = '/schedule';
          iconType = 'schedule';
        } else {
          route = '/';
          iconType = 'home';
        }
        return { pageTitle, route, iconType, highlight: `Landed on ${pageTitle}` };
      }

      if (raw.includes('/subscription-plans')) {
        pageTitle = 'Pricing & Subscription Plans';
        route = '/pricing';
        iconType = 'pricing';
        highlight = 'Explored subscription tiers & membership options';
      } else if (raw.includes('/blogs')) {
        pageTitle = 'EduJunction Journal';
        route = '/blog';
        iconType = 'blog';
        highlight = 'Read educational journal articles and learning guides';
      } else if (raw.includes('/master/board_class_dropdown') || raw.includes('/curriculum-options')) {
        pageTitle = 'Home / Landing Page';
        route = '/';
        iconType = 'home';
        highlight = 'Selected curriculum board and class options';
      } else if (raw.includes('/mock-tests') || raw.includes('/exams')) {
        pageTitle = 'Diagnostic Mock Test Arena';
        route = '/arena';
        iconType = 'arena';
        highlight = 'Attempted diagnostic mock test questions';
      } else if (raw.includes('/submit')) {
        pageTitle = 'Diagnostic Mock Test Arena';
        route = '/arena';
        iconType = 'arena';
        highlight = 'Submitted answer sheet for AI grading';
      } else if (raw.includes('/students/dashboard') || raw.includes('/parent/dashboard')) {
        pageTitle = session?.userRole === 'PARENT' ? 'Parent Family Dashboard' : 'Student Study Dashboard';
        route = '/dashboard';
        iconType = 'dashboard';
        highlight = 'Reviewed student metrics and diagnostic progress';
      } else if (raw.includes('/auth/login') || raw.includes('/auth/register')) {
        pageTitle = 'Sign In & Account Security';
        route = '/login';
        iconType = 'generic';
        highlight = 'User authentication action completed';
      } else {
        pageTitle = 'Home / Landing Page';
        route = '/';
        iconType = 'home';
        highlight = 'Browsed platform overview and features';
      }

      return { pageTitle, route, iconType, highlight };
    };

    const steps: PageVisitStep[] = [];

    if (validEvents.length === 0) {
      const started = session.startedAt || new Date().toISOString();
      const lastActive = session.lastActivityAt || started;
      const durSecs = Math.max(1, (new Date(lastActive).getTime() - new Date(started).getTime()) / 1000);
      steps.push({
        id: 'step-1',
        pageTitle: 'Home / Landing Page',
        route: '/',
        iconType: 'home',
        enteredAt: started,
        leftAt: session.isActive ? null : lastActive,
        durationSeconds: durSecs,
        durationFormatted: formatDuration(durSecs),
        isCurrentPage: session.isActive,
        actionsCount: 1,
        highlights: ['Visited home page & explored platform overview'],
      });
      return steps;
    }

    for (let i = 0; i < validEvents.length; i++) {
      const event = validEvents[i];
      const { pageTitle, route, iconType, highlight } = resolveStepInfo(event);
      const eventTime = event.createdAt || session.startedAt || new Date().toISOString();

      const lastStep = steps[steps.length - 1];

      if (!lastStep || lastStep.pageTitle !== pageTitle) {
        steps.push({
          id: `step-${steps.length + 1}`,
          pageTitle,
          route,
          iconType,
          enteredAt: eventTime,
          leftAt: null,
          durationSeconds: 0,
          durationFormatted: '',
          isCurrentPage: false,
          actionsCount: 1,
          highlights: highlight ? [highlight] : [],
        });
      } else {
        lastStep.actionsCount += 1;
        if (highlight && !lastStep.highlights.includes(highlight)) {
          lastStep.highlights.push(highlight);
        }
      }
    }

    // Compute durations
    for (let i = 0; i < steps.length; i++) {
      const current = steps[i];
      const next = steps[i + 1];

      if (next) {
        current.leftAt = next.enteredAt;
        const diffSecs = Math.max(1, (new Date(next.enteredAt).getTime() - new Date(current.enteredAt).getTime()) / 1000);
        current.durationSeconds = diffSecs;
        current.durationFormatted = formatDuration(diffSecs);
        current.isCurrentPage = false;
      } else {
        if (session.isActive) {
          current.leftAt = null;
          const diffSecs = Math.max(1, (Date.now() - new Date(current.enteredAt).getTime()) / 1000);
          current.durationSeconds = diffSecs;
          current.durationFormatted = formatDuration(diffSecs);
          current.isCurrentPage = true;
        } else {
          const lastActivity = session.lastActivityAt || current.enteredAt;
          current.leftAt = lastActivity;
          const diffSecs = Math.max(1, (new Date(lastActivity).getTime() - new Date(current.enteredAt).getTime()) / 1000);
          current.durationSeconds = diffSecs;
          current.durationFormatted = formatDuration(diffSecs);
          current.isCurrentPage = false;
        }
      }
    }

    return steps;
  }, [timelineData]);

  // Total session dwell time
  const totalSessionDwellTime = useMemo(() => {
    if (!timelineData?.session?.startedAt) return '—';
    const start = new Date(timelineData.session.startedAt).getTime();
    const end = timelineData.session.isActive
      ? Date.now()
      : new Date(timelineData.session.lastActivityAt || timelineData.session.startedAt).getTime();
    const diffSecs = Math.max(1, (end - start) / 1000);
    return formatDuration(diffSecs);
  }, [timelineData]);

  const renderPageIcon = (iconType: PageVisitStep['iconType']) => {
    switch (iconType) {
      case 'pricing':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'blog':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'arena':
        return <Sparkles className="w-4 h-4 text-yellow-600" />;
      case 'dashboard':
        return <LayoutDashboard className="w-4 h-4 text-blue-600" />;
      case 'reports':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-cyan-600" />;
      default:
        return <Home className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-600" />
            User Sessions & Activity Telemetry
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time live monitoring of visitor journeys, page dwell times, and engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Manual Refresh */}
          <button
            type="button"
            onClick={() => {
              loadStats();
              loadSessions(true);
            }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-yellow-400 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-yellow-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 4 Colorful Modern KPI Cards (Matching Admin Dashboard) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Active Visitors - Emerald Theme */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200/80 hover:border-emerald-400 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Live Visitors</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 border-emerald-300/60 px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Now
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className="text-2xl font-black text-stone-900">{stats.activeSessions}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                Currently online on platform
              </p>
            </div>
          </div>
        </div>

        {/* Actions Recorded - Yellow/Amber Theme */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200/80 hover:border-yellow-400 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-yellow-600" />
              </div>
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-wider">Actions Today</span>
            </div>
            <span className="text-[10px] font-bold bg-yellow-200/70 text-yellow-900 border-yellow-300/60 px-2 py-0.5 rounded-full border shadow-2xs">
              Activity
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className="text-2xl font-black text-stone-900">{stats.totalEventsToday.toLocaleString()}</p>
              <p className="text-[10px] text-yellow-800 font-semibold mt-0.5">
                Telemetry events captured
              </p>
            </div>
          </div>
        </div>

        {/* Success Rate - Blue/Indigo Theme */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200/80 hover:border-blue-400 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Success Rate</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 border-blue-300/60 px-2 py-0.5 rounded-full border shadow-2xs">
              Platform Health
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className="text-2xl font-black text-stone-900">{stats.successRatePercent}%</p>
              <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                Healthy response rate
              </p>
            </div>
          </div>
        </div>

        {/* Errors Today - Rose Theme */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-200/80 hover:border-rose-400 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Errors Today</span>
            </div>
            <span className="text-[10px] font-bold bg-rose-200/70 text-rose-900 border-rose-300/60 px-2 py-0.5 rounded-full border shadow-2xs">
              Issues
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className={`text-2xl font-black ${stats.failedEventsToday > 0 ? 'text-rose-600' : 'text-stone-900'}`}>
                {stats.failedEventsToday}
              </p>
              <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                avg {stats.avgLatencyMs}ms latency
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Control Bar ──────────────────────── */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by User Name, Email, IP Address, or Session ID..."
            className="w-full h-10 pl-9 pr-9 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-yellow-400 transition-colors"
          />
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-yellow-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('active');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('inactive');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === 'inactive' ? 'bg-white text-stone-800 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Offline
            </button>
          </div>

          {/* Inactivity Threshold Select */}
          <select
            value={timeoutMinutes}
            onChange={(e) => {
              setTimeoutMinutes(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Inactivity threshold"
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-yellow-400 cursor-pointer"
          >
            <option value={5}>Active window: 5 min</option>
            <option value={10}>Active window: 10 min</option>
            <option value={30}>Active window: 30 min</option>
          </select>
        </div>
      </div>

      {/* ── Sessions Data Table (Clean, Polished & Meaningful) ─── */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/90 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Device & IP</th>
                <th className="py-3.5 px-4">Landed At</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Current Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24">
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-stone-800">Loading user sessions...</p>
                        <p className="text-xs text-stone-400">Please wait while activity telemetry records are loaded</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Activity className="w-8 h-8 text-stone-300" />
                      <p className="font-semibold text-stone-700 text-sm">No matching user sessions found</p>
                      <p className="text-xs text-stone-400 max-w-sm">
                        {search || statusFilter !== 'all'
                          ? 'No records match your search or filter criteria. Try adjusting your query.'
                          : 'No user telemetry sessions recorded yet. Activity will appear once visitors browse the app.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const isSelected = selectedSessionId === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => openJourney(s.id)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-50/70 border-l-4 border-l-amber-500 font-medium'
                          : 'hover:bg-amber-50/30'
                      }`}
                    >
                    {/* User */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200/90 flex items-center justify-center text-stone-600 font-bold shrink-0 text-xs shadow-2xs">
                          {s.userName ? s.userName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate text-xs">{s.userName}</p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 font-medium">
                            {s.userRole || 'Guest'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Session ID */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px] font-semibold text-stone-700 select-all" title={s.id}>
                          {s.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(s.id);
                            setCopiedSessionId(s.id);
                            setTimeout(() => setCopiedSessionId(null), 1500);
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                          title="Copy Session ID"
                        >
                          {copiedSessionId === s.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Device & IP (Combined) */}
                    <td className="py-3.5 px-4 text-stone-600">
                      <div className="flex items-center gap-1.5 font-medium text-stone-800">
                        {getDeviceIcon(s.deviceType)}
                        <span className="capitalize text-xs">{s.deviceType}</span>
                      </div>
                      <p className="font-mono text-stone-400 text-[10px] mt-0.5">{s.ipAddress}</p>
                    </td>

                    {/* Landed */}
                    <td className="py-3.5 px-4 text-stone-500">{formatTime(s.startedAt)}</td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-stone-800 font-medium">{formatTime(s.lastActivityAt)}</span>
                        <span className="text-[10px] text-stone-400">{formatRelativeTime(s.lastActivityAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-500">
                          Offline
                        </span>
                      )}
                    </td>

                    {/* Activity (Meaningful - Zero raw API URLs) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-stone-900">
                          {s.eventCount} actions
                          {s.errorCount > 0 && (
                            <span className="ml-1 text-rose-600 font-bold text-[11px]">({s.errorCount} err)</span>
                          )}
                        </span>
                        <span
                          className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 mt-1 max-w-[190px] truncate shadow-2xs"
                          title={getActionLabel(s.lastAction)}
                        >
                          {getActionLabel(s.lastAction)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-stone-200/90 bg-stone-50/50 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Showing page <strong className="text-stone-800">{page}</strong> of <strong className="text-stone-800">{totalPages}</strong> ({totalCount} total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modern User Journey Drawer (No raw APIs, only Page visits & Dwell Times) ── */}
      {selectedSessionId && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end transition-opacity"
          onClick={() => setSelectedSessionId(null)}
        >
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200/90 bg-stone-50/80">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                      {timelineData?.session?.userName ? timelineData.session.userName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 truncate">
                        {timelineData?.session?.userName || 'Visitor Session'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                        <span className="capitalize font-medium">{timelineData?.session?.deviceType || 'Desktop'}</span>
                        <span>•</span>
                        <span className="font-mono text-stone-500">{timelineData?.session?.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSessionId(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dwell Time & Quick Summary Pill */}
              <div className="mt-3.5 pt-3 border-t border-stone-200/70 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Total Time Spent:</span>
                  <strong className="text-stone-900 font-bold">{totalSessionDwellTime}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {Boolean(
                    timelineData?.session?.isActive ??
                    sessions.find((s) => s.id === (timelineData?.session?.id || selectedSessionId))?.isActive
                  ) ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Now
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-200 text-stone-600">
                      Session Ended
                    </span>
                  )}

                  {/* 2 Tabs right next to Session Ended */}
                  <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setDrawerActiveTab('journey')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
                        drawerActiveTab === 'journey'
                          ? 'bg-white text-stone-900 shadow-2xs font-bold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <span>Page Journey</span>
                      <span className={`text-[9px] px-1 py-0.1 rounded-full font-bold ${
                        drawerActiveTab === 'journey' ? 'bg-amber-100 text-amber-900' : 'bg-stone-300/60 text-stone-600'
                      }`}>
                        {computedPageJourney.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerActiveTab('activities')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
                        drawerActiveTab === 'activities'
                          ? 'bg-white text-stone-900 shadow-2xs font-bold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <span>All Activities</span>
                      <span className={`text-[9px] px-1 py-0.1 rounded-full font-bold ${
                        drawerActiveTab === 'activities' ? 'bg-yellow-100 text-yellow-900' : 'bg-stone-300/60 text-stone-600'
                      }`}>
                        {timelineData?.events?.length || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {timelineLoading ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800">Loading session telemetry...</p>
                    <p className="text-xs text-stone-400">Computing page visits and activity logs</p>
                  </div>
                </div>
              ) : drawerActiveTab === 'journey' ? (
                // ── TAB 1: Clean Page Visit Journey Flow ──
                computedPageJourney.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center gap-2 text-stone-400">
                    <Activity className="w-8 h-8 text-stone-300" />
                    <p className="font-semibold text-stone-700 text-sm">No page visits recorded</p>
                    <p className="text-xs text-stone-400">No navigation history recorded for this user yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-xs font-semibold text-stone-500 flex items-center justify-between">
                      <span>USER PAGE NAVIGATION FLOW</span>
                      <span className="text-stone-400">{computedPageJourney.length} total pages visited</span>
                    </div>

                    <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                      {computedPageJourney.map((step, idx) => (
                        <div key={step.id || idx} className="relative group">
                          {/* Step Number Dot */}
                          <div
                            className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 ${
                              step.isCurrentPage
                                ? 'bg-emerald-500 border-emerald-200 text-white shadow-xs'
                                : 'bg-white border-amber-400 text-stone-700 shadow-2xs'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          {/* Page Visit Card */}
                          <div
                            className={`rounded-2xl p-4 border transition-all ${
                              step.isCurrentPage
                                ? 'bg-emerald-50/30 border-emerald-300/80 shadow-2xs'
                                : 'bg-stone-50/70 border-stone-200 hover:border-amber-300 hover:bg-white shadow-2xs'
                            }`}
                          >
                            {/* Card Top: Page Title, Route & Dwell Time */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-white border border-stone-200/80 shadow-2xs shrink-0">
                                  {renderPageIcon(step.iconType)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-stone-900 tracking-tight">
                                    {step.pageTitle}
                                  </h4>
                                  <span className="font-mono text-[10px] text-stone-400">
                                    {step.route}
                                  </span>
                                </div>
                              </div>

                              {/* Time Spent / Duration Badge */}
                              {step.isCurrentPage ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active • {step.durationFormatted}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Stayed {step.durationFormatted}
                                </span>
                              )}
                            </div>

                            {/* Card Middle: Arrival and Departure Timestamp */}
                            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                              <span>Landed: <strong className="text-stone-700 font-semibold">{formatTime(step.enteredAt)}</strong></span>
                              {step.leftAt ? (
                                <span>Left: <strong className="text-stone-700 font-semibold">{formatTime(step.leftAt)}</strong></span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">Currently on this page</span>
                              )}
                            </div>

                            {/* Card Bottom: Meaningful Highlights (No raw URLs) */}
                            {step.highlights.length > 0 && (
                              <div className="mt-2.5 space-y-1">
                                {step.highlights.map((h, hIdx) => (
                                  <div key={hIdx} className="flex items-center gap-1.5 text-[11px] text-stone-600">
                                    <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                    <span>{h}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                // ── TAB 2: Clean All User Activities List (Zero Raw URLs) ──
                (!timelineData?.events || timelineData.events.length === 0) ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center gap-2 text-stone-400">
                    <Activity className="w-8 h-8 text-stone-300" />
                    <p className="font-semibold text-stone-700 text-sm">No activities recorded</p>
                    <p className="text-xs text-stone-400">No events found in this user session.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-stone-500 flex items-center justify-between">
                      <span>ALL USER ACTIVITIES & INTERACTIONS</span>
                      <span className="text-stone-400">{timelineData.events.length} total events</span>
                    </div>

                    <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                      {timelineData.events.map((event, idx) => {
                        const isFailure = event.status === 'FAILURE';
                        const details = getActivityDetails(event);

                        return (
                          <div key={event.id || idx} className="relative group">
                            {/* Step Number Dot */}
                            <div
                              className={`absolute -left-6 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold z-10 ${
                                isFailure
                                  ? 'bg-rose-500 border-rose-200 text-white'
                                  : 'bg-white border-yellow-400 text-stone-600 shadow-2xs'
                              }`}
                            >
                              {idx + 1}
                            </div>

                            {/* Activity Card */}
                            <div className="rounded-xl p-3 bg-stone-50/80 border border-stone-200/80 hover:border-amber-300 hover:bg-white transition-all shadow-2xs">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-white border border-stone-200 shadow-2xs shrink-0">
                                    {details.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-xs text-stone-900">
                                      {details.title}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                                      <span>{formatTime(event.createdAt)}</span>
                                      {event.executionTimeMs > 0 && (
                                        <>
                                          <span>•</span>
                                          <span>{event.executionTimeMs}ms response</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${details.badgeTheme}`}>
                                    {details.categoryLabel}
                                  </span>
                                  {isFailure ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                      FAILED
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                      SUCCESS
                                    </span>
                                  )}
                                </div>
                              </div>

                              {event.errorMessage && (
                                <p className="mt-2 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium">
                                  {event.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
