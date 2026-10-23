import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'Student' | 'Recruiter';
  degree_or_company: string;
  skills: string;
  projects: string;
}

interface Internship {
  id: number;
  role_title: string;
  company_name: string;
  location: string;
  stipend: string;
  required_skills: string;
  preferred_skills?: string;
}

interface Application {
  id: number;
  internship_id: number;
  role_title: string;
  company_name: string;
  student_name: string;
  match_score: number;
  status: 'Pending' | 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected';
  applied_at: string;
}

interface SkillGap {
  skill: string;
  priority: 'High' | 'Medium';
  mini_project: string;
}

interface AnalysisResult {
  match_percentage: number;
  fit_status: 'Strong Fit' | 'Moderate Fit' | 'Needs Upskilling';
  executive_summary: string;
  matched_skills: string[];
  skill_gaps: SkillGap[];
  ats_star_bullets: string[];
  interview_topics: string[];
}

interface EvaluationRecord {
  id: number;
  student_name: string;
  role_title: string;
  company_name: string;
  match_score: number;
  fit_status: string;
  result_json: AnalysisResult;
  created_at: string;
}

export function App() {
  // Session & User State
  const [user, setUser] = useState<User | null>(null);
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [loginEmail, setLoginEmail] = useState('student@demo.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState<'Student' | 'Recruiter'>('Student');

  // Registration Form State
  const [regFullName, setRegFullName] = useState('Alex Rivera');
  const [regEmail, setRegEmail] = useState('alex@university.edu');
  const [regPassword, setRegPassword] = useState('password123');
  const [regRole, setRegRole] = useState<'Student' | 'Recruiter'>('Student');
  const [regDegree, setRegDegree] = useState('B.S. Software Engineering (2026)');
  const [regSkills, setRegSkills] = useState('Java, Spring Boot, MySQL, REST APIs, Git');

  // Navigation View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'matcher' | 'applications' | 'history'>('dashboard');

  // Data Collections
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [history, setHistory] = useState<EvaluationRecord[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());

  // Matcher State
  const [matcherStudentName, setMatcherStudentName] = useState('Priya Sharma');
  const [matcherDegree, setMatcherDegree] = useState('B.Tech Computer Science & Engineering (2026)');
  const [matcherSkills, setMatcherSkills] = useState<string[]>([
    'Java',
    'Spring Boot',
    'MySQL',
    'REST APIs',
    'Git',
    'Microservices',
  ]);
  const [matcherSkillInput, setMatcherSkillInput] = useState('');
  const [matcherProjects, setMatcherProjects] = useState(
    'Developed a distributed banking ledger in Java & Spring Boot with PostgreSQL. Implemented JWT authentication and RESTful endpoints.'
  );
  const [matcherRoleTitle, setMatcherRoleTitle] = useState('Backend Engineering Intern');
  const [matcherCompany, setMatcherCompany] = useState('Stripe');
  const [matcherRequirements, setMatcherRequirements] = useState(
    'Java, Spring Boot, MySQL, REST APIs, Microservices, Distributed Systems, Git'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJobRole, setNewJobRole] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobStipend, setNewJobStipend] = useState('');
  const [newJobRequiredSkills, setNewJobRequiredSkills] = useState('');
  const [newJobPreferredSkills, setNewJobPreferredSkills] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDegree, setProfileDegree] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileProjects, setProfileProjects] = useState('');

  // Filters & Search
  const [internshipFilter, setInternshipFilter] = useState('');
  const [applicantFilter, setApplicantFilter] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>('All');
  const [historyFilter, setHistoryFilter] = useState('');

  // Initial Load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/portal?action=session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          initUserSession(data);
          return;
        }
      }
    } catch (e) {}

    const local = localStorage.getItem('portal_session');
    if (local) {
      try {
        initUserSession(JSON.parse(local));
      } catch (e) {}
    }
  };

  const initUserSession = (u: User) => {
    setUser(u);
    setInternshipFilter('');
    setApplicantFilter('');
    setMatcherStudentName(u.full_name);
    setMatcherDegree(u.degree_or_company);
    setMatcherProjects(u.projects || '');
    if (u.skills) {
      setMatcherSkills(u.skills.split(',').map((s) => s.trim()).filter(Boolean));
    }
    loadData();
  };

  const loadData = async () => {
    try {
      const [resI, resA, resH] = await Promise.all([
        fetch('/api/portal?action=internships'),
        fetch('/api/portal?action=applications'),
        fetch('/api/portal?action=history'),
      ]);

      if (resI.ok) {
        const data = await resI.json();
        if (Array.isArray(data)) setInternships(data);
      }
      if (resA.ok) {
        const data = await resA.json();
        if (Array.isArray(data)) {
          setApplications(data);
          setAppliedIds(new Set(data.map((a: Application) => a.internship_id)));
        }
      }
      if (resH.ok) {
        const data = await resH.json();
        if (Array.isArray(data)) setHistory(data);
      }
    } catch (e) {}
  };

  // Auth Actions
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portal?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole }),
      });
      if (res.ok) {
        const u = await res.json();
        localStorage.setItem('portal_session', JSON.stringify(u));
        initUserSession(u);
        return;
      }
    } catch (err) {}

    // Fallback
    const fallbackUser: User = {
      id: loginRole === 'Recruiter' ? 2 : 1,
      full_name: loginRole === 'Recruiter' ? 'Sarah Jenkins' : 'Priya Sharma',
      email: loginEmail,
      role: loginRole,
      degree_or_company: loginRole === 'Recruiter' ? 'Stripe University Talent Acquisition' : 'B.Tech CSE (2026)',
      skills: loginRole === 'Recruiter' ? 'Technical Recruiting' : 'Java, Spring Boot, MySQL, REST APIs, Git',
      projects: 'Active engineering projects.',
    };
    localStorage.setItem('portal_session', JSON.stringify(fallbackUser));
    initUserSession(fallbackUser);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now(),
      full_name: regFullName,
      email: regEmail,
      role: regRole,
      degree_or_company: regDegree,
      skills: regSkills,
      projects: 'Active coursework and university software projects.',
    };

    try {
      await fetch('/api/portal?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    } catch (err) {}

    localStorage.setItem('portal_session', JSON.stringify(newUser));
    initUserSession(newUser);
  };

  const handleDemoLogin = (role: 'Student' | 'Recruiter') => {
    const demoUser: User = {
      id: role === 'Recruiter' ? 2 : 1,
      full_name: role === 'Recruiter' ? 'Sarah Jenkins' : 'Priya Sharma',
      email: role === 'Recruiter' ? 'recruiter@demo.com' : 'student@demo.com',
      role,
      degree_or_company: role === 'Recruiter' ? 'Stripe Talent Acquisition' : 'B.Tech Computer Science (2026)',
      skills: role === 'Recruiter' ? 'Recruiting, Sourcing' : 'Java, Spring Boot, MySQL, REST APIs, Git, Microservices',
      projects:
        role === 'Recruiter'
          ? 'Oversees university intern hiring.'
          : 'Developed a distributed banking ledger in Java & Spring Boot with PostgreSQL.',
    };
    localStorage.setItem('portal_session', JSON.stringify(demoUser));
    initUserSession(demoUser);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/portal?action=logout', { method: 'POST' });
    } catch (err) {}
    setUser(null);
    localStorage.removeItem('portal_session');
  };

  // Job Actions
  const handleApply = async (job: Internship) => {
    if (appliedIds.has(job.id)) return;

    const newApp: Application = {
      id: Date.now(),
      internship_id: job.id,
      role_title: job.role_title,
      company_name: job.company_name,
      student_name: user?.full_name || 'Priya Sharma',
      match_score: currentResult?.match_percentage || 85,
      status: 'Pending',
      applied_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/portal?action=apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (res.ok) {
        const saved = await res.json();
        newApp.id = saved.id || newApp.id;
      }
    } catch (err) {}

    setApplications([newApp, ...applications]);
    setAppliedIds(new Set([...appliedIds, job.id]));
  };

  const handleDeleteInternship = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to remove this internship posting from the board?')) {
      return;
    }
    try {
      await fetch(`/api/portal?action=deleteInternship&id=${jobId}&type=internship`, {
        method: 'DELETE',
      });
    } catch (err) {}
    setInternships((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handleCheckFit = (job: Internship) => {
    setMatcherRoleTitle(job.role_title);
    setMatcherCompany(job.company_name);
    setMatcherRequirements(job.required_skills);
    setCurrentView('matcher');
  };

  const handlePostInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Internship = {
      id: Date.now(),
      role_title: newJobRole,
      company_name: newJobCompany,
      location: newJobLocation || 'Remote',
      stipend: newJobStipend || 'Competitive',
      required_skills: newJobRequiredSkills,
      preferred_skills: newJobPreferredSkills,
    };

    try {
      const res = await fetch('/api/portal?action=addInternship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      if (res.ok) {
        const saved = await res.json();
        newJob.id = saved.id || newJob.id;
      }
    } catch (err) {}

    setInternships([newJob, ...internships]);
    setShowPostModal(false);
    setNewJobRole('');
    setNewJobCompany('');
    setNewJobLocation('');
    setNewJobStipend('');
    setNewJobRequiredSkills('');
    setNewJobPreferredSkills('');
  };

  // Matcher Tags
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = matcherSkillInput.replace(/,/g, '').trim();
      if (val && !matcherSkills.some((s) => s.toLowerCase() === val.toLowerCase())) {
        setMatcherSkills([...matcherSkills, val]);
      }
      setMatcherSkillInput('');
    } else if (e.key === 'Backspace' && matcherSkillInput === '' && matcherSkills.length > 0) {
      setMatcherSkills(matcherSkills.slice(0, -1));
    }
  };

  const removeMatcherSkill = (idx: number) => {
    setMatcherSkills(matcherSkills.filter((_, i) => i !== idx));
  };

  // Run AI Assessment
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const payload = {
      student_name: matcherStudentName,
      degree: matcherDegree,
      skills: matcherSkills.join(', '),
      projects: matcherProjects,
      role_title: matcherRoleTitle,
      company_name: matcherCompany,
      requirements: matcherRequirements,
    };

    let result: AnalysisResult | null = null;

    try {
      const res = await fetch('/api/portal?action=analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        result = data.result || data;
      }
    } catch (err) {}

    if (!result) {
      // Local calculation
      const stu = payload.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const req = payload.requirements.split(/[,;\n]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
      const matched: string[] = [];
      const missing: string[] = [];

      req.forEach((r) => {
        const found = stu.some((s) => s.includes(r) || r.includes(s));
        if (found) matched.push(r.charAt(0).toUpperCase() + r.slice(1));
        else missing.push(r.charAt(0).toUpperCase() + r.slice(1));
      });

      const score = req.length === 0 ? 82 : Math.round((matched.length / req.length) * 100);
      const fit_status: AnalysisResult['fit_status'] =
        score >= 75 ? 'Strong Fit' : score >= 50 ? 'Moderate Fit' : 'Needs Upskilling';

      result = {
        match_percentage: score,
        fit_status,
        executive_summary: `${payload.student_name} demonstrates ${
          score >= 75 ? 'exceptional' : 'solid foundational'
        } engineering readiness for ${payload.role_title} at ${payload.company_name}, verified across foundational CS competencies with clear project-driven remediation targets.`,
        matched_skills: matched.length > 0 ? matched : ['Foundational Problem Solving', 'Core Software Design'],
        skill_gaps: missing.map((m, idx) => ({
          skill: m,
          priority: idx === 0 ? 'High' : 'Medium',
          mini_project: `Build a production-style service integrating ${m} with automated testing and Docker containerization.`,
        })),
        ats_star_bullets: [
          `Engineered scalable ${payload.role_title} service modules with robust error handling, reducing latency by 35%.`,
          `Designed database schemas and optimized indexing strategies to support concurrent data throughput.`,
          `Built automated end-to-end unit tests and continuous deployment scripts complying with industry standards.`,
        ],
        interview_topics: [
          'Concurrency & Multi-Threading: Thread safety, race condition prevention, and concurrent maps',
          'Database Optimization: B-Tree Index mechanics, transaction isolation levels, and EXPLAIN plans',
          'Algorithmic Patterns: Sliding Window, Monotonic Stack, and Dynamic Programming',
          'Distributed Architecture: Stateless REST endpoints, caching layers, and idempotent design',
        ],
      };
    }

    setCurrentResult(result);

    const record: EvaluationRecord = {
      id: Date.now(),
      student_name: payload.student_name,
      role_title: payload.role_title,
      company_name: payload.company_name,
      match_score: result.match_percentage,
      fit_status: result.fit_status,
      result_json: result,
      created_at: new Date().toISOString(),
    };
    setHistory([record, ...history]);

    setIsAnalyzing(false);
  };

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 1500);
  };

  const handleUpdateStatus = async (appId: number, newStatus: Application['status']) => {
    try {
      await fetch('/api/portal?action=updateApplicationStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
    } catch (err) {}

    setApplications(applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await fetch(`/api/portal?id=${id}`, { method: 'DELETE' });
    } catch (err) {}
    setHistory(history.filter((h) => h.id !== id));
  };

  const handleOpenEditProfile = () => {
    if (!user) return;
    setProfileName(user.full_name);
    setProfileDegree(user.degree_or_company);
    setProfileSkills(user.skills);
    setProfileProjects(user.projects);
    setShowProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: User = {
      ...user,
      full_name: profileName,
      degree_or_company: profileDegree,
      skills: profileSkills,
      projects: profileProjects,
    };
    setUser(updated);
    setMatcherStudentName(profileName);
    setMatcherDegree(profileDegree);
    setMatcherProjects(profileProjects);
    if (profileSkills) {
      setMatcherSkills(profileSkills.split(',').map((s) => s.trim()).filter(Boolean));
    }
    localStorage.setItem('portal_session', JSON.stringify(updated));
    setShowProfileModal(false);
  };

  const filteredInternships = internships.filter((job) => {
    if (!internshipFilter.trim()) return true;
    const q = internshipFilter.toLowerCase().trim();
    return (
      (job.role_title || '').toLowerCase().includes(q) ||
      (job.company_name || '').toLowerCase().includes(q) ||
      (job.required_skills || '').toLowerCase().includes(q) ||
      (job.preferred_skills || '').toLowerCase().includes(q) ||
      (job.location || '').toLowerCase().includes(q)
    );
  });

  const filteredApplications = applications.filter((app) => {
    const q = applicantFilter.toLowerCase().trim();
    const matchesText =
      !q ||
      (app.student_name || '').toLowerCase().includes(q) ||
      (app.role_title || '').toLowerCase().includes(q) ||
      (app.company_name || '').toLowerCase().includes(q);
    const matchesStatus =
      applicantStatusFilter === 'All' ||
      (applicantStatusFilter === 'Pending' && (app.status === 'Pending' || app.status === 'Applied')) ||
      app.status === applicantStatusFilter;
    return matchesText && matchesStatus;
  });

  const filteredHistory = history.filter((h) => {
    const q = historyFilter.toLowerCase().trim();
    return (
      (h.student_name || '').toLowerCase().includes(q) ||
      (h.role_title || '').toLowerCase().includes(q) ||
      (h.company_name || '').toLowerCase().includes(q)
    );
  });

  const avgMatchScore =
    history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.match_score, 0) / history.length) : 82;

  // Render Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 font-sans antialiased">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">CareerIntel Portal</h1>
            <p className="text-xs text-slate-500">Intelligent Internship Matching &amp; Algorithmic Career Preparation</p>
          </div>

          {/* Quick Demo Access */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">Fast-Track Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('Student')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Recruiter')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer"
              >
                Recruiter Demo
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-wider">or continue with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthTab('signin')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authTab === 'signin' ? 'text-slate-900 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authTab === 'register' ? 'text-slate-900 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {authTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portal Role</label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="Student">Student (Candidate)</option>
                  <option value="Recruiter">Recruiter (Talent Partner)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sign In to Portal
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Student">Student (Candidate)</option>
                  <option value="Recruiter">Recruiter (Hiring Manager)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree or Organization</label>
                <input
                  type="text"
                  value={regDegree}
                  onChange={(e) => setRegDegree(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills</label>
                <input
                  type="text"
                  value={regSkills}
                  onChange={(e) => setRegSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Register &amp; Launch
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Logged-in Main App
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const matchPct = currentResult?.match_percentage || 0;
  const strokeDashoffset = circumference - (matchPct / 100) * circumference;

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen font-sans antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-[#0F172A]">CareerIntel Portal</span>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'dashboard' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard &amp; Internships
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('matcher')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'matcher' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {user.role === 'Recruiter' ? 'AI Candidate Screener' : 'AI Career Matcher'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('applications')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'applications' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{user.role === 'Recruiter' ? 'Candidate Applications' : 'My Applications'}</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {applications.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'history' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MySQL Evaluation History
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#0F172A] leading-tight">{user.full_name}</p>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    user.role === 'Recruiter'
                      ? 'text-violet-700 bg-violet-50 border-violet-200'
                      : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenEditProfile}
              title="Edit Profile"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* ================= VIEW 1: DASHBOARD & INTERNSHIPS ================= */}
        {currentView === 'dashboard' && (
          <section className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-1">
                <p className="text-xs font-medium text-slate-500">Active Internships</p>
                <p className="text-2xl font-extrabold text-[#0F172A]">{internships.length}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Verified Opportunities</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-1">
                <p className="text-xs font-medium text-slate-500">Applications Submitted</p>
                <p className="text-2xl font-extrabold text-[#0F172A]">{applications.length}</p>
                <p className="text-[11px] text-indigo-600 font-medium">1-Click Fast Submissions</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-1">
                <p className="text-xs font-medium text-slate-500">Evaluations Run</p>
                <p className="text-2xl font-extrabold text-[#0F172A]">{history.length}</p>
                <p className="text-[11px] text-violet-600 font-medium">AI Career Intelligence</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-1">
                <p className="text-xs font-medium text-slate-500">Average Match Score</p>
                <p className="text-2xl font-extrabold text-[#0F172A]">{avgMatchScore}%</p>
                <p className="text-[11px] text-emerald-600 font-medium">Readiness Index</p>
              </div>
            </div>

            {/* Header: RBAC for Post button vs Student Search/Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Curated Technical Internships</h2>
                <p className="text-xs text-slate-500">
                  {user.role === 'Recruiter'
                    ? 'Publish new technical openings and manage candidate recruitment pipelines.'
                    : 'Real-time postings with required stacks and automated compatibility screening.'}
                </p>
              </div>

              {/* RBAC: Recruiter gets "+ Post Internship" (single '+' icon). Student gets Search/Filter input */}
              {user.role === 'Recruiter' ? (
                <button
                  type="button"
                  onClick={() => setShowPostModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post Internship</span>
                </button>
              ) : (
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={internshipFilter}
                    onChange={(e) => setInternshipFilter(e.target.value)}
                    placeholder="Filter by role, company, or skill (e.g. Java, React)..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  {internshipFilter && (
                    <button
                      type="button"
                      onClick={() => setInternshipFilter('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="text-sm font-bold">&times;</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3-Column Grid */}
            {filteredInternships.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">No internships found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No open roles match &quot;{internshipFilter}&quot;. Try clearing your search keyword or searching for another skill.
                </p>
                <button
                  type="button"
                  onClick={() => setInternshipFilter('')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInternships.map((job) => {
                  const isApplied = appliedIds.has(job.id);
                  const skillsArr = (job.required_skills || '').split(',').map((s) => s.trim()).filter(Boolean);
                  const compInitials = job.company_name.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {compInitials}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-[#0F172A] leading-tight">{job.role_title}</h3>
                              <p className="text-xs font-semibold text-indigo-600">{job.company_name}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                            {job.stipend || 'Competitive'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{job.location || 'Remote'}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skillsArr.map((s, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* RBAC for Card Actions */}
                      {user.role === 'Recruiter' ? (
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setApplicantFilter(job.role_title);
                              setCurrentView('applications');
                            }}
                            className="w-full py-2 px-3 text-xs font-bold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>
                              View Applicants (
                              {
                                applications.filter(
                                  (a) =>
                                    a.internship_id === job.id ||
                                    (a.role_title.toLowerCase() === job.role_title.toLowerCase() &&
                                      a.company_name.toLowerCase() === job.company_name.toLowerCase())
                                ).length
                              }
                              )
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInternship(job.id)}
                            className="w-full py-2 px-3 text-xs font-bold rounded-xl text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 hover:border-rose-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete Posting</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleCheckFit(job)}
                            className="w-full py-2 px-3 text-xs font-bold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                          >
                            Check AI Fit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApply(job)}
                            disabled={isApplied}
                            className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                              isApplied
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xs cursor-pointer'
                            }`}
                          >
                            {isApplied ? 'Applied ✓' : 'Apply Now'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ================= VIEW 2: AI CAREER MATCHER ================= */}
        {currentView === 'matcher' && (
          <section className="space-y-8">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">AI Career Fit &amp; Gap Remediation Engine</h2>
              <p className="text-xs text-slate-500">
                Compare verified candidate technical abilities against rigorous production internship requirements.
              </p>
            </div>

            {/* 2-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Student Profile */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Student Profile Inputs</h3>
                  <span className="text-[11px] font-medium text-indigo-600">Auto-filled from Profile</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={matcherStudentName}
                    onChange={(e) => setMatcherStudentName(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree &amp; Graduation Year</label>
                  <input
                    type="text"
                    value={matcherDegree}
                    onChange={(e) => setMatcherDegree(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Interactive Skill Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interactive Technical Skills</label>
                  <div className="flex flex-wrap gap-1.5 items-center p-2.5 border border-[#E2E8F0] rounded-xl bg-white min-h-[46px] focus-within:ring-2 focus-within:ring-indigo-500">
                    {matcherSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeMatcherSkill(idx)}
                          className="text-indigo-400 hover:text-indigo-800 font-bold leading-none cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={matcherSkillInput}
                      onChange={(e) => setMatcherSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type a skill &amp; press Enter..."
                      className="text-xs outline-none flex-grow bg-transparent px-1 min-w-[160px]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Press Enter or comma to add a skill tag. Click cross to remove.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hands-on Projects &amp; Implementation Experience</label>
                  <textarea
                    rows={4}
                    value={matcherProjects}
                    onChange={(e) => setMatcherProjects(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column: Target Internship */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Target Role &amp; Requirements</h3>
                  <select
                    onChange={(e) => {
                      const idx = parseInt(e.target.value, 10);
                      if (!isNaN(idx) && internships[idx]) {
                        setMatcherRoleTitle(internships[idx].role_title);
                        setMatcherCompany(internships[idx].company_name);
                        setMatcherRequirements(internships[idx].required_skills);
                      }
                    }}
                    className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
                  >
                    <option value="">-- Load from Postings --</option>
                    {internships.map((job, idx) => (
                      <option key={job.id} value={idx}>
                        {job.role_title} ({job.company_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title</label>
                  <input
                    type="text"
                    value={matcherRoleTitle}
                    onChange={(e) => setMatcherRoleTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company Name</label>
                  <input
                    type="text"
                    value={matcherCompany}
                    onChange={(e) => setMatcherCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Technical Qualifications &amp; Stack</label>
                  <textarea
                    rows={7}
                    value={matcherRequirements}
                    onChange={(e) => setMatcherRequirements(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <span>{isAnalyzing ? 'Running Algorithmic Assessment...' : 'Analyze My Career Fit'}</span>
                    {isAnalyzing && (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {currentResult && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
                {/* Metric Banner & Radial Gauge */}
                <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#E2E8F0] pb-6">
                  {/* SVG Circular Progress */}
                  <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={
                          currentResult.fit_status === 'Strong Fit'
                            ? '#059669'
                            : currentResult.fit_status === 'Moderate Fit'
                            ? '#D97706'
                            : '#E11D48'
                        }
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold text-[#0F172A]">{currentResult.match_percentage}%</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Match</span>
                    </div>
                  </div>

                  {/* Verdict & Executive Summary */}
                  <div className="space-y-2 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          currentResult.fit_status === 'Strong Fit'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : currentResult.fit_status === 'Moderate Fit'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {currentResult.fit_status}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Targeting: {matcherRoleTitle} at {matcherCompany}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A]">Executive Recruiter Evaluation</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {currentResult.executive_summary}
                    </p>
                  </div>
                </div>

                {/* 3 Color-Coded Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Emerald Card: Strengths */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Verified Strengths</h4>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2">
                      {currentResult.matched_skills.map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Amber Card: Gaps & Mini-Projects */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Skill Gaps &amp; Mini-Projects</h4>
                    </div>
                    <div className="space-y-3">
                      {currentResult.skill_gaps.map((gap, idx) => (
                        <div key={idx} className="bg-white/80 border border-amber-200 rounded-xl p-3 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{gap.skill}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                gap.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {gap.priority} Priority
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{gap.mini_project}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indigo Card: ATS Bullets & Interview Prep */}
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h4 className="text-xs font-bold uppercase tracking-wider">ATS Resume Bullets &amp; Prep</h4>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">STAR Resume Bullets (Click to copy)</p>
                      <div className="space-y-2">
                        {currentResult.ats_star_bullets.map((bullet, idx) => (
                          <div
                            key={idx}
                            className="bg-white/80 border border-indigo-200 rounded-xl p-2.5 flex items-start justify-between gap-2 text-xs text-slate-700 leading-relaxed shadow-2xs"
                          >
                            <span>{bullet}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyBullet(bullet, idx)}
                              className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 text-[11px] font-bold px-2 py-1 bg-indigo-50 rounded-md cursor-pointer"
                            >
                              {copiedBulletIdx === idx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-indigo-200/60 space-y-1.5">
                      <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">Key Interview Topics</p>
                      <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                        {currentResult.interview_topics.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= VIEW 3: APPLICATIONS / MANAGE APPLICANTS ================= */}
        {currentView === 'applications' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                  {user.role === 'Recruiter' ? 'Candidate Applications' : 'My Applications'}
                </h2>
                <p className="text-xs text-slate-500">
                  {user.role === 'Recruiter'
                    ? 'Review candidate profiles, analyze compatibility scores, and update candidate hiring stages.'
                    : 'Track and monitor your direct applications and hiring status across target companies.'}
                </p>
              </div>

              {/* Recruiter Filter Controls */}
              {user.role === 'Recruiter' && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={applicantFilter}
                    onChange={(e) => setApplicantFilter(e.target.value)}
                    placeholder="Filter by candidate, role, company..."
                    className="text-xs border border-[#E2E8F0] rounded-xl px-3 py-1.5 w-full sm:w-56 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  <select
                    value={applicantStatusFilter}
                    onChange={(e) => setApplicantStatusFilter(e.target.value)}
                    className="text-xs border border-[#E2E8F0] rounded-xl px-3 py-1.5 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Internship &amp; Company</th>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Match Score</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          {user.role === 'Recruiter'
                            ? 'No candidate applications found matching your criteria.'
                            : 'No active applications yet. Browse the Internship Board and click "Apply Now".'}
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const isRecruiter = user.role === 'Recruiter';
                        const dateFormatted = new Date(app.applied_at).toLocaleDateString();

                        return (
                          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">{app.role_title}</p>
                              <p className="text-[11px] font-semibold text-indigo-600">{app.company_name}</p>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800">{app.student_name}</td>
                            <td className="py-3.5 px-4 font-bold text-indigo-600">{app.match_score}%</td>
                            <td className="py-3.5 px-4 text-slate-500">{dateFormatted}</td>
                            <td className="py-3.5 px-4">
                              {isRecruiter ? (
                                <select
                                  value={app.status === 'Applied' ? 'Pending' : app.status}
                                  onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                                  className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Selected">Selected</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    app.status === 'Selected'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : app.status === 'Shortlisted'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : app.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}
                                >
                                  {app.status === 'Applied' ? 'Pending' : app.status}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setMatcherRoleTitle(app.role_title);
                                  setMatcherCompany(app.company_name);
                                  setCurrentView('matcher');
                                }}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                              >
                                View Stacks
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================= VIEW 4: MYSQL HISTORY ================= */}
        {currentView === 'history' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">MySQL Evaluation History</h2>
                <p className="text-xs text-slate-500">
                  Persistent evaluation records stored in MySQL `evaluations` relational table.
                </p>
              </div>
              <input
                type="text"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                placeholder="Filter by Student or Role..."
                className="text-xs border border-[#E2E8F0] rounded-xl px-3.5 py-2 w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Target Role &amp; Company</th>
                      <th className="py-3 px-4">Compatibility</th>
                      <th className="py-3 px-4">Fit Verdict</th>
                      <th className="py-3 px-4">Analyzed At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          No evaluation reports found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.student_name}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{item.role_title}</span>{' '}
                            <span className="text-slate-400">at {item.company_name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-indigo-600">{item.match_score}%</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                item.fit_status === 'Strong Fit'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.fit_status === 'Moderate Fit'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {item.fit_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentResult(item.result_json);
                                setMatcherRoleTitle(item.role_title);
                                setMatcherCompany(item.company_name);
                                setCurrentView('matcher');
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              View Full Report
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistory(item.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Post Internship Modal - RBAC strictly restricted to Recruiter */}
      {showPostModal && user.role === 'Recruiter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Post New Technical Internship</h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handlePostInternship} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={newJobRole}
                    onChange={(e) => setNewJobRole(e.target.value)}
                    required
                    placeholder="Backend Engineering Intern"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    required
                    placeholder="Stripe"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    required
                    placeholder="San Francisco / Remote"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Stipend</label>
                  <input
                    type="text"
                    value={newJobStipend}
                    onChange={(e) => setNewJobStipend(e.target.value)}
                    required
                    placeholder="$52 / hr"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Technical Skills</label>
                <input
                  type="text"
                  value={newJobRequiredSkills}
                  onChange={(e) => setNewJobRequiredSkills(e.target.value)}
                  required
                  placeholder="Java, Spring Boot, MySQL, REST APIs, Git"
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Technical Skills</label>
                <input
                  type="text"
                  value={newJobPreferredSkills}
                  onChange={(e) => setNewJobPreferredSkills(e.target.value)}
                  placeholder="Kafka, Redis, Docker, AWS"
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Publish to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Edit Candidate Profile</h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree &amp; Year or Organization</label>
                <input
                  type="text"
                  value={profileDegree}
                  onChange={(e) => setProfileDegree(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={profileSkills}
                  onChange={(e) => setProfileSkills(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Projects &amp; Background</label>
                <textarea
                  rows={3}
                  value={profileProjects}
                  onChange={(e) => setProfileProjects(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
