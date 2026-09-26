import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  HelpCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  RefreshCw,
  Folder,
  FolderOpen,
  History,
  Database
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';
import { BOARD_CLASSES_MAP } from '../../types';

interface Topic {
  id: number;
  topic_name: string;
  topic_order: number;
  question_count: number;
}

interface Chapter {
  id: number;
  chapter_name: string;
  chapter_number: number;
  topics: Topic[];
}

interface SubjectNode {
  id: number;
  subject_name: string;
  subject_code?: string;
  chapters: Chapter[];
}

interface ClassNode {
  id: number;
  class_name: string;
  subjects: SubjectNode[];
}

interface BoardNode {
  id: number;
  board_name: string;
  classes: ClassNode[];
}

interface QuestionItem {
  id: number;
  question: string;
  options: any;
  correct_answer: string;
  explanation: string;
  marks: number;
  type: string;
  difficulty: string;
  topic_id: number;
  topic_name: string;
  chapter_id: number;
  chapter_name: string;
  subject_id: number;
  subject_name: string;
  board_id: number;
  board_name: string;
  class_id: number;
  class_name: string;
  created_at: string;
}

export const AcademicsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'questions'>('curriculum');
  
  // Curriculum Tree State
  const [tree, setTree] = useState<BoardNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  // Question Bank State
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Modals
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepText, setUploadStepText] = useState('');
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

  // Form Hierarchy State
  const [formBoardId, setFormBoardId] = useState<number | null>(null);
  const [formClassId, setFormClassId] = useState<number | null>(null);
  const [formSubjectId, setFormSubjectId] = useState<number | null>(null);
  const [formChapterId, setFormChapterId] = useState<number | null>(null);
  const [formTopicId, setFormTopicId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    topic_id: '',
    question: '',
    correct_answer: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    explanation: '',
    type: 'MCQ',
    difficulty: 'medium',
    marks: 1
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Curriculum Tree
  const fetchTree = async () => {
    setLoadingTree(true);
    try {
      const data = await ApiServices.getCurriculumTree();
      const list = Array.isArray(data) ? data : data?.data || [];
      setTree(list);
      if (list.length > 0 && !selectedBoardId) {
        setSelectedBoardId(list[0].id);
        if (list[0].classes?.length > 0) {
          setSelectedClassId(list[0].classes[0].id);
          if (list[0].classes[0].subjects?.length > 0) {
            setSelectedSubjectId(list[0].classes[0].subjects[0].id);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load curriculum tree:', err);
      showNotify('error', 'Failed to load curriculum taxonomy tree');
    } finally {
      setLoadingTree(false);
    }
  };

  // Fetch Question Bank
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const filters: any = { page, limit };
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (filterDifficulty) filters.difficulty = filterDifficulty;
      if (filterType) filters.type = filterType;
      if (filterBoard) filters.board_id = filterBoard;
      if (filterClass) filters.class_id = filterClass;
      if (filterSubject) filters.subject_id = filterSubject;

      const data = await ApiServices.listQuestions(filters);
      const items = data?.items || (Array.isArray(data) ? data : []);
      setQuestions(items);
      setTotalQuestions(data?.total || items.length);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      showNotify('error', 'Failed to fetch question bank');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Real-time debounced search & filter
  useEffect(() => {
    if (activeTab !== 'questions') return;
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab, page, limit, filterDifficulty, filterType, filterBoard, filterClass, filterSubject, searchQuery]);

  const toggleChapter = (chId: number) => {
    setExpandedChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  const selectedBoardObj = tree.find(b => String(b.id) === String(filterBoard));
  const filterClassesList = selectedBoardObj
    ? (selectedBoardObj.classes || [])
    : Array.from(new Map(tree.flatMap(b => b.classes || []).map((c: any) => [c.class_name || c.name || c.id, c])).values());

  const selectedClassObj = filterClassesList.find((c: any) => String(c.id) === String(filterClass));
  const filterSubjectsList = selectedClassObj
    ? (selectedClassObj.subjects || [])
    : Array.from(new Map(tree.flatMap(b => (b.classes || []).flatMap((c: any) => c.subjects || [])).map((s: any) => [s.subject_name || s.name || s.id, s])).values());

  const activeBoard = tree.find(b => b.id === selectedBoardId);
  const visibleClasses = activeBoard?.classes || [];
  const activeClass = visibleClasses.find(c => c.id === selectedClassId) || (visibleClasses.length > 0 ? visibleClasses[0] : undefined);
  const activeSubject = activeClass?.subjects.find(s => s.id === selectedSubjectId) || (activeClass?.subjects?.[0] || undefined);

  // Fetch Upload Batch History
  const fetchUploadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await ApiServices.getQuestionUploadHistory(20);
      setUploadHistory(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch upload history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Bulk Upload Handler with Real-time Server Streaming Progress
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadProgress(5);
    setUploadStepText('Connecting to streaming ingestion server...');
    setUploadResult(null);

    try {
      const res = await ApiServices.bulkUploadQuestionsStream(uploadFile, (prog) => {
        if (prog && typeof prog.percent === 'number') {
          setUploadProgress(prog.percent);
          setUploadStepText(prog.step || `Processing question ${prog.current || 0}/${prog.total || 0}...`);
        }
      });

      setUploadProgress(100);
      setUploadStepText(res.message || 'Ingestion completed successfully!');
      setUploadResult(res);
      showNotify('success', res.message || 'Questions uploaded successfully!');
      fetchQuestions();
      fetchTree();
      fetchUploadHistory();
    } catch (err: any) {
      setUploadProgress(0);
      setUploadStepText('');
      console.error('Bulk upload error:', err);
      showNotify('error', err?.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Download Comprehensive CSV Template with 2 examples per question type
  const downloadSampleCsv = () => {
    const csvContent =
      "board,class_grade,subject,chapter,topic,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,type,difficulty,marks\n" +
      // 1. MCQ Examples (2 rows)
      "CBSE,Class 10,Mathematics,Real Numbers,Introduction to Real Numbers,\"What type of number is sqrt(2)?\",A) Rational,B) Irrational,C) Integer,D) Whole,B) Irrational,\"sqrt(2) is an irrational number because it cannot be expressed in p/q form.\",MCQ,simple,1\n" +
      "CBSE,Class 10,Science,Electricity,Ohm's Law,\"Which component is used to regulate current without changing the voltage source?\",A) Rheostat,B) Voltmeter,C) Ammeter,D) Galvanometer,A) Rheostat,\"A rheostat is a variable resistor used to adjust current flow.\",MCQ,medium,1\n" +
      // 2. SAQ Examples (2 rows)
      "CBSE,Class 10,Science,Electricity,Ohm's Law,\"State Ohm's Law and its mathematical formula.\",,,,,\"Current is directly proportional to voltage at constant temperature (V = I * R).\",\"Ohm's Law states that electric current through a conductor between two points is directly proportional to the voltage across the two points.\",SAQ,medium,2\n" +
      "CBSE,Class 10,Science,Chemical Reactions and Equations,Types of Chemical Reactions,\"What is a balanced chemical equation and why should it be balanced?\",,,,,\"An equation with equal number of atoms on both sides to satisfy Law of Conservation of Mass.\",\"Chemical equations must be balanced to satisfy the Law of Conservation of Mass which states that matter cannot be created or destroyed.\",SAQ,medium,2\n" +
      // 3. Objective Examples (2 rows)
      "CBSE,Class 10,Science,Life Processes,Nutrition,\"Name the green pigment in plants essential for photosynthesis.\",,,,,\"Chlorophyll\",\"Chlorophyll absorbs light energy during the photosynthesis process.\",Objective,simple,1\n" +
      "CBSE,Class 10,Science,Acids Bases and Salts,Indicators,\"What is the pH value of pure neutral water at 25 degrees Celsius?\",,,,,\"7\",\"Pure neutral water has an exact pH value of 7.\",Objective,simple,1\n" +
      // 4. Numerical Examples (2 rows)
      "CBSE,Class 10,Mathematics,Triangles,Pythagoras Theorem,\"In a right-angled triangle, perpendicular is 3 cm and base is 4 cm. Calculate the length of the hypotenuse in cm.\",,,,,\"5\",\"Using Pythagoras theorem: Hypotenuse = sqrt(3^2 + 4^2) = sqrt(9 + 16) = 5 cm.\",Numerical,simple,1\n" +
      "CBSE,Class 10,Science,Electricity,Ohm's Law,\"A current of 0.5 A is drawn by a bulb for 10 minutes. Calculate the total electric charge in Coulombs.\",,,,,\"300\",\"Electric charge Q = I * t = 0.5 A * (10 * 60 s) = 300 Coulombs.\",Numerical,medium,2\n" +
      // 5. Long Answer Examples (2 rows)
      "CBSE,Class 10,Science,Life Processes,Respiration,\"Explain the process of double circulation in human beings and its biological significance.\",,,,,\"Blood passes through the heart twice in one complete cycle. It keeps oxygenated and deoxygenated blood separate for high energy supply.\",\"Double circulation consists of systemic and pulmonary circulation, preventing mixing of oxygenated and deoxygenated blood.\",Long Answer,hard,5\n" +
      "CBSE,Class 10,Mathematics,Quadratic Equations,Nature of Roots,\"State the quadratic formula and explain the three conditions of the discriminant for real roots.\",,,,,\"x = (-b +- sqrt(b^2-4ac))/(2a). D > 0 distinct roots, D = 0 equal roots, D < 0 no real roots.\",\"The discriminant D = b^2 - 4ac determines whether roots are real, equal, or complex.\",Long Answer,hard,5\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'question_bank_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cascading Form Hierarchy Selectors
  const formSelectedBoard = tree.find(b => b.id === formBoardId) || tree[0];
  const formAvailableClasses = formSelectedBoard?.classes || [];
  const formSelectedClass = formAvailableClasses.find(c => c.id === formClassId) || formAvailableClasses[0];

  const formAvailableSubjects = formSelectedClass?.subjects || [];
  const formSelectedSubject = formAvailableSubjects.find(s => s.id === formSubjectId) || formAvailableSubjects[0];

  const formAvailableChapters = formSelectedSubject?.chapters || [];
  const formSelectedChapter = formAvailableChapters.find(ch => ch.id === formChapterId) || formAvailableChapters[0];

  const formAvailableTopics = formSelectedChapter?.topics || [];
  const formSelectedTopic = formAvailableTopics.find(t => t.id === formTopicId) || formAvailableTopics[0];

  // Open Add Question Modal with auto-initialized hierarchy
  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    const initialBoard = tree[0];
    const initialClasses = initialBoard?.classes || [];
    const initialClass = initialClasses[0];
    const initialSubject = initialClass?.subjects?.[0];
    const initialChapter = initialSubject?.chapters?.[0];
    const initialTopic = initialChapter?.topics?.[0];

    setFormBoardId(initialBoard?.id || null);
    setFormClassId(initialClass?.id || null);
    setFormSubjectId(initialSubject?.id || null);
    setFormChapterId(initialChapter?.id || null);
    setFormTopicId(initialTopic?.id || null);

    setFormData({
      topic_id: String(initialTopic?.id || 1),
      question: '',
      correct_answer: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      explanation: '',
      type: 'MCQ',
      difficulty: 'medium',
      marks: 1
    });
    setShowAddModal(true);
  };

  // Open Edit Question Modal with populated hierarchy
  const openEditQuestionModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormBoardId(q.board_id);
    setFormClassId(q.class_id);
    setFormSubjectId(q.subject_id);
    setFormChapterId(q.chapter_id);
    setFormTopicId(q.topic_id);

    setFormData({
      topic_id: String(q.topic_id),
      question: q.question,
      correct_answer: q.correct_answer,
      option_a: q.options?.[0]?.replace(/^[A-D]\)\s*/, '') || '',
      option_b: q.options?.[1]?.replace(/^[A-D]\)\s*/, '') || '',
      option_c: q.options?.[2]?.replace(/^[A-D]\)\s*/, '') || '',
      option_d: q.options?.[3]?.replace(/^[A-D]\)\s*/, '') || '',
      explanation: q.explanation || '',
      type: q.type || 'MCQ',
      difficulty: q.difficulty?.toLowerCase() === 'simple' ? 'easy' : (q.difficulty?.toLowerCase() || 'medium'),
      marks: q.marks || 1
    });
    setShowAddModal(true);
  };

  // Hierarchy Cascade Change Handlers
  const handleFormBoardChange = (boardId: number) => {
    setFormBoardId(boardId);
    const b = tree.find(item => item.id === boardId);
    const classes = b?.classes || [];
    const firstClass = classes[0];
    const firstSubject = firstClass?.subjects?.[0];
    const firstChapter = firstSubject?.chapters?.[0];
    const firstTopic = firstChapter?.topics?.[0];

    setFormClassId(firstClass?.id || null);
    setFormSubjectId(firstSubject?.id || null);
    setFormChapterId(firstChapter?.id || null);
    setFormTopicId(firstTopic?.id || null);
  };

  const handleFormClassChange = (classId: number) => {
    setFormClassId(classId);
    const c = formAvailableClasses.find(item => item.id === classId);
    const firstSubject = c?.subjects?.[0];
    const firstChapter = firstSubject?.chapters?.[0];
    const firstTopic = firstChapter?.topics?.[0];

    setFormSubjectId(firstSubject?.id || null);
    setFormChapterId(firstChapter?.id || null);
    setFormTopicId(firstTopic?.id || null);
  };

  const handleFormSubjectChange = (subjectId: number) => {
    setFormSubjectId(subjectId);
    const s = formAvailableSubjects.find(item => item.id === subjectId);
    const firstChapter = s?.chapters?.[0];
    const firstTopic = firstChapter?.topics?.[0];

    setFormChapterId(firstChapter?.id || null);
    setFormTopicId(firstTopic?.id || null);
  };

  const handleFormChapterChange = (chapterId: number) => {
    setFormChapterId(chapterId);
    const ch = formAvailableChapters.find(item => item.id === chapterId);
    const firstTopic = ch?.topics?.[0];
    setFormTopicId(firstTopic?.id || null);
  };

  const handleFormTypeChange = (newType: string) => {
    let defMarks = 1;
    if (newType === 'SAQ') defMarks = 2;
    else if (newType === 'Long Answer') defMarks = 5;
    else if (newType === 'Numerical') defMarks = 1;
    else if (newType === 'Objective') defMarks = 1;
    else if (newType === 'MCQ') defMarks = 1;

    setFormData(prev => ({
      ...prev,
      type: newType,
      marks: defMarks
    }));
  };

  // Save/Create Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTopicId = formTopicId || formSelectedTopic?.id || parseInt(formData.topic_id);
    if (!effectiveTopicId) {
      showNotify('error', 'Please select a valid Topic for this question.');
      return;
    }

    try {
      let optionsList: string[] | null = null;
      if (formData.type.toUpperCase() === 'MCQ') {
        optionsList = [
          `A) ${formData.option_a.trim()}`,
          `B) ${formData.option_b.trim()}`,
          `C) ${formData.option_c.trim()}`,
          `D) ${formData.option_d.trim()}`
        ];
      }

      const payload = {
        topic_id: effectiveTopicId,
        question: formData.question.trim(),
        correct_answer: formData.correct_answer.trim(),
        options: optionsList,
        explanation: formData.explanation.trim(),
        marks: parseInt(formData.marks as any) || 1,
        type: formData.type,
        difficulty: formData.difficulty
      };

      if (editingQuestion) {
        await ApiServices.updateQuestion(editingQuestion.id, payload);
        showNotify('success', 'Question updated successfully!');
      } else {
        await ApiServices.createQuestion(payload);
        showNotify('success', 'Question created in Question Bank!');
      }

      setShowAddModal(false);
      setEditingQuestion(null);
      fetchQuestions();
      fetchTree();
    } catch (err: any) {
      showNotify('error', err?.response?.data?.error?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this question from Question Bank?')) return;
    try {
      await ApiServices.deleteQuestion(id);
      showNotify('success', 'Question deactivated successfully!');
      fetchQuestions();
    } catch (err: any) {
      showNotify('error', 'Failed to delete question');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400'
            : 'bg-rose-500/90 text-white border-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header & Sub-Tab Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Academics & Curriculum Hub</h1>
              <p className="text-xs text-stone-500 font-medium">Manage Board Taxonomies, Chapters, and Central Question Bank</p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/60 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'curriculum'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4 text-yellow-600" />
            Curriculum Tree
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'questions'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-yellow-600" />
            Question Bank ({totalQuestions})
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CURRICULUM HIERARCHY TREE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Board & Class Selectors */}
          <div className="lg:col-span-4 space-y-4">
            {/* Boards selector */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">1. Target Board</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200/60">
                  {tree.length} Boards
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tree.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBoardId(b.id);
                      const valid = b.classes || [];
                      if (valid.length > 0) {
                        setSelectedClassId(valid[0].id);
                        if (valid[0].subjects.length > 0) {
                          setSelectedSubjectId(valid[0].subjects[0].id);
                        } else {
                          setSelectedSubjectId(null);
                        }
                      } else {
                        setSelectedClassId(null);
                        setSelectedSubjectId(null);
                      }
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      selectedBoardId === b.id
                        ? 'bg-yellow-400 text-stone-900 border-yellow-500 shadow-xs font-black scale-[1.02]'
                        : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'
                    }`}
                  >
                    {b.board_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Grade selector */}
            {activeBoard && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">2. Class / Grade</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {visibleClasses.length} Classes
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {visibleClasses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClassId(c.id);
                        if (c.subjects.length > 0) {
                          setSelectedSubjectId(c.subjects[0].id);
                        } else {
                          setSelectedSubjectId(null);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border ${
                        activeClass?.id === c.id
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-bold'
                          : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'
                      }`}
                    >
                      {c.class_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Selector */}
            {activeClass && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">3. Subject</span>
                <div className="flex flex-col gap-1.5">
                  {activeClass.subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        selectedSubjectId === s.id
                          ? 'bg-yellow-50 text-yellow-900 border-yellow-300 font-bold'
                          : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                        <span>{s.subject_name}</span>
                      </div>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-stone-500">
                        {s.chapters.length} Ch
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Chapters & Sub-Topics Tree */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-black text-stone-900">
                  {activeBoard?.board_name} &bull; {activeClass?.class_name} &bull; {activeSubject?.subject_name || 'Select Subject'}
                </h2>
                <p className="text-xs text-stone-400">Chapters and Granular Sub-Topics with Question Bank Mapping</p>
              </div>
              <button
                onClick={fetchTree}
                className="p-2 hover:bg-stone-100 rounded-xl text-stone-500 transition-colors"
                title="Refresh Taxonomy"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingTree ? (
              <div className="py-20 text-center text-stone-400 font-medium text-xs animate-pulse">
                Loading curriculum hierarchy...
              </div>
            ) : !activeSubject || activeSubject.chapters.length === 0 ? (
              <div className="py-20 text-center text-stone-400 space-y-2">
                <FolderOpen className="w-12 h-12 mx-auto text-stone-300" />
                <p className="text-sm font-bold text-stone-600">No chapters mapped for this subject yet.</p>
                <p className="text-xs text-stone-400">Upload syllabus or map chapters via Database.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSubject.chapters.map((ch, idx) => (
                  <div key={ch.id} className="border border-stone-200/80 rounded-2xl overflow-hidden transition-all">
                    {/* Chapter Header */}
                    <div
                      onClick={() => toggleChapter(ch.id)}
                      className="p-4 bg-stone-50/70 hover:bg-stone-100/60 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-black flex items-center justify-center">
                          {ch.chapter_number || idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{ch.chapter_name}</p>
                          <p className="text-[11px] text-stone-400 font-medium">{ch.topics?.length || 0} Sub-topics</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {expandedChapters[ch.id] ? (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Topics List */}
                    {expandedChapters[ch.id] && (
                      <div className="p-4 bg-white border-t border-stone-100 space-y-2">
                        {ch.topics.map((top, tIdx) => (
                          <div
                            key={top.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/60 border border-stone-100 hover:border-yellow-200 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-white border border-stone-200 text-[10px] font-bold text-stone-500 flex items-center justify-center">
                                {top.topic_order || tIdx + 1}
                              </span>
                              <span className="text-xs font-semibold text-stone-800">{top.topic_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                top.question_count > 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {top.question_count} Questions
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: CENTRAL QUESTION BANK EXPLORER
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between flex-wrap gap-2">
            {/* Filter Dropdowns & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Board Filter */}
              <select
                value={filterBoard}
                onChange={(e) => {
                  setFilterBoard(e.target.value);
                  setFilterClass('');
                  setFilterSubject('');
                }}
                className="px-3 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="" className="text-stone-900 bg-white">All Boards</option>
                {tree.map((b) => (
                  <option key={b.id} value={b.id} className="text-stone-900 bg-white">{b.board_name || b.name}</option>
                ))}
              </select>

              {/* Class Filter (Replaces All Difficulties position) */}
              <select
                value={filterClass}
                onChange={(e) => {
                  setFilterClass(e.target.value);
                  setFilterSubject('');
                }}
                className="px-3 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="" className="text-stone-900 bg-white">All Classes</option>
                {filterClassesList.map((c: any) => (
                  <option key={c.id} value={c.id} className="text-stone-900 bg-white">{c.class_name || c.name}</option>
                ))}
              </select>

              {/* Subject Filter (Replaces All Types position) */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="" className="text-stone-900 bg-white">All Subjects</option>
                {filterSubjectsList.map((s: any) => (
                  <option key={s.id} value={s.id} className="text-stone-900 bg-white">{s.subject_name || s.name}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="" className="bg-white text-stone-900 font-medium">All Difficulties</option>
                <option value="easy" className="bg-white text-stone-900 font-medium">Easy</option>
                <option value="medium" className="bg-white text-stone-900 font-medium">Medium</option>
                <option value="hard" className="bg-white text-stone-900 font-medium">Hard</option>
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="" className="bg-white text-stone-900 font-medium">All Types</option>
                <option value="MCQ" className="bg-white text-stone-900 font-medium">MCQ</option>
                <option value="SAQ" className="bg-white text-stone-900 font-medium">SAQ / Short</option>
                <option value="Numerical" className="bg-white text-stone-900 font-medium">Numerical</option>
                <option value="Logical" className="bg-white text-stone-900 font-medium">Logical</option>
              </select>

              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-400" />
                CSV Upload
              </button>

              <button
                onClick={() => {
                  setShowHistoryModal(true);
                  fetchUploadHistory();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/80 transition-all cursor-pointer shadow-2xs"
                title="View past question bulk upload batches & logs"
              >
                <History className="w-3.5 h-3.5 text-amber-600" />
                Upload History
              </button>

              <button
                onClick={openAddQuestionModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-yellow-400 text-stone-900 hover:bg-yellow-300 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>

          {/* Question List Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            {loadingQuestions ? (
              <div className="py-24 text-center text-stone-400 font-medium text-xs animate-pulse">
                Fetching questions from Question Bank...
              </div>
            ) : questions.length === 0 ? (
              <div className="py-24 text-center text-stone-400 space-y-2">
                <HelpCircle className="w-12 h-12 mx-auto text-stone-300" />
                <p className="text-sm font-bold text-stone-600">No questions found matching your filter.</p>
                <p className="text-xs text-stone-400">Try adjusting your search criteria or upload questions via CSV.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {questions.map((q) => {
                  const normalizedDiff = (q.difficulty?.toLowerCase() === 'simple' ? 'easy' : (q.difficulty?.toLowerCase() || 'medium'));
                  const diffLabel = normalizedDiff.charAt(0).toUpperCase() + normalizedDiff.slice(1);
                  return (
                    <div key={q.id} className="p-5 hover:bg-stone-50/60 transition-colors space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                              #{q.id} &bull; {q.type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              normalizedDiff === 'hard'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : normalizedDiff === 'medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {diffLabel}
                            </span>
                            <span className="text-[10px] font-semibold text-stone-400">
                              {q.board_name} &bull; {q.class_name} &bull; {q.subject_name} &bull; {q.chapter_name} &bull; <strong className="text-stone-700">{q.topic_name}</strong>
                            </span>
                          </div>
                          <p className="text-sm font-bold text-stone-900 leading-relaxed">{q.question}</p>
                        </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditQuestionModal(q)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                          title="Deactivate Question"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>

                    {/* MCQ Options Display */}
                    {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isCorrect = opt.trim().toLowerCase().startsWith(q.correct_answer.toLowerCase()) ||
                                            opt.trim().toLowerCase().includes(q.correct_answer.toLowerCase());
                          return (
                            <div
                              key={optIdx}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                  : 'bg-stone-50/50 text-stone-600 border-stone-200/60'
                              }`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-yellow-50/50 border border-yellow-200/50 text-xs text-yellow-900 font-medium">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {!loadingQuestions && questions.length > 0 && (
              <div className="p-4 bg-stone-50/80 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-stone-500 font-medium">
                  <span>
                    Showing <strong className="text-stone-800 font-bold">{Math.min((page - 1) * limit + 1, totalQuestions)}</strong> to{' '}
                    <strong className="text-stone-800 font-bold">{Math.min(page * limit, totalQuestions)}</strong> of{' '}
                    <strong className="text-stone-800 font-bold">{totalQuestions}</strong> questions
                  </span>
                  <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
                    <span className="text-[11px] text-stone-400 font-semibold">Per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Page Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dynamic Page Numbers */}
                  {Array.from({ length: Math.ceil(totalQuestions / limit) || 1 }, (_, i) => i + 1)
                    .filter(pNum => pNum === 1 || pNum === Math.ceil(totalQuestions / limit) || Math.abs(pNum - page) <= 2)
                    .map((pNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && pNum - prev > 1;
                      return (
                        <React.Fragment key={pNum}>
                          {showEllipsis && <span className="px-1 text-stone-400">...</span>}
                          <button
                            onClick={() => setPage(pNum)}
                            className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              page === pNum
                                ? 'bg-yellow-400 text-stone-900 border border-yellow-500 shadow-2xs font-extrabold'
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {pNum}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    disabled={page >= Math.ceil(totalQuestions / limit)}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: BULK CSV/EXCEL UPLOADER
         ───────────────────────────────────────────────────────────── */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-stone-900">Bulk Upload Questions</h3>
              </div>
              <button
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setUploadFile(null);
                  setUploadResult(null);
                  setUploadProgress(0);
                  setUploadStepText('');
                }}
                className="p-1 hover:bg-stone-100 rounded-lg text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 font-medium">
              Upload hundreds of questions at once using a CSV or Excel file. Download the sample template below for the required columns.
            </p>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <Download className="w-4 h-4 text-yellow-600" />
                <span>Download Sample CSV Template</span>
              </div>
              <button
                onClick={downloadSampleCsv}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 hover:bg-yellow-50 hover:border-yellow-300 transition-colors shadow-2xs"
              >
                Download
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              {!uploadResult && (
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-stone-50/50">
                  <input
                    type="file"
                    id="bulk-csv-input"
                    accept=".csv,.xlsx,.xls"
                    disabled={uploading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadProgress(0);
                        setUploadStepText('');
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="bulk-csv-input" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="w-8 h-8 mx-auto text-yellow-600 animate-bounce" />
                    <p className="text-xs font-bold text-stone-800">
                      {uploadFile ? uploadFile.name : 'Click to select CSV or XLSX file'}
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium">Supports CSV, XLSX up to 10MB</p>
                  </label>
                </div>
              )}

              {/* Ingestion Live Progress Bar */}
              {(uploading || (uploadProgress > 0 && !uploadResult)) && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Ingesting Questions into Question Bank...</span>
                    </div>
                    <span className="text-amber-700 font-extrabold">{uploadProgress}%</span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-300 ease-out shadow-xs"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-medium text-amber-800/80 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                    {uploadStepText || 'Processing CSV data...'}
                  </p>
                </div>
              )}

              {/* Ingestion Completion Card */}
              {uploadResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in zoom-in-95">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-emerald-900">
                        {uploadResult.message || 'Questions ingested successfully!'}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Inserted: <strong className="text-emerald-900 font-bold">{uploadResult.inserted}</strong> | Skipped: <strong className="text-stone-600">{uploadResult.skipped}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                {uploadResult ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadResult(null);
                        setUploadProgress(0);
                        setUploadStepText('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      Upload Another File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkUploadModal(false);
                        setUploadFile(null);
                        setUploadResult(null);
                        setUploadProgress(0);
                        setUploadStepText('');
                      }}
                      className="px-6 py-2 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Done</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => {
                        setShowBulkUploadModal(false);
                        setUploadFile(null);
                        setUploadResult(null);
                        setUploadProgress(0);
                        setUploadStepText('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadFile || uploading}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-yellow-400 text-stone-900 hover:bg-yellow-300 disabled:opacity-50 shadow-xs flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Ingesting ({uploadProgress}%)...</span>
                        </>
                      ) : (
                        <span>Start Ingestion</span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: ADD / EDIT QUESTION MODAL
         ───────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-stone-200 shadow-2xl my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {editingQuestion ? 'Edit Question in Bank' : 'Add New Question to Bank'}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">Configure curriculum hierarchy, question type, answer key, and marks</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* SECTION 1: CASCADING CURRICULUM HIERARCHY */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>Curriculum Taxonomy (Board &bull; Class &bull; Subject &bull; Topic)</span>
                </div>

                {/* Row 1: Board, Class, Subject */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Target Board</label>
                    <select
                      value={formSelectedBoard?.id || ''}
                      onChange={(e) => handleFormBoardChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                    >
                      {tree.map(b => (
                        <option key={b.id} value={b.id}>{b.board_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Class / Grade</label>
                    <select
                      value={formSelectedClass?.id || ''}
                      onChange={(e) => handleFormClassChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                    >
                      {formAvailableClasses.map(c => (
                        <option key={c.id} value={c.id}>{c.class_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Subject</label>
                    <select
                      value={formSelectedSubject?.id || ''}
                      onChange={(e) => handleFormSubjectChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                    >
                      {formAvailableSubjects.length === 0 ? (
                        <option value="">No subjects found</option>
                      ) : (
                        formAvailableSubjects.map(s => (
                          <option key={s.id} value={s.id}>{s.subject_name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Row 2: Chapter & Topic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Chapter</label>
                    <select
                      value={formSelectedChapter?.id || ''}
                      onChange={(e) => handleFormChapterChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                    >
                      {formAvailableChapters.length === 0 ? (
                        <option value="">No chapters found</option>
                      ) : (
                        formAvailableChapters.map(ch => (
                          <option key={ch.id} value={ch.id}>{ch.chapter_name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Topic <span className="text-amber-700 font-extrabold">(Required)</span>
                    </label>
                    <select
                      value={formSelectedTopic?.id || formTopicId || ''}
                      onChange={(e) => {
                        const tId = Number(e.target.value);
                        setFormTopicId(tId);
                        setFormData({ ...formData, topic_id: String(tId) });
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                    >
                      {formAvailableTopics.length === 0 ? (
                        <option value="">No topics found</option>
                      ) : (
                        formAvailableTopics.map(t => (
                          <option key={t.id} value={t.id}>{t.topic_name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: QUESTION TYPE & DIFFICULTY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Question Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormTypeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="SAQ">Short Answer (SAQ)</option>
                    <option value="Objective">Objective / Fill in Blank</option>
                    <option value="Numerical">Numerical Calculation</option>
                    <option value="Long Answer">Long Answer / Descriptive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="easy">Easy / Foundation</option>
                    <option value="medium">Medium / Application</option>
                    <option value="hard">Hard / Analytical (HOTS)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: QUESTION TEXT */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter full question text or problem statement..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* SECTION 4: MCQ OPTIONS (Only when Question Type is MCQ) */}
              {formData.type === 'MCQ' && (
                <div className="space-y-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Multiple Choice Options (A, B, C, D)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Option A text..."
                      value={formData.option_a}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option B text..."
                      value={formData.option_b}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option C text..."
                      value={formData.option_c}
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Option D text..."
                      value={formData.option_d}
                      onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 5: CORRECT ANSWER */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Correct Answer Key <span className="text-amber-700 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.type === 'MCQ'
                      ? 'e.g. A) Option Text or exact option prefix'
                      : formData.type === 'Numerical'
                      ? 'e.g. 5 or 300'
                      : formData.type === 'Objective'
                      ? 'e.g. Chlorophyll or single keyword'
                      : 'e.g. Expected answer summary or definition...'
                  }
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* SECTION 6: EXPLANATION */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Derivation, rationale, or textbook reference explaining the correct answer..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* MODAL FOOTER */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-yellow-400 text-stone-900 hover:bg-yellow-300 shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingQuestion ? 'Update Question' : 'Save to Bank'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: UPLOAD BATCH HISTORY MODAL
         ───────────────────────────────────────────────────────────── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Question Bulk Ingestion History</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Audit log of past CSV and Excel question uploads</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUploadHistory}
                  className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-500 transition-colors"
                  title="Refresh history"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <p className="text-xs font-semibold">Loading batch logs...</p>
                </div>
              ) : uploadHistory.length === 0 ? (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <Database className="w-8 h-8 mx-auto opacity-40 text-stone-500" />
                  <p className="text-xs font-semibold">No question upload batches found.</p>
                  <p className="text-[11px] text-stone-400">Upload your first CSV file to see history logs here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {uploadHistory.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:bg-white hover:border-amber-200 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-black text-stone-900">{batch.file_name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {batch.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {batch.created_at}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-stone-200/50 text-center">
                        <div className="bg-white p-2 rounded-xl border border-stone-100">
                          <p className="text-[10px] text-stone-400 font-semibold uppercase">Total Rows</p>
                          <p className="text-xs font-extrabold text-stone-800">{batch.total_rows}</p>
                        </div>
                        <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                          <p className="text-[10px] text-emerald-600 font-semibold uppercase">Inserted</p>
                          <p className="text-xs font-extrabold text-emerald-700">+{batch.inserted_count}</p>
                        </div>
                        <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                          <p className="text-[10px] text-amber-600 font-semibold uppercase">Updated</p>
                          <p className="text-xs font-extrabold text-amber-700">{batch.updated_count}</p>
                        </div>
                        <div className="bg-stone-100/80 p-2 rounded-xl border border-stone-200">
                          <p className="text-[10px] text-stone-500 font-semibold uppercase">Duplicates</p>
                          <p className="text-xs font-extrabold text-stone-600">{batch.duplicate_skipped_count}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
