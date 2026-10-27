import React, { useState } from 'react';
import { ExamSubmission, ParentAccount } from '../types';
import { FileText, Calendar, Filter, ChevronRight, ChevronLeft, CheckCircle2, Clock, BookOpen, AlertTriangle } from 'lucide-react';

interface ReportsPageProps {
  examHistory: ExamSubmission[];
  parentAccount: ParentAccount;
  onViewSubmissionReport: (submission: ExamSubmission) => void;
  isStudent?: boolean;
}

const PAGE_SIZE = 5;

export const ReportsPage: React.FC<ReportsPageProps> = ({
  examHistory,
  parentAccount,
  onViewSubmissionReport,
  isStudent = false
}) => {
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const subjects = Array.from(new Set(examHistory.map(e => e.subject).filter(Boolean)));

  const filteredHistory = examHistory.filter(exam => {
    if (!isStudent && selectedChildFilter !== 'all') {
      const matchId = String(exam.studentId) === String(selectedChildFilter);
      const childObj = parentAccount.children.find(c => String(c.id) === String(selectedChildFilter));
      const matchName = childObj && exam.studentName && childObj.name.toLowerCase() === exam.studentName.toLowerCase();
      if (!matchId && !matchName) return false;
    }
    if (selectedSubjectFilter !== 'all') {
      if ((exam.subject || '').toLowerCase() !== selectedSubjectFilter.toLowerCase()) return false;
    }
    return true;
  });

  const totalItems = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  return (
    <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6 pb-20 fade-in">
      {/* ══════════════════════════════════════════════════════════════════════════════
          MOBILE VIEW (Native Mobile Card Feed - Unified with Home Design)
          ══════════════════════════════════════════════════════════════════════════════ */}
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
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
              {totalItems} Tests
            </span>
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

      {/* ══════════════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (100% UNCHANGED Original Table Layout)
          ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="hidden sm:block space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Exam Reports</h1>
            <p className="text-xs sm:text-sm font-medium text-stone-500 mt-1">
              {isStudent
                ? 'Review your historical diagnostic performance and detailed question solutions.'
                : 'Review historical diagnostic performance across your family.'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-500 mr-2">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          
          {/* Child Selector (Parent persona only) */}
          {!isStudent && parentAccount.children.length > 0 && (
            <select 
              value={selectedChildFilter}
              onChange={(e) => {
                setSelectedChildFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 transition-all cursor-pointer"
            >
              <option value="all">All Children</option>
              {parentAccount.children.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          )}

          <select 
            value={selectedSubjectFilter}
            onChange={(e) => {
              setSelectedSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 transition-all cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Reports List Table */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                  {!isStudent && <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Child</th>}
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Subject & Topic</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedHistory.length > 0 ? paginatedHistory.map((exam) => {
                  const child = parentAccount.children.find(c => String(c.id) === String(exam.studentId) || (exam.studentName && c.name?.toLowerCase() === exam.studentName.toLowerCase()));
                  const scorePercentage = (exam.marksObtained / exam.totalMarks) * 100;
                  const displayTopic = (exam as any).topic || exam.evaluations?.[0]?.topic || exam.examTitle || 'Diagnostic Assessment';
                  
                  return (
                    <tr key={exam.id} className="hover:bg-stone-50 transition-colors group cursor-pointer" onClick={() => onViewSubmissionReport(exam)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          <div>
                            <span className="block text-sm font-bold text-stone-900">
                              {new Date(exam.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="block text-xs text-stone-500 mt-0.5">
                              {new Date(exam.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>
                      {!isStudent && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-sm border border-stone-200">
                              {!child?.avatar || child.avatar === '?' ? '👦' : child.avatar}
                            </div>
                            <span className="text-sm font-bold text-stone-900">{child?.name || exam.studentName || 'Student'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="block text-sm font-bold text-stone-900">{exam.subject}</span>
                            <span className="block text-xs text-stone-500 truncate max-w-[200px] mt-0.5" title={displayTopic}>{displayTopic}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-2 bg-stone-100 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${scorePercentage >= 80 ? 'bg-emerald-500' : scorePercentage >= 60 ? 'bg-yellow-400' : 'bg-rose-500'}`}
                              style={{ width: `${scorePercentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-stone-900">{exam.marksObtained}/{exam.totalMarks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scorePercentage >= 80 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Excellent
                          </span>
                        ) : scorePercentage >= 60 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                            <Clock className="w-3.5 h-3.5" /> Steady
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Needs Work
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-xs font-bold text-yellow-600 bg-white border border-yellow-200 px-3 py-1.5 rounded-lg group-hover:bg-yellow-50 transition-colors inline-flex items-center gap-1 cursor-pointer">
                          View Report <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={isStudent ? 5 : 6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-stone-300 mb-4" />
                        <p className="text-sm font-bold text-stone-700">No reports found</p>
                        <p className="text-xs text-stone-500 mt-1">Adjust filters or complete an exam to see results.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination Footer */}
          {totalItems > 0 && (
            <div className="px-6 py-4 bg-stone-50/70 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-stone-600">
              <div>
                Showing <span className="font-bold text-stone-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-stone-900">{endIndex}</span> of <span className="font-bold text-stone-900">{totalItems}</span> {totalItems === 1 ? 'report' : 'reports'}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs font-bold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[32px] h-8 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                          isActive
                            ? 'bg-yellow-400 text-stone-950 shadow-xs border border-yellow-500/30'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 shadow-2xs'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs font-bold"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
