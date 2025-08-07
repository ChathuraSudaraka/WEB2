package controller;

import model.User;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Query;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/login")
public class AuthLoginServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            String email = request.getParameter("email");
            String password = request.getParameter("password");

            // Validate input parameters
            if (email == null || email.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"error\":\"Email is required\"");
                out.print("}");
                return;
            }

            if (password == null || password.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"error\":\"Password is required\"");
                out.print("}");
                return;
            }

            email = email.trim();

            Session session = HibernateUtil.getSessionFactory().openSession();
            try {
                // First check if user exists with this email
                Query userExistsQuery = session.createQuery("FROM User WHERE email = :email");
                userExistsQuery.setParameter("email", email);
                User existingUser = (User) userExistsQuery.uniqueResult();

                if (existingUser == null) {
                    response.setStatus(401);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"error\":\"No account found with this email address\"");
                    out.print("}");
                    return;
                }

                if (!existingUser.getIsActive()) {
                    response.setStatus(401);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"error\":\"Your account has been deactivated. Please contact support.\"");
                    out.print("}");
                    return;
                }

                // Now check password
                Query query = session.createQuery("FROM User WHERE email = :email AND password = :password AND isActive = true");
                query.setParameter("email", email);
                query.setParameter("password", password);
                User user = (User) query.uniqueResult();

                if (user != null) {
                    HttpSession httpSession = request.getSession();
                    httpSession.setAttribute("userId", user.getId());
                    httpSession.setAttribute("userName", user.getName());
                    httpSession.setAttribute("userRole", user.getRole()); // Store role (USER, ADMIN)
                    httpSession.setAttribute("userEmail", user.getEmail());
                    
                    // Return success JSON response
                    out.print("{");
                    out.print("\"success\":true,");
                    out.print("\"message\":\"Login successful\",");
                    out.print("\"user\":{");
                    out.print("\"id\":" + user.getId() + ",");
                    out.print("\"name\":\"" + escapeJson(user.getName()) + "\",");
                    out.print("\"email\":\"" + escapeJson(user.getEmail()) + "\",");
                    out.print("\"role\":\"" + escapeJson(user.getRole()) + "\"");
                    out.print("},");
                    out.print("\"token\":\"session_" + httpSession.getId() + "\""); // Simple session token
                    out.print("}");
                    
                } else {
                    // User exists but password is wrong
                    response.setStatus(401);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"error\":\"Incorrect password\"");
                    out.print("}");
                }
            } finally {
                session.close();
            }
            
        } catch (Exception e) {
            response.setStatus(500);
            out.print("{");
            out.print("\"success\":false,");
            out.print("\"error\":\"Login failed: " + escapeJson(e.getMessage()) + "\"");
            out.print("}");
        } finally {
            out.flush();
        }
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
