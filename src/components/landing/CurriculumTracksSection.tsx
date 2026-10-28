import React from "react";
import { createPortal } from "react-dom";
import { ArrowRight, BookOpen, CheckCircle2, FileText, GraduationCap, ShieldCheck, Sparkles, Star, Users, X, Zap } from "lucide-react";

interface CurriculumTracksSectionProps {
  previewTrack: any;
  onSetPreviewTrack: React.Dispatch<React.SetStateAction<any>>;
  onOpenAuth: (mode?: "login" | "register", persona?: "parent" | "student") => void;
  onNavigate: (path: string) => void;
}

export const CurriculumTracksSection: React.FC<CurriculumTracksSectionProps> = ({ previewTrack, onSetPreviewTrack, onOpenAuth, onNavigate }) => (
      <section
        id="curriculum-tracks"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-between pt-7 sm:pt-9 lg:pt-10 pb-5 sm:pb-7 lg:pb-8 bg-gradient-to-b from-stone-50/70 via-white to-amber-50/20 relative overflow-hidden scroll-mt-[72px]"
      >
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-amber-200/25 via-amber-100/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col justify-between py-0.5">
          {/* CENTERED HEADER */}
          <div className="text-center max-w-5xl mx-auto reveal-on-scroll shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/95 border border-amber-300 text-amber-950 text-xs sm:text-sm font-black shadow-2xs mb-2.5 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Tailored Academic Tracks</span>
            </div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[36px] font-black tracking-tight text-stone-900 uppercase leading-tight whitespace-normal sm:whitespace-nowrap"
              style={{ wordSpacing: "0.15em" }}
            >
              CHOOSE THE LEARNING TRACK{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                THAT FITS
              </span>
            </h2>
            <p className="mt-2 sm:mt-2.5 text-stone-600 text-xs sm:text-sm font-medium leading-relaxed max-w-4xl mx-auto whitespace-normal sm:whitespace-nowrap">
              Syllabus-accurate practice with NCERT solutions, previous year papers, and instant step-by-step scoring.
            </p>

            {/* Quick Value Highlights Strip (Compact) */}
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-xs font-bold text-stone-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                2025–26 Pattern
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                10-Yr Solved PYQs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                Step-by-Step Scoring
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Free Tier Included
              </span>
            </div>
          </div>

          {/* RICH INTERACTIVE TRACKS GRID */}
          <div className="my-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5 lg:gap-5 w-full items-stretch">
            {[
              {
                id: "cbse-10",
                title: "CBSE Board",
                level: "Class 10",
                popularTag: "Most Popular",
                subtitle: "Board Exam & NCERT Practice",
                description:
                  "Master core concepts with line-by-line NCERT solutions, chapter-wise question banks, and official marking rubrics.",
                icon: BookOpen,
                theme: {
                  cardBorder: "border-amber-200/90 hover:border-amber-400",
                  badgeBg: "bg-amber-100/90 text-amber-900 border-amber-300/80",
                  iconGrad:
                    "from-amber-400 via-amber-500 to-orange-500 shadow-amber-500/30",
                  glow: "hover:shadow-amber-500/15",
                  accentHover: "group-hover:text-amber-600",
                  checkColor: "text-amber-600",
                  actionBtn:
                    "bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950",
                },
                features: [
                  "Complete NCERT & Exemplar Solutions",
                  "Past 10 Years Solved Papers (PYQs)",
                  "Step-by-Step Evaluation Rubric",
                ],
                subjects: [
                  "Mathematics",
                  "Science",
                  "Social Science",
                  "English",
                ],
                stats: {
                  questions: "15,000+",
                  mockTests: "12 Full Mocks",
                  passRate: "98.4%",
                },
                sampleTopics: [
                  "Quadratic Equations & Arithmetic Progressions",
                  "Light: Reflection, Refraction & Human Eye",
                  "Life Processes, Reproduction & Heredity",
                  "Real-world Case Study & Competency Questions",
                ],
                board: "CBSE",
                classGrade: "Class 10",
                defaultSubject: "Mathematics",
              },
              {
                id: "cbse-isc-12",
                title: "CBSE & ISC Senior",
                level: "Class 12",
                popularTag: "Pre-University",
                subtitle: "Advanced Board & CUET Prep",
                description:
                  "In-depth derivations, formula vaults, specimen board papers, and conceptual bridge training for CUET & entrance tests.",
                icon: GraduationCap,
                theme: {
                  cardBorder: "border-sky-200/90 hover:border-sky-400",
                  badgeBg: "bg-sky-100/90 text-sky-900 border-sky-300/80",
                  iconGrad:
                    "from-sky-400 via-blue-500 to-indigo-600 shadow-sky-500/30",
                  glow: "hover:shadow-sky-500/15",
                  accentHover: "group-hover:text-sky-600",
                  checkColor: "text-sky-600",
                  actionBtn: "bg-stone-900 hover:bg-sky-600 text-white",
                },
                features: [
                  "Complete Derivations & Formula Vault",
                  "Official Specimen & Model Mock Papers",
                  "CUET & Board Dual Readiness Drills",
                ],
                subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
                stats: {
                  questions: "20,000+",
                  mockTests: "15 Full Mocks",
                  passRate: "99.1%",
                },
                sampleTopics: [
                  "Calculus, Integrals & Differential Equations",
                  "Electrostatics, Magnetism & Wave Optics",
                  "Organic Reaction Mechanisms & Kinetics",
                  "Genetics, Molecular Biology & Biotechnology",
                ],
                board: "CBSE",
                classGrade: "Class 12",
                defaultSubject: "Physics",
              },
              {
                id: "icse-10",
                title: "ICSE Board",
                level: "Class 10",
                popularTag: "In-Depth Theory",
                subtitle: "ICSE Exam & Subject Practice",
                description:
                  "Comprehensive syllabus coverage mapped to Selina & Concise textbooks with structured subjective evaluation & diagrams.",
                icon: FileText,
                theme: {
                  cardBorder: "border-rose-200/90 hover:border-rose-400",
                  badgeBg: "bg-rose-100/90 text-rose-900 border-rose-300/80",
                  iconGrad:
                    "from-rose-400 via-pink-500 to-purple-600 shadow-rose-500/30",
                  glow: "hover:shadow-rose-500/15",
                  accentHover: "group-hover:text-rose-600",
                  checkColor: "text-rose-600",
                  actionBtn: "bg-stone-900 hover:bg-rose-600 text-white",
                },
                features: [
                  "Selina & Concise Textbook Mapping",
                  "Structured Subjective Theory Rubrics",
                  "Diagram & Practical Question Banks",
                ],
                subjects: [
                  "Maths",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "English",
                ],
                stats: {
                  questions: "14,000+",
                  mockTests: "10 Full Mocks",
                  passRate: "97.8%",
                },
                sampleTopics: [
                  "Commercial Mathematics: GST & Banking",
                  "Force, Work, Power & Sound Waves",
                  "Periodic Properties & Chemical Bonding",
                  "Plant Physiology & Circulatory System",
                ],
                board: "ICSE",
                classGrade: "Class 10",
                defaultSubject: "Mathematics",
              },
              {
                id: "competitive-prep",
                title: "Competitive Prep",
                level: "HOTS / Foundation",
                popularTag: "High Rigor",
                subtitle: "Challenging Practice & Drills",
                description:
                  "Higher-order thinking skills, Olympiad question sets, NTSE speed drills, and early bridge foundations for JEE & NEET.",
                icon: Sparkles,
                theme: {
                  cardBorder: "border-emerald-200/90 hover:border-emerald-400",
                  badgeBg:
                    "bg-emerald-100/90 text-emerald-900 border-emerald-300/80",
                  iconGrad:
                    "from-emerald-400 via-teal-500 to-teal-700 shadow-emerald-500/30",
                  glow: "hover:shadow-emerald-500/15",
                  accentHover: "group-hover:text-emerald-600",
                  checkColor: "text-emerald-600",
                  actionBtn: "bg-stone-900 hover:bg-emerald-600 text-white",
                },
                features: [
                  "Multi-Concept HOTS Problems",
                  "Olympiad & NTSE Speed Drills",
                  "National Percentile Benchmark Tests",
                ],
                subjects: [
                  "Advanced Maths",
                  "Science HOTS",
                  "Aptitude & Logic",
                ],
                stats: {
                  questions: "12,000+",
                  mockTests: "20 Speed Drills",
                  passRate: "Top 5%",
                },
                sampleTopics: [
                  "Non-Routine Algebraic Olympiad Challenges",
                  "Multi-Concept Kinematics & Mechanics",
                  "Logical Reasoning & Mathematical Induction",
                  "Real-time Percentile & Accuracy Analytics",
                ],
                board: "CBSE",
                classGrade: "Class 10",
                defaultSubject: "Mathematics",
              },
            ].map((track) => {
              return (
                <div
                  key={track.id}
                  onClick={() => onNavigate('/quick-test')}
                  className={`group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border-2 ${track.theme.cardBorder} p-4 sm:p-4.5 shadow-sm hover:shadow-xl ${track.theme.glow} hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full`}
                >
                  {/* Top Row: Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${track.theme.badgeBg} shadow-2xs`}>
                        {track.level}
                      </span>
                      {track.popularTag && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-300/60 shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          {track.popularTag}
                        </span>
                      )}
                    </div>

                    {/* Titles */}
                    <h3
                      className={`mt-2 font-black text-stone-900 text-base sm:text-[17px] tracking-tight ${track.theme.accentHover} transition-colors leading-snug`}
                    >
                      {track.title}
                    </h3>
                    <div className="text-xs font-bold text-stone-600 mt-0.5">
                      {track.subtitle}
                    </div>

                    {/* Key Features List */}
                    <div className="mt-3.5 pt-2.5 border-t border-stone-100 space-y-2">
                      {track.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-1.5 text-xs font-semibold text-stone-700 leading-snug"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${track.theme.checkColor} shrink-0 mt-0.5`}
                          />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Subject Pills */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100/90 flex flex-wrap gap-1.5">
                      {track.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-stone-100 text-stone-700 group-hover:bg-stone-200/80 transition-colors"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-3.5 pt-2.5 border-t border-stone-100/90 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('/quick-test');
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl ${track.theme.actionBtn} font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all duration-200 cursor-pointer`}
                    >
                      <span>Start Free Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* HIGH-CONVERTING BOTTOM TRUST BAR */}
          <div className="text-center flex flex-col items-center reveal-on-scroll shrink-0 pt-1 pb-1">
            <div className="flex flex-wrap items-center justify-center gap-y-1.5 gap-x-5 text-xs font-semibold text-stone-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Instant step-by-step grading
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Latest 2025–26 CBSE & ICSE syllabus
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Free test included
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE TRACK PREVIEW MODAL */}
        {previewTrack && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
            onClick={() => onSetPreviewTrack(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${previewTrack.theme.iconGrad} flex items-center justify-center text-white shadow-md`}
                  >
                    {React.createElement(previewTrack.icon, {
                      className: "w-6 h-6 stroke-[2.2]",
                    })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-stone-900">
                        {previewTrack.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${previewTrack.theme.badgeBg}`}
                      >
                        {previewTrack.level}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-500 mt-0.5">
                      {previewTrack.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSetPreviewTrack(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Tiles */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                  <div className="text-lg font-black text-stone-900">
                    {previewTrack.stats.questions}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    Practice Questions
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                  <div className="text-lg font-black text-stone-900">
                    {previewTrack.stats.mockTests}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    Mock Assessments
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                  <div className="text-lg font-black text-amber-600">
                    {previewTrack.stats.passRate}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    Benchmark Score
                  </div>
                </div>
              </div>

              {/* Subjects Covered */}
              <div className="mb-5">
                <div className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2">
                  Subjects Included
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewTrack.subjects.map((sub: string) => (
                    <span
                      key={sub}
                      className="px-3 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs font-bold"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Topics & Syllabus Highlights */}
              <div className="mb-6">
                <div className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2">
                  Core Topics & Syllabus Highlights
                </div>
                <div className="space-y-2">
                  {previewTrack.sampleTopics.map((topic: string) => (
                    <div
                      key={topic}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100/90 text-xs font-semibold text-stone-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal CTAs */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onSetPreviewTrack(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetPreviewTrack(null);
                    onOpenAuth("register", "student");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <span>Start Free in {previewTrack.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </section>
);
