export interface StudentProfile {
  id?: string;
  student_name: string;
  student_degree_and_year: string;
  core_languages: string;
  frameworks_and_tools: string;
  database_skills: string;
  student_projects_and_code_experience: string;
  career_aspirations: string;
}

export interface InternshipPosting {
  id?: string;
  job_title: string;
  company_name: string;
  industry_domain: string;
  required_qualifications: string;
  preferred_qualifications: string;
  job_responsibilities: string;
  location?: string;
  stipend?: string;
}

export interface EvaluationResult {
  evaluation_summary: {
    match_percentage: number;
    fit_status: 'Strong Fit' | 'Moderate Fit' | 'Major Gaps';
    executive_verdict: string;
  };
  verified_strengths: Array<{
    skill: string;
    evidence: string;
  }>;
  critical_skill_gaps: Array<{
    missing_skill: string;
    importance: 'High' | 'Medium' | 'Low';
    why_required: string;
    actionable_project_fix: string;
  }>;
  ats_optimization: {
    suggested_profile_headline: string;
    recommended_star_bullet_points: string[];
  };
  technical_interview_prep: {
    data_structures_and_algorithms_focus: string[];
    core_cs_and_system_design_questions: string[];
  };
}

export interface SavedEvaluation {
  id: string;
  timestamp: string;
  student: StudentProfile;
  job: InternshipPosting;
  result: EvaluationResult;
}
