import React from 'react';
import {
  Sparkles,
  Layers,
  Award,
  Users,
  CheckCircle2,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-300 mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          About EduJunction Platform
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-4">
          Revolutionizing School Exam Preparedness Through Adaptive Diagnostics
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          EduJunction is engineered for parents and students in Classes 5 to 12 across premier national and international boards. We transform stressful exam preparation into manageable, high-accuracy 10-mark diagnostic sprints grounded in authentic curriculum runbooks.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-2">RAG-Grounded Runbooks</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every question and explanation is strictly cross-verified against real board runbooks (CBSE, ICSE, Cambridge, NEET, IIT) to prevent hallucinations and maintain syllabus fidelity.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-2">The 10-Mark Sprint Model</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Instead of overwhelming students with 3-hour tests, our 10-question sprint pinpoints conceptual gaps in 15 minutes, allowing children to test daily without burnout.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-2">Parent & Child Co-Pilot</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Parents manage a single master account with dedicated sub-accounts for each child. Real-time evolutionary roadmaps empower parents to track learning trajectory with confidence.
          </p>
        </div>
      </div>

      {/* Board Coverage Grid */}
      <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 sm:p-8 mb-12">
        <h3 className="text-base font-bold text-stone-900 mb-4">Supported Curricula & Competitive Benchmarks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="font-bold text-yellow-700">CBSE & NCERT</div>
            <div className="text-stone-500 mt-0.5">Classes 5 to 12 • All Core Streams</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="font-bold text-yellow-700">ICSE & ISC Board</div>
            <div className="text-stone-500 mt-0.5">CISCE Standardized Syllabus</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="font-bold text-yellow-700">UK Cambridge (CIE)</div>
            <div className="text-stone-500 mt-0.5">IGCSE, AS & A Levels</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="font-bold text-yellow-700">NEET & IIT JEE</div>
            <div className="text-stone-500 mt-0.5">HOTS Numerical & Logical Drills</div>
          </div>
        </div>
      </div>
    </div>
  );
};
