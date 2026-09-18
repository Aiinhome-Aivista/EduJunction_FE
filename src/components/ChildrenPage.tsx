import React, { useMemo } from 'react';
import { ParentAccount, ExamSubmission } from '../types';
import { Trophy, TrendingUp, Target, Flame, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculateStudentMetrics } from '../utils/metricsEngine';

interface ChildrenPageProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect: (childId: string) => void;
  onNavigateToArena: () => void;
  examHistory?: ExamSubmission[];
}

export const ChildrenPage: React.FC<ChildrenPageProps> = ({
  parentAccount,
  activeChildId,
  onChildSelect,
  onNavigateToArena,
  examHistory = [],
}) => {
  const activeChild = useMemo(() => {
    return parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];
  }, [parentAccount.children, activeChildId]);

  // Unified Student Analytics Metrics (SSOT)
  const metrics = useMemo(() => {
    return calculateStudentMetrics(activeChild, examHistory);
  }, [activeChild, examHistory]);

  const childExams = metrics.childExams;
  const avgScorePct = metrics.scorePct;
  const readinessPct = metrics.readinessScore;

  const childLevel = activeChild
    ? activeChild.level || Math.floor((activeChild.xp || 0) / 100) + 1
    : 1;

  const streakDays = activeChild?.streakDays || 0;

  // Dynamic 7-day Monday -> Sunday performance trend from database submissions
  const chartData = useMemo(() => {
    const today = new Date();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7; // days since Monday
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diffToMonday);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
      const dayLabel = days[offset];
      const dayStart = d.getTime();
      const dayEnd = dayStart + DAY_MS;

      const matching = childExams.filter((e) => {
        const t = new Date(e.submittedAt).getTime();
        return t >= dayStart && t < dayEnd;
      });

      const score = matching.length > 0
        ? Math.round(
            matching.reduce(
              (acc, curr) => acc + (curr.accuracyPercentage != null ? Number(curr.accuracyPercentage) : ((curr.marksObtained / (curr.totalMarks || 15)) * 100)),
              0
            ) / matching.length
          )
        : null;

      return { date: dayLabel, score };
    });
  }, [childExams]);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-stone-500 font-medium">No children profiles found.</p>
      </div>
    );
  }

  // Real Application Topic Mastery Calculation
  const topicMasteryEntries = useMemo(() => {
    return Object.entries(activeChild.topicMastery || {}).map(([topic, rawScore]) => {
      let score = Number(rawScore) || 0;
      if (score <= 5 && score > 0) score = score * 20; // normalize 1-5 scale if any
      return { topic, score: Math.min(100, Math.max(0, Math.round(score))) };
    });
  }, [activeChild.topicMastery]);

  // Strongest topics: Score >= 70%, sorted highest first (top 3)
  const strongestTopics = useMemo(() => {
    return topicMasteryEntries
      .filter((t) => t.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [topicMasteryEntries]);

  // Needs Attention: Score < 70%, sorted lowest first (most urgent weak topics top 3)
  const weakestTopics = useMemo(() => {
    return topicMasteryEntries
      .filter((t) => t.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [topicMasteryEntries]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 fade-in">
      {/* Header & Child Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Child Progress</h1>
          <p className="text-sm font-medium text-stone-500 mt-1">Detailed performance and mastery analytics.</p>
        </div>
        <div className="flex gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto hide-scrollbar">
          {parentAccount.children.map((child) => (
            <button
              key={child.id}
              onClick={() => onChildSelect(child.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeChild.id === child.id
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              <span className="text-lg">{child.avatar || '👦'}</span>
              {child.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Stat Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            {/* Avatar Container with Sleek Corner Badge (No Overlap) */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl border-2 border-stone-200/80 flex items-center justify-center text-5xl sm:text-6xl shadow-xs relative">
                <span className="select-none">{activeChild.avatar || '👦'}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-stone-900 text-yellow-400 border-2 border-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shadow-md flex items-center gap-1">
                <span>LVL</span>
                <span>{childLevel}</span>
              </div>
            </div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">{activeChild.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-200">
                  {activeChild.classGrade}
                </span>
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-200">
                  {activeChild.targetBoard || activeChild.curriculumBoard}
                </span>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> {streakDays} Day Streak
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Total XP</p>
                  <p className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-1 justify-center md:justify-start">
                    <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                    {(activeChild.xp || 0).toLocaleString()}
                  </p>
                </div>
                <div className="border-l border-stone-100 pl-4">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Avg Score</p>
                  <p className="text-lg sm:text-xl font-black text-stone-900">{avgScorePct}%</p>
                </div>
                <div className="border-l border-stone-100 pl-4">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Readiness</p>
                  <p className="text-lg sm:text-xl font-black text-stone-900">{readinessPct}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">Learning Progress Over Time</h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Diagnostic accuracy trend</p>
              </div>
              <div className="h-8 w-8 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} dx={-10} domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].value;
                        return (
                          <div className="bg-stone-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg">
                            <p className="font-bold">{label}</p>
                            <p className="text-yellow-400 font-extrabold">{val !== null ? `${val}% Accuracy` : 'No exams taken'}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Topic Mastery */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-stone-900">Topic Mastery</h3>
              </div>
              <span className="text-[11px] font-bold text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg">
                Topic Breakdown
              </span>
            </div>

            <div className="space-y-6">
              {/* Strongest Areas (Score >= 70%) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Strongest Areas</p>
                  {strongestTopics.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Top Strengths
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {strongestTopics.length > 0 ? (
                    strongestTopics.map(({ topic, score }, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-700 truncate max-w-[190px]" title={topic}>{topic}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                            🌟 Mastered
                          </span>
                        </div>
                        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <p className="text-xs text-stone-500 font-medium">Practice diagnostic tests to build top strength areas.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Needs Attention (Score < 70%) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-wider">Needs Attention</p>
                  {weakestTopics.length > 0 && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      Focus Areas
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {weakestTopics.length > 0 ? (
                    weakestTopics.map(({ topic, score }, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-700 truncate max-w-[190px]" title={topic}>{topic}</span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded-full">
                            {score >= 60 ? '📈 Developing' : '🎯 Needs Practice'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : strongestTopics.length > 0 ? (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">All Topics Mastered!</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">No weak areas identified. All tested topics have achieved strong mastery (≥70%).</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <p className="text-xs text-stone-500 font-medium">No critical weak areas detected yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

