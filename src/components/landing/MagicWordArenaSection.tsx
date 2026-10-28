import React from "react";
import { ArrowRight, ChevronDown, ChevronRight, Gamepad2, HelpCircle, Lightbulb, RotateCcw, Sparkles } from "lucide-react";

interface MagicWordArenaSectionProps {
  activeWordObj: any;
  currentWordIndex: number;
  userLetters: string[];
  usedOptionIndices: number[];
  shuffledOptions: string[];
  isWordComplete: boolean;
  showSecretHint: boolean;
  wrongLetterIdx: number | null;
  handleLetterClick: (letter: string, optionIdx: number) => void;
  handleUndoLetter: () => void;
  nextWord: () => void;
  resetCurrentWord: () => void;
  setShowSecretHint: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MagicWordArenaSection: React.FC<MagicWordArenaSectionProps> = ({ activeWordObj, currentWordIndex, userLetters, usedOptionIndices, shuffledOptions, isWordComplete, showSecretHint, wrongLetterIdx, handleLetterClick, handleUndoLetter, nextWord, resetCurrentWord, setShowSecretHint }) => (
      <section id="magic-word-arena" className="min-h-[calc(100vh-72px)] flex flex-col justify-center py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 border-t border-amber-200/70 relative z-20 font-sans select-none px-4 scroll-mt-[72px] overflow-hidden">
        <style>{`
          @keyframes tile-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
          }
          .animate-tile-shake {
            animation: tile-shake 0.4s ease-in-out;
          }
          @keyframes pop-in {
            0% { transform: scale(0.88); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pop-in {
            animation: pop-in 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>

        {/* Background Soft Glows */}
        <div className="absolute top-5 left-1/4 w-72 h-72 bg-yellow-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-5 right-1/4 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 px-2 sm:px-4 w-full my-auto">
          {/* Header */}
          <div className="text-center mb-7 sm:mb-9 reveal-on-scroll">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs font-black mb-2.5">
              <span className="text-amber-500 animate-pulse">⚡</span> Academic Concept Arena
            </div>
            <h3
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight capitalize"
              style={{ wordSpacing: '0.2em' }}
            >
              READ CLUES &amp; BUILD WORDS 🚀
            </h3>
            <p className="mt-1.5 text-stone-600 text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed">
              Test your science, math &amp; general knowledge foundation !
            </p>
          </div>

          {/* 2-COLUMN GRID SYSTEM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">

            {/* LEFT SIDE: CLUE CARD */}
            <div className="bg-gradient-to-br from-amber-100/90 via-yellow-50/90 to-amber-100/70 border-2 border-amber-300 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/35 rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:-translate-y-1.5 hover:scale-[1.008] ease-out">
              {/* Interactive Hover Light Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-20" />

              <div className="relative z-10">
                {/* Subject Header */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-amber-200/90 border border-amber-300 text-amber-950 flex items-center gap-1.5 group-hover:bg-amber-300/80 transition-colors">
                    <span>📚</span> {activeWordObj.subject}
                  </span>
                  <span className="text-[11px] font-extrabold text-amber-900 bg-white/90 px-3 py-1 rounded-xl border border-amber-300/80 flex items-center gap-1">
                    Clue
                  </span>
                </div>

                {/* Question / Concept Clue Box */}
                <div className="bg-white/95 border border-amber-300/80 group-hover:border-amber-400 rounded-2xl p-4 transition-all">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Concept Clue</span>
                  </div>
                  <p className="text-sm sm:text-[15px] font-extrabold text-stone-900 leading-snug">
                    {isWordComplete
                      ? "🎉 Awesome! Concept Decoded! Click 'Next Concept' on the right to continue!"
                      : activeWordObj.mascotMsg.replace(/^Question:\s*/i, "")}
                  </p>
                </div>

                {/* Visual Showcase Centerpiece */}
                <div className="relative my-3 py-4 sm:py-5 px-4 rounded-2xl bg-gradient-to-b from-white/90 via-amber-50/50 to-amber-100/40 border border-amber-300/70 group-hover:border-amber-400 flex flex-col items-center justify-center text-center overflow-hidden transition-all">
                  <div className="absolute w-24 h-24 rounded-full bg-amber-200/40 blur-xl pointer-events-none" />
                  <div className="relative z-10 mb-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                    <span className="text-5xl sm:text-6xl select-none leading-none inline-block filter drop-shadow-xs">
                      {activeWordObj.logo}
                    </span>
                  </div>
                  <span className="relative z-10 text-xs sm:text-[13px] font-bold text-stone-800 bg-amber-100/90 border border-amber-300/80 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> {activeWordObj.hint}
                  </span>
                </div>
              </div>

              {/* Extra Clue / Formula Expandable */}
              <div className="mt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setShowSecretHint(!showSecretHint)}
                  className="w-full bg-white/95 hover:bg-white text-amber-950 border border-amber-300 hover:border-amber-400 text-xs font-black py-2.5 px-4 rounded-xl transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Need Extra Clue / Formula?
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${showSecretHint ? "rotate-180 text-amber-600" : "text-amber-500"
                      }`}
                  />
                </button>
                {showSecretHint && (
                  <div className="mt-2 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300 rounded-xl p-3 text-center animate-pop-in">
                    <p className="text-xs font-bold text-amber-950 leading-relaxed">
                      {activeWordObj.secretHint}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: GAME BOARD (Fresh Mint & Emerald palette - distinct from Amber clue card) */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-emerald-100/60 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                {/* Top Game Bar */}
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-[13px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white flex items-center gap-1.5 border border-emerald-400">
                      <Gamepad2 className="w-3.5 h-3.5 text-white" />
                      Concept Board
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {userLetters.length > 0 && !isWordComplete && (
                      <button
                        type="button"
                        onClick={handleUndoLetter}
                        className="text-xs font-bold text-stone-800 hover:text-stone-950 bg-white/95 hover:bg-white px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 border border-emerald-200"
                        title="Undo last letter"
                      >
                        <RotateCcw className="w-3 h-3" /> Back
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetCurrentWord}
                      className="text-xs font-bold text-emerald-950 hover:text-stone-950 bg-emerald-100/90 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 border border-emerald-300"
                      title="Reset word"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                    <button
                      type="button"
                      onClick={nextWord}
                      className="text-xs font-bold text-teal-950 hover:text-stone-950 bg-teal-100/90 hover:bg-teal-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-0.5 border border-teal-300"
                      title="Skip to next concept"
                    >
                      <span>Skip</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Target Word Slots Stage */}
                <div className="text-center my-3 bg-white/95 border-2 border-emerald-200/90 rounded-2xl py-3 px-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300/80 text-[11px] font-black uppercase tracking-wider text-emerald-950 mb-3">
                    <span>✨</span> Tap letters below in sequence to solve
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-1">
                    {activeWordObj.word.split('').map((char, idx) => {
                      const filledChar = userLetters[idx];
                      const isNextActive = idx === userLetters.length && !isWordComplete;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => filledChar && handleUndoLetter()}
                          title={filledChar ? "Tap to undo this letter" : undefined}
                          className={`w-10 h-13 sm:w-12 sm:h-15 md:w-13 md:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-200 select-none ${filledChar
                            ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-stone-950 border-2 border-amber-300 border-b-4 border-b-amber-600 cursor-pointer active:scale-95 animate-pop-in'
                            : isNextActive
                              ? 'bg-emerald-100/80 border-2 border-dashed border-emerald-500 text-emerald-700 font-black animate-pulse'
                              : 'bg-stone-50 border-2 border-dashed border-stone-200 text-stone-300'
                            }`}
                        >
                          {filledChar || (isNextActive ? '?' : '•')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Option Letters (Keyboard) OR Success Screen */}
              {!isWordComplete ? (
                <div className="mt-3 pt-3 border-t border-emerald-200/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950/80 uppercase tracking-wider mb-2.5 px-1">
                    <span>Available Letters</span>
                    <span className="text-[10px] text-emerald-800/80 font-semibold hidden sm:inline">
                      Tip: You can also use your keyboard
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-1.5 sm:gap-2 max-w-xs sm:max-w-none mx-auto">
                    {shuffledOptions.map((letter, idx) => {
                      const isUsed = usedOptionIndices.includes(idx);
                      const isWrong = wrongLetterIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isUsed}
                          onClick={() => handleLetterClick(letter, idx)}
                          className={`w-full sm:w-11 md:w-12 h-11 sm:h-12 md:h-13 rounded-2xl font-black text-lg sm:text-xl border-2 transition-all flex items-center justify-center select-none ${isUsed
                            ? 'opacity-20 pointer-events-none scale-90 bg-stone-100 border-stone-200 text-stone-300'
                            : isWrong
                              ? 'animate-tile-shake bg-rose-100 border-rose-400 text-rose-700 scale-95'
                              : 'bg-white hover:bg-emerald-50 active:bg-emerald-100 border-emerald-300 border-b-4 border-b-emerald-500 active:border-b-2 active:translate-y-0.5 text-stone-900 hover:border-emerald-400 hover:scale-105 cursor-pointer'
                            }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 text-center py-3 animate-pop-in">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-black mb-2.5">
                    <span>🎉</span> Excellent! Concept Decoded: <span className="underline decoration-emerald-500">{activeWordObj.word}</span>
                  </div>
                  <p className="text-xs text-stone-700 font-medium mb-3 max-w-sm mx-auto">
                    {activeWordObj.hint}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={resetCurrentWord}
                      className="bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-stone-300 cursor-pointer transition-all"
                    >
                      Replay ↺
                    </button>
                    <button
                      type="button"
                      onClick={nextWord}
                      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-wider inline-flex items-center gap-1.5 border border-emerald-400"
                    >
                      <span>Next Concept</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>
);
