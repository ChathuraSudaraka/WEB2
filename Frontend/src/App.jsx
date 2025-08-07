import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Import contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Provider } from "react-redux";
import { store } from "./store";

// Import components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Cart from "./pages/Cart/Cart";
import Contact from "./pages/Contact/Contact";
import Blog from "./pages/Blog/Blog";
import BlogPost from "./pages/BlogPost/BlogPost";
import Profile from "./pages/Profile/Profile";
import Orders from "./pages/Orders/Orders";
import Checkout from "./pages/Checkout/Checkout";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminProducts from "./pages/Admin/Products/AdminProducts";
import AdminOrders from "./pages/Admin/Orders/AdminOrders";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import ProductInfo from "./pages/ProductDetails/ProductDetails";

// Layout component to handle conditional navbar rendering
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup"];
  const hideFooterRoutes = ["/login", "/signup", "/"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {!shouldHideNavbar && <Navbar />}
      {children}
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Layout>
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductInfo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* User Protected Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
