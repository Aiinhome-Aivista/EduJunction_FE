import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  UserCheck,
  Users,
  ShieldCheck,
  Sparkles,
  BookOpen,
  CreditCard,
  FileText,
  Info,
  AlertTriangle,
  Lock,
  ChevronDown,
  CheckCircle,
  Plus
} from 'lucide-react';
import { ParentAccount, ChildAccount } from '../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  parentAccount: ParentAccount;
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
  onOpenAddChildModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  parentAccount,
  activeChildId,
  setActiveChildId,
  onOpenAddChildModal,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  // Close persona dropdown when clicking anywhere outside
  useEffect(() => {
    if (!showPersonaMenu) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPersonaMenu]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeChild = parentAccount.children.find((c) => c.id === activeChildId);
  const isParentActive = activeChildId === null;


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentView(isParentActive ? 'parent-dashboard' : 'exam-arena')}
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-white shadow-sm ring-2 ring-yellow-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight"><span className="text-stone-900">Edu</span><span className="text-yellow-500">Junction</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-300">
                  RAG K-Graph
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">Class 5–12 Adaptive Board Prep (10-Mark Diagnostic)</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <button
              id="nav-exams-btn"
              onClick={() => setCurrentView('exam-arena')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${currentView === 'exam-arena'
                ? 'bg-yellow-50 text-yellow-700 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              Exam Arena
            </button>

            <button
              id="nav-learning-Junction-btn"
              onClick={() => setCurrentView('learning-Junction')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${currentView === 'learning-Junction'
                ? 'bg-yellow-50 text-yellow-700 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              <span>Learning Junction</span>
            </button>

            <button
              id="nav-gamification-btn"
              onClick={() => setCurrentView('gamification')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${currentView === 'gamification'
                ? 'bg-yellow-50 text-yellow-700 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              <span>Leaderboard & Badges</span>
            </button>

            <button
              id="nav-dashboard-btn"
              onClick={() => setCurrentView('parent-dashboard')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${currentView === 'parent-dashboard'
                ? 'bg-yellow-50 text-yellow-700 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              Family Hub
            </button>



            <button
              id="nav-admin-btn"
              onClick={() => setCurrentView('super-admin')}
              className={`px-2 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1 ${currentView === 'super-admin'
                ? 'bg-amber-50 text-amber-800 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Right Action & Persona Switcher */}
          <div className="flex items-center gap-3">

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={personaMenuRef}>
              <button
                id="persona-switcher-btn"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 transition-all text-xs shadow-2xs group cursor-pointer"
                title={isParentActive ? `Parent Account (${parentAccount.name})` : `Active Student (${activeChild?.name})`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-50 to-amber-50 border border-yellow-200 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                  {isParentActive ? '👨‍👩‍👧‍👦' : activeChild?.avatar || '👤'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform duration-150" />
              </button>

              {/* Persona Menu */}
              {showPersonaMenu && (
                <div
                  id="persona-dropdown-modal"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/60 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                        {parentAccount.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{parentAccount.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">{parentAccount.email || 'Parent Account'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {/* Parent Account Item */}
                    <button
                      onClick={() => {
                        setActiveChildId(null);
                        setShowPersonaMenu(false);
                        setCurrentView('parent-dashboard');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${isParentActive ? 'bg-yellow-50 text-yellow-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">👨‍👩‍👧‍👦</span>
                        <div>
                          <div className="font-medium text-stone-900">Parent Dashboard</div>
                          <div className="text-[10px] text-stone-500">Full family analytics & sub-accounts</div>
                        </div>
                      </div>
                      {isParentActive && <CheckCircle className="w-4 h-4 text-yellow-600" />}
                    </button>

                    <div className="my-1 border-t border-stone-100 px-3 py-1">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Children Profiles</p>
                    </div>

                    {/* Children Items */}
                    {parentAccount.children.map((child) => {
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveChildId(child.id);
                            setShowPersonaMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors text-stone-700 hover:bg-stone-100 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{child.avatar}</span>
                            <div>
                              <div className="font-medium text-stone-900">{child.name}</div>
                              <div className="text-[10px] text-stone-500">
                                {child.classGrade} • {child.targetBoard} • Avg {Math.round(Number(child.averageScore || 0))}%
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200 space-y-1">
            <button
              onClick={() => {
                setCurrentView('exam-arena');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              10-Mark Exam Arena
            </button>
            <button
              onClick={() => {
                setCurrentView('learning-Junction');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Adaptive Learning Junction
            </button>
            <button
              onClick={() => {
                setCurrentView('gamification');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Leaderboard & Badges
            </button>
            <button
              onClick={() => {
                setCurrentView('parent-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Parent & Child Portal
            </button>

            <button
              onClick={() => {
                setCurrentView('blog-section');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Blog & Study Guides
            </button>
            <button
              onClick={() => {
                setCurrentView('about-us');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100"
            >
              About Us & Pedagogy
            </button>
            <button
              onClick={() => {
                setCurrentView('disclaimer');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100"
            >
              Disclaimer
            </button>
            <button
              onClick={() => {
                setCurrentView('policies');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100"
            >
              Privacy & Child Safety Policies
            </button>
            <button
              onClick={() => {
                setCurrentView('super-admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              Super Admin Panel
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
