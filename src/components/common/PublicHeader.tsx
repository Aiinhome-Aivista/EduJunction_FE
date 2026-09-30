import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { getStoredTokens } from "../../services/ApiServices";

export interface PublicHeaderProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onOpenAuth }) => {
  const [mob, setMob] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isBlogActive = location.pathname.startsWith("/blog");
  const isLoggedIn = !!getStoredTokens();

  const [activeSection, setActiveSection] = useState<'home' | 'features' | 'free-mock-papers-2027' | 'actions-demo' | 'for-everyone'>('home');

  // Track active section and dynamically update browser URL in real-time as user scrolls
  React.useEffect(() => {
    if (isBlogActive) return;

    const sectionIds = [
      { id: 'hero', key: 'home' as const, path: '/' },
      { id: 'features', key: 'features' as const, path: '/features' },
      { id: 'why-edujunction', key: 'features' as const, path: '/features' },
      { id: 'free-mock-papers-2027', key: 'free-mock-papers-2027' as const, path: '/free-mock-papers-2027' },
      { id: 'actions-demo', key: 'actions-demo' as const, path: '/actions-demo' },
      { id: 'for-everyone', key: 'for-everyone' as const, path: '/for-everyone' },
    ];

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      if (Date.now() < ((window as any).__disableUrlSyncUntil || 0)) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (Date.now() < ((window as any).__disableUrlSyncUntil || 0)) return;

        const scrollY = window.scrollY;
        if (scrollY < 200) {
          setActiveSection('home');
          if (window.location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
          }
          return;
        }

        const offset = 180;
        let currentKey: typeof activeSection = 'home';
        let currentPath = '/';

        for (const s of sectionIds) {
          const el = document.getElementById(s.id);
          if (el) {
            const top = el.getBoundingClientRect().top + scrollY - offset;
            if (scrollY >= top) {
              currentKey = s.key;
              currentPath = s.path;
            }
          }
        }

        setActiveSection(currentKey);
        if (window.location.pathname !== currentPath) {
          window.history.replaceState(null, '', currentPath);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogActive]);

  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();

    const isLanding =
      location.pathname === "/" ||
      location.pathname === "/home" ||
      location.pathname === "/landing" ||
      location.pathname === "/features" ||
      location.pathname === "/free-mock-papers-2027" ||
      location.pathname === "/model-papers-2027" ||
      location.pathname === "/actions-demo" ||
      location.pathname === "/for-everyone";

    const targetPath = sectionId === 'hero' ? '/' : `/${sectionId}`;

    if (!isLanding) {
      navigate(targetPath);
      return;
    }

    (window as any).__disableUrlSyncUntil = Date.now() + 1100;
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }

    if (sectionId === 'hero' || sectionId === 'home' || sectionId === 'top' || sectionId === '') {
      setActiveSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId) || (sectionId === 'features' ? document.getElementById('why-edujunction') : null);
      if (el) {
        setActiveSection(sectionId as any);
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 72;
        const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={(e) => handleNavClick('hero', e)} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-lg shadow-yellow-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-stone-900">
              Edu<span className="text-yellow-500">Junction</span>
            </div>
            <div className="text-[10px] text-stone-500 font-semibold hidden sm:block">Smarter Learning Platform</div>
          </div>
        </Link>


        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-600">
          <button
            type="button"
            onClick={(e) => handleNavClick('hero', e)}
            className={`cursor-pointer transition-colors ${(!isBlogActive && activeSection === 'home') ? "text-yellow-600 font-bold" : "hover:text-yellow-600"}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={(e) => handleNavClick('features', e)}
            className={`cursor-pointer transition-colors ${(!isBlogActive && activeSection === 'features') ? "text-yellow-600 font-bold" : "hover:text-yellow-600"}`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={(e) => handleNavClick('free-mock-papers-2027', e)}
            className={`cursor-pointer flex items-center gap-1.5 transition-colors ${(!isBlogActive && activeSection === 'free-mock-papers-2027') ? "text-yellow-600 font-bold" : "hover:text-yellow-600"}`}
          >
            Free Mock Papers <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">2027</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleNavClick('actions-demo', e)}
            className={`cursor-pointer transition-colors ${(!isBlogActive && activeSection === 'actions-demo') ? "text-yellow-600 font-bold" : "hover:text-yellow-600"}`}
          >
            Actions &amp; Demo
          </button>
          <button
            type="button"
            onClick={(e) => handleNavClick('for-everyone', e)}
            className={`cursor-pointer transition-colors ${(!isBlogActive && activeSection === 'for-everyone') ? "text-yellow-600 font-bold" : "hover:text-yellow-600"}`}
          >
            For Everyone
          </button>
          <Link to="/blog" className={isBlogActive ? "text-yellow-600 font-black" : "hover:text-yellow-600 transition-colors"}>Blogs</Link>
        </nav>

        {/* Auth buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {isLoggedIn ? (
            <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-sm font-extrabold shadow-lg shadow-yellow-200 flex items-center gap-2 transition-all">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : onOpenAuth ? (
            <>
              <button onClick={() => onOpenAuth('login')} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-100 transition-colors">
                Login
              </button>
              <button onClick={() => onOpenAuth('register')} className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-sm font-extrabold shadow-lg shadow-yellow-200 flex items-center gap-2 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/?auth=login" className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-100 transition-colors">
                Login
              </Link>
              <Link to="/?auth=register" className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-sm font-extrabold shadow-lg shadow-yellow-200 flex items-center gap-2 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMob(v => !v)} className="lg:hidden p-2 rounded-xl hover:bg-stone-100">
          {mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mob && (
        <div className="lg:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-2">
          {[["hero", "Home"], ["features", "Features"], ["free-mock-papers-2027", "Free Mock Papers 2027"], ["actions-demo", "Actions & Demo"], ["for-everyone", "For Everyone"]].map(([sectionId, label]) => (
            <button
              key={sectionId}
              type="button"
              onClick={(e) => { setMob(false); handleNavClick(sectionId, e); }}
              className={`block w-full text-left py-2.5 text-sm ${(!isBlogActive && (activeSection === sectionId || (sectionId === 'hero' && activeSection === 'home'))) ? "font-bold text-yellow-600" : "font-semibold text-stone-700 hover:text-yellow-600"}`}
            >
              {label}
            </button>
          ))}
          <Link to="/blog" onClick={() => setMob(false)} className={isBlogActive ? "block py-2.5 text-sm font-black text-yellow-600" : "block py-2.5 text-sm font-semibold text-stone-700 hover:text-yellow-600"}>Blogs</Link>
          <div className="pt-3 border-t border-stone-100 flex gap-2">
            {isLoggedIn ? (
              <Link to="/dashboard" onClick={() => setMob(false)} className="flex-1 py-2.5 text-center rounded-xl bg-yellow-400 text-stone-900 font-bold text-sm">
                Go to Dashboard
              </Link>
            ) : onOpenAuth ? (
              <>
                <button onClick={() => { setMob(false); onOpenAuth('login'); }} className="flex-1 py-2.5 text-center rounded-xl border border-stone-200 font-bold text-sm">Login</button>
                <button onClick={() => { setMob(false); onOpenAuth('register'); }} className="flex-1 py-2.5 text-center rounded-xl bg-yellow-400 text-stone-900 font-bold text-sm">Get Started</button>
              </>
            ) : (
              <>
                <Link to="/?auth=login" className="flex-1 py-2.5 text-center rounded-xl border border-stone-200 font-bold text-sm">Login</Link>
                <Link to="/?auth=register" className="flex-1 py-2.5 text-center rounded-xl bg-yellow-400 text-stone-900 font-bold text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
