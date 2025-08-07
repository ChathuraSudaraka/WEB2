package controller;

import model.Category;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Query;
import org.hibernate.Transaction;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/categories")
public class CategoryServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            Session session = HibernateUtil.getSessionFactory().openSession();
            
            // Get all active categories
            String genderFilter = request.getParameter("gender");
            
            StringBuilder hql = new StringBuilder("FROM Category c WHERE c.isActive = true");
            if (genderFilter != null && !genderFilter.isEmpty()) {
                hql.append(" AND (c.gender = :gender OR c.gender = 'UNISEX' OR c.gender IS NULL)");
            }
            hql.append(" ORDER BY c.gender, c.name");
            
            Query query = session.createQuery(hql.toString());
            if (genderFilter != null && !genderFilter.isEmpty()) {
                query.setParameter("gender", genderFilter);
            }
            
            List<Category> categories = query.list();
            
            // Build JSON response
            StringBuilder json = new StringBuilder();
            json.append("[");
            
            for (int i = 0; i < categories.size(); i++) {
                Category category = categories.get(i);
                json.append("{");
                json.append("\"id\":").append(category.getId()).append(",");
                json.append("\"name\":\"").append(escapeJson(category.getName())).append("\",");
                json.append("\"description\":\"").append(escapeJson(category.getDescription())).append("\",");
                json.append("\"icon\":\"").append(escapeJson(category.getIcon())).append("\",");
                json.append("\"gender\":\"").append(escapeJson(category.getGender())).append("\",");
                json.append("\"isActive\":").append(category.getIsActive());
                json.append("}");
                
                if (i < categories.size() - 1) {
                    json.append(",");
                }
            }
            
            json.append("]");
            
            session.close();
            
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(json.toString());
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Failed to fetch categories: " + e.getMessage() + "\"}");
        } finally {
            out.flush();
            out.close();
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
