import React from "react";
import { Award, Gamepad2, Trophy } from "lucide-react";

export const GamificationSection: React.FC = () => (
      <section
        id="gamification"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-center py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-amber-50 via-white to-amber-50 border-b border-amber-200/50 relative overflow-hidden scroll-mt-[72px]"
      >
        <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

            {/* 1st CARD (Left narrative & feature grid) */}
            <div className="reveal-on-scroll flex flex-col justify-between pl-1 sm:pl-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/95 border border-amber-300 text-amber-950 text-xs font-black shadow-2xs">
                  <Trophy className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  Learning, but make it fun
                </div>
                <h2 className="mt-2.5 text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.15rem] font-black tracking-tight text-stone-900 leading-[1.2]">
                  Rewards that make children <br className="hidden sm:inline" />want to keep going
                </h2>
                <p className="mt-2 text-stone-600 text-xs sm:text-sm leading-relaxed text-justify [text-align-last:left]">
                  Correct answers earn points. Milestones unlock badges. Daily activity builds streaks. Students can see a friendly leaderboard and take short educational brain breaks.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: '⭐',
                    title: 'Points',
                    text: 'Earn for correct answers',
                    cardBg: 'bg-gradient-to-br from-amber-100 via-amber-200/80 to-yellow-100/90 border-amber-300/90 shadow-amber-900/5',
                    iconBox: 'bg-white/90 border-amber-200/90 text-amber-700',
                    titleColor: 'text-amber-950',
                    textColor: 'text-amber-900/85',
                  },
                  {
                    icon: '🏆',
                    title: 'Badges',
                    text: 'Unlock subject milestones',
                    cardBg: 'bg-gradient-to-br from-purple-100 via-violet-200/80 to-fuchsia-100/90 border-purple-300/90 shadow-purple-900/5',
                    iconBox: 'bg-white/90 border-purple-200/90 text-purple-700',
                    titleColor: 'text-purple-950',
                    textColor: 'text-purple-900/85',
                  },
                  {
                    icon: '🔥',
                    title: 'Streaks',
                    text: 'Keep learning every day',
                    cardBg: 'bg-gradient-to-br from-rose-100 via-red-200/80 to-orange-100/90 border-rose-300/90 shadow-rose-900/5',
                    iconBox: 'bg-white/90 border-rose-200/90 text-rose-700',
                    titleColor: 'text-rose-950',
                    textColor: 'text-rose-900/85',
                  },
                  {
                    icon: '🥇',
                    title: 'Leaderboard',
                    text: 'See friendly rankings',
                    cardBg: 'bg-gradient-to-br from-sky-100 via-blue-200/80 to-cyan-100/90 border-sky-300/90 shadow-sky-900/5',
                    iconBox: 'bg-white/90 border-sky-200/90 text-sky-700',
                    titleColor: 'text-sky-950',
                    textColor: 'text-sky-900/85',
                  },
                ].map(({ icon, title, text, cardBg, iconBox, titleColor, textColor }) => (
                  <div
                    key={title}
                    className={`rounded-2xl border p-3.5 sm:p-4 shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all ${cardBg}`}
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl border shadow-2xs mb-2 transition-transform group-hover:scale-105 ${iconBox}`}>
                      {icon}
                    </div>
                    <div className={`font-black text-xs sm:text-sm ${titleColor}`}>{title}</div>
                    <div className={`text-[11px] sm:text-xs font-semibold mt-0.5 leading-snug ${textColor}`}>{text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2nd CARD (Right Interactive Rewards Showcase) */}
            <div className="group/card relative rounded-2xl sm:rounded-3xl border border-amber-200 shadow-lg hover:shadow-xl p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden reveal-on-scroll flex flex-col justify-between h-full transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-yellow-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

              {/* Header Section */}
              <div className="relative z-10 flex items-center justify-between shrink-0">
                <div>
                  <div className="text-[10px] sm:text-xs text-amber-700 font-bold uppercase tracking-wider">This Week</div>
                  <div className="text-lg sm:text-xl font-black text-stone-900 mt-0.5 group-hover/card:text-amber-700 transition-colors">
                    Rahul's Rewards
                  </div>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-yellow-500/25 transition-transform duration-300 group-hover/card:scale-105">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              {/* Reward items list */}
              <div className="relative z-10 flex-1 flex flex-col justify-between gap-2 mt-3.5 sm:mt-4">
                {[
                  [
                    "Correct answers",
                    "+120 XP",
                    "text-amber-600",
                    "bg-white/80 hover:bg-white",
                  ],
                  [
                    "7-day streak",
                    "+70 XP",
                    "text-amber-600",
                    "bg-white/80 hover:bg-white",
                  ],
                  [
                    "Geometry badge",
                    "Unlocked!",
                    "text-amber-600",
                    "bg-amber-100/60 hover:bg-amber-100",
                  ],
                  [
                    "Leaderboard",
                    "#3",
                    "text-amber-600",
                    "bg-white/80 hover:bg-white",
                  ],
                ].map(([label, value, color, bg]) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${bg} border border-white/80 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-stone-700">{label}</span>
                    <span className={`text-xs sm:text-sm font-black ${color}`}>{value}</span>
                  </div>
                ))}

                {/* 5th Box: Brain Break */}
                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200/60 shadow-xs">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-stone-900">
                    <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 animate-pulse shrink-0" />
                    <span>Brain Break</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-stone-600 mt-0.5 leading-tight">
                    Solve 3 quick puzzles and unlock a fun fact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
);
