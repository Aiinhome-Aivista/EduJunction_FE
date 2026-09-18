import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Play,
  BookOpen,
  ExternalLink,
  Award,
  Filter,
  Flame,
  ArrowRight,
  Zap,
  Layers,
  ChevronRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import {
  LearningPathNode,
  ChildAccount,
  Subject,
  ClassGrade,
  Board,
  ExamDifficulty,
  LearningLevel,
  LearningPathStatus
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
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<LearningPathNode | null>(learningNodes[0] || null);

  // Filter nodes according to subject and level
  const filteredNodes = learningNodes.filter((node) => {
    const matchSubject = selectedSubject === 'all' || node.subject === selectedSubject;
    const matchLevel = selectedLevel === 'all' || node.level === selectedLevel;
    return matchSubject && matchLevel;
  });

  const masteredCount = learningNodes.filter(n => n.status === 'mastered').length;
  const remedialCount = learningNodes.filter(n => n.status === 'remedial_needed').length;
  const inProgressCount = learningNodes.filter(n => n.status === 'in_progress').length;
  const hotsCount = learningNodes.filter(n => n.level === 'advanced_hots').length;

  const subjectsList: (Subject | 'all')[] = [
    'all',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Logical Reasoning'
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner / Persona context */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl">{activeChild.avatar}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Adaptive Learning Junction: <span className="text-yellow-600">{activeChild.name}</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-300">
              {activeChild.classGrade} • {activeChild.targetBoard}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Dynamic RAG-driven curriculum that evolves based on real 10-mark diagnostic sprint performance. Remedial gaps are automatically reinforced while high-performing topics unlock Olympiad & HOTS challenges.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Mastered Topics</span>
            <CheckCircle2 className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{masteredCount}</p>
          <span className="text-[10px] text-yellow-600 font-semibold">85%+ score retention</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">In Active Practice</span>
            <TrendingUp className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
          <span className="text-[10px] text-yellow-600 font-semibold">Dynamic sprints queued</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Remedial Focus</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{remedialCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Targeted misconceptions</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">HOTS / Advanced</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{hotsCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Olympiad & IIT track</span>
        </div>
      </div>

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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${selectedSubject === sub
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
            className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
          >
            <option value="all">All Tracks</option>
            <option value="foundational">Foundational (Remedial)</option>
            <option value="intermediate">Intermediate (Standard Board)</option>
            <option value="advanced_hots">Advanced HOTS / Olympiad</option>
          </select>
        </div>
      </div>

      {/* 2-Column Main Layout: Roadmap List (Left) & Topic Detail Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Topic Roadmap Nodes */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-sm font-bold text-stone-800 flex items-center justify-between">
            <span>Adaptive Topic Milestones ({filteredNodes.length})</span>
            <span className="text-xs text-stone-400 font-normal">Click a node to view RAG diagnostic analysis</span>
          </h2>

          {filteredNodes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <Compass className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-700">No topic nodes match the current filter</p>
              <p className="text-[11px] text-stone-400 mt-1">Try resetting the subject or track filters above.</p>
            </div>
          ) : (
            filteredNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;

              let statusBadge = {
                bg: 'bg-yellow-50 text-yellow-700 border-yellow-300',
                label: 'In Progress',
                icon: TrendingUp
              };

              if (node.status === 'mastered') {
                statusBadge = {
                  bg: 'bg-yellow-50 text-yellow-700 border-yellow-300',
                  label: 'Mastered',
                  icon: CheckCircle2
                };
              } else if (node.status === 'remedial_needed') {
                statusBadge = {
                  bg: 'bg-amber-50 text-amber-700 border-amber-200',
                  label: 'Remedial Priority',
                  icon: AlertTriangle
                };
              } else if (node.status === 'available') {
                statusBadge = {
                  bg: 'bg-amber-50 text-amber-700 border-amber-200',
                  label: 'Unlocked Challenge',
                  icon: Zap
                };
              }

              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${isSelected
                      ? 'border-yellow-400 ring-2 ring-yellow-100 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50 shadow-xs'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight">
                        {node.subject} • {node.board}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${statusBadge.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                      {node.level === 'advanced_hots' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          HOTS
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-stone-900 mb-1 leading-snug">
                    {node.topic}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                    {node.recommendedReason}
                  </p>

                  {/* Progress Bar & Sprint Trigger */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-100">
                    <div className="flex-1 max-w-[200px]">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-stone-400">Mastery Level</span>
                        <span className="font-bold text-stone-800">{node.masteryPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${node.masteryPercentage >= 80
                              ? 'bg-yellow-500'
                              : node.masteryPercentage >= 60
                                ? 'bg-yellow-500'
                                : 'bg-amber-500'
                            }`}
                          style={{ width: `${node.masteryPercentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchTopicExam({
                          board: node.practiceExamConfig.board,
                          classGrade: node.practiceExamConfig.classGrade,
                          subject: node.practiceExamConfig.subject,
                          difficulty: node.practiceExamConfig.difficulty,
                          topic: node.practiceExamConfig.focusTopic
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Start 10-Mark Sprint</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 5 Columns: Detailed RAG Dossier for Selected Topic */}
        <div className="lg:col-span-5">
          {selectedNode ? (
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs sticky top-20 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">
                    RAG Diagnostic Blueprint
                  </span>
                  <h3 className="font-bold text-base text-stone-900 mt-0.5">{selectedNode.topic}</h3>
                  <p className="text-xs text-stone-400">{selectedNode.chapterName} • {selectedNode.classGrade} ({selectedNode.board})</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-yellow-600">{selectedNode.masteryPercentage}%</span>
                  <span className="text-[10px] text-stone-400 block">Mastery Score</span>
                </div>
              </div>

              {/* AI Recommendation Reason */}
              <div className="p-3.5 bg-yellow-50/80 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-900 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                  <span>Adaptive RAG Diagnosis</span>
                </div>
                <p className="text-xs text-yellow-950 font-medium leading-relaxed">
                  {selectedNode.recommendedReason}
                </p>
              </div>

              {/* Core Concepts to Review */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  <span>Key Concepts in Syllabus</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {selectedNode.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                      <span className="text-yellow-600 font-bold text-xs mt-0.5">•</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Traps / Misconceptions */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Frequent Board Traps to Avoid</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {selectedNode.commonMisconceptions.map((mis, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100 text-amber-950">
                      <span className="text-amber-600 font-bold text-xs mt-0.5">⚠️</span>
                      <span>{mis}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curated Official Study Links & Videos */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                  <span>Curated Syllabus Resources</span>
                </h4>
                <div className="space-y-2">
                  {selectedNode.curatedResources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2.5 bg-stone-50 hover:bg-yellow-50/50 rounded-xl border border-stone-200 hover:border-yellow-300 transition-colors group"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-yellow-700 mb-0.5">
                        <span className="truncate pr-2">{res.title}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-yellow-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{res.description}</p>
                      <span className="text-[10px] text-yellow-600 font-semibold mt-1 inline-block">
                        Source: {res.source}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Launch Sprint Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onLaunchTopicExam({
                      board: selectedNode.practiceExamConfig.board,
                      classGrade: selectedNode.practiceExamConfig.classGrade,
                      subject: selectedNode.practiceExamConfig.subject,
                      difficulty: selectedNode.practiceExamConfig.difficulty,
                      topic: selectedNode.practiceExamConfig.focusTopic
                    });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch 10-Mark Diagnostic Test ({selectedNode.practiceExamConfig.difficulty.toUpperCase()})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400">
              <Compass className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-xs font-semibold">Select a topic from the roadmap to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
