import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, RotateCw, RotateCcw } from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface AIChatWidgetProps {
  activeChild?: any;
  childrenList?: any[];
  role?: 'parent' | 'student' | 'teacher' | 'admin';
  isStudent?: boolean;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ activeChild, childrenList, role, isStudent: propIsStudent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: number, text: string, isBot: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStudent = propIsStudent ?? (role === 'student');
  const studentFirstName = activeChild?.name ? activeChild.name.split(' ')[0] : 'there';

  const resetInitialGreeting = useCallback(() => {
    if (isStudent) {
      setMessages([
        {
          id: 1,
          text: `Hey ${studentFirstName}! 🚀 I'm your Personal Tutor. Stuck on a concept, test question, or need tips to level up your score? Ask me anything!`,
          isBot: true
        }
      ]);
    } else if (role === 'teacher' || role === 'admin') {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm EduJunction Support. How can I assist you with curriculum guidance, class analytics, or student management today?`,
          isBot: true
        }
      ]);
    } else {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm EduJunction Teacher Support. How can I assist you with your children's learning journey, academic progress, or home-study guidance today?`,
          isBot: true
        }
      ]);
    }
  }, [isStudent, role, studentFirstName]);

  const fetchSuggestions = useCallback(async () => {
    setIsRefreshingSuggestions(true);
    try {
      const res = await ApiServices.getChatSuggestions();
      if (res && res.suggestions && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
        setApiSuggestions(res.suggestions);
      }
    } catch (e) {
      console.warn("Failed to fetch suggestions from API, falling back to local pool", e);
    } finally {
      setIsRefreshingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, fetchSuggestions]);

  // Session-based reset on child or persona profile switch
  useEffect(() => {
    resetInitialGreeting();
  }, [activeChild?.id, resetInitialGreeting]);

  // Auto-scroll to latest query / response
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Click-Outside & Escape Key Collapse Handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const hasTakenExams = (activeChild?.totalExamsTaken || activeChild?.recentExams?.length || 0) > 0;

  // Resolve all children for dynamic parent questions fallback
  const children = (childrenList && childrenList.length > 0)
    ? childrenList
    : (activeChild ? [activeChild] : []);

  let dynamicParentFallback: string[] = [];

  if (children.length === 0) {
    dynamicParentFallback = [
      "How do I get started with EduJunction?",
      "How can I add and track my children's learning journey?",
      "Can you suggest some interactive learning activities?",
      "How can I assess my child's current knowledge level?"
    ];
  } else if (children.length === 1) {
    const name = children[0].name ? children[0].name.split(' ')[0] : 'my child';
    dynamicParentFallback = [
      `How is ${name} progressing overall?`,
      `Which subjects or topics does ${name} need more attention on?`,
      `What should ${name} practice next to improve?`,
      `How can I help ${name} build an effective daily study routine?`
    ];
  } else if (children.length === 2) {
    const name1 = children[0].name ? children[0].name.split(' ')[0] : 'child 1';
    const name2 = children[1].name ? children[1].name.split(' ')[0] : 'child 2';
    dynamicParentFallback = [
      `How is ${name1} progressing overall?`,
      `Which topics does ${name1} need more attention on?`,
      `How is ${name2} performing in recent practice tests?`,
      `Can you give me a comparative overview of both children?`
    ];
  } else {
    const firstNames = children.slice(0, 3).map((c: any) => c.name ? c.name.split(' ')[0] : 'child');
    dynamicParentFallback = [
      `How are my children performing overall?`,
      `Which child needs the most focus this week?`,
      `Show me a quick summary for ${firstNames.join(', ')}`,
      `What are the upcoming topics my children should practice?`
    ];
  }

  const fallbackQuestions = isStudent
    ? (hasTakenExams
      ? [
        "How can I improve my score in my weakest subject?",
        "Explain the mistakes I made in my latest test.",
        "What should I practice today to earn more XP & streak?",
        "Can you explain a difficult concept in simple words?"
      ]
      : [
        "How do I start a 10-Mark diagnostic practice test?",
        "Can you explain a difficult topic in simple words?",
        "What is the best way to earn badges and level up?",
        "Give me 3 smart tips to study faster!"
      ])
    : (role === 'teacher' || role === 'admin'
      ? [
        "How can I generate dynamic diagnostic question papers?",
        "Show summary of class mastery and average scores",
        "What topics need remediation across students?",
        "How does curriculum grounding work?"
      ]
      : dynamicParentFallback);

  const displayQuestions = (apiSuggestions && apiSuggestions.length > 0)
    ? apiSuggestions
    : fallbackQuestions;

  const handleSendText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = messages
        .filter(m => m.id !== 1)
        .map(m => ({ role: m.isBot ? "assistant" : "user", content: m.text }));
      chatHistory.push({ role: "user", content: text });

      const res = await ApiServices.sendChatMessage({
        messages: chatHistory,
        student_id: activeChild?.id
      });

      const botMsg = { id: Date.now() + 1, text: res.response || "I didn't quite get that.", isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now. Please try again later.", isBot: true };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(inputText);
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-stone-200 shadow-2xl rounded-2xl w-80 sm:w-96 h-[28rem] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-4 text-white flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isStudent ? 'Study Assistant' : 'Teacher Support'}
                </h3>
                <p className="text-[10px] text-yellow-100 font-medium">
                  {isStudent ? 'Online • Your Personal Tutor' : 'Online • Replies instantly'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={resetInitialGreeting}
                  className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer active:scale-95"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer active:scale-95"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-amber-100 text-amber-600' : 'bg-stone-200 text-stone-600'}`}>
                  {msg.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-xs shadow-xs whitespace-pre-wrap ${msg.isBot ? 'bg-white border border-stone-200 text-stone-700 rounded-tl-none' : 'bg-yellow-500 text-white font-medium rounded-tr-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between px-1 mb-1">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    {isStudent ? 'Recommended for You' : 'Suggested Questions'}
                  </p>
                  <button
                    type="button"
                    onClick={fetchSuggestions}
                    disabled={isRefreshingSuggestions}
                    title="Refresh suggestions"
                    className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer transition-colors bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 active:scale-95"
                  >
                    <RotateCw className={`w-2.5 h-2.5 ${isRefreshingSuggestions ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingSuggestions ? 'Updating...' : 'Refresh'}</span>
                  </button>
                </div>
                {displayQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendText(q)}
                    className="text-left bg-white border border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-stone-700 text-xs px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-stone-200 rounded-tl-none shadow-xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Auto-scroll target anchor */}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isStudent ? "Ask your study buddy anything..." : "Ask Teacher Support anything..."}
              className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-yellow-400 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 bg-gradient-to-tr from-yellow-500 to-amber-500 text-white hover:shadow-yellow-500/20 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
