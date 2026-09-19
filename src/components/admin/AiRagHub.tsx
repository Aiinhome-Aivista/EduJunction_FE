import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Cpu,
  Layers,
  Check,
  Zap,
  Bot,
  PlusCircle,
  HelpCircle,
  X,
  Edit3,
  Sliders,
  ChevronRight,
  BookmarkCheck,
  Loader2
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';
import { Board, ClassGrade, Subject, BOARD_CLASSES_MAP, CLASS_SUBJECTS_MAP } from '../../types';

interface MasterBoard {
  id: number;
  name: string;
  description?: string;
}

interface RagDocument {
  id: string;
  filename: string;
  content_type: string;
  board?: string;
  classGrade?: string;
  subject?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  chunk_count: number;
  created_at: string;
}

interface RagStatusData {
  vector_store_enabled: boolean;
  total_topics?: number;
  total_ai_exams?: number;
  total_documents: number;
  total_chunks: number;
  total_runbooks: number;
  documents: RagDocument[];
}

interface GeneratedQuestionItem {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  marks: number;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic_suggested?: string;
}

interface FlatTopic {
  id: number;
  name: string;
  chapterName: string;
  subjectName: string;
  className: string;
  boardName: string;
}

export const AiRagHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book_analysis' | 'ingestion' | 'playground'>('book_analysis');
  const [ragStatus, setRagStatus] = useState<RagStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Book & Question Bank LLM Analysis State
  const [bookUploadFile, setBookUploadFile] = useState<File | null>(null);
  const [bookBoard, setBookBoard] = useState<string>('CBSE');
  const [bookClass, setBookClass] = useState<string>('Class 10');
  const [bookSubject, setBookSubject] = useState<string>('Mathematics');
  const [bookDocType, setBookDocType] = useState<string>('Textbook');
  const [bookYear, setBookYear] = useState<string>('2024');
  const [analyzingBook, setAnalyzingBook] = useState<boolean>(false);
  const [bookAnalysisResult, setBookAnalysisResult] = useState<any | null>(null);
  const [bookTargetTopicId, setBookTargetTopicId] = useState<number | null>(null);
  const [isSavingBookQuestions, setIsSavingBookQuestions] = useState<boolean>(false);

  // Master Data Dynamic State (from DB /api/v1/master/board_class_dropdown)
  const [activeBoards, setActiveBoards] = useState<MasterBoard[]>([]);
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>(BOARD_CLASSES_MAP);
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);

  // Ingestion Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<string>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<string>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [uploading, setUploading] = useState(false);

  // Dynamic allowed classes strictly determined by Board mapping
  const availableClasses: string[] = (boardClassesMap && boardClassesMap[selectedBoard]) || BOARD_CLASSES_MAP[selectedBoard] || [
    'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];

  // Dynamic allowed subjects strictly determined by Class Grade mapping
  const availableSubjects: string[] = CLASS_SUBJECTS_MAP[selectedGrade] || [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Science', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'
  ];

  // Real-time metadata mismatch detection from filename
  const detectedMeta = React.useMemo(() => {
    if (!uploadFile) return null;
    const fn = uploadFile.name.replace(/[-_.]/g, ' ').toLowerCase();
    let board: string | undefined;
    if (/\bcbse\b/.test(fn)) board = 'CBSE';
    else if (/\bicse\b/.test(fn)) board = 'ICSE';
    else if (/\bisc\b/.test(fn)) board = 'ISC';
    else if (/\bwbbse\b/.test(fn) || /\bwb\b/.test(fn)) board = 'WBBSE';
    else if (/\bwbchse\b/.test(fn)) board = 'WBCHSE';
    else if (/\bcambridge\b/.test(fn) || /\bigcse\b/.test(fn)) board = 'UK-Cambridge';
    else if (/\bncert\b/.test(fn)) board = 'NCERT';
    else if (/\bneet\b/.test(fn)) board = 'NEET';
    else if (/\biit\b/.test(fn) || /\bjee\b/.test(fn)) board = 'IIT';

    let classGrade: string | undefined;
    for (let i = 12; i >= 1; i--) {
      const roman = i === 12 ? 'xii' : i === 11 ? 'xi' : i === 10 ? 'x' : i === 9 ? 'ix' : i === 8 ? 'viii' : i === 7 ? 'vii' : i === 6 ? 'vi' : i === 5 ? 'v' : i === 4 ? 'iv' : i === 3 ? 'iii' : i === 2 ? 'ii' : 'i';
      const pattern = new RegExp(`(?:class|grade|std)[_\\s-]*(?:${i}|${roman})\\b`, 'i');
      if (pattern.test(fn)) {
        classGrade = `Class ${i}`;
        break;
      }
    }

    let subject: string | undefined;
    if (/\b(?:math|maths|mathematics|calculus|algebra|geometry)\b/.test(fn)) subject = 'Mathematics';
    else if (/\bphysics\b/.test(fn)) subject = 'Physics';
    else if (/\bchemistry\b/.test(fn)) subject = 'Chemistry';
    else if (/\bbiology\b/.test(fn)) subject = 'Biology';
    else if (/\bscience\b/.test(fn)) subject = 'Science';
    else if (/\b(?:social|history|geography|civics|economics|sst)\b/.test(fn)) subject = 'Social Studies';
    else if (/\b(?:english|grammar|literature)\b/.test(fn)) subject = 'English';
    else if (/\b(?:computer|coding|python|informatics)\b/.test(fn)) subject = 'Computer Science';

    return { board, classGrade, subject };
  }, [uploadFile]);

  const isBoardMismatch = Boolean(
    detectedMeta?.board &&
    detectedMeta.board !== selectedBoard &&
    !(detectedMeta.board === 'NCERT' && selectedBoard === 'CBSE') &&
    !(detectedMeta.board === 'CBSE' && selectedBoard === 'NCERT')
  );

  const isClassMismatch = Boolean(
    detectedMeta?.classGrade &&
    detectedMeta.classGrade !== selectedGrade
  );

  const isSubjectMismatch = Boolean(
    detectedMeta?.subject &&
    detectedMeta.subject !== selectedSubject &&
    !(selectedSubject === 'Science' && ['Physics', 'Chemistry', 'Biology'].includes(detectedMeta.subject))
  );

  const hasFilenameMismatch = Boolean(uploadFile && (isBoardMismatch || isClassMismatch || isSubjectMismatch));

  const handleBoardChange = (newBoard: string) => {
    setSelectedBoard(newBoard);
    const validClasses = (boardClassesMap && boardClassesMap[newBoard]) || BOARD_CLASSES_MAP[newBoard] || ['Class 10'];
    const newClass = validClasses.includes(selectedGrade) ? selectedGrade : (validClasses[0] || 'Class 10');
    setSelectedGrade(newClass);

    const validSubjects = CLASS_SUBJECTS_MAP[newClass] || ['Mathematics'];
    if (!validSubjects.includes(selectedSubject as any)) {
      setSelectedSubject(validSubjects[0] || 'Mathematics');
    }
  };

  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const validSubjects = CLASS_SUBJECTS_MAP[newGrade] || ['Mathematics'];
    if (!validSubjects.includes(selectedSubject as any)) {
      setSelectedSubject(validSubjects[0] || 'Mathematics');
    }
  };

  // Playground State
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testingLlm, setTestingLlm] = useState(false);

  // AI Question Generator Modal State
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [activeDocForGen, setActiveDocForGen] = useState<RagDocument | null>(null);
  const [genCount, setGenCount] = useState<number>(5);
  const [genType, setGenType] = useState<string>('ALL');
  const [genDifficulty, setGenDifficulty] = useState<string>('ALL');
  const [genInstructions, setGenInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [selectedTargetTopicId, setSelectedTargetTopicId] = useState<number | null>(null);
  const [flatTopics, setFlatTopics] = useState<FlatTopic[]>([]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchRagStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await ApiServices.getRagStatus();
      const data = res?.data !== undefined ? res.data : res;
      setRagStatus(data);
    } catch (err: any) {
      console.error('Failed to load RAG status:', err);
      showNotify('error', 'Failed to connect to ChromaDB vector store');
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchCurriculumTopics = async () => {
    try {
      const res = await ApiServices.getCurriculumTree();
      const tree = Array.isArray(res) ? res : res?.tree || [];
      const topics: FlatTopic[] = [];
      tree.forEach((b: any) => {
        (b.classes || []).forEach((c: any) => {
          (c.subjects || []).forEach((s: any) => {
            (s.chapters || []).forEach((ch: any) => {
              (ch.topics || []).forEach((t: any) => {
                topics.push({
                  id: t.id,
                  name: t.topic_name,
                  chapterName: ch.chapter_name,
                  subjectName: s.subject_name,
                  className: c.class_name,
                  boardName: b.board_name
                });
              });
            });
          });
        });
      });
      setFlatTopics(topics);
      if (topics.length > 0 && !selectedTargetTopicId) {
        setSelectedTargetTopicId(topics[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load topics for Question Bank mapping:', err);
    }
  };

  const fetchMasterDropdowns = async () => {
    setIsLoadingMasters(true);
    try {
      const res = await ApiServices.getBoardClassDropdown();
      const fetchedBoards: MasterBoard[] = res?.boards || res?.data?.boards || [];
      const fetchedMap = res?.boardClassesMap || res?.data?.boardClassesMap || BOARD_CLASSES_MAP;

      if (fetchedBoards.length > 0) {
        setActiveBoards(fetchedBoards);
        setSelectedBoard((prev) => {
          const match = fetchedBoards.find(b => b.name === prev);
          const boardName = match ? prev : fetchedBoards[0].name;

          const validClasses = fetchedMap[boardName] || BOARD_CLASSES_MAP[boardName] || ['Class 10'];
          setSelectedGrade((prevGrade) => {
            const gradeName = validClasses.includes(prevGrade) ? prevGrade : (validClasses[0] || 'Class 10');
            const validSubjects = CLASS_SUBJECTS_MAP[gradeName] || ['Mathematics'];
            setSelectedSubject((prevSub) => {
              return validSubjects.includes(prevSub as any) ? prevSub : (validSubjects[0] || 'Mathematics');
            });
            return gradeName;
          });

          return boardName;
        });
      }
      if (fetchedMap) {
        setBoardClassesMap(fetchedMap);
      }
    } catch (err) {
      console.warn('Failed to load active master board/class dropdowns:', err);
    } finally {
      setIsLoadingMasters(false);
    }
  };

  useEffect(() => {
    fetchRagStatus();
    fetchCurriculumTopics();
    fetchMasterDropdowns();
  }, []);

  const handleAnalyzeBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookUploadFile) {
      showNotify('error', 'Please select a PDF/DOC/DOCX file to analyze.');
      return;
    }
    setAnalyzingBook(true);
    setBookAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', bookUploadFile);
      formData.append('board', bookBoard);
      formData.append('classGrade', bookClass);
      formData.append('subject', bookSubject);
      formData.append('documentType', bookDocType);
      formData.append('yearDeclared', bookYear);

      const res = await ApiServices.analyzeBookAndQuestionBank(formData);
      setBookAnalysisResult(res);
      showNotify('success', `✨ Successfully analyzed "${bookUploadFile.name}"! Extracted Summary, Relationships & Questions.`);
      await fetchRagStatus();
    } catch (err: any) {
      console.error('Book analysis error:', err);
      showNotify('error', err?.response?.data?.error?.message || err?.message || 'Failed to analyze book. Please check year & format criteria.');
    } finally {
      setAnalyzingBook(false);
    }
  };

  const handleSaveBookQuestions = async () => {
    const targetTopic = bookTargetTopicId || (flatTopics.length > 0 ? flatTopics[0].id : null);
    if (!targetTopic) {
      showNotify('error', 'Please select a curriculum Topic to link questions.');
      return;
    }
    const questions = bookAnalysisResult?.important_questions || [];
    if (questions.length === 0) {
      showNotify('error', 'No questions to save.');
      return;
    }

    setIsSavingBookQuestions(true);
    try {
      const res = await ApiServices.saveRagQuestions({
        topic_id: targetTopic,
        questions: questions
      });
      showNotify('success', res?.message || `Successfully saved ${questions.length} questions to Question Bank!`);
      fetchRagStatus();
    } catch (err: any) {
      console.error('Save questions error:', err);
      showNotify('error', err?.response?.data?.error?.message || 'Failed to save questions');
    } finally {
      setIsSavingBookQuestions(false);
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('board', selectedBoard);
      formData.append('classGrade', selectedGrade);
      formData.append('subject', selectedSubject);

      const res = await ApiServices.uploadRagFile(formData);
      showNotify('success', `PDF "${uploadFile.name}" indexed successfully!`);
      setUploadFile(null);
      await fetchRagStatus();

      // Automatically offer to generate questions from this newly uploaded document
      if (res && res.id) {
        const newDoc: RagDocument = {
          id: res.id,
          filename: res.filename || uploadFile.name,
          content_type: 'application/pdf',
          board: selectedBoard,
          classGrade: selectedGrade,
          subject: selectedSubject,
          status: 'PROCESSED',
          chunk_count: 1,
          created_at: new Date().toISOString()
        };
        openQuestionGenerator(newDoc);
      }
    } catch (err: any) {
      console.error('PDF upload error:', err);
      showNotify('error', err?.message || err?.response?.data?.error?.message || 'Failed to ingest PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to remove this textbook from ChromaDB?')) return;
    try {
      await ApiServices.deleteRagDocument(id);
      showNotify('success', 'Document removed from ChromaDB vector store');
      fetchRagStatus();
    } catch (err: any) {
      showNotify('error', 'Failed to delete document');
    }
  };

  const handleTestChat = async () => {
    if (!testQuery.trim()) return;
    setTestingLlm(true);
    setTestResponse(null);
    try {
      const res = await ApiServices.sendChatMessage({
        messages: [{ role: 'user', content: testQuery.trim() }]
      });
      const reply = res?.response || (typeof res === 'string' ? res : JSON.stringify(res));
      setTestResponse(reply);
    } catch (err: any) {
      setTestResponse(`Error: ${err?.message || 'Failed to contact AI Teacher'}`);
    } finally {
      setTestingLlm(false);
    }
  };

  // Open Question Generator Modal for a document
  const openQuestionGenerator = (doc: RagDocument) => {
    setActiveDocForGen(doc);
    setGeneratedQuestions([]);
    setGenCount(5);
    setGenType('ALL');
    setGenDifficulty('ALL');
    setGenInstructions('');

    // Pre-select matching topic based on doc subject/board if available
    const docBoard = (doc.board || '').toLowerCase().trim();
    const docGrade = (doc.classGrade || '').toLowerCase().trim();
    const docSubject = (doc.subject || '').toLowerCase().trim();

    // 1. Exact match (Board + Class + Subject) or Science alias match
    let matched = flatTopics.find(
      t => (!docBoard || t.boardName.toLowerCase().trim() === docBoard) &&
        (!docGrade || t.className.toLowerCase().trim() === docGrade) &&
        (!docSubject || t.subjectName.toLowerCase().trim() === docSubject ||
          (docSubject === 'science' && ['physics', 'chemistry', 'biology', 'science', 'physical science', 'life science'].includes(t.subjectName.toLowerCase().trim())))
    );

    // 2. Fallback: match Board + Class
    if (!matched && docBoard && docGrade) {
      matched = flatTopics.find(
        t => t.boardName.toLowerCase().trim() === docBoard &&
          t.className.toLowerCase().trim() === docGrade
      );
    }

    // 3. Fallback: match Board only
    if (!matched && docBoard) {
      matched = flatTopics.find(
        t => t.boardName.toLowerCase().trim() === docBoard
      );
    }

    // 4. Ultimate fallback
    matched = matched || flatTopics[0];

    if (matched) {
      setSelectedTargetTopicId(matched.id);
    }
    setGeneratorModalOpen(true);
  };

  // Filter topics for the active doc in the question generator modal
  const modalDisplayTopics = React.useMemo(() => {
    if (!activeDocForGen) return flatTopics;
    const docBoard = (activeDocForGen.board || '').toLowerCase().trim();
    const docGrade = (activeDocForGen.classGrade || '').toLowerCase().trim();
    const docSubject = (activeDocForGen.subject || '').toLowerCase().trim();

    // 1. Exact match or Science alias match
    let matching = flatTopics.filter(t => {
      const bMatch = !docBoard || t.boardName.toLowerCase().trim() === docBoard;
      const cMatch = !docGrade || t.className.toLowerCase().trim() === docGrade;
      const sMatch = !docSubject || t.subjectName.toLowerCase().trim() === docSubject ||
        (docSubject === 'science' && ['physics', 'chemistry', 'biology', 'science', 'physical science', 'life science'].includes(t.subjectName.toLowerCase().trim()));
      return bMatch && cMatch && sMatch;
    });

    // 2. Fallback: match Board + Class
    if (matching.length === 0 && docBoard && docGrade) {
      matching = flatTopics.filter(
        t => t.boardName.toLowerCase().trim() === docBoard &&
          t.className.toLowerCase().trim() === docGrade
      );
    }

    // 3. Fallback: match Board only
    if (matching.length === 0 && docBoard) {
      matching = flatTopics.filter(t => t.boardName.toLowerCase().trim() === docBoard);
    }

    return matching.length > 0 ? matching : flatTopics;
  }, [flatTopics, activeDocForGen]);

  // Trigger AI Question Generation
  const handleGenerateQuestions = async () => {
    if (!activeDocForGen) return;
    setIsGenerating(true);
    try {
      const res = await ApiServices.generateRagQuestions({
        document_id: activeDocForGen.id,
        count: genCount,
        type: genType,
        difficulty: genDifficulty,
        instructions: genInstructions
      });

      const questionsList = res?.questions || res?.data?.questions || [];
      if (Array.isArray(questionsList) && questionsList.length > 0) {
        setGeneratedQuestions(questionsList);
        showNotify('success', `✨ Generated ${questionsList.length} questions from ${activeDocForGen.filename}!`);
      } else {
        showNotify('error', 'No questions were returned. Please try with different instructions.');
      }
    } catch (err: any) {
      console.error('Question generation error:', err);
      showNotify('error', err?.response?.data?.error?.message || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated questions to question_master
  const handleSaveQuestionsToBank = async () => {
    if (!selectedTargetTopicId) {
      showNotify('error', 'Please select a curriculum Topic to save questions under.');
      return;
    }
    if (generatedQuestions.length === 0) {
      showNotify('error', 'No questions to save.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await ApiServices.saveRagQuestions({
        topic_id: selectedTargetTopicId,
        questions: generatedQuestions
      });

      showNotify('success', res?.message || `Successfully saved ${generatedQuestions.length} questions to Question Bank!`);
      setGeneratorModalOpen(false);
      setGeneratedQuestions([]);
      fetchRagStatus();
    } catch (err: any) {
      console.error('Save questions error:', err);
      showNotify('error', err?.response?.data?.error?.message || 'Failed to save questions to database');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit question locally
  const handleUpdateGeneratedQuestion = (index: number, updatedFields: Partial<GeneratedQuestionItem>) => {
    setGeneratedQuestions(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...updatedFields };
      return clone;
    });
  };

  // Remove single generated question from review list
  const handleRemoveGeneratedQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-bounce ${notification.type === 'success'
          ? 'bg-emerald-500/90 text-white border-emerald-400'
          : 'bg-rose-500/90 text-white border-rose-400'
          }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/90 via-yellow-50/80 to-orange-50/60 border border-yellow-200/90 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">Curriculum & Question Synthesis Hub</h1>
          </div>
          <p className="text-xs text-stone-600 pl-11">
            Official NCERT & Board textbook ingestion engine
          </p>
        </div>
        <button
          onClick={fetchRagStatus}
          disabled={loadingStatus}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-yellow-50 text-stone-800 rounded-xl text-xs font-semibold border border-yellow-300/80 shadow-2xs hover:border-yellow-400 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${loadingStatus ? 'animate-spin' : ''}`} />
          <span className="font-bold text-amber-950">Refresh Status</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200/80 pb-2 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('book_analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'book_analysis'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-800'
              }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            Book & QB AI Ingestion (Last 10-15 Yrs)
          </button>
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ingestion'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-800'
              }`}
          >
            <Database className="w-4 h-4 text-yellow-600" />
            Vector Store Ingestion
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'playground'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-800'
              }`}
          >
            <Cpu className="w-4 h-4 text-yellow-600" />
            Query Playground
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VECTOR STORE HEALTH & CURRICULUM METRICS CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Curriculum Topics</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {ragStatus?.total_topics ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mapped Core Learning Concepts
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Indexed Chunks</span>
            <Layers className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{ragStatus?.total_chunks || 0}</p>
          <p className="text-[11px] text-stone-400 font-medium">300-500 token semantic segments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Textbook Repository</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{ragStatus?.total_documents || 0}</p>
          <p className="text-[11px] text-stone-400 font-medium">Official Curriculum Chapters</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Runbooks</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{ragStatus?.total_runbooks || 0}</p>
          <p className="text-[11px] text-stone-400 font-medium">Curated Concepts & Formulas</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 0: BOOK & QUESTION BANK LLM ANALYSIS (Point 2)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'book_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload Form Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                  CBSE • ICSE • ISC (Class 5–10)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Last 10–15 Yrs (2011–2026)
                </span>
              </div>
              <h2 className="text-base font-black text-stone-900">Upload Book / Question Bank</h2>
              <p className="text-xs text-stone-400">
                Upload structured PDF/DOC/DOCX. AI extracts pedagogical summary, concept graph, and high-yield questions.
              </p>
            </div>

            <form onSubmit={handleAnalyzeBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Board</label>
                <select
                  value={bookBoard}
                  onChange={(e) => setBookBoard(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE (Class 5 to 10)</option>
                  <option value="ISC">ISC (Curriculum Board)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Class Grade</label>
                  <select
                    value={bookClass}
                    onChange={(e) => setBookClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9 (Focus)</option>
                    <option value="Class 10">Class 10 (Focus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                  <select
                    value={bookSubject}
                    onChange={(e) => setBookSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Document Type</label>
                  <select
                    value={bookDocType}
                    onChange={(e) => setBookDocType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="Textbook">Standard Textbook</option>
                    <option value="Question Bank">Question Bank</option>
                    <option value="Previous Years Papers">PYQ (Past 10-15 Yrs)</option>
                    <option value="Model Paper">Model Test Paper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Edition / Exam Year</label>
                  <select
                    value={bookYear}
                    onChange={(e) => setBookYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                  >
                    {Array.from({ length: 16 }, (_, i) => 2026 - i).map((yr) => (
                      <option key={yr} value={yr}>
                        {yr} ({2026 - yr <= 5 ? 'Recent' : `${2026 - yr} yrs ago`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select File (PDF, DOC, DOCX)</label>
                <div className="relative border-2 border-dashed border-stone-200 hover:border-yellow-400 rounded-2xl p-4 text-center transition-all bg-stone-50/50 hover:bg-yellow-50/20">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setBookUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {bookUploadFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-900">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="truncate max-w-[200px]">{bookUploadFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <BookOpen className="w-6 h-6 text-stone-400 mx-auto" />
                      <p className="text-xs font-bold text-stone-700">Choose or Drag Book File</p>
                      <p className="text-[10px] text-stone-400">PDF, DOC, DOCX (Max 50MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={analyzingBook || !bookUploadFile}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {analyzingBook ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with LLM Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Upload & Run LLM Analysis</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Live Analysis Results */}
          <div className="lg:col-span-8 space-y-5">
            {bookAnalysisResult ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Result Header */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ LLM Analysis Complete
                    </span>
                    <h3 className="text-base font-black text-stone-900 mt-1">
                      {bookAnalysisResult.filename}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {bookAnalysisResult.board} • {bookAnalysisResult.class_grade} • {bookAnalysisResult.subject} ({bookAnalysisResult.document_type})
                    </p>
                  </div>

                  {/* Save to Question Bank Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={bookTargetTopicId || (flatTopics[0]?.id || '')}
                      onChange={(e) => setBookTargetTopicId(Number(e.target.value))}
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 max-w-[200px]"
                    >
                      {flatTopics.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.chapterName})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveBookQuestions}
                      disabled={isSavingBookQuestions || (bookAnalysisResult?.important_questions || []).length === 0}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                    >
                      {isSavingBookQuestions ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Save to Question Bank ({bookAnalysisResult?.questions_count || 0})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                      Pedagogical Summary & Chapter Blueprint
                    </h4>
                  </div>
                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-amber-50/40 p-4 rounded-2xl border border-amber-100 whitespace-pre-line font-normal">
                    {bookAnalysisResult.summary}
                  </div>
                </div>

                {/* Relationships Section */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                      Detected Conceptual Relationships & Dependencies
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(bookAnalysisResult.relationships || []).map((rel: any, rIdx: number) => (
                      <div key={rIdx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900">{rel.source_concept}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                            {rel.relationship_type || 'RELATION'}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                          ➔ {rel.target_concept}
                        </div>
                        <p className="text-xs text-stone-600">{rel.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Questions Section */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        Extracted Important Examination Questions ({bookAnalysisResult.questions_count || 0})
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(bookAnalysisResult.important_questions || []).map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-4 bg-stone-50/60 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">Question {qIdx + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${q.difficulty === 'hard'
                                ? 'bg-rose-100 text-rose-800'
                                : q.difficulty === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {q.difficulty}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-700">
                              {q.type} ({q.marks}M)
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-stone-800">{q.question}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="pt-2 text-xs text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                          <strong>Correct Answer:</strong> {q.correct_answer}
                          <p className="text-[11px] text-stone-600 font-normal mt-1"><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-stone-200/80 shadow-xs text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                  📚
                </div>
                <h3 className="text-sm sm:text-base font-black text-stone-900">
                  Ready for Book & Question Bank Analysis
                </h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Select a book from CBSE, ICSE, or ISC (Class 5–10, 2011–2026) on the left to extract chapter summaries, concept graphs, and exam questions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PDF INGESTION & DOCUMENT REPOSITORY
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ingestion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-black text-stone-900">Ingest Curriculum Materials</h2>
              <p className="text-xs text-stone-400">Upload textbooks, lesson notes, and curriculum guides to extract chunks, vectorize, and generate examination questions</p>
            </div>

            <form onSubmit={handleUploadPdf} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">Board</label>
                  {isLoadingMasters && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Syncing active boards...</span>}
                </div>
                <select
                  value={selectedBoard}
                  onChange={(e) => handleBoardChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                >
                  {activeBoards.length > 0 ? (
                    activeBoards.map(b => (
                      <option key={b.id || b.name} value={b.name}>
                        {b.name} {b.description ? `(${b.description})` : ''}
                      </option>
                    ))
                  ) : (
                    Object.keys(BOARD_CLASSES_MAP).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Class</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                  >
                    {availableClasses.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-yellow-400"
                  >
                    {availableSubjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Format Document Dropzone */}
              <div className="relative border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-yellow-400 transition-colors bg-stone-50/50">
                {uploadFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFile(null);
                      const input = document.getElementById('curriculum-upload-input') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    className="absolute top-3 right-3 text-stone-400 hover:text-rose-500 hover:rotate-90 hover:scale-110 transition-all duration-500 ease-out cursor-pointer z-10 animate-in fade-in duration-300 p-0.5"
                    title="Remove selected file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <input
                  type="file"
                  id="curriculum-upload-input"
                  accept=".pdf,.docx,.doc,.rtf,.txt,.csv"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="curriculum-upload-input" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-yellow-700">
                    {uploadFile ? (
                      uploadFile.name.endsWith('.docx') || uploadFile.name.endsWith('.doc') ? (
                        <span className="text-xl">📘</span>
                      ) : uploadFile.name.endsWith('.rtf') ? (
                        <span className="text-xl">📝</span>
                      ) : uploadFile.name.endsWith('.txt') ? (
                        <span className="text-xl">📄</span>
                      ) : (
                        <span className="text-xl">📕</span>
                      )
                    ) : (
                      <FileText className="w-6 h-6 text-yellow-600 animate-bounce" />
                    )}
                  </div>
                  <p
                    className="text-xs font-bold text-stone-800 break-all px-2 max-w-full"
                    title={uploadFile ? uploadFile.name : undefined}
                  >
                    {uploadFile ? uploadFile.name : 'Click to select Textbook or Notes'}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium">Supports PDF, Word (.docx/.doc), RTF, TXT up to 50MB</p>
                </label>
              </div>

              {/* Filename & Selection Mismatch Alert Banner */}
              {hasFilenameMismatch && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-0.5">
                    <p className="font-bold text-amber-900">Curriculum Mismatch Warning</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Selected file indicates: <span className="font-bold underline">{detectedMeta?.board || 'Any'} &bull; {detectedMeta?.classGrade || 'Any'} &bull; {detectedMeta?.subject || 'Any'}</span>
                      , but dropdown is currently set to <span className="font-bold">{selectedBoard} &bull; {selectedGrade} &bull; {selectedSubject}</span>.
                    </p>
                    <p className="text-[10px] text-amber-700 font-medium">
                      Please adjust the Board, Class, and Subject dropdowns manually to match your file before uploading.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-yellow-400 text-stone-900 hover:bg-yellow-300 transition-all disabled:opacity-50 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Extracting Chunks & Vectorizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Process & Index
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Ingested Documents Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-black text-stone-900">Vector Repository Documents</h2>
                <p className="text-xs text-stone-400">Curriculum materials parsed into ChromaDB vector chunks with 1-click Question Synthesis</p>
              </div>
              <button
                onClick={fetchRagStatus}
                className="p-2 hover:bg-stone-100 rounded-xl text-stone-500 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingStatus ? (
              <div className="py-20 text-center text-stone-400 font-medium text-xs animate-pulse">
                Loading indexed documents...
              </div>
            ) : !ragStatus?.documents || ragStatus.documents.length === 0 ? (
              <div className="py-20 text-center text-stone-400 space-y-2">
                <Database className="w-12 h-12 mx-auto text-stone-300" />
                <p className="text-sm font-bold text-stone-600">No documents ingested in ChromaDB yet.</p>
                <p className="text-xs text-stone-400">Upload your first chapter textbook or notes on the left to start vectorizing.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {ragStatus.documents.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 p-2 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200/60 font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate" title={doc.filename}>{doc.filename}</p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {doc.board || 'General'} &bull; {doc.classGrade || 'Standard'} &bull; {doc.subject || 'All'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.chunk_count} Chunks
                      </span>

                      {/* ⚡ Generate Questions Action Button */}
                      <button
                        onClick={() => openQuestionGenerator(doc)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-[11px] shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Synthesize AI Questions from this document into question_master"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Generate Questions</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: AI RAG PLAYGROUND & TEST CONSOLE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'playground' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-black text-stone-900">AI Teacher & RAG Query Playground</h2>
            <p className="text-xs text-stone-400">Test how the AI assistant responds using textbook RAG context and student persona</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                placeholder="Ask an educational query (e.g. 'Explain Newton 3rd law in simple words', 'What is photosynthesis?')..."
                className="w-full pl-4 pr-32 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleTestChat}
                disabled={testingLlm || !testQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-yellow-400 text-stone-900 rounded-xl text-xs font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {testingLlm ? 'Thinking...' : 'Test Response'}
              </button>
            </div>

            {testResponse && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-stone-500 font-bold uppercase text-[10px]">
                  <Bot className="w-3.5 h-3.5 text-yellow-600" />
                  <span>AI Teacher Response:</span>
                </div>
                <p className="text-stone-800 leading-relaxed font-medium whitespace-pre-wrap">{testResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: AI QUESTION GENERATOR & REVIEW CONSOLE
         ───────────────────────────────────────────────────────────── */}
      {generatorModalOpen && activeDocForGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-yellow-50/90 to-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-xs">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                    <span>AI Question Generator from Document</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-200/70 text-yellow-900 border border-yellow-300">
                      Auto-Synthesis
                    </span>
                  </h3>
                  <p className="text-xs text-stone-600 truncate max-w-lg">
                    Source: <strong className="text-stone-800">{activeDocForGen.filename}</strong> ({activeDocForGen.board} &bull; {activeDocForGen.classGrade} &bull; {activeDocForGen.subject})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGeneratorModalOpen(false)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Generation Settings Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>Configure Question Synthesis Parameters</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Number of Questions</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Question Type</label>
                    <select
                      value={genType}
                      onChange={(e) => setGenType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value="ALL">All Types</option>
                      <option value="MCQ">MCQ (Multiple Choice)</option>
                      <option value="SAQ">SAQ (Short Answer Question)</option>
                      <option value="NUMERICAL">Numerical (Calculation Based)</option>
                      <option value="OBJECTIVE">Objective (One-word / Fill-in / Direct)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Difficulty Calibration</label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value="ALL">All Levels</option>
                      <option value="easy">Easy / Foundation</option>
                      <option value="medium">Medium / Standard</option>
                      <option value="hard">Hard / Analytical (HOTS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Custom Focus Instructions (Optional)</label>
                  <input
                    type="text"
                    value={genInstructions}
                    onChange={(e) => setGenInstructions(e.target.value)}
                    placeholder="e.g., Focus heavily on core definitions, formulas, and conceptual traps from the PDF..."
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-stone-900 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing Chunks & Synthesizing Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {generatedQuestions.length > 0 ? 'Re-generate Questions' : 'Generate Questions'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Questions Preview & Review List */}
              {generatedQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-stone-900">
                        Generated Questions Preview ({generatedQuestions.length})
                      </span>
                    </div>

                    {/* Target Topic Selection for Database Linkage */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-600 shrink-0">Save under Topic:</span>
                      <select
                        value={selectedTargetTopicId || ''}
                        onChange={(e) => setSelectedTargetTopicId(Number(e.target.value))}
                        className="px-3 py-1.5 bg-yellow-50/80 border border-yellow-300/80 rounded-xl text-xs font-bold text-stone-800 max-w-xs truncate focus:outline-hidden"
                      >
                        {modalDisplayTopics.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.boardName} &bull; {t.className} &bull; {t.subjectName} &bull; {t.chapterName ? `${t.chapterName} - ` : ''}{t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {generatedQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2 hover:border-yellow-300 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${q.type === 'MCQ' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              q.type === 'SAQ' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                q.type === 'NUMERICAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                              Q{idx + 1} &bull; {q.type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${q.difficulty === 'hard'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : q.difficulty === 'medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveGeneratedQuestion(idx)}
                            className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Remove this question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Editable Question Text */}
                        <textarea
                          value={q.question}
                          onChange={(e) => handleUpdateGeneratedQuestion(idx, { question: e.target.value })}
                          rows={2}
                          className="w-full p-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />

                        {/* Options Display for MCQ vs Direct Answer for SAQ/Numerical/Objective */}
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = opt.trim().toLowerCase().startsWith(q.correct_answer.toLowerCase()) ||
                                opt.trim().toLowerCase().includes(q.correct_answer.toLowerCase()) ||
                                (q.correct_answer.toUpperCase() === String.fromCharCode(65 + optIdx));
                              return (
                                <div
                                  key={optIdx}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-between ${isCorrect
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                    : 'bg-stone-50 text-stone-700 border-stone-200/70'
                                    }`}
                                >
                                  <span>{opt}</span>
                                  {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs font-semibold text-emerald-900 flex items-start gap-2">
                            <span className="shrink-0 font-bold text-emerald-700">🎯 Correct Answer / Solution:</span>
                            <span className="font-bold text-emerald-950">{q.correct_answer}</span>
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="p-2 rounded-xl bg-yellow-50/60 border border-yellow-200/60 text-[11px] text-yellow-900 font-medium">
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {generatedQuestions.length > 0 ? `${generatedQuestions.length} questions ready to save` : 'Select settings and click generate'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGeneratorModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestionsToBank}
                  disabled={generatedQuestions.length === 0 || isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-900 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save to Question Bank
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
