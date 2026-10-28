import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopButtonProps {
  /** Scroll distance in pixels before the button appears. */
  showAfter?: number;
  /** Restrict visibility to mobile breakpoints. */
  mobileOnly?: boolean;
  className?: string;
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  showAfter = 360,
  mobileOnly = false,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > showAfter);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [showAfter]);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-28 right-8 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/70 bg-stone-900 text-yellow-300 shadow-lg shadow-stone-950/20 transition-all duration-300 ${mobileOnly ? "sm:hidden" : ""} ${isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"} ${className}`}
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};
