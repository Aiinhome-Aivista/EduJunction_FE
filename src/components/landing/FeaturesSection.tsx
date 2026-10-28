import React from "react";
import { createPortal } from "react-dom";
import { Target, Brain, TrendingUp, Trophy, BarChart3, MessageSquare, Sparkles, ChevronDown, ArrowRight, CheckCircle2, X, Zap, Users, BookOpen, Lightbulb, Award, Star, Play, Lock, ShieldCheck, ExternalLink, RotateCcw, HelpCircle } from "lucide-react";

interface FeaturesSectionProps {
  mobileFeaturesExpanded: boolean;
  setMobileFeaturesExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  activeFeatureModal: string | null;
  onSetActiveFeatureModal: React.Dispatch<React.SetStateAction<string | null>>;
  demoMcqSelected: number | null;
  onSetDemoMcqSelected: React.Dispatch<React.SetStateAction<number | null>>;
  onOpenAuth: (mode?: "login" | "register", persona?: "parent" | "student") => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ mobileFeaturesExpanded, setMobileFeaturesExpanded, activeFeatureModal, onSetActiveFeatureModal, demoMcqSelected, onSetDemoMcqSelected, onOpenAuth }) => (
      <section
        id="features"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-center py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-stone-50/60 via-amber-50/20 to-white border-b border-stone-200/60 relative scroll-mt-[72px] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col justify-center my-auto">
          <div className="text-center max-w-4xl mx-auto mb-5 sm:mb-6 reveal-on-scroll shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-100/90 border border-yellow-300/80 text-yellow-900 text-xs sm:text-sm font-black shadow-2xs">
              <Sparkles className="w-4 h-4 text-yellow-600 animate-pulse" />
              What You Can Do
            </div>
            <h2
              className="mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight uppercase text-stone-900 leading-tight whitespace-normal sm:whitespace-nowrap"
              style={{ wordSpacing: "0.2em" }}
            >
              EVERYTHING YOU NEED TO{" "}
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
                KNOW BETTER
              </span>
            </h2>
            <p className="mt-1 text-stone-600 text-xs sm:text-sm xl:text-base font-medium max-w-xl mx-auto leading-relaxed">
              Simple tools for learning, practice, motivation and communication.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4.5">
            {[
              {
                id: "smart-assessment",
                icon: Target,
                tag: "Diagnostic Engine",
                title: "Smart Assessment",
                subtitle:
                  "Adaptive diagnostic testing calibrated to ICSE & CBSE standards",
                text: "Take short assessments that show exactly which topics need attention.",
                cardBg:
                  "bg-amber-100/85 hover:bg-amber-100 border-amber-300/90 hover:border-amber-400",
                tagStyle: "bg-white/95 text-amber-900 border-amber-300/80",
                titleHover: "group-hover:text-amber-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-amber-500/15",
                buttonDefault:
                  "bg-amber-500 text-white border-amber-600/40 shadow-xs shadow-amber-500/20",
                buttonHover:
                  "group-hover:bg-amber-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-amber-500/30",
                tags: [
                  "Chapter Quizzes",
                  "Step-by-Step",
                  "Auto-Grade",
                ],
                highlights: [
                  "Chapter-wise diagnostic quizzes (5-10 mins)",
                  "Step-by-step marking scheme aligned to CBSE/ICSE blueprint",
                  "Instant auto-grading with explanation for wrong answers",
                  "Detects speed vs accuracy bottlenecks",
                ],
              },
              {
                id: "study-buddy",
                icon: Brain,
                tag: "AI Mentor",
                title: "Study Buddy Insights",
                subtitle:
                  "mentor analyzing student learning behavior and common traps",
                text: "Study Buddy finds strengths, weak areas and common mistake patterns.",
                cardBg:
                  "bg-yellow-100/85 hover:bg-yellow-100 border-yellow-300/90 hover:border-yellow-400",
                tagStyle: "bg-white/95 text-yellow-900 border-yellow-300/80",
                titleHover: "group-hover:text-yellow-800",
                cardHoverGlow: "hover:shadow-xl hover:shadow-yellow-500/15",
                buttonDefault:
                  "bg-yellow-500 text-stone-900 border-yellow-600/40 shadow-xs shadow-yellow-500/20",
                buttonHover:
                  "group-hover:bg-yellow-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-yellow-500/30",
                tags: [
                  "Misconceptions",
                  "Targeted Revision",
                  "Study Plan",
                ],
                highlights: [
                  "Identifies misconception patterns before exam day",
                  "Recommends targeted concept revision sheets",
                  "Tracks prerequisite gaps across previous classes",
                  "Personalized  study scheduler",
                ],
              },
              {
                id: "personalized",
                icon: TrendingUp,
                tag: "Adaptive Roadmap",
                title: "Personalized Learning",
                subtitle:
                  "Dynamic learning roadmap that scales with student performance",
                text: "Get lessons, resources and practice based on your current level.",
                cardBg:
                  "bg-orange-100/85 hover:bg-orange-100 border-orange-300/90 hover:border-orange-400",
                tagStyle: "bg-white/95 text-orange-900 border-orange-300/80",
                titleHover: "group-hover:text-orange-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-orange-500/15",
                buttonDefault:
                  "bg-orange-500 text-white border-orange-600/40 shadow-xs shadow-orange-500/20",
                buttonHover:
                  "group-hover:bg-orange-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-orange-500/30",
                tags: [
                  "3-Tier Levels",
                  "Weak Drills",
                  "Custom Papers",
                ],
                highlights: [
                  "3-Tier Difficulty Calibration (Simple, Medium, Hard/HOTS)",
                  "Automatic remediation exercises for weak topics",
                  "Custom paper generator tailored to board syllabus",
                  "Adaptive revision speed adjustments",
                ],
              },
              {
                id: "points-badges",
                icon: Trophy,
                tag: "Gamified Rewards",
                title: "Points & Badges",
                subtitle:
                  "Gamified rewards system to keep students engaged every day",
                text: "Earn points for correct answers and badges for milestones.",
                cardBg:
                  "bg-emerald-100/85 hover:bg-emerald-100 border-emerald-300/90 hover:border-emerald-400",
                tagStyle: "bg-white/95 text-emerald-900 border-emerald-300/80",
                titleHover: "group-hover:text-emerald-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-emerald-500/15",
                buttonDefault:
                  "bg-emerald-500 text-white border-emerald-600/40 shadow-xs shadow-emerald-500/20",
                buttonHover:
                  "group-hover:bg-emerald-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-emerald-500/30",
                tags: ["Accuracy XP", "Badges", "Daily Streaks"],
                highlights: [
                  "Earn XP points for quiz completions and accuracy",
                  'Unlock badges like "Math Wizard", "Formula Champ", "Streak Master"',
                  "Daily learning streak multiplier bonus",
                  "Friendly leaderboards for peer motivation",
                ],
              },
              {
                id: "progress-tracking",
                icon: BarChart3,
                tag: "Visual Analytics",
                title: "Progress Tracking",
                subtitle:
                  "Visual analytics dashboard for students, teachers, and parents",
                text: "See scores, topic mastery, streaks and improvement over time.",
                cardBg:
                  "bg-sky-100/85 hover:bg-sky-100 border-sky-300/90 hover:border-sky-400",
                tagStyle: "bg-white/95 text-sky-900 border-sky-300/80",
                titleHover: "group-hover:text-sky-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-sky-500/15",
                buttonDefault:
                  "bg-sky-500 text-white border-sky-600/40 shadow-xs shadow-sky-500/20",
                buttonHover:
                  "group-hover:bg-sky-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-sky-500/30",
                tags: ["Real-Time Charts", "Mastery %", "PDF Reports"],
                highlights: [
                  "Real-time accuracy & speed progress charts",
                  "Chapter-by-chapter mastery percentages",
                  "Historical exam score trend analysis",
                  "Exportable PDF performance dossiers",
                ],
              },
              {
                id: "parent-teacher",
                icon: MessageSquare,
                tag: "Collaborative Loop",
                title: "Parent-Teacher Connect",
                subtitle:
                  "Seamless parent notifications & automated email/PDF report dispatch",
                text: "Share progress and communicate securely about the student.",
                cardBg:
                  "bg-rose-100/85 hover:bg-rose-100 border-rose-300/90 hover:border-rose-400",
                tagStyle: "bg-white/95 text-rose-900 border-rose-300/80",
                titleHover: "group-hover:text-rose-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-rose-500/15",
                buttonDefault:
                  "bg-rose-500 text-white border-rose-600/40 shadow-xs shadow-rose-500/20",
                buttonHover:
                  "group-hover:bg-rose-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-rose-500/30",
                tags: [
                  "Auto PDF",
                  "Parent Portal",
                  "Teacher Notes",
                ],
                highlights: [
                  "Automated PDF exam report sent directly to parent email",
                  "Parent dashboard link for child activity monitoring",
                  "Teacher note & feedback attachment support",
                  "WhatsApp performance alerts",
                ],
              },
            ].map((feature) => {
              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    onSetActiveFeatureModal(feature.id);
                    onSetDemoMcqSelected(null);
                  }}
                  className={`group relative ${feature.cardBg} rounded-2xl border p-4 sm:p-4.5 lg:p-5 shadow-sm hover:shadow-xl ${feature.cardHoverGlow} hover:-translate-y-1 active:translate-y-0 transition-all duration-300 reveal-on-scroll cursor-pointer overflow-hidden flex flex-col justify-between`}
                >
                  <div>
                    {/* Header: Category Badge + Title & Action Button */}
                    <div className="flex items-start justify-between gap-2.5 mb-2">
                      <div>
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${feature.tagStyle} mb-1 shadow-2xs`}
                        >
                          {feature.tag}
                        </span>
                        <h3
                          className={`font-black text-stone-900 text-base sm:text-lg leading-snug ${feature.titleHover} transition-colors`}
                        >
                          {feature.title}
                        </h3>
                      </div>

                      <span
                        className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full border ${feature.buttonDefault} ${feature.buttonHover} transition-all duration-300 shrink-0 inline-flex items-center gap-1 shadow-2xs`}
                      >
                        Preview{" "}
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </span>
                    </div>

                    {/* Description Text */}
                    <p className="text-xs sm:text-[13px] text-stone-700 leading-snug sm:leading-relaxed font-semibold">
                      {feature.text}
                    </p>
                  </div>

                  {/* Micro-Features Bottom Badges (Single Line) */}
                  <div className="mt-3.5 pt-2.5 border-t border-stone-300/50 flex items-center justify-between gap-1.5 w-full">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex-1 text-center text-[10px] sm:text-[10.5px] font-bold px-1.5 py-1 rounded-lg bg-white/95 border border-stone-200/80 text-stone-800 shadow-2xs group-hover:bg-white group-hover:border-stone-300 transition-colors whitespace-nowrap truncate"
                        title={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── INTERACTIVE FEATURE PREVIEW MODAL ── */}
          {activeFeatureModal && (() => {
            const featuresMap: Record<string, any> = {
              'smart-assessment': {
                icon: Target,
                title: 'Smart Assessment',
                badge: 'Assessment Engine',
                badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                subtitle: 'Adaptive ICSE & CBSE Diagnostic Test Engine',
                description: 'Smart Assessment automatically analyzes student response patterns, evaluates step-by-step logic, and pinpoints conceptual gaps in real time.',
                highlights: [
                  'Automatic Board Alignment (CBSE, ICSE & ISC 2027 Blueprint)',
                  'Real-time Stopwatch & Speed vs Accuracy Tracking',
                  'Instant Model Answers & Step-by-Step Marking Rules',
                  'Targeted Revision Recommendations after every submission'
                ],
                demoTitle: 'Interactive Live Preview: MCQ',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Class 10 Physics • Current Electricity</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px]">1 Mark</span>
                    </div>
                    <p className="text-xs font-black text-stone-800">
                      Q: What happens to the resistance of a conductor if its length is doubled and radius is halved?
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {[
                        { label: 'A) Remains unchanged', correct: false },
                        { label: 'B) Increases 4 times', correct: false },
                        { label: 'C) Increases 8 times', correct: true },
                        { label: 'D) Decreases to half', correct: false }
                      ].map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSetDemoMcqSelected(idx)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${demoMcqSelected === idx
                            ? opt.correct
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                            : 'bg-white border-stone-200 hover:border-amber-300 text-stone-800'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {demoMcqSelected !== null && (
                      <div className={`p-3 rounded-xl text-xs ${demoMcqSelected === 2 ? 'bg-emerald-100/90 text-emerald-900' : 'bg-amber-100 text-amber-900'} font-medium animate-fade-in`}>
                        {demoMcqSelected === 2 ? (
                          <span>✨ <strong>Correct!</strong> R = ρ * (2L) / π(r/2)² = 8 * R_initial. Resistance increases 8 times.</span>
                        ) : (
                          <span>💡 <strong>Tip:</strong> R = ρ * L / A. When radius is halved, area becomes 1/4th. Try Option C!</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              },
              'study-buddy': {
                icon: Brain,
                title: 'Study Buddy Insights',
                badge: 'Mentor Insights',
                badgeColor: 'bg-yellow-100 text-yellow-950 border-yellow-300',
                subtitle: 'Personalized Learning Companion & Mistake Detector',
                description: 'Study Buddy acts as a 24/7 personal tutor that finds root causes of mistakes, recommends remedial practice, and builds long-term memory.',
                highlights: [
                  'Pinpoints common exam traps and formula calculation slips',
                  'Builds personalized revision Flashcards and Mind Maps',
                  'Reminds students to review prerequisite topics before new chapters',
                  'Natural language doubt clarification in plain English & Bengali'
                ],
                demoTitle: 'Live Insights Dashboard Preview',
                demoWidget: (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-yellow-50/70 border border-yellow-200/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between font-black text-stone-800">
                      <span>🤖 Study Buddy Misconception Radar</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">Active Analysis</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1">
                        <div className="flex justify-between font-bold text-stone-800">
                          <span>⚠️ Trait Identified: Sign Convention in Optics</span>
                          <span className="text-amber-600 font-black">72% Risk</span>
                        </div>
                        <p className="text-[11px] text-stone-600">You tend to confuse mirror formula negative sign with lens formula positive sign.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <div className="flex justify-between font-bold text-emerald-900">
                          <span>✨ Recommended Action</span>
                          <span className="text-emerald-700 font-bold">5 Min Practice</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">Complete 3 targeted lens formula numericals to eliminate this trap permanently.</p>
                      </div>
                    </div>
                  </div>
                )
              },
              'personalized': {
                icon: TrendingUp,
                title: 'Personalized Learning',
                subtitle: 'Adaptive Roadmap Aligned to Board Syllabus',
                text: 'Tailored study speed, difficulty levels, and step-by-step guidance.',
                badge: 'Adaptive Path',
                badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
                description: 'Every student gets a unique learning pathway. If a student masters basic concepts quickly, difficulty automatically scales up to HOTS (High Order Thinking Skills).',
                highlights: [
                  '3-Tier Difficulty Scaling: Simple (Foundational), Medium (Standard), Hard (HOTS)',
                  'Dynamic Question Bank selection based on target board (ICSE / CBSE / ISC)',
                  'Custom mock test creation by selecting preferred chapters',
                  'Saves time by skipping already mastered topics'
                ],
                demoTitle: 'Adaptive Progression Pathway',
                demoWidget: (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2.5 text-xs">
                    <div className="font-black text-stone-800 flex justify-between items-center">
                      <span>🚀 Class 10 Math Roadmap</span>
                      <span className="text-orange-700 font-bold">Level 3 Unlocked</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</div>
                        <div>
                          <div className="font-bold text-stone-800 text-[11px]">Level 1: Foundational</div>
                          <div className="text-[10px] text-stone-500">Mastered (100%)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</div>
                        <div>
                          <div className="font-bold text-stone-800 text-[11px]">Level 2: Standard Formula</div>
                          <div className="text-[10px] text-stone-500">Mastered (94%)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-amber-100 rounded-xl border border-amber-300">
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse shrink-0">🔥</div>
                        <div>
                          <div className="font-bold text-amber-950 text-[11px]">Level 3: Board HOTS</div>
                          <div className="text-[10px] text-amber-800">Active Challenge</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              'points-badges': {
                icon: Trophy,
                title: 'Points & Badges',
                subtitle: 'Gamified Motivation Engine & Achievement Showcase',
                badge: 'Gamified XP System',
                badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                description: 'Turn study sessions into an exciting journey. Students earn XP points, daily streak multipliers, and unlock authentic academic badges as they master subjects.',
                highlights: [
                  'XP Rewards for correct answers, daily streaks, and full test completions',
                  'Unlockable badges: "Math Wizard", "Optics Scholar", "Streak Master"',
                  'Level up from Novice Learner to National Board Scholar',
                  'Safe, positive peer encouragement'
                ],
                demoTitle: 'Student Achievement Badge Showcase',
                demoWidget: (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center font-black text-emerald-950">
                      <span>🏆 Level 4 Board Scholar (850 / 1000 XP)</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">🔥 7 Day Streak</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[85%] rounded-full transition-all duration-500"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex flex-col items-center">
                        <span className="text-xl">🧙‍♂️</span>
                        <span className="font-bold text-[10px] text-stone-800 mt-1">Math Wizard</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex flex-col items-center">
                        <span className="text-xl">⚡</span>
                        <span className="font-bold text-[10px] text-stone-800 mt-1">Streak Master</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex flex-col items-center">
                        <span className="text-xl">📜</span>
                        <span className="font-bold text-[10px] text-stone-800 mt-1">Formula Champ</span>
                      </div>
                    </div>
                  </div>
                )
              },
              'progress-tracking': {
                icon: BarChart3,
                title: 'Progress Tracking',
                subtitle: 'Real-Time Performance Analytics & Mastery Graphs',
                badge: 'Real-Time Analytics',
                badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
                description: 'Comprehensive dashboard presenting accuracy percentages, speed trends, chapter completion rates, and historical performance graphs.',
                highlights: [
                  'Subject-wise accuracy breakdown (Mathematics, Physics, Chemistry, Biology)',
                  'Weekly test score improvement trend tracking',
                  'Time spent per question metrics to eliminate test anxiety',
                  'Instant downloadable PDF progress dossiers'
                ],
                demoTitle: 'Analytics Performance Preview',
                demoWidget: (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center font-black text-sky-950">
                      <span>📊 Subject Mastery Breakdown</span>
                      <span className="text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">+14% Score Increase</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between font-bold text-stone-700 text-[11px] mb-1">
                          <span>Mathematics (Class 10)</span>
                          <span>92% Accuracy</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full w-[92%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold text-stone-700 text-[11px] mb-1">
                          <span>Physics (Class 10)</span>
                          <span>86% Accuracy</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div className="bg-sky-500 h-2 rounded-full w-[86%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              'parent-teacher': {
                icon: MessageSquare,
                title: 'Parent-Teacher Connect',
                subtitle: 'Automated Parent Email/PDF Reports & Communication',
                badge: 'Parent Notification',
                badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
                description: 'Keep parents informed without manual hassle. Detailed PDF exam reports are generated and automatically emailed to registered parents after test completion.',
                highlights: [
                  'Automatic PDF report emailed to parents after every full mock test',
                  'Detailed report includes score, strengths, weak topics, and teacher notes',
                  'Dedicated Parent Portal view to track child activity securely',
                  'Instant WhatsApp performance summary alerts'
                ],
                demoTitle: 'Parent Email PDF Notification Preview',
                demoWidget: (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-rose-950">
                      <span className="p-1 rounded bg-rose-200 text-rose-800">📄</span>
                      <span>Automated Parent Email Report</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-stone-200 space-y-1 text-[11px]">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>To: parent@edujunction.co.in</span>
                        <span className="text-emerald-600">✓ Delivered</span>
                      </div>
                      <p className="text-stone-600">
                        "Dear Parent, your child completed <strong>ICSE Class 10 Physics Model Paper 1</strong> with <strong>88% score</strong>. Detailed PDF report is attached."
                      </p>
                      <div className="pt-0.5 flex items-center justify-between font-bold text-amber-700 text-[11px]">
                        <span>📎 Attached: Exam_Report_ICSE10_Physics.pdf</span>
                        <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Ready</span>
                      </div>
                    </div>
                  </div>
                )
              }
            };

            const featData = featuresMap[activeFeatureModal];
            if (!featData) return null;
            const modalThemes: Record<string, string> = {
              'smart-assessment': 'from-amber-500/15 via-amber-50/80 to-white',
              'study-buddy': 'from-yellow-500/15 via-yellow-50/80 to-white',
              'personalized': 'from-orange-500/15 via-orange-50/80 to-white',
              'points-badges': 'from-emerald-500/15 via-emerald-50/80 to-white',
              'progress-tracking': 'from-sky-500/15 via-sky-50/80 to-white',
              'parent-teacher': 'from-rose-500/15 via-rose-50/80 to-white',
            };

            const headerGradient = modalThemes[activeFeatureModal] || 'from-amber-500/15 via-amber-50/80 to-white';

            return createPortal(
              <div
                onClick={() => onSetActiveFeatureModal(null)}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-full max-w-2xl sm:max-w-3xl lg:max-w-[800px] rounded-[26px] shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                >
                  {/* Clean Header (No logo/icon box) */}
                  <div className={`p-4 sm:p-5 px-6 border-b border-stone-200/70 bg-gradient-to-r ${headerGradient} flex items-center justify-between gap-4 shrink-0`}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${featData.badgeColor}`}>
                          {featData.badge}
                        </span>
                        <h3 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">{featData.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-stone-600 truncate">{featData.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSetActiveFeatureModal(null)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-stone-500 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 shrink-0 cursor-pointer"
                      aria-label="Close preview modal"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Body (Balanced width, 2x2 highlights, scrollable if needed) */}
                  <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                    {/* Description Callout */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80">
                      <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                        {featData.description}
                      </p>
                    </div>

                    {/* Highlights Grid */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">Key Feature Highlights</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {featData.highlights.map((h: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] shadow-2xs">
                              ✓
                            </span>
                            <span className="text-[11px] sm:text-xs font-bold text-stone-800 leading-snug">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Demo Widget (Clean title, no dot) */}
                    {featData.demoWidget && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">{featData.demoTitle}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Interactive Simulation
                          </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xs">
                          {featData.demoWidget}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            );
          })()}
        </div>
      </section>
);
