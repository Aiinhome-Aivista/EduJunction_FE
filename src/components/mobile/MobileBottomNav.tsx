import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  Home,
  BookOpen,
  Gamepad2,
  BarChart3,
  User,
  Users,
  LogOut,
  X,
  Zap,
  CheckCircle,
  Plus,
  Flame,
  Award,
  FileText,
  Sparkles,
  CalendarClock,
  MessageSquare
} from 'lucide-react';
import type { ParentAccount, ChildAccount, AppPersona, PageAccess } from '../../types';
import { getCleanAvatar } from '../../utils/avatarUtils';

interface MobileBottomNavProps {
  pageAccess?: PageAccess[];
  activePersona: AppPersona;
  parentAccount: ParentAccount | null;
  activeChild: ChildAccount | undefined;
  isParentActive: boolean;
  isStudentSession: boolean;
  unreadNotifCount?: number;
  unlockedModelPapersCount?: number;
  onSwitchToParent?: () => void;
  onSwitchToChild?: (childId: string) => void;
  onOpenAddChildModal?: () => void;
  onLogout: () => void;
  onNavigate?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  pageAccess = [],
  activePersona,
  parentAccount,
  activeChild,
  isParentActive,
  isStudentSession,
  unreadNotifCount = 0,
  unlockedModelPapersCount = 0,
  onSwitchToParent,
  onSwitchToChild,
  onOpenAddChildModal,
  onLogout,
  onNavigate
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  // Current clean route
  const currentPath = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard';

  // Hide bottom nav during full-screen live exams or public landing/login
  const isExamActiveSession = location.pathname.includes('/live') || location.search.includes('examActive=true');
  const isPublicPage = ['landing', 'login', 'free-mock-papers-2027', 'model-papers-2027'].includes(currentPath);

  if (isExamActiveSession || isPublicPage) {
    return null;
  }

  // Helper to map icon names dynamically from backend / role_page_access
  const resolveIcon = (iconName?: string, route?: string) => {
    if (iconName && (Icons as any)[iconName]) {
      return (Icons as any)[iconName];
    }
    const r = (route || '').toLowerCase();
    if (r.includes('dashboard') || r === '' || r === '/') return Home;
    if (r.includes('children')) return Users;
    if (r.includes('schedule')) return CalendarClock;
    if (r.includes('report')) return BarChart3;
    if (r.includes('arena') || r.includes('exam')) return BookOpen;
    if (r.includes('fun-zone') || r.includes('gamification')) return Gamepad2;
    if (r.includes('subscription') || r.includes('paper') || r.includes('model')) return FileText;
    if (r.includes('ptc')) return MessageSquare;
    return Sparkles;
  };

  // Helper to format concise mobile dock labels (clean single/double words)
  const formatDockLabel = (name: string, route: string) => {
    const r = (route || '').toLowerCase();
    if (r.includes('dashboard') || r === '' || r === '/') return 'Dashboard';
    if (r.includes('children')) return 'Children';
    if (r.includes('schedule')) return 'Schedule';
    if (r.includes('report')) return 'Reports';
    if (r.includes('arena')) return 'Exam Arena';
    if (r.includes('fun-zone') || r.includes('gamification')) return 'Fun Zone';
    if (r.includes('ptc')) return 'PTC Hub';
    if (r.includes('subscription')) return 'Mocks';
    return name.length > 10 ? name.split(' ')[0] : name;
  };

  // Active pages derived dynamically from role_page_access
  const activePages = (Array.isArray(pageAccess) ? pageAccess : [])
    .filter((p: any) => p.isActive === undefined || p.isActive === 1)
    .sort((a: any, b: any) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0));

  const fallbackPages = isParentActive
    ? [
      { pageName: 'Dashboard', pageRoute: '/dashboard', icon: 'Home' },
      { pageName: 'Children', pageRoute: '/children', icon: 'Users' },
      { pageName: 'Schedule Exam', pageRoute: '/schedule-exam', icon: 'CalendarClock' },
      { pageName: 'Reports', pageRoute: '/reports', icon: 'BarChart3' },
    ]
    : [
      { pageName: 'Dashboard', pageRoute: '/dashboard', icon: 'Home' },
      { pageName: 'Exam Arena', pageRoute: '/arena', icon: 'BookOpen' },
      { pageName: 'Brain Breaks', pageRoute: '/fun-zone', icon: 'Gamepad2' },
      { pageName: 'Reports', pageRoute: '/reports', icon: 'BarChart3' },
    ];

  const pagesToUse = activePages.length > 0 ? activePages.slice(0, 4) : fallbackPages;

  const navItems = pagesToUse.map((page: any, idx: number) => {
    const isModelPaper =
      page.pageRoute === '/subscription' ||
      page.pageName.toLowerCase().includes('model test') ||
      page.pageName.toLowerCase().includes('model paper') ||
      page.pageName.toLowerCase().includes('subscription');

    const destination = isModelPaper ? '/subscription' : page.pageRoute;
    const cleanRoute = (destination || '').replace(/^\//, '').split('/')[0];

    const isActive = (() => {
      if (cleanRoute === 'dashboard' || cleanRoute === 'home' || cleanRoute === '') {
        return currentPath === 'dashboard' || currentPath === 'home' || currentPath === '';
      }
      return currentPath === cleanRoute;
    })();

    return {
      id: page.id || `dock-${idx}-${cleanRoute}`,
      label: formatDockLabel(page.pageName, destination),
      route: destination,
      icon: resolveIcon(page.icon, destination),
      isActive,
    };
  });

  return (
    <>
      {/* ── Floating Frosted-Glass Pill Navigation Dock (Clean, No-Shadow Island) ── */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 bg-stone-900/90 dark:bg-stone-950/90 backdrop-blur-2xl border border-white/15 dark:border-white/10 rounded-[28px] lg:hidden transition-all duration-300 print:hidden px-1.5 py-1.5"
      >
        <div className="grid grid-cols-5 h-13 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setShowAccountSheet(false);
                  onNavigate?.();
                  navigate(item.route);
                }}
                className={`relative flex flex-col items-center justify-center py-0.5 px-1 transition-all group ${active ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200 font-medium'
                  }`}
              >
                {/* Active Indicator Squircle (Crisp, High-Definition without muddy shadow) */}
                <div
                  className={`p-1.5 rounded-2xl transition-all duration-300 ${active
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40 scale-105'
                    : 'text-stone-400 group-active:scale-95'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-amber-400 stroke-[2.3]' : 'text-stone-400 stroke-[1.8]'}`} />
                </div>
                <span
                  className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${active ? 'text-amber-400 font-bold' : 'text-stone-400 font-medium'
                    }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th Tab: Account / Profile */}
          <button
            onClick={() => setShowAccountSheet((prev) => !prev)}
            className={`relative flex flex-col items-center justify-center py-0.5 px-1 transition-all group ${showAccountSheet ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200 font-medium'
              }`}
          >
            <div
              className={`p-1.5 rounded-2xl transition-all duration-300 relative ${showAccountSheet
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40 scale-105'
                : 'text-stone-400 group-active:scale-95'
                }`}
            >
              {isParentActive ? (
                <Users className={`w-5 h-5 ${showAccountSheet ? 'text-amber-400 stroke-[2.3]' : 'text-stone-400 stroke-[1.8]'}`} />
              ) : (
                <User className={`w-5 h-5 ${showAccountSheet ? 'text-amber-400 stroke-[2.3]' : 'text-stone-400 stroke-[1.8]'}`} />
              )}

              {/* Notification bubble if any */}
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-stone-900 animate-pulse" />
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${showAccountSheet ? 'text-amber-400 font-bold' : 'text-stone-400 font-medium'
                }`}
            >
              Account
            </span>
          </button>
        </div>
      </nav>

      {/* ── Native Mobile Bottom Sheet for Account & Profile Switch ── */}
      {showAccountSheet && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAccountSheet(false)}
          />

          {/* Modal / Bottom Sheet Drawer */}
          <div
            className="relative bg-white rounded-t-3xl shadow-2xl border-t border-stone-200/80 p-5 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full ring-2 ring-amber-400 bg-amber-100 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-2xs">
                  {isParentActive ? (
                    parentAccount?.avatar ? (
                      parentAccount.avatar.startsWith('http') || parentAccount.avatar.startsWith('/') ? (
                        <img src={parentAccount.avatar} alt="Parent" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span>{parentAccount.avatar}</span>
                      )
                    ) : (
                      <span>👨‍👩‍👧‍👦</span>
                    )
                  ) : (
                    <span>{getCleanAvatar(activeChild?.avatar, activeChild?.name)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {isParentActive ? parentAccount?.name || 'Parent Account' : activeChild?.name || 'Student Profile'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {isParentActive ? 'Parent' : `${activeChild?.classGrade} • ${activeChild?.targetBoard}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountSheet(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Switcher (Parents can switch to children) */}
            {!isStudentSession && parentAccount && (
              <div className="py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">Student Profiles</p>
                <div className="space-y-1.5">
                  {/* Parent account button */}
                  <button
                    onClick={() => {
                      onSwitchToParent?.();
                      setShowAccountSheet(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${isParentActive
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-bold shadow-2xs'
                      : 'bg-stone-50/60 border-stone-200/80 text-stone-700 hover:bg-stone-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {parentAccount.avatar && (parentAccount.avatar.startsWith('http') || parentAccount.avatar.startsWith('/')) ? (
                          <img src={parentAccount.avatar} alt="Parent" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span>{parentAccount.avatar || '👨‍👩‍👧‍👦'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">{parentAccount.name} (Parent)</p>
                        <p className="text-[10px] text-stone-500">{parentAccount.email}</p>
                      </div>
                    </div>
                    {isParentActive && <CheckCircle className="w-4 h-4 text-amber-600" />}
                  </button>

                  {/* Children list */}
                  {(parentAccount.children || []).map((child) => {
                    const isSelected = !isParentActive && activeChild?.id === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          onSwitchToChild?.(child.id);
                          setShowAccountSheet(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${isSelected
                          ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-bold shadow-2xs'
                          : 'bg-stone-50/60 border-stone-200/80 text-stone-700 hover:bg-stone-100'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full ring-1 ring-amber-300 bg-amber-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                            <span>{getCleanAvatar(child.avatar, child.name)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900">{child.name}</p>
                            <p className="text-[10px] text-stone-500">
                              {child.classGrade} • {child.targetBoard} • {child.xp || 0} XP
                            </p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-600" />}
                      </button>
                    );
                  })}

                  {/* Add child shortcut */}
                  {onOpenAddChildModal && (
                    <button
                      onClick={() => {
                        setShowAccountSheet(false);
                        onOpenAddChildModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:border-amber-400 hover:text-amber-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Child</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Student XP & Level info if in Student persona */}
            {!isParentActive && activeChild && (
              <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-700">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-900">{activeChild.xp || 0} Total XP</p>
                    <p className="text-[10px] text-amber-800 font-medium">Keep practicing daily to level up!</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAccountSheet(false);
                    navigate('/gamification');
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-white text-[11px] font-bold shadow-xs hover:bg-amber-600"
                >
                  Badges
                </button>
              </div>
            )}

            {/* Dynamic App Pages from Sidebar (Full Sidebar replacement on mobile) */}
            <div className="pt-3 border-t border-stone-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                Menu & Sections
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Array.isArray(pageAccess) && pageAccess.length > 0 ? pageAccess : [
                  { id: 1, pageName: 'Model Test Papers', pageRoute: '/subscription', icon: 'FileText' },
                  { id: 2, pageName: 'Learning Path', pageRoute: '/learning-path', icon: 'Sparkles' },
                  { id: 3, pageName: 'Membership & Plans', pageRoute: '/pricing', icon: 'Award' },
                  { id: 4, pageName: 'Exam Arena', pageRoute: '/arena', icon: 'Gamepad2' },
                ])
                  .filter((p: any) => p.isActive === undefined || p.isActive === 1)
                  .sort((a: any, b: any) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0))
                  .map((page: any) => {
                    const PageIcon = (Icons as any)[page.icon] || Icons.Circle;
                    const isModelPaper =
                      page.pageRoute === '/subscription' ||
                      page.pageName.toLowerCase().includes('model test') ||
                      page.pageName.toLowerCase().includes('model paper') ||
                      page.pageName.toLowerCase().includes('subscription');
                    const destination = isModelPaper ? '/subscription' : page.pageRoute;
                    const displayName = isModelPaper && unlockedModelPapersCount > 0
                      ? `${page.pageName} (${unlockedModelPapersCount})`
                      : page.pageName;

                    return (
                      <button
                        key={page.id || page.pageRoute}
                        onClick={() => {
                          setShowAccountSheet(false);
                          onNavigate?.();
                          navigate(destination);
                        }}
                        className="p-2.5 rounded-2xl bg-stone-50 hover:bg-amber-50/60 active:scale-98 text-left text-xs font-bold text-stone-800 hover:text-amber-900 flex items-center gap-2.5 border border-stone-200/70 hover:border-amber-300 transition-all shadow-2xs cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-amber-600 shrink-0">
                          <PageIcon className="w-4 h-4" />
                        </div>
                        <span className="line-clamp-2 leading-snug">{displayName}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setShowAccountSheet(false);
                onLogout();
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-bold transition-all border border-stone-200/80 hover:border-red-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
