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
  const isFeaturesActive = location.pathname === "/features";
  const isPricingActive = location.pathname === "/pricing";
  const isQuickTestActive = location.pathname.startsWith("/quick-test");
  const isHomeActive =
    location.pathname === "/" ||
    location.pathname === "/home" ||
    location.pathname === "/free-mock-papers-2027" ||
    location.pathname === "/model-papers-2027" ||
    location.pathname === "/actions-demo" ||
    location.pathname === "/for-everyone";
  const isLoggedIn = !!getStoredTokens();

  const [activeSection, setActiveSection] = useState<'home' | 'features' | 'free-mock-papers-2027' | 'actions-demo' | 'for-everyone'>('home');

  // Track active section and dynamically update browser URL in real-time as user scrolls (Landing only)
  React.useEffect(() => {
    if (!isHomeActive) return;

    const sectionIds = [
      { id: 'hero', key: 'home' as const, path: '/' },
      { id: 'actions-demo', key: 'home' as const, path: '/' },
      { id: 'free-mock-papers-2027', key: 'free-mock-papers-2027' as const, path: '/free-mock-papers-2027' },
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
  }, [isHomeActive]);

  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();

    if (sectionId === 'features') {
      if (location.pathname === '/features') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/features');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return;
    }

    if (sectionId === 'pricing') {
      if (location.pathname === '/pricing') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/pricing');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return;
    }

    const isLanding =
      location.pathname === "/" ||
      location.pathname === "/home" ||
      location.pathname === "/landing" ||
      location.pathname === "/free-mock-papers-2027" ||
      location.pathname === "/model-papers-2027" ||
      location.pathname === "/actions-demo" ||
      location.pathname === "/for-everyone";

    const targetPath = (sectionId === 'hero' || sectionId === 'actions-demo') ? '/' : `/${sectionId}`;

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
      const el = document.getElementById(sectionId);
      if (el) {
        setActiveSection(sectionId as any);
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 72;
        const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  };

  // Helper utility for rounded pill button hover/active styling
  const navButtonClasses = (isActive: boolean) => `
    px-4 py-2 rounded-full cursor-pointer transition-all duration-200
    ${isActive 
      ? "bg-yellow-400 text-stone-950 font-extrabold shadow-sm" 
      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}
  `;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={(e) => handleNavClick('hero', e)} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-yellow-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-stone-900">
              Edu<span className="text-yellow-500">Junction</span>
            </div>
            <div className="text-[12px] text-stone-700 font-extrabold hidden sm:block">Smarter Learning Platform</div>
          </div>
        </Link>

        {/* Desktop nav with Rounded Pill Style */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={(e) => handleNavClick('hero', e)}
            className={navButtonClasses(isHomeActive && activeSection === 'home')}
          >
            Home
          </button>
          
          <button
            type="button"
            onClick={(e) => handleNavClick('features', e)}
            className={navButtonClasses(isFeaturesActive)}
          >
            Features
          </button>

          <button
            type="button"
            onClick={(e) => handleNavClick('pricing', e)}
            className={navButtonClasses(isPricingActive)}
          >
            Pricing
          </button>
          
          <button
            type="button"
            onClick={(e) => handleNavClick('free-mock-papers-2027', e)}
            className={`${navButtonClasses(isHomeActive && activeSection === 'free-mock-papers-2027')} flex items-center gap-1.5`}
          >
            Free Mock Test <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isHomeActive && activeSection === 'free-mock-papers-2027' ? "bg-stone-950 text-yellow-400" : "bg-amber-200 text-amber-900"}`}>2027</span>
          </button>
          
          <Link 
            to="/blog" 
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${isBlogActive ? "bg-yellow-400 text-stone-950 font-extrabold shadow-sm" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`}
          >
            Blogs
          </Link>
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
              <button onClick={() => onOpenAuth('register')} className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-sm font-extrabold shadow-yellow-200 flex items-center gap-2 transition-all">
                Sign Up <ArrowRight className="w-4 h-4" />
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
          {[
            ["hero", "Home", isHomeActive && activeSection === 'home'],
            ["features", "Features", isFeaturesActive],
            ["pricing", "Pricing", isPricingActive],
            ["free-mock-papers-2027", "Free Mock Test 2027", isHomeActive && activeSection === 'free-mock-papers-2027'],
            ["actions-demo", "Actions & Demo", isHomeActive && activeSection === 'actions-demo']
          ].map(([sectionId, label, isActive]) => (
            <button
              key={sectionId as string}
              type="button"
              onClick={(e) => { setMob(false); handleNavClick(sectionId as string, e); }}
              className={`block w-full text-left py-2.5 px-3 rounded-xl text-sm ${(!isBlogActive && isActive) ? "font-extrabold text-stone-950 bg-yellow-400 shadow-sm" : "font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900"}`}
            >
              {label as string}
            </button>
          ))}
          <Link to="/blog" onClick={() => { setMob(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} className={isBlogActive ? "block py-2.5 px-3 rounded-xl text-sm font-extrabold text-stone-950 bg-yellow-400 shadow-sm" : "block py-2.5 px-3 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900"}>Blogs</Link>
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
