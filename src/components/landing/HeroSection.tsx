import React from "react";
import { ArrowRight, Brain, FileText, Play, Zap } from "lucide-react";

interface HeroSectionProps {
  onOpenAuth: (mode?: "login" | "register", persona?: "parent" | "student") => void;
  onScrollTo: (targetId: string, duration?: number) => void;
  onNavigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onScrollTo, onNavigate }) => (
      <section
        id="hero"
        className="relative isolate overflow-hidden bg-white pt-[72px] min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between"
      >
        {/* FULL HERO SQUARE GRID BACKGROUND */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-stone-50/60 to-amber-50/40" />
          <div className="hero-grid absolute inset-0" />
          <div className="absolute -top-32 right-[-8%] h-[34rem] w-[34rem] rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
        </div>
        {/* MARQUEE TICKER - Restricted to and scrolling with the Hero Section */}
        {/* <div className="w-full overflow-hidden relative z-30 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600/30 shadow-xs select-none shrink-0">
          <div
            className="flex items-center whitespace-nowrap w-max"
            style={{ animation: "navMarquee 80s linear infinite" }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span key={i} className="flex items-center gap-3 pr-12">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <span>{i % 2 === 0 ? "✨" : "🎯"}</span>{" "}
                  {i % 2 === 0 ? "NEW" : "TIPS"}
                </span>
                <span className="text-stone-950 font-medium text-sm sm:text-base tracking-normal">
                  {i % 2 === 0 ? (
                    <>
                      Free Mock Test &amp; Model Test Papers for{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        CBSE
                      </span>
                      ,{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        ICSE
                      </span>{" "}
                      &amp;{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        ISC
                      </span>{" "}
                      Boards
                    </>
                  ) : (
                    <>Practice smart. Prepare better.</>
                  )}
                </span>
              </span>
            ))}
          </div>
        </div> */}

        {/* HERO MAIN CONTENT GRID (Vertically Centered with min-h-0) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-3 flex-1 min-h-0 flex items-center w-full">
          <div className="grid lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-6 items-center w-full">
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Top Badges (Quick Test & Study Buddy) - Positioned higher with generous bottom margin */}
              <div className="mb-4 sm:mb-7 lg:mb-9">
                {/* Floating Glowing Quick Test Badge (React Bits Style) */}
                <div className="flex items-center justify-start">
                  <style>{`
                    @keyframes float-badge {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-5px); }
                    }
                    @keyframes surface-flow {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    .animate-float-badge {
                      animation: float-badge 4s ease-in-out infinite;
                    }
                    .animate-surface-flow {
                      background: linear-gradient(135deg, #ffffff 0%, #fef08a 22%, #ffffff 40%, #8fc57e 58%, #b2dc9e 68%, #fde68a 84%, #ffffff 100%);
                      background-size: 300% 300%;
                      animation: surface-flow 6s ease infinite;
                    }
                  `}</style>
                  <button
                    type="button"
                    onClick={() => onNavigate("/quick-test")}
                    className="group relative inline-flex items-center animate-float-badge cursor-pointer"
                  >
                    {/* Button Surface with Tricolor Animated Flow - Squarish rounded-2xl matching Sign Up button */}
                    <span className="relative inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-2xl animate-surface-flow backdrop-blur-md border border-amber-300/90 group-hover:border-[#508244]/70 transition-all duration-300 overflow-hidden shadow-2xs">
                      <span className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 group-hover:rotate-12 transition-transform duration-300">
                        <Zap className="w-3.5 h-3.5 fill-stone-950 stroke-stone-950" />
                      </span>
                      <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-stone-900 group-hover:text-amber-700 transition-colors">
                        Take a Free Quick Test
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Main Headline */}
              <h1
                className="text-[2.55rem] sm:text-6xl lg:text-6xl xl:text-7xl font-black leading-[1.02] sm:leading-[1.05] tracking-tight [word-spacing:0.08em] sm:[word-spacing:0.2em] capitalize mb-3.5 sm:mb-4 lg:mb-5"
                style={{ wordSpacing: '0.2em' }}
              >
                LEARN SMARTER
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500 mt-1 sm:mt-1.5">
                  GROW BETTER
                </span>
              </h1>

              {/* Subheading Description */}
              <p className="text-[13px] sm:text-base lg:text-lg text-stone-600 leading-relaxed max-w-xl sm:max-w-2xl text-left sm:text-justify sm:[text-align-last:left]">
                EduJunction is the leading Learning Platform for CBSE, ICSE &
                ISC Success.
                It empowers students to master every
                subject with practice, instant step-by-step feedback,
                personalized study paths, and exam-ready mock tests. Transform
                your prep, boost your confidence, and score top marks
                effortlessly!
              </p>

              {/* CTA Action Buttons - Pushed lower down with generous top padding */}
              <div className="pt-5 sm:pt-8 lg:pt-10 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-8">
                <button
                  onClick={() => onOpenAuth("register")}
                  className="w-full min-w-0 px-1.5 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-extrabold shadow-yellow-200 flex items-center justify-center gap-1 sm:gap-2.5 cursor-pointer text-[10px] sm:text-base whitespace-nowrap border border-amber-400/60"
                >
                  Sign Up For FREE <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onScrollTo('actions-demo', 950)}
                  className="w-full min-w-0 px-1.5 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-white hover:text-yellow-300 font-bold flex items-center justify-center gap-1 sm:gap-2.5 transition-all duration-200 shadow-sm text-[10px] sm:text-base whitespace-nowrap border border-stone-800 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  See How It Works
                </button>
              </div>

              {/* Process Steps (1. Assess -> 2. Analyze -> 3. Learn -> 4. Improve) - Squarish rounded-xl matching buttons */}
              <div className="mt-5 sm:mt-7 grid grid-cols-4 items-center gap-1 sm:flex sm:flex-wrap sm:gap-2.5 pb-1 text-[9px] min-[390px]:text-[10px] sm:text-sm font-bold text-stone-700">
                {['Assess', 'Analyze', 'Learn', 'Improve'].map((item, i) => (
                  <React.Fragment key={item}>
                    <span
                      className="w-full sm:w-auto px-0.5 min-[390px]:px-1 sm:px-3.5 py-1.5 rounded-xl text-center text-white shadow-2xs whitespace-nowrap"
                      style={{
                        backgroundColor: ['#fef3c7', '#f0f9ff', '#fff1f2', '#ecfdf5'][i],
                        borderColor: ['#fcd34d', '#7dd3fc', '#fda4af', '#6ee7b7'][i],
                        color: ['#78350f', '#0c4a6e', '#881337', '#064e3b'][i],
                        borderWidth: '1px',
                      }}
                    >
                      {i + 1}. {item}
                    </span>
                    {i < 3 && <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* HERO RIGHT IMAGE */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-full min-h-0 py-1">
              <style>{`
                @keyframes float-animation {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                .animate-float-hero {
                  animation: float-animation 6s ease-in-out infinite;
                }
                @keyframes float-chip-1 {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-7px); }
                }
                @keyframes float-chip-2 {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                .animate-float-chip-1 {
                  animation: float-chip-1 5.5s ease-in-out infinite 0.4s;
                }
                .animate-float-chip-2 {
                  animation: float-chip-2 6.2s ease-in-out infinite 1.2s;
                }
              `}</style>

              <img
                src="/hero-duo-students-cutout.png"
                alt="EduJunction Study Buddies"
                className="w-auto h-auto max-h-[220px] sm:max-h-[440px] lg:max-h-[min(34rem,calc(100vh-230px))] xl:max-h-[min(36rem,calc(100vh-230px))] max-w-full object-contain animate-float-hero select-none relative z-10"
              />

              {/* Floating Glass Info Chip 1 (Top-Left) */}
              <div className="group absolute left-[-40px] sm:left-[-48px] lg:left-[-36px] xl:left-[-24px] top-[16%] z-20 hidden items-center gap-2.5 rounded-2xl border border-white/60 bg-white/40 px-3.5 py-2.5 ring-1 ring-stone-900/5 backdrop-blur-md animate-float-chip-1 transition-all duration-300 hover:bg-white/60 lg:flex select-none">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/90 text-amber-700">
                  <Brain className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-semibold text-stone-900">Concept Mastery</span>
                  <span className="block text-[11px] text-stone-600">Step-by-step feedback</span>
                </span>
              </div>

              {/* Floating Glass Info Chip 2 (Bottom-Right) */}
              <div className="group absolute bottom-[14%] right-[-36px] sm:right-[-44px] lg:right-[-32px] xl:right-[-20px] z-20 hidden items-center gap-2.5 rounded-2xl border border-white/60 bg-white/40 px-3.5 py-2.5 ring-1 ring-stone-900/5 backdrop-blur-md animate-float-chip-2 transition-all duration-300 hover:bg-white/60 lg:flex select-none">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/90 text-emerald-700">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-semibold text-stone-900">Exam-ready mock tests</span>
                  <span className="block text-[11px] text-stone-600">Personalized study paths</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden relative z-30 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600/30 shadow-xs select-none shrink-0">
          <div
            className="flex items-center whitespace-nowrap w-max"
            style={{ animation: "navMarquee 80s linear infinite" }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span key={i} className="flex items-center gap-3 pr-12">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <span>{i % 2 === 0 ? "✨" : "🎯"}</span>{" "}
                  {i % 2 === 0 ? "NEW" : "TIPS"}
                </span>
                <span className="text-stone-950 font-medium text-sm sm:text-base tracking-normal">
                  {i % 2 === 0 ? (
                    <>
                      Free Mock Test &amp; Model Test Papers for{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        CBSE
                      </span>
                      ,{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        ICSE
                      </span>{" "}
                      &amp;{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        ISC
                      </span>{" "}
                      Boards
                    </>
                  ) : (
                    <>Practice smart. Prepare better.</>
                  )}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* INTEGRATED QUICK VALUE BAR (Assess, Insights, Path, Rewards) */}
        {/* <div className="w-full bg-white/85 backdrop-blur-md border-t border-amber-200/80 py-2.5 sm:py-3 relative z-20 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {[
                ["📝", "Assess", "Find what you know"],
                ["🤖", "Study Buddy Insights", "Find where you need help"],
                ["🎯", "Personal Path", "Get the right next step"],
                ["🏆", "Rewards", "Stay motivated"],
              ].map(([icon, title, text]) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-2xs">
                    {icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-stone-900">
                      {title}
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-stone-600">
                      {text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </section>
);
