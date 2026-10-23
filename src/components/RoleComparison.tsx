import React from 'react';
import { StudentProfile, InternshipPosting, EvaluationResult } from '../types/career';
import { SAMPLE_INTERNSHIPS } from '../data/sampleData';
import { calculateObjectiveFit } from '../utils/evaluationLogic';
import { Briefcase, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface RoleComparisonProps {
  student: StudentProfile;
  currentJob: InternshipPosting;
  onSelectRole: (job: InternshipPosting, result: EvaluationResult) => void;
}

export const RoleComparison: React.FC<RoleComparisonProps> = ({
  student,
  currentJob,
  onSelectRole,
}) => {
  const evaluations = SAMPLE_INTERNSHIPS.map((job) => {
    const evalResult = calculateObjectiveFit(student, job);
    return {
      job,
      evalResult,
      isCurrent: job.id === currentJob.id || job.job_title === currentJob.job_title,
    };
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Multi-Domain Career Matrix • Candidate Compatibility Benchmark</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Role-by-Role Internship Comparison for {student.student_name || 'Candidate'}
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Compare candidate readiness across diverse technology specializations (FinTech Backend, Cloud Storage, Observability, AI/ML Platform) to discover their highest-leverage career path.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evaluations.map(({ job, evalResult, isCurrent }) => {
          const score = evalResult.evaluation_summary.match_percentage;
          const status = evalResult.evaluation_summary.fit_status;

          const badgeColor =
            status === 'Strong Fit'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : status === 'Moderate Fit'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

          return (
            <div
              key={job.id}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-cyan-500 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">{job.company_name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          Active Target
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-300 mt-0.5">{job.job_title}</h3>
                    <p className="text-xs text-slate-400">{job.industry_domain}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-black text-white">{score}%</span>
                    <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase mt-1 ${badgeColor}`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mt-4 w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-2 rounded-full ${
                      score >= 75 ? 'bg-emerald-400' : score >= 55 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* Top Matched Strength & Top Missing Gap */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-start space-x-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-400 block font-semibold">Key Strength:</strong>
                      <span className="text-slate-300">{evalResult.verified_strengths[0]?.skill || 'Core CS foundations'}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-400 block font-semibold">Priority Gap:</strong>
                      <span className="text-slate-300">{evalResult.critical_skill_gaps[0]?.missing_skill || 'Production Telemetry'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onSelectRole(job, evalResult)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30'
                  }`}
                  aria-label={`Select ${job.company_name} as active evaluation target`}
                >
                  <span>{isCurrent ? 'Viewing in Detail' : `Switch & Evaluate Against ${job.company_name}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
