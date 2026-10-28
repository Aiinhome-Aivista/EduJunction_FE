import React from 'react';
import { ExamSubmission, ParentAccount } from '../../types';
import { FileText, Calendar, ChevronRight, CheckCircle2, Clock, BookOpen } from 'lucide-react';

interface ReportsMobilePageProps {
  examHistory: ExamSubmission[];
  parentAccount: ParentAccount;
  isStudent: boolean;
  subjects: string[];
  paginatedHistory: ExamSubmission[];
  selectedChildFilter: string;
  selectedSubjectFilter: string;
  setSelectedChildFilter: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSubjectFilter: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  safeCurrentPage: number;
  totalItems: number;
  totalPages: number;
  onViewSubmissionReport: (submission: ExamSubmission) => void;
}

export const ReportsMobilePage: React.FC<ReportsMobilePageProps> = ({
  examHistory, parentAccount, isStudent, subjects, paginatedHistory,
  selectedChildFilter, selectedSubjectFilter, setSelectedChildFilter,
  setSelectedSubjectFilter, setCurrentPage, safeCurrentPage, totalItems,
  totalPages, onViewSubmissionReport,
}) => (
      <div className="block sm:hidden space-y-3">
        {/* Mobile Header & Subject Filter Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xs font-bold text-stone-900 tracking-tight">Exam History & Solutions</h1>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                Detailed diagnostic analysis from your completed practice tests.
              </p>
            </div>
          </div>

          {/* Horizontal Scrollable Filter Pills (1-Tap filter instead of raw select) */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={() => { setSelectedSubjectFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                selectedSubjectFilter === 'all'
                  ? 'bg-amber-400 text-stone-950 shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({examHistory.length})
            </button>
            {subjects.map((sub) => {
              const count = examHistory.filter(e => e.subject === sub).length;
              const isSel = selectedSubjectFilter === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => { setSelectedSubjectFilter(sub); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                    isSel
                      ? 'bg-amber-400 text-stone-950 shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>

          {/* Child Filter Pills for Parent Persona */}
          {!isStudent && parentAccount.children.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">Child:</span>
              <button
                type="button"
                onClick={() => { setSelectedChildFilter('all'); setCurrentPage(1); }}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  selectedChildFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                All
              </button>
              {parentAccount.children.map(child => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => { setSelectedChildFilter(child.id); setCurrentPage(1); }}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    selectedChildFilter === child.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {child.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Native Report Cards List */}
        <div className="space-y-2.5">
          {paginatedHistory.length > 0 ? (
            paginatedHistory.map((exam) => {
              const scorePercentage = Math.round((exam.marksObtained / (exam.totalMarks || 1)) * 100);
              const isHigh = scorePercentage >= 80;
              const isMed = scorePercentage >= 60;
              const displayTopic = (exam as any).topic || exam.evaluations?.[0]?.topic || exam.examTitle || 'Diagnostic Assessment';
              const subjectName = exam.subject || 'Practice Test';

              return (
                <div
                  key={exam.id}
                  onClick={() => onViewSubmissionReport(exam)}
                  className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-stone-900 truncate">
                          {subjectName}
                        </h3>
                        <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                          {displayTopic}
                        </p>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isHigh
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isMed
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isHigh ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        <span>{scorePercentage}% • {exam.marksObtained}/{exam.totalMarks}M</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer with date & view solution link */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px]">
                    <span className="text-stone-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{new Date(exam.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(exam.submittedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </span>

                    <span className="text-amber-800 font-bold flex items-center gap-0.5 group-hover:underline">
                      <span>View Solution</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-800">No reports found</p>
              <p className="text-[10px] text-stone-400">Adjust your filters or take a practice test to see your performance history.</p>
            </div>
          )}
        </div>

        {/* Mobile Compact Pagination */}
        {totalItems > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-xs font-semibold text-stone-600">
            <span className="text-[11px] text-stone-500">
              Page {safeCurrentPage} of {totalPages} ({totalItems} total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 text-[11px] font-bold"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 text-[11px] font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
);
