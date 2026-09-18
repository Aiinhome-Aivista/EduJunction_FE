import React, { useState, useEffect } from 'react';
import {
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty,
  Exam,
  ChildAccount,
  ParentAccount,
  ExamSubmission
} from '../types';
import {
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Award,
  Star,
  Smile,
  Loader2,
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface KidsExamArenaProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  activePersona?: 'parent' | 'child';
  onChildSelect: (childId: string) => void;
  presetSubject?: Subject;
  presetDifficulty?: ExamDifficulty;
  initialExam?: Exam | null;
  onClearInitialExam?: () => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const KIDS_GRADES: ClassGrade[] = ['Class 1', 'Class 2', 'Class 3', 'Class 4'];

export const KidsExamArena: React.FC<KidsExamArenaProps> = ({
  parentAccount,
  activeChildId,
  activePersona = 'parent',
  onChildSelect,
  onExamComplete,
  initialExam,
  onClearInitialExam,
}) => {
  const isStudentPersona = activePersona === 'child';
  const activeChild = parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];

  // Config State
  const [selectedBoard, setSelectedBoard] = useState<Board>(activeChild?.targetBoard || 'CBSE');
  const [selectedGrade, setSelectedGrade] = useState<ClassGrade>(
    activeChild?.classGrade && KIDS_GRADES.includes(activeChild.classGrade as ClassGrade)
      ? activeChild.classGrade
      : 'Class 1'
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficulty>('simple');

  // Exam taking state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(initialExam || null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    initialExam?.timeLimitMinutes ? initialExam.timeLimitMinutes * 60 : 15 * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const [assignedExam, setAssignedExam] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiServices.getAssignedExams();
        if (res && res.assignedExams && res.assignedExams.length > 0) {
          const match = res.assignedExams[0];
          setAssignedExam(match);
          if (match.subject) setSelectedSubject(match.subject as Subject);
          if (match.difficulty) setSelectedDifficulty(match.difficulty as ExamDifficulty);
        }
      } catch (e) {}
    })();
  }, [activeChild?.id]);

  useEffect(() => {
    if (initialExam) {
      setActiveExam(initialExam);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setFlaggedQuestions({});
      setTimeRemainingSeconds((initialExam.timeLimitMinutes || 15) * 60);
      if (onClearInitialExam) {
        onClearInitialExam();
      }
    }
  }, [initialExam]);

  useEffect(() => {
    if (activeChild) {
      setSelectedBoard(activeChild.targetBoard);
      if (KIDS_GRADES.includes(activeChild.classGrade as ClassGrade)) {
        setSelectedGrade(activeChild.classGrade);
      }
    }
  }, [activeChildId, activeChild]);

  useEffect(() => {
    let timer: any;
    if (activeExam && timeRemainingSeconds > 0 && !showConfirmSubmit && !isSubmitting) {
      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeExam, timeRemainingSeconds, showConfirmSubmit, isSubmitting]);


  const handleStartExam = async () => {
    if (!activeChild) return;
    setIsGenerating(true);
    setGenerationStep('Loading Your Fun Game... 🎮');

    try {
      const res: any = await ApiServices.generateQuickTest({
        studentId: activeChild.id,
        scheduledExamId: assignedExam?.id,
        subject: assignedExam?.subject || selectedSubject,
        difficulty: assignedExam?.difficulty || selectedDifficulty,
        limit: assignedExam?.questionCount || 5,
      });
      const generatedExam = res?.exam || res;
      if (generatedExam && generatedExam.questions && generatedExam.questions.length > 0) {
        setActiveExam({
          ...generatedExam,
          scheduledExamId: assignedExam?.id || generatedExam.scheduledExamId,
        });
        setCurrentQuestionIdx(0);
        setAnswers({});
        setFlaggedQuestions({});
        setTimeRemainingSeconds((generatedExam.timeLimitMinutes || 10) * 60);
      } else {
        alert('Could not load test questions from database. Please try again!');
      }
    } catch (err: any) {
      console.error('API test generation error:', err);
      const errMsg = err?.response?.data?.error?.message || err?.message || 'Error generating test questions';
      alert(errMsg);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSelectAnswer = (questionId: string, answerValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerValue
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam || isSubmitting) return;
    setIsSubmitting(true);

    const totalSecondsSpent = (activeExam.timeLimitMinutes || 10) * 60 - timeRemainingSeconds;
    const sanitizedTime = Math.max(10, totalSecondsSpent);

    try {
      const res: any = await ApiServices.submitExam(activeExam.id, {
        answers,
        timeTakenSeconds: sanitizedTime,
        scheduledExamId: (activeExam as any).scheduledExamId || (activeExam as any).scheduled_exam_id || assignedExam?.id,
      });

      const submission: ExamSubmission = res?.submission || res;
      onExamComplete(submission);
      setActiveExam(null);
    } catch (err: any) {
      console.error('Error submitting exam, applying client evaluation fallback:', err);
      let marksObtained = 0;
      const evaluations = activeExam.questions.map((q) => {
        let isCorrect = false;
        const studentAnswer = answers[q.id] || '';
        if (q.type === 'mcq' || q.type === 'logical') {
          isCorrect = studentAnswer.toUpperCase() === q.correctAnswer.toUpperCase() ||
                      studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        } else if (q.type === 'numerical' || q.type === 'objective') {
          isCorrect = studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }

        if (isCorrect) marksObtained += (q.marks || 1);

        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          studentAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          marksAwarded: isCorrect ? (q.marks || 1) : 0,
          explanation: q.explanation,
          referenceLinks: [],
          topic: q.topic
        };
      });

      const examTotalMarks = activeExam.totalMarks || activeExam.questions.length || 5;
      const submission: ExamSubmission = {
        id: `kids-sub-${Date.now()}`,
        examId: activeExam.id,
        examTitle: activeExam.title,
        studentId: activeChild?.id || 'unknown',
        studentName: activeChild?.name || 'Student',
        board: activeExam.board,
        classGrade: activeExam.classGrade,
        subject: activeExam.subject,
        difficulty: activeExam.difficulty,
        answers,
        marksObtained,
        totalMarks: examTotalMarks,
        accuracyPercentage: Math.round((marksObtained / examTotalMarks) * 100),
        timeTakenSeconds: sanitizedTime,
        submittedAt: new Date().toISOString(),
        evaluations,
        analysis: {
          overallBand: (marksObtained / examTotalMarks) >= 0.8 ? 'Master' : (marksObtained / examTotalMarks) >= 0.6 ? 'Proficient' : 'Developing',
          masteryScorePercentage: Math.round((marksObtained / examTotalMarks) * 100),
          strengths: ['Great job solving interactive puzzles! 🌟'],
          areasToImprove: [],
          kGraphInsights: [],
          evolutionaryRoadmap: 'Keep practicing to unlock more badges and super stars! 🚀',
          encouragementNote: 'You did amazing! Keep playing and learning! ✨',
          recommendedNextExam: {
            board: activeExam.board,
            classGrade: activeExam.classGrade,
            subject: activeExam.subject,
            difficulty: 'simple',
            reason: 'Practice makes perfect!'
          },
          curatedStudyLinks: []
        }
      };

      onExamComplete(submission);
      setActiveExam(null);
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeExam) {
    const currentQ = activeExam.questions[currentQuestionIdx];
    const totalQuestions = activeExam.questions.length;
    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim() !== '').length;

    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-1 font-comic">
        {/* Top Status Bar */}
        <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-md p-2.5 sm:p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-300 border-2 border-yellow-400 flex items-center justify-center font-black text-base text-yellow-800 shadow-xs">
              {currentQuestionIdx + 1}/{totalQuestions}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sky-900 text-sm sm:text-base">{activeExam.title} 🌟</span>
              </div>
              <p className="text-xs text-sky-600 font-bold">
                Student: <span className="text-sky-800">{activeChild?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 font-black text-sm ${timeRemainingSeconds < 180
              ? 'bg-rose-100 border-rose-300 text-rose-600 animate-bounce'
              : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            {/* Finish / Submit Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 border-2 border-yellow-500 text-yellow-950 text-sm font-black shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              Finish! 🎯
            </button>
          </div>
        </div>

        {/* Main Grid: Question Content + Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Question Card (Col 1-3) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-md p-4 sm:p-5 relative overflow-hidden">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-sky-100 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-500 text-white shadow-xs">
                    Question {currentQuestionIdx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                    Topic: {currentQ.topic}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-lg">
                    ⭐ {currentQ.marks || 1} Star{(currentQ.marks || 1) > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`p-1.5 rounded-lg border flex items-center gap-1 transition-transform hover:scale-110 ${flaggedQuestions[currentQ.id]
                      ? 'bg-amber-100 border-amber-400 text-amber-700'
                      : 'bg-white border-stone-200 text-stone-400'
                      }`}
                    title="Mark to check later!"
                  >
                    <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-sky-950 text-sm sm:text-base md:text-lg font-bold leading-snug mb-3.5 whitespace-pre-line">
                {currentQ.questionText}
              </div>

              {/* Response Inputs based on Type */}
              <div className="space-y-2 pt-0.5">
                {(currentQ.type === 'mcq' || currentQ.type === 'logical') && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const cleanText = opt.replace(/^(?:option\s+)?\(?[A-Da-d]\)?[\).\:\-]?\s*/i, '').trim();
                      const isSelected = answers[currentQ.id]?.toUpperCase() === letter || answers[currentQ.id]?.trim().toLowerCase() === cleanText.toLowerCase() || answers[currentQ.id] === opt;
                      return (
                        <label
                          key={oIdx}
                          onClick={() => handleSelectAnswer(currentQ.id, letter)}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-0.5 ${isSelected
                            ? 'bg-emerald-100 border-emerald-400 shadow-xs text-emerald-950 font-black'
                            : 'bg-white border-stone-200 hover:border-sky-300 text-stone-700'
                            }`}
                        >
                          <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-xs sm:text-sm font-black transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-stone-100 border-stone-300 text-stone-500'
                            }`}>
                            {letter}
                          </div>
                          <span className="text-xs sm:text-sm md:text-base font-bold leading-normal">{cleanText || opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {currentQ.type === 'numerical' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-sky-700">
                      Type your number here:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full max-w-xs px-3 py-2 rounded-xl border-2 border-sky-300 text-sky-950 font-black text-xl focus:ring-2 focus:ring-yellow-400 focus:outline-hidden"
                    />
                  </div>
                )}

                {currentQ.type === 'objective' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-sky-700">
                      Type your answer here:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="Your answer..."
                      className="w-full px-3 py-2 rounded-xl border-2 border-sky-300 text-sky-950 font-bold text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Footer Controls */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-sky-100">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-sky-300 text-xs sm:text-sm font-black text-sky-700 hover:bg-sky-50 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                {currentQuestionIdx < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                    className="flex items-center gap-1 px-5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 border border-sky-600 text-white text-xs sm:text-sm font-black shadow-sm hover:scale-105 transition-all cursor-pointer"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-1 px-5 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 text-yellow-950 text-xs sm:text-sm font-black shadow-sm hover:scale-105 transition-all cursor-pointer"
                  >
                    Done! 🏆
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Palette (Col 4) */}
          <div className="lg:col-span-1 self-start sticky top-4">
            <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-md p-3.5 sm:p-4">
              <h3 className="text-xs font-black text-sky-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Map 🗺️</span>
                <span className="text-[11px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">{answeredCount}/{totalQuestions}</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-1">
                {activeExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = !!answers[q.id]?.trim();
                  const isFlagged = !!flaggedQuestions[q.id];

                  let btnBg = 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100';
                  if (isAnswered) btnBg = 'bg-emerald-400 border-emerald-500 text-white font-black shadow-xs';
                  if (isFlagged) btnBg = 'bg-amber-300 border-amber-400 text-amber-900 font-black shadow-xs';
                  if (isCurrent) btnBg = 'bg-yellow-400 border-yellow-500 text-yellow-950 font-black scale-105 shadow-xs';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-8 sm:h-9 rounded-lg border text-sm font-black flex items-center justify-center transition-all relative cursor-pointer ${btnBg}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 text-[10px] drop-shadow-xs">🚩</span>
                      )}
                      {isAnswered && !isCurrent && !isFlagged && (
                        <span className="absolute -top-1 -right-1 text-[10px] drop-shadow-xs">⭐</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 bg-sky-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border-4 border-sky-200 text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-yellow-300 flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                🏆
              </div>
              <h3 className="text-3xl font-black text-sky-950 mb-3">All Done?</h3>
              <p className="text-lg text-stone-600 font-bold mb-8">
                You've got <span className="text-emerald-600 text-2xl">{answeredCount}</span> out of {totalQuestions} stars!
                {totalQuestions - answeredCount > 0 && (
                  <span className="text-rose-500 block mt-2">
                    Oh oh! You missed {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's' : ''}.
                  </span>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  id="confirm-kids-submit-btn"
                  disabled={isSubmitting}
                  onClick={handleSubmitExam}
                  className="w-full px-6 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-500 border-4 border-emerald-500 text-white text-lg font-black shadow-lg hover:scale-105 transition-all disabled:opacity-85 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                      <span>Checking Answers...</span>
                    </>
                  ) : (
                    "Yes, Let's Go! 🚀"
                  )}
                </button>
                <button
                  id="cancel-kids-submit-btn"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmSubmit(false)}
                  className="w-full px-6 py-4 rounded-full bg-stone-100 hover:bg-stone-200 border-4 border-stone-200 text-stone-600 text-xl font-black hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Wait, go back!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Configuration & Exam Setup Screen for Kids
  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 font-sans space-y-5">
      <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-yellow-300 text-yellow-950 border border-yellow-400 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current text-yellow-600" />
            <span>Super Fun Learning Zone! 🎈</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-xs">
            Ready for an Adventure? 🚀
          </h1>

          <p className="text-sky-100 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
            Let's play a game of questions! Answer them correctly to earn shiny stars and badges.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/30 shadow-md">
              <span className="text-2xl bg-white p-1 rounded-full shadow-inner">{activeChild?.avatar || '👦'}</span>
              <div className="text-left">
                <span className="text-sky-100 text-[10px] font-bold block uppercase tracking-wider">Player 1 Ready:</span>
                <span className="font-bold text-base text-white drop-shadow-xs">{activeChild?.name} ({selectedGrade} • {selectedBoard})</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating background elements */}
        <div className="absolute top-4 left-6 text-3xl opacity-25 animate-bounce delay-100 pointer-events-none">🌟</div>
        <div className="absolute bottom-4 right-6 text-3xl opacity-25 animate-bounce delay-300 pointer-events-none">🎈</div>
        <div className="absolute top-8 right-12 text-2xl opacity-20 animate-pulse pointer-events-none">🚀</div>
      </div>



      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center justify-center gap-2">
            <span>Pick Your Quest!</span> 🗺️
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {assignedExam
              ? `Click below to start your parent-assigned ${assignedExam.questionCount}-question ${assignedExam.subject} challenge`
              : 'Click below to start your quick 5-question fun challenge'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleStartExam}
            className="group px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{generationStep || 'Loading Your Fun Game... 🎮'}</span>
              </>
            ) : (
              <>
                <span>Start Playing!</span>
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
