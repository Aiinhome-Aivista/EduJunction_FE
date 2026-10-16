import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';
import { BOARD_CLASSES_MAP, CLASS_SUBJECTS_MAP } from '../../types';

interface SubmissionItem {
  submissionId: string;
  studentName: string;
  studentEmail: string;
  studentUsername?: string;
  classGrade: string;
  targetBoard: string;
  examId: string;
  examTitle: string;
  subject: string;
  board: string;
  difficulty: string;
  marksObtained: number;
  totalMarks: number;
  accuracyPercentage: number;
  timeTakenSeconds: number;
  timeTakenFormatted: string;
  submittedAt: string | null;
  submittedAtFormatted: string | null;
}

interface QuestionDetail {
  questionNumber: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  explanation: string;
  feedback?: string;
  timeSpentSeconds?: number;
}

interface DiagnosticSummary {
  overallBand?: string;
  masteryScorePercentage?: number;
  strengths?: string[];
  areasToImprove?: string[];
}

export const TestSubmissionsAdminManager: React.FC = () => {
  // ── State ─────────────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState<string>('');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal Detail State
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalQuestions, setModalQuestions] = useState<QuestionDetail[]>([]);
  const [modalDiagnostic, setModalDiagnostic] = useState<DiagnosticSummary | null>(null);

  // ── Dynamic Curriculum Tree State (Directly from Database) ───────────
  const [curriculumTree, setCurriculumTree] = useState<any[]>([]);

  useEffect(() => {
    ApiServices.getCurriculumTree()
      .then((res: any) => {
        const treeData = res?.data || res || [];
        if (Array.isArray(treeData)) {
          setCurriculumTree(treeData);
        }
      })
      .catch((err) => {
        console.error('Failed to load dynamic curriculum tree:', err);
      });
  }, []);

  // 1. Dynamic Boards from Database
  const dynamicBoards = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      const bSet = new Set<string>();
      curriculumTree.forEach((b: any) => {
        const name = (b.board_name || b.name || '').trim();
        if (name) bSet.add(name);
      });
      if (bSet.size > 0) return Array.from(bSet);
    }
    return Object.keys(BOARD_CLASSES_MAP);
  }, [curriculumTree]);

  // 2. Dynamic Classes (cascaded by selected board)
  const dynamicClasses = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      if (boardFilter && boardFilter !== 'ALL') {
        const boardObj = curriculumTree.find(
          (b: any) => (b.board_name || b.name || '').toLowerCase().trim() === boardFilter.toLowerCase().trim()
        );
        if (boardObj?.classes?.length > 0) {
          return boardObj.classes.map((c: any) => (c.class_name || c.name || '').trim()).filter(Boolean);
        }
      } else {
        const cSet = new Set<string>();
        curriculumTree.forEach((b: any) => {
          (b.classes || []).forEach((c: any) => {
            const name = (c.class_name || c.name || '').trim();
            if (name) cSet.add(name);
          });
        });
        if (cSet.size > 0) return Array.from(cSet);
      }
    }
    return boardFilter !== 'ALL' && BOARD_CLASSES_MAP[boardFilter]
      ? BOARD_CLASSES_MAP[boardFilter]
      : Array.from(new Set(Object.values(BOARD_CLASSES_MAP).flat()));
  }, [curriculumTree, boardFilter]);

  // 3. Dynamic Subjects (cascaded by selected board and class)
  const dynamicSubjects = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      let filteredBoards = curriculumTree;
      if (boardFilter && boardFilter !== 'ALL') {
        filteredBoards = curriculumTree.filter(
          (b: any) => (b.board_name || b.name || '').toLowerCase().trim() === boardFilter.toLowerCase().trim()
        );
      }

      const sSet = new Set<string>();
      filteredBoards.forEach((b: any) => {
        let classes = b.classes || [];
        if (gradeFilter && gradeFilter !== 'ALL') {
          classes = classes.filter(
            (c: any) => (c.class_name || c.name || '').toLowerCase().trim() === gradeFilter.toLowerCase().trim()
          );
        }
        classes.forEach((c: any) => {
          (c.subjects || []).forEach((s: any) => {
            const sName = (s.subject_name || s.name || '').trim();
            if (sName) sSet.add(sName);
          });
        });
      });

      if (sSet.size > 0) return Array.from(sSet);
    }

    return gradeFilter !== 'ALL' && CLASS_SUBJECTS_MAP[gradeFilter]
      ? CLASS_SUBJECTS_MAP[gradeFilter]
      : Array.from(new Set(Object.values(CLASS_SUBJECTS_MAP).flat()));
  }, [curriculumTree, boardFilter, gradeFilter]);

  // ── Fetch Submissions ─────────────────────────────────────────────────
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit,
      };
      if (search.trim()) params.search = search.trim();
      if (boardFilter !== 'ALL') params.board = boardFilter;
      if (gradeFilter !== 'ALL') params.classGrade = gradeFilter;
      if (subjectFilter !== 'ALL') params.subject = subjectFilter;

      const res = await ApiServices.listAdminTestSubmissions(params);
      const items = res?.items || res?.data?.items || (Array.isArray(res) ? res : []);
      const total = res?.pagination?.total ?? res?.total ?? res?.data?.pagination?.total ?? res?.data?.total ?? items.length;

      setSubmissions(items);
      setTotalCount(total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load test submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, boardFilter, gradeFilter, subjectFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // ── Open Submission Details Modal ─────────────────────────────────────
  const handleOpenDetails = async (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    setModalLoading(true);
    setModalError(null);
    setModalQuestions([]);
    setModalDiagnostic(null);

    try {
      const res = await ApiServices.getAdminTestSubmissionDetails(sub.submissionId);
      const data = res?.data || res;
      setModalQuestions(data?.questions || []);
      setModalDiagnostic(data?.diagnostic || null);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to load question details.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setModalQuestions([]);
    setModalDiagnostic(null);
    setModalError(null);
  };

  const handleResetFilters = () => {
    setSearch('');
    setBoardFilter('ALL');
    setGradeFilter('ALL');
    setSubjectFilter('ALL');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Top Header & Title ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Test Submissions & Results
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Real-time audit of student test attempts, scores, and evaluation records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-xs disabled:opacity-60"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-600' : 'text-stone-500'}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name, email, or exam title..."
              className={`w-full pl-9 ${search && loading ? 'pr-14' : 'pr-8'} py-2 text-xs bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-stone-800 transition-all placeholder:text-stone-400 font-medium`}
            />
            {loading && (
              <Loader2 className={`w-3.5 h-3.5 text-yellow-600 animate-spin absolute ${search ? 'right-8' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Board Filter */}
          <div>
            <select
              value={boardFilter}
              onChange={(e) => {
                setBoardFilter(e.target.value);
                setGradeFilter('ALL');
                setSubjectFilter('ALL');
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-stone-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Boards</option>
              {dynamicBoards.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setSubjectFilter('ALL');
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-stone-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Classes / Grades</option>
              {dynamicClasses.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-stone-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              {dynamicSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(search || boardFilter !== 'ALL' || gradeFilter !== 'ALL' || subjectFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-yellow-600" />
              <span>Filters applied:</span>
              {search && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-800 rounded-md font-medium border border-yellow-200">Search: "{search}"</span>}
              {boardFilter !== 'ALL' && <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-medium">{boardFilter}</span>}
              {gradeFilter !== 'ALL' && <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-medium">{gradeFilter}</span>}
              {subjectFilter !== 'ALL' && <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-medium">{subjectFilter}</span>}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={fetchSubmissions} className="underline font-semibold hover:text-rose-900">
            Try again
          </button>
        </div>
      )}

      {/* ── Submissions Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Exam / Mock Test</th>
                <th className="py-3 px-4">Submitted At (IST)</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Score & Accuracy</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-24">
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-stone-800">Fetching test submissions...</p>
                        <p className="text-xs text-stone-400">Please wait while records are loaded from database</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-stone-300" />
                      <p className="font-semibold text-stone-700 text-sm">No test submissions found</p>
                      <p className="text-xs text-stone-400 max-w-sm">
                        {search || boardFilter !== 'ALL' || gradeFilter !== 'ALL' || subjectFilter !== 'ALL'
                          ? 'No records match your selected filters. Try clearing some filters.'
                          : 'Students have not taken any exams yet, or no submissions have been recorded in the database.'}
                      </p>
                      {(search || boardFilter !== 'ALL' || gradeFilter !== 'ALL' || subjectFilter !== 'ALL') && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub, index) => {
                  const slNo = (page - 1) * limit + index + 1;
                  const acc = Number(sub.accuracyPercentage || 0);

                  let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  if (acc >= 80) {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (acc >= 50) {
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <tr
                      key={sub.submissionId}
                      className="hover:bg-stone-50/70 transition-colors group"
                    >
                      {/* SL No */}
                      <td className="py-3 px-4 text-center font-semibold text-stone-400">
                        {slNo}
                      </td>

                      {/* Student Info (NO AVATAR) */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 group-hover:text-yellow-700 transition-colors">
                            {sub.studentName}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate max-w-xs font-mono">
                            {sub.studentEmail}
                          </p>
                        </div>
                      </td>

                      {/* Exam Title & Subject / Board / Grade Tags */}
                      <td className="py-3 px-4">
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold text-stone-900 truncate max-w-md">
                            {sub.examTitle}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                              {sub.subject}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-50 text-stone-500 border border-stone-200">
                              {sub.classGrade}
                            </span>
                            {sub.board && sub.board !== '—' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-50 text-stone-500 border border-stone-200">
                                {sub.board}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Submitted Date & Time (IST) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{sub.submittedAtFormatted || '—'}</span>
                        </div>
                      </td>

                      {/* Time Spent */}
                      <td className="py-3 px-4 whitespace-nowrap text-stone-600 font-medium">
                        {sub.timeTakenFormatted || '—'}
                      </td>

                      {/* Score & Accuracy Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 text-xs">
                            {sub.marksObtained} / {sub.totalMarks}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                            {acc.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200/80 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-yellow-600" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-xs bg-white border border-stone-200 rounded-lg text-stone-700 font-medium focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing {submissions.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
              {Math.min(page * limit, totalCount)} of {totalCount} submissions
            </span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-stone-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detailed Answer Sheet Modal ───────────────────────────────── */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-stone-200 bg-gradient-to-r from-yellow-50/50 via-white to-orange-50/30 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-200">
                    {selectedSubmission.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                    {selectedSubmission.classGrade}
                  </span>
                  {selectedSubmission.board && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                      {selectedSubmission.board}
                    </span>
                  )}
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-500 font-medium">
                    {selectedSubmission.submittedAtFormatted}
                  </span>
                </div>
                <h3 className="text-lg font-black text-stone-900 mt-1 truncate">
                  {selectedSubmission.examTitle}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-medium">
                  Student: <strong className="text-stone-900">{selectedSubmission.studentName}</strong> ({selectedSubmission.studentEmail})
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-stone-400 font-medium">Final Score</p>
                  <p className="text-base font-black text-stone-900">
                    {selectedSubmission.marksObtained} / {selectedSubmission.totalMarks}{' '}
                    <span className="text-xs font-bold text-yellow-600">
                      ({Number(selectedSubmission.accuracyPercentage || 0).toFixed(1)}%)
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {modalLoading ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800">Loading student answer sheet...</p>
                    <p className="text-xs text-stone-400">Please wait while questions and evaluated responses are loaded</p>
                  </div>
                </div>
              ) : modalError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
                  <p className="font-bold">Error loading details</p>
                  <p className="mt-1">{modalError}</p>
                </div>
              ) : (
                <>
                  {/* Performance Overview Banner */}
                  {modalDiagnostic && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 via-amber-50/50 to-orange-50 border border-yellow-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-700" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-yellow-900">
                          Performance Overview: {modalDiagnostic.overallBand || 'Assessment Complete'}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        {modalDiagnostic.strengths && modalDiagnostic.strengths.length > 0 && (
                          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                            <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-stone-600 text-[11px]">
                              {modalDiagnostic.strengths.map((str, idx) => (
                                <li key={idx}>{str}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {modalDiagnostic.areasToImprove && modalDiagnostic.areasToImprove.length > 0 && (
                          <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                            <p className="font-bold text-amber-800 mb-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Areas to Improve
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-stone-600 text-[11px]">
                              {modalDiagnostic.areasToImprove.map((area, idx) => (
                                <li key={idx}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Questions & Student Responses ({modalQuestions.length})
                      </h4>
                    </div>

                    {modalQuestions.length === 0 ? (
                      <p className="text-xs text-stone-400 py-6 text-center italic">
                        No individual question evaluation breakdown available for this submission.
                      </p>
                    ) : (
                      modalQuestions.map((q) => {
                        return (
                          <div
                            key={q.questionNumber}
                            className={`p-4 rounded-2xl border transition-all ${
                              q.isCorrect
                                ? 'bg-emerald-50/20 border-emerald-200/60'
                                : 'bg-rose-50/20 border-rose-200/60'
                            }`}
                          >
                            {/* Question Title Bar */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {q.questionNumber}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {q.isCorrect ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3" /> Correct
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" /> Incorrect
                                    </>
                                  )}
                                </span>
                              </div>

                              <span className="text-xs font-bold text-stone-600 shrink-0">
                                {q.marksAwarded} / {q.maxMarks} marks
                              </span>
                            </div>

                            {/* Question Text */}
                            <p className="text-sm font-semibold text-stone-900 mb-3 leading-relaxed">
                              {q.questionText}
                            </p>

                            {/* Multiple Options (if applicable) */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = String(q.studentAnswer).trim().toLowerCase() === String(opt).trim().toLowerCase();
                                  const isAnswer = String(q.correctAnswer).trim().toLowerCase() === String(opt).trim().toLowerCase();

                                  let optClass = 'bg-stone-50 border-stone-200 text-stone-700';
                                  if (isAnswer) {
                                    optClass = 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold';
                                  } else if (isSelected && !q.isCorrect) {
                                    optClass = 'bg-rose-100/70 border-rose-300 text-rose-900 font-medium line-through';
                                  }

                                  return (
                                    <div
                                      key={oIdx}
                                      className={`px-3 py-2 text-xs rounded-xl border flex items-center justify-between ${optClass}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                                      {isSelected && !q.isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 ml-1" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Text Answers & Explanation */}
                            <div className="bg-white/80 rounded-xl p-3 border border-stone-200/60 space-y-2 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-stone-400 font-bold block text-[10px] uppercase">Student Response:</span>
                                  <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {q.studentAnswer || '<No Answer Given>'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 font-bold block text-[10px] uppercase">Correct Answer:</span>
                                  <span className="font-bold text-emerald-800">
                                    {q.correctAnswer}
                                  </span>
                                </div>
                              </div>

                              {q.explanation && (
                                <div className="pt-2 border-t border-stone-100">
                                  <span className="text-stone-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3" /> Explanation / Solution:
                                  </span>
                                  <p className="text-stone-700 text-xs mt-0.5 leading-relaxed">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}

                              {q.feedback && (
                                <div className="pt-2 border-t border-stone-100">
                                  <span className="text-stone-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                                    <Award className="w-3 h-3 text-yellow-600" /> Evaluation Feedback:
                                  </span>
                                  <p className="text-stone-700 text-xs mt-0.5 leading-relaxed italic">
                                    {q.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
              >
                Close Answer Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
