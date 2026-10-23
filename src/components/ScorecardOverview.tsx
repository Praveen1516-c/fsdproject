import React from 'react';
import { EvaluationResult, StudentProfile, InternshipPosting } from '../types/career';
import { Award, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Zap, BookOpen, Database, Sparkles } from 'lucide-react';

interface ScorecardOverviewProps {
  result: EvaluationResult;
  student: StudentProfile;
  job: InternshipPosting;
  onNavigateTab: (tab: string) => void;
}

export const ScorecardOverview: React.FC<ScorecardOverviewProps> = ({
  result,
  student,
  job,
  onNavigateTab,
}) => {
  const { match_percentage, fit_status, executive_verdict } = result.evaluation_summary;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Strong Fit':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          text: 'text-emerald-400',
          ring: 'stroke-emerald-400',
          bg: 'from-emerald-500/20 to-emerald-950/40',
        };
      case 'Moderate Fit':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          text: 'text-amber-400',
          ring: 'stroke-amber-400',
          bg: 'from-amber-500/20 to-amber-950/40',
        };
      case 'Major Gaps':
      default:
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          text: 'text-rose-400',
          ring: 'stroke-rose-400',
          bg: 'from-rose-500/20 to-rose-950/40',
        };
    }
  };

  const statusTheme = getStatusColor(fit_status);

  // Circumference for radial progress (r=52, C = 2 * PI * 52 ≈ 326.7)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (match_percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Banner with Score Gauge and Executive Verdict */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Radial Score Gauge */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`${statusTheme.ring} transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">{match_percentage}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Match Score</span>
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusTheme.badge}`}>
                {fit_status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {student.student_name} ➔ {job.company_name} ({job.job_title})
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Executive Evaluation Verdict
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              "{executive_verdict}"
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('remediation')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-semibold transition-colors"
                aria-label="View Actionable Remediation"
              >
                <span>View {result.critical_skill_gaps.length} Remediation Blueprints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('interview')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-colors"
                aria-label="View Interview Battleground"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Interview DSA &amp; Architecture Prep</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('database')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
                aria-label="Inspect Tomcat and MySQL Sync"
              >
                <Database className="w-3.5 h-3.5" />
                <span>MySQL Insert &amp; Tomcat JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Gaps Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Strengths Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Verified Technical Strengths</h3>
                  <p className="text-xs text-slate-400">Competencies backed by hands-on implementations</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {result.verified_strengths.length} Verified
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {result.verified_strengths.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{item.skill}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed pl-6">
                    {item.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Skill Gaps Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Critical Skill Gaps</h3>
                  <p className="text-xs text-slate-400">Exact systems capabilities required to close</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {result.critical_skill_gaps.length} Target Gaps
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {result.critical_skill_gaps.map((gap, idx) => {
                const priorityBadge =
                  gap.importance === 'High'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : gap.importance === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700';

                return (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-white">{gap.missing_skill}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityBadge}`}>
                        {gap.importance} Priority
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      <strong className="text-slate-300">Why Demanded:</strong> {gap.why_required}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 bg-slate-900/40 -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
                      <div className="flex items-start space-x-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="text-cyan-400 font-semibold">Actionable Portfolio Fix: </span>
                          <span className="text-slate-200">{gap.actionable_project_fix}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
