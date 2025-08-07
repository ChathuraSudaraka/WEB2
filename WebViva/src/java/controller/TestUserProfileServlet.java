package controller;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/test-user-profile")
public class TestUserProfileServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            HttpSession session = request.getSession(false);
            
            if (session != null && session.getAttribute("userId") != null) {
                // Get user data from session
                Object userIdObj = session.getAttribute("userId");
                Object userNameObj = session.getAttribute("userName");
                Object userEmailObj = session.getAttribute("userEmail");
                
                String userName = userNameObj != null ? userNameObj.toString() : "";
                String userEmail = userEmailObj != null ? userEmailObj.toString() : "";
                
                // Split name for firstName/lastName
                String firstName = "";
                String lastName = "";
                if (!userName.isEmpty()) {
                    String[] nameParts = userName.split(" ", 2);
                    firstName = nameParts[0];
                    if (nameParts.length > 1) {
                        lastName = nameParts[1];
                    }
                }
                
                // Return user profile data (from session + mock data)
                out.print("{");
                out.print("\"success\":true,");
                out.print("\"data\":{");
                out.print("\"firstName\":\"" + escapeJson(firstName) + "\",");
                out.print("\"lastName\":\"" + escapeJson(lastName) + "\",");
                out.print("\"email\":\"" + escapeJson(userEmail) + "\",");
                out.print("\"phone\":\"123-456-7890\",");
                out.print("\"address\":\"123 Main St\",");
                out.print("\"city\":\"New York\",");
                out.print("\"postalCode\":\"10001\",");
                out.print("\"country\":\"USA\"");
                out.print("}");
                out.print("}");
                
            } else {
                // No session or not logged in
                response.setStatus(401);
                out.print("{\"success\":false,\"message\":\"User not authenticated\"}");
            }
        } catch (Exception e) {
            response.setStatus(500);
            out.print("{\"success\":false,\"message\":\"Failed to fetch user profile\"}");
        }
        
        out.flush();
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
