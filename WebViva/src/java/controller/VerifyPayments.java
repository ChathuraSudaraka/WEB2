package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "VerifyPayments", urlPatterns = {"/VerifyPayments"})
public class VerifyPayments extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static final int PAYHERE_SUCCESS = 2;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String merchant_id = request.getParameter("merchant_id");
        String order_id = request.getParameter("order_id");
        String payhere_amount = request.getParameter("payhere_amount");
        String payhere_currency = request.getParameter("payhere_currency");
        String status_code = request.getParameter("status_code");
        String md5sig = request.getParameter("md5sig");

        String merchantSecret = "MjY5NjQwNjk4OTM0MzI0NDQ1MzQ4MzU0NDAzNTMyNzIwMDMwOTA=";
        String merchantSecretMD5 = md5(merchantSecret);
        String hash = md5(merchant_id + order_id + payhere_amount + payhere_currency + merchantSecretMD5);

        if (md5sig != null && md5sig.equals(hash) && Integer.parseInt(status_code) == PAYHERE_SUCCESS) {
            // Extract numeric order id if prefixed like #000123
            String cleanOrderId = order_id != null ? order_id.replace("#000", "") : null;
            try {
                Long orderId = cleanOrderId != null ? Long.valueOf(cleanOrderId) : null;
                if (orderId != null) {
                    // Update DB: set payment_status=PAID and maybe status=CONFIRMED
                    org.hibernate.Session session = util.HibernateUtil.getSessionFactory().openSession();
                    org.hibernate.Transaction tx = session.beginTransaction();
                    org.hibernate.Query q = session.createSQLQuery("UPDATE orders SET payment_status = 'PAID', status = 'CONFIRMED', updated_at = NOW() WHERE id = ?");
                    q.setParameter(0, orderId);
                    q.executeUpdate();
                    tx.commit();
                    session.close();
                }
            } catch (Exception e) {
                // swallow - PayHere expects 200 OK regardless
            }
        }
        response.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Simple health check endpoint
        response.setContentType("application/json");
        response.getWriter().write("{\"ok\":true,\"service\":\"VerifyPayments\"}");
    }

    private static String md5(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString().toUpperCase();
        } catch (Exception e) {
            return "";
        }
    }
}
