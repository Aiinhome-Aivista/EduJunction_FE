import { ChildAccount, ExamSubmission } from '../types';

export interface StudentAnalyticsMetrics {
  scorePct: number;          // Learning Progress / Average Score (0-100)
  readinessScore: number;    // Board Readiness Score (0-100)
  masteryPct: number;        // Average Topic Mastery % (0-100)
  totalExams: number;
  streak: number;
  latestExam?: ExamSubmission;
  childExams: ExamSubmission[];
  strongestTopic: string;
  weakestTopic: string;
}

/**
 * Single Source of Truth for Student Academic Performance & Exam Readiness Calculation.
 *
 * Unified Rules:
 * 1. Score % (Progress / Avg Score):
 *    - If student has completed exams, calculate exact average of individual exam accuracy percentages.
 *    - Otherwise, fallback to child.averageScore.
 *
 * 2. Exam Readiness:
 *    - Pedagogical weighted formula: 60% Live Exam Score + 40% Curriculum Topic Mastery.
 *    - If no topic mastery data is available, returns exact Score %.
 *
 * 3. Topic Strengths & Weaknesses:
 *    - Extracted directly from authentic topic mastery dictionary.
 */
export function calculateStudentMetrics(
  child: ChildAccount | null | undefined,
  examHistory: ExamSubmission[] = []
): StudentAnalyticsMetrics {
  if (!child) {
    return {
      scorePct: 0,
      readinessScore: 0,
      masteryPct: 0,
      totalExams: 0,
      streak: 0,
      childExams: [],
      strongestTopic: 'None yet',
      weakestTopic: 'None yet',
    };
  }

  // 1. Gather all exams belonging to this child
  const childExams: ExamSubmission[] = (child.recentExams && child.recentExams.length > 0)
    ? child.recentExams
    : examHistory.filter(e => String(e.studentId) === String(child.id));

  const isKids = ['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c =>
    (child.classGrade || '').includes(c)
  );
  const defaultTotalMarks = isKids ? 5 : 15;

  // 2. Calculate Unrounded Base Exam Accuracy Score
  let rawScore = 0;
  if (childExams.length > 0) {
    const sumAccuracy = childExams.reduce((acc, e) => {
      if (e.accuracyPercentage != null) {
        return acc + Number(e.accuracyPercentage);
      }
      const marks = Number(e.marksObtained) || 0;
      const total = Number(e.totalMarks) || defaultTotalMarks;
      return acc + (marks / total) * 100;
    }, 0);
    rawScore = sumAccuracy / childExams.length;
  } else {
    const rawAvg = Number(child.averageScore) || 0;
    rawScore = rawAvg > 10 ? rawAvg : rawAvg * 10;
  }
  rawScore = Math.min(100, Math.max(0, rawScore));
  const scorePct = Math.round(rawScore);

  // 3. Calculate Authentic Topic Mastery & Average
  const topicEntries = Object.entries(child.topicMastery || {}).map(([topic, val]) => {
    const num = Number(val) || 0;
    const pct = num > 10 ? num : num * 10;
    return { topic, pct };
  });

  let avgMastery = 0;
  let strongestTopic = 'General Foundations';
  let weakestTopic = 'General Foundations';

  if (topicEntries.length > 0) {
    avgMastery = topicEntries.reduce((sum, t) => sum + t.pct, 0) / topicEntries.length;
    
    // Sort topics by mastery
    const sorted = [...topicEntries].sort((a, b) => b.pct - a.pct);
    strongestTopic = sorted[0].topic;
    weakestTopic = sorted[sorted.length - 1].topic;
  } else {
    avgMastery = rawScore;
  }
  avgMastery = Math.min(100, Math.max(0, avgMastery));
  const masteryPct = Math.round(avgMastery);

  // 4. Calculate Unified Exam Readiness
  let readinessScore = scorePct;
  if (topicEntries.length > 0 && (childExams.length > 0 || (child.totalExamsTaken || 0) > 0 || rawScore > 0)) {
    readinessScore = Math.min(100, Math.max(0, Math.round(0.6 * rawScore + 0.4 * avgMastery)));
  }

  return {
    scorePct,
    readinessScore,
    masteryPct,
    totalExams: childExams.length || child.totalExamsTaken || 0,
    streak: child.streakDays || 0,
    latestExam: childExams[0],
    childExams,
    strongestTopic,
    weakestTopic,
  };
}
