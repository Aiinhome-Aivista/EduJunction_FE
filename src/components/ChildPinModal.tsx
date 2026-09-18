import React, { useState, useRef, useEffect } from 'react';
import { Lock, X, Loader2, AlertCircle } from 'lucide-react';
import { ChildAccount } from '../types';
import ApiServices from '../services/ApiServices';

interface ChildPinModalProps {
  child: ChildAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (childId: string) => void;
}

export const ChildPinModal: React.FC<ChildPinModalProps> = ({
  child,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '']);
      setError(null);
      setShake(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen, child]);

  if (!isOpen || !child) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...pinDigits];
    const char = value.slice(-1);
    newDigits[index] = char;
    setPinDigits(newDigits);
    setError(null);

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === 3) {
      const fullPin = newDigits.join('');
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      const fullPin = pinDigits.join('');
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setPinDigits(digits);
      inputRefs.current[3]?.focus();
      submitPin(pasteData);
    }
  };

  const submitPin = async (pin: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await ApiServices.childLogin({ studentId: child.id, pin });
      onSuccess(child.id);
    } catch (err: any) {
      setError(err?.message || 'Incorrect 4-digit PIN. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPinDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-stone-100 overflow-hidden transform transition-all ${
          shake ? 'animate-bounce' : 'animate-in fade-in zoom-in-95 duration-200'
        }`}
      >
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-3xl shadow-inner border border-white/20 mb-3">
            {child.avatar || '🎓'}
          </div>

          <h3 className="text-lg font-bold tracking-tight">Enter Student PIN</h3>
          <p className="text-xs text-yellow-100 mt-0.5">
            Switching to <span className="font-semibold text-white">{child.name}</span> ({child.classGrade} • {child.targetBoard})
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-xs text-stone-500">
              Please enter the 4-digit security PIN set by the parent.
            </p>
          </div>

          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isLoading}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
                  error
                    ? 'border-red-400 bg-red-50/50 text-red-600 focus:border-red-500'
                    : digit
                    ? 'border-yellow-400 bg-yellow-50/30 text-yellow-900 shadow-2xs'
                    : 'border-stone-200 bg-stone-50 text-stone-900 focus:border-yellow-500 focus:bg-white'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              onClick={() => submitPin(pinDigits.join(''))}
              disabled={isLoading || pinDigits.some((d) => !d)}
              className="w-full py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock & Switch</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-stone-500 hover:text-stone-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
