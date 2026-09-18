import React, { useState } from 'react';
import { ExamSubmission, QuestionEvaluation } from '../types';
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Printer,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  HeartHandshake,
  Compass,
  MessageSquare,
  Zap,
  Share2,
  Smile,
  Gamepad2
} from 'lucide-react';

interface DiagnosticReportProps {
  submission: ExamSubmission;
  onRetakeOrNextExam: (board: string, classGrade: string, subject: string, difficulty: string) => void;
  onBackToDashboard: () => void;
  onNavigateToLearningPath?: () => void;
  onNavigateToFunZone?: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  submission,
  onRetakeOrNextExam,
  onBackToDashboard,
  onNavigateToLearningPath,
  onNavigateToFunZone
}) => {
  const evaluations: QuestionEvaluation[] = submission?.evaluations || [];

  const analysis = submission?.analysis || {
    overallBand: 'Proficient' as const,
    masteryScorePercentage: (submission?.marksObtained || 0) * 10,
    strengths: ['Core conceptual understanding', 'Grounded problem solving'],
    areasToImprove: ['Timed speed', 'Complex multi-step questions'],
    kGraphInsights: [],
    evolutionaryRoadmap: 'Continue regular diagnostic sprints to maintain knowledge accretion.',
    encouragementNote: 'Great effort on completing the diagnostic sprint!',
    recommendedNextExam: {
      board: submission?.board || 'CBSE',
      classGrade: submission?.classGrade || 'Class 10',
      subject: submission?.subject || 'Mathematics',
      difficulty: 'medium' as const,
      reason: 'Adaptive knowledge progression.'
    },
    curatedStudyLinks: []
  };

  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>(() => {
    return evaluations.reduce((acc, eq) => {
      acc[eq.questionId] = !eq.isCorrect;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const toggleQuestionExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const expandAll = (expand: boolean) => {
    const nextState: Record<string, boolean> = {};
    evaluations.forEach((eq) => {
      nextState[eq.questionId] = expand;
    });
    setExpandedQuestions(nextState);
  };

  const handlePrint = () => {
    window.print();
  };

  const nextExam = analysis.recommendedNextExam || {
    board: submission?.board || 'CBSE',
    classGrade: submission?.classGrade || 'Class 10',
    subject: submission?.subject || 'Mathematics',
    difficulty: 'medium' as const,
    reason: 'Adaptive progression'
  };

  // Calculate actual XP earned from this exam (Backend Canonical Rule: 1% accuracy = 1 XP)
  const isKid = ['Class 1', 'Class 2', 'Class 3', 'Class 4'].includes(submission?.classGrade || '');
  const totalMarks = submission?.totalMarks || (isKid ? 5 : 15);
  const marksObtained = submission?.marksObtained || 0;
  const accuracyPct = Math.round((marksObtained / (totalMarks || 1)) * 100);
  const earnedXP = submission?.xpEarned ?? accuracyPct;
  const timeTakenSeconds = submission?.timeTakenSeconds || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 print:max-w-none print:w-full print:p-0 print:m-0">
      {/* Top Banner / Breadcrumb & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToLearningPath && (
            <button
              onClick={onNavigateToLearningPath}
              className="px-3.5 py-1.5 rounded-xl border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-yellow-600" />
              <span>Adaptive Learning Path</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block pb-3 mb-4 border-b-2 border-stone-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-900 tracking-tight">
              <span className="text-stone-900">Edu</span><span className="text-yellow-500">Path</span> • Student Assessment Dossier
            </h1>
            <p className="text-xs text-stone-600 font-semibold">Diagnostic & Formative Academic Performance Summary</p>
          </div>
          <div className="text-right text-xs text-stone-600">
            <p className="font-bold">Date: {new Date().toLocaleDateString('en-GB')}</p>
            <p>{submission.classGrade || 'Class 3'} • {submission.board || 'ICSE'}</p>
          </div>
        </div>
      </div>

      {/* Gamification Points Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-4 text-white shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              {isKid ? 'Kids Adventure Rewards Unlocked! 🌟' : 'Diagnostic Sprint Rewards Unlocked!'}
            </h3>
            <p className="text-xs text-amber-100">
              +{earnedXP} EduPoints (XP) awarded to candidate's global knowledge rank.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span>+{earnedXP} XP Earned</span>
          <span>•</span>
          <span>{accuracyPct}% Accuracy</span>
          <span>•</span>
          <span>{marksObtained}/{totalMarks} Marks</span>
        </div>
      </div>

      {/* Main Diagnostic Scoreboard Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-300">
                {isKid ? `${totalMarks}-Mark Adventure Challenge Result 🌟` : `${totalMarks}-Mark Diagnostic Analytical Result 🎯`}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                {submission.board || 'Curriculum'} • {submission.classGrade || 'Grade'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{submission.examTitle || `${submission.subject || 'Subject'} Assessment`}</h1>
            <p className="text-xs text-stone-500 mt-1">
              Candidate: <strong className="text-stone-800">{submission.studentName || 'Student'}</strong> • Tested Subject: <strong className="text-stone-800">{submission.subject || 'General'}</strong> ({(submission.difficulty || 'medium').toUpperCase()})
            </p>
          </div>

          {/* Score Indicator */}
          <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 shrink-0">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-600">
                {marksObtained}<span className="text-lg sm:text-xl text-stone-400 font-normal">/{totalMarks}</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                Marks Scored ({accuracyPct}%)
              </div>
            </div>

            <div className="h-10 w-px bg-stone-200" />

            <div>
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${accuracyPct >= 80
                ? 'bg-yellow-100 text-yellow-800'
                : accuracyPct >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
                }`}>
                {accuracyPct >= 80 ? 'Master 🏆' : accuracyPct >= 50 ? 'Proficient ⭐' : 'Developing 🎈'}
              </span>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{Math.floor((timeTakenSeconds || 0) / 60)}m {(timeTakenSeconds || 0) % 60}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Evolutionary Pedagogical Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Strengths & Positive Traits */}
          <div className="bg-yellow-50/60 border border-yellow-300/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-yellow-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-yellow-600" />
              Verified Concept Strengths
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-yellow-950 flex items-start gap-2 leading-relaxed">
                  <span className="text-yellow-500 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Gaps & Areas to Improve */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Identified Misconceptions & Growth Areas
            </h3>
            <ul className="space-y-2">
              {analysis.areasToImprove.map((gap, idx) => (
                <li key={idx} className="text-xs text-rose-950 flex items-start gap-2 leading-relaxed">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evolutionary K-Graph Topic Mastery Breakdown */}
        {analysis.kGraphInsights && analysis.kGraphInsights.length > 0 && (
          <div className="mt-6 pt-6 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-600" />
              Concept & Topic Mastery Matrix
            </h3>
            <div className="space-y-3">
              {analysis.kGraphInsights.map((kNode, idx) => {
                const isMastered = kNode.status === 'mastered';
                const isReinforce = kNode.status === 'reinforce';
                return (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="font-semibold text-xs text-stone-900">{kNode.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${isMastered
                          ? 'bg-yellow-100 text-yellow-800'
                          : isReinforce
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                          }`}>
                          {kNode.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-stone-700">{kNode.masteryPercentage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${isMastered ? 'bg-yellow-500' : isReinforce ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        style={{ width: `${Math.min(100, Math.max(0, kNode.masteryPercentage))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-600 italic">
                      Action: {kNode.recommendedAction}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Evolutionary Learning Roadmap & Encouragement */}
        <div className="mt-6 p-5 rounded-2xl bg-yellow-50/70 border border-yellow-200 space-y-3">
          <div>
            <span className="text-xs font-bold text-yellow-950 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-yellow-700" />
              Evolutionary Next-Step Roadmap
            </span>
            <p className="text-xs text-yellow-900 leading-relaxed">{analysis.evolutionaryRoadmap}</p>
          </div>

          <div className="pt-3 border-t border-yellow-300/60">
            <span className="text-xs font-bold text-yellow-950 flex items-center gap-1.5 mb-1">
              <HeartHandshake className="w-3.5 h-3.5 text-yellow-700" />
              Note for {submission.studentName} & Parents
            </span>
            <p className="text-xs text-yellow-900 leading-relaxed font-medium">{analysis.encouragementNote}</p>
          </div>
        </div>

        {/* Encouraged Next Exam CTA */}
        {nextExam && (
          <div className="mt-6 p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-300 block mb-1">
                {isKid ? 'Next Fun Adventure Challenge 🚀' : 'AI-RAG Recommended Next Level Exam'}
              </span>
              <h4 className="text-base font-bold">
                {nextExam.classGrade} {nextExam.board} {nextExam.subject} ({nextExam.difficulty.toUpperCase()} Level)
              </h4>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">
                {nextExam.reason}
              </p>
            </div>

            <button
              id="take-next-level-exam-btn"
              onClick={() => onRetakeOrNextExam(nextExam.board, nextExam.classGrade, nextExam.subject, nextExam.difficulty)}
              className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-stone-900 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <span>{isKid ? 'Play Next Adventure! 🚀' : 'Take Next Level Exam'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Brain Break & Fun Zone Banner */}
      {onNavigateToFunZone && (
        <div className="bg-gradient-to-r from-pink-500/10 via-amber-500/10 to-yellow-500/10 border border-pink-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Need a Quick Brain Break & Mental Recharge?</h4>
              <p className="text-xs text-stone-600">
                Play 30-second speed math duels, memory concept matches, or read funny science anecdotes & jokes!
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToFunZone}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-yellow-500 hover:from-pink-700 hover:to-yellow-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Open Brain Break Arcade</span>
          </button>
        </div>
      )}

      {/* Section: Comprehensive Itemized Review */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {evaluations.length > 0 ? `${evaluations.length}-Question Itemized Review & AI Explanations` : 'Itemized Question Review & AI Explanations'}
            </h2>
            <p className="text-xs text-stone-500">Compare student choices with correct answers, step-by-step logic, and reference links</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => expandAll(true)}
              className="px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium"
            >
              Expand All
            </button>
            <button
              onClick={() => expandAll(false)}
              className="px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Screen-Only 10 Question Accordion List */}
        <div className="space-y-4 print:hidden">
          {evaluations.length > 0 ? (
            evaluations.map((eq) => {
              const isExpanded = !!expandedQuestions[eq.questionId];
              return (
                <div
                  key={eq.questionId}
                  className={`rounded-2xl border transition-all ${eq.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                    }`}
                >
                  {/* Accordion Bar */}
                  <div
                    onClick={() => toggleQuestionExpand(eq.questionId)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      {eq.isCorrect ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                          ✗
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-stone-900">
                            Q{eq.questionNumber}.
                          </span>
                          <span className="text-xs sm:text-sm text-stone-800 line-clamp-1 font-medium">
                            {eq.questionText}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                          <span className="uppercase font-semibold">{eq.type}</span>
                          <span>•</span>
                          <span>{eq.topic}</span>
                          <span>•</span>
                          <span className={eq.marksAwarded >= ((eq as any).questionMarks || 1) ? 'text-emerald-700 font-semibold' : eq.marksAwarded > 0 ? 'text-amber-700 font-semibold' : 'text-rose-600 font-semibold'}>
                            {eq.marksAwarded} / {(eq as any).questionMarks || 1} {((eq as any).questionMarks || 1) > 1 ? 'Marks' : 'Mark'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold hidden sm:inline-block ${eq.marksAwarded >= ((eq as any).questionMarks || 1)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : eq.marksAwarded > 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                        {eq.marksAwarded >= ((eq as any).questionMarks || 1)
                          ? `Correct (+${eq.marksAwarded})`
                          : eq.marksAwarded > 0
                            ? `Partial Credit (+${eq.marksAwarded})`
                            : 'Incorrect (0.0)'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-100/80 bg-white/70 rounded-b-2xl space-y-4">
                      {/* Full Question Text */}
                      <div className="text-xs sm:text-sm text-stone-900 whitespace-pre-line leading-relaxed font-medium bg-stone-50 p-3 rounded-xl">
                        {eq.questionText}
                      </div>

                      {/* Options (if MCQ/Logical) */}
                      {eq.options && eq.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {eq.options.map((opt, oIdx) => {
                            const optStr = (opt || '').trim();
                            const optLetter = optStr.charAt(0).toUpperCase();
                            const cleanOptText = optStr.replace(/^(?:option\s+)?\(?[A-Da-d]\)?[\).\:\-]?\s*/i, '').trim();
                            const optBody = cleanOptText.toLowerCase();
                            const cleanCorrect = (eq.correctAnswer || '').trim().toLowerCase();
                            const cleanStudent = (eq.studentAnswer || '').trim().toLowerCase();

                            const isCorrectOpt = Boolean(
                              eq.correctAnswer && (
                                eq.correctAnswer.toUpperCase() === optLetter ||
                                eq.correctAnswer.toUpperCase() === String.fromCharCode(65 + oIdx) ||
                                optStr.toUpperCase().startsWith(eq.correctAnswer.toUpperCase()) ||
                                (optBody && optBody === cleanCorrect) ||
                                (cleanCorrect.length > 3 && optBody.includes(cleanCorrect)) ||
                                (cleanCorrect.length > 3 && cleanCorrect.includes(optBody))
                              )
                            );
                            const isStudentOpt = Boolean(
                              eq.studentAnswer && (
                                eq.studentAnswer.toUpperCase() === optLetter ||
                                eq.studentAnswer.toUpperCase() === String.fromCharCode(65 + oIdx) ||
                                optStr.toUpperCase().startsWith(eq.studentAnswer.toUpperCase()) ||
                                (optBody && optBody === cleanStudent) ||
                                (cleanStudent.length > 3 && optBody.includes(cleanStudent)) ||
                                (cleanStudent.length > 3 && cleanStudent.includes(optBody)) ||
                                optStr.toLowerCase() === cleanStudent
                              )
                            );

                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border text-xs leading-snug transition-all ${isCorrectOpt
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-300/40'
                                  : isStudentOpt
                                    ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                                    : 'bg-stone-50/50 border-stone-200 text-stone-600'
                                  }`}
                              >
                                <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                                {cleanOptText || opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Answers Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl border ${eq.marksAwarded >= ((eq as any).questionMarks || 1)
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : eq.marksAwarded > 0
                            ? 'border-amber-300 bg-amber-50/40'
                            : 'border-rose-200 bg-rose-50/40'
                          }`}>
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                            Candidate Submitted Answer:
                          </span>
                          <span className={`text-xs sm:text-sm font-bold ${eq.marksAwarded >= ((eq as any).questionMarks || 1)
                            ? 'text-emerald-700'
                            : eq.marksAwarded > 0
                              ? 'text-amber-800'
                              : 'text-rose-600'
                            }`}>
                            {eq.studentAnswer || '(No answer selected)'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border border-emerald-400 bg-emerald-50/90 shadow-2xs">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Verified Model Answer / Solution:
                          </span>
                          <span className="text-xs sm:text-sm font-black text-emerald-950">
                            {eq.correctAnswer}
                          </span>
                        </div>
                      </div>

                      {/* Teacher Constructive Feedback */}
                      {eq.feedback && (
                        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-blue-900 block mb-0.5">Teacher Evaluation & Rubric Feedback:</strong>
                            <span className="leading-relaxed text-blue-950">{eq.feedback}</span>
                          </div>
                        </div>
                      )}

                      {/* Keyword Analytics (Concepts captured vs Missing) */}
                      {((eq.matchedKeywords && eq.matchedKeywords.length > 0) || (eq.missedKeywords && eq.missedKeywords.length > 0)) && (
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                          {eq.matchedKeywords && eq.matchedKeywords.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-emerald-800 text-[11px] uppercase">Key Concepts Captured:</span>
                              {eq.matchedKeywords.map((kw, kIdx) => (
                                <span key={kIdx} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-medium border border-emerald-200">
                                  ✓ {kw}
                                </span>
                              ))}
                            </div>
                          )}
                          {eq.missedKeywords && eq.missedKeywords.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-amber-800 text-[11px] uppercase">Points to Reinforce:</span>
                              {eq.missedKeywords.map((kw, kIdx) => (
                                <span key={kIdx} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-medium border border-amber-200">
                                  + {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Misconception Identified */}
                      {eq.misconceptionIdentified && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                          <strong className="font-bold text-amber-900">Misconception Identified: </strong>
                          {eq.misconceptionIdentified}
                        </div>
                      )}

                      {/* Step-by-Step AI Explanation */}
                      <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-200 text-xs text-yellow-950 space-y-1">
                        <div className="font-bold text-yellow-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                          Step-by-Step AI Derivation & Concept Explanation:
                        </div>
                        <p className="leading-relaxed whitespace-pre-line text-stone-800">{eq.explanation}</p>
                      </div>

                      {/* Question Reference Links */}
                      {eq.referenceLinks && eq.referenceLinks.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                            Direct Study & Syllabus References for this Topic:
                          </span>
                          <div className="space-y-1.5">
                            {eq.referenceLinks.map((ref, rIdx) => (
                              <a
                                key={rIdx}
                                href={ref.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/30 transition-all text-xs group"
                              >
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                                  <span className="font-semibold text-stone-900 group-hover:text-yellow-600">{ref.title}</span>
                                  <span className="text-[10px] text-stone-400">({ref.source})</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-yellow-600" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-stone-100">
              Itemized question breakdown will be synchronized with the diagnostic Knowledge Graph.
            </div>
          )}
        </div>

        {/* Dedicated Print-Only Full-Width Question Items */}
        {evaluations.length > 0 && (
          <div className="hidden print:block space-y-2.5 mt-2">
            {evaluations.map((eq) => (
              <div key={eq.questionId} className="p-2.5 rounded-lg border border-stone-300 bg-white space-y-1 text-xs break-inside-avoid">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-stone-900">
                    <span>Q{eq.questionNumber}. </span>
                    <span>{eq.questionText}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold shrink-0 ml-2 ${eq.marksAwarded >= ((eq as any).questionMarks || 1)
                    ? 'bg-emerald-100 text-emerald-800'
                    : eq.marksAwarded > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                    }`}>
                    {eq.marksAwarded >= ((eq as any).questionMarks || 1)
                      ? `✓ Correct (+${eq.marksAwarded})`
                      : eq.marksAwarded > 0
                        ? `⚡ Partial (+${eq.marksAwarded}/${(eq as any).questionMarks || 1})`
                        : `✗ Incorrect (0/${(eq as any).questionMarks || 1})`}
                  </span>
                </div>

                {eq.options && eq.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 text-[11px] my-1">
                    {eq.options.map((opt, idx) => {
                      const optStr = (opt || '').trim();
                      const optLetter = optStr.charAt(0).toUpperCase();
                      const cleanOptText = optStr.replace(/^(?:option\s+)?\(?[A-Da-d]\)?[\).\:\-]?\s*/i, '').trim();
                      const optBody = cleanOptText.toLowerCase();
                      const cleanCorrect = (eq.correctAnswer || '').trim().toLowerCase();
                      const cleanStudent = (eq.studentAnswer || '').trim().toLowerCase();

                      const isCorrectOpt = Boolean(
                        eq.correctAnswer && (
                          eq.correctAnswer.toUpperCase() === optLetter ||
                          eq.correctAnswer.toUpperCase() === String.fromCharCode(65 + idx) ||
                          optStr.toUpperCase().startsWith(eq.correctAnswer.toUpperCase()) ||
                          (optBody && optBody === cleanCorrect) ||
                          (cleanCorrect.length > 3 && optBody.includes(cleanCorrect)) ||
                          (cleanCorrect.length > 3 && cleanCorrect.includes(optBody))
                        )
                      );
                      const isStudentOpt = Boolean(
                        eq.studentAnswer && (
                          eq.studentAnswer.toUpperCase() === optLetter ||
                          eq.studentAnswer.toUpperCase() === String.fromCharCode(65 + idx) ||
                          optStr.toUpperCase().startsWith(eq.studentAnswer.toUpperCase()) ||
                          (optBody && optBody === cleanStudent) ||
                          optStr.toLowerCase() === cleanStudent
                        )
                      );
                      return (
                        <div key={idx} className={`px-2 py-0.5 rounded border ${isCorrectOpt
                          ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900'
                          : isStudentOpt
                            ? 'border-rose-400 bg-rose-50 text-rose-900'
                            : 'border-stone-200 text-stone-600'
                          }`}>
                          <span className="font-bold mr-1">{String.fromCharCode(65 + idx)}.</span>
                          {cleanOptText || opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                  <div>
                    <span>Candidate Answer: </span>
                    <strong className={eq.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {eq.studentAnswer || '(None)'}
                    </strong>
                    <span className="mx-2">•</span>
                    <span>Verified Answer: </span>
                    <strong className="text-emerald-900 font-bold">{eq.correctAnswer}</strong>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">{eq.topic}</span>
                </div>

                {eq.explanation && (
                  <p className="text-[10.5px] text-stone-700 bg-stone-50 p-1.5 rounded border border-stone-200 leading-snug">
                    <strong className="text-stone-800">Explanation: </strong>{eq.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curated Study Resources Hub */}
      {analysis.curatedStudyLinks && analysis.curatedStudyLinks.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-yellow-600" />
            <h3 className="text-base font-bold text-stone-900">Curated Reference Links & Chapter Grasp Enhancers</h3>
          </div>
          <p className="text-xs text-stone-500 mb-6">
            Official syllabus chapters, interactive simulations, and board exemplars recommended by our AI-RAG engine for {submission.studentName}.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.curatedStudyLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-yellow-50/40 hover:border-yellow-300 transition-all block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-wider">{link.source}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-yellow-600" />
                </div>
                <div className="font-semibold text-sm text-stone-900 group-hover:text-yellow-900 mb-1">{link.title}</div>
                <p className="text-xs text-stone-600 leading-snug">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
