import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  BookOpen,
  ExternalLink,
  Award,
  Filter,
  Zap,
  Layers,
  TrendingUp,
  X
} from 'lucide-react';
import {
  LearningPathNode,
  ChildAccount,
  Subject,
  ClassGrade,
  Board,
  ExamDifficulty,
  LearningLevel
} from '../types';

interface AdaptiveLearningPathProps {
  activeChild: ChildAccount;
  learningNodes: LearningPathNode[];
  onLaunchTopicExam: (config: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    topic: string;
  }) => void;
}

export const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
  activeChild,
  learningNodes,
  onLaunchTopicExam
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<LearningPathNode | null>(null);

  // Dynamic Subject list extracted directly from actual student learning nodes
  const subjectsList = useMemo(() => {
    const subjects = new Set<string>();
    learningNodes.forEach((node) => {
      if (node.subject) subjects.add(node.subject);
    });
    return ['all', ...Array.from(subjects)];
  }, [learningNodes]);

  // Filter nodes according to subject and level
  const filteredNodes = useMemo(() => {
    return learningNodes.filter((node) => {
      const matchSubject =
        selectedSubject === 'all' ||
        (node.subject && node.subject.toLowerCase() === selectedSubject.toLowerCase());
      const matchLevel = selectedLevel === 'all' || node.level === selectedLevel;
      return matchSubject && matchLevel;
    });
  }, [learningNodes, selectedSubject, selectedLevel]);

  return (
    <div className="space-y-4">
      {/* Top Banner / Persona context */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl">{activeChild.avatar}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Learning Junction: <span className="text-yellow-600">{activeChild.name}</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-300">
              {activeChild.classGrade} • {activeChild.targetBoard}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Personalized learning roadmap that adapts to your exam performance. Strengthen your weak topics step-by-step while unlocking advanced challenges as you master each concept.
          </p>
        </div>

        {/* Action / Level indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-right">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider block">Child XP & Level</span>
            <span className="text-sm font-bold text-yellow-900 flex items-center justify-end gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              {activeChild.xp || 1420} XP • Lvl {activeChild.level || 6}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            Subject:
          </span>
          <div className="flex gap-1 flex-wrap">
            {subjectsList.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${selectedSubject === sub
                  ? 'bg-yellow-400 text-stone-900 shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
              >
                {sub === 'all' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700">Track:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-yellow-500 cursor-pointer"
          >
            <option value="all">All Tracks</option>
            <option value="foundational">Foundational (Remedial)</option>
            <option value="intermediate">Intermediate (Standard Board)</option>
            <option value="advanced_hots">Advanced HOTS / Olympiad</option>
          </select>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Topic Milestones ({filteredNodes.length})</span>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">Click any card to view blueprint & practice</span>
      </div>

      {/* Modern Individual Square Cards Grid */}
      {filteredNodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Compass className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No topic nodes match the current filter</p>
          <p className="text-xs text-stone-400 mt-1">Try resetting the subject or track filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredNodes.map((node, index) => {
            let statusBadge = {
              bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              label: 'Mastered',
              icon: CheckCircle2
            };

            if (node.status === 'remedial_needed') {
              statusBadge = {
                bg: 'bg-amber-50 text-amber-800 border-amber-300',
                label: 'Remedial Priority',
                icon: AlertTriangle
              };
            } else if (node.status === 'in_progress') {
              statusBadge = {
                bg: 'bg-yellow-50 text-yellow-700 border-yellow-300',
                label: 'In Progress',
                icon: TrendingUp
              };
            } else if (node.status === 'available') {
              statusBadge = {
                bg: 'bg-blue-50 text-blue-700 border-blue-200',
                label: 'Unlocked',
                icon: Zap
              };
            }

            const StatusIcon = statusBadge.icon;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer flex flex-col justify-between space-y-3 group active:scale-98"
              >
                {/* Top Row: Index + Subject & Status Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-amber-200 group-hover:text-amber-950 transition-colors">
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tight truncate">
                        {node.subject} • {node.board}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${statusBadge.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2 leading-snug">
                    {node.topic}
                  </h3>

                  {/* Subtitle / Chapter & HOTS badge */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {node.chapterName || `${node.classGrade} (${node.board})`}
                    </p>
                    {node.level === 'advanced_hots' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        HOTS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Topic Learning Blueprint Modal Dialog */}
      {selectedNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-start justify-between gap-3 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider px-2 py-0.5 bg-amber-100 rounded-md border border-amber-200">
                    Topic Learning Blueprint
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    {selectedNode.subject} • {selectedNode.classGrade} ({selectedNode.board})
                  </span>
                </div>
                <h3 className="font-bold text-lg text-stone-900 leading-tight">
                  {selectedNode.topic}
                </h3>
                {selectedNode.chapterName && (
                  <p className="text-xs text-stone-500 mt-0.5">{selectedNode.chapterName}</p>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-5 shrink-0 ml-4">
                <div className="text-right bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs">
                  <span className={`text-xl sm:text-2xl font-black block leading-none ${selectedNode.masteryPercentage >= 75 ? 'text-emerald-600' : selectedNode.masteryPercentage > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {selectedNode.masteryPercentage}%
                  </span>
                  <span className="text-[10px] text-stone-400 block font-bold mt-0.5">Mastery Score</span>
                </div>

                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-90 shrink-0"
                  title="Close Modal"
                >
                  <X className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Topic Performance Insights (Warm student-friendly feedback) */}
              <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Topic Performance Insights</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {selectedNode.recommendedReason}
                </p>
              </div>

              {/* Actionable Next Step (LLM Controlled) */}
              <div className="p-4 bg-gradient-to-r from-amber-100/70 via-white to-amber-50 rounded-xl border border-amber-300 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-900 font-black text-xs mb-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Recommended Next Step</span>
                </div>
                <p className="text-xs text-stone-800 font-semibold leading-relaxed">
                  {selectedNode.recommendedAction || selectedNode.practiceExamConfig?.recommendedAction || 'Launch the targeted practice test below to maintain and advance your mastery.'}
                </p>
              </div>

              {/* Key Concepts in Syllabus */}
              {selectedNode.keyConcepts && selectedNode.keyConcepts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-stone-500" />
                    <span>Key Concepts in Syllabus</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    {selectedNode.keyConcepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-amber-600 font-bold text-xs mt-0.5">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Frequent Board Traps to Avoid */}
              {selectedNode.commonMisconceptions && selectedNode.commonMisconceptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Frequent Board Traps to Avoid</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {selectedNode.commonMisconceptions.map((mis, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 text-amber-950">
                        <span className="text-amber-600 font-bold text-xs mt-0.5">⚠️</span>
                        <span>{mis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curated Official Study Links & Videos */}
              {selectedNode.curatedResources && selectedNode.curatedResources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Curated Syllabus Resources</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedNode.curatedResources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-stone-50 hover:bg-amber-50/50 rounded-xl border border-stone-200 hover:border-amber-300 transition-colors group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-amber-700 mb-0.5">
                          <span className="truncate pr-2">{res.title}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-amber-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{res.description}</p>
                        <span className="text-[10px] text-amber-600 font-semibold mt-1 inline-block">
                          Source: {res.source}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end">
              <button
                onClick={() => {
                  const node = selectedNode;
                  setSelectedNode(null);
                  const targetSubject = node.practiceExamConfig?.subject || node.subject;
                  const targetBoard = node.practiceExamConfig?.board || node.board;
                  const targetClassGrade = node.practiceExamConfig?.classGrade || node.classGrade;
                  const targetDifficulty = node.practiceExamConfig?.difficulty || (node.status === 'remedial_needed' ? 'simple' : node.level === 'advanced_hots' ? 'hard' : 'medium');
                  const targetTopic = node.practiceExamConfig?.focusTopic || node.topic;

                  onLaunchTopicExam({
                    board: targetBoard as Board,
                    classGrade: targetClassGrade as ClassGrade,
                    subject: targetSubject as Subject,
                    difficulty: targetDifficulty as ExamDifficulty,
                    topic: targetTopic
                  });
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch 10-Mark Practice Test ({(selectedNode.practiceExamConfig?.difficulty || (selectedNode.status === 'remedial_needed' ? 'simple' : selectedNode.level === 'advanced_hots' ? 'hard' : 'medium')).toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
