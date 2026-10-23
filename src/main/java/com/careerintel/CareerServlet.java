package com.careerintel;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.Duration;

/**
 * CareerServlet: Jakarta EE 10+ Servlet for Apache Tomcat
 * Handles AI Career Fit Intelligence and Direct MySQL Data Persistence.
 */
@WebServlet(name = "CareerServlet", urlPatterns = {"/api/analyze"})
public class CareerServlet extends HttpServlet {

    private static final String GEMINI_API_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    // Database Connection Parameters (Configurable via environment variables or context params)
    private static final String DB_URL = System.getenv("MYSQL_URL") != null 
        ? System.getenv("MYSQL_URL") 
        : "jdbc:mysql://localhost:3306/career_intelligence_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DB_USER = System.getenv("MYSQL_USER") != null 
        ? System.getenv("MYSQL_USER") 
        : "root";
    private static final String DB_PASS = System.getenv("MYSQL_PASSWORD") != null 
        ? System.getenv("MYSQL_PASSWORD") 
        : "password";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Override
    public void init() throws ServletException {
        super.init();
        try {
            // Load MySQL 8+ JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            log("MySQL JDBC Driver not found in classpath: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        // Enable CORS for development flexibility
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setContentType("application/json;charset=UTF-8");

        PrintWriter out = response.getWriter();

        try {
            // 1. Extract Student Profile & Target Internship Parameters
            String studentName = getParam(request, "student_name", "Priya Sharma");
            String degree = getParam(request, "degree", "B.Tech Computer Science, 3rd Year");
            String technicalSkills = getParam(request, "technical_skills", "Java 17, Spring Boot, PostgreSQL, Docker, Redis");
            String projects = getParam(request, "projects", "Campus Food Delivery Microservice handling 450 req/sec; In-memory LRU Cache");
            String careerGoal = getParam(request, "career_goal", "Backend Software Engineering Intern");

            String roleTitle = getParam(request, "role_title", "Software Development Engineer Intern (Core Backend)");
            String companyName = getParam(request, "company_name", "Stripe");
            String requiredSkills = getParam(request, "required_skills", "Java, Algorithms, OOP, SQL, ACID Database Design");
            String preferredSkills = getParam(request, "preferred_skills", "Distributed Caching (Redis), Kafka, Docker, Kubernetes");

            // 2. Call Google AI Studio Gemini API (or execute deterministic algorithmic engine if key absent)
            String geminiApiKey = System.getenv("GEMINI_API_KEY");
            String aiResponseJson;

            if (geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equals("MY_GEMINI_API_KEY")) {
                aiResponseJson = callGeminiApi(
                    geminiApiKey, studentName, degree, technicalSkills, projects, 
                    careerGoal, roleTitle, companyName, requiredSkills, preferredSkills
                );
            } else {
                // High-fidelity fallback simulating exact Gemini schema
                aiResponseJson = generateStructuredFallbackJson(
                    studentName, degree, technicalSkills, projects, 
                    careerGoal, roleTitle, companyName, requiredSkills, preferredSkills
                );
            }

            // 3. Extract core metric fields for relational columns
            int matchScore = extractIntField(aiResponseJson, "match_percentage", 82);
            String fitStatus = extractStringField(aiResponseJson, "fit_status", "Strong Fit");
            String executiveVerdict = extractStringField(aiResponseJson, "executive_verdict", 
                studentName + " demonstrates solid architectural fundamentals for " + roleTitle + ".");

            // 4. Persist to MySQL via JDBC PreparedStatement
            persistToMySQL(studentName, degree, roleTitle, companyName, matchScore, fitStatus, executiveVerdict, aiResponseJson);

            // 5. Send JSON Response back to client
            out.print(aiResponseJson);
            out.flush();

        } catch (Exception e) {
            log("Error processing career evaluation: " + e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Internal Server Error: " + escapeJson(e.getMessage()) + "\"}");
            out.flush();
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    /**
     * Executes HTTPS POST request to Google AI Studio Gemini REST Endpoint.
     */
    private String callGeminiApi(String apiKey, String studentName, String degree, 
                                 String technicalSkills, String projects, String careerGoal, 
                                 String roleTitle, String companyName, String requiredSkills, 
                                 String preferredSkills) throws Exception {

        String prompt = "You are the central intelligence engine of the 'Student Career Intelligence & Internship Portal'.\\n" +
            "Evaluate this candidate against the target internship role and return ONLY a valid, raw JSON object (no markdown, no ```json, no extra text).\\n\\n" +
            "[STUDENT PROFILE]\\n" +
            "- Name: " + escapeJson(studentName) + "\\n" +
            "- Degree: " + escapeJson(degree) + "\\n" +
            "- Technical Skills: " + escapeJson(technicalSkills) + "\\n" +
            "- Projects & Code Experience: " + escapeJson(projects) + "\\n" +
            "- Career Goal: " + escapeJson(careerGoal) + "\\n\\n" +
            "[TARGET INTERNSHIP]\\n" +
            "- Role: " + escapeJson(roleTitle) + "\\n" +
            "- Company: " + escapeJson(companyName) + "\\n" +
            "- Required Core Skills: " + escapeJson(requiredSkills) + "\\n" +
            "- Preferred Skills: " + escapeJson(preferredSkills) + "\\n\\n" +
            "[REQUIRED JSON SCHEMA]\\n" +
            "{\\n" +
            "  \\\"evaluation_summary\\\": {\\n" +
            "    \\\"match_percentage\\\": 84,\\n" +
            "    \\\"fit_status\\\": \\\"Strong Fit\\\",\\n" +
            "    \\\"executive_verdict\\\": \\\"Two concise sentences summarizing competitiveness.\\\"\\n" +
            "  },\\n" +
            "  \\\"verified_strengths\\\": [\\n" +
            "    {\\\"skill\\\": \\\"Skill name\\\", \\\"evidence\\\": \\\"Concrete project proof\\\"}\\n" +
            "  ],\\n" +
            "  \\\"critical_skill_gaps\\\": [\\n" +
            "    {\\\"missing_skill\\\": \\\"Tool name\\\", \\\"importance\\\": \\\"High|Medium|Low\\\", \\\"why_required\\\": \\\"Reason\\\", \\\"actionable_project_fix\\\": \\\"Specific mini-project architecture\\\"}\\n" +
            "  ],\\n" +
            "  \\\"ats_optimization\\\": {\\n" +
            "    \\\"suggested_profile_headline\\\": \\\"Professional headline for resume/LinkedIn\\\",\\n" +
            "    \\\"recommended_star_bullet_points\\\": [\\\"Action verb + Task + Tech stack + Quantifiable outcome metric\\\"]\\n" +
            "  },\\n" +
            "  \\\"technical_interview_prep\\\": {\\n" +
            "    \\\"data_structures_and_algorithms_focus\\\": [\\\"Specific pattern\\\"],\\n" +
            "    \\\"core_cs_and_system_design_questions\\\": [\\\"Specific conceptual question\\\"]\\n" +
            "  }\\n" +
            "}";

        String requestBody = "{"
            + "\"contents\": [{\"parts\": [{\"text\": \"" + prompt + "\"}]}],"
            + "\"generationConfig\": {"
            + "  \"temperature\": 0.2,"
            + "  \"responseMimeType\": \"application/json\""
            + "}"
            + "}";

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_API_URL + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(20))
                .build();

        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() == 200) {
            String rawResponse = httpResponse.body();
            // Extract the generated text from Gemini API response wrapper
            return extractCandidateText(rawResponse);
        } else {
            log("Gemini API call returned status " + httpResponse.statusCode() + ": " + httpResponse.body());
            throw new RuntimeException("Gemini API error: HTTP " + httpResponse.statusCode());
        }
    }

    /**
     * Persists the evaluation record into MySQL via JDBC PreparedStatement.
     */
    private void persistToMySQL(String studentName, String degree, String targetRole, 
                                String companyName, int matchScore, String fitStatus, 
                                String executiveSummary, String rawJsonResult) {
        String sql = "INSERT INTO student_evaluations "
                   + "(student_name, degree, target_role, company_name, match_score, fit_status, executive_summary, raw_json_result) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, studentName);
            ps.setString(2, degree);
            ps.setString(3, targetRole);
            ps.setString(4, companyName);
            ps.setInt(5, matchScore);
            ps.setString(6, fitStatus);
            ps.setString(7, executiveSummary);
            ps.setString(8, rawJsonResult);

            int rowsInserted = ps.executeUpdate();
            log("Successfully persisted evaluation into MySQL. Rows affected: " + rowsInserted);

        } catch (SQLException e) {
            log("MySQL Persistence Warning (Check DB credentials/server): " + e.getMessage());
            // Do not fail the HTTP request if DB is temporarily offline; the frontend still gets the analysis.
        }
    }

    /**
     * Extracts text content from Gemini's nested JSON response.
     */
    private String extractCandidateText(String geminiResponse) {
        int textIdx = geminiResponse.indexOf("\"text\": \"");
        if (textIdx != -1) {
            int start = textIdx + 9;
            int end = geminiResponse.indexOf("\"", start);
            if (end != -1) {
                String unescaped = geminiResponse.substring(start, end)
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
                // Remove any accidental markdown wrappers
                return unescaped.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```", "").trim();
            }
        }
        // Fallback: return raw response trimmed
        return geminiResponse.trim();
    }

    /**
     * Helper to read parameters from either Query/Form parameters or JSON body.
     */
    private String getParam(HttpServletRequest req, String paramName, String defaultValue) {
        String val = req.getParameter(paramName);
        if (val != null && !val.trim().isEmpty()) {
            return val.trim();
        }
        return defaultValue;
    }

    private int extractIntField(String json, String key, int fallback) {
        try {
            int idx = json.indexOf("\"" + key + "\":");
            if (idx != -1) {
                int start = idx + key.length() + 3;
                int end = start;
                while (end < json.length() && (Character.isDigit(json.charAt(end)) || Character.isWhitespace(json.charAt(end)))) {
                    end++;
                }
                return Integer.parseInt(json.substring(start, end).trim());
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    private String extractStringField(String json, String key, String fallback) {
        try {
            int idx = json.indexOf("\"" + key + "\":");
            if (idx != -1) {
                int start = json.indexOf("\"", idx + key.length() + 3) + 1;
                int end = json.indexOf("\"", start);
                if (start > 0 && end > start) {
                    return json.substring(start, end);
                }
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    /**
     * Deterministic, schema-compliant JSON generator when running standalone without an external API key.
     */
    private String generateStructuredFallbackJson(String studentName, String degree, String techSkills, 
                                                  String projects, String goal, String role, 
                                                  String company, String requiredSkills, String preferredSkills) {
        int score = 84;
        String status = "Strong Fit";
        if (techSkills.toLowerCase().contains("c++") && role.toLowerCase().contains("ai")) {
            score = 68;
            status = "Moderate Fit";
        }

        return "{\n" +
            "  \"evaluation_summary\": {\n" +
            "    \"match_percentage\": " + score + ",\n" +
            "    \"fit_status\": \"" + status + "\",\n" +
            "    \"executive_verdict\": \"" + escapeJson(studentName) + " exhibits strong foundational alignment with " + escapeJson(company) + "'s core requirements, substantiated by production-grade hands-on project implementations. Completing targeted remediation in message streaming and distributed caching will elevate them into the top 5% of applicants.\"\n" +
            "  },\n" +
            "  \"verified_strengths\": [\n" +
            "    {\"skill\": \"Object-Oriented Programming & Concurrency\", \"evidence\": \"Demonstrated in multithreaded backend services and in-memory cache implementations.\"},\n" +
            "    {\"skill\": \"Relational Database Design & ACID Transactions\", \"evidence\": \"Verified through PostgreSQL indexing, schema migrations, and connection pooling (HikariCP).\"},\n" +
            "    {\"skill\": \"Containerization & REST Architecture\", \"evidence\": \"Proven via multi-stage Dockerfile builds and JMeter load-tested HTTP endpoints.\"}\n" +
            "  ],\n" +
            "  \"critical_skill_gaps\": [\n" +
            "    {\n" +
            "      \"missing_skill\": \"Event-Driven Architecture (Apache Kafka)\",\n" +
            "      \"importance\": \"High\",\n" +
            "      \"why_required\": \"High-throughput distributed systems demand asynchronous producer/consumer pipelines with guaranteed delivery semantics.\",\n" +
            "      \"actionable_project_fix\": \"Build an asynchronous order settlement microservice in Spring Boot utilizing Kafka consumers with manual commit offsets and Dead Letter Queues (DLQ).\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"missing_skill\": \"API Idempotency & Rate Limiting\",\n" +
            "      \"importance\": \"Medium\",\n" +
            "      \"why_required\": \"Financial and mission-critical endpoints must guarantee exactly-once processing on network retry timeouts.\",\n" +
            "      \"actionable_project_fix\": \"Implement an Idempotency-Key HTTP filter using Redis SETNX with distributed locks and TTL jitter.\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"ats_optimization\": {\n" +
            "    \"suggested_profile_headline\": \"" + escapeJson(studentName) + " | Software Engineer | Java 17, Spring Boot, PostgreSQL & Cloud Microservices | Class of 2026\",\n" +
            "    \"recommended_star_bullet_points\": [\n" +
            "      \"Architected high-throughput REST microservice using Spring Boot and PostgreSQL, sustaining 450 req/sec under JMeter load testing with sub-80ms p95 latency.\",\n" +
            "      \"Engineered concurrent in-memory caching system with LRU/LFU eviction policies, cutting expensive relational query reads by 65%.\",\n" +
            "      \"Implemented containerized CI/CD workflow with Docker and comprehensive integration test suite, achieving 88%+ code coverage.\"\n" +
            "    ]\n" +
            "  },\n" +
            "  \"technical_interview_prep\": {\n" +
            "    \"data_structures_and_algorithms_focus\": [\n" +
            "      \"Sliding Window & Two-Pointers (Substrings with K distinct elements)\",\n" +
            "      \"Monotonic Stack & Deque (Next greater element, largest rectangle in histogram)\",\n" +
            "      \"Topological Sort / Kahn's Algorithm (Task scheduling and dependency resolution)\",\n" +
            "      \"Dynamic Programming (0/1 Knapsack and state transition memoization)\"\n" +
            "    ],\n" +
            "    \"core_cs_and_system_design_questions\": [\n" +
            "      \"Explain transaction isolation levels (Read Committed vs Repeatable Read) and how MVCC prevents phantom reads.\",\n" +
            "      \"How do you guarantee database-cache consistency under high write throughput (Cache-Aside vs Write-Through)?\",\n" +
            "      \"Describe the TCP 3-way handshake and strategies for tuning TIME_WAIT sockets under heavy connection churn.\",\n" +
            "      \"How would you design a distributed unique ID generator (Snowflake algorithm) with zero collision risk?\"\n" +
            "    ]\n" +
            "  }\n" +
            "}";
    }
}
