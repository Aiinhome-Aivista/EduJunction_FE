import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LogOut } from 'lucide-react';

export interface PageAccess {
  id: number;
  icon: string;
  isActive: number;
  menuOrder: number;
  pageName: string;
  pageRoute: string;
}

interface SidebarProps {
  pageAccess: PageAccess[];
  isSidebarCollapsed: boolean;
  setMobileSidebarOpen?: (open: boolean) => void;
  onToggleSidebar?: () => void;
  onLogout: () => void;
  onNavigate?: () => void;
  activePersona?: string;
  activeChildName?: string;
}

const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  if (!IconComponent) return Icons.Circle; // fallback icon
  return IconComponent;
};

export const Sidebar: React.FC<SidebarProps> = ({
  pageAccess,
  isSidebarCollapsed,
  setMobileSidebarOpen,
  onToggleSidebar,
  onLogout,
  onNavigate,
  activePersona,
  activeChildName
}) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-yellow-50/40 via-white to-orange-50/20 border-r border-stone-200/60 relative">
      {/* Decorative background blob in sidebar */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-yellow-100/30 to-transparent pointer-events-none"></div>

      {/* Header / Brand */}
      <div className={`h-16 w-full flex items-center justify-between ${isSidebarCollapsed ? 'lg:justify-center px-4' : 'px-6'} border-b border-stone-100 flex-shrink-0 transition-all`}>
        <NavLink
          to="/landing"
          onClick={() => {
            setMobileSidebarOpen?.(false);
            onNavigate?.();
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity group"
          title="Go to EduJunction Landing Page"
        >
          <Icons.GraduationCap className="w-6 h-6 text-yellow-500 flex-shrink-0 group-hover:scale-105 transition-transform" />
          <span className={`text-lg font-black tracking-tight transition-all ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            <span className="text-stone-900">Edu</span><span className="text-yellow-500">Junction</span>
          </span>
        </NavLink>

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`hidden lg:flex p-1.5 rounded-lg text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 bg-stone-50 border border-stone-100 transition-colors ${isSidebarCollapsed ? '' : 'ml-auto'}`}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <Icons.ChevronRight className="w-5 h-5" />
            ) : (
              <Icons.ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Dynamic Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">

        {(Array.isArray(pageAccess) ? pageAccess : [])
          .filter(page => page.isActive === 1)
          .sort((a, b) => a.menuOrder - b.menuOrder)
          .map((page) => {
            const Icon = getIconComponent(page.icon);
            return (
              <NavLink
                key={page.id}
                to={page.pageRoute}
                onClick={() => {
                  setMobileSidebarOpen?.(false);
                  onNavigate?.();
                }}
                className={({ isActive }) => `
                  group w-full flex items-center py-2.5 rounded-xl text-sm transition-all relative overflow-hidden
                  ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'}
                  ${isActive
                    ? 'text-yellow-700 font-bold bg-gradient-to-r from-yellow-50 to-white shadow-sm border border-yellow-100/50'
                    : 'text-stone-500 font-medium hover:text-stone-900 hover:bg-stone-50 border border-transparent'
                  }
                `}
                title={page.pageName}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-yellow-400 rounded-r-full"></div>}
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors relative z-10 ${isActive ? 'text-yellow-600' : 'text-stone-400 group-hover:text-stone-500'}`} />
                    <span className={`truncate relative z-10 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                      {page.pageName}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* Footer Actions (Logout) */}
      <div className="p-4 border-t border-stone-100 mt-auto">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          title="Log out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Log out</span>
        </button>
      </div>
    </div>
  );
};
