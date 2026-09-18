import { 
  BlogPost, 
  ParentAccount, 
  ExamSubmission, 
  Badge, 
  LeaderboardEntry, 
  LearningPathNode, 
  TeacherContact, 
  ParentTeacherMessage, 
  SharedDossier 
} from '../types';

export const INITIAL_PARENT: ParentAccount = {
  id: 'parent-001',
  name: 'Dr. Rajesh & Sunita Sharma',
  email: 'parent.sharma@example.com',
  role: 'parent',
  createdAt: '2026-06-10',
  children: [
    {
      id: 'child-01',
      parentId: 'parent-001',
      name: 'Aarav Sharma',
      avatar: '👦',
      classGrade: 'Class 10',
      targetBoard: 'CBSE',
      schoolName: 'Delhi Public School, R.K. Puram',
      pin: '1234',
      dailyExamsTakenToday: 0,
      lastExamDate: '2026-08-26',
      totalExamsTaken: 14,
      averageScore: 8.2,
      streakDays: 4,
      createdAt: '2026-06-12',
      xp: 1420,
      level: 6,
      earnedBadgeIds: ['badge-pioneer', 'badge-streak-3', 'badge-math-whiz'],
      topicMastery: {
        'Quadratic Equations': 85,
        'Trigonometry': 78,
        'Chemical Reactions': 90,
        'Electricity & Magnetism': 65,
        'Coordinate Geometry': 80
      }
    },
    {
      id: 'child-02',
      parentId: 'parent-001',
      name: 'Ananya Sharma',
      avatar: '👧',
      classGrade: 'Class 12',
      targetBoard: 'NEET',
      schoolName: 'Modern School, Barakhamba',
      pin: '5678',
      dailyExamsTakenToday: 0,
      lastExamDate: '2026-08-27',
      totalExamsTaken: 28,
      averageScore: 8.8,
      streakDays: 11,
      createdAt: '2026-06-15',
      xp: 3250,
      level: 12,
      earnedBadgeIds: ['badge-pioneer', 'badge-streak-7', 'badge-perfect-10', 'badge-neet-champ', 'badge-speed-demon'],
      topicMastery: {
        'Ray Optics & Lenses': 88,
        'Chemical Kinetics': 92,
        'Genetics & Heredity': 95,
        'Electrostatics': 72,
        'Plant Physiology': 84
      }
    },
    {
      id: 'child-03',
      parentId: 'parent-001',
      name: 'Kabir Sharma',
      avatar: '🧒',
      classGrade: 'Class 7',
      targetBoard: 'ICSE',
      schoolName: 'St. Xavier’s Collegiate School',
      pin: '4321',
      dailyExamsTakenToday: 0,
      lastExamDate: '2026-08-25',
      totalExamsTaken: 8,
      averageScore: 7.6,
      streakDays: 2,
      createdAt: '2026-07-01',
      xp: 760,
      level: 3,
      earnedBadgeIds: ['badge-pioneer'],
      topicMastery: {
        'Fractions & Decimals': 82,
        'Plant & Animal Cells': 75,
        'Force and Pressure': 68,
        'Medieval Indian History': 80
      }
    }
  ]
};

export const SAMPLE_HISTORIC_SUBMISSION: ExamSubmission = {
  id: 'sub-demo-01',
  examId: 'exam-cbse10-math-demo',
  examTitle: 'Class 10 CBSE Mathematics: Quadratic Equations & Roots Diagnostic',
  studentId: 'child-01',
  studentName: 'Aarav Sharma',
  board: 'CBSE',
  classGrade: 'Class 10',
  subject: 'Mathematics',
  difficulty: 'medium',
  answers: {
    'q1': 'B',
    'q2': '6',
    'q3': 'A',
    'q4': 'Two distinct real roots',
    'q5': 'C',
    'q6': '4',
    'q7': 'B',
    'q8': 'D',
    'q9': 'k = 6 or k = -6',
    'q10': 'A'
  },
  marksObtained: 8,
  totalMarks: 10,
  accuracyPercentage: 80,
  timeTakenSeconds: 740,
  submittedAt: '2026-08-26T18:45:00Z',
  evaluations: [
    {
      questionId: 'q1',
      questionNumber: 1,
      type: 'mcq',
      questionText: 'What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?',
      options: ['A) 8', 'B) -8', 'C) 16', 'D) 0'],
      studentAnswer: 'B',
      correctAnswer: 'B',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, the equation has no real roots.',
      topic: 'Discriminant Calculation',
      referenceLinks: [
        {
          title: 'NCERT Class 10 Maths Chapter 4 - Discriminant Rules',
          source: 'NCERT Official',
          url: 'https://ncert.nic.in/textbook.php?jemh1=4-15',
          description: 'Official textbook section on nature of quadratic roots.',
          type: 'official_syllabus'
        }
      ]
    },
    {
      questionId: 'q2',
      questionNumber: 2,
      type: 'numerical',
      questionText: 'Find the positive root of the quadratic equation x² - 5x - 6 = 0.',
      studentAnswer: '6',
      correctAnswer: '6',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'Factorizing: (x - 6)(x + 1) = 0. The roots are x = 6 and x = -1. The positive root is 6.',
      topic: 'Quadratic Factorization',
      referenceLinks: []
    },
    {
      questionId: 'q3',
      questionNumber: 3,
      type: 'mcq',
      questionText: 'If the equation kx² - 6x + 1 = 0 has equal real roots, find the value of k.',
      options: ['A) 9', 'B) 3', 'C) 6', 'D) 12'],
      studentAnswer: 'A',
      correctAnswer: 'A',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'For equal real roots, D = b² - 4ac = 0. Hence (-6)² - 4(k)(1) = 0 => 36 - 4k = 0 => k = 9.',
      topic: 'Equal Roots Condition',
      referenceLinks: []
    },
    {
      questionId: 'q4',
      questionNumber: 4,
      type: 'objective',
      questionText: 'State the nature of the roots of 3x² - 2x + 1/3 = 0.',
      studentAnswer: 'Two distinct real roots',
      correctAnswer: 'Two equal real roots',
      isCorrect: false,
      marksAwarded: 0,
      explanation: 'Multiplying by 3 gives 9x² - 6x + 1 = 0. Discriminant D = (-6)² - 4(9)(1) = 36 - 36 = 0. When D = 0, roots are real and equal.',
      misconceptionIdentified: 'Fractional coefficient confusion caused incorrect discriminant calculation.',
      topic: 'Nature of Roots with Fractions',
      referenceLinks: [
        {
          title: 'Khan Academy: Roots when D = 0 and Perfect Squares',
          source: 'Khan Academy',
          url: 'https://www.khanacademy.org/math/in-in-grade-10-ncert/x573d8ce2f0be0095:quadratic-equations',
          description: 'Step-by-step visual tutorial on identifying equal roots in rational coefficients.',
          type: 'video'
        }
      ]
    },
    {
      questionId: 'q5',
      questionNumber: 5,
      type: 'mcq',
      questionText: 'Which of the following is NOT a quadratic equation?',
      options: [
        'A) (x - 2)² + 1 = 2x - 3',
        'B) x(x + 1) + 8 = (x + 2)(x - 2)',
        'C) x(2x + 3) = x² + 1',
        'D) (x + 2)³ = x³ - 4'
      ],
      studentAnswer: 'C',
      correctAnswer: 'B',
      isCorrect: false,
      marksAwarded: 0,
      explanation: 'In option B: x² + x + 8 = x² - 4. The x² terms cancel out on both sides leaving x + 12 = 0, which is a linear equation (degree 1), not quadratic.',
      misconceptionIdentified: 'Overlooked cancellation of the highest power x² on algebraic expansion.',
      topic: 'Identifying Quadratic Forms',
      referenceLinks: [
        {
          title: 'CBSE Class 10 Exemplar: Reducible and Non-Quadratic Identification',
          source: 'CBSE Academic',
          url: 'https://cbseacademic.nic.in/sqp_classx_2024.html',
          description: 'Common pitfalls and non-standard algebra traps in CBSE board exams.',
          type: 'article'
        }
      ]
    },
    {
      questionId: 'q6',
      questionNumber: 6,
      type: 'numerical',
      questionText: 'If α and β are roots of x² - 7x + 12 = 0, find α + β - αβ.',
      studentAnswer: '4',
      correctAnswer: '-5',
      isCorrect: false,
      marksAwarded: 0,
      explanation: 'Sum of roots α + β = -(-7)/1 = 7. Product of roots αβ = 12/1 = 12. Therefore, α + β - αβ = 7 - 12 = -5.',
      misconceptionIdentified: 'Subtracted 12 from 7 but lost the negative sign in final arithmetic.',
      topic: 'Sum and Product of Roots Relations',
      referenceLinks: []
    },
    {
      questionId: 'q7',
      questionNumber: 7,
      type: 'mcq',
      questionText: 'The sum of the squares of two consecutive positive even integers is 340. What are the integers?',
      options: ['A) 10 and 12', 'B) 12 and 14', 'C) 14 and 16', 'D) 8 and 10'],
      studentAnswer: 'B',
      correctAnswer: 'B',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'Let integers be 2n and 2n+2. (12)² + (14)² = 144 + 196 = 340.',
      topic: 'Quadratic Word Problems',
      referenceLinks: []
    },
    {
      questionId: 'q8',
      questionNumber: 8,
      type: 'mcq',
      questionText: 'If 1/2 is a root of the equation x² + kx - 5/4 = 0, then the value of k is:',
      options: ['A) 2', 'B) -2', 'C) 1/4', 'D) 2'],
      studentAnswer: 'D',
      correctAnswer: 'D',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'Substitute x = 1/2: (1/2)² + k(1/2) - 5/4 = 0 => 1/4 + k/2 - 5/4 = 0 => k/2 - 1 = 0 => k = 2.',
      topic: 'Root Substitution in Quadratic Equations',
      referenceLinks: []
    },
    {
      questionId: 'q9',
      questionNumber: 9,
      type: 'objective',
      questionText: 'Solve for x: (2x - 3)/(x - 1) - 4(x - 1)/(2x - 3) = 3 (where x ≠ 1, 3/2). Express main positive root.',
      studentAnswer: 'k = 6 or k = -6',
      correctAnswer: 'x = 2',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'Let y = (2x - 3)/(x - 1). Then y - 4/y = 3 => y² - 3y - 4 = 0 => (y - 4)(y + 1) = 0. Solving yields x = 2 or x = 4/3.',
      topic: 'Equations Reducible to Quadratic',
      referenceLinks: []
    },
    {
      questionId: 'q10',
      questionNumber: 10,
      type: 'logical',
      questionText: 'Assertion (A): 4x² - 12x + 9 = 0 has repeated roots.\nReason (R): The discriminant of ax² + bx + c = 0 is zero for equal roots.',
      options: [
        'A) Both A and R are true and R is the correct explanation of A',
        'B) Both A and R are true but R is not the correct explanation of A',
        'C) A is true but R is false',
        'D) A is false but R is true'
      ],
      studentAnswer: 'A',
      correctAnswer: 'A',
      isCorrect: true,
      marksAwarded: 1,
      explanation: 'D = (-12)² - 4(4)(9) = 144 - 144 = 0. When D = 0, roots are repeated/equal. Both assertion and reason are true, and R correctly explains A.',
      topic: 'Assertion-Reasoning Logic',
      referenceLinks: []
    }
  ],
  analysis: {
    overallBand: 'Proficient',
    masteryScorePercentage: 80,
    strengths: [
      'Strong grasp of standard quadratic formulas and discriminant computation.',
      'High accuracy on algebraic word problems and assertion-reasoning logic.',
      'Quick response speed averaging 74 seconds per question.'
    ],
    areasToImprove: [
      'Watch out for hidden algebraic cancellations where x² terms vanish on both sides.',
      'Double-check negative sign operations when subtracting products in Vieta formulas.',
      'Re-verify discriminant calculations when equations include fractions.'
    ],
    kGraphInsights: [
      {
        topic: 'Discriminant & Nature of Roots',
        masteryPercentage: 85,
        status: 'mastered',
        recommendedAction: 'Ready to tackle Olympiad/Hard level questions with parametric variables.'
      },
      {
        topic: 'Algebraic Form Identification & Reducibility',
        masteryPercentage: 70,
        status: 'reinforce',
        recommendedAction: 'Practice 5 questions identifying deceptive linear vs quadratic expansions.'
      },
      {
        topic: 'Sum & Product of Roots (Vieta Relations)',
        masteryPercentage: 75,
        status: 'reinforce',
        recommendedAction: 'Review sign preservation rules when calculating α + β - αβ.'
      }
    ],
    evolutionaryRoadmap: 'Aarav has shown solid foundational mastery of Class 10 Quadratic Equations (8/10). Next evolutionary step: Progress to "Hard" difficulty with quadratic inequalities, simultaneous non-linear roots, and cross-chapter linkage with Coordinate Geometry.',
    encouragementNote: 'Outstanding effort, Aarav! You scored 8/10 on your CBSE Class 10 diagnostic test. With just a few minutes polishing sign management in Vieta relations, you are well on track for a 100% board score!',
    recommendedNextExam: {
      board: 'CBSE',
      classGrade: 'Class 10',
      subject: 'Mathematics',
      difficulty: 'hard',
      reason: 'Score > 7.5 indicates readiness for High-Order Thinking (HOTS) and Board 5-marker challenge questions.'
    },
    curatedStudyLinks: [
      {
        title: 'NCERT Class 10 Mathematics Chapter 4 - Complete Exemplar Problems',
        source: 'NCERT Official Portal',
        url: 'https://ncert.nic.in/textbook.php?jemh1=4-15',
        description: 'Official NCERT chapter on Quadratic Equations with derivations and exemplar problems.',
        type: 'official_syllabus'
      },
      {
        title: 'Khan Academy - Advanced Quadratic Reductions and Word Problems',
        source: 'Khan Academy India',
        url: 'https://www.khanacademy.org/math/in-in-grade-10-ncert/x573d8ce2f0be0095:quadratic-equations',
        description: 'Interactive exercises for reducing rational equations and avoiding sign slips.',
        type: 'practice'
      }
    ]
  }
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-01',
    title: 'ICSE vs CBSE vs Cambridge: Deconstructing Question Taxonomy for Classes 9–12',
    slug: 'icse-vs-cbse-cambridge-question-taxonomy',
    author: 'Dr. Meenakshi Sundaram',
    authorRole: 'Curriculum Director & Former CISCE Chief Examiner',
    readTime: '6 min read',
    publishedDate: '2026-08-20',
    category: 'Board Strategies',
    summary: 'A deep dive into how ICSE demands descriptive rigor, CBSE prioritizes application-based competency questions, and UK-Cambridge tests command words.',
    content: [
      'Every major board approaches assessment with distinct pedagogical philosophies. While parents often compare syllabi, the actual discriminator lies in the question taxonomy.',
      '**CBSE (Central Board of Secondary Education):** Following NEP 2020 guidelines, CBSE has shifted over 50% of question weightage to Competency-Based Questions (CBQs). These include real-world case studies, assertion-reasoning matrices, and data interpretation scenarios.',
      '**ICSE & ISC (CISCE):** ICSE questions demand meticulous procedural steps, precise scientific nomenclature, and comprehensive derivation mechanics. In mathematics and commercial arithmetic, losing an intermediate unit or step immediately penalizes marks.',
      '**UK-Cambridge (IGCSE & A-Levels):** Cambridge examinations pivot around strict "Command Words" such as State, Describe, Explain, Evaluate, and Deduce. A student writing a description when asked to "Explain" will score zero marks on the marking rubric.',
      'Our AI-RAG engine dynamically adjusts its generation runbook depending on which board you select, guaranteeing that a Class 10 student taking a CBSE test receives competency cases, while an ICSE student is evaluated on strict procedural rubrics.'
    ],
    tags: ['CBSE', 'ICSE', 'Cambridge', 'Exam Strategy', 'Pedagogy']
  },
  {
    id: 'blog-02',
    title: 'The 10-Mark Diagnostic Power: Why Micro-Assessments Beat 3-Hour Cramming',
    slug: 'the-10-mark-diagnostic-micro-assessment-power',
    author: 'Prof. Arvind Nambiar',
    authorRole: 'Cognitive Science Researcher & EdTech Strategist',
    readTime: '5 min read',
    publishedDate: '2026-08-18',
    category: 'AI & RAG Learning',
    summary: 'How 10-question, 10-mark focused diagnostic tests activate the testing effect, prevent cognitive burnout, and construct high-precision knowledge graphs.',
    content: [
      'In traditional education, students subject themselves to infrequent, high-stakes 3-hour mock exams. Cognitive psychology research shows that long tests often measure stamina and test fatigue rather than precise concept mastery.',
      'By distilling each evaluation into a calibrated 10-mark, 10-question sprint comprising MCQs, numericals, short objectives, and logical assertion cases, three cognitive breakthroughs occur:',
      '1. **Immediate Retrieval Practice:** The testing effect is activated instantly, transferring concepts from working memory to long-term memory.',
      '2. **Zero Fatigue Distortion:** Students approach all 10 questions with maximum cognitive focus, ensuring that errors represent genuine concept gaps rather than simple careless fatigue.',
      '3. **High-Resolution RAG Knowledge Graph Updates:** In 15 minutes, our system updates the child’s evolutionary mastery percentage across 3–4 granular topic nodes, immediately updating parent dashboards.'
    ],
    tags: ['Micro-Assessments', 'Cognitive Science', 'Memory', 'RAG AI', 'Parenting']
  },
  {
    id: 'blog-03',
    title: 'NEET 2026 & 2027: High-Yield Physics & Physical Chemistry Blueprints',
    slug: 'neet-high-yield-physics-physical-chemistry-blueprint',
    author: 'Dr. Vivek Rathore',
    authorRole: 'NEET Rankers Mentor & Former AIIMS Academician',
    readTime: '7 min read',
    publishedDate: '2026-08-12',
    category: 'NEET & IIT',
    summary: 'Strategic analysis of question distribution, critical formulas in Ray Optics, Electrostatics, and Chemical Kinetics that decide NEET medical rank cutoffs.',
    content: [
      'With over 2.4 million candidates competing for government medical seats, NEET UG margin of error is virtually zero. In Physics and Physical Chemistry, 80% of mistakes occur not due to unknown formulas, but due to calculation units, sign conventions, and multi-concept hybrid questions.',
      'Top High-Yield Chapters to Master via 10-mark sprints:',
      '- **Ray & Wave Optics:** Lens Maker’s Formula, Total Internal Reflection, and Compound Microscope resolving power.',
      '- **Modern Physics & Semiconductors:** Photoelectric equation, Bohr’s radii ratios, and Logic gate combinations (guaranteed 16–20 marks).',
      '- **Chemical Kinetics & Thermodynamics:** First-order half-life calculations, Arrhenius temperature shifts, and Gibbs free energy spontaneous criteria.',
      'Our AI-RAG engine includes dedicated NTA NEET runbooks that enforce 1-minute time pressure calibration so aspirants develop rapid numerical instincts.'
    ],
    tags: ['NEET UG', 'Medical Prep', 'Physics', 'Chemistry', 'Time Management']
  },
  {
    id: 'blog-04',
    title: 'Parenting the Evolutionary Learner: How to Foster Resilience Across School Grades',
    slug: 'parenting-the-evolutionary-learner-resilience',
    author: 'Ananya Deshmukh',
    authorRole: 'Child Psychologist & Adolescent Counselor',
    readTime: '4 min read',
    publishedDate: '2026-08-05',
    category: 'Parenting & Pedagogy',
    summary: 'Transforming scores from anxiety triggers into constructive evolutionary roadmaps with parent-child collaborative accounts.',
    content: [
      'When a child receives a 6/10 on an exam, the instinctual reaction is often disappointment or panic. However, in adaptive evolutionary learning, a 6/10 is a goldmine of diagnostic insight.',
      'The 4 incorrect questions clearly identify the exact boundary of the child’s current cognitive frontier. When parents and children share a transparent portal where both can see the detailed step-by-step AI explanation and official syllabus reference links, conversation shifts from "Why did you lose marks?" to "Let’s review the lens formula sign convention together."',
      'Our parent account model allows parents to celebrate daily streak consistency and support their child through personalized study resource suggestions.'
    ],
    tags: ['Parenting', 'Student Mental Health', 'Growth Mindset', 'Parent-Child Sync']
  }
];

export const DEMO_PARENT_ACCOUNT = INITIAL_PARENT;
export const SAMPLE_SUBMISSION = SAMPLE_HISTORIC_SUBMISSION;
export const SAMPLE_BLOG_POSTS = BLOG_POSTS;

export const BADGES_LIST: Badge[] = [
  {
    id: 'badge-pioneer',
    title: 'Diagnostic Pioneer',
    description: 'Completed the first 10-mark diagnostic sprint on the platform.',
    icon: '🚀',
    tier: 'bronze',
    category: 'explorer',
    xpReward: 100,
    requirementText: 'Complete 1 diagnostic exam',
    unlockedAt: '2026-06-12'
  },
  {
    id: 'badge-streak-3',
    title: 'Consistency Spark',
    description: 'Maintained a 3-day continuous diagnostic sprint streak.',
    icon: '⚡',
    tier: 'bronze',
    category: 'streak',
    xpReward: 150,
    requirementText: 'Maintain 3-day daily streak',
    unlockedAt: '2026-06-15'
  },
  {
    id: 'badge-streak-7',
    title: 'Momentum Master',
    description: 'Achieved a 7-day unbroken learning streak across boards.',
    icon: '🔥',
    tier: 'silver',
    category: 'streak',
    xpReward: 350,
    requirementText: 'Maintain 7-day daily streak',
    unlockedAt: '2026-07-02'
  },
  {
    id: 'badge-perfect-10',
    title: 'Flawless Decathlon',
    description: 'Scored a perfect 10/10 with zero misconceptions on a diagnostic sprint.',
    icon: '🎯',
    tier: 'gold',
    category: 'score',
    xpReward: 500,
    requirementText: 'Score 10/10 in any diagnostic exam',
    unlockedAt: '2026-07-18'
  },
  {
    id: 'badge-math-whiz',
    title: 'Algebra Alchemist',
    description: 'Achieved >80% K-Graph mastery in Quadratic Equations and Polynomials.',
    icon: '📐',
    tier: 'silver',
    category: 'mastery',
    xpReward: 300,
    requirementText: 'Reach 80% mastery in Class 10/11 Mathematics',
    unlockedAt: '2026-08-01'
  },
  {
    id: 'badge-physics-virtuoso',
    title: 'Optics & Field Maestro',
    description: 'Mastered Ray Optics, Wave Mechanics, and Electrostatics nodes.',
    icon: '🔭',
    tier: 'gold',
    category: 'mastery',
    xpReward: 450,
    requirementText: 'Reach 85% mastery in Physics chapters'
  },
  {
    id: 'badge-neet-champ',
    title: 'Medical Aspirant Vanguard',
    description: 'Completed 20+ NEET diagnostic sprints with >85% average accuracy.',
    icon: '🩺',
    tier: 'diamond',
    category: 'mastery',
    xpReward: 800,
    requirementText: 'Complete 20 NEET exams with 85%+ accuracy',
    unlockedAt: '2026-08-20'
  },
  {
    id: 'badge-speed-demon',
    title: 'Velocity Virtuoso',
    description: 'Finished a 10-question sprint in under 6 minutes with >80% accuracy.',
    icon: '⏱️',
    tier: 'silver',
    category: 'speed',
    xpReward: 250,
    requirementText: 'Finish exam in < 6 mins with >= 8/10 score',
    unlockedAt: '2026-08-14'
  },
  {
    id: 'badge-olympiad-thinker',
    title: 'HOTS Grandmaster',
    description: 'Solved 10 Hard-tier Olympiad and Higher Order Thinking problems.',
    icon: '🧠',
    tier: 'diamond',
    category: 'score',
    xpReward: 1000,
    requirementText: 'Complete 10 Hard difficulty exams with 90%+ score'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    studentId: 'lb-01',
    studentName: 'Rohan Mehta',
    avatar: '👨‍🎓',
    classGrade: 'Class 12',
    targetBoard: 'IIT',
    schoolName: 'DPS R.K. Puram, New Delhi',
    xp: 4820,
    level: 16,
    averageScore: 9.4,
    examsCompleted: 42,
    streakDays: 24,
    badgesCount: 9
  },
  {
    rank: 2,
    studentId: 'child-02',
    studentName: 'Ananya Sharma',
    avatar: '👧',
    classGrade: 'Class 12',
    targetBoard: 'NEET',
    schoolName: 'Modern School, Barakhamba',
    xp: 3250,
    level: 12,
    averageScore: 8.8,
    examsCompleted: 28,
    streakDays: 11,
    badgesCount: 5,
    isCurrentStudent: true
  },
  {
    rank: 3,
    studentId: 'lb-03',
    studentName: 'Meera Iyer',
    avatar: '👩‍🔬',
    classGrade: 'Class 10',
    targetBoard: 'ICSE',
    schoolName: 'The Cathedral & John Connon, Mumbai',
    xp: 2980,
    level: 11,
    averageScore: 9.1,
    examsCompleted: 26,
    streakDays: 14,
    badgesCount: 6
  },
  {
    rank: 4,
    studentId: 'lb-04',
    studentName: 'Devansh Kulkarni',
    avatar: '🧑‍💻',
    classGrade: 'Class 11',
    targetBoard: 'CBSE',
    schoolName: 'National Public School, Indiranagar',
    xp: 2450,
    level: 9,
    averageScore: 8.6,
    examsCompleted: 22,
    streakDays: 8,
    badgesCount: 4
  },
  {
    rank: 5,
    studentId: 'child-01',
    studentName: 'Aarav Sharma',
    avatar: '👦',
    classGrade: 'Class 10',
    targetBoard: 'CBSE',
    schoolName: 'Delhi Public School, R.K. Puram',
    xp: 1420,
    level: 6,
    averageScore: 8.2,
    examsCompleted: 14,
    streakDays: 4,
    badgesCount: 3,
    isCurrentStudent: true
  },
  {
    rank: 6,
    studentId: 'lb-06',
    studentName: 'Sarah Jenkins',
    avatar: '👩‍🏫',
    classGrade: 'Class 10',
    targetBoard: 'UK-Cambridge',
    schoolName: 'The British School, Chanakyapuri',
    xp: 1380,
    level: 6,
    averageScore: 8.4,
    examsCompleted: 13,
    streakDays: 5,
    badgesCount: 3
  },
  {
    rank: 7,
    studentId: 'lb-07',
    studentName: 'Arjun Singhania',
    avatar: '🧑‍🚀',
    classGrade: 'Class 9',
    targetBoard: 'CBSE',
    schoolName: 'La Martiniere for Boys, Kolkata',
    xp: 1190,
    level: 5,
    averageScore: 7.9,
    examsCompleted: 12,
    streakDays: 3,
    badgesCount: 2
  },
  {
    rank: 8,
    studentId: 'child-03',
    studentName: 'Kabir Sharma',
    avatar: '🧒',
    classGrade: 'Class 7',
    targetBoard: 'ICSE',
    schoolName: 'St. Xavier’s Collegiate School',
    xp: 760,
    level: 3,
    averageScore: 7.6,
    examsCompleted: 8,
    streakDays: 2,
    badgesCount: 1,
    isCurrentStudent: true
  }
];

export const INITIAL_LEARNING_PATHS: LearningPathNode[] = [
  {
    id: 'lp-01',
    topic: 'Quadratic Equations & Discriminant Properties',
    chapterName: 'Quadratic Equations',
    subject: 'Mathematics',
    classGrade: 'Class 10',
    board: 'CBSE',
    status: 'in_progress',
    masteryPercentage: 85,
    level: 'intermediate',
    prerequisites: ['Linear Polynomials', 'Factorisation of Polynomials'],
    keyConcepts: [
      'Standard form ax² + bx + c = 0',
      'Discriminant D = b² - 4ac conditions for real & equal roots',
      'Quadratic formula and splitting the middle term'
    ],
    commonMisconceptions: [
      'Forgetting the ± sign when taking the square root',
      'Confusing roots with coefficients',
      'Sign errors in -b ± √(b² - 4ac)'
    ],
    curatedResources: [
      {
        title: 'NCERT Class 10 Chapter 4: Quadratic Equations',
        source: 'Official NCERT e-Book',
        url: 'https://ncert.nic.in/textbook.php?jemh1=4-15',
        description: 'Comprehensive chapter text with standard board exemplar problems.',
        type: 'official_syllabus'
      },
      {
        title: 'Khan Academy: The Quadratic Formula & Discriminant Intuition',
        source: 'Khan Academy India',
        url: 'https://www.khanacademy.org/math/in-in-grade-10-ncert/x573d8ce20721c073:quadratic-equations',
        description: 'Interactive graphical proof of how the parabola intersects the x-axis.',
        type: 'video'
      }
    ],
    practiceExamConfig: {
      board: 'CBSE',
      classGrade: 'Class 10',
      subject: 'Mathematics',
      difficulty: 'medium',
      focusTopic: 'Quadratic Equations'
    },
    recommendedReason: 'RAG Model diagnosed 85% mastery with 1 calculation slip in complex roots. Ready for rapid revision sprint.'
  },
  {
    id: 'lp-02',
    topic: 'Electricity: Series & Parallel Combinations & Joule Heating',
    chapterName: 'Electricity & Circuits',
    subject: 'Physics',
    classGrade: 'Class 10',
    board: 'CBSE',
    status: 'remedial_needed',
    masteryPercentage: 65,
    level: 'foundational',
    prerequisites: ['Ohm’s Law V=IR', 'Electric Potential Difference'],
    keyConcepts: [
      'Equivalent resistance in series: R = R₁ + R₂',
      'Equivalent resistance in parallel: 1/R = 1/R₁ + 1/R₂',
      'Joule’s Law of Heating: H = I²Rt'
    ],
    commonMisconceptions: [
      'Assuming current splits equally in parallel branches with unequal resistors',
      'Thinking voltage drops across parallel branches add up instead of remaining constant'
    ],
    curatedResources: [
      {
        title: 'NCERT Class 10 Science Chapter 12: Electricity',
        source: 'NCERT Official Portal',
        url: 'https://ncert.nic.in/textbook.php?jesc1=12-16',
        description: 'Standard board explanations on Ohm’s Law and circuit diagrams.',
        type: 'official_syllabus'
      },
      {
        title: 'CBSE Class 10 Physics: Equivalent Resistance Made Simple',
        source: 'Physics Wallah / Exam Prep',
        url: 'https://www.youtube.com/results?search_query=cbse+class+10+electricity+series+parallel',
        description: 'Step-by-step circuit node identification walkthroughs.',
        type: 'video'
      }
    ],
    practiceExamConfig: {
      board: 'CBSE',
      classGrade: 'Class 10',
      subject: 'Physics',
      difficulty: 'simple',
      focusTopic: 'Electricity'
    },
    recommendedReason: 'Diagnostic detected misconception in parallel circuit voltage drops. Foundational remedial sprint recommended.'
  },
  {
    id: 'lp-03',
    topic: 'Chemical Reactions: Redox & Balancing Stoichiometry',
    chapterName: 'Chemical Reactions and Equations',
    subject: 'Chemistry',
    classGrade: 'Class 10',
    board: 'CBSE',
    status: 'mastered',
    masteryPercentage: 90,
    level: 'intermediate',
    prerequisites: ['Atomic Structure', 'Valency & Ions'],
    keyConcepts: [
      'Law of Conservation of Mass',
      'Oxidation (loss of electrons) & Reduction (gain of electrons)',
      'Precipitation, displacement, and decomposition reactions'
    ],
    commonMisconceptions: [
      'Changing subscript numbers instead of stoichiometric coefficients when balancing',
      'Confusing the oxidizing agent with the substance getting oxidized'
    ],
    curatedResources: [
      {
        title: 'NCERT Class 10 Chapter 1: Chemical Reactions and Equations',
        source: 'NCERT Official Portal',
        url: 'https://ncert.nic.in/textbook.php?jesc1=1-16',
        description: 'Complete balancing and redox definitions with board past questions.',
        type: 'official_syllabus'
      }
    ],
    practiceExamConfig: {
      board: 'CBSE',
      classGrade: 'Class 10',
      subject: 'Chemistry',
      difficulty: 'hard',
      focusTopic: 'Chemical Reactions'
    },
    recommendedReason: 'Mastery is at 90%! High-Order Thinking (HOTS) Olympiad-grade questions unlocked.'
  },
  {
    id: 'lp-04',
    topic: 'Advanced HOTS: Olympiad Coordinate Geometry & Conics Preview',
    chapterName: 'Coordinate Geometry Advanced',
    subject: 'Mathematics',
    classGrade: 'Class 10',
    board: 'IIT',
    status: 'available',
    masteryPercentage: 80,
    level: 'advanced_hots',
    prerequisites: ['Distance Formula', 'Section Formula', 'Area of Triangles'],
    keyConcepts: [
      'Centroid, Orthocentre & Incentre coordinate formulations',
      'Locus of a point moving under geometrical constraints',
      'Ratio division for collinearity in 2D Euclidean space'
    ],
    commonMisconceptions: [
      'Applying section formula internally when external ratio division is required',
      'Assuming centroid divides medians in 1:2 instead of 2:1 from vertex'
    ],
    curatedResources: [
      {
        title: 'IIT JEE Foundation: Coordinate Geometry Advanced Locus',
        source: 'IIT JEE Foundation Module',
        url: 'https://www.youtube.com/results?search_query=iit+jee+foundation+coordinate+geometry+class+10',
        description: 'Challenging Olympiad-level problems for top percentile candidates.',
        type: 'practice'
      }
    ],
    practiceExamConfig: {
      board: 'IIT',
      classGrade: 'Class 10',
      subject: 'Mathematics',
      difficulty: 'hard',
      focusTopic: 'Coordinate Geometry'
    },
    recommendedReason: 'Candidate demonstrated >80% accuracy across standard algebra. Advanced IIT Foundation sprint unlocked.'
  },
  {
    id: 'lp-05',
    topic: 'Ray Optics: Lens Maker’s Formula & Optical Instruments',
    chapterName: 'Ray Optics',
    subject: 'Physics',
    classGrade: 'Class 12',
    board: 'NEET',
    status: 'in_progress',
    masteryPercentage: 88,
    level: 'advanced_hots',
    prerequisites: ['Snell’s Law', 'Refraction at Spherical Surfaces'],
    keyConcepts: [
      'Lens Maker’s Formula: 1/f = (μ - 1)(1/R₁ - 1/R₂)',
      'Magnification and resolving power of astronomical telescopes & microscopes',
      'Sign convention in Cartesian optics'
    ],
    commonMisconceptions: [
      'Swapping signs of R₁ and R₂ for equi-convex lenses immersed in water',
      'Forgetting that focal length changes when medium refractive index changes'
    ],
    curatedResources: [
      {
        title: 'NEET NTA Ray Optics Official Syllabus Guide',
        source: 'NTA NEET e-Learning',
        url: 'https://nta.ac.in/neet',
        description: 'Official test blueprint and high-yield optics question archetypes.',
        type: 'official_syllabus'
      }
    ],
    practiceExamConfig: {
      board: 'NEET',
      classGrade: 'Class 12',
      subject: 'Physics',
      difficulty: 'hard',
      focusTopic: 'Ray Optics & Lenses'
    },
    recommendedReason: 'Scoring top percentiles in NEET diagnostic sprints. High-speed multi-concept numericals recommended.'
  }
];

export const TEACHER_CONTACTS: TeacherContact[] = [
  {
    id: 't-01',
    name: 'Mrs. Suman Mukherjee',
    role: 'Class Teacher & Senior Mathematics Faculty',
    subject: 'Mathematics',
    schoolName: 'Delhi Public School, R.K. Puram',
    email: 's.mukherjee@dpsrkp.edu.in',
    avatar: '👩‍🏫',
    phone: '+91 98110 44210',
    verified: true
  },
  {
    id: 't-02',
    name: 'Dr. Alok Verma',
    role: 'Head of Department (Physics & Science)',
    subject: 'Physics',
    schoolName: 'Delhi Public School, R.K. Puram',
    email: 'a.verma@dpsrkp.edu.in',
    avatar: '👨‍🏫',
    phone: '+91 98101 77340',
    verified: true
  },
  {
    id: 't-03',
    name: 'Ms. Preeti Sen',
    role: 'Senior NEET Biology Mentor & Academic Counselor',
    subject: 'Biology',
    schoolName: 'Modern School, Barakhamba',
    email: 'p.sen@modernschool.edu.in',
    avatar: '👩‍🔬',
    verified: true
  },
  {
    id: 't-04',
    name: 'Mr. David Harrison',
    role: 'Cambridge IGCSE Curriculum Coordinator',
    subject: 'All Subjects',
    schoolName: 'The British School, Chanakyapuri',
    email: 'd.harrison@britishschool.edu.in',
    avatar: '👨‍💼',
    verified: true
  }
];

export const INITIAL_PT_MESSAGES: ParentTeacherMessage[] = [
  {
    id: 'msg-01',
    parentId: 'parent-001',
    parentName: 'Dr. Rajesh Sharma',
    teacherId: 't-01',
    teacherName: 'Mrs. Suman Mukherjee',
    childId: 'child-01',
    childName: 'Aarav Sharma',
    senderRole: 'parent',
    message: 'Dear Mrs. Mukherjee, Aarav completed his Class 10 CBSE Quadratic Equations diagnostic test on AI-RAG with 9/10 marks. His concept graph shows high mastery in factorisation, but he needed clarity on finding roots when discriminant D < 0. Sharing his full analytical report.',
    timestamp: '2026-08-26T14:30:00.000Z',
    attachedSubmissionId: 'sub-demo-01',
    attachedSubmissionTitle: 'Class 10 CBSE Mathematics: Quadratic Equations & Roots Diagnostic (9/10)',
    actionItems: ['Review complex roots calculation in class', 'Reinforce sign conventions'],
    status: 'read'
  },
  {
    id: 'msg-02',
    parentId: 'parent-001',
    parentName: 'Dr. Rajesh Sharma',
    teacherId: 't-01',
    teacherName: 'Mrs. Suman Mukherjee',
    childId: 'child-01',
    childName: 'Aarav Sharma',
    senderRole: 'teacher',
    message: 'Hello Dr. Sharma! Thank you for sharing Aarav’s detailed AI-RAG report. I reviewed the question-by-question breakdown. His algebra working is very tidy. I have assigned him two extra practice problems on discriminant word problems in class tomorrow.',
    timestamp: '2026-08-26T16:15:00.000Z',
    actionItems: ['Assigned 2 practice word problems', 'Schedule short check-in on Friday'],
    status: 'action_taken'
  },
  {
    id: 'msg-03',
    parentId: 'parent-001',
    parentName: 'Dr. Rajesh Sharma',
    teacherId: 't-02',
    teacherName: 'Dr. Alok Verma',
    childId: 'child-01',
    childName: 'Aarav Sharma',
    senderRole: 'parent',
    message: 'Hello Dr. Verma, in Aarav’s recent Electricity sprint, he scored 6.5/10 with difficulties around parallel resistor voltage drops. We have queued the adaptive remedial module. Could you also verify his lab circuit readings this week?',
    timestamp: '2026-08-27T09:00:00.000Z',
    actionItems: ['Check circuit readings in physics laboratory'],
    status: 'delivered'
  }
];

export const INITIAL_SHARED_DOSSIERS: SharedDossier[] = [
  {
    id: 'dossier-01',
    childId: 'child-01',
    childName: 'Aarav Sharma',
    parentName: 'Dr. Rajesh Sharma',
    shareToken: 'DOS-AARAV-CBSE10-8921',
    createdAt: '2026-08-26T14:32:00.000Z',
    expiresAt: '2026-09-26T23:59:59.000Z',
    notes: 'Q2 Periodic Diagnostic Summary for Class Teacher review and Term 1 parent-teacher meeting discussion.',
    recipients: ['s.mukherjee@dpsrkp.edu.in', 'a.verma@dpsrkp.edu.in'],
    includedSubmissionsCount: 5,
    status: 'active'
  }
];
