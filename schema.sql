CREATE DATABASE IF NOT EXISTS career_portal_db;
USE career_portal_db;

DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS internships;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Student',
    degree_or_company VARCHAR(255),
    skills TEXT,
    projects TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    stipend VARCHAR(100) NOT NULL,
    required_skills TEXT NOT NULL,
    preferred_skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    internship_id INT NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    match_score INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    match_score INT NOT NULL,
    fit_status VARCHAR(50) NOT NULL,
    result_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Demo Users (1 Student, 1 Recruiter)
INSERT INTO users (full_name, email, password, role, degree_or_company, skills, projects) VALUES
('Priya Sharma', 'student@demo.com', 'password123', 'Student', 'B.Tech Computer Science & Engineering (2026)', 'Java, Spring Boot, MySQL, REST APIs, Git, Microservices', 'Developed a distributed banking ledger in Java & Spring Boot with PostgreSQL. Implemented JWT authentication and RESTful endpoints.'),
('Sarah Jenkins', 'recruiter@demo.com', 'password123', 'Recruiter', 'Stripe University Talent Acquisition', 'Technical Recruiting, Candidate Sourcing, System Evaluation', 'Oversees university intern hiring for infrastructure & cloud platforms.');

-- Seed 4 Starter Internships
INSERT INTO internships (role_title, company_name, location, stipend, required_skills, preferred_skills) VALUES
('Backend Engineering Intern', 'Stripe', 'San Francisco, CA / Remote', '$52 / hr', 'Java, Spring Boot, MySQL, REST APIs, Microservices, Distributed Systems, Git', 'Kafka, Redis, Docker, CI/CD, AWS'),
('Full-Stack Developer Intern', 'Amazon', 'Seattle, WA / Hybrid', '$48 / hr', 'TypeScript, React, Node.js, REST APIs, SQL, Docker, AWS', 'GraphQL, Next.js, Jest, Kubernetes'),
('Cloud & DevOps Intern', 'Google', 'Mountain View, CA / Onsite', '$55 / hr', 'Python, Linux, Docker, Kubernetes, CI/CD, Go, Shell Scripting', 'Terraform, Prometheus, GCP, Distributed Tracing'),
('Data Engineering Intern', 'Netflix', 'Los Gatos, CA / Remote', '$50 / hr', 'Python, SQL, Apache Spark, Kafka, Data Warehousing, ETL Pipelines', 'Snowflake, Airflow, dbt, BigQuery');
