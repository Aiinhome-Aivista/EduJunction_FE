import ApiServices from '../services/ApiServices';

export interface WellbeingResponseData {
  mood: string;
  moodEmoji?: string;
  hobby: string;
  hobbyCategory: 'music' | 'sports' | 'art' | 'gaming' | 'reading' | 'other';
  hobbyDetail: string; // e.g. "Arijit Singh", "Cricket (Virat)", etc.
  supportPerson: string; // e.g. "Mom", "Dad", "Grandparents", etc.
  examMindset: string;
  adviceMessage?: string;
  timestamp: string;
  examIndex: number;
}

export interface WellbeingStorageState {
  lastCheckinExamIndex: number;
  checkinCount: number;
  lastCheckinDate: string | null;
  latestData: WellbeingResponseData | null;
  history: WellbeingResponseData[];
}

const STORAGE_PREFIX = 'edujunction_wellbeing_student_';

export function getWellbeingState(childId: string | number): WellbeingStorageState {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${childId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse wellbeing storage', e);
  }
  return {
    lastCheckinExamIndex: -1,
    checkinCount: 0,
    lastCheckinDate: null,
    latestData: null,
    history: []
  };
}

// TESTING MODE FLAG:
// Set to true so the wellbeing chat appears before EVERY single mock exam for easy testing and evaluation.
// Once testing is complete, switch to false to enforce the 5-exam cadence.
export const TESTING_MODE_SHOW_EVERY_EXAM = true;

/**
 * Cadence rule:
 * 1. In testing mode: always returns true before every exam.
 * 2. In production mode: shows on 1st exam, and thereafter every 5 exams.
 */
export function shouldTriggerWellbeingCheckin(
  childId: string | number,
  totalExamsTaken: number = 0
): boolean {
  if (!childId) return false;

  // Active testing mode: trigger before every exam
  if (TESTING_MODE_SHOW_EVERY_EXAM) {
    return true;
  }

  const state = getWellbeingState(childId);

  // 1st time condition: never completed check-in before, or taking 1st exam
  if (state.checkinCount === 0 || state.lastCheckinExamIndex < 0) {
    return true;
  }

  // Interval check: after 5 exams have been taken since last checkin
  const examsSince = totalExamsTaken - state.lastCheckinExamIndex;
  if (examsSince >= 5) {
    return true;
  }

  return false;
}

export async function saveWellbeingRecord(
  childId: string | number,
  totalExamsTaken: number,
  data: Omit<WellbeingResponseData, 'timestamp' | 'examIndex'>
): Promise<WellbeingStorageState> {
  const currentState = getWellbeingState(childId);
  const now = new Date().toISOString();

  const completeRecord: WellbeingResponseData = {
    ...data,
    timestamp: now,
    examIndex: totalExamsTaken
  };

  const updatedState: WellbeingStorageState = {
    lastCheckinExamIndex: totalExamsTaken,
    checkinCount: currentState.checkinCount + 1,
    lastCheckinDate: now,
    latestData: completeRecord,
    history: [completeRecord, ...(currentState.history || [])].slice(0, 20)
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${childId}`, JSON.stringify(updatedState));
  } catch (e) {
    console.warn('Failed to write wellbeing storage', e);
  }

  // Background sync to backend API (graceful, non-blocking)
  try {
    ApiServices.submitWellbeingCheckin({
      student_id: childId,
      mood: data.mood,
      hobby: data.hobby,
      hobby_detail: data.hobbyDetail,
      support_person: data.supportPerson,
      exam_mindset: data.examMindset,
      conversation_summary: `Mood: ${data.mood} | Hobby: ${data.hobby} (${data.hobbyDetail}) | Emotional Anchor: ${data.supportPerson} | Mindset: ${data.examMindset}`,
      exam_index: totalExamsTaken,
      raw_responses: completeRecord
    }).catch(() => {
      // Backend sync error ignored, local storage already persisted
    });
  } catch {
    // Non-blocking
  }

  return updatedState;
}

export function deferWellbeingCheckin(childId: string | number, currentExamIndex: number = 0) {
  // If student chooses "Skip to Exam", don't immediately pop up again on next page reload;
  // defer by incrementing checkin count or recording skip timestamp
  const state = getWellbeingState(childId);
  const updatedState: WellbeingStorageState = {
    ...state,
    lastCheckinExamIndex: currentExamIndex,
    lastCheckinDate: new Date().toISOString(),
  };
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${childId}`, JSON.stringify(updatedState));
  } catch (e) {
    console.warn(e);
  }
}
