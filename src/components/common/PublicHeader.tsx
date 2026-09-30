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

  const isLandingRoute =
    location.pathname === "/" ||
    location.pathname === "/landing" ||
    location.pathname === "/features" ||
    location.pathname === "/model-papers-2027" ||
    location.pathname === "/how-it-works" ||
    location.pathname === "/roles" ||
    location.pathname === "/demo";

  const handleNavClick = (path: string, sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();

    if (isLandingRoute) {
      if (location.pathname !== path) {
        navigate(path);
      }
      if (sectionId === 'hero' || sectionId === 'top' || sectionId === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          const fixedBar = document.querySelector('.fixed.top-0');
          const fixedHeight = fixedBar ? fixedBar.getBoundingClientRect().height : 116;
          const y = el.getBoundingClientRect().top + window.pageYOffset - fixedHeight + 20;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
      }
    } else {
      // Coming from other routes (e.g. /blog, /about, /privacy, etc.)
      navigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to={isLoggedIn ? "/landing" : "/"} onClick={(e) => handleNavClick(isLoggedIn ? "/landing" : "/", 'hero', e)} className="flex items-center gap-3">
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
          <Link to={isLoggedIn ? "/landing" : "/"} onClick={(e) => handleNavClick(isLoggedIn ? "/landing" : "/", 'hero', e)} className="hover:text-yellow-600 transition-colors">Home</Link>
          <Link to="/features" onClick={(e) => handleNavClick('/features', 'features', e)} className="hover:text-yellow-600 transition-colors">Features</Link>
          <Link to="/model-papers-2027" onClick={(e) => handleNavClick('/model-papers-2027', 'model-papers-2027', e)} className="hover:text-yellow-600 flex items-center gap-1.5 transition-colors">
            Model Papers <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">2027</span>
          </Link>
          <Link to="/how-it-works" onClick={(e) => handleNavClick('/how-it-works', 'how-it-works', e)} className="hover:text-yellow-600 transition-colors">How It Works</Link>
          <Link to="/roles" onClick={(e) => handleNavClick('/roles', 'roles', e)} className="hover:text-yellow-600 transition-colors">For Everyone</Link>
          <Link to="/demo" onClick={(e) => handleNavClick('/demo', 'demo', e)} className="hover:text-yellow-600 flex items-center gap-1.5 transition-colors">
            Demo <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">LIVE</span>
          </Link>
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
          {[["/", "hero", "Home"], ["/features", "features", "Features"], ["/model-papers-2027", "model-papers-2027", "Model Papers 2027"], ["/how-it-works", "how-it-works", "How It Works"], ["/roles", "roles", "For Everyone"], ["/demo", "demo", "Demo"]].map(([path, sectionId, label]) => (
            <Link key={path} to={path} onClick={(e) => { setMob(false); handleNavClick(path, sectionId, e); }} className="block py-2.5 text-sm font-semibold text-stone-700 hover:text-yellow-600">{label}</Link>
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
