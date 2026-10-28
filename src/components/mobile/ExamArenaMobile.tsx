import React, { useEffect, useRef } from 'react';
import { Subject, ExamDifficulty, Exam, Board, ClassGrade } from '../../types';
import {
  BookOpen, Play, Clock, CheckCircle2, AlertCircle, Flag, HelpCircle, Sparkles,
  ArrowRight, ArrowLeft, RotateCcw, Calculator, Layers, Award, Zap, CalendarClock,
  Loader2, Lock, FlaskConical, Globe, Code, Brain, Target, FileText, User, X,
  ChevronLeft, ChevronRight, LayoutGrid,
} from 'lucide-react';

interface ExamArenaMobileProps { mode: 'active' | 'setup'; context: any; }

export const ExamArenaMobile: React.FC<ExamArenaMobileProps> = ({ mode, context: c }) => {
  const {
    activeExam, currentQuestionIdx, totalQuestions, answeredCount, remainingCount,
    isLowTime, mins, secs, timeRemainingSeconds, showExitModal, setShowExitModal,
    setShowConfirmSubmit, showConfirmSubmit, isSubmitting, handleSubmitExam,
    answers, flaggedQuestions, showQuestionPalette, setShowQuestionPalette,
    setCurrentQuestionIdx, handleNextQuestion, handleSelectAnswer, toggleFlagQuestion,
    adaptiveDifficulty, formatOptionText, setActiveExam, currentQ, formatTime,
    selectedBoard, setSelectedBoard, selectedGrade, setSelectedGrade, BOARDS, GRADES,
    isStudentPersona, assignedExam, blueprint, isGenerating, isStartingAssignedExam, handleStartExam,
    activeTopic, setActiveTopic, selectedSubject, setSelectedSubject, isLoadingSubjects,
    dbSubjects, selectedBranch, setSelectedBranch, getSubjectConfig, selectedDifficulty,
    setSelectedDifficulty, generationStep,
  } = c;

  // UX: always start each question at the top of the scroll area
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [currentQuestionIdx]);

  if (mode === 'active') {
    const flaggedCount = Object.values(flaggedQuestions || {}).filter(Boolean).length;
    const progressPct = ((currentQuestionIdx + 1) / totalQuestions) * 100;

    return (
      <div className="flex sm:hidden fixed inset-0 z-50 bg-stone-50 flex-col">
        {/* 1. Mobile Fixed Top Bar */}
        <div className="min-h-14 pt-[env(safe-area-inset-top)] bg-white border-b border-stone-200/90 px-2 flex items-center justify-between shrink-0 shadow-2xs">
          {/* Exit Button */}
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-stone-500 active:bg-stone-100 transition-colors active:scale-95 cursor-pointer touch-manipulation"
            title="Exit Test"
            aria-label="Exit test"
          >
            <X className="w-5 h-5 text-stone-700" />
          </button>

          {/* Exam Center Info */}
          <div className="flex flex-col items-center min-w-0 px-2">
            <span className="text-xs font-bold text-stone-900 truncate max-w-[140px]">
              {activeExam.subject || 'Challenge'}
            </span>
            <span className="text-[11px] text-stone-500 font-semibold tabular-nums">
              Question {currentQuestionIdx + 1} <span className="text-stone-400">/ {totalQuestions}</span>
            </span>
          </div>

          {/* Timer & Submit */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`flex items-center gap-1 px-2.5 h-9 rounded-xl font-mono text-xs font-bold tabular-nums ${
              isLowTime ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="h-9 px-3.5 rounded-xl bg-stone-950 text-yellow-400 font-bold text-xs shadow-xs active:scale-95 cursor-pointer touch-manipulation"
            >
              Submit
            </button>
          </div>
        </div>

        {/* 2. Top Progress Strip */}
        <div className="w-full h-1.5 bg-stone-200/60 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-r-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* 3. Scrollable Question & Options Body */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4 pb-32"
        >
          {/* Meta Row: Badges & Flag */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-[11px] font-bold text-stone-900 bg-stone-200/80 px-2 py-0.5 rounded-md">
                {currentQ.marks || 1} {(currentQ.marks || 1) > 1 ? 'Marks' : 'Mark'}
              </span>
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                (currentQ.difficulty || adaptiveDifficulty) === 'hard'
                  ? 'bg-rose-100 text-rose-800'
                  : (currentQ.difficulty || adaptiveDifficulty) === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentQ.difficulty || adaptiveDifficulty}
              </span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {currentQ.type}
              </span>
            </div>

            <button
              type="button"
              onClick={() => toggleFlagQuestion(currentQ.id)}
              className={`h-10 px-3 shrink-0 rounded-xl border transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1.5 text-[11px] font-bold ${
                flaggedQuestions[currentQ.id]
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-stone-200 text-stone-500'
              }`}
              title="Flag for review"
              aria-pressed={!!flaggedQuestions[currentQ.id]}
            >
              <Flag className={`w-4 h-4 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{flaggedQuestions[currentQ.id] ? 'Flagged' : 'Flag'}</span>
            </button>
          </div>

          {/* Topic pill (if present) */}
          {currentQ.topic && (
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md max-w-full">
              <BookOpen className="w-3 h-3 text-stone-500 shrink-0" />
              <span className="truncate">{currentQ.topic}</span>
            </div>
          )}

          {/* Question Text */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
            <p className="text-stone-900 text-[15px] font-semibold leading-relaxed whitespace-pre-line break-words">
              {currentQ.questionText}
            </p>

            {/* Question Diagram / Image if present */}
            {(currentQ.imageUrl || currentQ.image_url) && (
              <div className="my-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col items-center">
                <img
                  src={(currentQ.imageUrl || currentQ.image_url)?.startsWith('http') ? (currentQ.imageUrl || currentQ.image_url) : (import.meta.env.VITE_API_BASE_URL || '') + (currentQ.imageUrl || currentQ.image_url)}
                  alt="Question Diagram"
                  loading="lazy"
                  className="max-h-56 max-w-full w-auto object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          {/* MCQ Options */}
          {(currentQ.type === 'mcq' || currentQ.type === 'logical') && currentQ.options && currentQ.options.length > 0 && (
            <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
              {currentQ.options.map((opt, oIdx) => {
                const letter = String.fromCharCode(65 + oIdx);
                const cleanText = formatOptionText(opt);
                const isSelected = answers[currentQ.id]?.toUpperCase() === letter
                  || answers[currentQ.id]?.trim().toLowerCase() === cleanText.toLowerCase()
                  || answers[currentQ.id] === opt;

                return (
                  <button
                    key={oIdx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectAnswer(currentQ.id, letter, true)}
                    className={`w-full min-h-[56px] flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer touch-manipulation ${
                      isSelected
                        ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50/50 shadow-xs'
                        : 'border-stone-200 bg-white active:bg-stone-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-black shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      {letter}
                    </div>
                    <span className={`text-sm leading-snug flex-1 break-words ${
                      isSelected ? 'font-bold text-stone-900' : 'font-medium text-stone-700'
                    }`}>
                      {cleanText || opt}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* SAQ Text Area */}
          {(currentQ.type === 'saq' || (!currentQ.options || currentQ.options.length === 0) && currentQ.type !== 'numerical' && currentQ.type !== 'objective') && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Your Answer ({currentQ.marks || 2} Marks)
              </label>
              <textarea
                rows={5}
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                placeholder="Type your explanation or solution here..."
                className="w-full p-3.5 rounded-2xl border border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-stone-900 text-base leading-relaxed outline-none resize-none bg-white"
              />
              <div className="text-right text-[10px] text-stone-400 font-medium tabular-nums">
                {(answers[currentQ.id] || '').length} characters
              </div>
            </div>
          )}

          {/* Numerical Input */}
          {currentQ.type === 'numerical' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Numerical Value
              </label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                placeholder="e.g. 6 or 3.14"
                className="w-full p-3.5 rounded-2xl border border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-stone-900 font-mono text-base outline-none bg-white"
              />
            </div>
          )}

          {/* Objective Input */}
          {currentQ.type === 'objective' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Objective Key Term
              </label>
              <input
                type="text"
                autoComplete="off"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                placeholder="e.g. Total Internal Reflection"
                className="w-full p-3.5 rounded-2xl border border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-stone-900 text-base outline-none bg-white"
              />
            </div>
          )}
        </div>

        {/* 4. Mobile Fixed Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[env(safe-area-inset-bottom)] bg-white border-t border-stone-200/90 px-3 flex items-center gap-2 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {/* Prev Button */}
          <button
            type="button"
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx((p) => p - 1)}
            aria-label="Previous question"
            className="h-12 w-12 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 disabled:opacity-40 flex items-center justify-center active:scale-95 cursor-pointer disabled:cursor-not-allowed touch-manipulation shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Palette Button (Shows X of Y answered) */}
          <button
            type="button"
            onClick={() => setShowQuestionPalette(true)}
            className="h-12 flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs active:scale-95 cursor-pointer touch-manipulation relative"
          >
            <LayoutGrid className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="tabular-nums truncate">{answeredCount}/{totalQuestions} answered</span>
            {flaggedCount > 0 && (
              <span className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {flaggedCount}
              </span>
            )}
          </button>

          {/* Next / Submit Button */}
          {currentQuestionIdx < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="h-12 px-5 rounded-xl bg-amber-400 active:bg-amber-500 text-stone-950 font-bold text-sm shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer touch-manipulation shrink-0"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="h-12 px-5 rounded-xl bg-stone-950 text-yellow-400 font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer touch-manipulation shrink-0"
            >
              <span>Finish</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 5. Mobile Slide-Up Question Palette Sheet */}
        {showQuestionPalette && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Question palette">
            <div
              onClick={() => setShowQuestionPalette(false)}
              className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm transition-opacity"
            />
            <div className="relative bg-white rounded-t-3xl border-t border-stone-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3 z-10 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto shrink-0" />
              <div className="flex items-center justify-between shrink-0">
                <h3 className="font-bold text-base text-stone-900">Question Palette</h3>
                <button
                  onClick={() => setShowQuestionPalette(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 cursor-pointer touch-manipulation"
                  aria-label="Close palette"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-stone-600 font-medium shrink-0">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered ({answeredCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300 inline-block" /> Remaining ({remainingCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Flagged ({flaggedCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-950 inline-block" /> Current
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5 overflow-y-auto overscroll-y-contain py-2 px-0.5">
                {activeExam.questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id]?.trim();
                  const isFlagged = !!flaggedQuestions[q.id];
                  const isCurrent = idx === currentQuestionIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIdx(idx);
                        setShowQuestionPalette(false);
                      }}
                      className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center relative cursor-pointer active:scale-95 transition-all touch-manipulation tabular-nums ${
                        isCurrent
                          ? 'bg-stone-950 text-white shadow-xs'
                          : isAnswered
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. Mobile Exit Confirmation Modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Leave challenge">
            <div
              onClick={() => setShowExitModal(false)}
              className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm"
            />
            <div className="relative bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-stone-200 text-center space-y-3 z-10 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900">Leave Challenge?</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your current responses for this test will not be submitted and will be lost.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 h-12 rounded-xl bg-stone-950 text-yellow-400 font-bold text-xs cursor-pointer active:scale-95 touch-manipulation"
                >
                  Keep Testing
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    setActiveExam(null);
                  }}
                  className="flex-1 h-12 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-xs cursor-pointer active:scale-95 touch-manipulation"
                >
                  Quit Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="block sm:hidden space-y-3 pb-8">
      {/* 1. Parent Assigned Priority Challenge (Matching Home Banner) */}
      {assignedExam && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 border border-yellow-300 shadow-sm text-stone-950 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-stone-950/10 flex items-center justify-center text-stone-950 shrink-0">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                <span>Assigned Challenge</span>
                <span className="text-stone-900 bg-white/40 px-1 py-0.5 rounded font-bold text-[9px]">
                  {(assignedExam.difficulty || 'simple').toUpperCase()}
                </span>
              </div>
              <div className="text-xs font-bold text-stone-950 truncate">
                {assignedExam.subject} {assignedExam.chapterTopic ? `— ${assignedExam.chapterTopic}` : ''}
              </div>
              <div className="text-[11px] text-stone-800 font-medium truncate">
                {assignedExam.questionCount} Qs • {assignedExam.timeLimitMinutes}m • {blueprint.totalMarks} Marks
              </div>
            </div>
          </div>
          <button
            disabled={isGenerating}
            onClick={() => handleStartExam(true)}
            className="shrink-0 h-10 px-4 rounded-xl bg-stone-950 text-yellow-400 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60 touch-manipulation"
          >
            <span>{isStartingAssignedExam ? 'Loading...' : 'Start'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
          </button>
        </div>
      )}

      {/* 2. Remedial Focus Sprint Banner (if topic set) */}
      {activeTopic && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 shadow-2xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md inline-block">
              Remedial Focus Sprint
            </span>
            <p className="text-xs font-bold text-stone-900 truncate mt-0.5">{activeTopic}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTopic(null)}
            className="text-xs font-bold text-stone-600 bg-white border border-stone-200 h-9 px-3.5 rounded-xl shrink-0 cursor-pointer active:scale-95 active:bg-stone-50 touch-manipulation"
          >
            Clear
          </button>
        </div>
      )}

      {/* 3. Parent Cross-Board Selector (only if parent persona) */}
      {!isStudentPersona && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
          <div>
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
              1. Target Board
            </span>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 -mx-1 px-1">
              {BOARDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBoard(b)}
                  className={`h-10 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 touch-manipulation ${selectedBoard === b
                    ? 'bg-amber-400 text-stone-950 shadow-2xs'
                    : 'bg-stone-100 text-stone-600 active:bg-stone-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
              2. Grade / Class
            </span>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 -mx-1 px-1">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`h-10 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 touch-manipulation ${selectedGrade === g
                    ? 'bg-amber-400 text-stone-950 shadow-2xs'
                    : 'bg-stone-100 text-stone-600 active:bg-stone-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Mobile Subject Dropdown */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="mobile-subject-dropdown-select" className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            {isStudentPersona ? '1. Select Subject' : '3. Subject'}
          </label>
          {isLoadingSubjects && (
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 rounded-full px-2 py-0.5 animate-pulse">
              Loading...
            </span>
          )}
        </div>
        <select
          id="mobile-subject-dropdown-select"
          value={selectedSubject}
          disabled={isLoadingSubjects || dbSubjects.length === 0}
          onChange={(e) => {
            setSelectedSubject(e.target.value as Subject);
            if (activeTopic) setActiveTopic(null);
          }}
          className="w-full h-12 px-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-base font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden disabled:bg-stone-100 disabled:text-stone-400"
        >
          {isLoadingSubjects ? (
            <option value="">Fetching subjects...</option>
          ) : dbSubjects.length === 0 ? (
            <option value="">No subjects for {selectedGrade} ({selectedBoard})</option>
          ) : (
            <>
              <option value="">Select your subject</option>
              {dbSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              {selectedSubject && !dbSubjects.some((subject) => subject.toLowerCase() === selectedSubject.toLowerCase()) && (
                <option value={selectedSubject}>{selectedSubject}</option>
              )}
            </>
          )}
        </select>

        {/* Science Sub-Branch Pill Selector (if Science is active) */}
        {String(selectedSubject || '').toLowerCase().trim() === 'science' && (
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200/80 space-y-2 animate-in fade-in duration-150">
            <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider block">
              Science Sub-Domain:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'Physics', label: 'Physics' },
                { id: 'Chemistry', label: 'Chem' },
                { id: 'Biology', label: 'Bio' },
              ].map((b) => {
                const isSel = selectedBranch === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBranch(b.id as any)}
                    className={`h-10 px-1 rounded-lg text-xs transition-all cursor-pointer text-center active:scale-95 touch-manipulation ${
                      isSel
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'bg-white border border-emerald-200 text-emerald-900 font-semibold active:bg-emerald-50'
                    }`}
                  >
                    <span className="truncate">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Challenge Difficulty Level - Sleek Segmented Control */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
            {isStudentPersona ? '2. Challenge Difficulty Level' : '4. Exam Level'}
          </span>
        </div>

        <div className="p-1 bg-stone-100 rounded-xl flex gap-1 border border-stone-200/60" role="radiogroup" aria-label="Difficulty">
          {[
            { id: 'simple' as ExamDifficulty, label: 'Simple', sub: 'Foundation' },
            { id: 'medium' as ExamDifficulty, label: 'Medium', sub: 'Proficiency' },
            { id: 'hard' as ExamDifficulty, label: 'Hard', sub: 'HOTS' },
          ].map((d) => {
            const isSel = selectedDifficulty === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`flex-1 min-h-[48px] py-2 px-1 text-center rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 touch-manipulation ${
                  isSel
                    ? 'bg-stone-950 text-amber-400 font-bold shadow-2xs'
                    : 'text-stone-600 font-semibold'
                }`}
              >
                <span className="text-sm font-bold leading-tight">{d.label}</span>
                <span className={`text-[10px] ${isSel ? 'text-amber-200/80 font-medium' : 'text-stone-400 font-normal'}`}>
                  {d.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Bottom Action Card & Start CTA (Unified with Home Button style) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-stone-50 border border-stone-100 rounded-xl py-2">
            <Clock className="w-3.5 h-3.5 text-stone-500 mx-auto mb-0.5" />
            <div className="text-xs font-bold text-stone-900 tabular-nums">{blueprint.durationMinutes}</div>
            <div className="text-[10px] text-stone-500 font-medium">Mins</div>
          </div>
          <div className="bg-stone-50 border border-stone-100 rounded-xl py-2">
            <Target className="w-3.5 h-3.5 text-stone-500 mx-auto mb-0.5" />
            <div className="text-xs font-bold text-stone-900 tabular-nums">{blueprint.totalMarks}</div>
            <div className="text-[10px] text-stone-500 font-medium">Marks</div>
          </div>
          <div className="bg-stone-50 border border-stone-100 rounded-xl py-2">
            <FileText className="w-3.5 h-3.5 text-stone-500 mx-auto mb-0.5" />
            <div className="text-xs font-bold text-stone-900 tabular-nums">{blueprint.questionCount}</div>
            <div className="text-[10px] text-stone-500 font-medium">Questions</div>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
          <p className="text-[11px] leading-relaxed text-stone-600">
            Generating <strong className="text-stone-900">{blueprint.questionCount} questions ({blueprint.totalMarks} Marks)</strong> for <strong className="text-stone-900">{selectedGrade} {selectedBoard}{selectedSubject ? ` • ${selectedSubject}${String(selectedSubject).toLowerCase().trim() === 'science' && selectedBranch !== 'all' ? ` (${selectedBranch})` : ''}` : ''} ({selectedDifficulty.toUpperCase()})</strong> — {blueprint.breakdown}.
          </p>
        </div>

        <button
          disabled={isGenerating || !selectedSubject}
          onClick={() => handleStartExam(false)}
          className={`w-full min-h-[52px] px-3 py-3 rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 touch-manipulation ${
            !selectedSubject
              ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
              : 'bg-amber-400 active:bg-amber-500 text-stone-950 shadow-amber-400/20'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="truncate">{generationStep || 'Building Exam...'}</span>
            </>
          ) : (
            <>
              <span className="truncate">
                {!selectedSubject
                  ? 'Select a Subject First'
                  : activeTopic
                    ? `Start Sprint: ${activeTopic}`
                    : `Start Practice Test`
                }
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
