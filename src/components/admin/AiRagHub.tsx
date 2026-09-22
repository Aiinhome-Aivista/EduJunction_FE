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
  BookmarkCheck
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
  const [activeTab, setActiveTab] = useState<'ingestion' | 'playground'>('ingestion');
  const [ragStatus, setRagStatus] = useState<RagStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Master Data Dynamic State (from DB /api/v1/master/board_class_dropdown)
  const [activeBoards, setActiveBoards] = useState<MasterBoard[]>([]);
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>(BOARD_CLASSES_MAP);
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);

  // Ingestion Form State (Single & Multi-File Support)
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<'textbook' | 'old_question_paper'>('textbook');
  const [selectedBoard, setSelectedBoard] = useState<string>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<string>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [uploading, setUploading] = useState(false);

  // Multi-File Pipeline Batch Progress State
  const [batchProgress, setBatchProgress] = useState<{
    isRunning: boolean;
    current: number;
    total: number;
    filename: string;
    percent: number;
    completed: number;
    remaining: number;
    currentStepName: string;
    logs: string[];
    results: any[];
  }>({
    isRunning: false,
    current: 0,
    total: 0,
    filename: '',
    percent: 0,
    completed: 0,
    remaining: 0,
    currentStepName: '',
    logs: [],
    results: []
  });

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

  // Real-time metadata mismatch detection from primary file
  const primaryFile = uploadFiles[0] || null;
  const detectedMeta = React.useMemo(() => {
    if (!primaryFile) return null;
    const fn = primaryFile.name.replace(/[-_.]/g, ' ').toLowerCase();
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
  }, [primaryFile]);

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

  const hasFilenameMismatch = Boolean(primaryFile && (isBoardMismatch || isClassMismatch || isSubjectMismatch));

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

  const handleProcessPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) return;

    setUploading(true);
    const totalFiles = uploadFiles.length;
    const initialProgress = {
      isRunning: true,
      current: 1,
      total: totalFiles,
      filename: uploadFiles[0].name,
      percent: 5,
      completed: 0,
      remaining: totalFiles,
      currentStepName: 'Step 1: Reading file & extracting text...',
      logs: [`[INITIALIZE] Starting batch ingestion of ${totalFiles} file(s)...`],
      results: []
    };
    setBatchProgress(initialProgress);

    const resultsArr: any[] = [];
    let totalAddedQuestions = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = uploadFiles[i];
      const fileNum = i + 1;
      const pct = Math.round(((i) / totalFiles) * 100);

      setBatchProgress((prev) => ({
        ...prev,
        current: fileNum,
        filename: file.name,
        percent: Math.max(pct, 10),
        completed: i,
        remaining: totalFiles - i,
        currentStepName: `[File ${fileNum}/${totalFiles}] Step 1: Extracting text from ${file.name}...`,
        logs: [...prev.logs, `\n>>> [FILE ${fileNum}/${totalFiles}] Starting pipeline for: ${file.name}`]
      }));

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('board', selectedBoard);
        formData.append('classGrade', selectedGrade);
        formData.append('subject', selectedSubject);
        formData.append('documentType', documentType);
        if (selectedTargetTopicId) {
          formData.append('topicId', String(selectedTargetTopicId));
        }

        setBatchProgress((prev) => ({
          ...prev,
          currentStepName: `[File ${fileNum}/${totalFiles}] Step 2 & 3: Contextual analysis & question extraction...`,
          logs: [...prev.logs, `  ↳ [Step 1] Text extracted successfully. Running AI contextual analysis...`]
        }));

        const res = await ApiServices.processDocumentPipeline(formData);

        const extractedCount = res?.total_extracted || res?.questions?.length || 0;
        const insertedCount = res?.questions_inserted || extractedCount;
        totalAddedQuestions += insertedCount;
        resultsArr.push(res);

        setBatchProgress((prev) => ({
          ...prev,
          completed: i + 1,
          remaining: totalFiles - (i + 1),
          percent: Math.round(((i + 1) / totalFiles) * 100),
          currentStepName: `[File ${fileNum}/${totalFiles}] Step 5: Database insertion complete! (${insertedCount} questions saved)`,
          logs: [
            ...prev.logs,
            `  ↳ [Step 2] Inferred Title: "${res?.title || file.name}"`,
            `  ↳ [Step 3 & 4] ${extractedCount} questions extracted and formatted into question_master schema.`,
            `  ↳ [Step 5] Saved to Database: ${insertedCount} inserted into question_master (Topic ID: ${res?.topic_id || 'Auto'}).`,
            `✔ [SUCCESS] Completed processing ${file.name}`
          ],
          results: [...resultsArr]
        }));

      } catch (err: any) {
        console.error(`Error processing file ${file.name}:`, err);
        const errMsg = err?.message || err?.response?.data?.error?.message || 'Processing failed';
        setBatchProgress((prev) => ({
          ...prev,
          logs: [...prev.logs, `❌ [ERROR] Failed to process ${file.name}: ${errMsg}`]
        }));
      }
    }

    setBatchProgress((prev) => ({
      ...prev,
      isRunning: false,
      percent: 100,
      completed: totalFiles,
      remaining: 0,
      currentStepName: `All ${totalFiles} file(s) processed! Total ${totalAddedQuestions} questions added.`,
      logs: [...prev.logs, `\n🎉 [ALL COMPLETED] Successfully processed ${totalFiles} file(s). Added ${totalAddedQuestions} questions to Question Bank.`]
    }));

    showNotify('success', `Pipeline completed! Added ${totalAddedQuestions} questions across ${totalFiles} file(s).`);
    setUploadFiles([]);
    setUploading(false);
    await fetchRagStatus();
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
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ingestion'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-800'
              }`}
          >
            <Database className="w-4 h-4 text-yellow-600" />
            Curriculum & Vector Ingestion
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
          TAB 1: PDF INGESTION & DOCUMENT REPOSITORY
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ingestion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Form & Multi-File Pipeline */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                5-Step AI Extraction Pipeline
              </div>
              <h2 className="text-base font-black text-stone-900">Ingest Curriculum & Question Papers</h2>
              <p className="text-xs text-stone-400">Upload textbooks or old question papers to extract questions, generate answers, and store into Question Bank</p>
            </div>

            <form onSubmit={handleProcessPipeline} className="space-y-4">
              {/* Document Type Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Document Mode / Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocumentType('textbook')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all ${
                      documentType === 'textbook'
                        ? 'bg-amber-500/10 border-amber-400 text-amber-900 ring-2 ring-amber-400/20'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="leading-tight">Textbook Chapter</p>
                      <p className="text-[10px] text-stone-500 font-normal">Concept & rule synthesis</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocumentType('old_question_paper')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all ${
                      documentType === 'old_question_paper'
                        ? 'bg-blue-500/10 border-blue-400 text-blue-900 ring-2 ring-blue-400/20'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="leading-tight">Old Question Paper</p>
                      <p className="text-[10px] text-stone-500 font-normal">PYQ question parsing</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Board Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">Target Board</label>
                  {isLoadingMasters && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Syncing boards...</span>}
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

              {/* Class & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Class / Grade</label>
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
              <div className="relative border-2 border-dashed border-stone-300 rounded-2xl p-5 text-center hover:border-yellow-400 transition-colors bg-stone-50/50">
                <input
                  type="file"
                  id="curriculum-upload-input"
                  multiple
                  accept=".pdf,.docx,.doc,.rtf,.txt,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const filesArr = Array.from(e.target.files);
                      setUploadFiles((prev) => [...prev, ...filesArr]);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="curriculum-upload-input" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-yellow-700">
                    <Layers className="w-5 h-5 text-yellow-600 animate-bounce" />
                  </div>
                  <p className="text-xs font-bold text-stone-800">
                    Click to browse or Drag & Drop Multiple PDF / DOCX
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium">Supports multiple PDF, Word (.docx/.doc), RTF, TXT files</p>
                </label>

                {/* Selected Files List */}
                {uploadFiles.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-200 text-left space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                      <span>{uploadFiles.length} File(s) Selected</span>
                      <button
                        type="button"
                        onClick={() => setUploadFiles([])}
                        className="text-rose-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {uploadFiles.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs">
                          <div className="flex items-center gap-2 truncate max-w-[220px]">
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                            <span className="truncate text-stone-800 font-medium">{f.name}</span>
                            <span className="text-[10px] text-stone-400">({(f.size / 1024).toFixed(0)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-stone-400 hover:text-rose-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filename & Selection Mismatch Alert Banner */}
              {hasFilenameMismatch && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-0.5">
                    <p className="font-bold text-amber-900">Curriculum Mismatch Warning</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      First file suggests: <span className="font-bold underline">{detectedMeta?.board || 'Any'} &bull; {detectedMeta?.classGrade || 'Any'} &bull; {detectedMeta?.subject || 'Any'}</span>
                      , but dropdown is currently set to <span className="font-bold">{selectedBoard} &bull; {selectedGrade} &bull; {selectedSubject}</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* Multi-File Progress Bar Card */}
              {(batchProgress.isRunning || batchProgress.results.length > 0) && (
                <div className="p-4 bg-stone-900 text-white rounded-2xl border border-stone-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className={`w-4 h-4 text-amber-400 ${batchProgress.isRunning ? 'animate-spin' : ''}`} />
                      <span className="text-xs font-bold text-stone-200">
                        {batchProgress.isRunning
                          ? `Processing File ${batchProgress.current} of ${batchProgress.total}`
                          : 'Batch Ingestion Complete'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">{batchProgress.percent}%</span>
                  </div>

                  {/* Tailwind Progress Bar */}
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden border border-stone-700">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300 ease-out"
                      style={{ width: `${batchProgress.percent}%` }}
                    />
                  </div>

                  {/* Badge Metrics */}
                  <div className="flex items-center justify-between text-[11px] text-stone-300 pt-1">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Completed: <strong className="text-white">{batchProgress.completed}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Remaining: <strong className="text-white">{batchProgress.remaining}</strong>
                    </span>
                    <span className="text-stone-400 font-mono text-[10px]">
                      Total: {batchProgress.total} Files
                    </span>
                  </div>

                  {/* Current Active Step */}
                  <p className="text-[11px] text-amber-300 font-mono truncate bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60">
                    {batchProgress.currentStepName}
                  </p>

                  {/* Live Terminal Log Box */}
                  <div className="bg-black/60 border border-stone-800 rounded-xl p-2.5 max-h-36 overflow-y-auto font-mono text-[10px] text-stone-300 space-y-1 custom-scrollbar">
                    {batchProgress.logs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-tight whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploadFiles.length === 0 || uploading}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-yellow-400 text-stone-900 hover:bg-yellow-300 transition-all disabled:opacity-50 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing {uploadFiles.length} File(s) through 5-Step Pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Process & Ingest {uploadFiles.length > 0 ? `(${uploadFiles.length} Files)` : ''}
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
