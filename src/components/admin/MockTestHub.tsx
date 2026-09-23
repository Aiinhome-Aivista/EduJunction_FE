import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Users,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  RefreshCw,
  PlusCircle,
  Sliders,
  Check,
  X,
  FileText,
  Settings,
  Flame,
  Search,
  Filter,
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';

interface Blueprint {
  id: number;
  tierName: string;
  classGrade: string;
  totalQuestions: number;
  mcqCount: number;
  saqCount: number;
  marksPerMcq: number;
  marksPerSaq: number;
  totalMarks: number;
  durationMinutes: number;
  description: string;
  isActive: boolean;
}

interface MockTest {
  id: string;
  title: string;
  board: string;
  classGrade: string;
  subject: string;
  chapterName?: string;
  topicName?: string;
  academicYear: string;
  sessionType: string;
  totalQuestions: number;
  mcqCount: number;
  saqCount: number;
  totalMarks: number;
  durationMinutes: number;
  isAutoAssign: boolean;
  assignedCount: number;
  status: string;
  questions?: any[];
  questionsCount?: number;
  createdAt: string;
}

const DEFAULT_BOARDS = ['CBSE', 'ICSE', 'WBBSE', 'NCERT', 'ISC', 'Cambridge'];
const DEFAULT_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
const DEFAULT_SUBJECTS = [
  'Mathematics', 'Science', 'Life Science', 'Physical Science',
  'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'
];

export const MockTestHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'published' | 'blueprints'>('generator');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Curriculum Data
  const [curriculumTree, setCurriculumTree] = useState<any[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);

  // Generator Form State
  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [chapterMode, setChapterMode] = useState<'all' | 'specific'>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<number | undefined>(undefined);
  const [selectedChapterName, setSelectedChapterName] = useState<string>('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [sessionType, setSessionType] = useState<'CURRENT' | 'UPCOMING'>('CURRENT');
  const [difficulty, setDifficulty] = useState('medium');
  const [customTitle, setCustomTitle] = useState('');
  const [isAutoAssign, setIsAutoAssign] = useState(true);
  const [assignToExisting, setAssignToExisting] = useState(false);

  // Filter state for published list
  const [filterBoard, setFilterBoard] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Question preview modal
  const [previewTest, setPreviewTest] = useState<MockTest | null>(null);

  // Blueprint edit modal
  const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null);
  const [bpFormData, setBpFormData] = useState<any>({});

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [treeRes, bpRes, testsRes] = await Promise.all([
        ApiServices.getCurriculumTree().catch(() => []),
        ApiServices.getMockTestBlueprints().catch(() => ({ data: { blueprints: [] } })),
        ApiServices.getAdminMockTests().catch(() => ({ data: { mockTests: [] } })),
      ]);

      const treeList = Array.isArray(treeRes) ? treeRes : treeRes?.data || [];
      setCurriculumTree(treeList);

      const bpList = bpRes?.data?.blueprints || bpRes?.blueprints || [];
      setBlueprints(bpList);

      const tList = testsRes?.data?.mockTests || testsRes?.mockTests || [];
      setMockTests(tList);
    } catch (err: any) {
      console.error('Failed to load mock test hub data:', err);
      showNotify('error', 'Failed to load curriculum & mock tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamic Boards, Classes, and Subjects derived directly from Database curriculum tree
  const dynamicBoards = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      return curriculumTree.map((b: any) => b.board_name);
    }
    return DEFAULT_BOARDS;
  }, [curriculumTree]);

  const dynamicClasses = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      const boardObj = curriculumTree.find(
        (b: any) => b.board_name?.toLowerCase().trim() === selectedBoard.toLowerCase().trim()
      );
      if (boardObj?.classes?.length > 0) {
        return boardObj.classes.map((c: any) => c.class_name);
      }
    }
    return DEFAULT_CLASSES;
  }, [curriculumTree, selectedBoard]);

  const dynamicSubjects = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      const boardObj = curriculumTree.find(
        (b: any) => b.board_name?.toLowerCase().trim() === selectedBoard.toLowerCase().trim()
      );
      const classObj = boardObj?.classes?.find(
        (c: any) => c.class_name?.toLowerCase().trim() === selectedClass.toLowerCase().trim()
      );
      if (classObj?.subjects?.length > 0) {
        return classObj.subjects.map((s: any) => s.subject_name);
      }
    }
    return DEFAULT_SUBJECTS;
  }, [curriculumTree, selectedBoard, selectedClass]);

  const allUniqueClasses = React.useMemo(() => {
    if (curriculumTree.length > 0) {
      const set = new Set<string>();
      curriculumTree.forEach((b: any) => {
        (b.classes || []).forEach((c: any) => {
          if (c.class_name) set.add(c.class_name);
        });
      });
      if (set.size > 0) return Array.from(set);
    }
    return DEFAULT_CLASSES;
  }, [curriculumTree]);

  const handleBoardChange = (newBoard: string) => {
    setSelectedBoard(newBoard);
    const boardObj = curriculumTree.find(
      (b: any) => b.board_name?.toLowerCase().trim() === newBoard.toLowerCase().trim()
    );
    const classes = boardObj?.classes || [];
    const validClass = classes.some((c: any) => c.class_name === selectedClass)
      ? selectedClass
      : (classes[0]?.class_name || 'Class 10');
    setSelectedClass(validClass);

    const classObj = classes.find((c: any) => c.class_name === validClass);
    const subjects = classObj?.subjects || [];
    const validSub = subjects.some((s: any) => s.subject_name === selectedSubject)
      ? selectedSubject
      : (subjects[0]?.subject_name || 'Mathematics');
    setSelectedSubject(validSub);
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    const boardObj = curriculumTree.find(
      (b: any) => b.board_name?.toLowerCase().trim() === selectedBoard.toLowerCase().trim()
    );
    const classObj = boardObj?.classes?.find((c: any) => c.class_name === newClass);
    const subjects = classObj?.subjects || [];
    const validSub = subjects.some((s: any) => s.subject_name === selectedSubject)
      ? selectedSubject
      : (subjects[0]?.subject_name || 'Mathematics');
    setSelectedSubject(validSub);
  };

  // Compute Available Chapters for Selected Board, Class & Subject
  const availableChapters = React.useMemo(() => {
    if (!curriculumTree.length) return [];
    const boardObj = curriculumTree.find(
      (b: any) => b.board_name?.toLowerCase().trim() === selectedBoard.toLowerCase().trim()
    );
    if (!boardObj) return [];
    const classObj = boardObj.classes?.find(
      (c: any) => c.class_name?.toLowerCase().trim() === selectedClass.toLowerCase().trim()
    );
    if (!classObj) return [];
    const subjObj = classObj.subjects?.find(
      (s: any) => s.subject_name?.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
    );
    return subjObj?.chapters || [];
  }, [curriculumTree, selectedBoard, selectedClass, selectedSubject]);

  // Compute Active Blueprint for Selected Class
  const activeBlueprint = React.useMemo(() => {
    const cg = selectedClass.toLowerCase();
    const match = cg.match(/\d+/);
    const cnum = match ? parseInt(match[0], 10) : 5;

    if (cnum <= 4) {
      return blueprints.find((b) => b.tierName.toLowerCase().includes('kid')) || blueprints[0];
    } else if (cnum <= 10) {
      return blueprints.find((b) => b.tierName.toLowerCase().includes('secondary')) || blueprints[1];
    } else {
      return blueprints.find((b) => b.tierName.toLowerCase().includes('senior')) || blueprints[2];
    }
  }, [selectedClass, blueprints]);

  // Handle Generate Mock Test
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        board: selectedBoard,
        classGrade: selectedClass,
        subject: selectedSubject,
        academicYear,
        sessionType,
        difficulty,
        isAutoAssign,
        assignToExistingStudents: assignToExisting,
      };

      if (chapterMode === 'specific' && selectedChapterName) {
        payload.chapterId = selectedChapterId;
        payload.chapterName = selectedChapterName;
      }

      if (customTitle.trim()) {
        payload.title = customTitle.trim();
      }

      const res = await ApiServices.generateAdminMockTest(payload);
      showNotify('success', res.message || 'Mock Test generated and published successfully!');
      
      // Reset & reload
      setCustomTitle('');
      setAssignToExisting(false);
      loadData();
      setActiveTab('published');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to generate mock test';
      showNotify('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Auto Assign
  const handleToggleAutoAssign = async (id: string) => {
    try {
      const res = await ApiServices.toggleMockTestAutoAssign(id);
      showNotify('success', res.data?.message || 'Auto-assign updated');
      setMockTests((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isAutoAssign: res.data?.isAutoAssign ?? !t.isAutoAssign } : t))
      );
    } catch (err: any) {
      showNotify('error', 'Failed to toggle auto-assign');
    }
  };

  // Bulk Assign
  const handleBulkAssign = async (test: MockTest) => {
    if (!window.confirm(`Assign "${test.title}" to all existing students of ${test.board} ${test.classGrade}?`)) {
      return;
    }
    try {
      const res = await ApiServices.bulkAssignMockTest(test.id);
      showNotify('success', res.data?.message || 'Assigned to existing students');
      loadData();
    } catch (err: any) {
      showNotify('error', 'Failed to bulk assign');
    }
  };

  // Delete Mock Test
  const handleDeleteMockTest = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await ApiServices.deleteAdminMockTest(id);
      showNotify('success', 'Mock Test deleted successfully');
      setMockTests((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      showNotify('error', 'Failed to delete mock test');
    }
  };

  // Blueprint update
  const handleUpdateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlueprint) return;
    try {
      await ApiServices.updateMockTestBlueprint(editingBlueprint.id, bpFormData);
      showNotify('success', 'Blueprint updated successfully');
      setEditingBlueprint(null);
      loadData();
    } catch (err: any) {
      showNotify('error', 'Failed to update blueprint');
    }
  };

  // Filtered published mock tests
  const filteredMockTests = mockTests.filter((t) => {
    if (filterBoard && t.board !== filterBoard) return false;
    if (filterClass && t.classGrade !== filterClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.chapterName && t.chapterName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-stone-900 shadow-xl shadow-yellow-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 backdrop-blur-md text-xs font-black tracking-wide uppercase text-stone-950 mb-3">
              <Sparkles size={14} className="text-yellow-900" />
              Academic Assessment Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950">
              Mock Test & Auto-Assign Hub 🎯
            </h1>
            <p className="text-sm font-semibold text-stone-900/90 mt-1 max-w-2xl">
              Create curriculum-aligned diagnostic mock tests from question bank and auto-assign them to registered students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 shadow-sm text-center">
              <span className="text-2xl font-black text-stone-900">{mockTests.length}</span>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Mock Tests</p>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 shadow-sm text-center">
              <span className="text-2xl font-black text-emerald-600">
                {mockTests.filter((t) => t.isAutoAssign).length}
              </span>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Auto-Assign Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-sm'
              : 'bg-rose-50 text-rose-900 border border-rose-200 shadow-sm'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Zap size={15} className={activeTab === 'generator' ? 'text-amber-500' : ''} />
            Generate Mock Test
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'published'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText size={15} className={activeTab === 'published' ? 'text-amber-500' : ''} />
            Published Tests ({mockTests.length})
          </button>
          <button
            onClick={() => setActiveTab('blueprints')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'blueprints'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders size={15} className={activeTab === 'blueprints' ? 'text-amber-500' : ''} />
            Grade Blueprints
          </button>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: GENERATOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                1
              </div>
              <div>
                <h3 className="font-black text-stone-900 text-lg">Define Target Curriculum</h3>
                <p className="text-xs font-semibold text-stone-500">
                  Select Board, Class, Subject & Year to construct the test.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Row 1: Board & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Board / Curriculum *
                  </label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => handleBoardChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-bold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {dynamicBoards.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Class / Grade *
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-bold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {dynamicClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Subject & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Subject *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-bold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {dynamicSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Academic Year *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="flex-1 h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-bold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all"
                    >
                      <option value="2026-2027">2026-2027 (Current)</option>
                      <option value="2027-2028">2027-2028 (Upcoming)</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSessionType(sessionType === 'CURRENT' ? 'UPCOMING' : 'CURRENT')}
                      className={`px-3 h-12 rounded-2xl font-black text-xs border transition-all ${
                        sessionType === 'CURRENT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {sessionType}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Chapter / Topic Selection */}
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Chapter / Topic Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setChapterMode('all');
                      setSelectedChapterId(undefined);
                      setSelectedChapterName('');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      chapterMode === 'all'
                        ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm text-stone-900">
                      <Sparkles size={16} className="text-amber-500" />
                      Comprehensive (All Chapters)
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-1">
                      Randomly samples questions across all topics of this subject.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChapterMode('specific')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      chapterMode === 'specific'
                        ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm text-stone-900">
                      <BookOpen size={16} className="text-amber-500" />
                      Specific Chapter
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-1">
                      Picks questions strictly from a chosen chapter or unit.
                    </p>
                  </button>
                </div>

                {chapterMode === 'specific' && (
                  <div className="animate-fade-in">
                    {availableChapters.length > 0 ? (
                      <select
                        value={selectedChapterName}
                        onChange={(e) => {
                          const chap = availableChapters.find((c: any) => c.chapter_name === e.target.value);
                          setSelectedChapterName(e.target.value);
                          setSelectedChapterId(chap?.id);
                        }}
                        className="w-full h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-bold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all"
                      >
                        <option value="">-- Choose Chapter --</option>
                        {availableChapters.map((ch: any) => (
                          <option key={ch.id} value={ch.chapter_name}>
                            {ch.chapter_name} ({ch.topics?.length || 0} Topics)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter Chapter Name (e.g. Light - Reflection & Refraction)"
                        value={selectedChapterName}
                        onChange={(e) => setSelectedChapterName(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-bold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Row 4: Custom Title (Optional) */}
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Custom Exam Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`Default: ${selectedBoard} ${selectedClass} ${selectedSubject} Mock Test (${academicYear})`}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-stone-50 border-2 border-stone-200 font-semibold text-sm text-stone-900 focus:border-amber-400 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Assignment Controls */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-black text-stone-900 text-sm">
                      <Zap size={16} className="text-amber-500" />
                      Auto-Assign Switch (For New Students)
                    </div>
                    <p className="text-xs font-medium text-stone-500 mt-1">
                      When active, newly registered students of {selectedBoard} {selectedClass} will automatically
                      receive this Mock Test in their dashboard.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isAutoAssign}
                      onChange={(e) => setIsAutoAssign(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="border-t border-stone-200 pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="assignExisting"
                      checked={assignToExisting}
                      onChange={(e) => setAssignToExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="assignExisting" className="text-xs font-extrabold text-stone-800 cursor-pointer">
                      Assign immediately to all existing {selectedBoard} {selectedClass} students (Bulk)
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-base shadow-lg shadow-yellow-200/50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating from Question Bank...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    ⚡ Generate & Publish Mock Test
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar: Live Blueprint Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 font-black text-stone-900 text-sm border-b border-stone-100 pb-3">
                <Sliders size={18} className="text-amber-500" />
                Applied Blueprint Rules
              </div>

              {activeBlueprint ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider">
                      {activeBlueprint.tierName}
                    </span>
                    <h4 className="font-extrabold text-stone-900 text-base">{activeBlueprint.classGrade}</h4>
                    <p className="text-xs text-stone-600 mt-1">{activeBlueprint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                      <span className="text-xl font-black text-stone-900">{activeBlueprint.totalQuestions}</span>
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Questions</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                      <span className="text-xl font-black text-amber-600">{activeBlueprint.totalMarks} M</span>
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total Marks</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div className="flex justify-between items-center">
                      <span>MCQs (1 Mark each):</span>
                      <span className="font-black text-stone-900">{activeBlueprint.mcqCount} Qs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SAQs / Short (2 Marks each):</span>
                      <span className="font-black text-stone-900">{activeBlueprint.saqCount} Qs</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-stone-200 pt-2 text-stone-900 font-extrabold">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-stone-400" /> Duration:
                      </span>
                      <span>{activeBlueprint.durationMinutes} Minutes</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-stone-400 text-xs font-semibold">
                  Loading blueprint details...
                </div>
              )}
            </div>

            <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 font-black text-amber-400 text-sm">
                <Users size={16} />
                Auto-Assignment Guarantee
              </div>
              <p className="text-xs text-stone-300 font-normal leading-relaxed">
                Whenever a student registers under <strong>{selectedBoard} {selectedClass}</strong>, they will instantly receive this mock test in their dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: PUBLISHED MOCK TESTS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'published' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search mock tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={filterBoard}
                onChange={(e) => setFilterBoard(e.target.value)}
                className="h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 cursor-pointer"
              >
                <option value="">All Boards</option>
                {dynamicBoards.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 cursor-pointer"
              >
                <option value="">All Classes</option>
                {allUniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-stone-500">
              Showing {filteredMockTests.length} of {mockTests.length} Tests
            </span>
          </div>

          {/* Table */}
          {filteredMockTests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-black uppercase text-stone-400 tracking-wider">
                    <th className="py-3 px-4">Test Title & Subject</th>
                    <th className="py-3 px-4">Board & Class</th>
                    <th className="py-3 px-4">Year & Type</th>
                    <th className="py-3 px-4">Structure</th>
                    <th className="py-3 px-4 text-center">Auto-Assign</th>
                    <th className="py-3 px-4 text-center">Assigned</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs font-semibold text-stone-700">
                  {filteredMockTests.map((t) => (
                    <tr key={t.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-stone-900 text-sm">{t.title}</div>
                        <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                          {t.subject} {t.chapterName ? `• ${t.chapterName}` : '• Comprehensive'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-extrabold text-[11px]">
                          {t.board} • {t.classGrade}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{t.academicYear}</div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.sessionType === 'CURRENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {t.sessionType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-stone-900">
                          {t.totalMarks} Marks <span className="font-normal text-stone-400">•</span> {t.durationMinutes}m
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {t.mcqCount} MCQ + {t.saqCount} SAQ
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleAutoAssign(t.id)}
                          className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                            t.isAutoAssign
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {t.isAutoAssign ? '✅ ON' : '⭕ OFF'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-stone-900">
                        {t.assignedCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Assign to all existing students of this board & class"
                            onClick={() => handleBulkAssign(t)}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                          >
                            <Users size={15} />
                          </button>

                          <button
                            title="Preview Questions"
                            onClick={() => setPreviewTest(t)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            title="Delete"
                            onClick={() => handleDeleteMockTest(t.id, t.title)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-stone-400 space-y-3">
              <FileText size={36} className="mx-auto text-stone-300" />
              <p className="text-sm font-bold text-stone-600">No mock tests found matching criteria</p>
              <button
                onClick={() => setActiveTab('generator')}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 font-black text-xs text-stone-950"
              >
                Create First Mock Test
              </button>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: GRADE BLUEPRINTS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'blueprints' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-black text-stone-900 text-lg">Grade Blueprint Configuration Master</h3>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                Customize question distribution, marks and time limits for different class tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blueprints.map((bp) => (
                <div
                  key={bp.id}
                  className="p-6 rounded-3xl bg-stone-50 border-2 border-stone-200 hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                        {bp.tierName}
                      </span>
                      <span className="text-xs font-black text-stone-500">{bp.classGrade}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-stone-900 text-xl">{bp.totalMarks} Marks</h4>
                      <p className="text-xs text-stone-500 font-medium mt-1">{bp.description}</p>
                    </div>

                    <div className="space-y-2 text-xs font-bold text-stone-700 bg-white p-3.5 rounded-2xl border border-stone-200">
                      <div className="flex justify-between">
                        <span>Total Questions:</span>
                        <span className="text-stone-900">{bp.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MCQs ({bp.marksPerMcq}M each):</span>
                        <span className="text-stone-900">{bp.mcqCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SAQs ({bp.marksPerSaq}M each):</span>
                        <span className="text-stone-900">{bp.saqCount}</span>
                      </div>
                      <div className="flex justify-between border-t border-stone-100 pt-1 text-stone-900">
                        <span>Time Limit:</span>
                        <span>{bp.durationMinutes} Minutes</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingBlueprint(bp);
                      setBpFormData({
                        totalQuestions: bp.totalQuestions,
                        mcqCount: bp.mcqCount,
                        saqCount: bp.saqCount,
                        marksPerMcq: bp.marksPerMcq,
                        marksPerSaq: bp.marksPerSaq,
                        totalMarks: bp.totalMarks,
                        durationMinutes: bp.durationMinutes,
                      });
                    }}
                    className="mt-6 w-full h-10 rounded-xl bg-stone-200 hover:bg-stone-300 font-extrabold text-xs text-stone-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Settings size={14} /> Edit Blueprint
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: PREVIEW QUESTIONS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {previewTest && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 animate-scale-up">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-stone-900 text-lg">{previewTest.title}</h3>
                <p className="text-xs font-semibold text-stone-500 mt-0.5">
                  {previewTest.board} • {previewTest.classGrade} • {previewTest.totalMarks} Marks • {previewTest.durationMinutes} Mins
                </p>
              </div>
              <button
                onClick={() => setPreviewTest(null)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {previewTest.questions && previewTest.questions.length > 0 ? (
                previewTest.questions.map((q: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-extrabold text-stone-800">
                      <span>Question {q.questionNumber || idx + 1} ({q.type?.toUpperCase() || 'MCQ'})</span>
                      <span className="text-amber-600 font-black">{q.marks || 1} Mark</span>
                    </div>
                    <p className="font-bold text-stone-900 text-sm">{q.questionText}</p>

                    {q.options && Array.isArray(q.options) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl border text-[11px] font-semibold ${
                              opt.startsWith(q.correctAnswer) || q.correctAnswer === opt
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-stone-500 font-medium pt-1">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-stone-400 font-semibold">
                  No questions array snapshot stored.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setPreviewTest(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: EDIT BLUEPRINT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {editingBlueprint && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateBlueprint}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-stone-900 text-base">Edit Blueprint: {editingBlueprint.tierName}</h3>
                <p className="text-xs text-stone-500">{editingBlueprint.classGrade}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBlueprint(null)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div>
                <label className="block text-stone-700 mb-1">Total Questions</label>
                <input
                  type="number"
                  value={bpFormData.totalQuestions || 0}
                  onChange={(e) => setBpFormData({ ...bpFormData, totalQuestions: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={bpFormData.durationMinutes || 0}
                  onChange={(e) => setBpFormData({ ...bpFormData, durationMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">MCQs Count</label>
                <input
                  type="number"
                  value={bpFormData.mcqCount || 0}
                  onChange={(e) => setBpFormData({ ...bpFormData, mcqCount: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">SAQs Count</label>
                <input
                  type="number"
                  value={bpFormData.saqCount || 0}
                  onChange={(e) => setBpFormData({ ...bpFormData, saqCount: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Marks per MCQ</label>
                <input
                  type="number"
                  value={bpFormData.marksPerMcq || 0}
                  onChange={(e) => setBpFormData({ ...bpFormData, marksPerMcq: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Marks per SAQ</label>
                <input
                  type="number"
                  value={bpFormData.marksPerSaq || 0}
                  onChange={(e) => setBpFormData({ ...bpFormData, marksPerSaq: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBlueprint(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-xs shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
