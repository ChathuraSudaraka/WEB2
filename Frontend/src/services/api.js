import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/WebViva', // Backend servlet context path
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  async login(credentials) {
    try {
      // Create URL-encoded form data for the servlet
      const params = new URLSearchParams();
      params.append('email', credentials.email);
      params.append('password', credentials.password);
      
      const response = await api.post('/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { success: true, data: { token, user } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed'
      };
    }
  },

  async signup(userData) {
    try {
      // Create URL-encoded form data for the servlet
      const params = new URLSearchParams();
      
      // Use the firstName and lastName directly from the form
      params.append('firstName', userData.firstName || '');
      params.append('lastName', userData.lastName || '');
      params.append('username', userData.email); // Use email as username
      params.append('email', userData.email);
      params.append('password', userData.password);
      params.append('phone', userData.phone || '');
      params.append('address', userData.address || '');
      params.append('city', userData.city || '');
      params.append('postalCode', userData.postalCode || '');
      params.append('country', userData.country || '');
      
      // Debug log to see what we're sending
      console.log('Signup data being sent:', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.email,
        email: userData.email,
        password: '***',
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        postalCode: userData.postalCode,
        country: userData.country
      });
      
      const response = await api.post('/signup', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Signup failed'
      };
    }
  },

  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  async getSessionStatus() {
    try {
      const response = await api.get('/session-status');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get session status'
      };
    }
  }
};

// Product Service
export const productService = {
  async getAllProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return { success: true, data: response.data };
    } catch (error) {
      // Re-throw the error to let the component handle it
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products from backend'
      };
    }
  },

  async getFeaturedProducts() {
    try {
      const response = await api.get('/products', { params: { featured: 'true' } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured products'
      };
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      console.log('Raw product response:', response.data);
      
      // Check if response is wrapped in success object
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else if (response.data.id) {
        // Direct product data (old format)
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Invalid response format' };
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error.response?.data?.message || `Failed to fetch product ${id}`
      };
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create product'
      };
    }
  },

  async updateProduct(productData) {
    try {
      const response = await api.put(`/products/${productData.id}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update product'
      };
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete product'
      };
    }
  }
};

// Category Service
export const categoryService = {
  async getAllCategories() {
    try {
      const response = await api.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  },

  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category'
      };
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create category'
      };
    }
  },

  async updateCategory(categoryData) {
    try {
      const response = await api.put(`/categories/${categoryData.id}`, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update category'
      };
    }
  },

  async deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete category'
      };
    }
  }
};

// Dashboard Service
export const dashboardService = {
  async getDashboardData() {
    try {
      const response = await api.get('/dashboard-data');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  }
};

// Cart Service
export const cartService = {
  async getCart() {
    try {
      const response = await api.get('/cart');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch cart'
      };
    }
  },

  async addToCart(productId, quantity = 1) {
    try {
      const response = await api.post('/cart', { productId, quantity });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add item to cart'
      };
    }
  },

  async updateCartItem(itemId, quantity) {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update cart item'
      };
    }
  },

  async removeFromCart(itemId) {
    try {
      await api.delete(`/cart/${itemId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove item from cart'
      };
    }
  }
};

// Order Service
export const orderService = {
  async getOrders() {
    try {
      const response = await api.get('/orders');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  },

  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order details'
      };
    }
  },

  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create order'
      };
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update order status'
      };
    }
  }
};

// User Profile Service
export const userService = {
  async getUserProfile() {
    try {
      const response = await api.get('/user-profile');
      // Backend already returns { success: true, data: {...} }
      // So we should return the response data directly
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch user profile' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user profile'
      };
    }
  },

  async updateUserProfile(userData) {
    try {
      const response = await api.put('/user-profile', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Backend returns { success: true/false, message?: string }
      if (response.data.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to update profile' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to update profile'
      };
    }
  }
};

export default api;
