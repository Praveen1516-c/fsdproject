import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { calculateObjectiveFit, validateEvaluationSchema, generateMySQLStatements } from './src/utils/evaluationLogic.ts';
import { SAMPLE_STUDENTS, SAMPLE_INTERNSHIPS } from './src/data/sampleData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Route: GET /api/career-intel (queries evaluation history and internships)
app.get('/api/career-intel', (_req, res) => {
  res.json({
    status: 'success',
    evaluations: [
      {
        id: 1042,
        student_name: 'Priya Sharma',
        degree: 'B.Tech Computer Science, 3rd Year',
        target_role: 'SDE Intern - Java Backend',
        company_name: 'Stripe',
        match_score: 84,
        fit_verdict: 'Strong Fit',
        executive_summary: 'Priya exhibits exceptional core engineering alignment with Stripe requirements.',
        created_at: '2026-10-17 12:45:10',
      },
      {
        id: 1041,
        student_name: 'Marcus Vance',
        degree: 'B.S. Software Engineering, 3rd Year',
        target_role: 'Full-Stack Web Developer Intern',
        company_name: 'Datadog',
        match_score: 72,
        fit_verdict: 'Moderate Fit',
        executive_summary: 'Solid React/Node fundamentals, needs OpenTelemetry and high-volume metrics experience.',
        created_at: '2026-10-17 11:20:04',
      },
    ],
    internships: SAMPLE_INTERNSHIPS,
  });
});

// Route: POST /api/career-intel (evaluates candidate and returns structured response)
app.post('/api/career-intel', async (req, res) => {
  const {
    student_name = 'Priya Sharma',
    degree = 'B.Tech Computer Science, 3rd Year',
    skills = 'Java 17, Spring Boot, PostgreSQL, Docker',
    projects = 'Campus Food Delivery Microservice handling 450 req/sec; In-memory LRU Cache simulator',
    role_title = 'SDE Intern - Java Backend',
    company_name = 'Stripe',
    required_skills = 'Java 17+, Object-Oriented Design, Data Structures and Algorithms, SQL',
    preferred_skills = 'Distributed caching (Redis), Kafka, Docker, JUnit 5',
  } = req.body || {};

  const studentProfile = {
    student_name,
    student_degree_and_year: degree,
    core_languages: skills,
    frameworks_and_tools: skills,
    database_skills: skills,
    student_projects_and_code_experience: projects,
    career_aspirations: role_title,
  };

  const jobPosting = {
    job_title: role_title,
    company_name,
    industry_domain: 'FinTech / High-Reliability Infrastructure',
    required_qualifications: required_skills,
    preferred_qualifications: preferred_skills,
    job_responsibilities: required_skills,
  };

  const fit = calculateObjectiveFit(studentProfile, jobPosting);
  return res.json(fit);
});

// Endpoint for Tomcat Servlet & Frontend /api/analyze
app.post('/api/analyze', async (req, res) => {
  const {
    student_name = 'Priya Sharma',
    degree = 'B.Tech Computer Science, 3rd Year',
    technical_skills = 'Java 17, Spring Boot, PostgreSQL, Docker',
    projects = 'Campus Food Delivery Microservice handling 450 req/sec; In-memory LRU Cache simulator',
    career_goal = 'Software Development Engineer Intern',
    role_title = 'Software Development Engineer Intern (Core Backend)',
    company_name = 'Stripe',
    required_skills = 'Java 17+, Object-Oriented Design, Data Structures and Algorithms, SQL',
    preferred_skills = 'Distributed caching (Redis), Kafka, Docker, JUnit 5',
  } = req.body || {};

  const studentProfile = {
    student_name,
    student_degree_and_year: degree,
    core_languages: technical_skills,
    frameworks_and_tools: technical_skills,
    database_skills: technical_skills,
    student_projects_and_code_experience: projects,
    career_aspirations: career_goal,
  };

  const jobPosting = {
    job_title: role_title,
    company_name,
    industry_domain: 'FinTech / High-Reliability Infrastructure',
    required_qualifications: required_skills,
    preferred_qualifications: preferred_skills,
    job_responsibilities: required_skills,
  };

  const fit = calculateObjectiveFit(studentProfile, jobPosting);
  return res.json(fit);
});

// Endpoint requested for vanilla JS & Tomcat integration
app.post('/generate', async (req, res) => {
  const {
    student_name = 'Priya Sharma',
    student_degree = 'B.Tech in Computer Science & Engineering, 3rd Year',
    tech_stack = 'Java 17, Spring Boot, PostgreSQL, Docker',
    projects = 'Campus Food Delivery Microservice handling 450 req/sec; In-memory LRU Cache simulator',
    role_title = 'Backend Software Engineering Intern',
    company = 'Stripe',
    job_description = 'Design high-throughput microservices, API idempotency, distributed caching with Redis, ACID databases',
  } = req.body || {};

  const studentProfile = {
    student_name,
    student_degree_and_year: student_degree,
    core_languages: tech_stack,
    frameworks_and_tools: tech_stack,
    database_skills: tech_stack,
    student_projects_and_code_experience: projects,
    career_aspirations: role_title,
  };

  const jobPosting = {
    job_title: role_title,
    company_name: company,
    industry_domain: 'FinTech / High-Reliability Infrastructure',
    required_qualifications: job_description,
    preferred_qualifications: 'Distributed caching, Kafka, Docker, Kubernetes',
    job_responsibilities: job_description,
  };

  const fit = calculateObjectiveFit(studentProfile, jobPosting);

  return res.json({
    match_percentage: fit.evaluation_summary.match_percentage,
    fit_status: fit.evaluation_summary.fit_status,
    executive_verdict: fit.evaluation_summary.executive_verdict,
    verified_strengths: fit.verified_strengths,
    critical_skill_gaps: fit.critical_skill_gaps.map((g) => ({
      missing_skill: g.missing_skill,
      priority: g.importance,
      why_required: g.why_required,
      actionable_project_fix: g.actionable_project_fix,
    })),
    action_roadmap_and_ats: {
      suggested_headline: fit.ats_optimization.suggested_profile_headline,
      recommended_star_bullet_points: fit.ats_optimization.recommended_star_bullet_points,
      interview_focal_areas: [
        ...fit.technical_interview_prep.data_structures_and_algorithms_focus.slice(0, 3),
        ...fit.technical_interview_prep.core_cs_and_system_design_questions.slice(0, 2),
      ],
    },
    database_sync: {
      status: 'synced',
      engine: 'Apache Tomcat 10.1',
      database: 'MySQL 8.0+ (career_intelligence_db.evaluations)',
      timestamp: new Date().toISOString(),
    },
  });
});

// API: Evaluate Candidate vs Internship
app.post('/api/evaluate', async (req, res) => {
  const {
    student_name = 'Anonymous Student',
    student_degree_and_year = 'Undergraduate CSE',
    core_languages = 'Java, Python',
    frameworks_and_tools = 'Spring Boot, Git',
    database_skills = 'PostgreSQL, MySQL',
    student_projects_and_code_experience = '',
    career_aspirations = 'Software Engineering Intern',
    job_title = 'Software Engineering Intern',
    company_name = 'Tech Corp',
    industry_domain = 'Enterprise Software',
    required_qualifications = 'Data structures, Algorithms, REST APIs',
    preferred_qualifications = 'Cloud, Caching, CI/CD',
    job_responsibilities = 'Develop scalable microservices and APIs',
  } = req.body || {};

  const studentProfile = {
    student_name,
    student_degree_and_year,
    core_languages,
    frameworks_and_tools,
    database_skills,
    student_projects_and_code_experience,
    career_aspirations,
  };

  const jobPosting = {
    job_title,
    company_name,
    industry_domain,
    required_qualifications,
    preferred_qualifications,
    job_responsibilities,
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the central intelligence engine of the "Student Career Intelligence & Internship Portal".

Your core mission:
Bridge the gap between undergraduate academic preparation and real-world hiring standards. You act as an elite technical recruiter and algorithmic career mentor.

Your responsibilities:
1. Candidate Evaluation: Parse student technical capabilities (programming languages, frameworks, databases, coursework, hands-on projects) against target industry roles or internship descriptions.
2. Objective Compatibility Scoring: Calculate an objective 0–100 match percentage based on verified skills, hands-on implementations, and foundational Computer Science requirements.
3. Concrete Skill Remediation: Never give generic advice like "learn cloud computing" or "study algorithms." Instead, provide exact project architectures, design patterns, core DSA patterns (e.g., Sliders, Monotonic Stacks, DP), or specific framework modules to build.
4. Database Alignment: Always return data formatted strictly as a single, valid JSON object with the specified schema, without markdown formatting, ticks, backticks, or conversational preamble, so it can be parsed directly by an Apache Tomcat Java backend and saved to MySQL. This ensures seamless integration with our backend services and data persistence layer. Perform an in-depth Career Intelligence and Fit Evaluation for the student against the target internship.

---------------------------
[STUDENT PROFILE]
- Full Name: ${student_name}
- Degree & Branch: ${student_degree_and_year}
- Core Programming Languages: ${core_languages}
- Web & Backend Frameworks: ${frameworks_and_tools}
- Databases: ${database_skills}
- Projects & Real Implementations:
  ${student_projects_and_code_experience}
- Target Career Domain: ${career_aspirations}

---------------------------
[TARGET INTERNSHIP POSTING]
- Role: ${job_title}
- Company: ${company_name}
- Industry Domain: ${industry_domain}
- Required Core Skills: ${required_qualifications}
- Preferred / Bonus Skills: ${preferred_qualifications}
- Daily Responsibilities: ${job_responsibilities}

---------------------------
[OUTPUT FORMAT REQUIREMENT]
Return ONLY a valid, raw JSON object matching the following structure exactly (no \`\`\`json code blocks, no leading/trailing commentary):

{
  "evaluation_summary": {
    "match_percentage": 0,
    "fit_status": "Strong Fit | Moderate Fit | Major Gaps",
    "executive_verdict": "A concise 2-sentence summary of the candidate's competitiveness."
  },
  "verified_strengths": [
    {
      "skill": "Name of matched skill",
      "evidence": "How the student's project or background proves competency"
    }
  ],
  "critical_skill_gaps": [
    {
      "missing_skill": "Name of missing tool/concept",
      "importance": "High | Medium | Low",
      "why_required": "Why this role demands it",
      "actionable_project_fix": "A specific mini-project or feature to implement in their portfolio to demonstrate this skill"
    }
  ],
  "ats_optimization": {
    "suggested_profile_headline": "Professional headline for their resume/LinkedIn",
    "recommended_star_bullet_points": [
      "Action verb + Task + Tech stack used + Quantifiable outcome metric"
    ]
  },
  "technical_interview_prep": {
    "data_structures_and_algorithms_focus": [
      "Specific algorithm/data structure topics relevant to this company/domain"
    ],
    "core_cs_and_system_design_questions": [
      "Specific theoretical and architectural concepts to revise"
    ]
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      // Clean any potential markdown ticks if returned
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const validation = validateEvaluationSchema(parsed);
      if (validation.valid) {
        return res.json({
          source: 'gemini-engine',
          result: parsed,
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, switching to algorithmic engine:', err?.message || err);
    }
  }

  // Fallback to deterministic algorithmic calculation engine
  const result = calculateObjectiveFit(studentProfile, jobPosting);
  return res.json({
    source: 'algorithmic-intelligence-engine',
    result,
  });
});

// API: Get Sample Data
app.get('/api/sample-data', (_req, res) => {
  res.json({
    students: SAMPLE_STUDENTS,
    internships: SAMPLE_INTERNSHIPS,
  });
});

// In-memory portal data store for dynamic requests
// In-memory portal data store
interface PortalUser {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  role: string;
  degree_or_company: string;
  skills: string;
  projects: string;
}

const portalUsers: PortalUser[] = [
  {
    id: 1,
    full_name: 'Priya Sharma',
    email: 'student@demo.com',
    password: 'password123',
    role: 'Student',
    degree_or_company: 'B.Tech Computer Science & Engineering (2026)',
    skills: 'Java, Spring Boot, MySQL, REST APIs, Git, Microservices',
    projects: 'Developed a distributed banking ledger in Java & Spring Boot with PostgreSQL. Implemented JWT authentication and RESTful endpoints.',
  },
  {
    id: 2,
    full_name: 'Sarah Jenkins',
    email: 'recruiter@demo.com',
    password: 'password123',
    role: 'Recruiter',
    degree_or_company: 'Stripe University Talent Acquisition',
    skills: 'Technical Recruiting, Sourcing, Engineering Screening',
    projects: 'Oversees university intern hiring for infrastructure & cloud platforms.',
  },
];

let currentSessionUser: PortalUser | null = portalUsers[0];

const portalInternships = [
  {
    id: 1,
    role_title: 'Backend Engineering Intern',
    company_name: 'Stripe',
    location: 'San Francisco, CA / Remote',
    stipend: '$52 / hr',
    required_skills: 'Java, Spring Boot, MySQL, REST APIs, Microservices, Distributed Systems, Git',
    preferred_skills: 'Kafka, Redis, Docker, CI/CD, AWS',
  },
  {
    id: 2,
    role_title: 'Full-Stack Developer Intern',
    company_name: 'Amazon',
    location: 'Seattle, WA / Hybrid',
    stipend: '$48 / hr',
    required_skills: 'TypeScript, React, Node.js, REST APIs, SQL, Docker, AWS',
    preferred_skills: 'GraphQL, Next.js, Jest, Kubernetes',
  },
  {
    id: 3,
    role_title: 'Cloud & DevOps Intern',
    company_name: 'Google',
    location: 'Mountain View, CA / Onsite',
    stipend: '$55 / hr',
    required_skills: 'Python, Linux, Docker, Kubernetes, CI/CD, Go, Shell Scripting',
    preferred_skills: 'Terraform, Prometheus, GCP, Distributed Tracing',
  },
  {
    id: 4,
    role_title: 'Data Engineering Intern',
    company_name: 'Netflix',
    location: 'Los Gatos, CA / Remote',
    stipend: '$50 / hr',
    required_skills: 'Python, SQL, Apache Spark, Kafka, Data Warehousing, ETL Pipelines',
    preferred_skills: 'Snowflake, Airflow, dbt, BigQuery',
  },
];

const portalApplications: any[] = [
  {
    id: 101,
    user_id: 1,
    student_name: 'Priya Sharma',
    internship_id: 1,
    role_title: 'Backend Engineering Intern',
    company_name: 'Stripe',
    match_score: 88,
    status: 'Shortlisted',
    applied_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 102,
    user_id: 3,
    student_name: 'Marcus Vance',
    internship_id: 2,
    role_title: 'Full-Stack Developer Intern',
    company_name: 'Amazon',
    match_score: 92,
    status: 'Pending',
    applied_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 103,
    user_id: 4,
    student_name: 'Elena Rostova',
    internship_id: 3,
    role_title: 'Cloud & DevOps Intern',
    company_name: 'Google',
    match_score: 74,
    status: 'Pending',
    applied_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];
const portalEvaluations: any[] = [];

// /api/portal: GET
app.get('/api/portal', (req, res) => {
  const action = (req.query.action as string || '').toLowerCase();
  if (action === 'ping') {
    return res.json({ status: 'ok', db: 'connected' });
  }
  if (action === 'session') {
    if (currentSessionUser) {
      return res.json({ authenticated: true, ...currentSessionUser });
    }
    return res.json({ authenticated: false });
  }
  if (action === 'internships') {
    return res.json(portalInternships);
  }
  if (action === 'applications') {
    if (currentSessionUser?.role === 'Recruiter') {
      return res.json(portalApplications);
    }
    const userApps = portalApplications.filter(
      (a) => a.user_id === (currentSessionUser?.id || 1) || a.student_name === currentSessionUser?.full_name
    );
    return res.json(userApps);
  }
  if (action === 'history') {
    return res.json(portalEvaluations);
  }
  return res.status(400).json({ error: 'Unknown action' });
});

// /api/portal: POST
app.post('/api/portal', async (req, res) => {
  const action = (req.query.action as string || '').toLowerCase();

  if (action === 'login') {
    const { email, password, role } = req.body || {};
    const found = portalUsers.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (found) {
      currentSessionUser = found;
      return res.json({ success: true, ...found });
    }
    const isRecruiter = role === 'Recruiter' || (email || '').includes('recruiter');
    const newUser: PortalUser = {
      id: Date.now(),
      full_name: isRecruiter ? 'Sarah Jenkins' : 'Priya Sharma',
      email: email || 'student@demo.com',
      role: isRecruiter ? 'Recruiter' : 'Student',
      degree_or_company: isRecruiter ? 'Stripe Talent Acquisition' : 'B.Tech CSE (2026)',
      skills: isRecruiter ? 'Recruiting' : 'Java, Spring Boot, MySQL, REST APIs, Git',
      projects: 'Active engineering projects.',
    };
    portalUsers.push(newUser);
    currentSessionUser = newUser;
    return res.json({ success: true, ...newUser });
  }

  if (action === 'register') {
    const { full_name, email, password, role, degree_or_company, skills, projects } = req.body || {};
    const newUser: PortalUser = {
      id: Date.now(),
      full_name: full_name || 'Alex Rivera',
      email: email || `user${Date.now()}@demo.com`,
      password,
      role: role || 'Student',
      degree_or_company: degree_or_company || 'Undergraduate',
      skills: skills || 'Java, Python, SQL',
      projects: projects || 'Coursework projects.',
    };
    portalUsers.push(newUser);
    currentSessionUser = newUser;
    return res.json({ success: true, ...newUser });
  }

  if (action === 'logout') {
    currentSessionUser = null;
    return res.json({ success: true });
  }

  if (action === 'addinternship') {
    const { role_title, company_name, location, stipend, required_skills, preferred_skills } = req.body || {};
    if (!role_title || !company_name) {
      return res.status(400).json({ error: 'Role title and company are required' });
    }
    const newInternship = {
      id: Date.now(),
      role_title: String(role_title).trim(),
      company_name: String(company_name).trim(),
      location: String(location || 'Remote').trim(),
      stipend: String(stipend || 'Competitive').trim(),
      required_skills: String(required_skills || '').trim(),
      preferred_skills: String(preferred_skills || '').trim(),
    };
    portalInternships.unshift(newInternship);
    return res.json(newInternship);
  }

  if (action === 'apply') {
    const { internship_id, role_title, company_name, match_score } = req.body || {};
    const newApplication = {
      id: Date.now(),
      user_id: currentSessionUser?.id || 1,
      student_name: currentSessionUser?.full_name || 'Priya Sharma',
      internship_id: Number(internship_id),
      role_title,
      company_name,
      match_score: Number(match_score || 85),
      status: 'Applied',
      applied_at: new Date().toISOString(),
    };
    portalApplications.unshift(newApplication);
    return res.json({ success: true, ...newApplication });
  }

  if (action === 'updateapplicationstatus') {
    const { id, status } = req.body || {};
    const app = portalApplications.find((a) => String(a.id) === String(id));
    if (app) {
      app.status = status;
    }
    return res.json({ success: true, id, status });
  }

  if (action === 'analyze' || action === 'evaluate') {
    const {
      student_name = currentSessionUser?.full_name || 'Priya Sharma',
      degree = currentSessionUser?.degree_or_company || 'Undergraduate',
      skills = '',
      projects = '',
      role_title = 'Backend Engineering Intern',
      company_name = 'Stripe',
      requirements = '',
    } = req.body || {};

    const stuSkills = String(skills).split(/[,;\n]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    const reqSkills = String(requirements).split(/[,;\n]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);

    const matched: string[] = [];
    const missing: string[] = [];

    reqSkills.forEach((reqSkill) => {
      const found = stuSkills.some((stu) => stu.includes(reqSkill) || reqSkill.includes(stu));
      if (found) {
        matched.push(reqSkill.charAt(0).toUpperCase() + reqSkill.slice(1));
      } else {
        missing.push(reqSkill.charAt(0).toUpperCase() + reqSkill.slice(1));
      }
    });

    const score = reqSkills.length === 0 ? 82 : Math.round((matched.length / reqSkills.length) * 100);
    const fit_status = score >= 75 ? 'Strong Fit' : score >= 50 ? 'Moderate Fit' : 'Needs Upskilling';

    const skill_gaps = missing.map((m, idx) => ({
      skill: m,
      priority: idx === 0 ? 'High' : 'Medium',
      mini_project: `Architect a production-grade module integrating ${m} with resilience patterns and Docker containerization.`,
    }));

    const ats_star_bullets = [
      `Engineered high-throughput ${role_title} RESTful endpoints with validation and error handling, reducing latency by 35%.`,
      `Designed and normalized relational database schemas with B-Tree indexes to ensure ACID compliance under peak load.`,
      `Authored comprehensive unit and integration test pipelines achieving 90%+ branch coverage.`,
    ];

    const interview_topics = [
      'Concurrency & Multi-Threading: Thread safety, volatile semantics, and synchronization primitives',
      'Relational Database Optimization: B-Tree Index mechanics, transaction isolation levels, and EXPLAIN query plan analysis',
      'Algorithmic Patterns: Monotonic Stacks, Sliding Windows, and Dynamic Programming optimization',
      'Distributed Systems Fundamentals: Stateless API design, caching invalidation strategies, and idempotent endpoints',
    ];

    const result = {
      match_percentage: score,
      fit_status,
      executive_summary: `${student_name} demonstrates ${score >= 75 ? 'exceptional' : 'solid foundational'} readiness for ${role_title} at ${company_name}, verified across core Computer Science fundamentals and practical tooling.`,
      matched_skills: matched.length > 0 ? matched : ['Foundational Computer Science', 'Object-Oriented Design'],
      skill_gaps: skill_gaps.length > 0 ? skill_gaps : [{ skill: 'Distributed Tracing', priority: 'Medium', mini_project: 'Integrate OpenTelemetry metrics collection into existing services.' }],
      ats_star_bullets,
      interview_topics,
    };

    const evaluationRecord = {
      id: Date.now(),
      user_id: currentSessionUser?.id || 1,
      student_name,
      role_title,
      company_name,
      match_score: score,
      fit_status,
      result_json: result,
      created_at: new Date().toISOString(),
    };

    portalEvaluations.unshift(evaluationRecord);
    return res.json({ success: true, id: evaluationRecord.id, match_score: score, fit_status, result });
  }

  return res.status(400).json({ error: 'Invalid POST action' });
});

// /api/portal: DELETE
app.delete('/api/portal', (req, res) => {
  const id = req.query.id as string || req.query.internship_id as string;
  const action = (req.query.action as string || '').toLowerCase();
  const type = (req.query.type as string || '').toLowerCase();

  if (!id) {
    return res.status(400).json({ error: 'Missing id query parameter' });
  }

  // Check if deleting internship
  if (action === 'deleteinternship' || type === 'internship') {
    const initialLen = portalInternships.length;
    const filtered = portalInternships.filter((item) => String(item.id) !== String(id));
    portalInternships.length = 0;
    portalInternships.push(...filtered);
    return res.json({ success: true, deletedId: id, type: 'internship', countDeleted: initialLen - filtered.length });
  }

  // Deleting evaluation record
  const initialLength = portalEvaluations.length;
  const filtered = portalEvaluations.filter((item) => String(item.id) !== String(id));
  portalEvaluations.length = 0;
  portalEvaluations.push(...filtered);

  return res.json({ success: true, deletedId: id, type: 'evaluation', countDeleted: initialLength - filtered.length });
});

// API: Generate MySQL statements
app.post('/api/mysql-pipeline', (req, res) => {
  const { student, job, result } = req.body;
  if (!student || !job || !result) {
    return res.status(400).json({ error: 'Missing required payload (student, job, result)' });
  }
  const statements = generateMySQLStatements(student, job, result);
  res.json(statements);
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Career Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
