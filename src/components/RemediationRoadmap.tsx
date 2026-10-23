import React, { useState } from 'react';
import { EvaluationResult } from '../types/career';
import { Layers, CheckCircle2, Circle, Clock, Code2, Cpu, ArrowUpRight, Copy, Check } from 'lucide-react';

interface RemediationRoadmapProps {
  result: EvaluationResult;
}

export const RemediationRoadmap: React.FC<RemediationRoadmapProps> = ({ result }) => {
  const [completedStatus, setCompletedStatus] = useState<Record<number, 'Pending' | 'In Progress' | 'Completed'>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const gaps = result.critical_skill_gaps;

  const toggleStatus = (index: number) => {
    setCompletedStatus((prev) => {
      const current = prev[index] || 'Pending';
      let next: 'Pending' | 'In Progress' | 'Completed' = 'In Progress';
      if (current === 'Pending') next = 'In Progress';
      else if (current === 'In Progress') next = 'Completed';
      else next = 'Pending';
      return { ...prev, [index]: next };
    });
  };

  const handleCopyArchitecture = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const completedCount = Object.values(completedStatus).filter((s) => s === 'Completed').length;
  const progressPercent = gaps.length > 0 ? Math.round((completedCount / gaps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Roadmap Header & Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Zero Generic Fluff • Production-Grade Engineering Blueprints</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Actionable Skill Remediation Roadmaps
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Every missing qualification is translated into an exact architectural specification, design pattern, and portfolio-worthy implementation.
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-w-[240px]">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-400">Roadmap Progress</span>
              <span className="text-cyan-400 font-mono">{completedCount} of {gaps.length} Done ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Cards */}
      <div className="space-y-4">
        {gaps.map((gap, idx) => {
          const status = completedStatus[idx] || 'Pending';
          const priorityColor =
            gap.importance === 'High'
              ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
              : gap.importance === 'Medium'
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              : 'text-slate-400 bg-slate-800 border-slate-700';

          return (
            <div
              key={idx}
              className={`bg-slate-900 border rounded-2xl p-6 transition-all ${
                status === 'Completed'
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : status === 'In Progress'
                  ? 'border-cyan-500/50 bg-cyan-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      Module #{idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{gap.missing_skill}</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${priorityColor}`}>
                      {gap.importance} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Target Role Requirement:</strong> {gap.why_required}
                  </p>
                </div>

                {/* Status Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleStatus(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 border transition-colors ${
                    status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : status === 'In Progress'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  aria-label={`Toggle status for ${gap.missing_skill}`}
                >
                  {status === 'Completed' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : status === 'In Progress' ? (
                    <>
                      <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>In Progress</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-500" />
                      <span>Mark Started</span>
                    </>
                  )}
                </button>
              </div>

              {/* Concrete Portfolio Project Specification */}
              <div className="mt-4 bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
                    <Code2 className="w-4 h-4" />
                    <span>Concrete Implementation Specification</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyArchitecture(gap.actionable_project_fix, idx)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                    aria-label="Copy project specification"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Spec</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-200 font-mono leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {gap.actionable_project_fix}
                </p>

                {/* Architecture Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-300 block">Design Pattern</span>
                      <span className="text-slate-400 text-[11px]">Factory, Circuit Breaker, Cache-Aside</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-300 block">Verification Criterion</span>
                      <span className="text-slate-400 text-[11px]">JMeter / Artillery Load Benchmark</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-300 block">Portfolio Value</span>
                      <span className="text-slate-400 text-[11px]">Direct proof of real production readiness</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
