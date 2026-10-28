import React from "react";
import { Sparkles } from "lucide-react";

export const WhyEduJunctionSection: React.FC = () => (
      <section
        id="why-edujunction"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-center py-8 sm:py-12 lg:py-14 bg-white border-b border-stone-200/70 relative overflow-hidden scroll-mt-[72px]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Why EduJunction
            </div>
            <h2
              className="mt-3.5 text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-5xl font-black text-stone-900 tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap"
              style={{ wordSpacing: "0.15em" }}
            >
              Edu<span className="text-yellow-500">Junction</span> vs <span className="text-yellow-500">Other</span> Platforms
            </h2>
          </div>

          {/* 2-Column Open / Borderless Layout: Left 3D Motion Image & Right Description */}
          <div className="mt-8 lg:mt-10 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center reveal-on-scroll">
            {/* Left Side: Realistic Student Floating Cutout (Borderless, Transparent PNG on pure white) */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full flex items-center justify-center">
                <img
                  src="/why-edujunction-student-cutout.png"
                  alt="Student studying with EduJunction"
                  className="w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[440px] h-auto max-h-[420px] object-contain select-none transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Side: Description */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-stone-600 text-base sm:text-lg lg:text-[17.5px] leading-relaxed sm:leading-[1.85] text-justify [text-align-last:left]">
                While traditional platforms offer generic PDFs with zero
                diagnostic insights,{" "}
                <strong className="text-stone-900 font-bold">
                  EduJunction
                </strong>{" "}
                brings the exact{" "}
                <strong className="text-amber-800 font-bold">
                  Upcoming ICSE, ISC &amp; CBSE board blueprints
                </strong>{" "}
                to life with step-by-step scoring rubrics. Our built-in{" "}
                <strong className="text-stone-900 font-bold">
                  Study Buddy
                </strong>{" "}
                identifies why a student struggled, pinpointing conceptual traps
                and prerequisite knowledge gaps before exam day.
              </p>
              <p className="text-stone-600 text-base sm:text-lg lg:text-[17.5px] leading-relaxed sm:leading-[1.85] text-justify [text-align-last:left]">
                Every test submission automatically compiles and emails an authentic <strong className="text-stone-900 font-bold">PDF Dossier</strong> directly to parents with chapter-wise mastery breakdowns, ensuring seamless transparency. Inside the exam interface, students can solve numericals, draft diagrams, and utilize digital scratchpads directly with our <strong className="text-stone-900 font-bold">Interactive STEM Canvas</strong>. We believe quality education should be accessible and student-centric — empowering learners with <strong className="text-amber-800 font-bold">fair, modular, per-paper pricing</strong> and absolutely no forced annual lock-ins, putting students in complete control of their success.
              </p>
            </div>
          </div>
        </div>
      </section>
);
