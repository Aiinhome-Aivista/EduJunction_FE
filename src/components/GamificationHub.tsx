import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Crown,
  Star,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  Filter,
  Users,
  Search,
  Shield,
  Clock,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import {
  ChildAccount,
  Badge,
  LeaderboardEntry,
  BadgeCategory,
  Board,
  ClassGrade,
  ExamSubmission
} from '../types';
import { calculateStudentMetrics } from '../utils/metricsEngine';

interface GamificationHubProps {
  activeChild: ChildAccount;
  allBadges: Badge[];
  leaderboard: LeaderboardEntry[];
  activePersona?: 'parent' | 'child';
  examHistory?: ExamSubmission[];
  onSelectStudentToCompare?: (studentId: string) => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  activeChild,
  allBadges,
  leaderboard,
  activePersona = 'parent',
  examHistory = [],
  onSelectStudentToCompare
}) => {
  const isStudentPersona = activePersona === 'child';
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');
  const [badgeFilter, setBadgeFilter] = useState<BadgeCategory | 'all'>('all');
  const [boardFilter, setBoardFilter] = useState<Board | 'all'>(() => isStudentPersona ? activeChild.targetBoard : 'all');
  const [gradeFilter, setGradeFilter] = useState<ClassGrade | 'all'>(() => isStudentPersona ? activeChild.classGrade : 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Automatically sync to child's cohort when in Student Persona
  useEffect(() => {
    if (isStudentPersona) {
      setBoardFilter(activeChild.targetBoard);
      setGradeFilter(activeChild.classGrade);
    } else {
      setBoardFilter('all');
      setGradeFilter('all');
    }
  }, [activeChild.id, isStudentPersona, activeChild.targetBoard, activeChild.classGrade]);

  // Child's current stats
  const childXP = activeChild.xp || 0;
  const childLevel = activeChild.level || Math.floor(childXP / 250) + 1;
  const nextLevelXP = childLevel * 250;
  const currentLevelBaseXP = (childLevel - 1) * 250;
  const progressToNextLevel = Math.min(100, Math.max(0, Math.round(((childXP - currentLevelBaseXP) / 250) * 100)));

  const earnedBadgeIds = activeChild.earnedBadgeIds || [];

  // Unified Student Analytics Metrics (SSOT)
  const metrics = React.useMemo(() => {
    return calculateStudentMetrics(activeChild, examHistory || []);
  }, [activeChild, examHistory]);

  // Dynamic Rank in Leaderboard Cohort
  const currentStudentRank = React.useMemo(() => {
    if (isStudentPersona) {
      // Cohort: same Target Board and Class Grade
      const cohortStudents = leaderboard.filter(
        (e) => e.targetBoard === activeChild.targetBoard && e.classGrade === activeChild.classGrade
      );
      const myCohortIndex = cohortStudents.findIndex(
        (e) => e.studentId === activeChild.id || e.isCurrentStudent
      );
      if (myCohortIndex !== -1) {
        const rank = myCohortIndex + 1;
        return rank === 1 ? '#1 Rank' : rank <= 3 ? `Top #${rank}` : `Rank #${rank}`;
      }
      return cohortStudents.length > 0 ? '#1 Rank' : '#1 Rank';
    } else {
      // Global Persona (Parent viewing across all students)
      const myIndex = leaderboard.findIndex(
        (e) => e.studentId === activeChild.id || e.isCurrentStudent
      );
      if (myIndex !== -1) {
        const rank = myIndex + 1;
        return rank === 1 ? '#1 Rank' : rank <= 3 ? `Top #${rank}` : `Rank #${rank}`;
      }
      const total = leaderboard.length;
      return total > 0 ? `Rank #${Math.min(total, 1)}` : 'Calibrating';
    }
  }, [leaderboard, activeChild.id, activeChild.targetBoard, activeChild.classGrade, isStudentPersona]);

  // Filter leaderboard
  const filteredLeaderboard = leaderboard.filter((entry) => {
    const matchBoard = boardFilter === 'all' || entry.targetBoard === boardFilter;
    const matchGrade = gradeFilter === 'all' || entry.classGrade === gradeFilter;
    const matchSearch = searchQuery.trim() === '' ||
      entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.schoolName && entry.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchBoard && matchGrade && matchSearch;
  });

  // Filter badges
  const filteredBadges = allBadges.filter((b) => {
    return badgeFilter === 'all' || b.category === badgeFilter;
  });

  const unlockedBadgesCount = allBadges.filter(b => earnedBadgeIds.includes(b.id)).length;

  return (
    <div className="space-y-4">
      {/* Top Gamification Status Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
            {activeChild.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{activeChild.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                Level {childLevel} Scholar
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {activeChild.classGrade} • {activeChild.targetBoard} • {activeChild.schoolName || 'School Student'}
            </p>
          </div>
        </div>

        {/* XP Progress Meter */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-stone-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{childXP} EduPoints (XP)</span>
            </span>
            <span className="text-[11px] text-stone-400 font-semibold">
              Next Level: {nextLevelXP} XP
            </span>
          </div>

          <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>Level {childLevel}</span>
            <span>{progressToNextLevel}% completed</span>
            <span>Level {childLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* 4 Gamification Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{activeChild.streakDays || metrics.streak} Days</p>
          <span className="text-[10px] text-stone-400 font-semibold">+30 XP per active day</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Badges Earned</span>
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{unlockedBadgesCount} / {allBadges.length}</p>
          <span className="text-[10px] text-yellow-600 font-semibold">Trophies & Milestones</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Average Accuracy</span>
            <Target className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{metrics.scorePct}%</p>
          <span className="text-[10px] text-yellow-600 font-semibold">Across {metrics.totalExams} {metrics.totalExams === 1 ? 'Sprint' : 'Sprints'}</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">{isStudentPersona ? 'Cohort Rank' : 'Global Rank'}</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{currentStudentRank}</p>
          <span className="text-[10px] text-amber-600 font-semibold">
            {isStudentPersona ? `In ${activeChild.targetBoard} (${activeChild.classGrade})` : `Across All Registrations`}
          </span>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'leaderboard'
              ? 'bg-yellow-400 text-stone-900 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
            }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Global & Board Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'badges'
              ? 'bg-yellow-400 text-stone-900 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
            }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Trophies Showcase ({unlockedBadgesCount}/{allBadges.length})</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Leaderboard Filters */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {isStudentPersona ? (
              /* Student View: No Board/Grade Dropdowns, Only Global Search + Enrolled Cohort Indicator */
              <div className="flex items-center gap-3 flex-wrap flex-1">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search ${activeChild.classGrade} students or school...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-300/80 text-xs font-bold text-yellow-900 shadow-2xs">
                  <Users className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>Cohort: {activeChild.classGrade} • {activeChild.targetBoard}</span>
                </div>
              </div>
            ) : (
              /* Parent View: Full Comparative Filters across all boards and classes */
              <div className="flex items-center gap-3 flex-wrap flex-1">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student or school..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                {/* Board */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-500">Board:</span>
                  <select
                    value={boardFilter}
                    onChange={(e) => setBoardFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
                  >
                    <option value="all">All Boards</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="ISC">ISC</option>
                    <option value="WBBSE">WBBSE</option>
                    <option value="UK-Cambridge">UK-Cambridge</option>
                    <option value="NCERT">NCERT</option>
                    <option value="NEET">NEET</option>
                    <option value="IIT">IIT JEE</option>
                  </select>
                </div>

                {/* Grade */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-500">Grade:</span>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
                  >
                    <option value="all">All Classes</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>
            )}

            <span className="text-xs text-stone-400">
              Showing {filteredLeaderboard.length} candidates
            </span>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
            <div className="divide-y divide-stone-100">
              {filteredLeaderboard.map((entry, index) => {
                const displayRank = index + 1;
                const isTop1 = displayRank === 1;
                const isTop2 = displayRank === 2;
                const isTop3 = displayRank === 3;
                const isSelf = entry.isCurrentStudent || entry.studentId === activeChild.id;

                return (
                  <div
                    key={entry.studentId}
                    className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${isSelf ? 'bg-yellow-50/70 hover:bg-yellow-50 border-l-4 border-l-yellow-600' : 'hover:bg-stone-50/80'
                      }`}
                  >
                    {/* Rank & Student Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 flex items-center justify-center shrink-0">
                        {isTop1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="w-7 h-7 rounded-full bg-stone-200 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-900 font-bold text-xs flex items-center justify-center shadow-2xs">
                            🥉
                          </span>
                        ) : (
                          <span className="font-bold text-xs text-stone-400">
                            #{displayRank}
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl shrink-0">
                        {entry.avatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900 truncate">{entry.studentName}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-yellow-400 text-stone-900">
                              You
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {entry.classGrade} • {entry.targetBoard}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 truncate mt-0.5">
                          {entry.schoolName || 'School Candidate'}
                        </p>
                      </div>
                    </div>

                    {/* Stats & XP Pill */}
                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-stone-800 block">
                          {isSelf ? `${metrics.scorePct}% Avg` : `${Math.round(Number(entry.averageScore || 0))}% Avg`}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {isSelf ? metrics.totalExams : entry.examsCompleted} sprints • {isSelf ? (metrics.streak || activeChild.streakDays || 0) : entry.streakDays}d streak
                        </span>
                      </div>

                      <div className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-right shadow-2xs">
                        <span className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {entry.xp} XP
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400 block">Lvl {entry.level}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP & Rewards Calculation Guide */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
            <h3 className="font-bold text-xs text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>How to Earn EduPoints (XP) & Climb the Ranks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block mb-1">🎯 Correct Answers</span>
                <p className="text-stone-500">+10 XP for every question answered correctly in 10-mark sprints.</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block mb-1">🏆 Perfect 10/10 Bonus</span>
                <p className="text-stone-500">+50 XP bonus for scoring full marks with zero misconception slips.</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block mb-1">🔥 Daily Streak Power</span>
                <p className="text-stone-500">+30 XP daily multiplier for consecutive diagnostic test days.</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block mb-1">⏱️ Velocity Sprint</span>
                <p className="text-stone-500">+25 XP speed bonus for finishing accurate sprints in &lt;6 mins.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BADGES & TROPHIES */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          {/* Badge Category Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'mastery', 'streak', 'score', 'speed', 'explorer'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setBadgeFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${badgeFilter === cat
                    ? 'bg-yellow-400 text-stone-900 shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
              >
                {cat === 'all' ? 'All Trophies' : cat}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = earnedBadgeIds.includes(badge.id);

              let tierStyle = {
                badge: 'bg-amber-100 text-amber-800 border-amber-200',
                card: 'border-stone-200'
              };

              if (badge.tier === 'silver') {
                tierStyle = {
                  badge: 'bg-stone-100 text-stone-800 border-stone-300',
                  card: 'border-stone-200'
                };
              } else if (badge.tier === 'gold') {
                tierStyle = {
                  badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                  card: 'border-amber-200 ring-1 ring-amber-100'
                };
              } else if (badge.tier === 'diamond') {
                tierStyle = {
                  badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                  card: 'border-cyan-200 ring-1 ring-cyan-100'
                };
              }

              return (
                <div
                  key={badge.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${isUnlocked
                      ? tierStyle.card
                      : 'border-dashed border-stone-300 bg-stone-50/40 opacity-75'
                    }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-2xs ${isUnlocked ? 'bg-white border-stone-200' : 'bg-stone-100 border-stone-200 grayscale'
                        }`}>
                        {badge.icon}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${tierStyle.badge}`}>
                          {badge.tier}
                        </span>
                        {isUnlocked ? (
                          <span className="p-1 bg-yellow-100 text-yellow-700 rounded-full" title="Unlocked">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 bg-stone-200 text-stone-500 rounded-full" title="Locked">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-stone-900 mb-1">{badge.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mb-3">{badge.description}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-400 font-medium truncate max-w-[140px]">
                      {isUnlocked && badge.unlockedAt ? `Unlocked on ${new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : badge.requirementText}
                    </span>

                    <span className={`font-bold px-2 py-0.5 rounded-md border shrink-0 ${isUnlocked
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-stone-500 bg-stone-100 border-stone-200'
                      }`}>
                      {isUnlocked ? 'Unlocked 🏆' : 'Milestone'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
