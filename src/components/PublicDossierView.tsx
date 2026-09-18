import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Printer,
  Calendar,
  User,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface PublicDossierViewProps {
  shareToken: string;
  onExit: () => void;
}

export const PublicDossierView: React.FC<PublicDossierViewProps> = ({ shareToken, onExit }) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDossier = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await ApiServices.getPublicDossier(shareToken);
        if (isMounted) {
          setData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'This academic dossier link is invalid, expired, or unavailable.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDossier();
    return () => {
      isMounted = false;
    };
  }, [shareToken]);

  // Automated Print / PDF generation trigger
  useEffect(() => {
    if (!isLoading && data && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('print') === 'true' || params.get('autoPrint') === 'true') {
        const timer = setTimeout(() => {
          window.print();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs text-center max-w-sm w-full space-y-4">
          <Loader2 className="w-10 h-10 text-yellow-600 animate-spin mx-auto" />
          <h3 className="font-bold text-sm text-stone-800">Verifying Encrypted Dossier...</h3>
          <p className="text-xs text-stone-400">Loading student diagnostic analytics from verified Knowledge Graph</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-base text-stone-900">Dossier Link Expired or Invalid</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            {error || 'The requested student academic dossier could not be found or has expired past its 30-day security window.'}
          </p>
          <button
            onClick={onExit}
            className="mt-2 px-4 py-2 bg-yellow-400 text-stone-900 font-bold text-xs rounded-xl shadow-xs hover:bg-yellow-700 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to EduJunction Home</span>
          </button>
        </div>
      </div>
    );
  }

  const { dossier, student, parent, recentSubmissions, topicMastery } = data;
  const masteryEntries = Object.entries(topicMastery || {});

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-16">
      {/* Top Fixed Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-white font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-stone-900">EduJunction</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300">
                Official Academic Dossier
              </span>
            </div>
            <p className="text-[10px] text-stone-400">Verified Educator & Tutor Performance Snapshot</p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Token & Verification Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-yellow-50/70 border border-yellow-300 rounded-xl text-xs text-yellow-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yellow-600 shrink-0" />
            <span>
              Encrypted Share Token: <strong className="font-mono">{dossier.shareToken}</strong> • Status: <span className="uppercase font-bold text-yellow-700">{dossier.status}</span>
            </span>
          </div>
          <div className="text-[11px] text-yellow-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Expires: {new Date(dossier.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Candidate Profile Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-3xl shadow-xs shrink-0">
                {student.avatar || '🧑‍🎓'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900">{student.name}</h1>
                <p className="text-xs text-stone-500 mt-0.5">{student.schoolName || 'School Student'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-300">
                    {student.classGrade}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                    {student.targetBoard}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:w-60">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Avg. Accuracy</span>
                <span className="text-lg font-black text-yellow-600">{Math.round(Number(student.averageScore || 0))}%</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Tests Completed</span>
                <span className="text-lg font-black text-stone-800">{student.totalExamsTaken}</span>
              </div>
            </div>
          </div>

          {/* Parent Notes & Context */}
          {dossier.notes && (
            <div className="mt-5 p-4 bg-yellow-50/60 rounded-xl border border-yellow-200 space-y-1">
              <span className="text-[11px] font-bold text-yellow-900 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                Message from Parent ({parent.name}):
              </span>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "{dossier.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Topic Mastery Section */}
        {masteryEntries.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-yellow-600" />
              <span>Diagnostic Topic & Concept Mastery</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {masteryEntries.map(([topic, score]) => {
                const numScore = Number(score);
                const isStrong = numScore >= 70;
                const isMedium = numScore >= 50 && numScore < 70;
                return (
                  <div key={topic} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-800 truncate max-w-[200px]">{topic}</span>
                      <span className={`font-black ${isStrong ? 'text-yellow-600' : isMedium ? 'text-amber-600' : 'text-rose-600'}`}>
                        {numScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isStrong ? 'bg-yellow-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diagnostic Exam Submissions */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-600" />
                <span>Recent Diagnostic Sprint Exams ({recentSubmissions.length})</span>
              </h2>
              <p className="text-xs text-stone-400">Step-scored 10-mark diagnostic exam breakdown</p>
            </div>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              No diagnostic tests recorded yet in this dossier snapshot.
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub: any) => {
                const isExpanded = expandedSubmissionId === sub.id;
                const scoreColor = sub.marksObtained >= 8
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                  : sub.marksObtained >= 5
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={sub.id}
                    className="border border-stone-200 rounded-xl overflow-hidden transition-all bg-white hover:border-stone-300"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70 select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${scoreColor}`}>
                          {sub.marksObtained}/10
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs text-stone-900 truncate">{sub.examTitle}</h3>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {sub.timeTakenSeconds ? `${Math.round(sub.timeTakenSeconds / 60)} mins` : 'Completed'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {sub.evaluations?.length || 0} Questions
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Step-by-Step Questions */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/50 space-y-3">
                        <h4 className="font-bold text-xs text-stone-700 uppercase tracking-wider">
                          Question-by-Question Evaluation:
                        </h4>

                        <div className="space-y-2.5">
                          {(sub.evaluations || []).map((ev: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border text-xs bg-white space-y-2 ${ev.isCorrect ? 'border-yellow-200' : 'border-rose-100'
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {ev.isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-yellow-600 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  )}
                                  <span className="font-bold text-stone-900">
                                    Q{ev.questionNumber || idx + 1}: {ev.questionText}
                                  </span>
                                </div>
                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${ev.isCorrect ? 'bg-yellow-50 text-yellow-700' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                  {ev.marksAwarded}/1 Mark
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                                  <span className="text-stone-400 block">Student Answer:</span>
                                  <strong className={ev.isCorrect ? 'text-yellow-700' : 'text-rose-700'}>
                                    {ev.studentAnswer || '(No response)'}
                                  </strong>
                                </div>
                                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                                  <span className="text-stone-400 block">Correct Answer:</span>
                                  <strong className="text-yellow-700">{ev.correctAnswer}</strong>
                                </div>
                              </div>

                              {ev.explanation && (
                                <p className="text-[11px] text-stone-600 bg-stone-50/80 p-2 rounded-lg border border-stone-100 leading-relaxed">
                                  <strong>Explanation:</strong> {ev.explanation}
                                </p>
                              )}

                              {ev.misconceptionIdentified && (
                                <div className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 inline-block">
                                  ⚠️ Misconception Detected: {ev.misconceptionIdentified}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-stone-400 pt-4 space-y-1">
          <p>This academic dossier is cryptographically verified and bound by EduJunction data governance policies.</p>
          <p className="text-[10px]">© 2026 EduJunction • Precision Diagnostic Grading & Curriculum Alignment</p>
        </div>
      </main>
    </div>
  );
};
