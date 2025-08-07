package controller;

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
import java.io.IOException;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.math.BigDecimal;
import java.util.List;
import java.util.Date;

@WebServlet({"/products", "/products/*"})
public class ProductServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            System.out.println("ProductServlet doGet called");
            
            // Check if this is a request for a specific product (e.g., /products/5)
            String pathInfo = request.getPathInfo();
            String requestURI = request.getRequestURI();
            String servletPath = request.getServletPath();
            
            System.out.println("Path info: " + pathInfo);
            System.out.println("Request URI: " + requestURI);
            System.out.println("Servlet path: " + servletPath);
            System.out.println("Full URL: " + request.getRequestURL().toString());
            
            if (pathInfo != null && pathInfo.length() > 1) {
                // Handle single product request: /products/{id}
                handleSingleProductRequest(request, response, pathInfo, out);
            } else {
                // Handle list products request: /products
                handleProductListRequest(request, response, out);
            }
            
        } catch (Exception e) {
            System.err.println("Error in ProductServlet: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"Failed to fetch products: " + escapeJson(e.getMessage()) + "\"}");
        } finally {
            out.flush();
        }
    }
    
    private void handleSingleProductRequest(HttpServletRequest request, HttpServletResponse response, 
                                          String pathInfo, PrintWriter out) throws Exception {
        
        // Extract product ID from path info (e.g., "/5" -> "5")
        String productIdStr = pathInfo.substring(1); // Remove leading slash
        System.out.println("Fetching single product with ID: " + productIdStr);
        
        try {
            Long productId = Long.parseLong(productIdStr);
            
            Session session = HibernateUtil.getSessionFactory().openSession();
            try {
                Product product = (Product) session.get(Product.class, productId);
                
                if (product == null || !product.getIsActive()) {
                    response.setStatus(404);
                    out.print("{");
                    out.print("\"success\":false,");
                    out.print("\"error\":\"Product not found\"");
                    out.print("}");
                    return;
                }
                
                // Return single product as JSON wrapped in success response
                out.print("{");
                out.print("\"success\":true,");
                out.print("\"data\":{");
                out.print("\"id\":" + product.getId() + ",");
                out.print("\"name\":\"" + escapeJson(product.getName()) + "\",");
                out.print("\"description\":\"" + escapeJson(product.getDescription()) + "\",");
                out.print("\"longDescription\":\"" + escapeJson(product.getDescription() + " This is a detailed description of the product with premium quality and modern streetwear design.") + "\",");
                out.print("\"sku\":\"" + escapeJson(product.getSku()) + "\",");
                out.print("\"price\":" + product.getPrice() + ",");
                out.print("\"discountPrice\":" + (product.getDiscountPrice() != null ? product.getDiscountPrice() : "null") + ",");
                out.print("\"imageUrl\":\"" + escapeJson(product.getImageUrl()) + "\",");
                out.print("\"brand\":\"" + escapeJson(product.getBrand() != null ? product.getBrand() : "DYNEX") + "\",");
                out.print("\"stockQuantity\":" + product.getStockQuantity() + ",");
                out.print("\"inStock\":" + (product.getStockQuantity() > 0) + ",");
                out.print("\"categoryId\":" + (product.getCategoryId() != null ? product.getCategoryId() : "null") + ",");
                
                // Get category name from database or use default
                String categoryName = "Streetwear";
                if (product.getCategoryId() != null) {
                    try {
                        Query categoryQuery = session.createQuery("SELECT name FROM Category WHERE id = :id");
                        categoryQuery.setParameter("id", product.getCategoryId());
                        String dbCategoryName = (String) categoryQuery.uniqueResult();
                        if (dbCategoryName != null) {
                            categoryName = dbCategoryName;
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to fetch category name: " + e.getMessage());
                    }
                }
                out.print("\"category\":\"" + escapeJson(categoryName) + "\",");
                
                // DYNEX clothing-specific fields
                out.print("\"material\":\"" + escapeJson(product.getMaterial()) + "\",");
                out.print("\"color\":\"" + escapeJson(product.getColor()) + "\",");
                out.print("\"pattern\":\"" + escapeJson(product.getPattern()) + "\",");
                out.print("\"fitType\":\"" + escapeJson(product.getFitType()) + "\",");
                out.print("\"gender\":\"" + escapeJson(product.getGender()) + "\",");
                out.print("\"season\":\"" + escapeJson(product.getSeason()) + "\",");
                out.print("\"careInstructions\":\"" + escapeJson(product.getCareInstructions()) + "\",");
                
                out.print("\"isFeatured\":" + product.getIsFeatured() + ",");
                out.print("\"featured\":" + product.getIsFeatured() + ",");
                out.print("\"isActive\":" + product.getIsActive() + ",");
                out.print("\"rating\":4.5,"); // Default rating
                out.print("\"reviewCount\":42,"); // Default review count
                
                // Add available colors array - DYNEX streetwear colors
                out.print("\"colors\":[");
                if (product.getColor() != null && !product.getColor().trim().isEmpty()) {
                    String[] productColors = product.getColor().split(",");
                    for (int i = 0; i < productColors.length; i++) {
                        if (i > 0) out.print(",");
                        String color = productColors[i].trim();
                        out.print("{");
                        out.print("\"name\":\"" + escapeJson(color) + "\",");
                        
                        // Map color names to hex codes for better UI
                        String colorCode = getColorCode(color);
                        out.print("\"code\":\"" + colorCode + "\",");
                        out.print("\"available\":true");
                        out.print("}");
                    }
                } else {
                    // Default DYNEX colors with codes
                    out.print("{\"name\":\"Black\",\"code\":\"#000000\",\"available\":true},");
                    out.print("{\"name\":\"White\",\"code\":\"#FFFFFF\",\"available\":true},");
                    out.print("{\"name\":\"Gray\",\"code\":\"#808080\",\"available\":true}");
                }
                out.print("],");
                
                // Add available sizes array - DYNEX streetwear sizes
                out.print("\"sizes\":[");
                // Get sizes from database or use defaults based on category
                try {
                    Query sizeQuery = session.createQuery("SELECT size FROM ProductSize WHERE productId = :productId ORDER BY size");
                    sizeQuery.setParameter("productId", product.getId());
                    List<String> sizes = sizeQuery.list();
                    
                    if (sizes != null && !sizes.isEmpty()) {
                        for (int i = 0; i < sizes.size(); i++) {
                            if (i > 0) out.print(",");
                            out.print("\"" + escapeJson(sizes.get(i)) + "\"");
                        }
                    } else {
                        // Default sizes based on category/type
                        String categoryLower = categoryName.toLowerCase();
                        if (categoryLower.contains("hoodie") || categoryLower.contains("shirt") || categoryLower.contains("sweatshirt")) {
                            out.print("\"XS\",\"S\",\"M\",\"L\",\"XL\",\"XXL\"");
                        } else if (categoryLower.contains("pant") || categoryLower.contains("jean")) {
                            out.print("\"28\",\"30\",\"32\",\"34\",\"36\",\"38\"");
                        } else if (categoryLower.contains("cap") || categoryLower.contains("hat")) {
                            out.print("\"One Size\"");
                        } else {
                            out.print("\"S\",\"M\",\"L\",\"XL\"");
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to fetch product sizes: " + e.getMessage());
                    out.print("\"S\",\"M\",\"L\",\"XL\"");
                }
                out.print("],");
                
                // Add product images array
                out.print("\"images\":[");
                String baseImageUrl = product.getImageUrl() != null ? product.getImageUrl() : "https://picsum.photos/600/600?random=" + product.getId();
                for (int i = 0; i < 4; i++) {
                    if (i > 0) out.print(",");
                    out.print("\"" + baseImageUrl.replace("?random=" + product.getId(), "?random=" + (product.getId() + i)) + "\"");
                }
                out.print("],");
                
                // Add product features - DYNEX clothing focused
                out.print("\"features\":[");
                out.print("\"Premium " + escapeJson(product.getMaterial() != null ? product.getMaterial() : "Cotton") + " fabric\",");
                out.print("\"Comfortable " + escapeJson(product.getFitType() != null ? product.getFitType() : "Regular") + " fit\",");
                out.print("\"Easy care instructions\",");
                out.print("\"DYNEX quality guarantee\",");
                out.print("\"Free shipping on orders over $50\"");
                out.print("]");
                
                out.print("}"); // Close data object
                out.print("}"); // Close success wrapper
                
                System.out.println("Single product JSON response sent successfully for ID: " + productId);
                
            } finally {
                session.close();
            }
            
        } catch (NumberFormatException e) {
            response.setStatus(400);
            out.print("{\"error\":\"Invalid product ID\"}");
        }
    }
    
    private void handleProductListRequest(HttpServletRequest request, HttpServletResponse response, 
                                        PrintWriter out) throws Exception {
            
            String categoryId = request.getParameter("categoryId");
            String featured = request.getParameter("featured");
            String search = request.getParameter("search");
            String adminView = request.getParameter("admin");
            String brand = request.getParameter("brand");
            String minPrice = request.getParameter("minPrice");
            String maxPrice = request.getParameter("maxPrice");
            
            // DYNEX clothing-specific parameters
            String gender = request.getParameter("gender");
            String color = request.getParameter("color");
            String material = request.getParameter("material");
            String season = request.getParameter("season");
            
            System.out.println("Parameters - admin: " + adminView + ", search: " + search + ", brand: " + brand + 
                             ", gender: " + gender + ", color: " + color);

            Session session = HibernateUtil.getSessionFactory().openSession();
            System.out.println("Hibernate session created successfully");
            
            try {
                StringBuilder hql = new StringBuilder("FROM Product");
                
                // For admin view, show all products including inactive ones
                if (!"true".equals(adminView)) {
                    hql.append(" WHERE isActive = true");
                } else {
                    hql.append(" WHERE 1=1"); // Show all products for admin
                }
                
                if (categoryId != null && !categoryId.isEmpty()) {
                    hql.append(" AND categoryId = :categoryId");
                }
                
                if ("true".equals(featured)) {
                    hql.append(" AND isFeatured = true");
                }
                
                if (search != null && !search.isEmpty()) {
                    hql.append(" AND (name LIKE :search OR description LIKE :search OR sku LIKE :search)");
                }
                
                if (brand != null && !brand.isEmpty()) {
                    hql.append(" AND brand LIKE :brand");
                }
                
                if (minPrice != null && !minPrice.isEmpty()) {
                    hql.append(" AND price >= :minPrice");
                }
                
                if (maxPrice != null && !maxPrice.isEmpty()) {
                    hql.append(" AND price <= :maxPrice");
                }
                
                // DYNEX clothing filters
                if (gender != null && !gender.isEmpty()) {
                    hql.append(" AND (gender = :gender OR gender = 'UNISEX')");
                }
                
                if (color != null && !color.isEmpty()) {
                    hql.append(" AND color LIKE :color");
                }
                
                if (material != null && !material.isEmpty()) {
                    hql.append(" AND material LIKE :material");
                }
                
                if (season != null && !season.isEmpty()) {
                    hql.append(" AND (season = :season OR season = 'ALL_SEASON')");
                }
                
                hql.append(" ORDER BY createdAt DESC");
                
                System.out.println("HQL Query: " + hql.toString());
                
                Query query = session.createQuery(hql.toString());
                
                if (categoryId != null && !categoryId.isEmpty()) {
                    query.setParameter("categoryId", Long.valueOf(categoryId));
                }
                
                if (search != null && !search.isEmpty()) {
                    query.setParameter("search", "%" + search + "%");
                }
                
                if (brand != null && !brand.isEmpty()) {
                    query.setParameter("brand", "%" + brand + "%");
                }
                
                if (minPrice != null && !minPrice.isEmpty()) {
                    query.setParameter("minPrice", Double.valueOf(minPrice));
                }
                
                if (maxPrice != null && !maxPrice.isEmpty()) {
                    query.setParameter("maxPrice", Double.valueOf(maxPrice));
                }
                
                // DYNEX clothing parameter bindings
                if (gender != null && !gender.isEmpty()) {
                    query.setParameter("gender", gender);
                }
                
                if (color != null && !color.isEmpty()) {
                    query.setParameter("color", "%" + color + "%");
                }
                
                if (material != null && !material.isEmpty()) {
                    query.setParameter("material", "%" + material + "%");
                }
                
                if (season != null && !season.isEmpty()) {
                    query.setParameter("season", season);
                }
                
                @SuppressWarnings("unchecked")
                List<Product> products = query.list();
                
                System.out.println("Found " + products.size() + " products");
                
                // Simple JSON response (in a real app, use Jackson or Gson)
                out.print("[");
                for (int i = 0; i < products.size(); i++) {
                    Product p = products.get(i);
                    if (i > 0) out.print(",");
                    out.print("{");
                    out.print("\"id\":" + p.getId() + ",");
                    out.print("\"name\":\"" + escapeJson(p.getName()) + "\",");
                    out.print("\"description\":\"" + escapeJson(p.getDescription()) + "\",");
                    out.print("\"sku\":\"" + escapeJson(p.getSku()) + "\",");
                    out.print("\"price\":" + p.getPrice() + ",");
                    out.print("\"discountPrice\":" + (p.getDiscountPrice() != null ? p.getDiscountPrice() : "null") + ",");
                    out.print("\"imageUrl\":\"" + escapeJson(p.getImageUrl()) + "\",");
                    out.print("\"brand\":\"" + escapeJson(p.getBrand()) + "\",");
                    out.print("\"stockQuantity\":" + p.getStockQuantity() + ",");
                    out.print("\"categoryId\":" + (p.getCategoryId() != null ? p.getCategoryId() : "null") + ",");
                    
                    // DYNEX clothing-specific fields
                    out.print("\"material\":\"" + escapeJson(p.getMaterial()) + "\",");
                    out.print("\"color\":\"" + escapeJson(p.getColor()) + "\",");
                    out.print("\"pattern\":\"" + escapeJson(p.getPattern()) + "\",");
                    out.print("\"fitType\":\"" + escapeJson(p.getFitType()) + "\",");
                    out.print("\"gender\":\"" + escapeJson(p.getGender()) + "\",");
                    out.print("\"season\":\"" + escapeJson(p.getSeason()) + "\",");
                    out.print("\"careInstructions\":\"" + escapeJson(p.getCareInstructions()) + "\",");
                    
                    out.print("\"isFeatured\":" + p.getIsFeatured() + ",");
                    out.print("\"isActive\":" + p.getIsActive());
                    out.print("}");
                }
                out.print("]");
                
                System.out.println("JSON response sent successfully");
                
            } finally {
                session.close();
            }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // Read JSON data from request body
            StringBuilder jsonData = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonData.append(line);
            }
            
            // Parse JSON manually (in a real app, use Jackson or Gson)
            String json = jsonData.toString();
            
            Product product = new Product();
            product.setName(extractJsonValue(json, "name"));
            product.setDescription(extractJsonValue(json, "description"));
            product.setSku(extractJsonValue(json, "sku"));
            product.setBrand(extractJsonValue(json, "brand"));
            product.setImageUrl(extractJsonValue(json, "imageUrl"));
            
            // Parse numeric values
            String priceStr = extractJsonValue(json, "price");
            if (priceStr != null && !priceStr.isEmpty()) {
                product.setPrice(new BigDecimal(priceStr));
            }
            
            String discountPriceStr = extractJsonValue(json, "discountPrice");
            if (discountPriceStr != null && !discountPriceStr.isEmpty() && !"null".equals(discountPriceStr)) {
                product.setDiscountPrice(new BigDecimal(discountPriceStr));
            }
            
            String stockStr = extractJsonValue(json, "stockQuantity");
            if (stockStr != null && !stockStr.isEmpty()) {
                product.setStockQuantity(Integer.parseInt(stockStr));
            }
            
            String categoryIdStr = extractJsonValue(json, "categoryId");
            if (categoryIdStr != null && !categoryIdStr.isEmpty() && !"null".equals(categoryIdStr)) {
                product.setCategoryId(Long.parseLong(categoryIdStr));
            }
            
            String isFeaturedStr = extractJsonValue(json, "isFeatured");
            product.setIsFeatured("true".equals(isFeaturedStr));
            
            String isActiveStr = extractJsonValue(json, "isActive");
            product.setIsActive(isActiveStr == null || "true".equals(isActiveStr)); // Default to true
            
            product.setCreatedAt(new Date());
            product.setUpdatedAt(new Date());
            
            session.save(product);
            transaction.commit();
            
            // Return the created product
            out.print("{");
            out.print("\"success\":true,");
            out.print("\"message\":\"Product created successfully\",");
            out.print("\"product\":{");
            out.print("\"id\":" + product.getId() + ",");
            out.print("\"name\":\"" + escapeJson(product.getName()) + "\",");
            out.print("\"sku\":\"" + escapeJson(product.getSku()) + "\"");
            out.print("}");
            out.print("}");
            
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            response.setStatus(500);
            out.print("{\"success\":false,\"error\":\"Failed to create product: " + escapeJson(e.getMessage()) + "\"}");
        } finally {
            session.close();
            out.flush();
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // Get product ID from request parameter instead of path
            String productIdStr = request.getParameter("id");
            if (productIdStr == null || productIdStr.isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Product ID is required\"}");
                return;
            }
            
            Long productId = Long.parseLong(productIdStr);
            
            Product product = (Product) session.get(Product.class, productId);
            if (product == null) {
                response.setStatus(404);
                out.print("{\"success\":false,\"error\":\"Product not found\"}");
                return;
            }
            
            // Read JSON data from request body
            StringBuilder jsonData = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonData.append(line);
            }
            
            String json = jsonData.toString();
            
            // Update product fields
            String name = extractJsonValue(json, "name");
            if (name != null) product.setName(name);
            
            String description = extractJsonValue(json, "description");
            if (description != null) product.setDescription(description);
            
            String sku = extractJsonValue(json, "sku");
            if (sku != null) product.setSku(sku);
            
            String brand = extractJsonValue(json, "brand");
            if (brand != null) product.setBrand(brand);
            
            String imageUrl = extractJsonValue(json, "imageUrl");
            if (imageUrl != null) product.setImageUrl(imageUrl);
            
            String priceStr = extractJsonValue(json, "price");
            if (priceStr != null && !priceStr.isEmpty()) {
                product.setPrice(new BigDecimal(priceStr));
            }
            
            String discountPriceStr = extractJsonValue(json, "discountPrice");
            if (discountPriceStr != null) {
                if ("null".equals(discountPriceStr) || discountPriceStr.isEmpty()) {
                    product.setDiscountPrice(null);
                } else {
                    product.setDiscountPrice(new BigDecimal(discountPriceStr));
                }
            }
            
            String stockStr = extractJsonValue(json, "stockQuantity");
            if (stockStr != null && !stockStr.isEmpty()) {
                product.setStockQuantity(Integer.parseInt(stockStr));
            }
            
            String categoryIdStr = extractJsonValue(json, "categoryId");
            if (categoryIdStr != null) {
                if ("null".equals(categoryIdStr) || categoryIdStr.isEmpty()) {
                    product.setCategoryId(null);
                } else {
                    product.setCategoryId(Long.parseLong(categoryIdStr));
                }
            }
            
            String isFeaturedStr = extractJsonValue(json, "isFeatured");
            if (isFeaturedStr != null) {
                product.setIsFeatured("true".equals(isFeaturedStr));
            }
            
            String isActiveStr = extractJsonValue(json, "isActive");
            if (isActiveStr != null) {
                product.setIsActive("true".equals(isActiveStr));
            }
            
            product.setUpdatedAt(new Date());
            
            session.update(product);
            transaction.commit();
            
            out.print("{\"success\":true,\"message\":\"Product updated successfully\"}");
            
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            response.setStatus(500);
            out.print("{\"success\":false,\"error\":\"Failed to update product: " + escapeJson(e.getMessage()) + "\"}");
        } finally {
            session.close();
            out.flush();
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // Get product ID from request parameter instead of path
            String productIdStr = request.getParameter("id");
            if (productIdStr == null || productIdStr.isEmpty()) {
                response.setStatus(400);
                out.print("{\"success\":false,\"error\":\"Product ID is required\"}");
                return;
            }
            
            Long productId = Long.parseLong(productIdStr);
            
            Product product = (Product) session.get(Product.class, productId);
            if (product == null) {
                response.setStatus(404);
                out.print("{\"success\":false,\"error\":\"Product not found\"}");
                return;
            }
            
            // Soft delete - just mark as inactive instead of hard delete
            product.setIsActive(false);
            product.setUpdatedAt(new Date());
            session.update(product);
            
            // For hard delete, uncomment the line below and comment the soft delete above
            // session.delete(product);
            
            transaction.commit();
            
            out.print("{\"success\":true,\"message\":\"Product deleted successfully\"}");
            
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            response.setStatus(500);
            out.print("{\"success\":false,\"error\":\"Failed to delete product: " + escapeJson(e.getMessage()) + "\"}");
        } finally {
            session.close();
            out.flush();
        }
    }
    
    // Helper method to extract values from JSON string
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) return null;
        
        startIndex += searchKey.length();
        
        // Skip whitespace
        while (startIndex < json.length() && Character.isWhitespace(json.charAt(startIndex))) {
            startIndex++;
        }
        
        if (startIndex >= json.length()) return null;
        
        char firstChar = json.charAt(startIndex);
        
        if (firstChar == '"') {
            // String value
            startIndex++; // Skip opening quote
            int endIndex = json.indexOf('"', startIndex);
            if (endIndex == -1) return null;
            return json.substring(startIndex, endIndex);
        } else {
            // Numeric or boolean value
            int endIndex = startIndex;
            while (endIndex < json.length() && 
                   json.charAt(endIndex) != ',' && 
                   json.charAt(endIndex) != '}' && 
                   json.charAt(endIndex) != ']') {
                endIndex++;
            }
            return json.substring(startIndex, endIndex).trim();
        }
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
    
    // Helper method to map color names to hex codes
    private String getColorCode(String colorName) {
        if (colorName == null) return "#000000";
        
        String color = colorName.toLowerCase().trim();
        switch (color) {
            case "black": return "#000000";
            case "white": return "#FFFFFF";
            case "gray": case "grey": return "#808080";
            case "red": return "#DC2626";
            case "blue": return "#2563EB";
            case "navy": return "#1E3A8A";
            case "green": return "#16A34A";
            case "yellow": return "#EAB308";
            case "orange": return "#EA580C";
            case "purple": return "#9333EA";
            case "pink": return "#EC4899";
            case "brown": return "#A16207";
            case "beige": case "cream": return "#F5F5DC";
            case "indigo": return "#4F46E5";
            case "dark blue": return "#1E40AF";
            case "light blue": return "#3B82F6";
            case "light gray": case "light grey": return "#D1D5DB";
            case "dark gray": case "dark grey": return "#4B5563";
            case "olive": return "#84CC16";
            case "maroon": return "#991B1B";
            case "teal": return "#0D9488";
            case "cyan": return "#0891B2";
            case "lime": return "#65A30D";
            case "floral": return "#F472B6"; // For floral patterns, use pink
            default: return "#6B7280"; // Default gray for unknown colors
        }
    }
}
