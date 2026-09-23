import React from 'react';
import { ShieldCheck, AlertCircle, FileText, Lock } from 'lucide-react';

export const LegalSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Trust & Compliance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Disclaimer, Privacy Policy & Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          Last Updated: March 2026 • Built for student safety, parental oversight, and syllabus integrity.
        </p>
      </div>

      <div className="space-y-8 bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm text-stone-700 text-xs sm:text-sm leading-relaxed">
        {/* Academic Disclaimer */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-bold text-stone-900">1. Academic & Diagnostic Disclaimer</h2>
          </div>
          <p>
            EduJunction is a supplementary educational diagnostic assessment platform. All 10-mark sprint examinations, step-by-step model solutions, and topic mastery ratings are generated using curriculum analytics calibrated against published public syllabi of CBSE, ICSE, ISC, Cambridge Assessment International Education, NCERT, and competitive exam guidelines (NEET/IIT-JEE). EduJunction is an independent educational platform and is not officially affiliated with or endorsed by CISCE, CBSE, Cambridge University Press &amp; Assessment, or NTA. Diagnostic scores should be used as formative practice indicators alongside regular school instruction.
          </p>
        </section>

        {/* Child Safety and Privacy */}
        <section className="pt-6 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-yellow-600" />
            <h2 className="text-base font-bold text-stone-900">2. Student Privacy & Parental Oversight</h2>
          </div>
          <p>
            Protecting school children (Classes 5 to 12) is our foremost priority. Child sub-accounts are strictly created, monitored, and mediated by a verified parent or legal guardian master account. We do not sell student response logs or personal information to third parties. Exam responses are utilized solely to construct student-specific knowledge graph mastery charts and to provide targeted educational reference links.
          </p>
        </section>

        {/* Platform Access & Fair Use */}
        <section className="pt-6 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-yellow-600" />
            <h2 className="text-base font-bold text-stone-900">3. Platform Access & Fair Use</h2>
          </div>
          <p>
            EduJunction provides open diagnostic assessments and adaptive learning paths for students subject to standard fair use guidelines. Parents and educators may utilize all interactive features and analytical tools freely for non-commercial educational enrichment.
          </p>
        </section>
      </div>
    </div>
  );
};
