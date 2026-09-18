import React, { useState, useEffect, useRef } from 'react';
import {
  ChildAccount,
  ScienceJokeOrAnecdote,
  BrainBreakGameType
} from '../types';
import {
  FUN_ANECDOTES_AND_JOKES,
  generateMathProblem,
  SpeedMathProblem,
  MEMORY_CARD_PAIRS,
  MemoryCard,
  SCRAMBLE_WORDS,
  ScienceScrambleWord
} from '../data/funData';
import {
  Sparkles,
  Smile,
  Zap,
  Trophy,
  RotateCcw,
  Flame,
  Heart,
  HelpCircle,
  Check,
  Clock,
  Play,
  Volume2,
  VolumeX,
  Shuffle,
  BookOpen,
  Award,
  Brain,
  Compass,
  ChevronRight,
  Wind
} from 'lucide-react';

interface FunZoneProps {
  activeChild?: ChildAccount;
  onAwardXP?: (amount: number, reason: string) => void;
  onLaunchExam?: () => void;
}

// Simple Web Audio API sound synthesizer
const playWebAudioSound = (type: 'correct' | 'wrong' | 'win' | 'click') => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Ignore audio context errors silently
  }
};

export const FunZone: React.FC<FunZoneProps> = ({
  activeChild,
  onAwardXP,
  onLaunchExam
}) => {
  const [activeTab, setActiveTab] = useState<BrainBreakGameType>('anecdote-vault');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Anecdote state
  const [anecdoteCategory, setAnecdoteCategory] = useState<'all' | 'anecdote' | 'joke' | 'fact' | 'riddle'>('all');
  const [revealedPunchlines, setRevealedPunchlines] = useState<Record<string, boolean>>({});
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [randomFeatureIndex, setRandomFeatureIndex] = useState<number>(0);
  const [showXPToast, setShowXPToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  // Speed Math State
  const [mathLevel, setMathLevel] = useState<'junior' | 'standard' | 'genius'>('standard');
  const [mathGameActive, setMathGameActive] = useState(false);
  const [mathTimeLeft, setMathTimeLeft] = useState(30);
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathHighScore, setMathHighScore] = useState(0);
  const [currentMathProblem, setCurrentMathProblem] = useState<SpeedMathProblem | null>(null);
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryGameWon, setMemoryGameWon] = useState(false);
  const [memoryStartTime, setMemoryStartTime] = useState<number | null>(null);
  const [memoryElapsedSecs, setMemoryElapsedSecs] = useState(0);

  // Word Scramble State
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [scrambleAnswerLetters, setScrambleAnswerLetters] = useState<string[]>([]);
  const [scrambleAvailableTiles, setScrambleAvailableTiles] = useState<{ letter: string; used: boolean }[]>([]);
  const [scrambleSolved, setScrambleSolved] = useState(false);
  const [scrambleHintVisible, setScrambleHintVisible] = useState(false);
  const [scrambleTotalSolvedCount, setScrambleTotalSolvedCount] = useState(0);

  // Breathing Box State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathActive, setBreathActive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const memoryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSound = (type: 'correct' | 'wrong' | 'win' | 'click') => {
    if (soundEnabled) playWebAudioSound(type);
  };

  const showRewardToast = (msg: string) => {
    setShowXPToast({ show: true, msg });
    setTimeout(() => setShowXPToast({ show: false, msg: '' }), 3000);
  };

  // ----------------------------------------------------
  // ANECDOTE & JOKE HANDLERS
  // ----------------------------------------------------
  const handleTogglePunchline = (id: string) => {
    triggerSound('click');
    setRevealedPunchlines(prev => {
      const nextState = !prev[id];
      if (nextState) {
        // Award small fun exploration XP first time
        if (!prev[id]) {
          onAwardXP?.(5, 'Brain Break Smile XP');
          showRewardToast('+5 EduPoints (XP) for expanding your science wisdom! ✨');
        }
      }
      return { ...prev, [id]: nextState };
    });
  };

  const handleLikeAnecdote = (id: string, initialLikes: number) => {
    triggerSound('click');
    setLikesMap(prev => {
      const current = prev[id] !== undefined ? prev[id] : initialLikes;
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleSpinRandomAnecdote = () => {
    triggerSound('click');
    const newIdx = Math.floor(Math.random() * FUN_ANECDOTES_AND_JOKES.length);
    setRandomFeatureIndex(newIdx);
    const item = FUN_ANECDOTES_AND_JOKES[newIdx];
    setRevealedPunchlines(prev => ({ ...prev, [item.id]: true }));
  };

  // ----------------------------------------------------
  // SPEED MATH LIGHTNING DUEL
  // ----------------------------------------------------
  const startMathGame = () => {
    triggerSound('click');
    setMathGameActive(true);
    setMathTimeLeft(30);
    setMathScore(0);
    setMathStreak(0);
    setMathFeedback(null);
    setCurrentMathProblem(generateMathProblem(mathLevel));
  };

  useEffect(() => {
    if (mathGameActive && mathTimeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setMathTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (mathGameActive && mathTimeLeft === 0) {
      setMathGameActive(false);
      triggerSound('win');
      if (mathScore > mathHighScore) {
        setMathHighScore(mathScore);
      }
      const earnedXP = Math.min(45, Math.max(5, mathScore * 5));
      onAwardXP?.(earnedXP, 'Speed Math Duel XP');
      showRewardToast(`⚡ Sprint complete! You earned +${earnedXP} EduPoints (XP)!`);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mathGameActive, mathTimeLeft]);

  const handleMathAnswer = (selectedOption: number) => {
    if (!currentMathProblem || !mathGameActive) return;

    if (selectedOption === currentMathProblem.answer) {
      triggerSound('correct');
      setMathFeedback('correct');
      const newScore = mathScore + 1;
      const newStreak = mathStreak + 1;
      setMathScore(newScore);
      setMathStreak(newStreak);

      setTimeout(() => {
        setMathFeedback(null);
        setCurrentMathProblem(generateMathProblem(mathLevel));
      }, 300);
    } else {
      triggerSound('wrong');
      setMathFeedback('wrong');
      setMathStreak(0);
      setTimeout(() => {
        setMathFeedback(null);
      }, 400);
    }
  };

  // ----------------------------------------------------
  // MEMORY LAB CARD MATCHING
  // ----------------------------------------------------
  const startMemoryGame = () => {
    triggerSound('click');
    // Prepare 6 pairs (12 cards) or 8 pairs (16 cards)
    const selectedPairs = MEMORY_CARD_PAIRS.slice(0, 6);
    const cards: MemoryCard[] = [];

    selectedPairs.forEach((p, idx) => {
      cards.push({
        id: `card-${idx}-formula`,
        pairKey: p.pairKey,
        display: p.formula,
        isFormulaOrName: 'formula',
        icon: p.icon,
        color: p.color
      });
      cards.push({
        id: `card-${idx}-name`,
        pairKey: p.pairKey,
        display: p.name,
        isFormulaOrName: 'concept',
        icon: p.icon,
        color: p.color
      });
    });

    // Shuffle cards
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setFlippedIndices([]);
    setMatchedKeys([]);
    setMemoryMoves(0);
    setMemoryGameWon(false);
    setMemoryStartTime(Date.now());
    setMemoryElapsedSecs(0);
  };

  useEffect(() => {
    if (activeTab === 'memory-match' && memoryCards.length === 0) {
      startMemoryGame();
    }
  }, [activeTab]);

  useEffect(() => {
    if (memoryStartTime && !memoryGameWon) {
      memoryTimerRef.current = setInterval(() => {
        setMemoryElapsedSecs(Math.floor((Date.now() - memoryStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (memoryTimerRef.current) clearInterval(memoryTimerRef.current);
    };
  }, [memoryStartTime, memoryGameWon]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const card = memoryCards[index];
    if (matchedKeys.includes(card.pairKey)) return;

    triggerSound('click');
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const card1 = memoryCards[newFlipped[0]];
      const card2 = memoryCards[newFlipped[1]];

      if (card1.pairKey === card2.pairKey && card1.isFormulaOrName !== card2.isFormulaOrName) {
        // MATCH!
        triggerSound('correct');
        const updatedMatched = [...matchedKeys, card1.pairKey];
        setMatchedKeys(updatedMatched);
        setFlippedIndices([]);

        if (updatedMatched.length === 6) {
          // WON!
          setMemoryGameWon(true);
          triggerSound('win');
          const bonusXP = 20;
          onAwardXP?.(bonusXP, 'Memory Matcher Mastery');
          showRewardToast(`🏆 Perfect match! +${bonusXP} EduPoints (XP) awarded!`);
        }
      } else {
        // No match, flip back
        triggerSound('wrong');
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // ----------------------------------------------------
  // WORD SCRAMBLE & RIDDLES
  // ----------------------------------------------------
  const currentScramble = SCRAMBLE_WORDS[scrambleIndex];

  const initScrambleWord = (wordObj: ScienceScrambleWord) => {
    const letters = wordObj.scrambled.split('');
    setScrambleAvailableTiles(letters.map(l => ({ letter: l, used: false })));
    setScrambleAnswerLetters([]);
    setScrambleSolved(false);
    setScrambleHintVisible(false);
  };

  useEffect(() => {
    if (currentScramble) {
      initScrambleWord(currentScramble);
    }
  }, [scrambleIndex]);

  const handleTileClick = (tileIndex: number) => {
    if (scrambleSolved) return;
    const tile = scrambleAvailableTiles[tileIndex];
    if (tile.used) return;

    triggerSound('click');
    const updatedTiles = [...scrambleAvailableTiles];
    updatedTiles[tileIndex].used = true;
    setScrambleAvailableTiles(updatedTiles);

    const newAnswer = [...scrambleAnswerLetters, tile.letter];
    setScrambleAnswerLetters(newAnswer);

    // Check if full answer entered
    if (newAnswer.length === currentScramble.solution.length) {
      if (newAnswer.join('') === currentScramble.solution) {
        setScrambleSolved(true);
        triggerSound('win');
        setScrambleTotalSolvedCount(prev => prev + 1);
        onAwardXP?.(25, 'Science Word Scramble Solver');
        showRewardToast(`🎉 Decoded! +25 EduPoints (XP) for uncovering ${currentScramble.solution}!`);
      } else {
        triggerSound('wrong');
      }
    }
  };

  const handleResetScrambleAnswer = () => {
    triggerSound('click');
    setScrambleAnswerLetters([]);
    setScrambleAvailableTiles(prev => prev.map(t => ({ ...t, used: false })));
    setScrambleSolved(false);
  };

  const handleNextScramble = () => {
    triggerSound('click');
    setScrambleIndex(prev => (prev + 1) % SCRAMBLE_WORDS.length);
  };

  // ----------------------------------------------------
  // 2-MINUTE BOX BREATHING / REST ZONE
  // ----------------------------------------------------
  const toggleBreathing = () => {
    triggerSound('click');
    if (!breathActive) {
      setBreathActive(true);
      setBreathPhase('Inhale');
      setBreathSeconds(4);
    } else {
      setBreathActive(false);
    }
  };

  useEffect(() => {
    if (breathActive) {
      breathTimerRef.current = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev > 1) return prev - 1;
          // cycle phase
          setBreathPhase(curr => {
            if (curr === 'Inhale') return 'Hold';
            if (curr === 'Hold') return 'Exhale';
            if (curr === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    } else {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    }
    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [breathActive]);

  const filteredAnecdotes = FUN_ANECDOTES_AND_JOKES.filter(item => {
    if (anecdoteCategory === 'all') return true;
    return item.category === anecdoteCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {showXPToast.show && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-300 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-5 h-5 text-amber-100" />
          <span className="text-sm">{showXPToast.msg}</span>
        </div>
      )}

      {/* Top Playful Hero Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-amber-600 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Background decorative geometry */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-40 h-40 bg-pink-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-200 tracking-wide uppercase">
              <Smile className="w-3.5 h-3.5 text-amber-300" />
              <span>Brain Break & Entertainment Arcade</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recharge, Laugh & Play, {activeChild?.name?.split(' ')[0] || 'Champion'}!
            </h1>
            <p className="text-xs sm:text-sm text-yellow-100 max-w-2xl leading-relaxed">
              Studying for board exams and competitive tests shouldn't be tedious. Explore funny scientist mishaps, witty puns, rapid-fire math duels, and memory challenges to refresh your focus!
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border backdrop-blur-xs transition-colors flex items-center gap-1.5 text-xs font-semibold ${soundEnabled
                ? 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                }`}
              title={soundEnabled ? 'Mute Game Sounds' : 'Enable Game Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'SFX On' : 'SFX Off'}</span>
            </button>

            {onLaunchExam && (
              <button
                onClick={onLaunchExam}
                className="px-4 py-2.5 rounded-xl bg-white text-yellow-700 font-bold text-xs hover:bg-yellow-50 shadow-sm transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                <span>Ready for Exams</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Fun Stats Strip */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-semibold text-yellow-100">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Streak: {activeChild?.streakDays || 1} Days Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>EduPoints (XP): {activeChild?.xp || 1420}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-pink-200" />
            <span>Memory High Score: {mathHighScore} Math Streaks</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-amber-200">
            <span>✨ All games award live XP towards your level rank!</span>
          </div>
        </div>
      </div>

      {/* Main Game & Anecdote Navigation Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        <button
          id="btn-tab-anecdotes"
          onClick={() => { triggerSound('click'); setActiveTab('anecdote-vault'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'anecdote-vault'
            ? 'bg-yellow-400 text-stone-900 shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
        >
          <span>😄</span>
          <span>The Chuckle Lab & Stories</span>
        </button>

        <button
          id="btn-tab-speed-math"
          onClick={() => { triggerSound('click'); setActiveTab('speed-math'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'speed-math'
            ? 'bg-yellow-400 text-stone-900 shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
        >
          <span>⚡</span>
          <span>Speed Math Duel</span>
        </button>

        <button
          id="btn-tab-memory"
          onClick={() => { triggerSound('click'); setActiveTab('memory-match'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'memory-match'
            ? 'bg-yellow-400 text-stone-900 shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
        >
          <span>🃏</span>
          <span>Concept Memory Flip</span>
        </button>

        <button
          id="btn-tab-scramble"
          onClick={() => { triggerSound('click'); setActiveTab('word-scramble'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'word-scramble'
            ? 'bg-yellow-400 text-stone-900 shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
        >
          <span>🧩</span>
          <span>Science Mystery Scramble</span>
        </button>

        <button
          id="btn-tab-breathing"
          onClick={() => { triggerSound('click'); setActiveTab('particle-pop'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'particle-pop'
            ? 'bg-yellow-400 text-stone-900 shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
        >
          <span>🧘</span>
          <span>2-Min Mind Reset</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* VIEW 1: THE CHUCKLE LAB & SCIENTIST ANECDOTES */}
      {/* ============================================================ */}
      {activeTab === 'anecdote-vault' && (
        <div className="space-y-6">
          {/* Featured Anecdote Generator Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                  {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].funReactionEmoji}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                    🎲 Featured Curiosity Spotlight
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleSpinRandomAnecdote}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Spin Random Story / Joke</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].characterOrOrigin && (
                <p className="text-xs font-semibold text-amber-800 italic">
                  Origin: {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].characterOrOrigin}
                </p>
              )}
              <p className="text-sm text-stone-700 leading-relaxed">
                {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].setupOrStory}
              </p>

              {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].punchlineOrTakeaway && (
                <div className="mt-4 p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <span>💡 The Hilarious Truth & Lesson:</span>
                  </div>
                  <p className="text-sm text-stone-800 font-medium leading-relaxed">
                    {FUN_ANECDOTES_AND_JOKES[randomFeatureIndex].punchlineOrTakeaway}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Browse:</span>
              {(['all', 'anecdote', 'joke', 'fact', 'riddle'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => { triggerSound('click'); setAnecdoteCategory(cat); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${anecdoteCategory === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                >
                  {cat === 'all' ? 'All Stories & Jokes' : cat === 'anecdote' ? 'Historical Blunders' : cat === 'joke' ? 'School & Science Puns' : cat === 'fact' ? 'Wacky Facts' : 'Brain Riddles'}
                </button>
              ))}
            </div>
            <span className="text-xs text-stone-400 font-medium">
              Showing {filteredAnecdotes.length} entertaining insights
            </span>
          </div>

          {/* Grid of Anecdote and Joke Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredAnecdotes.map(item => {
              const isRevealed = revealedPunchlines[item.id] || false;
              const likes = likesMap[item.id] !== undefined ? likesMap[item.id] : item.likesCount;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.funReactionEmoji}</span>
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${item.category === 'anecdote' ? 'bg-amber-100 text-amber-800' :
                            item.category === 'joke' ? 'bg-pink-100 text-pink-800' :
                              item.category === 'fact' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-teal-100 text-teal-800'
                            }`}>
                            {item.subject} • {item.category}
                          </span>
                          <h4 className="font-bold text-sm text-stone-900 mt-1">{item.title}</h4>
                        </div>
                      </div>
                    </div>

                    {item.characterOrOrigin && (
                      <p className="text-[11px] font-medium text-stone-400 mb-2 italic">
                        {item.characterOrOrigin}
                      </p>
                    )}

                    <p className="text-xs text-stone-700 leading-relaxed mb-4">
                      {item.setupOrStory}
                    </p>

                    {item.punchlineOrTakeaway && (
                      <div className="mb-4">
                        {isRevealed ? (
                          <div className="p-3 bg-yellow-50/80 rounded-xl border border-yellow-200 text-xs text-yellow-950 font-medium leading-relaxed animate-in fade-in duration-200">
                            <span className="font-bold text-yellow-700 block mb-1">
                              {item.category === 'joke' ? 'Punchline:' : item.category === 'riddle' ? 'Answer:' : 'The Takeaway:'}
                            </span>
                            {item.punchlineOrTakeaway}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleTogglePunchline(item.id)}
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-yellow-300 bg-yellow-50/50 hover:bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                            <span>
                              {item.category === 'joke' ? 'Tap to Reveal Punchline (+5 XP)' : item.category === 'riddle' ? 'Tap to Reveal Riddle Answer' : 'Tap to Read Full Story'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <button
                      onClick={() => handleLikeAnecdote(item.id, item.likesCount)}
                      className="flex items-center gap-1.5 text-stone-500 hover:text-red-500 transition-colors font-medium"
                    >
                      <Heart className="w-3.5 h-3.5 fill-red-100 text-red-500" />
                      <span>{likes} Laughs</span>
                    </button>

                    <button
                      onClick={() => handleTogglePunchline(item.id)}
                      className="text-yellow-600 hover:text-yellow-800 font-semibold"
                    >
                      {isRevealed ? 'Hide' : 'Expand'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: SPEED MATH LIGHTNING DUEL */}
      {/* ============================================================ */}
      {activeTab === 'speed-math' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <h2 className="text-xl font-bold text-stone-900">Speed Math Lightning Sprint</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Solve as many rapid-fire mental arithmetic questions as you can in 30 seconds!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-400 uppercase">Tier:</span>
              {(['junior', 'standard', 'genius'] as const).map(tier => (
                <button
                  key={tier}
                  disabled={mathGameActive}
                  onClick={() => { triggerSound('click'); setMathLevel(tier); }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors ${mathLevel === tier
                    ? 'bg-yellow-400 text-stone-900'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50'
                    }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {!mathGameActive && mathTimeLeft === 30 && (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-yellow-50 border-2 border-yellow-300 text-yellow-600 flex items-center justify-center text-4xl mx-auto shadow-xs animate-bounce">
                ⏱️
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-stone-900">Ready to Fire Up Your Neurons?</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Mental math speeds up calculation accuracy for Physics, Chemistry numericals, and Mathematics board exams.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 py-2 text-xs font-semibold text-stone-600 bg-stone-50 rounded-2xl border border-stone-100">
                <div>
                  <span className="block text-base font-bold text-yellow-600">30s</span>
                  <span>Timer Sprint</span>
                </div>
                <div className="h-8 w-[1px] bg-stone-200" />
                <div>
                  <span className="block text-base font-bold text-amber-500">+{mathHighScore}</span>
                  <span>High Score Record</span>
                </div>
              </div>

              <button
                id="btn-start-math-sprint"
                onClick={startMathGame}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start 30-Second Math Blitz</span>
              </button>
            </div>
          )}

          {mathGameActive && currentMathProblem && (
            <div className="space-y-6 max-w-lg mx-auto py-4">
              {/* Header Bar during game */}
              <div className="flex items-center justify-between bg-stone-900 text-white px-5 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-lg font-mono font-bold">{mathTimeLeft}s</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-yellow-400">Score: {mathScore}</span>
                  <span className="text-amber-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Streak: {mathStreak}
                  </span>
                </div>
              </div>

              {/* Problem Card */}
              <div className={`p-8 rounded-3xl text-center border-2 transition-all ${mathFeedback === 'correct' ? 'bg-yellow-50 border-yellow-400' :
                mathFeedback === 'wrong' ? 'bg-red-50 border-red-400' :
                  'bg-stone-50 border-stone-200'
                }`}>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Calculate Rapidly:</span>
                <div className="text-4xl sm:text-5xl font-mono font-extrabold text-stone-900 my-4 tracking-tight">
                  {currentMathProblem.num1} {currentMathProblem.operation} {currentMathProblem.num2} = ?
                </div>
                {mathFeedback === 'correct' && (
                  <span className="text-xs font-bold text-yellow-600 animate-in zoom-in-50">✨ Brilliant! +1 Point</span>
                )}
                {mathFeedback === 'wrong' && (
                  <span className="text-xs font-bold text-red-600 animate-in zoom-in-50">❌ Oops, try again!</span>
                )}
              </div>

              {/* 4 Option Buttons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {currentMathProblem.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMathAnswer(opt)}
                    className="py-4 px-6 rounded-2xl bg-white border-2 border-stone-200 hover:border-yellow-500 hover:bg-yellow-50/50 text-stone-900 font-mono font-bold text-xl sm:text-2xl shadow-xs transition-all active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!mathGameActive && mathTimeLeft === 0 && (
            <div className="text-center py-10 space-y-6 max-w-md mx-auto animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-xs">
                🏆
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-stone-900">Sprint Completed!</h3>
                <p className="text-sm text-stone-500">
                  You scored <span className="font-bold text-yellow-600 text-base">{mathScore} correct calculations</span> in 30 seconds!
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 text-xs text-yellow-900 font-medium">
                🎯 {mathScore >= 10 ? 'Phenomenal speed! You are at Olympiad-grade mental calculation velocity.' : 'Great workout! Regular 30-sec math sprints boost exam arithmetic reflexes.'}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startMathGame}
                  className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => { triggerSound('click'); setActiveTab('anecdote-vault'); }}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs"
                >
                  Read Jokes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 3: CONCEPT MEMORY LAB FLIP */}
      {/* ============================================================ */}
      {activeTab === 'memory-match' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🃏</span>
                <h2 className="text-xl font-bold text-stone-900">Science & Formula Memory Match</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Flip and pair scientific laws, chemical formulas, and core physics concepts together.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-stone-600">
              <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-yellow-600" />
                <span>Time: {memoryElapsedSecs}s</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl">
                <span>Moves: {memoryMoves}</span>
              </div>
              <button
                onClick={startMemoryGame}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-500"
                title="Restart Game"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {memoryGameWon ? (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-3xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-4xl mx-auto shadow-xs">
                🌟
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-stone-900">All Formulas Paired!</h3>
                <p className="text-xs text-stone-500">
                  Completed in <span className="font-bold text-stone-900">{memoryElapsedSecs} seconds</span> and <span className="font-bold text-stone-900">{memoryMoves} moves</span>.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 text-xs text-yellow-900 font-medium">
                ⚡ +40 EduPoints (XP) added to your knowledge score!
              </div>

              <button
                onClick={startMemoryGame}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Another Round</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {memoryCards.map((card, idx) => {
                const isFlipped = flippedIndices.includes(idx) || matchedKeys.includes(card.pairKey);
                const isMatched = matchedKeys.includes(card.pairKey);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`h-28 sm:h-32 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300 transform select-none ${isMatched
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-950 opacity-90 scale-95'
                      : isFlipped
                        ? `${card.color} shadow-sm scale-100`
                        : 'bg-yellow-400 border-yellow-700 hover:bg-yellow-700 text-white shadow-2xs hover:scale-102'
                      }`}
                  >
                    {isFlipped ? (
                      <div className="space-y-1 animate-in zoom-in-75 duration-150">
                        <span className="text-xl">{card.icon}</span>
                        <div className="text-xs sm:text-sm font-bold font-mono leading-tight">
                          {card.display}
                        </div>
                        <span className="text-[9px] uppercase font-semibold opacity-70 block">
                          {card.isFormulaOrName === 'formula' ? 'Formula' : 'Concept'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-2xl opacity-70">🔬</span>
                        <span className="text-[10px] font-bold tracking-wider opacity-80 uppercase block">
                          EduJunction
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 4: SCIENCE MYSTERY WORD SCRAMBLE */}
      {/* ============================================================ */}
      {activeTab === 'word-scramble' && currentScramble && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                <h2 className="text-xl font-bold text-stone-900">Science Mystery Word Scramble</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Tap the scrambled letter tiles in the correct order to decode the scientific keyword!
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                Word {scrambleIndex + 1} of {SCRAMBLE_WORDS.length}
              </span>
              <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-300">
                Solved: {scrambleTotalSolvedCount}
              </span>
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-6 py-4 text-center">
            {/* Clue and category */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                  {currentScramble.category} Clue
                </span>
                <button
                  onClick={() => { triggerSound('click'); setScrambleHintVisible(!scrambleHintVisible); }}
                  className="text-xs text-yellow-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{scrambleHintVisible ? 'Hide Clue' : 'Show Clue'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                💡 "{currentScramble.hint}"
              </p>
            </div>

            {/* Answer Slots */}
            <div className="flex items-center justify-center gap-2 flex-wrap min-h-[56px]">
              {Array.from({ length: currentScramble.solution.length }).map((_, idx) => {
                const letter = scrambleAnswerLetters[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-extrabold text-2xl transition-all ${scrambleSolved
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-900'
                      : letter
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-900 shadow-xs'
                        : 'bg-white border-dashed border-stone-300 text-stone-300'
                      }`}
                  >
                    {letter || ''}
                  </div>
                );
              })}
            </div>

            {/* Scramble Letter Tiles */}
            {!scrambleSolved && (
              <div className="space-y-4">
                <p className="text-xs text-stone-400 font-medium">Tap letters to place in order:</p>
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {scrambleAvailableTiles.map((tile, i) => (
                    <button
                      key={i}
                      disabled={tile.used}
                      onClick={() => handleTileClick(i)}
                      className={`w-12 h-12 rounded-2xl font-mono font-bold text-xl border-2 shadow-2xs transition-all active:scale-90 ${tile.used
                        ? 'opacity-25 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-white border-stone-300 hover:border-yellow-400 hover:bg-yellow-50 text-stone-900'
                        }`}
                    >
                      {tile.letter}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetScrambleAnswer}
                    className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-colors"
                  >
                    Clear & Retry
                  </button>
                </div>
              </div>
            )}

            {/* Solved Celebration Box */}
            {scrambleSolved && (
              <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-3xl text-center space-y-4 animate-in zoom-in-95">
                <div className="text-3xl">🎉</div>
                <div>
                  <h4 className="text-base font-extrabold text-yellow-950">
                    Correct! The mystery word is {currentScramble.solution}!
                  </h4>
                  <p className="text-xs text-yellow-800 mt-2 leading-relaxed max-w-md mx-auto">
                    🧬 <span className="font-bold">Mind-Blowing Fact:</span> {currentScramble.funFact}
                  </p>
                </div>

                <button
                  onClick={handleNextScramble}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-2xl text-xs shadow-xs flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <span>Next Mystery Word (+25 XP)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 5: 2-MINUTE MIND RESET & GUIDED BREATHING */}
      {/* ============================================================ */}
      {activeTab === 'particle-pop' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl mx-auto shadow-xs">
              🧘
            </div>
            <h2 className="text-xl font-bold text-stone-900">2-Minute Mind Reset & Box Breathing</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Feeling test anxiety or tired from long problem solving? Follow this calming 4-4-4-4 rhythm to oxygenate your brain and enter a high-focus flow state.
            </p>
          </div>

          <div className="py-8 flex flex-col items-center justify-center space-y-6">
            {/* Animated Pulsing Breathing Circle */}
            <div className="relative flex items-center justify-center w-64 h-64">
              <div
                className={`absolute rounded-full transition-all duration-1000 ease-in-out ${breathActive
                  ? breathPhase === 'Inhale'
                    ? 'w-56 h-56 bg-teal-200/60 scale-110'
                    : breathPhase === 'Hold'
                      ? 'w-56 h-56 bg-yellow-200/60 scale-105'
                      : breathPhase === 'Exhale'
                        ? 'w-40 h-40 bg-amber-200/60 scale-90'
                        : 'w-40 h-40 bg-teal-100/60 scale-95'
                  : 'w-44 h-44 bg-stone-100'
                  }`}
              />

              <div className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-tr from-teal-500 to-yellow-500 text-white flex flex-col items-center justify-center shadow-lg">
                {breathActive ? (
                  <>
                    <span className="text-sm font-bold uppercase tracking-widest text-teal-100">{breathPhase}</span>
                    <span className="text-3xl font-black font-mono my-0.5">{breathSeconds}</span>
                    <span className="text-[10px] text-teal-100">seconds</span>
                  </>
                ) : (
                  <>
                    <Wind className="w-8 h-8 mb-1 text-teal-200" />
                    <span className="text-xs font-bold">Press Start</span>
                  </>
                )}
              </div>
            </div>

            <div className="max-w-sm mx-auto space-y-3">
              <button
                onClick={toggleBreathing}
                className={`px-8 py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mx-auto ${breathActive
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
              >
                {breathActive ? 'Pause Mind Reset' : 'Start 2-Minute Breathing Exercise'}
              </button>

              <p className="text-[11px] text-stone-400 italic">
                Scientific studies show 2 minutes of paced breathing decreases cortisol and improves exam recall by 18%.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
