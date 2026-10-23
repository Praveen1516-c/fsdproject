import { StudentProfile, InternshipPosting, EvaluationResult } from '../types/career';

/**
 * Validates that an evaluation object strictly matches the required schema.
 */
export function validateEvaluationSchema(obj: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Response must be a valid JSON object.'] };
  }

  // Check evaluation_summary
  if (!obj.evaluation_summary || typeof obj.evaluation_summary !== 'object') {
    errors.push('Missing or invalid "evaluation_summary" object.');
  } else {
    if (typeof obj.evaluation_summary.match_percentage !== 'number' ||
        obj.evaluation_summary.match_percentage < 0 ||
        obj.evaluation_summary.match_percentage > 100) {
      errors.push('"match_percentage" must be a number between 0 and 100.');
    }
    const validStatuses = ['Strong Fit', 'Moderate Fit', 'Major Gaps'];
    if (!validStatuses.includes(obj.evaluation_summary.fit_status)) {
      errors.push(`"fit_status" must be one of: ${validStatuses.join(', ')}.`);
    }
    if (typeof obj.evaluation_summary.executive_verdict !== 'string' || obj.evaluation_summary.executive_verdict.trim().length === 0) {
      errors.push('"executive_verdict" must be a non-empty string.');
    }
  }

  // Check verified_strengths
  if (!Array.isArray(obj.verified_strengths)) {
    errors.push('"verified_strengths" must be an array.');
  } else {
    obj.verified_strengths.forEach((item: any, i: number) => {
      if (!item.skill || typeof item.skill !== 'string') {
        errors.push(`verified_strengths[${i}] missing valid "skill".`);
      }
      if (!item.evidence || typeof item.evidence !== 'string') {
        errors.push(`verified_strengths[${i}] missing valid "evidence".`);
      }
    });
  }

  // Check critical_skill_gaps
  if (!Array.isArray(obj.critical_skill_gaps)) {
    errors.push('"critical_skill_gaps" must be an array.');
  } else {
    const validImportances = ['High', 'Medium', 'Low'];
    obj.critical_skill_gaps.forEach((item: any, i: number) => {
      if (!item.missing_skill || typeof item.missing_skill !== 'string') {
        errors.push(`critical_skill_gaps[${i}] missing "missing_skill".`);
      }
      if (!validImportances.includes(item.importance)) {
        errors.push(`critical_skill_gaps[${i}] "importance" must be High, Medium, or Low.`);
      }
      if (!item.why_required || typeof item.why_required !== 'string') {
        errors.push(`critical_skill_gaps[${i}] missing "why_required".`);
      }
      if (!item.actionable_project_fix || typeof item.actionable_project_fix !== 'string') {
        errors.push(`critical_skill_gaps[${i}] missing "actionable_project_fix".`);
      }
    });
  }

  // Check ats_optimization
  if (!obj.ats_optimization || typeof obj.ats_optimization !== 'object') {
    errors.push('Missing or invalid "ats_optimization" object.');
  } else {
    if (typeof obj.ats_optimization.suggested_profile_headline !== 'string') {
      errors.push('"suggested_profile_headline" must be a string.');
    }
    if (!Array.isArray(obj.ats_optimization.recommended_star_bullet_points) || obj.ats_optimization.recommended_star_bullet_points.length === 0) {
      errors.push('"recommended_star_bullet_points" must be a non-empty array of strings.');
    }
  }

  // Check technical_interview_prep
  if (!obj.technical_interview_prep || typeof obj.technical_interview_prep !== 'object') {
    errors.push('Missing or invalid "technical_interview_prep" object.');
  } else {
    if (!Array.isArray(obj.technical_interview_prep.data_structures_and_algorithms_focus)) {
      errors.push('"data_structures_and_algorithms_focus" must be an array of strings.');
    }
    if (!Array.isArray(obj.technical_interview_prep.core_cs_and_system_design_questions)) {
      errors.push('"core_cs_and_system_design_questions" must be an array of strings.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministic Career Fit Evaluation Algorithm
 * Evaluates student profile against target internship and computes objective match.
 */
export function calculateObjectiveFit(
  student: StudentProfile,
  job: InternshipPosting
): EvaluationResult {
  const studentText = [
    student.core_languages,
    student.frameworks_and_tools,
    student.database_skills,
    student.student_projects_and_code_experience,
    student.career_aspirations,
  ].join(' ').toLowerCase();

  const reqText = (job.required_qualifications || '').toLowerCase();
  const prefText = (job.preferred_qualifications || '').toLowerCase();
  const titleText = (job.job_title || '').toLowerCase();

  // Keyword extraction & matching helper
  const keywords = [
    { key: 'java', label: 'Java (OOP & Threading)' },
    { key: 'python', label: 'Python (Async/Scripting)' },
    { key: 'c++', label: 'C++ (Low-level/Systems)' },
    { key: 'rust', label: 'Rust (Memory Safety)' },
    { key: 'go', label: 'Go / Golang (Concurrency)' },
    { key: 'typescript', label: 'TypeScript / Static Typing' },
    { key: 'react', label: 'React / Frontend Architecture' },
    { key: 'spring boot', label: 'Spring Boot Microservices' },
    { key: 'fastapi', label: 'FastAPI / Async REST' },
    { key: 'next.js', label: 'Next.js & SSR' },
    { key: 'docker', label: 'Docker Containerization' },
    { key: 'kubernetes', label: 'Kubernetes Orchestration' },
    { key: 'postgresql', label: 'PostgreSQL & ACID Transactions' },
    { key: 'mysql', label: 'MySQL Relational Schema Design' },
    { key: 'redis', label: 'Redis In-Memory Caching' },
    { key: 'kafka', label: 'Kafka / Event-Driven Messaging' },
    { key: 'distributed', label: 'Distributed Systems & Consistency' },
    { key: 'machine learning', label: 'Machine Learning & Model Serving' },
    { key: 'pytorch', label: 'PyTorch Deep Learning' },
    { key: 'api', label: 'RESTful / gRPC API Design' },
  ];

  const matchedStrengths: Array<{ skill: string; evidence: string }> = [];
  const detectedGaps: Array<{ missing_skill: string; importance: 'High' | 'Medium' | 'Low'; why_required: string; actionable_project_fix: string }> = [];

  let matchedScore = 0;
  let totalScoreWeight = 0;

  keywords.forEach(({ key, label }) => {
    const isRequired = reqText.includes(key) || titleText.includes(key);
    const isPreferred = prefText.includes(key);

    if (isRequired || isPreferred) {
      const weight = isRequired ? 12 : 6;
      totalScoreWeight += weight;

      const hasSkill = studentText.includes(key);
      if (hasSkill) {
        matchedScore += weight;
        let evidence = `Proven through hands-on background and projects referencing ${label}.`;
        if (key === 'java' && studentText.includes('spring boot')) {
          evidence = 'Demonstrated in production-style Spring Boot microservice architecture and core OOP implementation.';
        } else if (key === 'postgresql' || key === 'sql') {
          evidence = 'Hands-on query indexing, ACID schema definitions, and connection pool configuration.';
        } else if (key === 'docker') {
          evidence = 'Multi-stage Dockerfile builds and containerized service deployment.';
        } else if (key === 'c++') {
          evidence = 'Memory management, concurrency primitives, and low-level system implementations.';
        } else if (key === 'pytorch') {
          evidence = 'Vector embedding retrieval and model inference benchmarking pipeline.';
        }
        matchedStrengths.push({ skill: label, evidence });
      } else {
        // Missing skill
        if (isRequired) {
          detectedGaps.push(generateRemediation(key, label, 'High', job.job_title));
        } else if (isPreferred) {
          detectedGaps.push(generateRemediation(key, label, 'Medium', job.job_title));
        }
      }
    }
  });

  // Calculate percentage normalized
  const basePercentage = totalScoreWeight > 0 ? Math.round((matchedScore / totalScoreWeight) * 100) : 70;
  // Apply project experience bonus
  const hasSubstantialProjects = (student.student_projects_and_code_experience || '').length > 150;
  const match_percentage = Math.min(96, Math.max(25, basePercentage + (hasSubstantialProjects ? 8 : -5)));

  let fit_status: 'Strong Fit' | 'Moderate Fit' | 'Major Gaps' = 'Moderate Fit';
  if (match_percentage >= 78) {
    fit_status = 'Strong Fit';
  } else if (match_percentage < 55) {
    fit_status = 'Major Gaps';
  }

  // Ensure minimum elements
  if (matchedStrengths.length === 0) {
    matchedStrengths.push({
      skill: 'Core Computer Science Fundamentals',
      evidence: `Student demonstrates solid grasp of fundamental programming paradigms via ${student.core_languages}.`,
    });
  }

  if (detectedGaps.length === 0) {
    detectedGaps.push({
      missing_skill: 'Distributed Idempotency & Rate Limiting',
      importance: 'Medium',
      why_required: 'Production financial services demand at-least-once delivery handling and token-bucket throttling.',
      actionable_project_fix: 'Architect an Express or Spring Boot filter using Redis sliding window log with 1,000 req/sec load test validation.',
    });
  }

  const executive_verdict = fit_status === 'Strong Fit'
    ? `${student.student_name} displays exceptional alignment with ${job.company_name}'s requirements, substantiated by strong hands-on code implementations in ${student.core_languages}. Targeted remediation in ${detectedGaps[0]?.missing_skill || 'production telemetry'} will elevate them into the top tier of candidates.`
    : fit_status === 'Moderate Fit'
    ? `${student.student_name} demonstrates viable foundational CS principles but requires demonstrable hands-on architectural experience in ${detectedGaps.slice(0, 2).map(g => g.missing_skill).join(' and ')}. Completing the prescribed concrete portfolio fixes will close the gap for ${job.job_title}.`
    : `${student.student_name} currently lacks critical production-grade qualifications essential for ${job.job_title}. A structured 4-week sprint building the recommended systems-level projects is required before technical screen rounds.`;

  const suggested_profile_headline = `${student.student_name} | Software Engineer | ${student.core_languages.split(',')[0]} & Distributed Backend Systems | Class of ${student.student_degree_and_year.match(/202\d/)?.[0] || '2026'}`;

  const recommended_star_bullet_points = [
    `Architected high-throughput service using ${student.core_languages.split(',')[0] || 'Java'} & ${student.database_skills.split(',')[0] || 'PostgreSQL'}, achieving sub-80ms p95 latency under simulated 500 req/sec load test.`,
    `Engineered fault-tolerant caching and transactional pipeline, cutting unindexed database queries by 65% and enforcing strict ACID compliance.`,
    `Implemented automated containerized CI/CD workflow with Docker and comprehensive integration test suite, achieving 88%+ code coverage.`,
  ];

  const data_structures_and_algorithms_focus = [
    'Sliding Window & Two-Pointers (Substrings with K distinct elements, minimum window substring)',
    'Monotonic Stack & Deque (Next greater element, largest rectangle in histogram, sliding window maximum)',
    'Heap / Priority Queue (Top-K frequent items, median in a data stream, task scheduler)',
    'Graph Algorithms (Topological Sort / Kahn\'s Algorithm, Dijkstra for shortest path network latency)',
    'Dynamic Programming with Memoization (0/1 Knapsack, coin change, longest increasing subsequence)',
  ];

  const core_cs_and_system_design_questions = [
    `Explain the internal locking mechanisms and transaction isolation levels (Read Committed vs Repeatable Read vs Serializable) in relational databases, and how MVCC prevents phantom reads.`,
    `How does the TCP 3-way handshake work at the socket layer, and how would you tune TIME_WAIT sockets under heavy connection churn?`,
    `Design an idempotent payment API endpoint: Explain the database unique constraint key, atomic distributed lock with Redis/Redlock, and handling timeouts during third-party gateway dispatch.`,
    `Contrast horizontal partitioning (sharding) vs vertical partitioning: How do you handle cross-shard queries and rebalancing without downtime?`,
  ];

  return {
    evaluation_summary: {
      match_percentage,
      fit_status,
      executive_verdict,
    },
    verified_strengths: matchedStrengths,
    critical_skill_gaps: detectedGaps,
    ats_optimization: {
      suggested_profile_headline,
      recommended_star_bullet_points,
    },
    technical_interview_prep: {
      data_structures_and_algorithms_focus,
      core_cs_and_system_design_questions,
    },
  };
}

function generateRemediation(
  key: string,
  label: string,
  importance: 'High' | 'Medium' | 'Low',
  jobTitle: string
): { missing_skill: string; importance: 'High' | 'Medium' | 'Low'; why_required: string; actionable_project_fix: string } {
  switch (key) {
    case 'kafka':
      return {
        missing_skill: 'Event-Driven Architecture (Apache Kafka)',
        importance,
        why_required: `${jobTitle} requires asynchronous streaming pipelines for decoupled processing and high-throughput event logging.`,
        actionable_project_fix: 'Build an Order Processing microservice using Kafka producer/consumer with manual commit offsets, Dead Letter Queue (DLQ), and exactly-once processing semantics.',
      };
    case 'redis':
      return {
        missing_skill: 'Distributed Caching & Invalidation (Redis)',
        importance,
        why_required: 'Production services must offload hot reads from primary relational databases to meet p99 latency SLAs.',
        actionable_project_fix: 'Implement a Cache-Aside pattern with Redis cluster, adding TTL jitter to prevent cache stampedes and Lua scripts for atomic token-bucket rate limiting.',
      };
    case 'docker':
    case 'kubernetes':
      return {
        missing_skill: 'Containerization & Orchestration (Docker / K8s)',
        importance,
        why_required: 'Modern cloud infrastructure demands standardized deployment artifacts and reproducible environments.',
        actionable_project_fix: 'Write an optimized multi-stage Dockerfile (reducing image size under 120MB) and deploy a 3-replica stateful service on local Minikube with liveness/readiness probes.',
      };
    case 'distributed':
      return {
        missing_skill: 'Distributed Systems & Consistency (CAP, Raft/Paxos)',
        importance,
        why_required: 'Infrastructure teams need engineers who understand split-brain resolution, network partitions, and quorum consensus.',
        actionable_project_fix: 'Implement a minimal 3-node distributed key-value store in Go or Java demonstrating leader election and heartbeat timeouts through Raft consensus.',
      };
    default:
      return {
        missing_skill: label,
        importance,
        why_required: `Crucial foundation for technical responsibilities outlined in ${jobTitle}.`,
        actionable_project_fix: `Build an end-to-end open-source prototype implementing ${label} with comprehensive unit test coverage (>85%) and detailed architecture diagram in README.md.`,
      };
  }
}

/**
 * Generates SQL DDL and DML for MySQL integration
 * Matching Tomcat Java backend persistence layer
 */
export function generateMySQLStatements(
  student: StudentProfile,
  job: InternshipPosting,
  result: EvaluationResult
): { ddl: string; dml: string } {
  const ddl = `-- ========================================================
-- DATABASE SCHEMA: Student Career Intelligence & Internship Portal
-- Designed for MySQL 8.0+ / Apache Tomcat Java Persistence Layer
-- ========================================================

CREATE DATABASE IF NOT EXISTS career_intelligence_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE career_intelligence_db;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    degree_and_year VARCHAR(128) NOT NULL,
    core_languages TEXT NOT NULL,
    frameworks_and_tools TEXT,
    database_skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Target Internship Postings Table
CREATE TABLE IF NOT EXISTS internship_postings (
    posting_id VARCHAR(64) PRIMARY KEY,
    job_title VARCHAR(128) NOT NULL,
    company_name VARCHAR(128) NOT NULL,
    industry_domain VARCHAR(128) NOT NULL,
    required_qualifications TEXT NOT NULL,
    preferred_qualifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Evaluation Records (Parsed from Gemini Pure JSON Engine)
CREATE TABLE IF NOT EXISTS evaluations (
    evaluation_id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    posting_id VARCHAR(64) NOT NULL,
    match_percentage INT NOT NULL CHECK (match_percentage BETWEEN 0 AND 100),
    fit_status ENUM('Strong Fit', 'Moderate Fit', 'Major Gaps') NOT NULL,
    executive_verdict TEXT NOT NULL,
    suggested_headline VARCHAR(255),
    raw_json_payload JSON NOT NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (posting_id) REFERENCES internship_postings(posting_id) ON DELETE CASCADE,
    INDEX idx_match_score (match_percentage),
    INDEX idx_fit_status (fit_status)
);

-- 4. Actionable Skill Remediation Roadmaps
CREATE TABLE IF NOT EXISTS student_roadmaps (
    roadmap_id VARCHAR(64) PRIMARY KEY,
    evaluation_id VARCHAR(64) NOT NULL,
    missing_skill VARCHAR(128) NOT NULL,
    importance ENUM('High', 'Medium', 'Low') NOT NULL,
    why_required TEXT NOT NULL,
    actionable_project_fix TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(evaluation_id) ON DELETE CASCADE
);`;

  const sId = student.id || 'STU_' + Math.abs(hashCode(student.student_name)).toString(16);
  const pId = job.id || 'JOB_' + Math.abs(hashCode(job.job_title)).toString(16);
  const evalId = 'EVAL_' + Date.now().toString(16);

  const cleanEscape = (str: string) => (str || '').replace(/'/g, "''").replace(/\\/g, '\\\\');
  const jsonStr = JSON.stringify(result).replace(/'/g, "''");

  const roadmapsSql = result.critical_skill_gaps.map((gap, idx) => {
    return `INSERT INTO student_roadmaps (roadmap_id, evaluation_id, missing_skill, importance, why_required, actionable_project_fix, status)
VALUES ('RDM_${evalId}_${idx + 1}', '${evalId}', '${cleanEscape(gap.missing_skill)}', '${gap.importance}', '${cleanEscape(gap.why_required)}', '${cleanEscape(gap.actionable_project_fix)}', 'Pending');`;
  }).join('\n');

  const dml = `-- ========================================================
-- DATA MANIPULATION (DML): Automated Tomcat Servlet Persistence
-- ========================================================

-- Insert / Upsert Student Profile
INSERT INTO students (student_id, full_name, degree_and_year, core_languages, frameworks_and_tools, database_skills)
VALUES ('${sId}', '${cleanEscape(student.student_name)}', '${cleanEscape(student.student_degree_and_year)}', '${cleanEscape(student.core_languages)}', '${cleanEscape(student.frameworks_and_tools)}', '${cleanEscape(student.database_skills)}')
ON DUPLICATE KEY UPDATE core_languages = VALUES(core_languages), frameworks_and_tools = VALUES(frameworks_and_tools);

-- Insert Target Posting
INSERT INTO internship_postings (posting_id, job_title, company_name, industry_domain, required_qualifications, preferred_qualifications)
VALUES ('${pId}', '${cleanEscape(job.job_title)}', '${cleanEscape(job.company_name)}', '${cleanEscape(job.industry_domain)}', '${cleanEscape(job.required_qualifications)}', '${cleanEscape(job.preferred_qualifications)}')
ON DUPLICATE KEY UPDATE required_qualifications = VALUES(required_qualifications);

-- Insert Evaluation Summary
INSERT INTO evaluations (evaluation_id, student_id, posting_id, match_percentage, fit_status, executive_verdict, suggested_headline, raw_json_payload)
VALUES (
    '${evalId}',
    '${sId}',
    '${pId}',
    ${result.evaluation_summary.match_percentage},
    '${result.evaluation_summary.fit_status}',
    '${cleanEscape(result.evaluation_summary.executive_verdict)}',
    '${cleanEscape(result.ats_optimization.suggested_profile_headline)}',
    '${jsonStr}'
);

-- Insert Actionable Remediation Roadmap Items
${roadmapsSql}`;

  return { ddl, dml };
}

export function generateSingleRecordSqlInsert(
  student: StudentProfile,
  job: InternshipPosting,
  result: EvaluationResult,
  id: string,
  timestamp: string
): string {
  const cleanEscape = (str: string) => (str || '').replace(/'/g, "''").replace(/\\/g, '\\\\');
  const missingJson = JSON.stringify(result.critical_skill_gaps).replace(/'/g, "''");
  const prepJson = JSON.stringify(result.technical_interview_prep).replace(/'/g, "''");

  return `-- ========================================================
-- READY-TO-RUN MYSQL INSERT: Evaluation ID ${id}
-- Table: career_evaluations / Database: student_career_portal
-- ========================================================
INSERT INTO career_evaluations (
    student_name,
    degree,
    skills,
    target_role,
    company_name,
    match_score,
    fit_verdict,
    executive_summary,
    missing_skills_json,
    interview_prep_json,
    created_at
) VALUES (
    '${cleanEscape(student.student_name)}',
    '${cleanEscape(student.student_degree_and_year)}',
    '${cleanEscape(student.core_languages + ', ' + student.frameworks_and_tools)}',
    '${cleanEscape(job.job_title)}',
    '${cleanEscape(job.company_name)}',
    ${result.evaluation_summary.match_percentage},
    '${cleanEscape(result.evaluation_summary.fit_status)}',
    '${cleanEscape(result.evaluation_summary.executive_verdict)}',
    '${missingJson}',
    '${prepJson}',
    '${cleanEscape(timestamp)}'
);`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

