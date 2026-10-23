import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvaluationSchema, calculateObjectiveFit, generateMySQLStatements } from './evaluationLogic.ts';
import { SAMPLE_STUDENTS, SAMPLE_INTERNSHIPS } from '../data/sampleData.ts';

test('validateEvaluationSchema passes valid structure', () => {
  const mockValid = {
    evaluation_summary: {
      match_percentage: 85,
      fit_status: 'Strong Fit',
      executive_verdict: 'Excellent candidate with verified backend skills.'
    },
    verified_strengths: [
      { skill: 'Java', evidence: 'Spring Boot microservice' }
    ],
    critical_skill_gaps: [
      {
        missing_skill: 'Kafka',
        importance: 'High',
        why_required: 'Streaming logs',
        actionable_project_fix: 'Build an event driven queue'
      }
    ],
    ats_optimization: {
      suggested_profile_headline: 'Software Engineer | Java & Cloud',
      recommended_star_bullet_points: [
        'Built Spring Boot microservice reducing latency by 40%.'
      ]
    },
    technical_interview_prep: {
      data_structures_and_algorithms_focus: ['Sliding Window', 'Graphs'],
      core_cs_and_system_design_questions: ['Explain transaction isolation levels']
    }
  };

  const validation = validateEvaluationSchema(mockValid);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
});

test('validateEvaluationSchema rejects invalid or missing fields', () => {
  const invalid = {
    evaluation_summary: {
      match_percentage: 150, // invalid > 100
      fit_status: 'Not Real',
    }
  };

  const validation = validateEvaluationSchema(invalid);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.length > 0);
});

test('calculateObjectiveFit scores Priya against Stripe Backend role appropriately', () => {
  const priya = SAMPLE_STUDENTS[0];
  const stripe = SAMPLE_INTERNSHIPS[0];

  const result = calculateObjectiveFit(priya, stripe);

  assert.ok(result.evaluation_summary.match_percentage >= 65, 'Should score high due to strong Java & DB match');
  assert.ok(['Strong Fit', 'Moderate Fit'].includes(result.evaluation_summary.fit_status));
  assert.ok(result.verified_strengths.length > 0);
  assert.ok(result.critical_skill_gaps.length > 0);
  assert.ok(result.ats_optimization.recommended_star_bullet_points.length > 0);
  assert.ok(result.technical_interview_prep.data_structures_and_algorithms_focus.length > 0);

  // Schema validation on generated fit
  const validation = validateEvaluationSchema(result);
  assert.equal(validation.valid, true, `Generated result should be schema-valid: ${validation.errors.join(', ')}`);
});

test('generateMySQLStatements produces valid DDL and DML statements with proper table names', () => {
  const priya = SAMPLE_STUDENTS[0];
  const stripe = SAMPLE_INTERNSHIPS[0];
  const result = calculateObjectiveFit(priya, stripe);

  const { ddl, dml } = generateMySQLStatements(priya, stripe, result);

  assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS students'));
  assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS evaluations'));
  assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS student_roadmaps'));
  assert.ok(dml.includes('INSERT INTO students'));
  assert.ok(dml.includes('INSERT INTO evaluations'));
  assert.ok(dml.includes('INSERT INTO student_roadmaps'));
});
