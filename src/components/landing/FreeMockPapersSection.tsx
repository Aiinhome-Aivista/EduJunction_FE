import React from "react";
import { ArrowRight, FileText, Sparkles, Users, Zap } from "lucide-react";

interface FreeMockPapersSectionProps {
  onOpenAuth: (mode?: "login" | "register", persona?: "parent" | "student") => void;
}

export const FreeMockPapersSection: React.FC<FreeMockPapersSectionProps> = ({ onOpenAuth }) => (
      <section
        id="free-mock-papers-2027"
        className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col justify-center py-3 lg:py-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/70 via-yellow-50/40 to-white border-y border-amber-200/70 relative scroll-mt-[72px]"
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 w-full flex flex-col justify-center my-auto">
          <div className="text-center max-w-2xl mx-auto mb-3 lg:mb-3.5 reveal-on-scroll shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100/90 border border-yellow-200 text-yellow-800 text-xs sm:text-sm font-bold shadow-2xs">
              <FileText className="w-4 h-4 text-yellow-600 animate-pulse" />
              Free Mock Test Papers 2027
            </div>
            <h2
              className="mt-2 text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black capitalize tracking-tight text-stone-900 leading-tight"
              style={{ wordSpacing: "0.2em" }}
            >
              <span className="text-yellow-500">FREE</span> MOCK TEST &amp;{" "}
              <span className="text-yellow-500">MODEL TEST PAPERS</span> FOR
              CBSE, ICSE &amp; ISC
            </h2>
            <p className="mt-1.5 text-stone-600 text-xs sm:text-sm xl:text-base font-medium max-w-xl mx-auto leading-relaxed">
              Practice free unlimited CBSE, ICSE &amp; ISC mock tests, model
              question papers and online practice tests.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-3.5 lg:gap-5 items-stretch">
            {/* 1. Free Mock Test Papers - ICSE, CBSE & ISC 2027 (PRIMARY HERO SPOTLIGHT) */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200/90 text-stone-950 p-4 sm:p-5 lg:p-5 xl:p-5.5 border-2 border-amber-300 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/30 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1.5 hover:scale-[1.008] transition-all duration-300 ease-out">
              {/* Interactive Hover Light Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-20" />

              <div className="space-y-1.5 lg:space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950 text-amber-300 text-xs font-black uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">
                    {/* <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> */}
                    2027 Flagship Edition
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-xl xl:text-2xl font-black text-stone-950 tracking-tight leading-snug">
                  Model Test Papers Available For :{" "}
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-xl bg-stone-950 text-amber-300 font-black group-hover:bg-amber-950 transition-colors duration-300">
                    CBSE, ICSE &amp; ISC 2027
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-900 leading-relaxed font-semibold text-justify [text-align-last:left]">
                  Access full-length authentic specimen model papers:{" "}
                  <b className="text-stone-950 font-black">CBSE (3h • 80m)</b>, <b className="text-stone-950 font-black">ICSE (2.5h • 80m)</b> and{" "}
                  <b className="text-stone-950 font-black">ISC (3h • 70/80m)</b>. Built on 10–15 years of past
                  question patterns and step-by-step marking rubrics.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    "CBSE: 3 Hours (80 Marks)",
                    "ICSE: 2.5 Hours (80 Marks)",
                    "ISC: 3 Hours (70/80 Marks)",
                    "PDF & Word Downloads",
                    "10–15 Yrs Past Trends (2011–2026)",
                    "Step-by-Step Marking Rules",
                  ].map((tag) => (
                    <div
                      key={tag}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300/80 text-stone-950 text-xs sm:text-[12.5px] font-bold flex items-center gap-1.5 hover:border-amber-400 group-hover:bg-white/95 transition-all"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </span>{" "}
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 lg:pt-3 relative z-10">
                <button
                  onClick={() => onOpenAuth("register", "student")}
                  className="m-auto py-2.5 px-6 rounded-2xl bg-stone-950 hover:bg-stone-900 text-amber-300 hover:text-yellow-200 font-black text-xs sm:text-sm transition-all cursor-pointer group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3 border border-stone-800"
                >
                  Explore Model Test Papers{" "}
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300 transition-transform group-hover:translate-x-1.5" />
                </button>
              </div>
            </div>

            {/* 2. Free Mock Test: Subject-Wise 10-Mark Diagnostic Mock Test Available (SUPPORTING CARD) */}
            <div className="rounded-3xl bg-white border-2 border-stone-200/90 text-stone-900 p-4 sm:p-5 lg:p-5 xl:p-5.5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-300 transition-all duration-300">
              <div className="space-y-1.5 lg:space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-yellow-300/90 text-amber-950 text-xs font-black">
                    {/* <Zap className="w-3.5 h-3.5 text-yellow-600 fill-current" />{" "} */}
                    Free Mock Test Available
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-xl xl:text-2xl font-black text-stone-900 tracking-tight leading-snug">
                  Free Subject-Wise Mock Test
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium text-justify [text-align-last:left]">
                  Understand your child’s learning level in just 15 minutes.{" "}
                  <b className="text-stone-900">Create a free Parent Account</b>, choose Board (CBSE, ICSE,
                  ISC) and Class (5-12), and unlock instant diagnostic reports
                  sent straight to your email.
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 transition-all">
                    <p className="text-xs sm:text-[13px] font-extrabold text-amber-950">
                      Free Mock Test
                    </p>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 font-medium">
                      15-Min timed test
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 transition-all">
                    <p className="text-xs sm:text-[13px] font-extrabold text-amber-950">Insights</p>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 font-medium">Concept error detection</p>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 transition-all col-span-2">
                    <p className="text-xs sm:text-[13px] font-extrabold text-amber-950">
                      📧 Direct Emailed PDF Report
                    </p>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 font-medium">
                      Delivered to parent inbox upon submission
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 lg:pt-3 relative z-10 grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => onOpenAuth("register")}
                  className="w-full sm:w-auto min-w-0 py-2.5 px-2 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-black text-[10px] min-[390px]:text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 border border-amber-300/80 whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  Create Free Parent Account
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  onClick={() => onOpenAuth("login")}
                  className="w-auto min-w-0 py-2.5 px-3 sm:px-5 rounded-2xl bg-stone-900 hover:bg-black text-white font-extrabold text-[10px] min-[390px]:text-xs sm:text-sm border border-stone-900 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
);
