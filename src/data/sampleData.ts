import { StudentProfile, InternshipPosting } from '../types/career';

export const SAMPLE_STUDENTS: StudentProfile[] = [
  {
    id: 'student-priya',
    student_name: 'Priya Sharma',
    student_degree_and_year: 'B.Tech in Computer Science & Engineering, 3rd Year (Class of 2026)',
    core_languages: 'Java 17/21, Python, C++, SQL (PostgreSQL, MySQL)',
    frameworks_and_tools: 'Spring Boot 3, Spring Data JPA, Hibernate, Docker, Git/GitHub, Maven, JUnit 5',
    database_skills: 'PostgreSQL (query optimization, indexing, ACID transactions), Redis (basic cache lookups), MySQL',
    student_projects_and_code_experience: `1. Campus Food Delivery Microservice: Built Spring Boot REST API handling 450 req/sec in load tests using JMeter. Implemented JWT authentication, role-based access control, and PostgreSQL with connection pooling (HikariCP).
2. Distributed In-Memory Cache Simulator: Implemented LRU/LFU eviction policies in Java with concurrent hash maps and double-linked list data structures; benchmarked thread safety under contention.
3. LeetCode / Competitive Programming: 320+ problems solved in Java (focused on graphs, BFS/DFS, dynamic programming).`,
    career_aspirations: 'Backend Software Engineering & Distributed Systems Internships at high-scale tech firms',
  },
  {
    id: 'student-alex',
    student_name: 'Alex Chen',
    student_degree_and_year: 'B.S. in Computer Science & Data Science, Senior (Class of 2025)',
    core_languages: 'Python 3.11, TypeScript, Go (intermediate), SQL',
    frameworks_and_tools: 'FastAPI, PyTorch, Hugging Face Transformers, Docker, Celery, React, Git',
    database_skills: 'PostgreSQL, pgvector, Redis, Pinecone vector database',
    student_projects_and_code_experience: `1. Hybrid Multi-Document RAG Engine: Built asynchronous FastAPI backend using LangChain & pgvector for cosine similarity semantic search over 10,000+ research papers. Benchmarked retrieval latency to under 120ms using HNSW indexing.
2. Real-Time Object Detection Pipeline: Developed lightweight YOLOv8 edge inference server with WebSockets streaming annotated bounding boxes at 30 FPS.
3. Open Source Contributor: Added batch processing PR to an active ML evaluation harness.`,
    career_aspirations: 'Machine Learning Infrastructure & AI Platform Engineering Intern',
  },
  {
    id: 'student-marcus',
    student_name: 'Marcus Vance',
    student_degree_and_year: 'B.S. in Software Engineering, Junior 3rd Year',
    core_languages: 'TypeScript, JavaScript (ES6+), Python, HTML5/CSS3',
    frameworks_and_tools: 'React 19, Next.js 15 (App Router), Tailwind CSS, Node.js, Express, Jest, Zustand',
    database_skills: 'MongoDB (Mongoose schemas, aggregation pipelines), Supabase / PostgreSQL',
    student_projects_and_code_experience: `1. Collaborative Code Snippet SaaS: Full-stack Next.js web app with live Markdown preview, syntax highlighting, and server actions. Implemented optimistic UI updates and GitHub OAuth.
2. University Hackathon Submission Portal: Built Node.js/Express API with file uploads to AWS S3, rate-limiting using express-rate-limit, and Mongo aggregation queries.`,
    career_aspirations: 'Full-Stack Software Engineering or Product Engineering Internships',
  },
  {
    id: 'student-elena',
    student_name: 'Elena Rostova',
    student_degree_and_year: 'B.S. in Computer Engineering & Systems, 3rd Year',
    core_languages: 'C (C11), C++20, Rust, x86-64 Assembly, Bash',
    frameworks_and_tools: 'Linux POSIX APIs, GDB, Valgrind, Make/CMake, perf, Git',
    database_skills: 'SQLite (C bindings, WAL mode exploration), Key-Value LSM-Tree implementation',
    student_projects_and_code_experience: `1. User-Space Memory Allocator: Re-implemented malloc/free with segregated free lists, boundary tags, and 85%+ memory utilization efficiency under randomized heap benchmarks.
2. Toy Raft Consensus Engine: Wrote leader election and log replication module in C++ using zero-mq sockets, verifying partition tolerance through network fault injection scripts.`,
    career_aspirations: 'Systems Software, Cloud Infrastructure, and Core Database Engine Internships',
  },
];

export const SAMPLE_INTERNSHIPS: InternshipPosting[] = [
  {
    id: 'job-stripe-backend',
    job_title: 'Software Engineering Intern - Core Backend & Payments Platform',
    company_name: 'Stripe',
    industry_domain: 'FinTech / High-Reliability Distributed Infrastructure',
    location: 'San Francisco, CA / Seattle, WA (Hybrid)',
    stipend: '$58/hr + Housing Stipend',
    required_qualifications: `Solid programming proficiency in Java, Go, C++, or Python.
Deep understanding of core computer science fundamentals: Object-Oriented Design, Data Structures (Hash Tables, Heaps, B-Trees, Balanced BSTs), Algorithms (Time/Space Complexity, Dynamic Programming).
Familiarity with relational database design, SQL querying, transactional semantics (ACID), and schema migrations.
Demonstrated ability to build, test, and debug multi-tiered backend services or HTTP/gRPC APIs.`,
    preferred_qualifications: `Experience with distributed caching patterns (Redis, Memcached), event-driven messaging (Kafka, RabbitMQ), or asynchronous task queues.
Understanding of API idempotency mechanisms, exponential backoff retries, and distributed transaction pitfalls (2PC, Saga).
Experience with Docker, Kubernetes, or CI/CD pipelines.`,
    job_responsibilities: `Design, build, and deploy high-throughput, low-latency microservices that power mission-critical financial ledger and payment reconciliation operations.
Write automated unit and integration tests with high code coverage to maintain 99.999% platform availability.
Collaborate with staff engineers to resolve architectural bottlenecks, reduce p99 latency, and harden security posture.`,
  },
  {
    id: 'job-snowflake-infra',
    job_title: 'Distributed Systems & Database Engine Intern',
    company_name: 'Snowflake',
    industry_domain: 'Cloud Data Platforms & Distributed Storage',
    location: 'San Mateo, CA / Bellevue, WA',
    stipend: '$62/hr + Housing',
    required_qualifications: `Strong foundation in C++, Go, or Rust with deep knowledge of memory management, pointers, and concurrency primitives (mutexes, atomics, condition variables).
Core CS courses: Operating Systems (virtual memory, page tables, system calls), Computer Architecture, and Algorithms.
Familiarity with file systems, I/O caching, and networking sockets.`,
    preferred_qualifications: `Hands-on experience with distributed consensus algorithms (Raft, Paxos), LSM-trees, B+ Trees, or columnar storage formats (Parquet, Arrow).
Experience profiling CPU bottlenecks and cache misses using Linux perf or Valgrind.`,
    job_responsibilities: `Implement low-level storage and query execution engine features for petabyte-scale cloud data warehouses.
Optimize vector execution kernels and memory allocators to maximize multi-core hardware throughput.`,
  },
  {
    id: 'job-datadog-fullstack',
    job_title: 'Software Engineering Intern - Full-Stack Observability',
    company_name: 'Datadog',
    industry_domain: 'Cloud Observability, DevOps & APM',
    location: 'New York, NY / Boston, MA',
    stipend: '$55/hr + Relocation',
    required_qualifications: `Proficiency in modern TypeScript/JavaScript and at least one backend language (Python, Go, or Java).
Hands-on experience with modern frontend frameworks (React, Next.js) and state management.
Strong knowledge of REST APIs, WebSockets, relational/NoSQL databases, and HTTP fundamentals.`,
    preferred_qualifications: `Familiarity with telemetry standards (OpenTelemetry), real-time data streaming, or large-scale charting/dashboarding (Canvas, WebGL, D3).
Understanding of micro-frontend architectures, performance profiling, and web vitals optimization.`,
    job_responsibilities: `Ship intuitive, high-performance UI workflows backed by resilient distributed services for tracking metrics, traces, and logs.
Build responsive visualization components capable of rendering millions of telemetry datapoints smoothly.`,
  },
  {
    id: 'job-uber-mlops',
    job_title: 'AI/ML Platform Engineering Intern',
    company_name: 'Uber',
    industry_domain: 'Autonomous Mobility & Real-Time ML Platforms',
    location: 'San Francisco, CA / Sunnyvale, CA',
    stipend: '$60/hr + Housing',
    required_qualifications: `Strong Python programming skills and comfort with Linux/UNIX environments.
Knowledge of ML frameworks (PyTorch, TensorFlow) and foundational ML algorithms.
Solid understanding of algorithms, complexity analysis, and database design.`,
    preferred_qualifications: `Experience with vector databases (pgvector, Milvus), distributed training, Ray, Triton Inference Server, or Docker/Kubernetes.
Hands-on experience deploying LLM pipelines, prompt evaluation harnesses, or feature stores.`,
    job_responsibilities: `Build scalable data ingestion and model serving infrastructure that powers dynamic pricing, routing, and fraud detection algorithms.
Optimize inference latency and batch throughput across GPU/CPU clusters.`,
  },
];
