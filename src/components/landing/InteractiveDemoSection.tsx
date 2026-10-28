import React from "react";
import { Brain, CheckCircle2, Play, X } from "lucide-react";

interface InteractiveDemoSectionProps {
  demoQuestions: Record<string, any>;
  selectedSubject: string;
  selectedAttempt: number;
  setSelectedAttempt: React.Dispatch<React.SetStateAction<number>>;
  isEvaluating: boolean;
  setIsEvaluating: React.Dispatch<React.SetStateAction<boolean>>;
  runDemo: (subject: any) => void;
  currentQuestion: any;
  currentAttempt: any;
}

export const InteractiveDemoSection: React.FC<InteractiveDemoSectionProps> = ({ demoQuestions, selectedSubject, selectedAttempt, setSelectedAttempt, isEvaluating, setIsEvaluating, runDemo, currentQuestion, currentAttempt }) => (
      <section
        id="demo"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-center py-6 sm:py-8 lg:py-10 bg-white border-y border-stone-200/80 relative overflow-hidden scroll-mt-[72px]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/95 border border-amber-300 text-amber-950 text-xs sm:text-sm font-black shadow-2xs">
              <Play className="w-3.5 h-3.5 fill-current text-amber-600 animate-pulse" />
              Interactive Demo
            </div>
            <h2
              className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-stone-900 uppercase leading-tight"
              style={{ wordSpacing: "0.2em" }}
            >
              UNBOX THE FUTURE OF GRADING
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-stone-600 max-w-xl mx-auto leading-relaxed">
              Try a sample student attempt and see how the platform gives useful
              feedback.
            </p>
          </div>

          <div className="mt-5 sm:mt-6 flex flex-wrap justify-center gap-2 reveal-on-scroll">
            {(["math", "science"] as const).map((subject) => (
              <button
                key={subject}
                onClick={() => runDemo(subject)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSubject === subject
                  ? "bg-amber-400 text-stone-900 shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
              >
                {subject === "math" ? "Class 10 Math" : "Class 8 Science"}
              </button>
            ))}
          </div>

          <div className="mt-5 sm:mt-6 grid lg:grid-cols-2 gap-4 sm:gap-5 reveal-on-scroll">
            <div className="rounded-3xl bg-stone-50 border border-stone-200 p-5 sm:p-5.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500">
                    {currentQuestion.grade}
                  </div>
                  <h3 className="font-black text-lg">
                    {currentQuestion.subject}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                  {currentQuestion.marks} marks
                </span>
              </div>

              <p className="mt-5 text-sm font-semibold leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {currentQuestion.responses.map((response, index) => (
                  <button
                    key={response.label}
                    onClick={() => {
                      setSelectedAttempt(index);
                      setIsEvaluating(true);
                      window.setTimeout(() => setIsEvaluating(false), 350);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold ${selectedAttempt === index
                      ? "bg-white border-yellow-400 text-yellow-700"
                      : "bg-white border-stone-200 text-stone-600"
                      }`}
                  >
                    {response.label} · {response.tag}
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-white rounded-2xl border border-stone-200 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {currentAttempt.studentWork}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-5.5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-sm">
                      Study Buddy Analysis
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Step-by-step feedback
                    </div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-sm font-black ${currentAttempt.score >= 9
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-yellow-50 text-amber-700"
                    }`}
                >
                  {currentAttempt.score}/10
                </div>
              </div>

              {isEvaluating ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                  <div className="text-xs font-semibold text-stone-500">
                    Study Buddy is checking the answer...
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {currentAttempt.breakdown.map(([step, marks, pass]) => (
                    <div
                      key={step}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        {pass ? (
                          <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500" />
                        )}
                        {step}
                      </span>
                      <span
                        className={`text-xs font-black ${pass ? "text-yellow-600" : "text-rose-600"
                          }`}
                      >
                        {marks}
                      </span>
                    </div>
                  ))}

                  <div className="mt-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                    <div className="text-xs font-black text-yellow-700">
                      What should the student do next?
                    </div>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                      {currentAttempt.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
);
