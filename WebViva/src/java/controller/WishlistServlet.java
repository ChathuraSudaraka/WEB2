package controller;

import model.Wishlist;
import model.Product;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Query;
import org.hibernate.Transaction;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/wishlist")
public class WishlistServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get user ID from session
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.setStatus(401);
                out.print("{\"error\":\"User not logged in\"}");
                return;
            }
            
            Long userId = (Long) session.getAttribute("userId");
            
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            
            try {
                // Get user's wishlist with product details
                Query query = hibernateSession.createQuery(
                    "SELECT w, p FROM Wishlist w JOIN Product p ON w.productId = p.id " +
                    "WHERE w.userId = :userId AND p.isActive = true " +
                    "ORDER BY w.addedAt DESC"
                );
                query.setParameter("userId", userId);
                
                @SuppressWarnings("unchecked")
                List<Object[]> results = query.list();
                
                // Build JSON response
                out.print("[");
                for (int i = 0; i < results.size(); i++) {
                    Object[] result = results.get(i);
                    Wishlist wishlistItem = (Wishlist) result[0];
                    Product product = (Product) result[1];
                    
                    if (i > 0) out.print(",");
                    out.print("{");
                    out.print("\"id\":" + wishlistItem.getId() + ",");
                    out.print("\"productId\":" + product.getId() + ",");
                    out.print("\"name\":\"" + escapeJson(product.getName()) + "\",");
                    out.print("\"price\":" + product.getPrice() + ",");
                    out.print("\"discountPrice\":" + (product.getDiscountPrice() != null ? product.getDiscountPrice() : "null") + ",");
                    out.print("\"imageUrl\":\"" + escapeJson(product.getImageUrl()) + "\",");
                    out.print("\"color\":\"" + escapeJson(product.getColor()) + "\",");
                    out.print("\"gender\":\"" + escapeJson(product.getGender()) + "\",");
                    out.print("\"addedAt\":\"" + wishlistItem.getAddedAt() + "\"");
                    out.print("}");
                }
                out.print("]");
                
            } finally {
                hibernateSession.close();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"Failed to fetch wishlist: " + e.getMessage() + "\"}");
        } finally {
            out.flush();
            out.close();
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get user ID from session
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.setStatus(401);
                out.print("{\"error\":\"User not logged in\"}");
                return;
            }
            
            Long userId = (Long) session.getAttribute("userId");
            String productIdStr = request.getParameter("productId");
            
            if (productIdStr == null || productIdStr.isEmpty()) {
                response.setStatus(400);
                out.print("{\"error\":\"Product ID is required\"}");
                return;
            }
            
            Long productId = Long.parseLong(productIdStr);
            
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Transaction transaction = null;
            
            try {
                transaction = hibernateSession.beginTransaction();
                
                // Check if item already exists in wishlist
                Query checkQuery = hibernateSession.createQuery(
                    "FROM Wishlist WHERE userId = :userId AND productId = :productId"
                );
                checkQuery.setParameter("userId", userId);
                checkQuery.setParameter("productId", productId);
                
                if (!checkQuery.list().isEmpty()) {
                    response.setStatus(409);
                    out.print("{\"error\":\"Product already in wishlist\"}");
                    return;
                }
                
                // Add to wishlist
                Wishlist wishlistItem = new Wishlist(userId, productId);
                hibernateSession.save(wishlistItem);
                
                transaction.commit();
                
                out.print("{\"success\":true,\"message\":\"Product added to wishlist\"}");
                
            } catch (Exception e) {
                if (transaction != null) transaction.rollback();
                throw e;
            } finally {
                hibernateSession.close();
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(400);
            out.print("{\"error\":\"Invalid product ID\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"Failed to add to wishlist: " + e.getMessage() + "\"}");
        } finally {
            out.flush();
            out.close();
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get user ID from session
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.setStatus(401);
                out.print("{\"error\":\"User not logged in\"}");
                return;
            }
            
            Long userId = (Long) session.getAttribute("userId");
            String wishlistIdStr = request.getParameter("id");
            
            if (wishlistIdStr == null || wishlistIdStr.isEmpty()) {
                response.setStatus(400);
                out.print("{\"error\":\"Wishlist item ID is required\"}");
                return;
            }
            
            Long wishlistId = Long.parseLong(wishlistIdStr);
            
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Transaction transaction = null;
            
            try {
                transaction = hibernateSession.beginTransaction();
                
                // Remove from wishlist (ensure it belongs to the user)
                Query deleteQuery = hibernateSession.createQuery(
                    "DELETE FROM Wishlist WHERE id = :wishlistId AND userId = :userId"
                );
                deleteQuery.setParameter("wishlistId", wishlistId);
                deleteQuery.setParameter("userId", userId);
                
                int deletedCount = deleteQuery.executeUpdate();
                
                if (deletedCount == 0) {
                    response.setStatus(404);
                    out.print("{\"error\":\"Wishlist item not found\"}");
                    return;
                }
                
                transaction.commit();
                
                out.print("{\"success\":true,\"message\":\"Product removed from wishlist\"}");
                
            } catch (Exception e) {
                if (transaction != null) transaction.rollback();
                throw e;
            } finally {
                hibernateSession.close();
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(400);
            out.print("{\"error\":\"Invalid wishlist item ID\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"Failed to remove from wishlist: " + e.getMessage() + "\"}");
        } finally {
            out.flush();
            out.close();
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
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
