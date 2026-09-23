export type Board = 'CBSE' | 'ICSE' | 'ISC' | 'WBBSE' | 'WBCHSE' | 'UK-Cambridge' | 'NCERT' | 'NEET' | 'IIT' | 'WB';

export type ClassGrade = 
  | 'Class 1'
  | 'Class 2'
  | 'Class 3'
  | 'Class 4'
  | 'Class 5' 
  | 'Class 6' 
  | 'Class 7' 
  | 'Class 8' 
  | 'Class 9' 
  | 'Class 10' 
  | 'Class 11' 
  | 'Class 12';

export const BOARD_CLASSES_MAP: Record<string, ClassGrade[]> = {
  CBSE: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ],
  ICSE: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ],
  ISC: ['Class 11', 'Class 12'],
  WBBSE: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ],
  WBCHSE: ['Class 11', 'Class 12'],
  WB: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ],
  'UK-Cambridge': [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ],
  NCERT: [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ],
  NEET: ['Class 11', 'Class 12'],
  IIT: ['Class 11', 'Class 12'],
};

export type Subject = 
  | 'Mathematics' 
  | 'Physics' 
  | 'Chemistry' 
  | 'Biology' 
  | 'Science' 
  | 'Social Studies' 
  | 'English' 
  | 'Computer Science' 
  | 'Logical Reasoning'
  | (string & {});

export const CLASS_SUBJECTS_MAP: Record<string, Subject[]> = {
  // Primary (Class 1 to 5)
  'Class 1': ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'],
  'Class 2': ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'],
  'Class 3': ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'],
  'Class 4': ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'],
  'Class 5': ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'],

  // Middle School (Class 6 to 8)
  'Class 6': ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'],
  'Class 7': ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'],
  'Class 8': ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'],

  // Secondary (Class 9 to 10)
  'Class 9': ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'],
  'Class 10': ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'],

  // Higher Secondary (Class 11 to 12)
  'Class 11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Logical Reasoning'],
  'Class 12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Logical Reasoning'],
};

export type ExamDifficulty = 'simple' | 'medium' | 'hard';

export type QuestionType = 'mcq' | 'objective' | 'numerical' | 'logical';

export interface ReferenceLink {
  title: string;
  source: string;
  url: string;
  description: string;
  type: 'video' | 'article' | 'official_syllabus' | 'practice';
}

export interface Question {
  id: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation: string;
  difficulty: ExamDifficulty;
  marks: number; // 1 mark each
  topic: string;
  board: Board;
  referenceLinks?: ReferenceLink[];
  hint?: string;
}

export interface Exam {
  id: string;
  title: string;
  board: Board;
  classGrade: ClassGrade;
  subject: Subject;
  difficulty: ExamDifficulty;
  totalMarks: number; // 10 marks
  questionCount: number; // 10 questions
  timeLimitMinutes: number; // default 15
  questions: Question[];
  ragKnowledgeNodesUsed: string[];
  createdAt: string;
}

export interface QuestionEvaluation {
  questionId: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  options?: string[];
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number; // e.g. 0, 0.5, 1, 1.5, 2
  questionMarks?: number;
  explanation: string;
  misconceptionIdentified?: string;
  feedback?: string;
  matchedKeywords?: string[];
  missedKeywords?: string[];
  referenceLinks: ReferenceLink[];
  topic: string;
}

export interface KGraphInsight {
  topic: string;
  masteryPercentage: number;
  status: 'mastered' | 'reinforce' | 'critical_gap';
  recommendedAction: string;
}

export interface DiagnosticAnalysis {
  overallBand: 'Needs Foundation' | 'Developing' | 'Proficient' | 'Advanced Mastery' | 'Competitive Ready' | 'Master';
  masteryScorePercentage: number;
  strengths: string[];
  areasToImprove: string[];
  kGraphInsights: KGraphInsight[];
  evolutionaryRoadmap: string;
  encouragementNote: string;
  recommendedNextExam: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    reason: string;
  };
  curatedStudyLinks: ReferenceLink[];
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  board: Board;
  classGrade: ClassGrade;
  subject: Subject;
  difficulty: ExamDifficulty;
  answers: Record<string, string>; // questionId -> answer
  marksObtained: number; // out of 10
  totalMarks: number; // 10
  accuracyPercentage: number;
  timeTakenSeconds: number;
  submittedAt: string;
  evaluations: QuestionEvaluation[];
  analysis: DiagnosticAnalysis;
  xpEarned?: number;
}

export interface ChildAccount {
  id: string;
  parentId: string;
  name: string;
  username?: string;
  avatar: string;
  classGrade: ClassGrade;
  targetBoard: Board;
  schoolName?: string;
  schoolEmail?: string;
  email?: string;
  pin?: string;
  dailyExamsTakenToday: number;
  lastExamDate?: string;
  totalExamsTaken: number;
  averageScore: number; // out of 10
  topicMastery: Record<string, number>; // topic -> percentage 0..100
  streakDays: number;
  createdAt: string;
  recentExams?: ExamSubmission[];
  // Gamification fields
  xp?: number;
  level?: number;
  earnedBadgeIds?: string[];
}

// Gamification Models
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'mastery' | 'streak' | 'score' | 'speed' | 'explorer';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  category: BadgeCategory;
  xpReward: number;
  requirementText: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatar: string;
  classGrade: ClassGrade;
  targetBoard: Board;
  schoolName?: string;
  xp: number;
  level: number;
  averageScore: number;
  examsCompleted: number;
  streakDays: number;
  badgesCount: number;
  isCurrentStudent?: boolean;
}

// Adaptive Learning Path Models
export type LearningPathStatus = 'locked' | 'available' | 'in_progress' | 'mastered' | 'remedial_needed';
export type LearningLevel = 'foundational' | 'intermediate' | 'advanced_hots';

export interface LearningPathNode {
  id: string;
  topic: string;
  chapterName: string;
  subject: Subject;
  classGrade: ClassGrade;
  board: Board;
  status: LearningPathStatus;
  masteryPercentage: number;
  level: LearningLevel;
  prerequisites: string[];
  keyConcepts: string[];
  commonMisconceptions: string[];
  curatedResources: ReferenceLink[];
  practiceExamConfig: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    focusTopic: string;
  };
  recommendedReason: string;
}

// Parent-Teacher Communication Models
export interface TeacherContact {
  id: string;
  name: string;
  role: string;
  subject: Subject | 'All Subjects' | 'Class Advisor';
  schoolName: string;
  email: string;
  avatar: string;
  phone?: string;
  verified: boolean;
}

export interface ParentTeacherMessage {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  childId: string;
  childName: string;
  senderRole: 'parent' | 'teacher';
  message: string;
  timestamp: string;
  attachedSubmissionId?: string;
  attachedSubmissionTitle?: string;
  actionItems?: string[];
  status: 'sent' | 'delivered' | 'read' | 'action_taken';
}

export interface SharedDossier {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  shareToken: string;
  createdAt: string;
  expiresAt: string;
  notes: string;
  recipients: string[];
  includedSubmissionsCount: number;
  status: 'active' | 'revoked';
}

export interface PTMSchedule {
  id: string;
  parentId: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  scheduledAt: string;
  topic: string;
  meetingLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface ParentAccount {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: 'parent';
  children: ChildAccount[];
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface RunbookKGraphNode {
  id: string;
  board: Board;
  classGrade: ClassGrade;
  subject: Subject;
  chapterName: string;
  coreConcepts: string[];
  keyFormulasOrRules: string[];
  commonTraps: string[];
  curatedReferenceUrls: ReferenceLink[];
  sampleQuestionArchetypes: string[];
  difficultyCalibration: {
    simple: string;
    medium: string;
    hard: string;
  };
  lastUpdated: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorRole: string;
  readTime: string;
  publishedDate: string;
  category: 'Board Strategies' | 'NEET & IIT' | 'Parenting & Pedagogy' | 'Adaptive Learning';
  summary: string;
  content: string[];
  tags: string[];
}

export interface ScienceJokeOrAnecdote {
  id: string;
  category: 'anecdote' | 'joke' | 'fact' | 'riddle';
  title: string;
  subject: 'Physics' | 'Mathematics' | 'Chemistry' | 'Biology' | 'General Science' | 'History of Science';
  setupOrStory: string;
  punchlineOrTakeaway?: string;
  characterOrOrigin?: string;
  funReactionEmoji: string;
  likesCount: number;
}

export type BrainBreakGameType = 'speed-math' | 'memory-match' | 'word-scramble' | 'particle-pop' | 'anecdote-vault';

export type AppPersona = 'parent' | 'child';

export interface MenuItemPermission {
  id: number;
  pageName: string;
  pageRoute: string;
  icon: string | null;
  menuOrder: number;
}
