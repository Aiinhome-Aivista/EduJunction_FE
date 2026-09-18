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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Exam Reports</h1>
          <p className="text-sm font-medium text-stone-500 mt-1">
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

      {/* Reports List */}
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
                            {child?.avatar || '👤'}
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

        {/* Pagination Footer */}
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
  );
};
