import React from "react";
import { Lightbulb } from "lucide-react";

export const ActionsDemoSection: React.FC = () => (
      <section id="actions-demo" className="pt-4 sm:pt-6 pb-10 sm:pb-14 bg-gradient-to-b from-amber-50/50 via-stone-50/40 to-amber-50/30 border-t border-amber-200/70 relative scroll-mt-[72px] overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/90 border border-yellow-200/80 text-yellow-800 text-xs sm:text-sm font-bold shadow-2xs">
              <Lightbulb className="w-4 h-4 text-yellow-600 animate-pulse" />
              Actions &amp; Demo
            </div>
            <h2
              className="mt-2 text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-stone-900 tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap"
            >
              Experience Edu<span className="text-yellow-500">Junction</span> in <span className="text-yellow-500">Action</span> 🚀
            </h2>
            <p className="mt-1 text-stone-600 text-xs sm:text-sm xl:text-base font-medium max-w-xl mx-auto leading-relaxed">
              Watch our interactive walkthrough video and try our hands-on demo below.
            </p>
          </div>

          {/* INTERACTIVE PLATFORM DEMO VIDEO */}
          <div className="mt-4 sm:mt-5 w-full flex justify-center reveal-on-scroll">
            <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-[#fffbeb] border border-stone-200/80">
              <iframe
                src="/EduJunction-Getting-Started.html"
                title="Getting Started with EduJunction"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
);
