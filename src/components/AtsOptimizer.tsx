import React, { useState } from 'react';
import { EvaluationResult, StudentProfile, InternshipPosting } from '../types/career';
import { Sparkles, Copy, Check, FileText, Download, CheckCircle, Target, ArrowRight } from 'lucide-react';

interface AtsOptimizerProps {
  result: EvaluationResult;
  student: StudentProfile;
  job: InternshipPosting;
}

export const AtsOptimizer: React.FC<AtsOptimizerProps> = ({ result, student, job }) => {
  const [copiedHeadline, setCopiedHeadline] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [highlightStar, setHighlightStar] = useState(true);

  const { suggested_profile_headline, recommended_star_bullet_points } = result.ats_optimization;

  const handleCopyHeadline = () => {
    navigator.clipboard.writeText(suggested_profile_headline);
    setCopiedHeadline(true);
    setTimeout(() => setCopiedHeadline(false), 2000);
  };

  const handleCopyBullet = (bullet: string, idx: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleCopyAll = () => {
    const text = [
      `TARGET HEADLINE:\n${suggested_profile_headline}\n`,
      `PROJECT STAR BULLETS:\n${recommended_star_bullet_points.map((b) => `• ${b}`).join('\n')}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Applicant Tracking System (ATS) Keyword Scoring</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              ATS Optimization &amp; Resume Impact Engine
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Convert raw coursework and GitHub repositories into high-conversion recruiter bullet points using the proven STAR format.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setHighlightStar(!highlightStar)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                highlightStar
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              aria-label="Toggle STAR anatomy highlighting"
            >
              <span>{highlightStar ? 'Anatomy Highlighted' : 'Show STAR Breakdown'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 transition-colors"
              aria-label="Copy all ATS content"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'All Copied!' : 'Copy Complete Resume Pack'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Headline Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Target className="w-4 h-4" />
            <span>High-Ranking LinkedIn &amp; Resume Headline</span>
          </div>
          <button
            type="button"
            onClick={handleCopyHeadline}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition-colors"
            aria-label="Copy headline"
          >
            {copiedHeadline ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Headline</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-cyan-300">
          {suggested_profile_headline}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Engineered to pass Boolean recruiter searches for target skills: {student.core_languages.split(',')[0]}, {job.job_title}.
        </p>
      </div>

      {/* STAR Bullet Points List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Recommended STAR Bullet Points</h3>
            <p className="text-xs text-slate-400">Action Verb + Situation/Task + Tech Stack + Quantifiable Outcome</p>
          </div>

          {highlightStar && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">Action Verb</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">Tech Stack</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">Quantifiable Metric</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {recommended_star_bullet_points.map((bullet, idx) => (
            <div
              key={idx}
              className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex-shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {bullet}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyBullet(bullet, idx)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                  aria-label={`Copy bullet point ${idx + 1}`}
                >
                  {copiedBulletIdx === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
