import React from 'react';
import { QuestionEvaluation } from '../../types';

interface DiagnosticReportMobileScoreProps {
  evaluation: QuestionEvaluation;
}

export const DiagnosticReportMobileScore: React.FC<DiagnosticReportMobileScoreProps> = ({ evaluation }) => {
  const maxMarks = (evaluation as any).questionMarks || 1;
  const isCorrect = evaluation.marksAwarded >= maxMarks;

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black sm:hidden border ${isCorrect
      ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
      : evaluation.marksAwarded > 0
        ? 'bg-amber-100 text-amber-900 border-amber-200'
        : 'bg-rose-100 text-rose-900 border-rose-200'
    }`}>
      {isCorrect ? `+${evaluation.marksAwarded}` : '0'}
    </span>
  );
};
