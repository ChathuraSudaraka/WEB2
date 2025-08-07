package controller;

import model.Order;
import model.OrderItem;
import model.User;
import util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.Query;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;

@WebServlet("/orders")
public class OrderServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
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
                getAllOrders(request, response, out);
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
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
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
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
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void getAllOrders(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            // SQL query to get orders with customer information
            String sql = "SELECT o.*, u.first_name, u.last_name, u.email " +
                        "FROM orders o " +
                        "LEFT JOIN users u ON o.user_id = u.id " +
                        "ORDER BY o.created_at DESC";
            
            Query query = session.createSQLQuery(sql);
            List<Object[]> results = query.list();
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"data\": [");
            
            for (int i = 0; i < results.size(); i++) {
                if (i > 0) jsonBuilder.append(",");
                
                Object[] row = results.get(i);
                jsonBuilder.append("{");
                jsonBuilder.append("\"id\": ").append(row[0]).append(",");
                jsonBuilder.append("\"userId\": ").append(row[1] != null ? row[1] : "null").append(",");
                jsonBuilder.append("\"orderNumber\": \"").append(row[2] != null ? row[2] : "").append("\",");
                jsonBuilder.append("\"status\": \"").append(row[3] != null ? row[3] : "").append("\",");
                jsonBuilder.append("\"totalAmount\": ").append(row[4] != null ? row[4] : "0").append(",");
                jsonBuilder.append("\"shippingAddress\": \"").append(row[7] != null ? row[7] : "").append("\",");
                jsonBuilder.append("\"paymentMethod\": \"").append(row[9] != null ? row[9] : "").append("\",");
                jsonBuilder.append("\"createdAt\": \"").append(row[12] != null ? row[12] : "").append("\",");
                
                // Customer information
                String firstName = (String) row[14];
                String lastName = (String) row[15];
                String email = (String) row[16];
                
                if (firstName != null && lastName != null) {
                    jsonBuilder.append("\"customerName\": \"").append(firstName).append(" ").append(lastName).append("\",");
                } else {
                    jsonBuilder.append("\"customerName\": \"Unknown Customer\",");
                }
                jsonBuilder.append("\"customerEmail\": \"").append(email != null ? email : "No email").append("\",");
                
                // Get order items - fix the casting issue
                Long orderId = null;
                if (row[0] instanceof Number) {
                    orderId = ((Number) row[0]).longValue();
                }
                jsonBuilder.append("\"items\": ").append(getOrderItemsJson(orderId, session));
                
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
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            String sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
            
            Query query = session.createSQLQuery(sql);
            query.setParameter(0, userId);
            List<Object[]> results = query.list();
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"success\": true, \"data\": [");
            
            for (int i = 0; i < results.size(); i++) {
                if (i > 0) jsonBuilder.append(",");
                
                Object[] row = results.get(i);
                jsonBuilder.append(createOrderJson(row, session));
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
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            String sql = "SELECT o.*, u.first_name, u.last_name, u.email " +
                        "FROM orders o " +
                        "LEFT JOIN users u ON o.user_id = u.id " +
                        "WHERE o.id = ?";
            
            Query query = session.createSQLQuery(sql);
            query.setParameter(0, orderId);
            Object[] result = (Object[]) query.uniqueResult();
            
            if (result != null) {
                StringBuilder jsonBuilder = new StringBuilder();
                jsonBuilder.append("{\"success\": true, \"data\": {");
                jsonBuilder.append("\"id\": ").append(result[0]).append(",");
                jsonBuilder.append("\"userId\": ").append(result[1]).append(",");
                jsonBuilder.append("\"orderNumber\": \"").append(result[2]).append("\",");
                jsonBuilder.append("\"status\": \"").append(result[3]).append("\",");
                jsonBuilder.append("\"totalAmount\": ").append(result[4]).append(",");
                jsonBuilder.append("\"shippingAddress\": \"").append(result[7] != null ? result[7] : "").append("\",");
                jsonBuilder.append("\"paymentMethod\": \"").append(result[9] != null ? result[9] : "").append("\",");
                jsonBuilder.append("\"createdAt\": \"").append(result[12]).append("\",");
                
                String firstName = (String) result[14];
                String lastName = (String) result[15];
                if (firstName != null && lastName != null) {
                    jsonBuilder.append("\"customerName\": \"").append(firstName).append(" ").append(lastName).append("\",");
                } else {
                    jsonBuilder.append("\"customerName\": \"Unknown Customer\",");
                }
                jsonBuilder.append("\"customerEmail\": \"").append(result[16] != null ? result[16] : "").append("\",");
                
                jsonBuilder.append("\"items\": ").append(getOrderItemsJson((Long) result[0], session));
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

    private void createOrder(HttpServletRequest request, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // Get parameters
            String userIdStr = request.getParameter("userId");
            String totalAmountStr = request.getParameter("totalAmount");
            String shippingAddress = request.getParameter("shippingAddress");
            String itemsJson = request.getParameter("items");
            String paymentMethod = request.getParameter("paymentMethod");
            
            if (userIdStr == null || totalAmountStr == null) {
                sendErrorResponse(out, "Missing required parameters");
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
            
            Query orderQuery = session.createSQLQuery(insertOrderSql);
            orderQuery.setParameter(0, userId);
            orderQuery.setParameter(1, orderNumber);
            orderQuery.setParameter(2, "PENDING");
            orderQuery.setParameter(3, totalAmount);
            orderQuery.setParameter(4, shippingAddress);
            orderQuery.setParameter(5, paymentMethod != null ? paymentMethod : "STRIPE");
            orderQuery.setParameter(6, "PAID");
            
            orderQuery.executeUpdate();
            
            // Get the inserted order ID
            Query getIdQuery = session.createSQLQuery("SELECT LAST_INSERT_ID()");
            Long orderId = ((Number) getIdQuery.uniqueResult()).longValue();
            
            // Create order items if provided
            if (itemsJson != null && !itemsJson.isEmpty()) {
                // Simple JSON parsing for items (format: [{"productId":1,"productName":"T-Shirt","quantity":2,"price":29.99},...])
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
            
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            sendErrorResponse(out, "Error creating order: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void updateOrderStatus(Long orderId, HttpServletRequest request, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            String newStatus = request.getParameter("status");
            
            if (newStatus == null) {
                sendErrorResponse(out, "Status parameter is required");
                return;
            }
            
            String updateSql = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
            
            Query query = session.createSQLQuery(updateSql);
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

    private String getOrderItemsJson(Long orderId, Session session) {
        try {
            if (orderId == null) {
                return "[]";
            }
            
            String sql = "SELECT * FROM order_items WHERE order_id = ?";
            Query query = session.createSQLQuery(sql);
            query.setParameter(0, orderId);
            List<Object[]> items = query.list();
            
            StringBuilder itemsJson = new StringBuilder();
            itemsJson.append("[");
            
            for (int i = 0; i < items.size(); i++) {
                if (i > 0) itemsJson.append(",");
                
                Object[] item = items.get(i);
                itemsJson.append("{");
                itemsJson.append("\"productId\": ").append(item[2] != null ? item[2] : "null").append(",");
                itemsJson.append("\"productName\": \"").append(item[3] != null ? item[3] : "").append("\",");
                itemsJson.append("\"color\": \"").append(item[4] != null ? item[4] : "Default").append("\",");
                itemsJson.append("\"size\": \"").append(item[5] != null ? item[5] : "M").append("\",");
                itemsJson.append("\"quantity\": ").append(item[6] != null ? item[6] : "0").append(",");
                itemsJson.append("\"price\": ").append(item[7] != null ? item[7] : "0");
                itemsJson.append("}");
            }
            
            itemsJson.append("]");
            return itemsJson.toString();
        } catch (Exception e) {
            return "[]";
        }
    }

    private String createOrderJson(Object[] row, Session session) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"id\": ").append(row[0]).append(",");
        json.append("\"userId\": ").append(row[1]).append(",");
        json.append("\"orderNumber\": \"").append(row[2]).append("\",");
        json.append("\"status\": \"").append(row[3]).append("\",");
        json.append("\"totalAmount\": ").append(row[4]).append(",");
        json.append("\"shippingAddress\": \"").append(row[7] != null ? row[7] : "").append("\",");
        json.append("\"paymentMethod\": \"").append(row[9] != null ? row[9] : "").append("\",");
        json.append("\"createdAt\": \"").append(row[12]).append("\",");
        json.append("\"items\": ").append(getOrderItemsJson((Long) row[0], session));
        json.append("}");
        return json.toString();
    }

    private void parseAndInsertOrderItems(String itemsJson, Long orderId, Session session) {
        try {
            // Simple JSON parsing - expects format like: [{"productId":1,"productName":"T-Shirt","quantity":2,"price":29.99}]
            // Remove brackets and split by objects
            String cleanJson = itemsJson.trim().substring(1, itemsJson.length() - 1); // Remove [ ]
            
            if (cleanJson.isEmpty()) return;
            
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
                    String[] keyValue = field.split(":");
                    if (keyValue.length == 2) {
                        String key = keyValue[0].trim().replace("\"", "");
                        String value = keyValue[1].trim().replace("\"", "");
                        
                        switch (key) {
                            case "productId":
                                productId = Long.valueOf(value);
                                break;
                            case "productName":
                                productName = value;
                                break;
                            case "quantity":
                                quantity = Integer.valueOf(value);
                                break;
                            case "price":
                                price = new BigDecimal(value);
                                break;
                            case "color":
                                color = value;
                                break;
                            case "size":
                                size = value;
                                break;
                        }
                    }
                }
                
                if (productId != null) {
                    String insertItemSql = "INSERT INTO order_items (order_id, product_id, product_name, " +
                                         "color, size, quantity, unit_price, total_price, created_at) " +
                                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                    
                    Query itemQuery = session.createSQLQuery(insertItemSql);
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
            System.err.println("Error parsing order items: " + e.getMessage());
        }
    }

    private void sendErrorResponse(PrintWriter out, String message) {
        StringBuilder response = new StringBuilder();
        response.append("{\"success\": false, \"error\": \"").append(message).append("\"}");
        out.print(response.toString());
    }
}

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
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
                getAllOrders(request, response, out);
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
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
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
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
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void getAllOrders(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            // SQL query to get orders with customer information
            String sql = "SELECT o.*, u.first_name, u.last_name, u.email " +
                        "FROM orders o " +
                        "LEFT JOIN users u ON o.user_id = u.id " +
                        "ORDER BY o.created_at DESC";
            
            Query query = session.createSQLQuery(sql);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> orders = new ArrayList<>();
            
            for (Object[] row : results) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", row[0]);
                order.put("userId", row[1]);
                order.put("orderNumber", row[2]);
                order.put("status", row[3]);
                order.put("totalAmount", row[4]);
                order.put("shippingAmount", row[5]);
                order.put("taxAmount", row[6]);
                order.put("shippingAddress", row[7]);
                order.put("billingAddress", row[8]);
                order.put("paymentMethod", row[9]);
                order.put("paymentStatus", row[10]);
                order.put("notes", row[11]);
                order.put("createdAt", row[12]);
                order.put("updatedAt", row[13]);
                
                // Customer information
                String firstName = (String) row[14];
                String lastName = (String) row[15];
                String email = (String) row[16];
                
                if (firstName != null && lastName != null) {
                    order.put("customerName", firstName + " " + lastName);
                } else {
                    order.put("customerName", "Unknown Customer");
                }
                order.put("customerEmail", email != null ? email : "No email");
                
                // Get order items
                order.put("items", getOrderItemsJson((Long) row[0], session));
                
                orders.add(order);
            }
            
            sendSuccessResponse(out, orders);
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error retrieving orders: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void getUserOrders(Long userId, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            String sql = "SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC";
            
            Query query = session.createSQLQuery(sql);
            query.setParameter("userId", userId);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> orders = new ArrayList<>();
            
            for (Object[] row : results) {
                Map<String, Object> order = createOrderMap(row, session);
                orders.add(order);
            }
            
            sendSuccessResponse(out, orders);
            
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(out, "Error retrieving user orders: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void getOrderById(Long orderId, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        try {
            String sql = "SELECT o.*, u.first_name, u.last_name, u.email " +
                        "FROM orders o " +
                        "LEFT JOIN users u ON o.user_id = u.id " +
                        "WHERE o.id = :orderId";
            
            Query query = session.createSQLQuery(sql);
            query.setParameter("orderId", orderId);
            Object[] result = (Object[]) query.uniqueResult();
            
            if (result != null) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", result[0]);
                order.put("userId", result[1]);
                order.put("orderNumber", result[2]);
                order.put("status", result[3]);
                order.put("totalAmount", result[4]);
                order.put("shippingAddress", result[7]);
                order.put("paymentMethod", result[9]);
                order.put("createdAt", result[12]);
                
                String firstName = (String) result[14];
                String lastName = (String) result[15];
                if (firstName != null && lastName != null) {
                    order.put("customerName", firstName + " " + lastName);
                }
                order.put("customerEmail", result[16]);
                
                order.put("items", getOrderItemsJson((Long) result[0], session));
                
                sendSuccessResponse(out, order);
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

    private void createOrder(HttpServletRequest request, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            // Get parameters
            String userIdStr = request.getParameter("userId");
            String totalAmountStr = request.getParameter("totalAmount");
            String shippingAddress = request.getParameter("shippingAddress");
            String itemsJson = request.getParameter("items");
            String paymentMethod = request.getParameter("paymentMethod");
            String paymentIntentId = request.getParameter("paymentIntentId");
            
            if (userIdStr == null || totalAmountStr == null) {
                sendErrorResponse(out, "Missing required parameters");
                return;
            }
            
            Long userId = Long.valueOf(userIdStr);
            BigDecimal totalAmount = new BigDecimal(totalAmountStr);
            
            // Create order
            Order order = new Order();
            order.setUserId(userId);
            order.generateOrderNumber();
            order.setTotalAmount(totalAmount);
            order.setShippingAddress(shippingAddress);
            order.setPaymentMethod(paymentMethod != null ? paymentMethod : "STRIPE");
            order.setStatus("PENDING");
            order.setPaymentStatus("PAID");
            
            // Insert order
            String insertOrderSql = "INSERT INTO orders (user_id, order_number, status, total_amount, " +
                                  "shipping_address, payment_method, payment_status, created_at, updated_at) " +
                                  "VALUES (:userId, :orderNumber, :status, :totalAmount, :shippingAddress, " +
                                  ":paymentMethod, :paymentStatus, NOW(), NOW())";
            
            Query orderQuery = session.createSQLQuery(insertOrderSql);
            orderQuery.setParameter("userId", order.getUserId());
            orderQuery.setParameter("orderNumber", order.getOrderNumber());
            orderQuery.setParameter("status", order.getStatus());
            orderQuery.setParameter("totalAmount", order.getTotalAmount());
            orderQuery.setParameter("shippingAddress", order.getShippingAddress());
            orderQuery.setParameter("paymentMethod", order.getPaymentMethod());
            orderQuery.setParameter("paymentStatus", order.getPaymentStatus());
            
            orderQuery.executeUpdate();
            
            // Get the inserted order ID
            Query getIdQuery = session.createSQLQuery("SELECT LAST_INSERT_ID()");
            Long orderId = ((Number) getIdQuery.uniqueResult()).longValue();
            order.setId(orderId);
            
            // Create order items
            if (itemsJson != null && !itemsJson.isEmpty()) {
                JsonArray items = JsonParser.parseString(itemsJson).getAsJsonArray();
                
                for (int i = 0; i < items.size(); i++) {
                    JsonObject item = items.get(i).getAsJsonObject();
                    
                    String insertItemSql = "INSERT INTO order_items (order_id, product_id, product_name, " +
                                         "color, size, quantity, unit_price, total_price, created_at) " +
                                         "VALUES (:orderId, :productId, :productName, :color, :size, " +
                                         ":quantity, :unitPrice, :totalPrice, NOW())";
                    
                    Query itemQuery = session.createSQLQuery(insertItemSql);
                    itemQuery.setParameter("orderId", orderId);
                    itemQuery.setParameter("productId", item.get("productId").getAsLong());
                    itemQuery.setParameter("productName", item.get("productName").getAsString());
                    itemQuery.setParameter("color", item.has("color") ? item.get("color").getAsString() : "Default");
                    itemQuery.setParameter("size", item.has("size") ? item.get("size").getAsString() : "M");
                    itemQuery.setParameter("quantity", item.get("quantity").getAsInt());
                    
                    BigDecimal unitPrice = item.get("price").getAsBigDecimal();
                    BigDecimal quantity = BigDecimal.valueOf(item.get("quantity").getAsInt());
                    BigDecimal totalPrice = unitPrice.multiply(quantity);
                    
                    itemQuery.setParameter("unitPrice", unitPrice);
                    itemQuery.setParameter("totalPrice", totalPrice);
                    
                    itemQuery.executeUpdate();
                }
            }
            
            transaction.commit();
            
            // Return created order
            Map<String, Object> response = new HashMap<>();
            response.put("id", orderId);
            response.put("orderNumber", order.getOrderNumber());
            response.put("status", order.getStatus());
            response.put("message", "Order created successfully");
            
            sendSuccessResponse(out, response);
            
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            sendErrorResponse(out, "Error creating order: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    private void updateOrderStatus(Long orderId, HttpServletRequest request, PrintWriter out) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;
        
        try {
            transaction = session.beginTransaction();
            
            String newStatus = request.getParameter("status");
            
            if (newStatus == null) {
                sendErrorResponse(out, "Status parameter is required");
                return;
            }
            
            String updateSql = "UPDATE orders SET status = :status, updated_at = NOW() WHERE id = :orderId";
            
            Query query = session.createSQLQuery(updateSql);
            query.setParameter("status", newStatus);
            query.setParameter("orderId", orderId);
            
            int rowsUpdated = query.executeUpdate();
            
            transaction.commit();
            
            if (rowsUpdated > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order status updated successfully");
                response.put("orderId", orderId);
                response.put("newStatus", newStatus);
                sendSuccessResponse(out, response);
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

    private String getOrderItemsJson(Long orderId, Session session) {
        try {
            String sql = "SELECT * FROM order_items WHERE order_id = :orderId";
            Query query = session.createSQLQuery(sql);
            query.setParameter("orderId", orderId);
            List<Object[]> items = query.getResultList();
            
            JsonArray itemsArray = new JsonArray();
            for (Object[] item : items) {
                JsonObject itemObj = new JsonObject();
                itemObj.addProperty("productId", ((Number) item[2]).longValue());
                itemObj.addProperty("productName", (String) item[3]);
                itemObj.addProperty("color", (String) item[4]);
                itemObj.addProperty("size", (String) item[5]);
                itemObj.addProperty("quantity", ((Number) item[6]).intValue());
                itemObj.addProperty("price", ((BigDecimal) item[7]).doubleValue());
                itemsArray.add(itemObj);
            }
            
            return itemsArray.toString();
        } catch (Exception e) {
            return "[]";
        }
    }

    private Map<String, Object> createOrderMap(Object[] row, Session session) {
        Map<String, Object> order = new HashMap<>();
        order.put("id", row[0]);
        order.put("userId", row[1]);
        order.put("orderNumber", row[2]);
        order.put("status", row[3]);
        order.put("totalAmount", row[4]);
        order.put("shippingAddress", row[7]);
        order.put("paymentMethod", row[9]);
        order.put("createdAt", row[12]);
        order.put("items", getOrderItemsJson((Long) row[0], session));
        return order;
    }

    private void sendSuccessResponse(PrintWriter out, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        out.print(gson.toJson(response));
    }

    private void sendErrorResponse(PrintWriter out, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        out.print(gson.toJson(response));
    }
}
