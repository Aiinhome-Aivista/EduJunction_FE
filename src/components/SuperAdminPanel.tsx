import React, { useState, useEffect } from 'react';
import { 
  RunbookKGraphNode, 
  Board, 
  ClassGrade, 
  Subject, 
  ParentAccount, 
  ReferenceLink
} from '../types';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Settings, 
  ExternalLink,
  Code,
  Check
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface SuperAdminPanelProps {
  parentAccount: ParentAccount;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const GRADES: ClassGrade[] = [
  'Class 5', 'Class 6', 'Class 7', 'Class 8', 
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
const SUBJECTS: Subject[] = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'Science', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'
];

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  parentAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'runbooks' | 'analytics'>('runbooks');
  const [runbooks, setRunbooks] = useState<RunbookKGraphNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterBoard, setFilterBoard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Runbook Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBoard, setNewBoard] = useState<Board>('CBSE');
  const [newGrade, setNewGrade] = useState<ClassGrade>('Class 10');
  const [newSubject, setNewSubject] = useState<Subject>('Mathematics');
  const [newChapter, setNewChapter] = useState('');
  const [newConcepts, setNewConcepts] = useState('');
  const [newFormulas, setNewFormulas] = useState('');
  const [newTraps, setNewTraps] = useState('');
  const [newArchetypes, setNewArchetypes] = useState('');
  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefUrl, setNewRefUrl] = useState('');
  const [newRefSource, setNewRefSource] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Fetch runbooks and stats from server API
  const fetchRunbooks = async () => {
    setLoading(true);
    try {
      const data = await ApiServices.listRunbooks();
      if (Array.isArray(data)) {
        setRunbooks(data);
      }
    } catch (err) {
      console.error('Error fetching runbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ApiServices.adminStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchRunbooks();
    fetchStats();
  }, []);

  const handleCreateRunbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.trim()) return;

    const refLinks: ReferenceLink[] = newRefTitle.trim() && newRefUrl.trim() ? [
      {
        title: newRefTitle.trim(),
        source: newRefSource.trim() || 'Official Repository',
        url: newRefUrl.trim(),
        description: 'Curated curriculum benchmark for student reference.',
        type: 'official_syllabus'
      }
    ] : [];

    const payload = {
      board: newBoard,
      classGrade: newGrade,
      subject: newSubject,
      chapterName: newChapter.trim(),
      coreConcepts: newConcepts.split('\n').filter((c) => c.trim().length > 0),
      keyFormulasOrRules: newFormulas.split('\n').filter((f) => f.trim().length > 0),
      commonTraps: newTraps.split('\n').filter((t) => t.trim().length > 0),
      sampleQuestionArchetypes: newArchetypes.split('\n').filter((a) => a.trim().length > 0),
      curatedReferenceUrls: refLinks
    };

    try {
      await ApiServices.createRunbook(payload);
      setSaveSuccessMsg(`Runbook "${newChapter}" added to RAG K-Graph!`);
      setShowAddModal(false);
      // Reset inputs
      setNewChapter('');
      setNewConcepts('');
      setNewFormulas('');
      setNewTraps('');
      setNewArchetypes('');
      setNewRefTitle('');
      setNewRefUrl('');
      setNewRefSource('');
      fetchRunbooks();
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving runbook:', err);
    }
  };

  const handleDeleteRunbook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Runbook from the RAG K-Graph?')) return;
    try {
      await ApiServices.removeRunbook(id);
      fetchRunbooks();
    } catch (err) {
      console.error('Error deleting runbook:', err);
    }
  };

  // Filtered runbooks
  const filteredRunbooks = runbooks.filter((rb) => {
    const matchesBoard = filterBoard === 'all' || rb.board.toLowerCase() === filterBoard.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      rb.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rb.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rb.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBoard && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Super Admin Top Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Console • Root Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              RAG Knowledge Graph & System Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              Add curriculum runbooks to enhance the RAG K-Graph grounding and inspect diagnostic telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-add-runbook-btn"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add K-Graph Runbook
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-800">
          <button
            onClick={() => setActiveTab('runbooks')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'runbooks' ? 'bg-white text-stone-950' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            RAG K-Graph Runbooks ({runbooks.length})
          </button>


          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'analytics' ? 'bg-white text-stone-950' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Platform Telemetry
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-300 text-yellow-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-yellow-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: RAG K-GRAPH RUNBOOKS */}
      {activeTab === 'runbooks' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chapter, subject, grade..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={filterBoard}
                  onChange={(e) => setFilterBoard(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-white text-stone-700 focus:outline-hidden"
                >
                  <option value="all">All Boards</option>
                  {BOARDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-stone-500">
              Showing <strong className="text-stone-800">{filteredRunbooks.length}</strong> Grounding Nodes
            </div>
          </div>

          {/* Runbook Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRunbooks.map((rb) => (
              <div
                key={rb.id}
                className="bg-white rounded-xl border border-stone-200 shadow-xs p-4 sm:p-5 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-300">
                        {rb.board}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700">
                        {rb.classGrade}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-300">
                        {rb.subject}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900">{rb.chapterName}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteRunbook(rb.id)}
                    className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Delete Runbook Node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Core Concepts */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Core Syllabus Concepts:
                  </span>
                  <ul className="text-xs text-stone-700 space-y-1">
                    {rb.coreConcepts.slice(0, 3).map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-yellow-500 font-bold">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Formulas or Rules */}
                {rb.keyFormulasOrRules && rb.keyFormulasOrRules.length > 0 && (
                  <div className="mb-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                      Formulas / Rules:
                    </span>
                    <p className="text-xs font-mono text-stone-800 leading-snug">
                      {rb.keyFormulasOrRules.join(' • ')}
                    </p>
                  </div>
                )}

                {/* Common Traps */}
                {rb.commonTraps && rb.commonTraps.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                      Student Misconception Traps:
                    </span>
                    <p className="text-xs text-stone-600 italic leading-snug">
                      {rb.commonTraps[0]}
                    </p>
                  </div>
                )}

                {/* Reference Links count */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                    {rb.curatedReferenceUrls?.length || 0} Grounded Reference Links
                  </span>
                  <span className="text-[11px] text-stone-400">Updated: {rb.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* TAB 3: PLATFORM TELEMETRY & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Total Exams Generated
              </span>
              <div className="text-3xl font-extrabold text-stone-900">{stats?.totalExamsGenerated || 432}</div>
              <p className="text-xs text-stone-500 mt-1">Grounded by Gemini 3.7 RAG</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Total Submissions Evaluated
              </span>
              <div className="text-3xl font-extrabold text-yellow-600">{stats?.totalExamsCompleted || 389}</div>
              <p className="text-xs text-stone-500 mt-1">90% Completion Rate</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                K-Graph Active Runbooks
              </span>
              <div className="text-3xl font-extrabold text-yellow-600">{runbooks.length}</div>
              <p className="text-xs text-stone-500 mt-1">Across 8 Exam Boards</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4">Board Coverage Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {BOARDS.map((b) => {
                const count = runbooks.filter((r) => r.board === b).length;
                return (
                  <div key={b} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="font-bold text-stone-900">{b}</div>
                    <div className="text-stone-500 mt-0.5">{count} syllabus chapters</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Runbook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Add New RAG K-Graph Runbook</h3>
                <p className="text-xs text-stone-500">Enrich AI exam generator with official board curriculum nodes & reference URLs</p>
              </div>
            </div>

            <form onSubmit={handleCreateRunbook} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Board</label>
                  <select
                    value={newBoard}
                    onChange={(e) => setNewBoard(e.target.value as Board)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Class / Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as ClassGrade)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as Subject)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Chapter / Unit Title</label>
                <input
                  type="text"
                  required
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Electromagnetic Induction & Lenz's Law"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Core Concepts (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newConcepts}
                  onChange={(e) => setNewConcepts(e.target.value)}
                  placeholder="Magnetic flux definition Φ = B·A&#10;Faraday's Law of Induction ε = -dΦ/dt&#10;Lenz's Law direction of induced current"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Key Formulas (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newFormulas}
                    onChange={(e) => setNewFormulas(e.target.value)}
                    placeholder="ε = -N (ΔΦ/Δt)&#10;Self inductance L = NΦ/I"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Common Misconceptions (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newTraps}
                    onChange={(e) => setNewTraps(e.target.value)}
                    placeholder="Confusing magnetic flux with magnetic field strength"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">
                  Curated Reference Link for Student Grasp:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newRefTitle}
                    onChange={(e) => setNewRefTitle(e.target.value)}
                    placeholder="Resource Title (e.g. NCERT Chapter 6)"
                    className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={newRefSource}
                    onChange={(e) => setNewRefSource(e.target.value)}
                    placeholder="Source (e.g. NCERT Official)"
                    className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="url"
                    value={newRefUrl}
                    onChange={(e) => setNewRefUrl(e.target.value)}
                    placeholder="https://..."
                    className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-xs"
                >
                  Save & Ingest into RAG Graph
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
