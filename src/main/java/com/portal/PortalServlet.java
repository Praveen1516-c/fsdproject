
package com.portal;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@WebServlet("/api/portal")
public class PortalServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final Gson gson = new Gson();

    private static final String DB_URL = getEnv(
            "DB_URL",
            "jdbc:mysql://localhost:3306/career_portal_db"
                    + "?useSSL=false&serverTimezone=UTC"
                    + "&allowPublicKeyRetrieval=true"
    );

    private static final String DB_USER = getEnv("DB_USER", "root");

    // Set DB_PASSWORD in Tomcat's environment.
    // Do not use a fake password as a fallback.
    private static final String DB_PASSWORD =
            getEnv("DB_PASSWORD", "");

    private static final String GEMINI_API_KEY =
            getEnv("GEMINI_API_KEY", "");

    private static String getEnv(String name, String defaultValue) {
        String value = System.getenv(name);

        if (value == null || value.isBlank()) {
            return defaultValue;
        }

        return value;
    }

    @Override
    public void init() throws ServletException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new ServletException(
                    "MySQL JDBC driver is missing. Check pom.xml.", e
            );
        }
    }

    private Connection getConnection() throws SQLException {
        if (DB_PASSWORD.isBlank()) {
            throw new SQLException(
                    "DB_PASSWORD is not configured in the Tomcat process."
            );
        }

        return DriverManager.getConnection(
                DB_URL, DB_USER, DB_PASSWORD
        );
    }

    // --------------------------------------------------
    // HTTP AND JSON HELPERS
    // --------------------------------------------------

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS"
        );
        resp.setHeader(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization"
        );
    }

    private void sendJson(
            HttpServletResponse resp,
            int status,
            Object data
    ) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");

        try (PrintWriter out = resp.getWriter()) {
            out.print(gson.toJson(data));
        }
    }

    private JsonObject readJson(HttpServletRequest req)
            throws IOException {

        StringBuilder body = new StringBuilder();

        try (BufferedReader reader = req.getReader()) {
            String line;

            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
        }

        if (body.toString().isBlank()) {
            return new JsonObject();
        }

        JsonElement element = JsonParser.parseString(body.toString());

        if (!element.isJsonObject()) {
            throw new IllegalArgumentException(
                    "Request body must be a JSON object."
            );
        }

        return element.getAsJsonObject();
    }

    private String field(JsonObject obj, String key) {
        if (obj == null || !obj.has(key)
                || obj.get(key).isJsonNull()) {
            return "";
        }

        JsonElement value = obj.get(key);

        if (value.isJsonPrimitive()) {
            return value.getAsString();
        }

        return value.toString();
    }

    private int intField(JsonObject obj, String key, int defaultValue) {
        try {
            String value = field(obj, key);

            if (value.isBlank()) {
                return defaultValue;
            }

            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private JsonObject error(String message) {
        JsonObject result = new JsonObject();
        result.addProperty("success", false);
        result.addProperty("error", message);
        return result;
    }

    private void sendServerError(
            HttpServletResponse resp,
            Exception e
    ) throws IOException {

        // Full details go to Tomcat's log, not the browser.
        getServletContext().log("Portal API error", e);

        JsonObject result = error(
                "The request could not be completed. Check the server logs."
        );

        sendJson(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                result);
    }

    private HttpSession getSession(HttpServletRequest req) {
        return req.getSession(false);
    }

    private Integer getUserId(HttpServletRequest req) {
        HttpSession session = getSession(req);

        if (session == null) {
            return null;
        }

        Object value = session.getAttribute("user_id");

        return value instanceof Integer ? (Integer) value : null;
    }

    private String getSessionRole(HttpServletRequest req) {
        HttpSession session = getSession(req);

        if (session == null) {
            return "";
        }

        Object role = session.getAttribute("role");

        return role == null ? "" : role.toString();
    }

    private JsonObject sessionUser(HttpSession session) {
        JsonObject result = new JsonObject();

        result.addProperty("authenticated", true);
        result.addProperty("id",
                (Integer) session.getAttribute("user_id"));
        result.addProperty("full_name",
                stringAttribute(session, "full_name"));
        result.addProperty("email",
                stringAttribute(session, "email"));
        result.addProperty("role",
                stringAttribute(session, "role"));
        result.addProperty("degree_or_company",
                stringAttribute(session, "degree_or_company"));
        result.addProperty("skills",
                stringAttribute(session, "skills"));
        result.addProperty("projects",
                stringAttribute(session, "projects"));

        return result;
    }

    private String stringAttribute(HttpSession session, String key) {
        Object value = session.getAttribute(key);
        return value == null ? "" : value.toString();
    }

    @Override
    protected void doOptions(
            HttpServletRequest req,
            HttpServletResponse resp
    ) {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    // --------------------------------------------------
    // GET: PING, SESSION, INTERNSHIPS, APPLICATIONS, HISTORY
    // --------------------------------------------------

    @Override
    protected void doGet(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws ServletException, IOException {

        setCorsHeaders(resp);

        String action = req.getParameter("action");

        if (action == null) {
            action = "";
        }

        try {
            switch (action.toLowerCase(Locale.ROOT)) {

                case "ping": {
                    JsonObject result = new JsonObject();
                    result.addProperty("status", "ok");

                    try (Connection conn = getConnection()) {
                        if (conn.isValid(3)) {
                            result.addProperty("db", "connected");
                        } else {
                            result.addProperty("db", "offline");
                        }
                    } catch (SQLException e) {
                        result.addProperty("db", "offline");
                        getServletContext().log(
                                "Database connection failed", e
                        );
                    }

                    sendJson(resp, HttpServletResponse.SC_OK, result);
                    break;
                }

                case "session": {
                    HttpSession session = getSession(req);

                    if (session != null
                            && session.getAttribute("user_id") != null) {

                        sendJson(resp, HttpServletResponse.SC_OK,
                                sessionUser(session));
                    } else {
                        JsonObject result = new JsonObject();
                        result.addProperty("authenticated", false);

                        sendJson(resp, HttpServletResponse.SC_OK,
                                result);
                    }

                    break;
                }

                case "internships": {
                    JsonArray internships = new JsonArray();

                    String sql =
                            "SELECT id, role_title, company_name, location, "
                                    + "stipend, required_skills, preferred_skills "
                                    + "FROM internships ORDER BY id DESC";

                    try (Connection conn = getConnection();
                         Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery(sql)) {

                        while (rs.next()) {
                            JsonObject item = new JsonObject();

                            item.addProperty("id", rs.getInt("id"));
                            item.addProperty("role_title",
                                    rs.getString("role_title"));
                            item.addProperty("company_name",
                                    rs.getString("company_name"));
                            item.addProperty("location",
                                    rs.getString("location"));
                            item.addProperty("stipend",
                                    rs.getString("stipend"));
                            item.addProperty("required_skills",
                                    rs.getString("required_skills"));
                            item.addProperty("preferred_skills",
                                    rs.getString("preferred_skills"));

                            internships.add(item);
                        }
                    }

                    sendJson(resp, HttpServletResponse.SC_OK,
                            internships);
                    break;
                }

                case "applications": {
                    Integer userId = getUserId(req);
                    String role = getSessionRole(req);

                    if (userId == null) {
                        sendJson(resp,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                error("Please log in to view applications."));
                        break;
                    }

                    boolean recruiter =
                            "Recruiter".equalsIgnoreCase(role);

                    String sql = recruiter
                            ? "SELECT id, user_id, student_name, "
                              + "internship_id, role_title, company_name, "
                              + "match_score, status, applied_at "
                              + "FROM applications ORDER BY id DESC"
                            : "SELECT id, user_id, student_name, "
                              + "internship_id, role_title, company_name, "
                              + "match_score, status, applied_at "
                              + "FROM applications WHERE user_id = ? "
                              + "ORDER BY id DESC";

                    JsonArray applications = new JsonArray();

                    try (Connection conn = getConnection();
                         PreparedStatement ps =
                                 conn.prepareStatement(sql)) {

                        if (!recruiter) {
                            ps.setInt(1, userId);
                        }

                        try (ResultSet rs = ps.executeQuery()) {
                            while (rs.next()) {
                                JsonObject item = new JsonObject();

                                item.addProperty("id", rs.getInt("id"));
                                item.addProperty("user_id",
                                        rs.getInt("user_id"));
                                item.addProperty("student_name",
                                        rs.getString("student_name"));
                                item.addProperty("internship_id",
                                        rs.getInt("internship_id"));
                                item.addProperty("role_title",
                                        rs.getString("role_title"));
                                item.addProperty("company_name",
                                        rs.getString("company_name"));
                                item.addProperty("match_score",
                                        rs.getInt("match_score"));
                                item.addProperty("status",
                                        rs.getString("status"));

                                java.sql.Timestamp timestamp =
                                        rs.getTimestamp("applied_at");

                                item.addProperty("applied_at",
                                        timestamp == null
                                                ? "" : timestamp.toString());

                                applications.add(item);
                            }
                        }
                    }

                    sendJson(resp, HttpServletResponse.SC_OK,
                            applications);
                    break;
                }

                case "history": {
                    Integer userId = getUserId(req);

                    if (userId == null) {
                        sendJson(resp,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                error("Please log in to view evaluation history."));
                        break;
                    }

                    JsonArray history = new JsonArray();

                    String sql =
                            "SELECT id, user_id, student_name, role_title, "
                                    + "company_name, match_score, fit_status, "
                                    + "result_json, created_at FROM evaluations "
                                    + "WHERE user_id = ? ORDER BY id DESC";

                    try (Connection conn = getConnection();
                         PreparedStatement ps =
                                 conn.prepareStatement(sql)) {

                        ps.setInt(1, userId);

                        try (ResultSet rs = ps.executeQuery()) {
                            while (rs.next()) {
                                JsonObject item = new JsonObject();

                                item.addProperty("id", rs.getInt("id"));
                                item.addProperty("user_id",
                                        rs.getInt("user_id"));
                                item.addProperty("student_name",
                                        rs.getString("student_name"));
                                item.addProperty("role_title",
                                        rs.getString("role_title"));
                                item.addProperty("company_name",
                                        rs.getString("company_name"));
                                item.addProperty("match_score",
                                        rs.getInt("match_score"));
                                item.addProperty("fit_status",
                                        rs.getString("fit_status"));

                                String json =
                                        rs.getString("result_json");

                                try {
                                    item.add("result_json",
                                            JsonParser.parseString(json));
                                } catch (Exception ex) {
                                    item.addProperty("result_json",
                                            json == null ? "{}" : json);
                                }

                                java.sql.Timestamp timestamp =
                                        rs.getTimestamp("created_at");

                                item.addProperty("created_at",
                                        timestamp == null
                                                ? "" : timestamp.toString());

                                history.add(item);
                            }
                        }
                    }

                    sendJson(resp, HttpServletResponse.SC_OK, history);
                    break;
                }

                default:
                    sendJson(resp,
                            HttpServletResponse.SC_BAD_REQUEST,
                            error("Unknown GET action."));
            }
        } catch (Exception e) {
            sendServerError(resp, e);
        }
    }

    // --------------------------------------------------
    // POST: LOGIN, REGISTER, LOGOUT, INTERNSHIPS,
    // APPLY, STATUS UPDATE, AI EVALUATION
    // --------------------------------------------------

    @Override
    protected void doPost(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws ServletException, IOException {

        setCorsHeaders(resp);

        String action = req.getParameter("action");

        if (action == null) {
            action = "";
        }

        JsonObject body;

        try {
            body = readJson(req);
        } catch (Exception e) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Invalid JSON request body."));
            return;
        }

        try {
            switch (action.toLowerCase(Locale.ROOT)) {

                case "login":
                    login(req, resp, body);
                    break;

                case "register":
                    register(req, resp, body);
                    break;

                case "logout": {
                    HttpSession session = getSession(req);

                    if (session != null) {
                        session.invalidate();
                    }

                    JsonObject result = new JsonObject();
                    result.addProperty("success", true);

                    sendJson(resp, HttpServletResponse.SC_OK, result);
                    break;
                }

                case "addinternship":
                    addInternship(req, resp, body);
                    break;

                case "apply":
                    applyForInternship(req, resp, body);
                    break;

                case "updateapplicationstatus":
                    updateApplicationStatus(req, resp, body);
                    break;

                case "analyze":
                    analyze(req, resp, body);
                    break;

                default:
                    sendJson(resp,
                            HttpServletResponse.SC_BAD_REQUEST,
                            error("Invalid POST action."));
            }
        } catch (Exception e) {
            sendServerError(resp, e);
        }
    }

    private void login(
            HttpServletRequest req,
            HttpServletResponse resp,
            JsonObject body
    ) throws IOException, SQLException {

        String email = field(body, "email").trim();
        String password = field(body, "password");

        if (email.isBlank() || password.isBlank()) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Email and password are required."));
            return;
        }

        String sql =
                "SELECT id, full_name, email, password, role, "
                        + "degree_or_company, skills, projects "
                        + "FROM users WHERE email = ?";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()
                        || !password.equals(rs.getString("password"))) {

                    sendJson(resp,
                            HttpServletResponse.SC_UNAUTHORIZED,
                            error("Invalid email or password."));
                    return;
                }

                HttpSession oldSession = getSession(req);

                if (oldSession != null) {
                    oldSession.invalidate();
                }

                HttpSession session = req.getSession(true);

                session.setAttribute("user_id", rs.getInt("id"));
                session.setAttribute("full_name",
                        rs.getString("full_name"));
                session.setAttribute("email",
                        rs.getString("email"));
                session.setAttribute("role",
                        rs.getString("role"));
                session.setAttribute("degree_or_company",
                        rs.getString("degree_or_company"));
                session.setAttribute("skills",
                        rs.getString("skills"));
                session.setAttribute("projects",
                        rs.getString("projects"));

                sendJson(resp, HttpServletResponse.SC_OK,
                        sessionUser(session));
            }
        }
    }

    private void register(
            HttpServletRequest req,
            HttpServletResponse resp,
            JsonObject body
    ) throws IOException, SQLException {

        String fullName = field(body, "full_name").trim();
        String email = field(body, "email").trim();
        String password = field(body, "password");
        String role = field(body, "role");
        String degree = field(body, "degree_or_company");
        String skills = field(body, "skills");
        String projects = field(body, "projects");

        if (fullName.isBlank() || email.isBlank()
                || password.isBlank()) {

            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Name, email and password are required."));
            return;
        }

        if (password.length() < 8) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Password must contain at least 8 characters."));
            return;
        }

        if (role.isBlank()) {
            role = "Student";
        }

        if (!role.equalsIgnoreCase("Student")
                && !role.equalsIgnoreCase("Recruiter")) {

            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Role must be Student or Recruiter."));
            return;
        }

        String sql =
                "INSERT INTO users (full_name, email, password, role, "
                        + "degree_or_company, skills, projects) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?)";

        int userId;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, fullName);
            ps.setString(2, email);
            ps.setString(3, password);
            ps.setString(4, role);
            ps.setString(5, degree);
            ps.setString(6, skills);
            ps.setString(7, projects);

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new SQLException(
                            "Database did not return the new user ID."
                    );
                }

                userId = keys.getInt(1);
            }
        } catch (SQLException e) {
            if ("23000".equals(e.getSQLState())) {
                sendJson(resp,
                        HttpServletResponse.SC_CONFLICT,
                        error("This email may already be registered."));
                return;
            }

            throw e;
        }

        HttpSession oldSession = getSession(req);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession session = req.getSession(true);

        session.setAttribute("user_id", userId);
        session.setAttribute("full_name", fullName);
        session.setAttribute("email", email);
        session.setAttribute("role", role);
        session.setAttribute("degree_or_company", degree);
        session.setAttribute("skills", skills);
        session.setAttribute("projects", projects);

        sendJson(resp, HttpServletResponse.SC_CREATED,
                sessionUser(session));
    }

    private void addInternship(
            HttpServletRequest req,
            HttpServletResponse resp,
            JsonObject body
    ) throws IOException, SQLException {

        if (getUserId(req) == null
                || !"Recruiter".equalsIgnoreCase(getSessionRole(req))) {

            sendJson(resp, HttpServletResponse.SC_FORBIDDEN,
                    error("Only logged-in recruiters can post internships."));
            return;
        }

        String roleTitle = field(body, "role_title").trim();
        String companyName = field(body, "company_name").trim();
        String location = field(body, "location").trim();
        String stipend = field(body, "stipend").trim();
        String requiredSkills = field(body, "required_skills");
        String preferredSkills = field(body, "preferred_skills");

        if (roleTitle.isBlank() || companyName.isBlank()) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Role title and company name are required."));
            return;
        }

        String sql =
                "INSERT INTO internships (role_title, company_name, "
                        + "location, stipend, required_skills, preferred_skills) "
                        + "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, roleTitle);
            ps.setString(2, companyName);
            ps.setString(3, location.isBlank() ? "Remote" : location);
            ps.setString(4, stipend.isBlank() ? "Unspecified" : stipend);
            ps.setString(5, requiredSkills);
            ps.setString(6, preferredSkills);

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                JsonObject result = new JsonObject();
                result.addProperty("success", true);

                if (keys.next()) {
                    result.addProperty("id", keys.getInt(1));
                }

                sendJson(resp, HttpServletResponse.SC_CREATED, result);
            }
        }
    }

    private void applyForInternship(
            HttpServletRequest req,
            HttpServletResponse resp,
            JsonObject body
    ) throws IOException, SQLException {

        Integer userId = getUserId(req);

        if (userId == null) {
            sendJson(resp, HttpServletResponse.SC_UNAUTHORIZED,
                    error("Please log in before applying."));
            return;
        }

        int internshipId = intField(body, "internship_id", 0);
        int matchScore = intField(body, "match_score", 0);

        if (internshipId <= 0 || matchScore < 0 || matchScore > 100) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Provide a valid internship ID and match score."));
            return;
        }

        String studentName = "";
        HttpSession session = getSession(req);

        if (session != null) {
            studentName = stringAttribute(session, "full_name");
        }

        String roleTitle;
        String companyName;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT role_title, company_name FROM internships "
                             + "WHERE id = ?")) {

            ps.setInt(1, internshipId);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    sendJson(resp, HttpServletResponse.SC_NOT_FOUND,
                            error("Internship not found."));
                    return;
                }

                roleTitle = rs.getString("role_title");
                companyName = rs.getString("company_name");
            }
        }

        String sql =
                "INSERT INTO applications (user_id, student_name, "
                        + "internship_id, role_title, company_name, match_score, "
                        + "status) VALUES (?, ?, ?, ?, ?, ?, 'Applied')";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, userId);
            ps.setString(2, studentName);
            ps.setInt(3, internshipId);
            ps.setString(4, roleTitle);
            ps.setString(5, companyName);
            ps.setInt(6, matchScore);

            ps.executeUpdate();

            JsonObject result = new JsonObject();
            result.addProperty("success", true);
            result.addProperty("internship_id", internshipId);
            result.addProperty("role_title", roleTitle);
            result.addProperty("company_name", companyName);
            result.addProperty("status", "Applied");

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    result.addProperty("id", keys.getInt(1));
                }
            }

            sendJson(resp, HttpServletResponse.SC_CREATED, result);
        }
    }

    private void updateApplicationStatus(
            HttpServletRequest req,
            HttpServletResponse resp,
            JsonObject body
    ) throws IOException, SQLException {

        if (getUserId(req) == null
                || !"Recruiter".equalsIgnoreCase(getSessionRole(req))) {

            sendJson(resp, HttpServletResponse.SC_FORBIDDEN,
                    error("Only logged-in recruiters can update applications."));
            return;
        }

        int id = intField(body, "id", 0);
        String status = field(body, "status").trim();

        Set<String> allowed = Set.of(
                "Applied", "Under Review", "Shortlisted",
                "Interview", "Accepted", "Rejected"
        );

        if (id <= 0 || !allowed.contains(status)) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Invalid application ID or status."));
            return;
        }

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "UPDATE applications SET status = ? WHERE id = ?")) {

            ps.setString(1, status);
            ps.setInt(2, id);

            int changed = ps.executeUpdate();

            if (changed == 0) {
                sendJson(resp, HttpServletResponse.SC_NOT_FOUND,
                        error("Application not found."));
                return;
            }
        }

        JsonObject result = new JsonObject();
        result.addProperty("success", true);
        result.addProperty("id", id);
        result.addProperty("status", status);

        sendJson(resp, HttpServletResponse.SC_OK, result);
    }

    // --------------------------------------------------
    // AI EVALUATION
    // --------------------------------------------------

    private void analyze(
            HttpServletRequest req,
            HttpServletResponse resp,
            JsonObject body
    ) throws IOException, SQLException {

        Integer userId = getUserId(req);

        if (userId == null) {
            sendJson(resp, HttpServletResponse.SC_UNAUTHORIZED,
                    error("Please log in before evaluating a profile."));
            return;
        }

        String studentName = field(body, "student_name");
        String degree = field(body, "degree");
        String skills = field(body, "skills");
        String projects = field(body, "projects");
        String roleTitle = field(body, "role_title");
        String companyName = field(body, "company_name");
        String requirements = field(body, "requirements");

        JsonObject analysis = createEvaluation(
                studentName, degree, skills, projects,
                roleTitle, companyName, requirements
        );

        int matchScore = analysis.get("match_percentage").getAsInt();
        String fitStatus = analysis.get("fit_status").getAsString();

        String sql =
                "INSERT INTO evaluations (user_id, student_name, "
                        + "role_title, company_name, match_score, fit_status, "
                        + "result_json) VALUES (?, ?, ?, ?, ?, ?, ?)";

        int evaluationId;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, userId);
            ps.setString(2, studentName);
            ps.setString(3, roleTitle);
            ps.setString(4, companyName);
            ps.setInt(5, matchScore);
            ps.setString(6, fitStatus);
            ps.setString(7, gson.toJson(analysis));

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new SQLException(
                            "Evaluation ID was not generated."
                    );
                }

                evaluationId = keys.getInt(1);
            }
        }

        JsonObject result = new JsonObject();
        result.addProperty("success", true);
        result.addProperty("id", evaluationId);
        result.addProperty("match_score", matchScore);
        result.addProperty("fit_status", fitStatus);
        result.add("result", analysis);

        sendJson(resp, HttpServletResponse.SC_OK, result);
    }

    private JsonObject createEvaluation(
            String studentName,
            String degree,
            String skills,
            String projects,
            String roleTitle,
            String companyName,
            String requirements
    ) {
        Set<String> studentSkills = splitSkills(skills);
        Set<String> requiredSkills = splitSkills(requirements);

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String required : requiredSkills) {
            boolean found = false;

            for (String student : studentSkills) {
                if (student.contains(required)
                        || required.contains(student)) {
                    found = true;
                    break;
                }
            }

            if (found) {
                matched.add(capitalize(required));
            } else {
                missing.add(capitalize(required));
            }
        }

        int score;

        if (requiredSkills.isEmpty()) {
            score = 78;
        } else {
            score = (int) Math.round(
                    100.0 * matched.size() / requiredSkills.size()
            );
        }

        String fitStatus = score >= 75
                ? "Strong Fit"
                : score >= 50
                  ? "Moderate Fit"
                  : "Needs Upskilling";

        JsonObject result = new JsonObject();

        result.addProperty("match_percentage", score);
        result.addProperty("fit_status", fitStatus);

        result.addProperty(
                "executive_summary",
                studentName + " has a calculated skills match of "
                        + score + "% for " + roleTitle + " at " + companyName
                        + ". Review the skill gaps and project experience "
                        + "before making a hiring decision."
        );

        result.addProperty("degree", degree);
        result.addProperty("projects", projects);

        JsonArray matchedJson = new JsonArray();

        for (String skill : matched) {
            matchedJson.add(skill);
        }

        result.add("matched_skills", matchedJson);

        JsonArray gapsJson = new JsonArray();

        for (String skill : missing) {
            JsonObject gap = new JsonObject();

            gap.addProperty("skill", skill);
            gap.addProperty("priority", "High");
            gap.addProperty(
                    "mini_project",
                    "Build a practical project demonstrating " + skill
                            + " and document the implementation."
            );

            gapsJson.add(gap);
        }

        result.add("skill_gaps", gapsJson);

        JsonArray atsBullets = new JsonArray();

        atsBullets.add(
                "Developed software features using the listed technical skills."
        );
        atsBullets.add(
                "Applied programming and database concepts in project work."
        );
        atsBullets.add(
                "Documented implementation, testing and project outcomes."
        );

        result.add("ats_star_bullets", atsBullets);

        JsonArray interviewTopics = new JsonArray();

        interviewTopics.add("Data structures and algorithms");
        interviewTopics.add("Object-oriented programming");
        interviewTopics.add("SQL and relational database fundamentals");
        interviewTopics.add("Projects and role-specific technical skills");

        result.add("interview_topics", interviewTopics);

        result.addProperty(
                "evaluation_method",
                "Rule-based skill matching; not an external AI assessment."
        );

        return result;
    }

    private Set<String> splitSkills(String value) {
        Set<String> skills = new HashSet<>();

        if (value == null || value.isBlank()) {
            return skills;
        }

        for (String skill : value.split("[,;\\n]+")) {
            String cleaned = skill.trim().toLowerCase(Locale.ROOT);

            if (!cleaned.isEmpty()) {
                skills.add(cleaned);
            }
        }

        return skills;
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.substring(0, 1).toUpperCase(Locale.ROOT)
                + value.substring(1);
    }

    // --------------------------------------------------
    // DELETE: INTERNSHIP OR EVALUATION
    // --------------------------------------------------

    @Override
    protected void doDelete(
            HttpServletRequest req,
            HttpServletResponse resp
    ) throws ServletException, IOException {

        setCorsHeaders(resp);

        Integer userId = getUserId(req);

        if (userId == null
                || !"Recruiter".equalsIgnoreCase(getSessionRole(req))) {

            sendJson(resp, HttpServletResponse.SC_FORBIDDEN,
                    error("Only logged-in recruiters can delete records."));
            return;
        }

        String idValue = req.getParameter("id");
        String action = req.getParameter("action");
        String type = req.getParameter("type");

        int id;

        try {
            id = Integer.parseInt(idValue);
        } catch (Exception e) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Provide a valid record ID."));
            return;
        }

        if (id <= 0) {
            sendJson(resp, HttpServletResponse.SC_BAD_REQUEST,
                    error("Record ID must be positive."));
            return;
        }

        boolean internship =
                "deleteInternship".equalsIgnoreCase(action)
                        || "internship".equalsIgnoreCase(type);

        String table = internship ? "internships" : "evaluations";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "DELETE FROM " + table + " WHERE id = ?")) {

            ps.setInt(1, id);

            int deleted = ps.executeUpdate();

            if (deleted == 0) {
                sendJson(resp, HttpServletResponse.SC_NOT_FOUND,
                        error("Record not found."));
                return;
            }
        } catch (SQLException e) {
            // For example, an internship may still have applications
            // referencing it through a foreign key.
            sendServerError(resp, e);
            return;
        }

        JsonObject result = new JsonObject();
        result.addProperty("success", true);
        result.addProperty("deletedId", id);
        result.addProperty(
                "type", internship ? "internship" : "evaluation"
        );

        sendJson(resp, HttpServletResponse.SC_OK, result);
    }
}
