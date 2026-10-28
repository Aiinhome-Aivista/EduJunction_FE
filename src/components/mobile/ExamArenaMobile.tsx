import React from 'react';
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
    isStudentPersona, assignedExam, blueprint, isGenerating, handleStartExam,
    activeTopic, setActiveTopic, selectedSubject, setSelectedSubject, isLoadingSubjects,
    dbSubjects, selectedBranch, setSelectedBranch, getSubjectConfig, selectedDifficulty,
    setSelectedDifficulty, generationStep,
  } = c;
  if (mode === 'active') return <>{        <div className="flex sm:hidden fixed inset-0 z-50 bg-stone-50 flex-col">
          {/* 1. Mobile Fixed Top Bar */}
          <div className="h-14 bg-white border-b border-stone-200/90 px-3 flex items-center justify-between shrink-0 shadow-2xs">
            {/* Exit Button */}
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors active:scale-95 cursor-pointer"
              title="Exit Test"
            >
              <X className="w-5 h-5 text-stone-700" />
            </button>

            {/* Exam Center Info */}
            <div className="flex flex-col items-center min-w-0 px-2">
              <span className="text-xs font-bold text-stone-900 truncate max-w-[150px]">
                {activeExam.subject || 'Challenge'}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                Q {currentQuestionIdx + 1} of {totalQuestions}
              </span>
            </div>

            {/* Timer & Submit */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold ${
                isLowTime ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="px-3 py-1 rounded-xl bg-stone-950 text-yellow-400 font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>

          {/* 2. Top Progress Strip */}
          <div className="w-full h-1 bg-stone-200/60 shrink-0">
            <div
              className="h-full bg-amber-400 transition-all duration-300 shadow-2xs"
              style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* 3. Scrollable Question & Options Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 pb-24">
            {/* Meta Row: Badges & Flag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-stone-900 bg-stone-200/80 px-2 py-0.5 rounded-md">
                  {currentQ.marks || 1} {(currentQ.marks || 1) > 1 ? 'Marks' : 'Mark'}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  (currentQ.difficulty || adaptiveDifficulty) === 'hard'
                    ? 'bg-rose-100 text-rose-800'
                    : (currentQ.difficulty || adaptiveDifficulty) === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentQ.difficulty || adaptiveDifficulty}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {currentQ.type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentQ.id)}
                className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                  flaggedQuestions[currentQ.id]
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-stone-200 text-stone-400 hover:text-stone-600'
                }`}
                title="Flag for review"
              >
                <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>

            {/* Topic pill (if present) */}
            {currentQ.topic && (
              <div className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                <BookOpen className="w-3 h-3 text-stone-500 shrink-0" />
                <span className="truncate">{currentQ.topic}</span>
              </div>
            )}

            {/* Question Text */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
              <p className="text-stone-900 text-sm font-semibold leading-relaxed whitespace-pre-line">
                {currentQ.questionText}
              </p>

              {/* Question Diagram / Image if present */}
              {(currentQ.imageUrl || currentQ.image_url) && (
                <div className="my-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col items-center">
                  <img
                    src={(currentQ.imageUrl || currentQ.image_url)?.startsWith('http') ? (currentQ.imageUrl || currentQ.image_url) : (import.meta.env.VITE_API_BASE_URL || '') + (currentQ.imageUrl || currentQ.image_url)}
                    alt="Question Diagram"
                    className="max-h-48 w-auto object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* MCQ Options */}
            {(currentQ.type === 'mcq' || currentQ.type === 'logical') && currentQ.options && currentQ.options.length > 0 && (
              <div className="space-y-2">
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
                      onClick={() => handleSelectAnswer(currentQ.id, letter, true)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50/50 shadow-xs ring-1 ring-amber-400'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 font-black shadow-2xs'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {letter}
                      </div>
                      <span className={`text-xs sm:text-sm leading-snug flex-1 ${
                        isSelected ? 'font-bold text-stone-900' : 'font-medium text-stone-700'
                      }`}>
                        {cleanText || opt}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
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
                  rows={4}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your explanation or solution here..."
                  className="w-full p-3 rounded-2xl border border-stone-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 text-stone-900 text-xs sm:text-sm outline-none resize-none bg-white"
                />
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
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  placeholder="e.g. 6 or 3.14"
                  className="w-full p-3 rounded-2xl border border-stone-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 text-stone-900 font-mono text-sm outline-none bg-white"
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
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  placeholder="e.g. Total Internal Reflection"
                  className="w-full p-3 rounded-2xl border border-stone-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 text-stone-900 text-xs sm:text-sm outline-none bg-white"
                />
              </div>
            )}
          </div>

          {/* 4. Mobile Fixed Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200/90 px-4 flex items-center justify-between z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            {/* Prev Button */}
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((p) => p - 1)}
              className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {/* Palette Button (Shows X of Y answered) */}
            <button
              type="button"
              onClick={() => setShowQuestionPalette(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs active:scale-95 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-700" />
              <span>{answeredCount}/{totalQuestions} Qs</span>
            </button>

            {/* Next / Submit Button */}
            {currentQuestionIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="px-4 py-2 rounded-xl bg-stone-950 text-yellow-400 font-bold text-xs shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Finish</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 5. Mobile Slide-Up Question Palette Sheet */}
          {showQuestionPalette && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <div
                onClick={() => setShowQuestionPalette(false)}
                className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm transition-opacity"
              />
              <div className="relative bg-white rounded-t-3xl border-t border-stone-200 p-4 space-y-3 z-10 max-h-[70vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
                <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto" />
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-900">Question Palette</h3>
                  <button
                    onClick={() => setShowQuestionPalette(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-stone-600 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered ({answeredCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-200 inline-block" /> Remaining ({remainingCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 overflow-y-auto py-2">
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
                        className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center relative cursor-pointer active:scale-95 transition-all ${
                          isCurrent
                            ? 'bg-stone-950 text-white shadow-xs'
                            : isAnswered
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    Keep Testing
                  </button>
                  <button
                    onClick={() => {
                      setShowExitModal(false);
                      setActiveExam(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer active:scale-95"
                  >
                    Quit Test
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

}</>;
  return <>{      <div className="block sm:hidden space-y-3 pb-8">


        {/* 1. Parent Assigned Priority Challenge (Matching Home Banner) */}
        {assignedExam && (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 border border-yellow-300 shadow-sm text-stone-950 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-stone-950/10 flex items-center justify-center text-stone-950 shrink-0">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                  <span>Assigned Challenge</span>
                  <span className="text-stone-900 bg-white/40 px-1 py-0.2 rounded font-bold text-[8px]">
                    {(assignedExam.difficulty || 'simple').toUpperCase()}
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-950 truncate">
                  {assignedExam.subject} {assignedExam.chapterTopic ? `— ${assignedExam.chapterTopic}` : ''}
                </div>
                <div className="text-[10px] text-stone-800 font-medium truncate">
                  {assignedExam.questionCount} Qs • {assignedExam.timeLimitMinutes}m • {blueprint.totalMarks} Marks
                </div>
              </div>
            </div>
            <button
              disabled={isGenerating}
              onClick={() => handleStartExam(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-stone-950 text-yellow-400 font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
            >
              <span>{isGenerating ? 'Loading...' : 'Start'}</span>
              <ArrowRight className="w-3 h-3 text-yellow-400" />
            </button>
          </div>
        )}

        {/* 2. Remedial Focus Sprint Banner (if topic set) */}
        {activeTopic && (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 shadow-2xs">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md inline-block">
                Remedial Focus Sprint
              </span>
              <p className="text-xs font-bold text-stone-900 truncate mt-0.5">{activeTopic}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTopic(null)}
              className="text-[10px] font-bold text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-xl shrink-0 cursor-pointer active:scale-95 hover:bg-stone-50"
            >
              Clear
            </button>
          </div>
        )}

        {/* 3. Parent Cross-Board Selector (only if parent persona) */}
        {!isStudentPersona && (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2.5">
            <div>
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                1. Target Board
              </span>
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                {BOARDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBoard(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${selectedBoard === b
                      ? 'bg-amber-400 text-stone-950 shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                2. Grade / Class
              </span>
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGrade(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${selectedGrade === g
                      ? 'bg-amber-400 text-stone-950 shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="mobile-subject-dropdown-select" className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              {isStudentPersona ? '1. Select Subject' : '3. Subject'}
            </label>
            <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 rounded-full">
              {isLoadingSubjects && 'Loading...'}
            </span>
          </div>
          <select
            id="mobile-subject-dropdown-select"
            value={selectedSubject}
            disabled={isLoadingSubjects || dbSubjects.length === 0}
            onChange={(e) => {
              setSelectedSubject(e.target.value as Subject);
              if (activeTopic) setActiveTopic(null);
            }}
            className="w-full px-3 py-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-hidden disabled:bg-stone-100 disabled:text-stone-400"
          >
            {isLoadingSubjects ? (
              <option value="">Fetching mapped subjects...</option>
            ) : dbSubjects.length === 0 ? (
              <option value="">No subjects mapped for {selectedGrade} ({selectedBoard})</option>
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
            <div className="mt-2.5 p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200/80 space-y-1.5">
              <span className="text-[9px] font-bold text-emerald-950 uppercase tracking-wider block">
                Science Sub-Domain:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Physics', label: 'Physics' },
                  { id: 'Chemistry', label: 'Chemistry' },
                  { id: 'Biology', label: 'Biology' },
                ].map((b) => {
                  const isSel = selectedBranch === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBranch(b.id as any)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] transition-all cursor-pointer text-center active:scale-95 ${
                        isSel
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'bg-white border border-emerald-200 text-emerald-900 font-semibold hover:bg-emerald-50'
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
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              {isStudentPersona ? '2. Challenge Difficulty Level' : '4. Exam Level'}
            </span>
          </div>

          <div className="p-1 bg-stone-100 rounded-xl flex gap-1 border border-stone-200/60">
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
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`flex-1 py-1.5 px-1 text-center rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                    isSel
                      ? 'bg-stone-950 text-amber-400 font-bold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 font-semibold'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{d.label}</span>
                  <span className={`text-[9px] ${isSel ? 'text-amber-200/80 font-medium' : 'text-stone-400 font-normal'}`}>
                    {d.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Bottom Action Card & Start CTA (Unified with Home Button style) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-stone-600 px-1 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{blueprint.durationMinutes} Mins</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-stone-500" />
              <span>{blueprint.totalMarks} Marks</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-500" />
              <span>{blueprint.questionCount} Questions</span>
            </span>
          </div>

          <button
            disabled={isGenerating || !selectedSubject}
            onClick={() => handleStartExam(false)}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
              !selectedSubject
                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-amber-400/20'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <span>{generationStep || 'Building Exam...'}</span>
              </>
            ) : (
              <>
                <span>
                  {!selectedSubject
                    ? 'Select a Subject First'
                    : activeTopic
                      ? `Start Sprint: ${activeTopic}`
                      : `Start Practice Test (${selectedSubject})`
                  }
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

}</>;
};
