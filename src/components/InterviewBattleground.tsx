import React, { useState } from 'react';
import { EvaluationResult } from '../types/career';
import { BookOpen, Code, HelpCircle, ChevronDown, ChevronUp, Check, ExternalLink, Lightbulb } from 'lucide-react';

interface InterviewBattlegroundProps {
  result: EvaluationResult;
}

export const InterviewBattleground: React.FC<InterviewBattlegroundProps> = ({ result }) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [solvedDsa, setSolvedDsa] = useState<Record<number, boolean>>({});

  const { data_structures_and_algorithms_focus, core_cs_and_system_design_questions } =
    result.technical_interview_prep;

  const toggleSolved = (idx: number) => {
    setSolvedDsa((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getSystemDesignExplanation = (question: string): { keyConcepts: string[]; explanation: string } => {
    if (question.toLowerCase().includes('locking') || question.toLowerCase().includes('isolation')) {
      return {
        keyConcepts: ['MVCC (Multi-Version Concurrency Control)', 'Pessimistic vs Optimistic Locking', 'Phantom Reads vs Non-Repeatable Reads', 'Write Skew Anomalies'],
        explanation: 'Relational engines like PostgreSQL utilize MVCC: updating a row creates a new tuple version with xmin/xmax transaction IDs. Under Read Committed, each statement sees a fresh snapshot. Under Repeatable Read, the snapshot is pinned at the start of the transaction, eliminating non-repeatable reads and phantom reads in PostgreSQL via snapshot isolation without table-wide locks.',
      };
    }
    if (question.toLowerCase().includes('idempotent') || question.toLowerCase().includes('payment')) {
      return {
        keyConcepts: ['Idempotency-Key Header', 'Distributed Locks (Redis Redlock)', 'Unique DB Constraint Index', 'State Machine (Initiated, Pending, Settled)'],
        explanation: 'Store the incoming client Idempotency-Key in a database table with a UNIQUE constraint or Redis SETNX with a 24-hour TTL. If the key exists with a completed payload, return the cached result immediately. If pending, return HTTP 409 Conflict. If network times out while calling the payment gateway, query the gateway transaction status using the idempotency key before attempting any retry.',
      };
    }
    if (question.toLowerCase().includes('tcp') || question.toLowerCase().includes('socket')) {
      return {
        keyConcepts: ['SYN -> SYN-ACK -> ACK', 'TIME_WAIT socket state (2 * MSL)', 'SO_REUSEADDR socket option', 'TCP backlog queue'],
        explanation: 'Under high request volume with rapid connection closure, sockets linger in TIME_WAIT for 60 seconds (2*MSL) to ensure lingering duplicate segments are discarded. In Linux, set net.ipv4.tcp_tw_reuse = 1 to allow recycling TIME_WAIT sockets for outgoing connections safely, and increase net.core.somaxconn for socket backlog.',
      };
    }
    if (question.toLowerCase().includes('sharding') || question.toLowerCase().includes('partition')) {
      return {
        keyConcepts: ['Consistent Hashing ring', 'Scatter-gather query penalty', 'Global Secondary Indexes', 'Virtual Nodes (vnodes)'],
        explanation: 'Sharding splits large tables across separate physical databases by a Shard Key (e.g. user_id). Queries targeting the shard key route directly to a single node in O(1). Cross-shard queries require a coordinator to scatter requests to all shards and gather/merge results in memory, which degrades latency. Rebalancing uses consistent hashing with virtual nodes to minimize data migration when scaling nodes.',
      };
    }
    return {
      keyConcepts: ['Algorithmic Complexity', 'Trade-off Analysis', 'Edge Case Handling', 'Concurrency Safety'],
      explanation: 'Focus on clear communication: state your assumptions explicitly, analyze worst-case time & space complexity, discuss scalability boundaries, and identify single points of failure (SPOFs) before finalizing the design.',
    };
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Algorithmic Mentor • Company-Targeted Interview Rigor</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Technical Interview Battleground
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          High-yield Data Structures &amp; Algorithms patterns paired with deep theoretical CS and system architecture questions custom-tailored to this role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Data Structures & Algorithms Focus */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">DSA Algorithmic Patterns</h3>
                  <p className="text-xs text-slate-400">Target problem archetypes for this domain</p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/40">
                {Object.values(solvedDsa).filter(Boolean).length}/{data_structures_and_algorithms_focus.length} Mastered
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {data_structures_and_algorithms_focus.map((topic, idx) => {
                const isMastered = !!solvedDsa[idx];
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isMastered
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        <button
                          type="button"
                          onClick={() => toggleSolved(idx)}
                          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isMastered
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'border-slate-700 hover:border-slate-500 bg-slate-900 text-transparent'
                          }`}
                          aria-label={`Mark pattern #${idx + 1} mastered`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <span className="text-xs font-bold text-cyan-400 block mb-0.5">Pattern #{idx + 1}</span>
                          <p className="text-sm font-medium text-slate-200">{topic}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Tip: Practice template implementations without looking at solutions first.</span>
            <span className="text-cyan-400 font-mono">O(N) Target Time</span>
          </div>
        </div>

        {/* Right Column: Core CS & System Design Questions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Core CS &amp; System Design Questions</h3>
                  <p className="text-xs text-slate-400">Architectural concepts tested in technical rounds</p>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-800/40">
                {core_cs_and_system_design_questions.length} Concepts
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {core_cs_and_system_design_questions.map((question, idx) => {
                const isExpanded = expandedQuestion === idx;
                const analysis = getSystemDesignExplanation(question);

                return (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      className="w-full text-left p-3.5 flex items-start justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                      aria-expanded={isExpanded}
                      aria-label={`Question ${idx + 1}`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 flex-shrink-0 mt-0.5">
                          Q{idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-200 leading-snug">{question}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400 font-semibold flex items-center space-x-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>Key Concepts:</span>
                          </span>
                          {analysis.keyConcepts.map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                          <span className="font-semibold text-indigo-300 block mb-1">Interview Model Answer:</span>
                          {analysis.explanation}
                        </div>
                      </div>
                    )}
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
