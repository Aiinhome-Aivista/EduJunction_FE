import React from 'react';
import { ChildAccount, ExamSubmission, LearningPathNode, Subject } from '../../types';
import { ScheduledExam } from '../../types/api';
import { Zap, Flame, Target, Award, ArrowRight, Compass, CheckCircle2, FileText, ChevronRight, BarChart3, Clock, Layers, CalendarClock } from 'lucide-react';
import { StudentDashboardExplore } from './StudentDashboardExplore';
import { getExamDisplaySubject } from '../../utils/metricsEngine';

export type MobileDashboardSection = 'practice' | 'analytics' | 'history';

interface StudentDashboardMobileProps {
  activeChild: ChildAccount;
  assignedExam?: ScheduledExam;
  studentExams: ExamSubmission[];
  weakTopics: { topic: string; score: number }[];
  strongTopics: { topic: string; score: number }[];
  nextRecommendedTopic: LearningPathNode | null;
  isKid: boolean;
  defaultTotalMarks: number;
  currentLevel: number;
  xp: number;
  xpProgress: number;
  studentStreak: number;
  studentTotalActivities: number;
  accuracyPct: number;
  unlockedBadgesCount: number;
  mobileSection: MobileDashboardSection;
  onMobileSectionChange: (section: MobileDashboardSection) => void;
  mobileCarouselIdx: number;
  onMobileCarouselChange: (index: number) => void;
  inferTopicSubject: (topic: string) => Subject;
  onNavigateToArena: (config?: { subject?: Subject; topic?: string }) => void;
  onNavigateToLearningPath: () => void;
  onNavigateToGamification: () => void;
  onNavigateToFunZone: () => void;
  onNavigateToModelTestPapers: () => void;
  onViewSubmissionReport: (submission: ExamSubmission) => void;
  onOpenActivity: () => void;
}

export const StudentDashboardMobile: React.FC<StudentDashboardMobileProps> = ({
  activeChild, assignedExam, studentExams, weakTopics, strongTopics, nextRecommendedTopic, isKid,
  defaultTotalMarks, currentLevel, xp, xpProgress, studentStreak, studentTotalActivities,
  accuracyPct, unlockedBadgesCount, mobileSection, onMobileSectionChange,
  mobileCarouselIdx, onMobileCarouselChange, inferTopicSubject, onNavigateToArena,
  onNavigateToLearningPath, onNavigateToGamification, onNavigateToFunZone,
  onNavigateToModelTestPapers, onViewSubmissionReport, onOpenActivity,
}) => (
  <>
    {assignedExam && (
      <div className="flex sm:hidden items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 border border-yellow-300 shadow-sm text-stone-950 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-stone-950/10 flex items-center justify-center text-stone-950 shrink-0"><CalendarClock className="w-4 h-4" /></div>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-950">Assigned Challenge</div>
            <div className="text-xs font-bold text-stone-950 truncate">{assignedExam.subject} {assignedExam.chapterTopic ? `— ${assignedExam.chapterTopic}` : ''}</div>
            <div className="text-[10px] text-stone-800 font-medium truncate">{assignedExam.questionCount} Qs • {assignedExam.timeLimitMinutes}m • {assignedExam.difficulty.toUpperCase()}</div>
          </div>
        </div>
        <button onClick={() => onNavigateToArena()} className="shrink-0 px-3 py-1.5 rounded-xl bg-stone-950 text-yellow-400 font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer">Start <ArrowRight className="w-3 h-3 text-yellow-400" /></button>
      </div>
    )}
    <div className="flex sm:hidden gap-2 overflow-x-auto hide-scrollbar pb-0.5 -mx-3 px-3">
      <div onClick={onNavigateToGamification} className="flex-shrink-0 bg-gradient-to-br from-amber-50 to-orange-50 px-2.5 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95">
        <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-700 shrink-0"><Zap className="w-3 h-3 fill-current" /></div>
        <div className="min-w-0"><div className="text-[10px] font-bold text-amber-950 leading-tight">Lvl {currentLevel} • {xp} XP</div><div className="text-[9px] text-amber-800 font-medium truncate">{Math.round(xpProgress)}% to Lvl {currentLevel + 1}</div></div>
      </div>
      <div onClick={onOpenActivity} className="flex-shrink-0 bg-gradient-to-br from-stone-50 to-amber-50/40 px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95">
        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0"><Flame className="w-3 h-3 fill-current" /></div>
        <div className="min-w-0"><div className="text-[10px] font-bold text-stone-900 leading-tight">{studentStreak}d Streak</div><div className="text-[9px] text-stone-500 font-medium truncate">{studentTotalActivities} Activities</div></div>
      </div>
      <div className="flex-shrink-0 bg-gradient-to-br from-stone-50 via-white to-amber-50/30 px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0"><Target className="w-3 h-3" /></div>
        <div className="min-w-0"><div className="text-[10px] font-bold text-stone-900 leading-tight">{accuracyPct}% Accuracy</div><div className="text-[9px] text-stone-500 font-medium truncate">{studentExams.length} challenges</div></div>
      </div>
      <div onClick={onNavigateToGamification} className="flex-shrink-0 bg-gradient-to-br from-amber-50/60 via-stone-50 to-stone-100 px-2.5 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95">
        <div className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-amber-600 shrink-0"><Award className="w-3 h-3" /></div>
        <div className="min-w-0"><div className="text-[10px] font-bold text-amber-950 leading-tight">{unlockedBadgesCount} Badges</div><div className="text-[9px] text-amber-800 font-medium flex items-center gap-0.5">Trophy Cabinet →</div></div>
      </div>
    </div>
    <div className="flex sm:hidden p-1 bg-stone-100 rounded-xl border border-stone-200/80 shadow-2xs gap-1">
      {(['practice', 'analytics', 'history'] as const).map((section) => {
        const Icon = section === 'practice' ? Layers : section === 'analytics' ? BarChart3 : Clock;
        const label = section === 'practice' ? 'Dashboard' : section === 'analytics' ? 'Analytics' : 'History';
        return <button key={section} onClick={() => onMobileSectionChange(section)} className={`flex-1 py-1.5 px-1 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileSection === section ? 'bg-amber-400 text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}><Icon className="w-3.5 h-3.5" /><span>{label}</span></button>;
      })}
    </div>
    <div className={`flex sm:hidden flex-col gap-3.5 ${mobileSection !== 'practice' ? 'hidden' : ''}`}>


            {/* Internshala Style Hero Practice Carousel */}
            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-white p-3.5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-800">Featured Challenges</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full shadow-2xs">Featured</span>
                </div>
                {/* Carousel Pagination Dots */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, ...(weakTopics.length > 0 ? [2] : [])].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => onMobileCarouselChange(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${mobileCarouselIdx === idx ? 'w-5 bg-amber-500' : 'w-1.5 bg-stone-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Slide 0: Suggested Assessment */}
              {mobileCarouselIdx === 0 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300 font-bold text-[9px] uppercase mb-1">
                        <span>{nextRecommendedTopic ? nextRecommendedTopic.subject : 'Curriculum Assessment'}</span>
                        <span>•</span>
                        <span>Learning Path</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight truncate">
                        {nextRecommendedTopic
                          ? ((nextRecommendedTopic as any).topic || (nextRecommendedTopic as any).topicName || 'Next Milestone Topic')
                          : 'Curriculum Diagnostic Assessment'}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-normal line-clamp-1 mt-0.5">
                        {nextRecommendedTopic
                          ? ((nextRecommendedTopic as any).recommendedReason || 'Personalized focus area from diagnostic exam.')
                          : 'Calibrated to your strengths & weak topics'}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (nextRecommendedTopic) onNavigateToLearningPath();
                      else onNavigateToArena();
                    }}
                    className="w-full py-2 rounded-xl bg-amber-400 text-stone-900 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-500"
                  >
                    <span>{nextRecommendedTopic ? 'Continue Learning Path' : 'Start Diagnostic Test'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-900" />
                  </button>
                </div>
              )}

              {/* Slide 1: Quick Practice */}
              {mobileCarouselIdx === 1 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[9px] uppercase mb-1">
                        <span>Ready</span>
                        <span>•</span>
                        <span>All Core Subjects</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight truncate">
                        {activeChild.classGrade} • {activeChild.targetBoard}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                        {isKid ? '5 Questions • ~10 Mins' : '10 Questions • 15 Marks • ~15 Mins'}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToArena()}
                    className="w-full py-2 rounded-xl bg-amber-400 text-stone-900 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-500"
                  >
                    <span>{isKid ? 'Start Adventure Quest' : 'Launch Challenge'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-900" />
                  </button>
                </div>
              )}

              {/* Slide 2: Remedial Weak Topic Sprint (if exists) */}
              {mobileCarouselIdx === 2 && weakTopics.length > 0 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[9px] uppercase mb-1">
                        <span>Target Remedial</span>
                        <span>•</span>
                        <span>Score: {weakTopics[0].score}%</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight truncate">
                        Strengthen: {weakTopics[0].topic}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                        Boost your understanding in this topic with targeted MCQs.
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const targetTopic = weakTopics[0].topic;
                      const t = targetTopic.toLowerCase();
                      let sub: Subject = 'Science';
                      if (/histor|civic|democra|geog|social|sst/i.test(t)) sub = 'Social Studies';
                      else if (/math|algebra|calculus|trigono|fraction|geometr|equation/i.test(t)) sub = 'Mathematics';
                      else if (/python|oop|sql|data struct|algorithm|comput/i.test(t)) sub = 'Computer Science';
                      else if (/chemi|reaction|kinetics|solution/i.test(t)) sub = 'Chemistry';
                      else if (/physic|motion|force|optics|electric/i.test(t)) sub = 'Physics';
                      else if (/bio|cell|plant|animal|genetic/i.test(t)) sub = 'Biology';
                      else if (/gramm|tense|voice|english/i.test(t)) sub = 'English';
                      onNavigateToArena({ subject: sub, topic: targetTopic });
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Practice Weak Topic</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>

            <StudentDashboardExplore
              onNavigateToFunZone={onNavigateToFunZone}
              onNavigateToMocks={() => onNavigateToArena()}
              onNavigateToModelTestPapers={onNavigateToModelTestPapers}
            />

            {/* ── MOBILE: TOPIC MASTERY (Needs Revision & Strong Topics from Web Dashboard) ── */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs">Topic Mastery</h3>
                    <p className="text-[10px] text-stone-500 font-medium">Personalized Revision from Tests</p>
                  </div>
                </div>
                {weakTopics.length > 0 ? (
                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    {weakTopics.length} Focus Areas
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    All Mastered
                  </span>
                )}
              </div>

              {/* Needs Revision / Weak Topics (Up to 3 topics) */}
              {weakTopics.length > 0 ? (
                <div className="space-y-1.5">
                  {weakTopics.slice(0, 3).map(({ topic, score }) => (
                    <div
                      key={topic}
                      onClick={() => onNavigateToArena({ subject: inferTopicSubject(topic), topic })}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-300 transition-all cursor-pointer active:scale-95 group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-stone-900 truncate">{topic}</div>
                        <div className="text-[10px] text-stone-500 font-medium">{inferTopicSubject(topic)}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${score < 50 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {score}%
                        </span>
                        <span className="text-[10px] font-bold text-stone-900 bg-amber-400 px-2 py-1 rounded-lg shadow-2xs group-hover:bg-amber-500 transition-colors flex items-center gap-0.5">
                          Practice →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : strongTopics.length > 0 ? (
                <div className="space-y-1.5">
                  {strongTopics.slice(0, 2).map(({ topic }) => (
                    <div key={topic} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-stone-800 truncate">{topic}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Mastered
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                  <p>Take tests to discover your weak and strong topics.</p>
                </div>
              )}
            </div>

            {/* ── MOBILE: RECENT CHALLENGES (Latest Test History from Web Dashboard) ── */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs">Recent Challenges</h3>
                    <p className="text-[10px] text-stone-500 font-medium">History &amp; Performance</p>
                  </div>
                </div>
                {studentExams.length > 0 && (
                  <button
                    onClick={() => onMobileSectionChange('history')}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                  >
                    View All ({studentExams.length}) →
                  </button>
                )}
              </div>

              {studentExams.length > 0 ? (
                <div className="space-y-2">
                  {studentExams.slice(0, 2).map((sub) => {
                    const subTotalMarks = sub.totalMarks || defaultTotalMarks;
                    const scorePct = Math.round((sub.marksObtained / subTotalMarks) * 100);
                    const dateStr = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={sub.id}
                        onClick={() => onViewSubmissionReport(sub)}
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200/80 transition-all cursor-pointer active:scale-95 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-stone-900 truncate">
                              {getExamDisplaySubject(sub)}
                            </div>
                            <div className="text-[10px] text-stone-500 font-medium">
                              {dateStr} • {(sub as any).questionCount || (sub as any).questions?.length || 10} Qs
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${scorePct >= 75
                            ? 'bg-amber-400 text-stone-950'
                            : scorePct >= 50
                              ? 'bg-stone-200 text-stone-800'
                              : 'bg-stone-900 text-amber-300'
                            }`}>
                            {scorePct}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60 text-[10px]">
                          <span className="font-semibold text-stone-600">
                            Score: <strong className="text-stone-900">{sub.marksObtained}/{subTotalMarks}</strong>
                          </span>
                          <span className="font-bold text-amber-700 flex items-center gap-0.5">
                            Report <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500 space-y-1.5">
                  <p>No challenges completed yet.</p>
                  <button
                    onClick={() => onNavigateToArena()}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-[11px] shadow-2xs cursor-pointer active:scale-95"
                  >
                    Start First Test →
                  </button>
                </div>
              )}
            </div>

    </div>
  </>
);
