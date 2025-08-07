package controller;

import model.User;
import util.HibernateUtil;
import org.hibernate.Session;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/user-profile")
public class UserProfileServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
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
                    out.print("{\"success\":false,\"message\":\"Invalid user ID\"}");
                    return;
                }
            }
            
            if (userId == null) {
                response.setStatus(400);
                out.print("{\"success\":false,\"message\":\"Invalid user ID\"}");
                return;
            }
            
            System.out.println("UserProfileServlet - Fetching user data for userId: " + userId);
            
            // Fetch user data from database
            Session session = HibernateUtil.getSessionFactory().openSession();
            try {
                User user = (User) session.get(User.class, userId);
                
                System.out.println("UserProfileServlet - User found: " + (user != null));
                if (user != null) {
                    System.out.println("UserProfileServlet - User firstName: " + user.getFirstName());
                    System.out.println("UserProfileServlet - User email: " + user.getEmail());
                }
                
                if (user == null) {
                    response.setStatus(404);
                    out.print("{\"success\":false,\"message\":\"User not found\"}");
                    return;
                }
                
                // Return actual user profile data from database
                out.print("{");
                out.print("\"success\":true,");
                out.print("\"data\":{");
                out.print("\"firstName\":\"" + escapeJson(user.getFirstName() != null ? user.getFirstName() : "") + "\",");
                out.print("\"lastName\":\"" + escapeJson(user.getLastName() != null ? user.getLastName() : "") + "\",");
                out.print("\"email\":\"" + escapeJson(user.getEmail() != null ? user.getEmail() : "") + "\",");
                out.print("\"phone\":\"" + escapeJson(user.getPhone() != null ? user.getPhone() : "") + "\",");
                out.print("\"address\":\"" + escapeJson(user.getAddress() != null ? user.getAddress() : "") + "\",");
                out.print("\"city\":\"" + escapeJson(user.getCity() != null ? user.getCity() : "") + "\",");
                out.print("\"postalCode\":\"" + escapeJson(user.getPostalCode() != null ? user.getPostalCode() : "") + "\",");
                out.print("\"country\":\"" + escapeJson(user.getCountry() != null ? user.getCountry() : "") + "\"");
                out.print("}");
                out.print("}");
                
            } finally {
                session.close();
            }
            
        } catch (Exception e) {
            response.setStatus(500);
            out.print("{");
            out.print("\"success\":false,");
            out.print("\"message\":\"Failed to fetch user profile\"");
            out.print("}");
        }
        
        out.flush();
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
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
                    out.print("{\"success\":false,\"message\":\"Invalid user ID\"}");
                    return;
                }
            }
            
            if (userId == null) {
                response.setStatus(400);
                out.print("{\"success\":false,\"message\":\"Invalid user ID\"}");
                return;
            }
            
            // Read request body
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            // Parse JSON manually (since we don't have Gson)
            String jsonData = sb.toString();
            
            // Update user data in database
            Session session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            
            try {
                User user = (User) session.get(User.class, userId);
                
                if (user == null) {
                    response.setStatus(404);
                    out.print("{\"success\":false,\"message\":\"User not found\"}");
                    return;
                }
                
                // Simple JSON parsing for the fields we need
                // In production, use a proper JSON library
                if (jsonData.contains("\"firstName\"")) {
                    String firstName = extractJsonValue(jsonData, "firstName");
                    if (firstName != null) user.setFirstName(firstName);
                }
                if (jsonData.contains("\"lastName\"")) {
                    String lastName = extractJsonValue(jsonData, "lastName");
                    if (lastName != null) user.setLastName(lastName);
                }
                if (jsonData.contains("\"phone\"")) {
                    String phone = extractJsonValue(jsonData, "phone");
                    if (phone != null) user.setPhone(phone);
                }
                if (jsonData.contains("\"address\"")) {
                    String address = extractJsonValue(jsonData, "address");
                    if (address != null) user.setAddress(address);
                }
                if (jsonData.contains("\"city\"")) {
                    String city = extractJsonValue(jsonData, "city");
                    if (city != null) user.setCity(city);
                }
                if (jsonData.contains("\"postalCode\"")) {
                    String postalCode = extractJsonValue(jsonData, "postalCode");
                    if (postalCode != null) user.setPostalCode(postalCode);
                }
                if (jsonData.contains("\"country\"")) {
                    String country = extractJsonValue(jsonData, "country");
                    if (country != null) user.setCountry(country);
                }
                
                session.update(user);
                session.getTransaction().commit();
                
                out.print("{\"success\":true,\"message\":\"Profile updated successfully\"}");
                
            } catch (Exception e) {
                session.getTransaction().rollback();
                response.setStatus(500);
                out.print("{\"success\":false,\"message\":\"Failed to update profile\"}");
            } finally {
                session.close();
            }
            
        } catch (Exception e) {
            response.setStatus(500);
            out.print("{");
            out.print("\"success\":false,");
            out.print("\"message\":\"Failed to update user profile\"");
            out.print("}");
        }
        
        out.flush();
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
    
    private String extractJsonValue(String json, String key) {
        try {
            String searchKey = "\"" + key + "\":\"";
            int startIndex = json.indexOf(searchKey);
            if (startIndex == -1) return null;
            
            startIndex += searchKey.length();
            int endIndex = json.indexOf("\"", startIndex);
            if (endIndex == -1) return null;
            
            return json.substring(startIndex, endIndex);
        } catch (Exception e) {
            return null;
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}