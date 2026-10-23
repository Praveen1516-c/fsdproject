import React from 'react';
import { Sparkles, Terminal, Database, Award, BookOpen, Layers, Briefcase } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  evaluationCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, evaluationCount }) => {
  const tabs = [
    { id: 'studio', label: 'Evaluation Studio', icon: Terminal },
    { id: 'scorecard', label: 'Executive Scorecard', icon: Award },
    { id: 'remediation', label: 'Skill Remediation', icon: Layers },
    { id: 'interview', label: 'Interview Battleground', icon: BookOpen },
    { id: 'ats', label: 'ATS & Resume Booster', icon: Sparkles },
    { id: 'database', label: 'Tomcat & MySQL Sync', icon: Database },
    { id: 'directory', label: 'Role Comparison', icon: Briefcase },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">CareerIntelligence</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.5 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Undergraduate Internship &amp; Hiring Alignment Portal</p>
            </div>
          </div>

          {/* Quick status badges */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Central Engine: <strong className="text-emerald-400 font-medium">Active</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tomcat/MySQL: <strong className="text-indigo-400 font-medium">Ready</strong></span>
            </div>
            {evaluationCount > 0 && (
              <div className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 font-mono">
                Evaluations: {evaluationCount}
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none" aria-label="Portal Navigation Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Switch to ${tab.label}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
