import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
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
  id?: string;
  question: string;
  type: string;
  difficulty: string;
  marks?: number;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  topic_suggested?: string;
  is_duplicate?: boolean;
  source?: string;
  source_file?: string;
}

interface PreviewExtractionData {
  filename: string;
  board: string;
  classGrade: string;
  subject: string;
  documentType: string;
  cleaned_text?: string;
  topic_id?: number | null;
  topic_name?: string;
  title?: string;
  summary?: string;
  detected_topics?: any[];
  total_extracted?: number;
  new_questions_count?: number;
  duplicate_questions_count?: number;
  filesData?: any[];
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

  // Master Data Dynamic State (from DB /api/v1/master/board_class_dropdown and /api/v1/master/curriculum-options)
  const [activeBoards, setActiveBoards] = useState<MasterBoard[]>([]);
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>(BOARD_CLASSES_MAP);
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

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
    lastError: string | null;
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
    lastError: null,
    logs: [],
    results: []
  });

  // Dynamic allowed classes strictly determined by Board mapping from database
  const availableClasses: string[] = (boardClassesMap && boardClassesMap[selectedBoard]) || BOARD_CLASSES_MAP[selectedBoard] || [
    'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];

  // Dynamic allowed subjects strictly determined by database subject master
  const availableSubjects: string[] = dbSubjects.length > 0 ? dbSubjects : (CLASS_SUBJECTS_MAP[selectedGrade] || [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Science', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'
  ]);

  // Dynamic Subject fetching from database based on selected board and grade
  useEffect(() => {
    let isMounted = true;
    if (!selectedGrade) return;

    setIsLoadingSubjects(true);
    ApiServices.getCurriculumOptions({
      board: selectedBoard,
      classGrade: selectedGrade,
    })
      .then((res: any) => {
        if (!isMounted) return;
        const fetched: any[] = res?.subjects || res?.data?.subjects || [];
        const subjectNames: string[] = fetched.map((s: any) => s.name || s.subject_name).filter(Boolean);
        if (subjectNames.length > 0) {
          setDbSubjects(subjectNames);
          setSelectedSubject((prev) => (subjectNames.includes(prev) ? prev : subjectNames[0]));
        } else {
          const fallback = CLASS_SUBJECTS_MAP[selectedGrade] || ['Mathematics'];
          setDbSubjects(fallback);
          setSelectedSubject((prev) => (fallback.includes(prev) ? prev : fallback[0]));
        }
      })
      .catch((err) => {
        console.warn('Failed to load database curriculum subjects for AI & RAG:', err);
        if (isMounted) {
          const fallback = CLASS_SUBJECTS_MAP[selectedGrade] || ['Mathematics'];
          setDbSubjects(fallback);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBoard, selectedGrade]);

  const handleBoardChange = (newBoard: string) => {
    setSelectedBoard(newBoard);
    const validClasses = (boardClassesMap && boardClassesMap[newBoard]) || BOARD_CLASSES_MAP[newBoard] || ['Class 10'];
    const newClass = validClasses.includes(selectedGrade) ? selectedGrade : (validClasses[0] || 'Class 10');
    setSelectedGrade(newClass);
  };

  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
  };

  // Playground State
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testingLlm, setTestingLlm] = useState(false);

  // AI Question Generator / Review Modal State
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [activeDocForGen, setActiveDocForGen] = useState<RagDocument | null>(null);
  const [extractedPreviewData, setExtractedPreviewData] = useState<PreviewExtractionData | null>(null);
  const [genCount, setGenCount] = useState<number>(5);
  const [genType, setGenType] = useState<string>('ALL');
  const [genDifficulty, setGenDifficulty] = useState<string>('ALL');
  const [genInstructions, setGenInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [selectedTargetTopicId, setSelectedTargetTopicId] = useState<number | null>(null);
  const [flatTopics, setFlatTopics] = useState<FlatTopic[]>([]);
  const [ingestionSummary, setIngestionSummary] = useState<{
    topic_name: string;
    total_processed: number;
    inserted_count: number;
    updated_count: number;
    duplicate_skipped_count: number;
    message: string;
  } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Vector Repository Documents Pagination (10 per page)
  const [docPage, setDocPage] = useState<number>(1);
  const DOCS_PER_PAGE = 10;

  const totalDocs = ragStatus?.documents?.length || 0;
  const totalDocPages = Math.max(1, Math.ceil(totalDocs / DOCS_PER_PAGE));
  const currentDocPage = Math.min(Math.max(1, docPage), totalDocPages);

  const paginatedDocuments = useMemo(() => {
    if (!ragStatus?.documents || ragStatus.documents.length === 0) return [];
    const start = (currentDocPage - 1) * DOCS_PER_PAGE;
    return ragStatus.documents.slice(start, start + DOCS_PER_PAGE);
  }, [ragStatus?.documents, currentDocPage]);

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

  // Auto-sync selectedTargetTopicId whenever selectedBoard, selectedGrade, or selectedSubject changes
  useEffect(() => {
    if (flatTopics.length === 0) return;
    const bLower = selectedBoard.toLowerCase().trim();
    const gLower = selectedGrade.toLowerCase().trim();
    const sLower = selectedSubject.toLowerCase().trim();

    const matched = flatTopics.find(t => 
      t.boardName.toLowerCase().trim() === bLower &&
      (t.className.toLowerCase().trim() === gLower || t.className.toLowerCase().replace('class ', '').trim() === gLower.replace('class ', '')) &&
      (t.subjectName.toLowerCase().trim() === sLower || (sLower === 'science' && ['physics', 'chemistry', 'biology', 'science'].includes(t.subjectName.toLowerCase().trim())))
    );

    if (matched) {
      setSelectedTargetTopicId(matched.id);
    }
  }, [selectedBoard, selectedGrade, selectedSubject, flatTopics]);

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
      percent: 0,
      completed: 0,
      remaining: totalFiles,
      currentStepName: `[File 1/${totalFiles}] Step 0: Reading text & validating subject matching with '${selectedSubject}'... (0%)`,
      lastError: null,
      logs: [
        `[INITIALIZE] Uploading and extracting preview across ${totalFiles} file(s)...`,
        `[CONFIG] Target: Board=[${selectedBoard}] | Class=[${selectedGrade}] | Subject=[${selectedSubject}] | Mode=[${documentType.toUpperCase()}]`,
      ],
      results: []
    };
    setBatchProgress(initialProgress);

    const allExtractedQuestions: GeneratedQuestionItem[] = [];
    const allPreviewFiles: any[] = [];
    let totalNew = 0;
    let totalDupe = 0;
    let resolvedTopicId: number | null = selectedTargetTopicId;
    let lastErrorOccurred: string | null = null;
    let successFileCount = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = uploadFiles[i];
      const fileNum = i + 1;
      const progressPercent = Math.round((i / totalFiles) * 80);

      setBatchProgress((prev) => ({
        ...prev,
        current: fileNum,
        filename: file.name,
        percent: progressPercent,
        currentStepName: `[File ${fileNum}/${totalFiles}] Parsing & extracting questions from '${file.name}'...`,
        logs: [
          ...prev.logs,
          `\n>>> [FILE ${fileNum}/${totalFiles}]: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
        ]
      }));

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('board', selectedBoard);
        formData.append('classGrade', selectedGrade);
        formData.append('subject', selectedSubject);
        formData.append('documentType', documentType);
        if (resolvedTopicId) {
          formData.append('topicId', String(resolvedTopicId));
        }

        const res = await ApiServices.extractCurriculumPreview(formData);
        const data = res?.data !== undefined ? res.data : res;

        const questionsList: GeneratedQuestionItem[] = (data?.questions || []).map((q: any) => ({
          ...q,
          source_file: file.name
        }));
        const newCount = data?.new_questions_count || questionsList.filter(q => !q.is_duplicate).length;
        const dupeCount = data?.duplicate_questions_count || questionsList.filter(q => q.is_duplicate).length;

        totalNew += newCount;
        totalDupe += dupeCount;
        allExtractedQuestions.push(...questionsList);
        successFileCount += 1;

        if (data?.topic_id && !resolvedTopicId) {
          resolvedTopicId = data.topic_id;
          setSelectedTargetTopicId(data.topic_id);
        }

        allPreviewFiles.push({
          filename: data?.filename || file.name,
          board: data?.board || selectedBoard,
          classGrade: data?.classGrade || selectedGrade,
          subject: data?.subject || selectedSubject,
          documentType: data?.documentType || documentType,
          cleaned_text: data?.cleaned_text || '',
          title: data?.title || file.name,
          summary: data?.summary || '',
          detected_topics: data?.detected_topics || [],
          questions: questionsList
        });

        setBatchProgress((prev) => ({
          ...prev,
          completed: successFileCount,
          remaining: totalFiles - successFileCount,
          percent: Math.round((fileNum / totalFiles) * 80),
          logs: [
            ...prev.logs,
            `  ↳ [Subject Match] Verified: "${data?.subject || selectedSubject}" | Title: "${data?.title || file.name}"`,
            `  ↳ [Extracted] ${questionsList.length} questions (${newCount} new, ${dupeCount} duplicates).`
          ]
        }));
      } catch (err: any) {
        console.error(`Error extracting preview for ${file.name}:`, err);
        const errMsg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Processing failed';
        lastErrorOccurred = errMsg;
        setBatchProgress((prev) => ({
          ...prev,
          lastError: errMsg,
          logs: [
            ...prev.logs,
            `  ❌ [ERROR] ${file.name}: ${errMsg}`
          ]
        }));
      }
    }

    if (allExtractedQuestions.length > 0) {
      setExtractedPreviewData({
        filename: totalFiles === 1 ? uploadFiles[0].name : `${totalFiles} Uploaded Files (${successFileCount} processed)`,
        board: selectedBoard,
        classGrade: selectedGrade,
        subject: selectedSubject,
        documentType: documentType,
        cleaned_text: allPreviewFiles.map(f => f.cleaned_text).filter(Boolean).join('\n\n--- NEXT DOCUMENT ---\n\n'),
        topic_id: resolvedTopicId,
        topic_name: '',
        title: totalFiles === 1 ? allPreviewFiles[0]?.title : `${selectedSubject} Question Bank (${successFileCount} Chapters/Files)`,
        summary: allPreviewFiles.map(f => f.summary).filter(Boolean).join(' '),
        detected_topics: Array.from(new Set(allPreviewFiles.flatMap(f => f.detected_topics || []))),
        total_extracted: allExtractedQuestions.length,
        new_questions_count: totalNew,
        duplicate_questions_count: totalDupe,
        filesData: allPreviewFiles,
      });

      setGeneratedQuestions(allExtractedQuestions);
      setActiveDocForGen(null);

      setBatchProgress((prev) => ({
        ...prev,
        percent: 80,
        isRunning: false,
        currentStepName: `✨ Steps 1-4 Complete: ${allExtractedQuestions.length} questions extracted across ${successFileCount} file(s) (${totalNew} new, ${totalDupe} duplicates). Review modal opened.`,
        logs: [
          ...prev.logs,
          `\n✔ [PREVIEW READY] Aggregated ${allExtractedQuestions.length} questions from ${successFileCount} file(s). Review and confirm in modal to commit to database.`
        ]
      }));

      setGeneratorModalOpen(true);
      showNotify('success', `✨ Extracted ${allExtractedQuestions.length} questions from ${successFileCount} file(s). Review and confirm to save.`);
    } else {
      setBatchProgress((prev) => ({
        ...prev,
        percent: 0,
        isRunning: false,
        currentStepName: `❌ Ingestion failed: ${lastErrorOccurred || 'No questions could be extracted.'} (0%)`,
        logs: [
          ...prev.logs,
          `\n❌ Failed to extract questions from uploaded file(s).`
        ]
      }));
    }

    setUploading(false);
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

  // Open Question Generator / Inspector Modal for a document
  const openQuestionGenerator = (doc: RagDocument) => {
    setActiveDocForGen(doc);
    setExtractedPreviewData(null);
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
    const targetBoard = (extractedPreviewData?.board || activeDocForGen?.board || '').toLowerCase().trim();
    const targetGrade = (extractedPreviewData?.classGrade || activeDocForGen?.classGrade || '').toLowerCase().trim();
    const targetSubject = (extractedPreviewData?.subject || activeDocForGen?.subject || '').toLowerCase().trim();

    if (!targetBoard && !targetGrade && !targetSubject) return flatTopics;

    // 1. Exact match or Science alias match
    let matching = flatTopics.filter(t => {
      const bMatch = !targetBoard || t.boardName.toLowerCase().trim() === targetBoard;
      const cMatch = !targetGrade || t.className.toLowerCase().trim() === targetGrade;
      const sMatch = !targetSubject || t.subjectName.toLowerCase().trim() === targetSubject ||
        (targetSubject === 'science' && ['physics', 'chemistry', 'biology', 'science', 'physical science', 'life science'].includes(t.subjectName.toLowerCase().trim()));
      return bMatch && cMatch && sMatch;
    });

    // 2. Fallback: match Board + Class
    if (matching.length === 0 && targetBoard && targetGrade) {
      matching = flatTopics.filter(
        t => t.boardName.toLowerCase().trim() === targetBoard &&
          t.className.toLowerCase().trim() === targetGrade
      );
    }

    // 3. Fallback: match Board only
    if (matching.length === 0 && targetBoard) {
      matching = flatTopics.filter(t => t.boardName.toLowerCase().trim() === targetBoard);
    }

    return matching.length > 0 ? matching : flatTopics;
  }, [flatTopics, activeDocForGen, extractedPreviewData]);

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

  // Save generated / extracted questions to question_master, ChromaDB, and ArangoDB
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
      let data: any;
      if (extractedPreviewData) {
        // Step 5: Execute complete pipeline with duplicate skipping, vector chunking, and K-Graph syncing
        const res = await ApiServices.saveExtractedCurriculumQuestions({
          filename: extractedPreviewData.filename,
          board: extractedPreviewData.board,
          classGrade: extractedPreviewData.classGrade,
          subject: extractedPreviewData.subject,
          documentType: extractedPreviewData.documentType,
          cleanedText: extractedPreviewData.cleaned_text,
          topicId: selectedTargetTopicId,
          questions: generatedQuestions,
          detectedTopics: extractedPreviewData.detected_topics,
          title: extractedPreviewData.title,
          summary: extractedPreviewData.summary,
          files: extractedPreviewData.filesData,
        } as any);
        data = res?.data || res;
      } else {
        const res = await ApiServices.saveRagQuestions({
          topic_id: selectedTargetTopicId,
          questions: generatedQuestions
        });
        data = res?.data || res;
      }

      setIngestionSummary({
        topic_name: data?.topic_name || 'Selected Topic',
        total_processed: data?.total_processed || generatedQuestions.length,
        inserted_count: data?.inserted_count !== undefined ? data.inserted_count : generatedQuestions.length,
        updated_count: data?.updated_count || 0,
        duplicate_skipped_count: data?.duplicate_skipped_count || 0,
        message: data?.message || 'Successfully saved questions into MySQL Question Bank, indexed ChromaDB vector chunks, and synced ArangoDB Knowledge Graph!'
      });

      showNotify('success', data?.message || `Successfully committed ${generatedQuestions.length} questions!`);
      setGeneratorModalOpen(false);
      setGeneratedQuestions([]);
      setExtractedPreviewData(null);
      setUploadFiles([]);
      fetchRagStatus();

      setBatchProgress((prev) => ({
        ...prev,
        isRunning: false,
        percent: 100,
        completed: 1,
        remaining: 0,
        currentStepName: `✔ Step 5 Complete: Database insertion & Vector indexing successful! (${data?.inserted_count || 0} inserted, ${data?.duplicate_skipped_count || 0} duplicate skipped)`,
        logs: [
          ...prev.logs,
          `\n🎉 [ALL COMPLETED] Successfully saved questions into question_master (Topic ID: ${selectedTargetTopicId}).`,
          `  ↳ ChromaDB Vector chunks indexed.`,
          `  ↳ ArangoDB Knowledge Graph synchronized.`
        ]
      }));
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
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all max-w-md ${notification.type === 'success'
          ? 'bg-emerald-500/90 text-white border-emerald-400'
          : 'bg-rose-500/90 text-white border-rose-400'
          }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-semibold leading-snug">{notification.message}</span>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">Class / Grade</label>
                    {isLoadingMasters && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Syncing...</span>}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">Subject</label>
                    {isLoadingSubjects && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Syncing...</span>}
                  </div>
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

              {/* PDF & DOCX Document Dropzone */}
              <div className="relative border-2 border-dashed border-stone-300 rounded-2xl p-5 text-center hover:border-yellow-400 transition-colors bg-stone-50/50">
                <input
                  type="file"
                  id="curriculum-upload-input"
                  multiple
                  accept=".pdf,.docx,.doc"
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
                  <p className="text-[10px] text-stone-400 font-medium">Supports multiple PDF, Word (.docx/.doc) files</p>
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


              {/* Multi-File Progress Bar Card (Modern Theme) */}
              {(batchProgress.isRunning || batchProgress.results.length > 0 || batchProgress.lastError || batchProgress.logs.length > 0) && (
                <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-xs space-y-3 ${
                  batchProgress.lastError
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-stone-50 border-stone-200'
                }`}>
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className={`w-4 h-4 ${
                        batchProgress.lastError
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      } ${batchProgress.isRunning ? 'animate-spin' : ''}`} />
                      <span className="text-xs font-bold text-stone-800">
                        {batchProgress.isRunning
                          ? `Processing File ${batchProgress.current} of ${batchProgress.total}`
                          : batchProgress.lastError
                          ? 'Validation Blocked'
                          : 'Batch Ingestion Complete'}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                      batchProgress.lastError
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {batchProgress.percent}%
                    </span>
                  </div>

                  {/* Clean Modern Progress Bar */}
                  <div className="w-full bg-stone-200/80 h-2.5 rounded-full overflow-hidden border border-stone-300/50">
                    <div
                      className={`h-full transition-all duration-300 ease-out ${
                        batchProgress.lastError
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500'
                      }`}
                      style={{ width: `${Math.max(batchProgress.percent, batchProgress.lastError ? 100 : 0)}%` }}
                    />
                  </div>

                  {/* Badge Metrics */}
                  <div className="flex items-center justify-between text-[11px] text-stone-600 pt-0.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Completed: <strong className="text-stone-900 font-bold">{batchProgress.completed}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      Remaining: <strong className="text-stone-900 font-bold">{batchProgress.remaining}</strong>
                    </span>
                    <span className="text-stone-500 font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      Total: {batchProgress.total} Files
                    </span>
                  </div>

                  {/* Inline Compact Error Box inside Card */}
                  {batchProgress.lastError && (
                    <div className="p-3 bg-rose-100/80 border border-rose-300/70 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="font-bold text-rose-900 block text-xs">Content Mismatch Error</span>
                        <p className="text-[11px] text-rose-800 leading-snug">{batchProgress.lastError}</p>
                      </div>
                    </div>
                  )}

                  {/* Current Active Step Pill */}
                  <p className={`text-[11px] font-mono truncate px-3 py-1.5 rounded-xl border ${
                    batchProgress.lastError
                      ? 'text-rose-900 bg-rose-100/70 border-rose-200/80 font-medium'
                      : 'text-stone-800 bg-amber-50/80 border-amber-200/80 font-medium'
                  }`}>
                    {batchProgress.currentStepName}
                  </p>

                  {/* Modern Light Clean Log Box */}
                  <div className="bg-white border border-stone-200/90 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-[11px] text-stone-700 space-y-1.5 shadow-2xs custom-scrollbar">
                    {batchProgress.logs.map((log, lIdx) => {
                      const isErr = log.includes('❌') || log.includes('BLOCKED') || log.includes('ERROR');
                      const isSuccess = log.includes('✔') || log.includes('🎉') || log.includes('SUCCESS');
                      return (
                        <div
                          key={lIdx}
                          className={`leading-relaxed whitespace-pre-wrap text-[11px] ${
                            isErr
                              ? 'text-rose-700 font-bold bg-rose-50/90 p-1.5 rounded-lg border border-rose-200/60'
                              : isSuccess
                              ? 'text-emerald-800 font-bold bg-emerald-50/90 p-1.5 rounded-lg border border-emerald-200/60'
                              : 'text-stone-600'
                          }`}
                        >
                          {log}
                        </div>
                      );
                    })}
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
                    Extracting & Calibrating Questions (Steps 1-4)...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Extract & Review Questions (AI Preview)
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
              <>
                <div className="divide-y divide-stone-100">
                  {paginatedDocuments.map((doc) => (
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hidden sm:inline-flex">
                          ✓ Synced
                        </span>

                        {/* ⚡ Inspect / Synthesize Questions Action Button */}
                        <button
                          type="button"
                          onClick={() => openQuestionGenerator(doc)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                          title="Inspect or synthesize AI Questions from this document into question_master"
                        >
                          <Zap className="w-4 h-4 text-amber-600 stroke-[2.2]" />
                          <span>Inspect / Synthesize Questions</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                          title="Remove Document"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 10-Item Pagination Controls */}
                {totalDocPages > 1 && (
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-stone-500 font-medium">
                      Showing <strong className="text-stone-800 font-bold">{(currentDocPage - 1) * DOCS_PER_PAGE + 1}</strong> to{' '}
                      <strong className="text-stone-800 font-bold">{Math.min(currentDocPage * DOCS_PER_PAGE, totalDocs)}</strong> of{' '}
                      <strong className="text-stone-800 font-bold">{totalDocs}</strong> documents
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDocPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentDocPage <= 1}
                        className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalDocPages }, (_, i) => i + 1).map((p) => {
                          if (
                            totalDocPages <= 7 ||
                            p === 1 ||
                            p === totalDocPages ||
                            (p >= currentDocPage - 1 && p <= currentDocPage + 1)
                          ) {
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setDocPage(p)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  p === currentDocPage
                                    ? 'bg-amber-400 text-stone-900 shadow-2xs'
                                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/80'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          } else if (
                            (p === currentDocPage - 2 && p > 1) ||
                            (p === currentDocPage + 2 && p < totalDocPages)
                          ) {
                            return <span key={p} className="text-stone-400 text-xs px-1">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setDocPage((prev) => Math.min(totalDocPages, prev + 1))}
                        disabled={currentDocPage >= totalDocPages}
                        className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
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
          MODAL: AI QUESTION REVIEW & GENERATOR CONSOLE
         ───────────────────────────────────────────────────────────── */}
      {generatorModalOpen && (activeDocForGen || extractedPreviewData) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-yellow-50/90 to-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-xs">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                    <span>
                      {extractedPreviewData
                        ? 'AI Question Extraction & Review Console'
                        : 'AI Question Generator from Document'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-200/70 text-yellow-900 border border-yellow-300">
                      {extractedPreviewData ? 'Upload Preview' : 'Auto-Synthesis'}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-600 truncate max-w-xl">
                    Source: <strong className="text-stone-800">{extractedPreviewData?.filename || activeDocForGen?.filename}</strong> ({extractedPreviewData?.board || activeDocForGen?.board} &bull; {extractedPreviewData?.classGrade || activeDocForGen?.classGrade} &bull; {extractedPreviewData?.subject || activeDocForGen?.subject})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGeneratorModalOpen(false);
                  setExtractedPreviewData(null);
                  setActiveDocForGen(null);
                }}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* If Active Doc Synthesis Mode: Show Controls */}
              {activeDocForGen && (
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
                        <option value="SAQ">SAQ (Short Answer Question - 2M)</option>
                        <option value="SHORT ANSWER (3M)">Short Answer (3M)</option>
                        <option value="CASE STUDY">Case Study (4M)</option>
                        <option value="LONG ANSWER">Long Answer (5M)</option>
                        <option value="NUMERICAL">Numerical (Calculation Based)</option>
                        <option value="ASSERTION REASON">Assertion Reason (1M)</option>
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
              )}

              {/* If Extracted Preview Mode: Summary Banner with Duplicate Protection Stats */}
              {extractedPreviewData && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-stone-900">
                        Calibrated Extraction Preview ({generatedQuestions.length} Questions)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✨ {generatedQuestions.filter(q => !q.is_duplicate).length} New Questions
                      </span>
                      {generatedQuestions.some(q => q.is_duplicate) && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠️ {generatedQuestions.filter(q => q.is_duplicate).length} Existing in Database (Duplicate Protection Active)
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium">
                    Review and edit question text, marks (1M-8M), options, and explanations below before confirming database insertion.
                  </p>
                </div>
              )}

              {/* Generated / Extracted Questions Preview & Review List */}
              {generatedQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-stone-900">
                        Question Review List ({generatedQuestions.length})
                      </span>
                    </div>

                    {/* Target Topic Selection for Database Linkage */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-600 shrink-0">Target Topic:</span>
                      <select
                        value={selectedTargetTopicId || ''}
                        onChange={(e) => setSelectedTargetTopicId(Number(e.target.value))}
                        className="px-3 py-1.5 bg-yellow-50/80 border border-yellow-300/80 rounded-xl text-xs font-bold text-stone-800 max-w-xs truncate focus:outline-hidden cursor-pointer"
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
                      <div
                        key={q.id || idx}
                        className={`p-4 rounded-2xl bg-white border shadow-2xs space-y-3 transition-colors ${
                          q.is_duplicate
                            ? 'border-amber-300/80 bg-amber-50/20'
                            : 'border-stone-200/90 hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Question Number */}
                            <span className="text-xs font-black text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                              #{idx + 1}
                            </span>

                            {/* Marks Selector */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-stone-500">Marks:</span>
                              <select
                                value={q.marks || (q.type === 'LONG ANSWER' ? 5 : q.type === 'SAQ' ? 2 : q.type === 'SHORT ANSWER (3M)' ? 3 : q.type === 'CASE STUDY' ? 4 : 1)}
                                onChange={(e) => handleUpdateGeneratedQuestion(idx, { marks: Number(e.target.value) })}
                                className="text-[11px] font-black px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 border border-yellow-300 font-mono cursor-pointer"
                              >
                                <option value={1}>1 Mark</option>
                                <option value={2}>2 Marks</option>
                                <option value={3}>3 Marks</option>
                                <option value={4}>4 Marks</option>
                                <option value={5}>5 Marks</option>
                                <option value={8}>8 Marks</option>
                              </select>
                            </div>

                            {/* Question Type Selector */}
                            <select
                              value={q.type || 'MCQ'}
                              onChange={(e) => handleUpdateGeneratedQuestion(idx, { type: e.target.value })}
                              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 cursor-pointer"
                            >
                              <option value="MCQ">MCQ (Multiple Choice)</option>
                              <option value="SAQ">SAQ (Short Answer - 2M)</option>
                              <option value="SHORT ANSWER (3M)">Short Answer (3M)</option>
                              <option value="CASE STUDY">Case Study (4M)</option>
                              <option value="LONG ANSWER">Long Answer (5M)</option>
                              <option value="NUMERICAL">Numerical</option>
                              <option value="ASSERTION REASON">Assertion Reason (1M)</option>
                              <option value="OBJECTIVE">Objective (1M)</option>
                              <option value="LONG EVALUATIVE">Long Evaluative (8M)</option>
                            </select>

                            {/* Difficulty Selector */}
                            <select
                              value={q.difficulty || 'medium'}
                              onChange={(e) => handleUpdateGeneratedQuestion(idx, { difficulty: e.target.value })}
                              className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md border cursor-pointer ${
                                q.difficulty === 'hard'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : q.difficulty === 'medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>

                            {/* Duplicate Flag Badge */}
                            {q.is_duplicate ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                ⚠️ Duplicate in DB (Will Skip/Update)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                                ✨ New Question
                              </span>
                            )}

                            {/* Source File Badge */}
                            {q.source_file && (
                              <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 truncate max-w-[200px]" title={q.source_file}>
                                📄 {q.source_file}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveGeneratedQuestion(idx)}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center"
                            title="Remove this question"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                        </div>

                        {/* Editable Question Text */}
                        <textarea
                          value={q.question}
                          onChange={(e) => handleUpdateGeneratedQuestion(idx, { question: e.target.value })}
                          rows={2}
                          className="w-full p-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="Enter question text..."
                        />

                        {/* Options Display for MCQ vs Direct Answer for SAQ/Numerical/Objective */}
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = (q.correct_answer || '').trim().toLowerCase().startsWith(opt.trim().toLowerCase()) ||
                                opt.trim().toLowerCase().includes((q.correct_answer || '').toLowerCase()) ||
                                ((q.correct_answer || '').toUpperCase() === String.fromCharCode(65 + optIdx));
                              return (
                                <div
                                  key={optIdx}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                                    isCorrect
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                      : 'bg-stone-50 text-stone-700 border-stone-200/70'
                                  }`}
                                >
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const updatedOpts = [...(q.options || [])];
                                      updatedOpts[optIdx] = e.target.value;
                                      handleUpdateGeneratedQuestion(idx, { options: updatedOpts });
                                    }}
                                    className="bg-transparent border-none outline-none w-full text-xs font-medium text-stone-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateGeneratedQuestion(idx, { correct_answer: opt })}
                                    className={`shrink-0 ml-2 p-1 rounded-md text-[10px] font-bold ${
                                      isCorrect ? 'text-emerald-700 bg-emerald-100' : 'text-stone-400 hover:text-stone-700'
                                    }`}
                                    title="Mark as correct answer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs font-semibold text-emerald-900 space-y-1">
                            <span className="shrink-0 font-bold text-emerald-800 block text-[11px]">🎯 Correct Answer / Solution:</span>
                            <input
                              type="text"
                              value={q.correct_answer || ''}
                              onChange={(e) => handleUpdateGeneratedQuestion(idx, { correct_answer: e.target.value })}
                              className="w-full bg-white/90 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-950 focus:outline-none"
                              placeholder="Enter correct solution / marking criteria..."
                            />
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="p-2.5 rounded-xl bg-yellow-50/60 border border-yellow-200/60 space-y-1">
                          <span className="text-[11px] font-bold text-yellow-900 block">💡 Explanation & Diagnostic Notes:</span>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => handleUpdateGeneratedQuestion(idx, { explanation: e.target.value })}
                            className="w-full bg-white/90 border border-yellow-300 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-800 focus:outline-none"
                            placeholder="Add explanation or step-by-step resolution..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Question Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newQ: GeneratedQuestionItem = {
                          id: `custom_${Date.now()}`,
                          question: '',
                          type: 'MCQ',
                          marks: 1,
                          difficulty: 'medium',
                          options: ['Option A', 'Option B', 'Option C', 'Option D'],
                          correct_answer: 'Option A',
                          explanation: '',
                          is_duplicate: false
                        };
                        setGeneratedQuestions(prev => [...prev, newQ]);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-600" />
                      <span>+ Add Custom Question</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {generatedQuestions.length > 0
                  ? `${generatedQuestions.length} questions ready to commit (Duplicate protection active)`
                  : 'Select settings and click generate'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setGeneratorModalOpen(false);
                    setExtractedPreviewData(null);
                    setActiveDocForGen(null);
                  }}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestionsToBank}
                  disabled={generatedQuestions.length === 0 || isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-900 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database & Indexing Chunks...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Ingest to Question Bank
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INGESTION SUMMARY MODAL (AI / RAG DEDUPLICATION STATS)
         ───────────────────────────────────────────────────────────── */}
      {ingestionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">AI Ingestion Completed</h3>
                  <p className="text-[11px] text-stone-500 font-medium">{ingestionSummary.topic_name}</p>
                </div>
              </div>
              <button
                onClick={() => setIngestionSummary(null)}
                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              {ingestionSummary.message}
            </p>

            {/* 4-Metric Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80 text-center">
                <p className="text-[9px] text-stone-400 font-extrabold uppercase">Total</p>
                <p className="text-sm font-black text-stone-900">{ingestionSummary.total_processed}</p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 text-center">
                <p className="text-[9px] text-emerald-600 font-extrabold uppercase">Inserted</p>
                <p className="text-sm font-black text-emerald-700">+{ingestionSummary.inserted_count}</p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-center">
                <p className="text-[9px] text-amber-600 font-extrabold uppercase">Updated</p>
                <p className="text-sm font-black text-amber-700">{ingestionSummary.updated_count}</p>
              </div>
              <div className="bg-stone-100 p-2.5 rounded-2xl border border-stone-300 text-center">
                <p className="text-[9px] text-stone-500 font-extrabold uppercase">Duplicates</p>
                <p className="text-sm font-black text-stone-700">{ingestionSummary.duplicate_skipped_count}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIngestionSummary(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
              >
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
