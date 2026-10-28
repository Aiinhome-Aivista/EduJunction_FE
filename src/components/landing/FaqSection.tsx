import React from "react";
import { ChevronDown, Lightbulb } from "lucide-react";

interface FaqItem { q: string; a: string }
interface FaqSectionProps {
  faqs: FaqItem[];
  openFaq: number | null;
  onOpenChange: (index: number | null) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs, openFaq, onOpenChange }) => (
      <section className="relative pt-16 pb-20 bg-gradient-to-b from-white to-amber-50/50 overflow-hidden border-t border-amber-200/60 shadow-[0_-12px_30px_-10px_rgba(251,191,36,0.15)]">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200/20 blur-[100px] rounded-full pointer-events-none z-0"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          {/* Heading & Badge */}
          <div className="text-center reveal-on-scroll relative z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100/80 border border-yellow-200 text-yellow-800 text-xs font-bold shadow-sm">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              FAQ
            </div>
            <h2
              className="mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-normal text-stone-900 capitalize whitespace-nowrap"
              style={{ wordSpacing: "0.25em" }}
            >
              Your Questions Our Answers
            </h2>
          </div>

          {/* Accordion Items */}
          <div className="mt-12 space-y-4 relative z-20">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className={`bg-white/80 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${open
                    ? "border-yellow-300 shadow-xl shadow-yellow-500/10"
                    : "border-stone-200 hover:border-yellow-200 hover:shadow-md"
                    }`}
                >
                  <button
                    onClick={() => onOpenChange(open ? null : index)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left font-bold text-stone-800 cursor-pointer"
                  >
                    <span className="text-lg text-stone-900">{faq.q}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${open
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-stone-100 text-stone-400"
                        }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {open && (
                    <div className="px-6 pb-6 text-stone-600 leading-relaxed pt-2 text-justify [text-align-last:left]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
);
