package controller;

import util.HibernateUtil;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.List;
import java.sql.SQLException;

/**
 * OrderServlet - Complete REST API for order management
 * Handles CRUD operations for orders and order items
 */
public class OrderServlet extends javax.servlet.http.HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(javax.servlet.http.HttpServletRequest request, 
                        javax.servlet.http.HttpServletResponse response) 
            throws javax.servlet.ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            String pathInfo = request.getPathInfo();
            
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all orders for admin
                getAllOrders(out);
            } else if (pathInfo.startsWith("/user/")) {
                // Get orders for specific user
                String userIdStr = pathInfo.substring(6);
                getUserOrders(Long.valueOf(userIdStr), out);
            } else if (pathInfo.matches("/\\d+")) {
                // Get specific order by ID
                String orderIdStr = pathInfo.substring(1);
                getOrderById(Long.valueOf(orderIdStr), out);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error retrieving orders: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(javax.servlet.http.HttpServletRequest request, 
                         javax.servlet.http.HttpServletResponse response) 
            throws javax.servlet.ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Create new order
            createOrder(request, out);
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error creating order: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(javax.servlet.http.HttpServletRequest request, 
                        javax.servlet.http.HttpServletResponse response) 
            throws javax.servlet.ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        
        try {
            String pathInfo = request.getPathInfo();
            
            if (pathInfo != null && pathInfo.contains("/status")) {
                // Update order status
                String orderIdStr = pathInfo.split("/")[1];
                updateOrderStatus(Long.valueOf(orderIdStr), request, out);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error updating order: " + e.getMessage());
        }
    }

    @Override
    protected void doOptions(javax.servlet.http.HttpServletRequest request, 
                            javax.servlet.http.HttpServletResponse response) 
            throws javax.servlet.ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(javax.servlet.http.HttpServletResponse.SC_OK);
    }

    private void getAllOrders(PrintWriter out) {
        org.hibernate.Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            // SQL query to get orders with customer information
            String sql = "SELECT o.id, o.user_id, o.order_number, o.status, o.total_amount, " +
                        "o.shipping_address, o.payment_method, o.created_at, " +
                        "u.first_name, u.last_name, u.email " +
                        "FROM orders o " +
                        "LEFT JOIN users u ON o.user_id = u.id " +
                        "ORDER BY o.created_at DESC";
            
            org.hibernate.Query query = session.createSQLQuery(sql);
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.list();
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"data\": [");
            
            for (int i = 0; i < results.size(); i++) {
                if (i > 0) jsonBuilder.append(",");
                
                Object[] row = results.get(i);
                jsonBuilder.append("{");
                
                // Safe casting for database values
                Long orderId = row[0] != null ? ((Number) row[0]).longValue() : null;
                Long userId = row[1] != null ? ((Number) row[1]).longValue() : null;
                
                jsonBuilder.append("\"id\": ").append(orderId).append(",");
                jsonBuilder.append("\"userId\": ").append(userId).append(",");
                jsonBuilder.append("\"orderNumber\": \"").append(row[2] != null ? row[2] : "").append("\",");
                jsonBuilder.append("\"status\": \"").append(row[3] != null ? row[3] : "PENDING").append("\",");
                jsonBuilder.append("\"totalAmount\": ").append(row[4] != null ? row[4] : "0").append(",");
                // Format shipping address as JSON string for frontend parsing
                String shippingAddr = row[5] != null ? row[5].toString() : "";
                if (!shippingAddr.isEmpty() && !shippingAddr.startsWith("{")) {
                    // If it's a plain address, convert to JSON format
                    shippingAddr = "{\"street\":\"" + escapeJson(shippingAddr) + "\",\"city\":\"\",\"state\":\"\",\"zipCode\":\"\"}";
                }
                jsonBuilder.append("\"shippingAddress\": \"").append(escapeJson(shippingAddr)).append("\",");
                jsonBuilder.append("\"paymentMethod\": \"").append(row[6] != null ? row[6] : "STRIPE").append("\",");
                jsonBuilder.append("\"createdAt\": \"").append(row[7] != null ? row[7] : "").append("\",");
                
                // Customer information
                String firstName = row[8] != null ? (String) row[8] : null;
                String lastName = row[9] != null ? (String) row[9] : null;
                String email = row[10] != null ? (String) row[10] : null;
                
                if (firstName != null && lastName != null) {
                    jsonBuilder.append("\"customerName\": \"").append(escapeJson(firstName + " " + lastName)).append("\",");
                } else {
                    jsonBuilder.append("\"customerName\": \"Unknown Customer\",");
                }
                jsonBuilder.append("\"customerEmail\": \"").append(escapeJson(email != null ? email : "No email")).append("\",");
                
                // Get order items as JSON string for frontend parsing
                jsonBuilder.append("\"items\": \"").append(escapeJson(getOrderItemsJson(orderId, session))).append("\"");
                
                jsonBuilder.append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error retrieving orders: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void getUserOrders(Long userId, PrintWriter out) {
        org.hibernate.Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            String sql = "SELECT id, user_id, order_number, status, total_amount, " +
                        "shipping_address, payment_method, created_at " +
                        "FROM orders WHERE user_id = ? ORDER BY created_at DESC";
            
            org.hibernate.Query query = session.createSQLQuery(sql);
            query.setParameter(0, userId);
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.list();
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"data\": [");
            
            for (int i = 0; i < results.size(); i++) {
                if (i > 0) jsonBuilder.append(",");
                
                Object[] row = results.get(i);
                Long orderId = row[0] != null ? ((Number) row[0]).longValue() : null;
                
                jsonBuilder.append("{");
                jsonBuilder.append("\"id\": ").append(orderId).append(",");
                jsonBuilder.append("\"userId\": ").append(row[1] != null ? ((Number) row[1]).longValue() : null).append(",");
                jsonBuilder.append("\"orderNumber\": \"").append(row[2] != null ? row[2] : "").append("\",");
                jsonBuilder.append("\"status\": \"").append(row[3] != null ? row[3] : "PENDING").append("\",");
                jsonBuilder.append("\"totalAmount\": ").append(row[4] != null ? row[4] : "0").append(",");
                
                // Format shipping address as JSON string for frontend parsing
                String shippingAddr = row[5] != null ? row[5].toString() : "";
                if (!shippingAddr.isEmpty() && !shippingAddr.startsWith("{")) {
                    // If it's a plain address, convert to JSON format
                    shippingAddr = "{\"street\":\"" + escapeJson(shippingAddr) + "\",\"city\":\"\",\"state\":\"\",\"zipCode\":\"\"}";
                }
                jsonBuilder.append("\"shippingAddress\": \"").append(escapeJson(shippingAddr)).append("\",");
                jsonBuilder.append("\"paymentMethod\": \"").append(row[6] != null ? row[6] : "STRIPE").append("\",");
                jsonBuilder.append("\"createdAt\": \"").append(row[7] != null ? row[7] : "").append("\",");
                jsonBuilder.append("\"items\": \"").append(escapeJson(getOrderItemsJson(orderId, session))).append("\"");
                jsonBuilder.append("}");
            }
            
            jsonBuilder.append("]}");
            out.print(jsonBuilder.toString());
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error retrieving user orders: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void getOrderById(Long orderId, PrintWriter out) {
        org.hibernate.Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            String sql = "SELECT o.id, o.user_id, o.order_number, o.status, o.total_amount, " +
                        "o.shipping_address, o.payment_method, o.created_at, " +
                        "u.first_name, u.last_name, u.email " +
                        "FROM orders o " +
                        "LEFT JOIN users u ON o.user_id = u.id " +
                        "WHERE o.id = ?";
            
            org.hibernate.Query query = session.createSQLQuery(sql);
            query.setParameter(0, orderId);
            Object[] result = (Object[]) query.uniqueResult();
            
            if (result != null) {
                StringBuilder jsonBuilder = new StringBuilder();
                jsonBuilder.append("{\"success\": true, \"data\": {");
                
                jsonBuilder.append("\"totalAmount\": ").append(result[4] != null ? result[4] : "0").append(",");
                
                // Format shipping address as JSON string for frontend parsing
                String shippingAddr = result[5] != null ? result[5].toString() : "";
                if (!shippingAddr.isEmpty() && !shippingAddr.startsWith("{")) {
                    // If it's a plain address, convert to JSON format
                    shippingAddr = "{\"street\":\"" + escapeJson(shippingAddr) + "\",\"city\":\"\",\"state\":\"\",\"zipCode\":\"\"}";
                }
                jsonBuilder.append("\"shippingAddress\": \"").append(escapeJson(shippingAddr)).append("\",");
                jsonBuilder.append("\"paymentMethod\": \"").append(result[6] != null ? result[6] : "STRIPE").append("\",");
                jsonBuilder.append("\"createdAt\": \"").append(result[7] != null ? result[7] : "").append("\",");
                
                String firstName = result[8] != null ? (String) result[8] : null;
                String lastName = result[9] != null ? (String) result[9] : null;
                if (firstName != null && lastName != null) {
                    jsonBuilder.append("\"customerName\": \"").append(escapeJson(firstName + " " + lastName)).append("\",");
                } else {
                    jsonBuilder.append("\"customerName\": \"Unknown Customer\",");
                }
                jsonBuilder.append("\"customerEmail\": \"").append(escapeJson(result[10] != null ? result[10].toString() : "")).append("\",");
                jsonBuilder.append("\"items\": \"").append(escapeJson(getOrderItemsJson(id, session))).append("\"");
                if (firstName != null && lastName != null) {
                    jsonBuilder.append("\"customerName\": \"").append(escapeJson(firstName + " " + lastName)).append("\",");
                } else {
                    jsonBuilder.append("\"customerName\": \"Unknown Customer\",");
                }
                jsonBuilder.append("\"customerEmail\": \"").append(escapeJson(result[10] != null ? result[10].toString() : "")).append("\",");
                jsonBuilder.append("\"items\": ").append(getOrderItemsJson(id, session));
                jsonBuilder.append("}}");
                
                out.print(jsonBuilder.toString());
            } else {
                sendErrorResponse(out, "Order not found");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error retrieving order: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void createOrder(javax.servlet.http.HttpServletRequest request, PrintWriter out) {
        org.hibernate.Session session = HibernateUtil.getSessionFactory().openSession();
        org.hibernate.Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // Get parameters
            String userIdStr = request.getParameter("userId");
            String totalAmountStr = request.getParameter("totalAmount");
            String shippingAddress = request.getParameter("shippingAddress");
            String itemsJson = request.getParameter("items");
            String paymentMethod = request.getParameter("paymentMethod");
            
            if (userIdStr == null || totalAmountStr == null) {
                sendErrorResponse(out, "Missing required parameters: userId and totalAmount are required");
                return;
            }
            
            Long userId = Long.valueOf(userIdStr);
            BigDecimal totalAmount = new BigDecimal(totalAmountStr);
            
            // Generate order number
            String orderNumber = "ORD-" + System.currentTimeMillis();
            
            // Insert order
            String insertOrderSql = "INSERT INTO orders (user_id, order_number, status, total_amount, " +
                                  "shipping_address, payment_method, payment_status, created_at, updated_at) " +
                                  "VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            org.hibernate.Query orderQuery = session.createSQLQuery(insertOrderSql);
            orderQuery.setParameter(0, userId);
            orderQuery.setParameter(1, orderNumber);
            orderQuery.setParameter(2, "PENDING");
            orderQuery.setParameter(3, totalAmount);
            orderQuery.setParameter(4, shippingAddress);
            orderQuery.setParameter(5, paymentMethod != null ? paymentMethod : "STRIPE");
            orderQuery.setParameter(6, "PAID");
            
            int rowsInserted = orderQuery.executeUpdate();
            
            if (rowsInserted > 0) {
                // Get the inserted order ID
                org.hibernate.Query getIdQuery = session.createSQLQuery("SELECT LAST_INSERT_ID()");
                Object idResult = getIdQuery.uniqueResult();
                Long orderId = null;
                if (idResult instanceof Number) {
                    orderId = ((Number) idResult).longValue();
                }
                
                // Create order items if provided
                if (itemsJson != null && !itemsJson.isEmpty() && orderId != null) {
                    parseAndInsertOrderItems(itemsJson, orderId, session);
                }
                
                transaction.commit();
                
                // Return created order
                StringBuilder response = new StringBuilder();
                response.append("{\"success\": true, \"data\": {");
                response.append("\"id\": ").append(orderId).append(",");
                response.append("\"orderNumber\": \"").append(orderNumber).append("\",");
                response.append("\"status\": \"PENDING\",");
                response.append("\"message\": \"Order created successfully\"");
                response.append("}}");
                
                out.print(response.toString());
            } else {
                if (transaction != null) transaction.rollback();
                sendErrorResponse(out, "Failed to create order");
            }
            
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            sendErrorResponse(out, "Error creating order: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void updateOrderStatus(Long orderId, javax.servlet.http.HttpServletRequest request, PrintWriter out) {
        org.hibernate.Session session = HibernateUtil.getSessionFactory().openSession();
        org.hibernate.Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // For PUT requests, we need to manually parse the form data from the body
            String newStatus = null;
            
            // Try to get parameter normally first (works for POST)
            newStatus = request.getParameter("status");
            
            // If not found, read from request body (for PUT)
            if (newStatus == null) {
                java.io.BufferedReader reader = request.getReader();
                StringBuilder bodyBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    bodyBuilder.append(line);
                }
                String body = bodyBuilder.toString();
                
                // Parse form-encoded data: status=CONFIRMED
                if (body.contains("status=")) {
                    String[] parts = body.split("&");
                    for (String part : parts) {
                        if (part.startsWith("status=")) {
                            newStatus = java.net.URLDecoder.decode(part.substring(7), "UTF-8");
                            break;
                        }
                    }
                }
            }
            
            if (newStatus == null || newStatus.trim().isEmpty()) {
                sendErrorResponse(out, "Status parameter is required");
                return;
            }
            
            String updateSql = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
            
            org.hibernate.Query query = session.createSQLQuery(updateSql);
            query.setParameter(0, newStatus);
            query.setParameter(1, orderId);
            
            int rowsUpdated = query.executeUpdate();
            
            transaction.commit();
            
            if (rowsUpdated > 0) {
                StringBuilder response = new StringBuilder();
                response.append("{\"success\": true, \"data\": {");
                response.append("\"message\": \"Order status updated successfully\",");
                response.append("\"orderId\": ").append(orderId).append(",");
                response.append("\"newStatus\": \"").append(newStatus).append("\"");
                response.append("}}");
                out.print(response.toString());
            } else {
                sendErrorResponse(out, "Order not found");
            }
            
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            sendErrorResponse(out, "Error updating order status: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private String getOrderItemsJson(Long orderId, org.hibernate.Session session) {
        try {
            if (orderId == null) {
                return "[]";
            }
            
            String sql = "SELECT product_id, product_name, color, size, quantity, unit_price " +
                        "FROM order_items WHERE order_id = ?";
            org.hibernate.Query query = session.createSQLQuery(sql);
            query.setParameter(0, orderId);
            @SuppressWarnings("unchecked")
            List<Object[]> items = query.list();
            
            StringBuilder itemsJson = new StringBuilder();
            itemsJson.append("[");
            
            for (int i = 0; i < items.size(); i++) {
                if (i > 0) itemsJson.append(",");
                
                Object[] item = items.get(i);
                itemsJson.append("{");
                itemsJson.append("\"productId\": ").append(item[0] != null ? item[0] : "null").append(",");
                itemsJson.append("\"productName\": \"").append(escapeJson(item[1] != null ? item[1].toString() : "")).append("\",");
                itemsJson.append("\"color\": \"").append(escapeJson(item[2] != null ? item[2].toString() : "Default")).append("\",");
                itemsJson.append("\"size\": \"").append(escapeJson(item[3] != null ? item[3].toString() : "M")).append("\",");
                itemsJson.append("\"quantity\": ").append(item[4] != null ? item[4] : "0").append(",");
                itemsJson.append("\"price\": ").append(item[5] != null ? item[5] : "0");
                itemsJson.append("}");
            }
            
            itemsJson.append("]");
            return itemsJson.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    private void parseAndInsertOrderItems(String itemsJson, Long orderId, org.hibernate.Session session) {
        try {
            // Simple JSON parsing - expects format like: [{"productId":1,"productName":"T-Shirt","quantity":2,"price":29.99}]
            String cleanJson = itemsJson.trim();
            if (cleanJson.startsWith("[") && cleanJson.endsWith("]")) {
                cleanJson = cleanJson.substring(1, cleanJson.length() - 1); // Remove [ ]
            }
            
            if (cleanJson.isEmpty()) return;
            
            // Split by object boundaries - more careful parsing
            String[] itemObjects = cleanJson.split("},\\s*\\{");
            
            for (String itemStr : itemObjects) {
                // Clean up the item string
                itemStr = itemStr.replace("{", "").replace("}", "");
                
                // Parse individual fields
                Long productId = null;
                String productName = "";
                Integer quantity = 1;
                BigDecimal price = BigDecimal.ZERO;
                String color = "Default";
                String size = "M";
                
                String[] fields = itemStr.split(",");
                for (String field : fields) {
                    String[] keyValue = field.split(":", 2);
                    if (keyValue.length == 2) {
                        String key = keyValue[0].trim().replace("\"", "");
                        String value = keyValue[1].trim().replace("\"", "");
                        
                        switch (key) {
                            case "productId":
                                try {
                                    productId = Long.valueOf(value);
                                } catch (NumberFormatException e) {
                                    productId = 1L; // Default product ID
                                }
                                break;
                            case "productName":
                                productName = value;
                                break;
                            case "quantity":
                                try {
                                    quantity = Integer.valueOf(value);
                                } catch (NumberFormatException e) {
                                    quantity = 1;
                                }
                                break;
                            case "price":
                                try {
                                    price = new BigDecimal(value);
                                } catch (NumberFormatException e) {
                                    price = BigDecimal.ZERO;
                                }
                                break;
                            case "color":
                                color = value.isEmpty() ? "Default" : value;
                                break;
                            case "size":
                                size = value.isEmpty() ? "M" : value;
                                break;
                        }
                    }
                }
                
                if (productId != null && !productName.isEmpty()) {
                    String insertItemSql = "INSERT INTO order_items (order_id, product_id, product_name, " +
                                         "color, size, quantity, unit_price, total_price, created_at) " +
                                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                    
                    org.hibernate.Query itemQuery = session.createSQLQuery(insertItemSql);
                    itemQuery.setParameter(0, orderId);
                    itemQuery.setParameter(1, productId);
                    itemQuery.setParameter(2, productName);
                    itemQuery.setParameter(3, color);
                    itemQuery.setParameter(4, size);
                    itemQuery.setParameter(5, quantity);
                    itemQuery.setParameter(6, price);
                    itemQuery.setParameter(7, price.multiply(BigDecimal.valueOf(quantity)));
                    
                    itemQuery.executeUpdate();
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error parsing order items: " + e.getMessage());
        }
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    private void sendErrorResponse(PrintWriter out, String message) {
        StringBuilder response = new StringBuilder();
        response.append("{\"success\": false, \"error\": \"").append(escapeJson(message)).append("\"}");
        out.print(response.toString());
    }
}
