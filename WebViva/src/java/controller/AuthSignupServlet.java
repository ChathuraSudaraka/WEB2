package controller;

import model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

@WebServlet("/signup")
public class AuthSignupServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String username = request.getParameter("username");
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String phone = request.getParameter("phone");
            String address = request.getParameter("address");
            String city = request.getParameter("city");
            String postalCode = request.getParameter("postalCode");
            String country = request.getParameter("country");

            // Basic validation
            if (firstName == null || firstName.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"First name is required\"}");
                return;
            }
            
            if (lastName == null || lastName.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Last name is required\"}");
                return;
            }
            
            if (username == null || username.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Username is required\"}");
                return;
            }
            
            if (email == null || email.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Email is required\"}");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Password is required\"}");
                return;
            }

            // Trim inputs
            firstName = firstName.trim();
            lastName = lastName.trim();
            username = username.trim();
            email = email.trim();

            // Email validation
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Please enter a valid email address\"}");
                return;
            }

            // Password validation
            if (password.length() < 6) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Password must be at least 6 characters long\"}");
                return;
            }

            // Username validation
            if (username.length() < 3) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Username must be at least 3 characters long\"}");
                return;
            }

            Session session = HibernateUtil.getSessionFactory().openSession();
            Transaction tx = null;
            try {
                tx = session.beginTransaction();
                
                // Check if username already exists
                Long usernameCount = (Long) session.createQuery("SELECT COUNT(*) FROM User WHERE username = :username")
                        .setParameter("username", username)
                        .uniqueResult();
                
                if (usernameCount > 0) {
                    response.setStatus(400);
                    out.print("{\"success\":false,\"error\":\"Username is already taken\"}");
                    return;
                }
                
                // Check if email already exists
                Long emailCount = (Long) session.createQuery("SELECT COUNT(*) FROM User WHERE email = :email")
                        .setParameter("email", email)
                        .uniqueResult();
                
                if (emailCount > 0) {
                    response.setStatus(400);
                    out.print("{\"success\":false,\"error\":\"An account with this email already exists\"}");
                    return;
                }

                // Create new user
                User user = new User();
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setUsername(username);
                user.setEmail(email);
                user.setPassword(password); // In production, hash the password!
                user.setPhone(phone);
                user.setAddress(address);
                user.setCity(city);
                user.setPostalCode(postalCode);
                user.setCountry(country);
                user.setRole("USER"); // Default role for all new users
                user.setCreatedAt(new Date());
                user.setUpdatedAt(new Date());
                user.setIsActive(true);

                session.save(user);
                tx.commit();
                
                // Return success response
                out.print("{");
                out.print("\"success\":true,");
                out.print("\"message\":\"Account created successfully\",");
                out.print("\"user\":{");
                out.print("\"id\":" + user.getId() + ",");
                out.print("\"firstName\":\"" + escapeJson(user.getFirstName()) + "\",");
                out.print("\"lastName\":\"" + escapeJson(user.getLastName()) + "\",");
                out.print("\"username\":\"" + escapeJson(user.getUsername()) + "\",");
                out.print("\"email\":\"" + escapeJson(user.getEmail()) + "\",");
                out.print("\"role\":\"" + escapeJson(user.getRole()) + "\"");
                out.print("}");
                out.print("}");
                
            } catch (Exception e) {
                if (tx != null) tx.rollback();
                e.printStackTrace();
                response.setStatus(500);
                out.print("{\"success\":false,\"error\":\"Failed to create account. Please try again.\"}");
            } finally {
                session.close();
            }
            
        } catch (Exception e) {
            response.setStatus(500);
            out.print("{\"success\":false,\"error\":\"Server error: " + escapeJson(e.getMessage()) + "\"}");
        } finally {
            out.flush();
        }
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
