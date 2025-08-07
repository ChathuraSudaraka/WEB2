package controller;

import model.User;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/update-password")
public class UpdatePasswordServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(200);
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Check if user is authenticated
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null || httpSession.getAttribute("userId") == null) {
                response.setStatus(401);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"message\":\"User not authenticated\"");
                out.print("}");
                return;
            }
            
            // Get userId from session
            Object userIdObj = httpSession.getAttribute("userId");
            Long userId = null;
            
            if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            } else if (userIdObj instanceof String) {
                try {
                    userId = Long.parseLong((String) userIdObj);
                } catch (NumberFormatException e) {
                    response.setStatus(400);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"message\":\"Invalid user session\"");
                    out.print("}");
                    return;
                }
            } else {
                response.setStatus(400);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"message\":\"Invalid user session\"");
                out.print("}");
                return;
            }
            
            // Get request parameters
            String currentPassword = request.getParameter("currentPassword");
            String newPassword = request.getParameter("newPassword");
            
            System.out.println("Password update request for userId: " + userId);
            
            // Validate input
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"message\":\"Current password is required\"");
                out.print("}");
                return;
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.setStatus(400);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"message\":\"New password is required\"");
                out.print("}");
                return;
            }
            
            // Validate new password strength
            if (newPassword.length() < 8) {
                response.setStatus(400);
                out.print("{");
                out.print("\"success\":false,");
                out.print("\"message\":\"New password must be at least 8 characters long\"");
                out.print("}");
                return;
            }
            
            // Fetch user data from database (following UserProfileServlet pattern)
            Session session = HibernateUtil.getSessionFactory().openSession();
            try {
                // Get user from database first
                User user = (User) session.get(User.class, userId);
                
                System.out.println("UpdatePasswordServlet - User found: " + (user != null));
                if (user != null) {
                    System.out.println("UpdatePasswordServlet - User email: " + user.getEmail());
                }
                
                if (user == null) {
                    response.setStatus(404);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"message\":\"User not found\"");
                    out.print("}");
                    return;
                }
                
                // Verify current password (plain text comparison to match existing system)
                if (!currentPassword.equals(user.getPassword())) {
                    response.setStatus(400);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"message\":\"Current password is incorrect\"");
                    out.print("}");
                    return;
                }
                
                session.close(); // Close the read session
                
                // Now open a new session with transaction for the update
                Session updateSession = null;
                Transaction transaction = null;
                try {
                    updateSession = HibernateUtil.getSessionFactory().openSession();
                    transaction = updateSession.beginTransaction();
                    
                    // Get user again in the update session
                    User updateUser = (User) updateSession.get(User.class, userId);
                    if (updateUser != null) {
                        // Update password (plain text to match existing system)
                        updateUser.setPassword(newPassword);
                        updateSession.update(updateUser);
                        
                        transaction.commit();
                        System.out.println("Password updated successfully for userId: " + userId);
                        
                        // Return success response
                        out.print("{");
                        out.print("\"success\":true,");
                        out.print("\"message\":\"Password updated successfully\"");
                        out.print("}");
                    } else {
                        response.setStatus(404);
                        out.print("{");
                        out.print("\"success\":false,");
                        out.print("\"message\":\"User not found during update\"");
                        out.print("}");
                    }
                    
                } catch (Exception e) {
                    if (transaction != null) {
                        transaction.rollback();
                    }
                    System.err.println("Error updating password: " + e.getMessage());
                    e.printStackTrace();
                    
                    response.setStatus(500);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"message\":\"Internal server error occurred while updating password\"");
                    out.print("}");
                } finally {
                    if (updateSession != null) {
                        updateSession.close();
                    }
                }
                
            } finally {
                if (session != null && session.isOpen()) {
                    session.close();
                }
            }
            
        } catch (Exception e) {
            System.err.println("Unexpected error in password update: " + e.getMessage());
            e.printStackTrace();
            
            response.setStatus(500);
            out.print("{");
            out.print("\"success\":false,");
            out.print("\"message\":\"An unexpected error occurred\"");
            out.print("}");
        }
    }
}
