import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Smile,
  Sparkles,
  Music,
  Send,
  X,
  Play,
  CheckCircle,
  HelpCircle,
  Volume2,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Clock,
  TrendingUp,
  Brain
} from 'lucide-react';
import ApiServices from '../services/ApiServices';
import {
  getWellbeingState,
  saveWellbeingRecord,
  deferWellbeingCheckin,
  WellbeingStorageState,
  WellbeingResponseData
} from '../utils/wellbeingHelper';

interface StudentWellbeingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToExam: () => void;
  studentId: string | number;
  studentName: string;
  studentClassGrade: string;
  totalExamsTaken: number;
}

interface ChatOption {
  label: string;
  value: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: ChatOption[];
  isSummaryCard?: boolean;
}

interface MentalHealthSummary {
  mood?: string;
  anxiety_level?: string;
  stress_trigger?: string;
  coping_outlet?: string;
  support_anchor?: string;
  guidance_tip?: string;
}

// Client-side grade bracket resolver for instant fallback
function getGradeBracket(grade: string): 'primary' | 'middle' | 'secondary' | 'senior' {
  const g = (grade || '').toLowerCase();
  if (['class 1', 'class 2', 'class 3', 'class 4', 'grade 1', 'grade 2', 'grade 3', 'grade 4', '1st', '2nd', '3rd', '4th'].some(k => g.includes(k))) {
    return 'primary';
  }
  if (['class 5', 'class 6', 'class 7', 'class 8', 'grade 5', 'grade 6', 'grade 7', 'grade 8', '5th', '6th', '7th', '8th'].some(k => g.includes(k))) {
    return 'middle';
  }
  if (['class 9', 'class 10', 'grade 9', 'grade 10', '9th', '10th', 'madhyamik', 'matric'].some(k => g.includes(k))) {
    return 'secondary';
  }
  return 'senior';
}

function getLocalGradeFallback(
  firstName: string,
  grade: string,
  turnIdx: number,
  lastUserText: string,
  prevData?: WellbeingResponseData | null
): { reply_text: string; suggested_chips: ChatOption[]; is_complete: boolean; mental_health_summary?: MentalHealthSummary } {
  const bracket = getGradeBracket(grade);
  const input = lastUserText.toLowerCase();

  // ─────────────────────────────────────────────────────────────
  // CONTINUOUS MEMORY LINKING (RETURNING STUDENT CHECK-IN)
  // ─────────────────────────────────────────────────────────────
  if (prevData) {
    const prevHobby = prevData.hobbyDetail || prevData.hobby || 'your favorite sports and passions';
    const prevSupport = prevData.supportPerson || 'your family';

    if (turnIdx === 0) {
      return {
        reply_text: `Welcome back, ${firstName}! 🌟 Great to see you again for another diagnostic practice test!\n\nLast time we talked, you told me your favorite way to unwind is ${prevHobby} and ${prevSupport} is your greatest support cheerleader! ❤️\n\nHow is your energy and mood today compared to last time?`,
        suggested_chips: [
          { label: 'Even more energized & confident today! ⚡', value: 'Even more energized & confident today!' },
          { label: 'Calm, focused & steady 😌', value: 'Calm, focused & steady' },
          { label: "A little anxious about today's questions 😰", value: "A little anxious about today's questions" },
          { label: 'Feeling a bit tired, but ready to do my best 🥱', value: 'Feeling a bit tired, but ready to do my best' },
        ],
        is_complete: false,
      };
    } else if (turnIdx === 1) {
      if (['anxious', 'nervous', 'tired', 'worry', 'questions'].some(k => input.includes(k))) {
        return {
          reply_text: `I hear you, ${firstName}. It's completely normal to feel butterflies! Remember how ${prevHobby} helped you reset your head? What specific part of today's exam is causing worry?`,
          suggested_chips: [
            { label: 'Fear of tricky or difficult problems 🧩', value: 'Fear of tricky problems' },
            { label: 'Worry about the countdown timer ⏱️', value: 'Timer anxiety' },
            { label: 'Fear of making silly mistakes 📉', value: 'Fear of silly mistakes' },
            { label: 'Just general test nervousness 💭', value: 'General nervousness' },
          ],
          is_complete: false,
        };
      } else {
        return {
          reply_text: `That is wonderful growth, ${firstName}! 🚀 Channeling that positive energy makes solving questions so much smoother. Did you get time to enjoy ${prevHobby} or did ${prevSupport} give you an encouraging cheer before today?`,
          suggested_chips: [
            { label: `Yes, spent time on ${prevHobby} and feel refreshed! ✨`, value: `Spent time on ${prevHobby}` },
            { label: `Yes, got lovely encouragement from ${prevSupport}! ❤️`, value: `Encouraged by ${prevSupport}` },
            { label: 'I revised well and feel ready to test myself 📖', value: 'Revised well' },
            { label: 'Took good rest and have fresh focus 😌', value: 'Good rest' },
          ],
          is_complete: false,
        };
      }
    } else if (turnIdx === 2) {
      return {
        reply_text: `Wonderful! As you prepare to start, remember that ${prevSupport} and all of us believe in your curiosity and perseverance. Are you ready to approach each question with a calm, curious mind?`,
        suggested_chips: [
          { label: 'Yes! I will take it one question at a time 🎯', value: 'Take it one question at a time' },
          { label: 'Ready to do my absolute best with no fear 🚀', value: 'Do my absolute best with no fear' },
          { label: 'Will take a deep breath if a question gets tricky 😌', value: 'Deep breath if tricky' },
        ],
        is_complete: false,
      };
    } else {
      return {
        reply_text: `You're showing remarkable emotional resilience and self-awareness across your check-ins, ${firstName}! Take 3 slow, deep belly breaths right now. Trust your preparation, stay curious, and enjoy the test!`,
        suggested_chips: [],
        is_complete: true,
        mental_health_summary: {
          mood: 'Continuous Growth & Calmer Confidence',
          anxiety_level: 'Low',
          stress_trigger: 'Managed pre-exam butterflies through positive memory recall',
          coping_outlet: prevHobby,
          support_anchor: prevSupport,
          guidance_tip: `Celebrated continuous progress across check-ins. Continue praising ${firstName}'s emotional regulation and effort!`
        }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FIRST TIME CHECK-IN (PRIMARY: Class 1 to 4)
  // ─────────────────────────────────────────────────────────────
  if (bracket === 'primary') {
    if (turnIdx === 0) {
      return {
        reply_text: `Hi ${firstName}! 🎈 Welcome! Before we start our fun question game, how are you feeling inside today?`,
        suggested_chips: [
          { label: 'Happy and smiling 😊', value: 'Happy and smiling' },
          { label: 'Super excited to play 🚀', value: 'Excited to play' },
          { label: 'A little bit scared or nervous 🥺', value: 'A little nervous' },
          { label: 'Feeling sleepy or tired 🥱', value: 'Sleepy and tired' },
        ],
        is_complete: false,
      };
    } else if (turnIdx === 1) {
      return {
        reply_text: `It's completely okay! What makes you happiest when playing — drawing colorful pictures, playing with toys, or listening to fun songs?`,
        suggested_chips: [
          { label: 'Drawing & coloring pictures 🎨', value: 'Drawing & coloring' },
          { label: 'Listening to cheerful songs 🎵', value: 'Music & songs' },
          { label: 'Playing with toys & running ⚽', value: 'Toys & running' },
          { label: 'Watching cartoons 📺', value: 'Watching cartoons' },
        ],
        is_complete: false,
      };
    } else if (turnIdx === 2) {
      return {
        reply_text: `That sounds like so much fun! 🌟 Who gives you the biggest, warmest hug at home when you need comfort?`,
        suggested_chips: [
          { label: 'Mommy — she loves me so much ❤️', value: 'Mommy' },
          { label: 'Daddy — he plays with me 👨‍👧', value: 'Daddy' },
          { label: 'Grandparents 👵', value: 'Grandparents' },
          { label: 'My Teacher 👩‍🏫', value: 'Teacher' },
        ],
        is_complete: false,
      };
    } else {
      return {
        reply_text: `You are a brave superstar, ${firstName}! 🌟 Remember, this quiz is just a fun little puzzle game. Take a deep breath, smile, and have fun!`,
        suggested_chips: [],
        is_complete: true,
        mental_health_summary: {
          mood: 'Playful & Reassured',
          anxiety_level: 'Low',
          stress_trigger: 'Mild pre-quiz excitement',
          coping_outlet: 'Drawing & Fun play',
          support_anchor: 'Mommy & Family',
          guidance_tip: `Give ${firstName} a warm hug after the quiz and praise their effort!`
        }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FIRST TIME CHECK-IN (MIDDLE SCHOOL: Class 5 to 8)
  // ─────────────────────────────────────────────────────────────
  if (bracket === 'middle') {
    if (turnIdx === 0) {
      return {
        reply_text: `Hey ${firstName}! 👋 Quick pre-exam check-in before today's mock test. How is your mental battery and mood right now?`,
        suggested_chips: [
          { label: 'Calm, focused & steady 😌', value: 'Calm and focused' },
          { label: 'Full of energy & ready to conquer ⚡', value: 'High energy' },
          { label: 'Feeling nervous about tough questions 😰', value: 'Anxious about questions' },
          { label: 'Feeling tired or low energy 🥱', value: 'Tired and low energy' },
        ],
        is_complete: false,
      };
    } else if (turnIdx === 1) {
      const isStress = input.includes('nervous') || input.includes('anxious') || input.includes('stress') || input.includes('questions');
      const intro = isStress
        ? `I hear you, ${firstName}. Fear of tricky questions is completely normal! Remember, this test is just practice, zero judgment.`
        : `Love that confidence, ${firstName}!`;
      return {
        reply_text: `${intro} When you need to clear your mind, what is your favorite way to unwind?`,
        suggested_chips: [
          { label: 'Playing outdoor sports (Football/Cricket) ⚽', value: 'Football & Sports' },
          { label: 'Listening to music / Singing 🎵', value: 'Music & Songs' },
          { label: 'Drawing, sketching & crafts 🎨', value: 'Art & Drawing' },
          { label: 'Gaming & tech fun 🎮', value: 'Gaming' },
        ],
        is_complete: false,
      };
    } else if (turnIdx === 2) {
      if (['football', 'cricket', 'sport', 'running', 'badminton', 'athlete'].some(k => input.includes(k))) {
        if (input.includes('football')) {
          return {
            reply_text: `Football is fantastic for channeling adrenaline and building laser focus! ⚽ How does playing football help your mindset the most?`,
            suggested_chips: [
              { label: 'Running & scoring relieves all my tension ⚽', value: 'Running and scoring relieves tension' },
              { label: 'Playing with teammates makes me happy & confident 🤝', value: 'Playing with teammates' },
              { label: 'Watching matches of Messi / Ronaldo inspires me 🏆', value: 'Watching idol matches' },
              { label: 'Keeps my brain energized & sharp ⚡', value: 'Keeps brain sharp' },
            ],
            is_complete: false,
          };
        } else if (input.includes('cricket')) {
          return {
            reply_text: `Cricket builds tremendous patience and mental composure under pressure! 🏏 What part of cricket helps you stay grounded?`,
            suggested_chips: [
              { label: 'Focusing like Virat Kohli under pressure 🏏', value: 'Focus under pressure' },
              { label: 'Enjoying matches with friends & family 🌟', value: 'Matches with friends' },
              { label: 'Bowling fast and letting off steam ⚡', value: 'Bowling fast' },
              { label: 'Celebrating big team wins together 🏆', value: 'Team wins' },
            ],
            is_complete: false,
          };
        } else {
          return {
            reply_text: `Sports movement activates neuron focus and releases endorphins! 🏃‍♂️ Which sport or athlete inspires you to stay strong under pressure?`,
            suggested_chips: [
              { label: 'Cricket — Virat Kohli / MS Dhoni 🏏', value: 'Cricket (Virat / Dhoni)' },
              { label: 'Football — Messi / Ronaldo ⚽', value: 'Football (Messi / Ronaldo)' },
              { label: 'Badminton / Tennis 🏸', value: 'Badminton' },
              { label: 'Running & Athletics 🏃', value: 'Running & Athletics' },
            ],
            is_complete: false,
          };
        }
      } else if (input.includes('music') || input.includes('song')) {
        return {
          reply_text: `Music is scientifically proven to regulate heart rate and relax brainwaves! 🎶 What kind of music calms your mind the best?`,
          suggested_chips: [
            { label: 'Soulful & acoustic melodies 🎤', value: 'Soulful melodies' },
            { label: 'Upbeat energetic beats that motivate me ⚡', value: 'Upbeat motivational beats' },
            { label: 'Calm Lo-Fi and instrumental music 🎼', value: 'Lo-Fi instrumental' },
            { label: 'Singing along to my favorite songs 🌟', value: 'Singing along' },
          ],
          is_complete: false,
        };
      } else {
        return {
          reply_text: `That is a wonderful passion! Engaging in what you love resets your mental battery. When you do that, does it recharge your focus?`,
          suggested_chips: [
            { label: 'Yes, totally resets my focus 😌', value: 'Totally resets focus' },
            { label: 'Gives me fresh energy to solve problems ⚡', value: 'Fresh problem solving energy' },
            { label: 'Helps me forget all worries and smile 😊', value: 'Forgets worries' },
          ],
          is_complete: false,
        };
      }
    } else if (turnIdx === 3) {
      return {
        reply_text: `Awesome! Now tell me, when things get challenging or stressful, who is your core champion at home or school who always believes in you and has your back?`,
        suggested_chips: [
          { label: 'My Mom — unconditional love, care & hugs ❤️', value: 'Mom' },
          { label: 'My Dad — strength, courage and guidance 🤝', value: 'Dad' },
          { label: 'My Grandparents — warm blessings & comfort 👵', value: 'Grandparents' },
          { label: 'My Best Friend — who cheers me up & makes me laugh 🌟', value: 'Best Friend' },
          { label: 'My Teacher — who guides and believes in me 👩‍🏫', value: 'Teacher' },
        ],
        is_complete: false,
      };
    } else {
      return {
        reply_text: `Thank you for sharing, ${firstName}. Take 3 slow, deep breaths right now. When you face any tricky question today, don't rush. Trust yourself, and remember you have your family's love behind you!`,
        suggested_chips: [],
        is_complete: true,
        mental_health_summary: {
          mood: 'Calm, Centered & Encouraged',
          anxiety_level: 'Low',
          stress_trigger: 'Challenging questions or timer pressure',
          coping_outlet: 'Sports & Favorite passions',
          support_anchor: 'Mom & Family',
          guidance_tip: `Encourage ${firstName} to celebrate effort and remind them that tricky problems are just learning puzzles.`
        }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FIRST TIME CHECK-IN (SECONDARY & SENIOR: Class 9 to 12)
  // ─────────────────────────────────────────────────────────────
  if (turnIdx === 0) {
    return {
      reply_text: `Hello ${firstName}. Diagnostic exams are great tools to benchmark your strengths. How are you feeling mentally and emotionally right now?`,
      suggested_chips: [
        { label: 'Focused, calm and ready 😌', value: 'Focused and calm' },
        { label: 'Experiencing anxiety about marks / syllabus 😰', value: 'Syllabus anxiety' },
        { label: 'Mentally exhausted from long study hours 🥱', value: 'Mental burnout' },
        { label: 'Optimistic and determined to do my best ⚡', value: 'Optimistic' },
      ],
      is_complete: false,
    };
  } else if (turnIdx === 1) {
    return {
      reply_text: `Academic demands can certainly cause cognitive overload. What decompression ritual keeps you grounded when stress peaks?`,
      suggested_chips: [
        { label: 'Music and focus beats 🎧', value: 'Music' },
        { label: 'Physical workouts & fitness 🏃', value: 'Workouts' },
        { label: 'Structured sleep and planned breaks 😌', value: 'Structured sleep' },
      ],
      is_complete: false,
    };
  } else if (turnIdx === 2) {
    return {
      reply_text: `Insightful. When the pressure peaks, who is your core emotional safety anchor who grounds you without judgment?`,
      suggested_chips: [
        { label: 'My Mother — unconditional comfort and care ❤️', value: 'Mother' },
        { label: 'My Father — practical wisdom and strength 🤝', value: 'Father' },
        { label: 'A trusted mentor or teacher 👩‍🏫', value: 'Mentor/Teacher' },
        { label: 'My close friend 🌟', value: 'Close friend' },
      ],
      is_complete: false,
    };
  } else {
    return {
      reply_text: `Remember ${firstName}, diagnostic exams are purely cognitive diagnostics to locate opportunities for growth. Trust your hard work, breathe calmly, and approach each question with curiosity.`,
      suggested_chips: [],
      is_complete: true,
      mental_health_summary: {
        mood: 'Re-centered & Intellectually Ready',
        anxiety_level: 'Low',
        stress_trigger: 'Board/Competitive preparation pressure',
        coping_outlet: 'Focus rituals & Music',
        support_anchor: 'Family / Mentor',
        guidance_tip: `Support ${firstName}'s emotional wellbeing by celebrating effort and discipline rather than numerical rank.`
      }
    };
  }
}

export const StudentWellbeingChatModal: React.FC<StudentWellbeingChatModalProps> = ({
  isOpen,
  onClose,
  onProceedToExam,
  studentId,
  studentName,
  studentClassGrade,
  totalExamsTaken,
}) => {
  const firstName = studentName ? studentName.split(' ')[0] : 'Champ';

  const [wellbeingHistory, setWellbeingHistory] = useState<WellbeingStorageState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [isConversationComplete, setIsConversationComplete] = useState<boolean>(false);

  // Student's captured psychiatric & wellbeing summary
  const [mentalHealthSummary, setMentalHealthSummary] = useState<MentalHealthSummary>({
    mood: 'Calm & Steady',
    anxiety_level: 'Low',
    stress_trigger: 'None',
    coping_outlet: 'Music',
    support_anchor: 'Mom',
    guidance_tip: 'Praise their consistent practice and effort!'
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  // Initialize counselor dialogue on open with past memory linking
  useEffect(() => {
    if (isOpen && studentId) {
      const state = getWellbeingState(studentId);
      setWellbeingHistory(state);
      setIsConversationComplete(false);
      setConversationHistory([]);
      setMessages([]);

      const prevData = state?.latestData;
      const prevSummary = prevData
        ? {
            mood: prevData.mood,
            hobby: prevData.hobbyDetail || prevData.hobby,
            support_person: prevData.supportPerson,
            exam_mindset: prevData.examMindset,
            checkin_number: (state.checkinCount || 0) + 1,
          }
        : undefined;

      // Start initial counselor turn
      setIsBotTyping(true);

      ApiServices.getCounselorDialogue({
        student_id: studentId,
        student_name: studentName,
        class_grade: studentClassGrade,
        board: 'CBSE',
        subject: 'Diagnostic Mock Exam',
        conversation_history: [],
        previous_summary: prevSummary,
      })
        .then((res: any) => {
          setIsBotTyping(false);
          const data = res?.data || res;
          const replyText = data?.reply_text || getLocalGradeFallback(firstName, studentClassGrade, 0, '', prevData).reply_text;
          const chips = data?.suggested_chips || getLocalGradeFallback(firstName, studentClassGrade, 0, '', prevData).suggested_chips;

          const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages([
            {
              id: `msg-${Date.now()}`,
              sender: 'bot',
              text: replyText,
              timestamp: timeNow,
              options: chips,
            }
          ]);
          setConversationHistory([
            { role: 'assistant', content: replyText }
          ]);
        })
        .catch(() => {
          setIsBotTyping(false);
          const fallback = getLocalGradeFallback(firstName, studentClassGrade, 0, '', prevData);
          const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages([
            {
              id: `msg-${Date.now()}`,
              sender: 'bot',
              text: fallback.reply_text,
              timestamp: timeNow,
              options: fallback.suggested_chips,
            }
          ]);
          setConversationHistory([
            { role: 'assistant', content: fallback.reply_text }
          ]);
        });
    }
  }, [isOpen, studentId, studentName, studentClassGrade, firstName]);

  if (!isOpen) return null;

  // Process user input and request next counselor turn
  const handleUserResponse = (userText: string) => {
    if (!userText.trim() || isBotTyping) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Remove chips from previous messages to keep conversation clean
    setMessages(prev => prev.map(m => ({ ...m, options: undefined })));

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeNow,
    };
    setMessages(prev => [...prev, userMsg]);

    const updatedHistory: Array<{ role: 'assistant' | 'user'; content: string }> = [
      ...conversationHistory,
      { role: 'user', content: userText }
    ];
    setConversationHistory(updatedHistory);
    setIsBotTyping(true);

    const prevData = wellbeingHistory?.latestData;
    const prevSummary = prevData
      ? {
          mood: prevData.mood,
          hobby: prevData.hobbyDetail || prevData.hobby,
          support_person: prevData.supportPerson,
          exam_mindset: prevData.examMindset,
          checkin_number: (wellbeingHistory.checkinCount || 0) + 1,
        }
      : undefined;

    const userTurnsCount = updatedHistory.filter(h => h.role === 'user').length;

    ApiServices.getCounselorDialogue({
      student_id: studentId,
      student_name: studentName,
      class_grade: studentClassGrade,
      board: 'CBSE',
      subject: 'Diagnostic Mock Exam',
      conversation_history: updatedHistory,
      previous_summary: prevSummary,
    })
      .then((res: any) => {
        setIsBotTyping(false);
        const data = res?.data || res;
        handleBotTurnResult(data, updatedHistory, userTurnsCount, userText, prevData);
      })
      .catch(() => {
        setIsBotTyping(false);
        const fallback = getLocalGradeFallback(firstName, studentClassGrade, userTurnsCount, userText, prevData);
        handleBotTurnResult(fallback, updatedHistory, userTurnsCount, userText, prevData);
      });
  };

  const handleBotTurnResult = (
    data: any,
    currentHistory: Array<{ role: 'assistant' | 'user'; content: string }>,
    userTurnsCount: number,
    lastUserText: string,
    prevData?: WellbeingResponseData | null
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyText = data?.reply_text || getLocalGradeFallback(firstName, studentClassGrade, userTurnsCount, lastUserText, prevData).reply_text;
    const chips = data?.suggested_chips || [];
    const isComplete = Boolean(data?.is_complete || userTurnsCount >= 4);

    setConversationHistory([
      ...currentHistory,
      { role: 'assistant', content: replyText }
    ]);

    if (isComplete) {
      setIsConversationComplete(true);
      const summary: MentalHealthSummary = data?.mental_health_summary || {
        mood: prevData ? 'Continuous Growth & Calmer Confidence' : 'Calm & Encouraged',
        anxiety_level: 'Low',
        stress_trigger: prevData ? 'Managed butterflies through positive recall' : 'Challenging questions',
        coping_outlet: prevData?.hobbyDetail || prevData?.hobby || 'Sports & Music',
        support_anchor: prevData?.supportPerson || 'Mom & Family',
        guidance_tip: `Continue praising ${firstName}'s emotional regulation and curiosity!`
      };
      setMentalHealthSummary(summary);

      // Save to localStorage & backend
      saveWellbeingRecord(studentId, totalExamsTaken, {
        mood: summary.mood || 'Calm & Steady',
        moodEmoji: summary.anxiety_level === 'High' ? '😰' : summary.anxiety_level === 'Moderate' ? '😐' : '😊',
        hobby: summary.coping_outlet || 'Sports',
        hobbyCategory: 'sports',
        hobbyDetail: summary.coping_outlet || 'Playing Football',
        supportPerson: summary.support_anchor || 'Mom',
        examMindset: summary.stress_trigger ? `Addressed stress trigger: ${summary.stress_trigger}` : 'Approached with calm focus',
        adviceMessage: summary.guidance_tip || 'Take 3 slow deep breaths. You are fully capable!'
      });

      // Add final reassurance message and summary card
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: timeNow,
        },
        {
          id: `bot-summary-${Date.now()}`,
          sender: 'bot',
          text: `✨ Mental health check-in completed. Here is your personalized pre-exam insight:`,
          timestamp: timeNow,
          isSummaryCard: true,
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: timeNow,
          options: chips,
        }
      ]);
    }
  };

  const handleSendText = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    handleUserResponse(text);
  };

  const handleSkip = () => {
    deferWellbeingCheckin(studentId, totalExamsTaken);
    onClose();
    onProceedToExam();
  };

  const handleFinalStart = () => {
    onClose();
    onProceedToExam();
  };

  const checkinNumber = (wellbeingHistory?.checkinCount || 0) + 1;
  const isReturning = Boolean(wellbeingHistory && (wellbeingHistory.checkinCount > 0 || wellbeingHistory.latestData));

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-yellow-200/80 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-xs">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Student Mindset & Wellbeing Check-in
                </h3>
                <span className="bg-white/25 border border-white/40 text-yellow-100 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Check-in #{checkinNumber}
                </span>
              </div>
              <p className="text-[11px] text-yellow-100 font-medium">
                AI Counselor • Calibrated for {studentClassGrade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              title="Skip check-in and start exam right away"
              className="text-xs font-bold text-yellow-100 hover:text-white bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Skip to Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSkip}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Status Ribbon */}
        <div className="bg-amber-50/90 border-b border-amber-200/70 px-4 py-1.5 text-[11px] text-amber-900 flex items-center justify-between font-medium">
          {isReturning ? (
            <span className="flex items-center gap-1.5 text-amber-950 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Memory active: Following up on your previous check-in!</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Age-calibrated counselor assessing anxiety, focus & emotional anchors</span>
            </span>
          )}
          <span className="text-amber-700 font-semibold text-[10px] bg-amber-100/80 px-2 py-0.5 rounded-md">
            Candidate: {firstName} ({studentClassGrade})
          </span>
        </div>

        {/* Chat message history container */}
        <div
          ref={chatScrollRef}
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-stone-50/60 to-white"
        >
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-end justify-end'} animate-in fade-in duration-200`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                    🌟
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-white border border-stone-200/80 text-stone-800 shadow-xs'
                      : 'bg-stone-900 text-white shadow-xs rounded-br-xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>

                  {/* Summary Card when conversation completes */}
                  {msg.isSummaryCard && (
                    <div className="mt-3 p-3.5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/80 space-y-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-yellow-200/60">
                        <div className="flex items-center gap-2 text-stone-900 font-black text-xs uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Pre-Exam Mental Health Insight</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {mentalHealthSummary.anxiety_level === 'High' ? 'Need Encouragement' : 'Ready & Supported'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/80 p-2.5 rounded-xl border border-yellow-100">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Current Mood</span>
                          <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                            😊 {mentalHealthSummary.mood || 'Calm & Steady'}
                          </span>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-xl border border-yellow-100">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">De-stress Outlet</span>
                          <span className="font-bold text-stone-800 truncate block mt-0.5" title={mentalHealthSummary.coping_outlet}>
                            ⚽ {mentalHealthSummary.coping_outlet || 'Sports'}
                          </span>
                        </div>

                        <div className="col-span-2 bg-white/80 p-2.5 rounded-xl border border-yellow-100">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Loved One Supporting You</span>
                          <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                            ❤️ {mentalHealthSummary.support_anchor || 'Mom'} (Unconditional Care)
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-200/70 text-xs text-amber-950 font-medium leading-relaxed">
                        💬 <strong>A gentle reminder for {firstName}:</strong> Take 3 slow deep breaths right now. When you encounter any difficult question today, don't rush. Trust your preparation, and remember you have your {mentalHealthSummary.support_anchor || 'family'}'s love behind you!
                      </div>

                      <button
                        id="start-exam-from-wellbeing-btn"
                        onClick={handleFinalStart}
                        className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        <Play className="w-4 h-4 fill-stone-950" />
                        <span>Start Diagnostic Exam with a Calm Mind 🚀</span>
                      </button>
                    </div>
                  )}

                  {/* Interactive Options Chips */}
                  {msg.options && msg.options.length > 0 && !isConversationComplete && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUserResponse(opt.value)}
                          className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-yellow-100 hover:border-yellow-300 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all text-left cursor-pointer active:scale-95 hover:shadow-2xs"
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-stone-400 mt-1 block text-right font-medium">
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-2xl bg-stone-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    👦
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing animation indicator */}
          {isBotTyping && (
            <div className="flex gap-2 items-center text-stone-400 text-xs pl-11">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Counselor is listening and thinking...</span>
            </div>
          )}
        </div>

        {/* Chat input box */}
        {!isConversationComplete && (
          <div className="p-3 sm:p-4 bg-white border-t border-stone-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder={`Share your thoughts with the counselor, ${firstName}...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-yellow-400 font-medium placeholder:text-stone-400"
            />
            <button
              onClick={handleSendText}
              disabled={!inputText.trim() || isBotTyping}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-stone-900 hover:bg-black text-yellow-400 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
