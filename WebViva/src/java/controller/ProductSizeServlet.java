package controller;

import model.ProductSize;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Query;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/product-sizes/*")
public class ProductSizeServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Extract product ID from path info (e.g., "/product-sizes/5")
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                response.setStatus(400);
                out.print("{\"error\":\"Product ID is required\"}");
                return;
            }
            
            String productIdStr = pathInfo.substring(1); // Remove leading slash
            Long productId = Long.parseLong(productIdStr);
            
            Session session = HibernateUtil.getSessionFactory().openSession();
            
            try {
                // Get all sizes for the product with stock > 0
                Query query = session.createQuery(
                    "FROM ProductSize ps WHERE ps.productId = :productId AND ps.stockQuantity > 0 " +
                    "ORDER BY FIELD(ps.size, 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')"
                );
                query.setParameter("productId", productId);
                
                @SuppressWarnings("unchecked")
                List<ProductSize> sizes = query.list();
                
                // Build JSON response
                out.print("[");
                for (int i = 0; i < sizes.size(); i++) {
                    ProductSize size = sizes.get(i);
                    if (i > 0) out.print(",");
                    out.print("{");
                    out.print("\"id\":" + size.getId() + ",");
                    out.print("\"size\":\"" + escapeJson(size.getSize()) + "\",");
                    out.print("\"stockQuantity\":" + size.getStockQuantity() + ",");
                    out.print("\"additionalPrice\":" + size.getAdditionalPrice() + ",");
                    out.print("\"inStock\":" + size.isInStock());
                    out.print("}");
                }
                out.print("]");
                
            } finally {
                session.close();
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(400);
            out.print("{\"error\":\"Invalid product ID\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"Failed to fetch product sizes: " + e.getMessage() + "\"}");
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
