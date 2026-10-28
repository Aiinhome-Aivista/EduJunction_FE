import React from 'react';
import { ChildAccount } from '../../types';
import { Gamepad2, Volume2, VolumeX } from 'lucide-react';

interface FunZoneMobileHeaderProps {
  activeChild?: ChildAccount;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLaunchExam?: () => void;
}

export const FunZoneMobileHeader: React.FC<FunZoneMobileHeaderProps> = ({
  activeChild,
  soundEnabled,
  onToggleSound,
  onLaunchExam,
}) => (
  <div className="flex sm:hidden items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-xs">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
        <Gamepad2 className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xs font-bold truncate">FunZone Arcade</h2>
        <p className="text-[10px] text-yellow-100 font-medium truncate">
          {activeChild?.streakDays || 1}d Streak &bull; {activeChild?.xp || 1420} XP
        </p>
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={onToggleSound}
        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs cursor-pointer"
        title={soundEnabled ? 'Mute' : 'Unmute'}
        aria-label={soundEnabled ? 'Mute game sounds' : 'Enable game sounds'}
      >
        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      </button>
      {onLaunchExam && (
        <button
          onClick={onLaunchExam}
          className="px-2.5 py-1.5 rounded-xl bg-white text-stone-900 font-bold text-[10px] active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          Exams →
        </button>
      )}
    </div>
  </div>
);
