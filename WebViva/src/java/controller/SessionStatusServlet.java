package controller;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/session-status")
public class SessionStatusServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            HttpSession session = request.getSession(false);
            
            if (session != null && session.getAttribute("userId") != null) {
                // Safely get session attributes with proper type handling
                Object userIdObj = session.getAttribute("userId");
                Object userNameObj = session.getAttribute("userName");
                Object userEmailObj = session.getAttribute("userEmail");
                Object userRoleObj = session.getAttribute("userRole");
                
                // Convert userId safely
                Integer userId = null;
                if (userIdObj instanceof Integer) {
                    userId = (Integer) userIdObj;
                } else if (userIdObj instanceof Long) {
                    userId = ((Long) userIdObj).intValue();
                } else if (userIdObj instanceof String) {
                    try {
                        userId = Integer.parseInt((String) userIdObj);
                    } catch (NumberFormatException e) {
                        userId = 0;
                    }
                } else {
                    userId = 0;
                }
                
                // Handle string attributes safely
                String userName = userNameObj != null ? userNameObj.toString() : "";
                String userEmail = userEmailObj != null ? userEmailObj.toString() : "";
                String userRole = userRoleObj != null ? userRoleObj.toString() : "USER";
                
                // Return in the expected format
                out.print("{");
                out.print("\"success\":true,");
                out.print("\"data\":{");
                out.print("\"authenticated\":true,");
                out.print("\"userId\":" + userId + ",");
                out.print("\"userName\":\"" + escapeJson(userName) + "\",");
                out.print("\"userEmail\":\"" + escapeJson(userEmail) + "\",");
                out.print("\"userRole\":\"" + escapeJson(userRole) + "\"");
                out.print("}");
                out.print("}");
            } else {
                // No session or not logged in
                out.print("{\"success\":true,\"data\":{\"authenticated\":false}}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Return proper error format without nested success/error
            response.setStatus(200); // Don't return 500, return 200 with error info
            out.print("{\"success\":false,\"data\":{\"authenticated\":false,\"error\":\"" + escapeJson(e.getMessage()) + "\"}}");
        }
        
        out.flush();
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
