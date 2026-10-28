import React from 'react';
import { FileText, Gamepad2 } from 'lucide-react';

interface StudentDashboardExploreProps {
  onNavigateToFunZone: () => void;
  onNavigateToMocks: () => void;
  onNavigateToModelTestPapers: () => void;
}

export const StudentDashboardExplore: React.FC<StudentDashboardExploreProps> = ({
  onNavigateToFunZone,
  onNavigateToMocks,
  onNavigateToModelTestPapers,
}) => (
  <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs">
    <div className="flex items-center justify-between mb-2.5">
      <h3 className="font-bold text-stone-700 text-xs uppercase tracking-wider">Explore</h3>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <button onClick={onNavigateToFunZone} className="flex flex-col items-center justify-center p-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/80 border border-pink-200/60 active:scale-95 transition-all cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700"><Gamepad2 className="w-4 h-4" /></div>
        <span className="text-[10px] font-medium text-stone-700 mt-1 leading-tight text-center">FunZone</span>
      </button>
      <button onClick={onNavigateToMocks} className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200/60 active:scale-95 transition-all cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700"><FileText className="w-4 h-4" /></div>
        <span className="text-[10px] font-medium text-stone-700 mt-1 leading-tight text-center">Mocks</span>
      </button>
      <button onClick={onNavigateToModelTestPapers} className="flex flex-col items-center justify-center p-2 rounded-xl bg-violet-50/70 hover:bg-violet-100/80 border border-violet-200/60 active:scale-95 transition-all cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700"><FileText className="w-4 h-4" /></div>
        <span className="text-[10px] font-medium text-stone-700 mt-1 leading-tight text-center">Model Test</span>
      </button>
    </div>
  </div>
);
