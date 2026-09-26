import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Share2,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Copy,
  Plus,
  Printer,
  ChevronRight,
  AlertCircle,
  Loader2,
  Users,
  MessageCircle,
  X,
  Trash2,
  Eye
} from 'lucide-react';
import {
  TeacherContact,
  ParentTeacherMessage,
  SharedDossier,
  PTMSchedule,
  ChildAccount,
  ParentAccount,
  ExamSubmission
} from '../types';
import ApiServices from '../services/ApiServices';

interface ParentTeacherCommunicationProps {
  parentAccount: ParentAccount;
  activeChild: ChildAccount;
  recentSubmissions: ExamSubmission[];
  onViewSubmissionReport?: (submission: ExamSubmission) => void;
}

export const ParentTeacherCommunication: React.FC<ParentTeacherCommunicationProps> = ({
  parentAccount,
  activeChild,
  recentSubmissions,
  onViewSubmissionReport
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'dossiers' | 'schedule'>('messages');

  // Dynamic Live State
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const [messages, setMessages] = useState<ParentTeacherMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedSubmissionForAttachment, setSelectedSubmissionForAttachment] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [sharedDossiers, setSharedDossiers] = useState<SharedDossier[]>([]);
  const [isLoadingDossiers, setIsLoadingDossiers] = useState(false);
  const [isCreatingDossier, setIsCreatingDossier] = useState(false);
  const [isSubmittingDossier, setIsSubmittingDossier] = useState(false);

  // Dynamic Dossier Form State
  const [dossierStudentId, setDossierStudentId] = useState<string>(String(activeChild.id));
  const selectedDossierStudent = parentAccount.children.find(c => String(c.id) === String(dossierStudentId)) || activeChild;

  const [dossierNotes, setDossierNotes] = useState(
    `Comprehensive ${activeChild.classGrade} (${activeChild.targetBoard}) Diagnostic dossier across 10-mark sprints for term review.`
  );
  const [dossierRecipientsList, setDossierRecipientsList] = useState<string[]>([
    '🏫 School Subject Teacher',
    '👨‍🏫 Math Tutor'
  ]);
  const [customRecipientInput, setCustomRecipientInput] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isPrintingDossier, setIsPrintingDossier] = useState<string | null>(null);
  const [printableDossierData, setPrintableDossierData] = useState<any | null>(null);
  const [deletingDossierId, setDeletingDossierId] = useState<string | null>(null);

  const [ptmSchedules, setPtmSchedules] = useState<PTMSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTopic, setScheduledTopic] = useState('Review Topic Mastery & Misconceptions');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // ------------------------------------------------------------
  // Live On-Demand Fetchers (Pure Live API - Zero Cache)
  // ------------------------------------------------------------
  const fetchTeachers = useCallback(async () => {
    setIsLoadingTeachers(true);
    try {
      const list = await ApiServices.listTeachers();
      const formatted = list.map((t: TeacherContact) => ({
        ...t,
        avatar: t.avatar || '🧑‍🏫',
      }));
      setTeachers(formatted);
      if (formatted.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(formatted[0].id);
      }
    } catch (err) {
      console.error('Live fetchTeachers error:', err);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [selectedTeacherId]);

  const fetchConversations = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const convos = await ApiServices.listConversations();
      const flatMessages: ParentTeacherMessage[] = [];
      for (const convo of convos) {
        const teacher = teachers.find((t) => t.id === convo.teacherId);
        for (const m of convo.messages) {
          flatMessages.push({
            id: m.id,
            parentId: parentAccount.id,
            parentName: parentAccount.name,
            teacherId: convo.teacherId,
            teacherName: teacher?.name || 'Teacher',
            childId: convo.studentId,
            childName: activeChild.name,
            senderRole: m.senderRole,
            message: m.message,
            timestamp: m.timestamp,
            attachedSubmissionId: m.attachedSubmissionId,
            actionItems: m.actionItems,
            status: m.status,
          });
        }
      }
      setMessages(flatMessages);
    } catch (err) {
      console.error('Live fetchConversations error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [teachers, parentAccount.id, parentAccount.name, activeChild.name]);

  const fetchDossiers = useCallback(async () => {
    setIsLoadingDossiers(true);
    try {
      const list = await ApiServices.listDossiers();
      setSharedDossiers(
        list.map((d: any) => ({
          id: d.id,
          childId: d.studentId,
          childName: activeChild.name,
          parentName: parentAccount.name,
          shareToken: d.shareToken,
          createdAt: d.createdAt,
          expiresAt: d.expiresAt,
          notes: d.notes,
          recipients: d.recipients,
          includedSubmissionsCount: d.includedSubmissionsCount,
          status: d.status,
        }))
      );
    } catch (err) {
      console.error('Live fetchDossiers error:', err);
    } finally {
      setIsLoadingDossiers(false);
    }
  }, [activeChild.name, parentAccount.name]);

  const fetchSchedules = useCallback(async () => {
    setIsLoadingSchedules(true);
    try {
      const list = await ApiServices.listPTMSchedules();
      setPtmSchedules(list || []);
    } catch (err) {
      console.error('Live fetchSchedules error:', err);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  // 1. Initial Load: Fetch Teachers on mount or child change
  useEffect(() => {
    fetchTeachers();
  }, [activeChild.id]);

  // 2. Tab 1: Live Conversations on Messages tab or teacher change
  useEffect(() => {
    if (activeTab === 'messages' && teachers.length > 0) {
      fetchConversations();
    }
  }, [activeTab, selectedTeacherId, teachers.length, activeChild.id]);

  // 3. Tab 2: Live Dossiers when Dossiers tab becomes active
  useEffect(() => {
    if (activeTab === 'dossiers') {
      fetchDossiers();
    }
  }, [activeTab, activeChild.id]);

  // 4. Tab 3: Live PTM Schedules when Schedule tab becomes active
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedules();
    }
  }, [activeTab, activeChild.id]);

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0] || {
    id: 't-1',
    name: 'School Faculty',
    role: 'Educator',
    subject: 'Academic Counselor',
    schoolName: activeChild.schoolName || 'School',
    email: 'faculty@school.edu',
    verified: true,
    avatar: '🧑‍🏫'
  };

  // Filter messages for current child & selected teacher
  const filteredMessages = messages.filter(
    m => m.childId === activeChild.id && m.teacherId === selectedTeacherId
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const attachedSub = recentSubmissions.find(s => s.id === selectedSubmissionForAttachment);
      const { id: conversationId } = await ApiServices.createConversation({ teacherId: activeTeacher.id, studentId: activeChild.id });
      await ApiServices.sendMessage(conversationId, {
        message: messageInput.trim(),
        attachedSubmissionId: attachedSub?.id,
        actionItems: ['Review child diagnostic trends']
      });

      setMessageInput('');
      setSelectedSubmissionForAttachment('');
      await fetchConversations();
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCreateDossierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingDossier) return;

    setIsSubmittingDossier(true);
    try {
      const targetChild = parentAccount.children.find(c => String(c.id) === String(dossierStudentId)) || activeChild;
      const finalRecipients = dossierRecipientsList.length > 0
        ? dossierRecipientsList
        : ['General Academic Review'];

      await ApiServices.createDossier({
        studentId: targetChild.id,
        notes: dossierNotes,
        recipients: finalRecipients,
      });
      setIsCreatingDossier(false);
      await fetchDossiers();
    } catch (err) {
      console.error('Create dossier failed:', err);
    } finally {
      setIsSubmittingDossier(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://EduJunction.ai';
    navigator.clipboard?.writeText(`${origin}/share/dossier/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleWhatsAppShare = (dossier: SharedDossier) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://EduJunction.ai';
    const link = `${origin}/share/dossier/${dossier.shareToken}`;
    const text = encodeURIComponent(`Hello! Here is the verified Academic Dossier and 10-mark diagnostic exam report for ${dossier.childName}:\n${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleOpenPreview = (shareToken: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://EduJunction.ai';
    window.open(`${origin}/share/dossier/${shareToken}`, '_blank');
  };

  const handleRevokeDossier = async (dossierId: string) => {
    if (!window.confirm('Are you sure you want to revoke and delete this academic dossier? The educator share link will immediately be deactivated.')) {
      return;
    }
    try {
      setDeletingDossierId(dossierId);
      await ApiServices.deleteDossier(dossierId);
      setSharedDossiers(prev => prev.filter(d => d.id !== dossierId));
    } catch (err) {
      console.error('Revoke dossier error:', err);
      alert('Failed to revoke dossier. Please try again.');
    } finally {
      setDeletingDossierId(null);
    }
  };

  const handlePrintDossier = async (shareToken: string) => {
    try {
      setIsPrintingDossier(shareToken);
      const res = await ApiServices.getPublicDossier(shareToken);
      setPrintableDossierData(res);
      // Wait briefly for React to render the full dossier DOM before opening native print dialog
      setTimeout(() => {
        window.print();
        setIsPrintingDossier(null);
      }, 300);
    } catch (err) {
      console.error('Direct print failed:', err);
      setIsPrintingDossier(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || isSubmittingSchedule) return;

    setIsSubmittingSchedule(true);
    try {
      await ApiServices.schedulePTM({
        teacherId: activeTeacher.id,
        studentId: activeChild.id,
        scheduledAt: scheduledDate,
        topic: scheduledTopic.trim() || 'Review Topic Mastery & Misconceptions',
      });
      setScheduleSuccess(true);
      setScheduledDate('');
      await fetchSchedules();
      setTimeout(() => setScheduleSuccess(false), 4000);
    } catch (err) {
      console.error('PTM schedule failed:', err);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl">{activeChild.avatar}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Parent-Teacher Academic Bridge: <span className="text-yellow-600">{activeChild.name}</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-300">
              {activeChild.schoolName || 'School Student'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Seamlessly synchronize your child's 10-mark diagnostic sprint analytics, misconception graphs, and study milestones with school teachers and educators.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreatingDossier(true)}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate Shareable Dossier</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'messages'
              ? 'bg-yellow-400 text-stone-900 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Teacher Messages & Feedback ({filteredMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dossiers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'dossiers'
              ? 'bg-yellow-400 text-stone-900 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>Shared Academic Dossiers ({sharedDossiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'schedule'
              ? 'bg-yellow-400 text-stone-900 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule PTM / Review Check-In</span>
        </button>
      </div>

      {/* TAB 1: MESSAGES & CHAT WITH TEACHERS */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 4 Columns: Teachers Directory */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              School Faculty & Advisors ({teachers.length})
            </h2>

            <div className="space-y-2">
              {teachers.map((teacher) => {
                const isSelected = selectedTeacherId === teacher.id;
                return (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${isSelected
                        ? 'border-yellow-400 ring-2 ring-yellow-100 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-xl shrink-0">
                        {teacher.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-xs text-stone-900 truncate">{teacher.name}</h3>
                          {teacher.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-yellow-600 shrink-0" title="Verified School Educator" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">{teacher.role}</p>
                        <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          {teacher.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 8 Columns: Active Conversation Thread */}
          <div className="lg:col-span-8 flex flex-col bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden min-h-[520px]">
            {/* Thread Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-xl shadow-2xs">
                  {activeTeacher.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    <span>{activeTeacher.name}</span>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.2 rounded">
                      Online / Verified
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    {activeTeacher.role} • {activeTeacher.schoolName}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-stone-400 hidden sm:block">
                <span>{activeTeacher.email}</span>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[380px] bg-stone-50/30">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-xs font-semibold">No messages with {activeTeacher.name} yet</p>
                  <p className="text-[11px] mt-1">Send a note or attach an analytical diagnostic report below.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isParent = msg.senderRole === 'parent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-stone-400">
                        <span className="font-semibold text-stone-700">
                          {isParent ? `${msg.parentName} (Parent)` : msg.teacherName}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${isParent
                            ? 'bg-yellow-400 text-stone-900 rounded-tr-xs shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-900 rounded-tl-xs shadow-2xs'
                          }`}
                      >
                        <p>{msg.message}</p>

                        {/* Attached Submission Report Badge */}
                        {msg.attachedSubmissionTitle && (
                          <div
                            onClick={() => {
                              if (msg.attachedSubmissionId && onViewSubmissionReport) {
                                const found = recentSubmissions.find(s => s.id === msg.attachedSubmissionId);
                                if (found) onViewSubmissionReport(found);
                              }
                            }}
                            className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] cursor-pointer transition-opacity hover:opacity-90 ${isParent
                                ? 'bg-yellow-700/80 border-yellow-500 text-white'
                                : 'bg-stone-50 border-stone-200 text-stone-800'
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate font-semibold">{msg.attachedSubmissionTitle}</span>
                            </div>
                            <span className="text-[10px] font-bold underline shrink-0">
                              View Report →
                            </span>
                          </div>
                        )}

                        {/* Action Items */}
                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className={`mt-2.5 pt-2 border-t text-[11px] ${isParent ? 'border-yellow-500 text-yellow-100' : 'border-stone-100 text-stone-600'
                            }`}>
                            <span className="font-bold block mb-1">🎯 Action Items:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {msg.actionItems.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-3.5 border-t border-stone-200 bg-white">
              {/* Attachment selector */}
              {recentSubmissions.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-stone-400" />
                    Attach Test:
                  </span>
                  <select
                    value={selectedSubmissionForAttachment}
                    onChange={(e) => setSelectedSubmissionForAttachment(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 max-w-xs truncate focus:outline-hidden"
                  >
                    <option value="">-- None (General Message) --</option>
                    {recentSubmissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.examTitle} ({s.marksObtained}/10)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Write an academic note to ${activeTeacher.name}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SHARED ACADEMIC DOSSIERS */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-stone-800">Active Academic Dossiers & Share Links</h2>
              <p className="text-xs text-stone-400">Encrypted snapshot dossiers shared with educators, tutors, and schools</p>
            </div>

            <button
              onClick={() => setIsCreatingDossier(true)}
              className="px-3.5 py-1.5 rounded-lg bg-yellow-400 text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-yellow-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Dossier</span>
            </button>
          </div>

          {sharedDossiers.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 text-center shadow-xs max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-center text-yellow-600 mx-auto text-2xl shadow-2xs">
                <Share2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">No Academic Dossiers Shared Yet</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Generate an encrypted 360° performance snapshot link to easily share {activeChild.name}’s diagnostic exam results, topic mastery, and weak chapters with school teachers or private tutors.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingDossier(true)}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Generate First Dossier for {activeChild.name}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedDossiers.map((dossier) => {
                const matchedChild = parentAccount.children.find(c => String(c.id) === String(dossier.studentId || (dossier as any).childId));
                return (
                  <div
                    key={dossier.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-300 uppercase">
                          Active Dossier
                        </span>
                        <h3 className="font-bold text-sm text-stone-900 mt-1.5">
                          Candidate: {matchedChild?.name || dossier.childName || 'Student'}
                        </h3>
                        <p className="text-xs text-stone-400">
                          Created by {dossier.parentName} • {new Date(dossier.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200">
                        {dossier.shareToken}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                      {dossier.notes}
                    </p>

                    <div className="text-xs text-stone-500 space-y-1.5">
                      <span className="font-bold text-stone-700 block flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-yellow-600" />
                        Authorized Educators & Mentors ({dossier.recipients.length}):
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {dossier.recipients.map((rec, i) => (
                          <span key={i} className="bg-yellow-50 text-yellow-800 border border-yellow-200 font-semibold px-2.5 py-1 rounded-lg text-[11px]">
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Live View Tracker & Expiry */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                      {(dossier as any).viewCount && (dossier as any).viewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-yellow-700 bg-yellow-50 border border-yellow-300 px-2 py-0.5 rounded-md">
                          <Eye className="w-3 h-3 text-yellow-600" />
                          <span>Viewed {(dossier as any).viewCount} {(dossier as any).viewCount === 1 ? 'time' : 'times'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-stone-400 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Not viewed yet</span>
                        </span>
                      )}

                      <span className="text-[10px] text-stone-400">
                        Expires {new Date(dossier.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyLink(dossier.shareToken)}
                        className="flex-1 min-w-[100px] py-1.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedToken === dossier.shareToken ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-yellow-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-400" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleWhatsAppShare(dossier)}
                        className="py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="Share directly on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleOpenPreview(dossier.shareToken)}
                        className="py-1.5 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Open and preview the public dossier portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleRevokeDossier(dossier.id)}
                        disabled={deletingDossierId === dossier.id}
                        className="py-1.5 px-3 rounded-xl border border-rose-200/80 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        title="Revoke and delete this dossier access link"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{deletingDossierId === dossier.id ? 'Revoking...' : 'Revoke'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULE PTM / REVIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs max-w-xl mx-auto space-y-4">
            <div className="text-center">
              <Calendar className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
              <h2 className="font-bold text-base text-stone-900">Schedule Parent-Teacher Diagnostic Review</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Book a 15-minute academic consultation with {activeChild.name}’s educators to discuss RAG knowledge retention.
              </p>
            </div>

            {scheduleSuccess ? (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-yellow-600 mx-auto" />
                <h3 className="text-xs font-bold text-yellow-900">Review Request Dispatched & Saved!</h3>
                <p className="text-[11px] text-yellow-700">
                  The consultation has been synchronized with the database. Calendar invite sent to {parentAccount.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Select Faculty:</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-1 focus:ring-yellow-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role} - {t.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Preferred Date & Time:</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discussion Agenda / Topic:</label>
                  <input
                    type="text"
                    value={scheduledTopic}
                    onChange={(e) => setScheduledTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isSubmittingSchedule ? 'Saving to Database...' : 'Confirm Academic Review Slot'}</span>
                </button>
              </form>
            )}
          </div>

          {/* List of Scheduled Consultations */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  Upcoming Scheduled Academic Consultations ({ptmSchedules.length})
                </h3>
                <p className="text-xs text-stone-400">Live meetings confirmed in MySQL database</p>
              </div>
            </div>

            {ptmSchedules.length === 0 ? (
              <div className="text-center py-6 text-stone-400">
                <Calendar className="w-8 h-8 mx-auto mb-1.5 text-stone-300" />
                <p className="text-xs font-semibold">No consultations booked yet</p>
                <p className="text-[11px] text-stone-400">Schedule your first review session above.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ptmSchedules.map((ptm) => (
                  <div
                    key={ptm.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">{ptm.teacherName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 uppercase">
                          {ptm.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{ptm.topic}</p>
                      <div className="flex items-center gap-3 text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {new Date(ptm.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span>•</span>
                        <span>Candidate: <strong className="text-stone-700">{ptm.studentName}</strong></span>
                      </div>
                    </div>

                    {ptm.meetingLink && (
                      <a
                        href={ptm.meetingLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-3.5 py-1.5 rounded-lg bg-yellow-50 border border-yellow-300 hover:bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-yellow-600" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create New Dossier */}
      {isCreatingDossier && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-stone-900">Generate Shareable Academic Dossier</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Creates an encrypted 30-day snapshot of diagnostic exams, topic mastery, and error analysis for educators.
              </p>
            </div>

            <form onSubmit={handleCreateDossierSubmit} className="space-y-4 text-xs">
              {/* 1. Student Selection (Auto sets Board & Grade) */}
              <div>
                <label className="font-bold text-stone-700 block mb-1.5 flex items-center justify-between">
                  <span>Target Candidate (Student):</span>
                  <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                    {selectedDossierStudent.targetBoard} • {selectedDossierStudent.classGrade}
                  </span>
                </label>
                <select
                  value={String(dossierStudentId)}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setDossierStudentId(newId);
                    const s = parentAccount.children.find(c => String(c.id) === String(newId)) || activeChild;
                    setDossierNotes(`Comprehensive ${s.classGrade} (${s.targetBoard}) Diagnostic dossier across 10-mark sprints for term review.`);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                >
                  {parentAccount.children.map((child) => (
                    <option key={child.id} value={String(child.id)}>
                      {child.avatar} {child.name} ({child.classGrade} - {child.targetBoard})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Multiple Educators Tagging */}
              <div className="space-y-2">
                <label className="font-bold text-stone-700 block">
                  Add Educators / Mentors to Share With:
                </label>

                {/* Quick Add Preset Chips */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    '🏫 School Class Teacher',
                    '👨‍🏫 Math Tutor',
                    '🧪 Science Mentor',
                    '🏢 Coaching Institute'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (!dossierRecipientsList.includes(preset)) {
                          setDossierRecipientsList([...dossierRecipientsList, preset]);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-yellow-50 hover:text-yellow-700 text-stone-700 font-semibold text-[11px] transition-colors border border-stone-200"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="flex gap-1.5 mt-2">
                  <input
                    type="text"
                    value={customRecipientInput}
                    onChange={(e) => setCustomRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customRecipientInput.trim()) {
                          if (!dossierRecipientsList.includes(customRecipientInput.trim())) {
                            setDossierRecipientsList([...dossierRecipientsList, customRecipientInput.trim()]);
                          }
                          setCustomRecipientInput('');
                        }
                      }
                    }}
                    placeholder="Type teacher name / role (e.g. Sharma Sir - Math) and press Add..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customRecipientInput.trim()) {
                        if (!dossierRecipientsList.includes(customRecipientInput.trim())) {
                          setDossierRecipientsList([...dossierRecipientsList, customRecipientInput.trim()]);
                        }
                        setCustomRecipientInput('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold"
                  >
                    Add
                  </button>
                </div>

                {/* Active Tag Pills */}
                <div className="flex gap-1.5 flex-wrap pt-1 min-h-[32px]">
                  {dossierRecipientsList.map((rec) => (
                    <span
                      key={rec}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-300 font-semibold text-[11px]"
                    >
                      <span>{rec}</span>
                      <button
                        type="button"
                        onClick={() => setDossierRecipientsList(dossierRecipientsList.filter(r => r !== rec))}
                        className="p-0.5 hover:bg-yellow-200 rounded-full text-yellow-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Purpose Notes */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Dossier Notes / Consultation Purpose:</label>
                <textarea
                  rows={2}
                  required
                  value={dossierNotes}
                  onChange={(e) => setDossierNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingDossier(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDossier}
                  className="px-5 py-2 rounded-xl bg-yellow-400 text-stone-900 font-bold hover:bg-yellow-700 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isSubmittingDossier ? 'Generating...' : 'Generate Secure Dossier Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DIRECT IN-MEMORY PRINTABLE DOSSIER REPORT (Zero-Tab Print)   */}
      {/* ============================================================ */}
      {printableDossierData && (
        <div className="hidden print-only-dossier p-8 text-stone-900 bg-white space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center font-bold text-xl">
                Σ
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">EduJunction — Official Academic Dossier</h1>
                <p className="text-xs text-stone-500">Verified Diagnostic Performance Snapshot & Topic Mastery</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-stone-100 rounded border border-stone-300 block mb-1">
                {printableDossierData.dossier?.shareToken}
              </span>
              <span className="text-[10px] text-stone-500">
                Valid: {new Date(printableDossierData.dossier?.createdAt || Date.now()).toLocaleDateString()} – {new Date(printableDossierData.dossier?.expiresAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="border border-stone-300 rounded-xl p-5 bg-stone-50 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{printableDossierData.student?.avatar || '🧑‍🎓'}</span>
                <h2 className="text-xl font-black text-stone-900">{printableDossierData.student?.name}</h2>
              </div>
              <p className="text-xs text-stone-600 font-semibold">
                Class: {printableDossierData.student?.classGrade} • Board: {printableDossierData.student?.targetBoard} • School: {printableDossierData.student?.schoolName || 'School Student'}
              </p>
              <div className="pt-2 text-xs text-stone-700 bg-white p-3 rounded-lg border border-stone-200">
                <span className="font-bold text-yellow-900 block mb-0.5">Parent Consultation Note:</span>
                <span className="italic">"{printableDossierData.dossier?.notes || 'Comprehensive diagnostic review across 10-mark sprints.'}"</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 text-center">
              <div className="p-3 bg-white rounded-lg border border-stone-200 min-w-[90px]">
                <span className="text-[9px] text-stone-500 uppercase font-bold block">Avg. Accuracy</span>
                <span className="text-lg font-black text-yellow-600">{Math.round(Number(printableDossierData.student?.averageScore || 0))}%</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-stone-200 min-w-[90px]">
                <span className="text-[9px] text-stone-500 uppercase font-bold block">Tests Done</span>
                <span className="text-lg font-black text-stone-800">{printableDossierData.student?.totalExamsTaken}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Topic Mastery (K-Graph) */}
          {printableDossierData.topicMastery && Object.keys(printableDossierData.topicMastery).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
                Diagnostic Topic & Concept Mastery
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(printableDossierData.topicMastery).map(([topic, score]: [string, any]) => {
                  const scorePct = Math.round(Number(score) * 100);
                  return (
                    <div key={topic} className="p-3 border border-stone-200 rounded-lg bg-white">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-stone-800 truncate font-medium">{topic}</span>
                        <span className={`font-bold ${scorePct >= 80 ? 'text-yellow-700' : scorePct >= 60 ? 'text-amber-700' : 'text-rose-600'}`}>
                          {scorePct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${scorePct >= 80 ? 'bg-yellow-500' : scorePct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Diagnostic Exams */}
          {printableDossierData.recentSubmissions && printableDossierData.recentSubmissions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
                Recent Diagnostic Exam Sprints ({printableDossierData.recentSubmissions.length})
              </h3>
              <div className="space-y-3">
                {printableDossierData.recentSubmissions.map((sub: any, idx: number) => (
                  <div key={sub.id || idx} className="border border-stone-200 rounded-xl p-4 space-y-2 bg-white">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">
                      <span>{sub.examTitle || '10-Mark Diagnostic Exam'} • {sub.subject}</span>
                      <span className="px-2.5 py-0.5 bg-yellow-50 text-yellow-900 rounded border border-yellow-300">
                        Score: {sub.marksObtained}/{sub.totalMarks || 10} ({sub.accuracyPercentage}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-700 leading-relaxed">
                      <strong>Pedagogical Diagnosis:</strong> {sub.analysis?.encouragementNote || sub.analysis?.evolutionaryRoadmap || 'Proficient performance.'}
                    </p>
                    {sub.analysis?.areasToImprove && sub.analysis.areasToImprove.length > 0 && (
                      <p className="text-[11px] text-rose-700 font-medium">
                        <strong>Remediation Target:</strong> {sub.analysis.areasToImprove.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-4 border-t border-stone-300 flex justify-between items-center text-[10px] text-stone-400">
            <span>Generated by EduJunction Diagnostic Platform</span>
            <span>Confidential Academic Report</span>
          </div>
        </div>
      )}
    </div>
  );
};
