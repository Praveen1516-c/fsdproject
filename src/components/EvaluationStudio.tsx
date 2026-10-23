import React, { useState } from 'react';
import { StudentProfile, InternshipPosting } from '../types/career';
import { SAMPLE_STUDENTS, SAMPLE_INTERNSHIPS } from '../data/sampleData';
import { Play, RotateCcw, User, Briefcase, Zap, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface EvaluationStudioProps {
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  job: InternshipPosting;
  setJob: React.Dispatch<React.SetStateAction<InternshipPosting>>;
  onRunEvaluation: () => Promise<void>;
  isLoading: boolean;
  loadingStep: string;
}

export const EvaluationStudio: React.FC<EvaluationStudioProps> = ({
  student,
  setStudent,
  job,
  setJob,
  onRunEvaluation,
  isLoading,
  loadingStep,
}) => {
  const [selectedStudentPreset, setSelectedStudentPreset] = useState<string>('student-priya');
  const [selectedJobPreset, setSelectedJobPreset] = useState<string>('job-stripe-backend');

  const handleStudentPresetChange = (id: string) => {
    setSelectedStudentPreset(id);
    const found = SAMPLE_STUDENTS.find((s) => s.id === id);
    if (found) {
      setStudent({ ...found });
    }
  };

  const handleJobPresetChange = (id: string) => {
    setSelectedJobPreset(id);
    const found = SAMPLE_INTERNSHIPS.find((j) => j.id === id);
    if (found) {
      setJob({ ...found });
    }
  };

  const handleClearStudent = () => {
    setSelectedStudentPreset('custom');
    setStudent({
      student_name: '',
      student_degree_and_year: '',
      core_languages: '',
      frameworks_and_tools: '',
      database_skills: '',
      student_projects_and_code_experience: '',
      career_aspirations: '',
    });
  };

  const handleClearJob = () => {
    setSelectedJobPreset('custom');
    setJob({
      job_title: '',
      company_name: '',
      industry_domain: '',
      required_qualifications: '',
      preferred_qualifications: '',
      job_responsibilities: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Central Intelligence Engine • Objective Algorithmic Scoring</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Candidate Evaluation &amp; Internship Fit Engine
          </h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">
            Eliminate subjective resume guesswork. Parse undergraduate technical capabilities against real-world
            hiring requirements to produce an objective 0–100 compatibility rating, verified project evidence,
            concrete systems-level remediation blueprints, and MySQL-ready payloads for your Java Tomcat backend.
          </p>
        </div>
      </div>

      {/* Main Grid: Student Profile vs Target Internship */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Student Profile */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">[STUDENT PROFILE]</h2>
                  <p className="text-xs text-slate-400">Candidate credentials &amp; implementation portfolio</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearStudent}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition-colors"
                aria-label="Clear student fields"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Presets Selector */}
            <div className="mt-4">
              <label htmlFor="student-preset-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Load Candidate Profile:
              </label>
              <select
                id="student-preset-select"
                value={selectedStudentPreset}
                onChange={(e) => handleStudentPresetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {SAMPLE_STUDENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.student_name} ({s.student_degree_and_year.split(',')[0]} - {s.career_aspirations.split('&')[0]})
                  </option>
                ))}
                <option value="custom">-- Custom Student (Enter manually) --</option>
              </select>
            </div>

            {/* Form Fields */}
            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Full Name <span className="text-slate-500 font-mono">{"{{student_name}}"}</span>
                </label>
                <input
                  type="text"
                  value={student.student_name}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, student_name: e.target.value });
                  }}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Degree &amp; Branch <span className="text-slate-500 font-mono">{"{{student_degree_and_year}}"}</span>
                </label>
                <input
                  type="text"
                  value={student.student_degree_and_year}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, student_degree_and_year: e.target.value });
                  }}
                  placeholder="e.g. B.Tech in Computer Science, 3rd Year"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Core Programming Languages <span className="text-slate-500 font-mono">{"{{core_languages}}"}</span>
                </label>
                <input
                  type="text"
                  value={student.core_languages}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, core_languages: e.target.value });
                  }}
                  placeholder="e.g. Java 17, Python, C++, SQL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Web &amp; Backend Frameworks <span className="text-slate-500 font-mono">{"{{frameworks_and_tools}}"}</span>
                </label>
                <input
                  type="text"
                  value={student.frameworks_and_tools}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, frameworks_and_tools: e.target.value });
                  }}
                  placeholder="e.g. Spring Boot 3, Hibernate, Docker, Git"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Databases <span className="text-slate-500 font-mono">{"{{database_skills}}"}</span>
                </label>
                <input
                  type="text"
                  value={student.database_skills}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, database_skills: e.target.value });
                  }}
                  placeholder="e.g. PostgreSQL, Redis, MySQL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Projects &amp; Real Implementations <span className="text-slate-500 font-mono">{"{{student_projects_and_code_experience}}"}</span>
                </label>
                <textarea
                  rows={4}
                  value={student.student_projects_and_code_experience}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, student_projects_and_code_experience: e.target.value });
                  }}
                  placeholder="Describe key projects, architectures, benchmarks, and concurrency or database implementations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target Career Domain <span className="text-slate-500 font-mono">{"{{career_aspirations}}"}</span>
                </label>
                <input
                  type="text"
                  value={student.career_aspirations}
                  onChange={(e) => {
                    setSelectedStudentPreset('custom');
                    setStudent({ ...student, career_aspirations: e.target.value });
                  }}
                  placeholder="e.g. Backend Distributed Systems Intern"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Target Internship */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">[TARGET INTERNSHIP POSTING]</h2>
                  <p className="text-xs text-slate-400">Industry qualifications, tech stack &amp; SLA demands</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearJob}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition-colors"
                aria-label="Clear job fields"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Presets Selector */}
            <div className="mt-4">
              <label htmlFor="job-preset-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Select Benchmark Internship:
              </label>
              <select
                id="job-preset-select"
                value={selectedJobPreset}
                onChange={(e) => handleJobPresetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SAMPLE_INTERNSHIPS.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company_name} - {j.job_title} ({j.industry_domain.split('/')[0]})
                  </option>
                ))}
                <option value="custom">-- Custom Posting (Enter manually) --</option>
              </select>
            </div>

            {/* Form Fields */}
            <div className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Role Title <span className="text-slate-500 font-mono">{"{{job_title}}"}</span>
                  </label>
                  <input
                    type="text"
                    value={job.job_title}
                    onChange={(e) => {
                      setSelectedJobPreset('custom');
                      setJob({ ...job, job_title: e.target.value });
                    }}
                    placeholder="e.g. Backend SWE Intern"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company &amp; Location</label>
                  <input
                    type="text"
                    value={job.company_name}
                    onChange={(e) => {
                      setSelectedJobPreset('custom');
                      setJob({ ...job, company_name: e.target.value });
                    }}
                    placeholder="e.g. Stripe (San Francisco, CA)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Industry Domain <span className="text-slate-500 font-mono">{"{{industry_domain}}"}</span>
                </label>
                <input
                  type="text"
                  value={job.industry_domain}
                  onChange={(e) => {
                    setSelectedJobPreset('custom');
                    setJob({ ...job, industry_domain: e.target.value });
                  }}
                  placeholder="e.g. FinTech / Distributed Payments"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Required Core Skills <span className="text-slate-500 font-mono">{"{{required_qualifications}}"}</span>
                </label>
                <textarea
                  rows={3}
                  value={job.required_qualifications}
                  onChange={(e) => {
                    setSelectedJobPreset('custom');
                    setJob({ ...job, required_qualifications: e.target.value });
                  }}
                  placeholder="Languages, algorithms, OOP, database design..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Preferred / Bonus Skills <span className="text-slate-500 font-mono">{"{{preferred_qualifications}}"}</span>
                </label>
                <textarea
                  rows={2}
                  value={job.preferred_qualifications}
                  onChange={(e) => {
                    setSelectedJobPreset('custom');
                    setJob({ ...job, preferred_qualifications: e.target.value });
                  }}
                  placeholder="Distributed caching, Kafka, Docker, Kubernetes, idempotency..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Daily Responsibilities <span className="text-slate-500 font-mono">{"{{job_responsibilities}}"}</span>
                </label>
                <textarea
                  rows={3}
                  value={job.job_responsibilities}
                  onChange={(e) => {
                    setSelectedJobPreset('custom');
                    setJob({ ...job, job_responsibilities: e.target.value });
                  }}
                  placeholder="What code and microservices will the intern build and deploy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Center: Run Evaluation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 text-slate-300">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ready for Algorithmic &amp; Gemini Fit Intelligence</h3>
            <p className="text-xs text-slate-400">
              Evaluates code evidence, computes 0–100 match, prescribes concrete gap projects, and generates strict JSON for MySQL persistence.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunEvaluation}
          disabled={isLoading || !student.student_name || !job.job_title}
          className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2.5 shadow-lg transition-all ${
            isLoading || !student.student_name || !job.job_title
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-indigo-500/25 cursor-pointer transform hover:-translate-y-0.5'
          }`}
          aria-label="Run Career Fit Intelligence Engine"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{loadingStep || 'Executing Intelligence Engine...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Career Fit Intelligence</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
