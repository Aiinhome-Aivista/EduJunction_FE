import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ParentAccount,
  ChildAccount,
  ExamSubmission,
  Subject
} from '../../types';
import { StudentActivityLogResponse } from '../../types/api';
import {
  Users,
  TrendingUp,
  Award,
  Activity,
  Flame,
  CalendarClock,
  ChevronRight,
  Plus,
  Edit3,
  Zap,
  Clock,
  Layers,
  Sparkles
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
import { getCleanAvatar } from '../../utils/avatarUtils';
import { getExamDisplaySubject } from '../../utils/metricsEngine';

interface ParentDashboardMobileProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect: (childId: string) => void;
  onOpenAddChildModal: () => void;
  onScheduleExam?: (config: { childId: string; subject: Subject; topic: string }) => void;
  examHistory: ExamSubmission[];
  childrenMetrics: any[];
  progressCardData: { mainText: string; subText: string };
  readinessCardData: { mainText: string; subText: string };
  totalChildren: number;
  totalFamilyExams: number;
  maxFamilyStreak: number;
  activityLogData: StudentActivityLogResponse | null;
  studentWiseRecommendations: any[];
  graphBars: any[];
  hasData: boolean;
  timeframe: 'week' | 'month';
  setTimeframe: (t: 'week' | 'month') => void;
  onOpenMetricModal: (metric: 'progress' | 'readiness' | 'activity') => void;
  onStartEditChild: (child: ChildAccount) => void;
}

export const ParentDashboardMobile: React.FC<ParentDashboardMobileProps> = ({
  parentAccount,
  activeChildId,
  onChildSelect,
  onOpenAddChildModal,
  onScheduleExam,
  examHistory,
  childrenMetrics,
  progressCardData,
  readinessCardData,
  totalChildren,
  totalFamilyExams,
  maxFamilyStreak,
  activityLogData,
  studentWiseRecommendations,
  graphBars,
  hasData,
  timeframe,
  setTimeframe,
  onOpenMetricModal,
  onStartEditChild,
}) => {
  const navigate = useNavigate();
  const [mobileTab, setMobileTab] = useState<'children' | 'progress' | 'recommendations'>('children');

  const parentTotalExams = activityLogData?.summary?.totalExams ?? totalFamilyExams;
  const parentTotalBreaks = activityLogData?.summary?.totalMindBreaks ?? 0;
  const parentTotalActivities = parentTotalExams + parentTotalBreaks;
  const parentStreak = activityLogData?.summary?.currentStreakDays ?? maxFamilyStreak;

  return (
    <div className="flex sm:hidden flex-col gap-3.5 pb-28">

      {/* ── 1. Compact Quick Stats Carousel (Native Mobile Strip) ── */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 -mx-3 px-3">
        {/* Chip 1: Children */}
        <div
          onClick={() => setMobileTab('children')}
          className="flex-shrink-0 bg-gradient-to-br from-yellow-50 to-amber-50/70 px-2.5 py-1.5 rounded-xl border border-yellow-200/90 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-yellow-400/20 text-yellow-800 flex items-center justify-center font-bold shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-stone-900 leading-tight">
              {totalChildren} {totalChildren === 1 ? 'Child' : 'Children'}
            </div>
            <div className="text-[9px] text-amber-800 font-medium">All active</div>
          </div>
        </div>

        {/* Chip 2: Overall Progress */}
        <div
          onClick={() => onOpenMetricModal('progress')}
          className="flex-shrink-0 bg-gradient-to-br from-emerald-50 to-teal-50/70 px-2.5 py-1.5 rounded-xl border border-emerald-200/90 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-800 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-stone-900 leading-tight">{progressCardData.mainText}</div>
            <div className="text-[9px] text-emerald-700 font-medium truncate">{progressCardData.subText}</div>
          </div>
        </div>

        {/* Chip 3: Readiness */}
        <div
          onClick={() => onOpenMetricModal('readiness')}
          className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50/70 px-2.5 py-1.5 rounded-xl border border-blue-200/90 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-400/20 text-blue-800 flex items-center justify-center font-bold shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-stone-900 leading-tight">{readinessCardData.mainText}</div>
            <div className="text-[9px] text-blue-700 font-medium truncate">{readinessCardData.subText}</div>
          </div>
        </div>

        {/* Chip 4: Focus & Activity */}
        <div
          onClick={() => onOpenMetricModal('activity')}
          className="flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-50/70 px-2.5 py-1.5 rounded-xl border border-indigo-200/90 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-400/20 text-indigo-800 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black text-stone-900 leading-tight">🔥 {parentStreak}d Streak</div>
            <div className="text-[9px] text-indigo-700 font-medium truncate">{parentTotalActivities} Activities</div>
          </div>
        </div>
      </div>

      {/* ── 2. Segmented Mobile Tabs (Identical to Student Dashboard) ── */}
      <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200/80 shadow-2xs gap-1">
        <button
          onClick={() => setMobileTab('children')}
          className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'children'
              ? 'bg-amber-400 text-stone-950 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Children ({totalChildren})</span>
        </button>

        <button
          onClick={() => setMobileTab('progress')}
          className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'progress'
              ? 'bg-amber-400 text-stone-950 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Progress</span>
        </button>

        <button
          onClick={() => setMobileTab('recommendations')}
          className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'recommendations'
              ? 'bg-amber-400 text-stone-950 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Tasks ({studentWiseRecommendations.length})</span>
        </button>
      </div>

      {/* ── 3. Tab 1: Children List ── */}
      {mobileTab === 'children' && (
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h3 className="text-xs font-bold text-stone-900 tracking-tight">Children Learning Profiles</h3>
              <p className="text-[10px] text-stone-500 font-medium">1-tap diagnostic assign & detailed tracking</p>
            </div>
            <button
              onClick={onOpenAddChildModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-xs font-black text-stone-950 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Children Cards */}
          {parentAccount.children.map((child) => {
            const isChildActive = activeChildId === child.id;
            const cm = childrenMetrics.find(m => m.child.id === child.id);
            const scorePct = cm?.scorePct ?? 0;
            const readiness = cm?.readinessScore ?? 0;
            const latestExam = cm?.latestExam;

            const childMasteryEntries = Object.entries(child.topicMastery || {}).map(([t, v]) => ({ topic: t, score: Number(v) || 0 }));
            const strongList = childMasteryEntries.filter(m => m.score >= 70).sort((a, b) => b.score - a.score);
            const weakList = childMasteryEntries.filter(m => m.score < 70).sort((a, b) => a.score - b.score);
            const strongestTopic = strongList.length > 0 ? strongList[0].topic : 'Curriculum Fundamentals';
            const weakestTopic = weakList.length > 0 ? weakList[0].topic : 'Comprehensive Review';

            return (
              <div
                key={child.id}
                className={`bg-white rounded-2xl border p-2.5 shadow-2xs relative flex flex-col gap-2 transition-all ${
                  isChildActive ? 'border-amber-300 ring-2 ring-yellow-400/20 shadow-xs' : 'border-stone-200/90'
                }`}
              >
                {/* Child Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      {getCleanAvatar(child.avatar, child.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-stone-900 truncate">{child.name}</h4>
                        <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          LVL {child.level || 1}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-stone-500 font-medium truncate">
                        {child.classGrade} • {child.targetBoard}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartEditChild(child)}
                    className="p-1 text-stone-400 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-all shadow-2xs shrink-0 cursor-pointer"
                    title="Edit profile"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* 3 Metric Summary Chips */}
                <div className="grid grid-cols-3 gap-1 bg-stone-50/80 py-1.5 px-2 rounded-xl border border-stone-100 text-center">
                  <div className="min-w-0">
                    <span className="text-[8.5px] uppercase font-bold text-stone-400 block truncate">Progress</span>
                    <span className="text-[11px] font-black text-amber-700">{scorePct}%</span>
                  </div>
                  <div className="min-w-0 border-l border-stone-200/70">
                    <span className="text-[8.5px] uppercase font-bold text-stone-400 block truncate">Readiness</span>
                    <span className="text-[11px] font-black text-stone-800">{readiness}%</span>
                  </div>
                  <div className="min-w-0 border-l border-stone-200/70">
                    <span className="text-[8.5px] uppercase font-bold text-stone-400 block truncate">Latest Test</span>
                    <span className="text-[11px] font-black text-stone-800">
                      {latestExam ? `${latestExam.marksObtained}/${latestExam.totalMarks}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Strengths & Weakness Pills */}
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      Strong
                    </span>
                    <span className="text-stone-700 font-medium truncate text-[10px]">
                      {strongestTopic}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 shrink-0">
                      Focus
                    </span>
                    <span className="text-stone-700 font-medium truncate text-[10px]">
                      {weakestTopic}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-1.5 border-t border-stone-100/90 gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{child.streakDays || 0}d</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onChildSelect(child.id);
                        navigate('/schedule-exam');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <CalendarClock className="w-2.5 h-2.5 text-amber-700" />
                      <span>Schedule</span>
                    </button>
                    <button
                      onClick={() => {
                        onChildSelect(child.id);
                        navigate('/children');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-stone-950 text-[10px] font-black shadow-2xs transition-all flex items-center gap-0.5 cursor-pointer active:scale-95"
                    >
                      <span>Progress</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── 3.1 Recent Tasks List (Top 5 items + View all link) ── */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs space-y-2 mt-1">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Zap className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">Recent Tasks</h4>
                  <p className="text-[9.5px] text-stone-500 font-medium">Recommended practice challenges for children</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileTab('recommendations')}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition-all active:scale-95"
              >
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {studentWiseRecommendations.length > 0 ? (
              <div className="space-y-1.5">
                {studentWiseRecommendations.slice(0, 5).map((rec) => (
                  <div
                    key={rec.childId}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50/80 hover:bg-amber-50/40 border border-stone-100 hover:border-amber-200 transition-all gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/60 border border-amber-200/60 flex items-center justify-center text-sm shrink-0">
                        {getCleanAvatar(rec.avatar, rec.childName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-stone-900 truncate">{rec.childName}</span>
                          <span className="text-[9px] text-stone-400 font-medium truncate">• {rec.classGrade}</span>
                        </div>
                        <p className="text-[10px] text-stone-700 font-semibold truncate">
                          {rec.subject}: <span className="text-amber-900 font-bold">{rec.topic}</span>
                        </p>
                        <p className="text-[8.5px] text-stone-400 truncate">
                          {rec.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
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
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 font-black text-[10px] shadow-2xs active:scale-95 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-stone-700">All children up to date</p>
                <p className="text-[10px] text-stone-400 mt-0.5">No immediate remedial tasks required</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Tab 2: Progress & Trend Chart ── */}
      {mobileTab === 'progress' && (
        <div className="space-y-3.5">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-900">Family Learning Progress</h3>
                <p className="text-[10px] text-stone-500 font-medium">Diagnostic score trends over time</p>
              </div>
              <div className="flex gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                <button
                  onClick={() => setTimeframe('week')}
                  className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                    timeframe === 'week' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeframe('month')}
                  className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                    timeframe === 'month' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="h-48 w-full">
              {!hasData ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center p-4">
                  <TrendingUp className="w-6 h-6 text-stone-300 mb-1" />
                  <p className="text-xs font-bold text-stone-600">No score history yet</p>
                  <p className="text-[10px] text-stone-400">Complete tests to unlock trend curves</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphBars} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mobColorPct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#78716c', fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#78716c', fontWeight: 500 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', fontSize: '11px', border: '1px solid #e7e5e4' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Area
                      type="monotone"
                      dataKey="pct"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#mobColorPct)"
                      connectNulls={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Results Mobile Strip */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900">Recent Completed Tests</span>
              <button
                onClick={() => navigate('/reports')}
                className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5"
              >
                View all →
              </button>
            </div>

            {examHistory.length > 0 ? (
              <div className="space-y-1.5">
                {examHistory.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-stone-900 block truncate text-[11px]">{sub.studentName}</span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {getExamDisplaySubject(sub)} • {sub.difficulty}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-amber-700 text-xs block">
                        {sub.marksObtained}/{sub.totalMarks || 15}
                      </span>
                      <span className="text-[9px] text-stone-400">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-3 text-center">No completed tests yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Tab 3: Recommended Next Steps ── */}
      {mobileTab === 'recommendations' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h3 className="text-xs font-bold text-stone-900">Recommended Challenges</h3>
              <p className="text-[10px] text-stone-500 font-medium">Personalized targeted practice per child</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {studentWiseRecommendations.length} Tasks
            </span>
          </div>

          {studentWiseRecommendations.length > 0 ? (
            studentWiseRecommendations.map((rec) => (
              <div
                key={rec.childId}
                className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{getCleanAvatar(rec.avatar, rec.childName)}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-stone-900 truncate block">{rec.childName}</span>
                      <span className="text-[10px] text-amber-800 font-semibold">{rec.classGrade} • {rec.targetBoard}</span>
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
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 font-black text-[11px] shadow-2xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Assign</span>
                  </button>
                </div>

                <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <div className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                    <span>{rec.icon}</span>
                    <span className="truncate">{rec.topic}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                    {rec.reason}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-stone-700">All children up to date</p>
              <p className="text-[10px] text-stone-500 mt-0.5">No immediate remedial tests required</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

