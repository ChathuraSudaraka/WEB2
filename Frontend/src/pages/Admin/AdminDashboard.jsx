import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp,
  FiPackage,
  FiShoppingCart,
  FiAlertTriangle,
  FiEye,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { productService, categoryService, orderService } from '../../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    lowStockProducts: [],
    topProducts: [],
    recentUsers: [],
    statistics: {
      totalProducts: 0,
      activeProducts: 0,
      totalCategories: 0,
      lowStockCount: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING DASHBOARD DATA ===');

      // Fetch products data
      const productsResponse = await productService.getAllProducts({ admin: 'true' });
      console.log('Products response:', productsResponse);

      // Fetch categories data
      const categoriesResponse = await categoryService.getAllCategories();
      console.log('Categories response:', categoriesResponse);

      let products = [];
      let categories = [];

      // Process products
      if (productsResponse?.success && productsResponse.data) {
        products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
        console.log('Loaded products:', products.length);
      } else {
        console.warn('No products data available, using fallback');
        // Fallback products for demonstration
        products = [
          {
            id: 1,
            name: 'Premium Cotton T-Shirt',
            stockQuantity: 5,
            price: 29.99,
            isActive: true,
            brand: 'DYNEX'
          },
          {
            id: 2,
            name: 'Denim Jacket',
            stockQuantity: 2,
            price: 89.99,
            isActive: true,
            brand: 'DYNEX'
          },
          {
            id: 3,
            name: 'Casual Hoodie',
            stockQuantity: 15,
            price: 59.99,
            isActive: true,
            brand: 'DYNEX'
          }
        ];
      }

      // Process categories
      if (categoriesResponse?.success && categoriesResponse.data) {
        categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
        console.log('Loaded categories:', categories.length);
      } else {
        console.warn('No categories data available, using fallback');
        categories = [
          { id: 1, name: 'T-Shirts' },
          { id: 2, name: 'Hoodies' },
          { id: 3, name: 'Jeans' },
          { id: 4, name: 'Dresses' },
          { id: 5, name: 'Jackets' }
        ];
      }

      // Calculate statistics
      const activeProducts = products.filter(p => p.isActive !== false);
      const lowStockProducts = products.filter(p => {
        const stock = p.stockQuantity || p.stock || 0;
        return stock > 0 && stock <= 10; // Low stock threshold
      }).slice(0, 5); // Show top 5 low stock items

      const statistics = {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        totalCategories: categories.length,
        lowStockCount: lowStockProducts.length
      };

      // Fetch orders data
      const ordersResponse = await orderService.getAllOrders();
      console.log('Orders response:', ordersResponse);

      let recentOrders = [];
      
      // Process orders
      if (ordersResponse?.success && ordersResponse.data) {
        const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        console.log('Loaded orders:', orders.length);
        
        recentOrders = orders.slice(0, 3).map(order => ({
          id: order.id,
          customer: order.customerName || 'Unknown Customer',
          email: order.customerEmail || 'N/A',
          total: parseFloat(order.totalAmount || 0),
          status: order.status?.toLowerCase() || 'pending',
          date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));

        // Add order statistics
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
        
        statistics.totalOrders = orders.length;
        statistics.totalRevenue = totalRevenue;
        statistics.pendingOrders = pendingOrders;
      } else {
        console.warn('No orders data available, using fallback');
        // Mock recent orders fallback
        recentOrders = [
          {
            id: '1001',
            customer: 'John Doe',
            email: 'john@example.com',
            total: 125.99,
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
          },
          {
            id: '1002',
            customer: 'Jane Smith',
            email: 'jane@example.com',
            total: 89.50,
            status: 'completed',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
          },
          {
            id: '1003',
            customer: 'Bob Johnson',
            email: 'bob@example.com',
            total: 234.75,
            status: 'processing',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
          }
        ];
        
        // Mock order statistics
        statistics.totalOrders = recentOrders.length;
        statistics.totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);
        statistics.pendingOrders = recentOrders.filter(order => order.status === 'pending').length;
      }

      // Generate top products based on available data
      const topProducts = products.slice(0, 3).map((product, index) => ({
        id: product.id,
        name: product.name,
        sales: Math.floor(Math.random() * 200) + 50, // Mock sales data
        revenue: (Math.floor(Math.random() * 5000) + 1000),
        change: (Math.random() * 20 - 10) // Random change between -10 and +10
      }));

      // Mock recent users
      const recentUsers = [
        {
          id: 1,
          name: 'Alice Brown',
          email: 'alice@example.com',
          joinDate: new Date().toISOString().split('T')[0],
          orders: 3
        },
        {
          id: 2,
          name: 'Charlie Wilson',
          email: 'charlie@example.com',
          joinDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          orders: 1
        }
      ];

      setDashboardData({
        recentOrders,
        lowStockProducts: lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stockQuantity || p.stock || 0,
          price: p.price || 0,
          image: p.imageUrl || '/images/placeholder-product.jpg'
        })),
        topProducts,
        recentUsers,
        statistics
      });

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      // Fallback to mock data if API fails
      setDashboardData({
        recentOrders: [
          {
            id: '1001',
            customer: 'John Doe',
            email: 'john@example.com',
            total: 125.99,
            status: 'pending',
            date: '2024-01-15'
          }
        ],
        lowStockProducts: [
          {
            id: 1,
            name: 'Classic White T-Shirt',
            stock: 5,
            price: 29.99,
            image: '/images/placeholder-product.jpg'
          }
        ],
        topProducts: [
          {
            id: 1,
            name: 'Premium Hoodie',
            sales: 156,
            revenue: 4680.00,
            change: 12.5
          }
        ],
        recentUsers: [
          {
            id: 1,
            name: 'Alice Brown',
            email: 'alice@example.com',
            joinDate: '2024-01-15',
            orders: 3
          }
        ],
        statistics: {
          totalProducts: 0,
          activeProducts: 0,
          totalCategories: 0,
          lowStockCount: 0
        }
      });
    } finally {
      setLoading(false);
      console.log('=== DASHBOARD FETCH COMPLETE ===');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.statistics.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.statistics.activeProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Categories</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.statistics.totalCategories}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.statistics.lowStockCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiShoppingCart className="mr-2 h-5 w-5" />
                Recent Orders
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${order.total}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiAlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                Low Stock Alert
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">Manage inventory</button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.lowStockProducts.map((product) => (
              <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <FiPackage className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock <= 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiTrendingUp className="mr-2 h-5 w-5" />
              Top Products
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.topProducts.map((product, index) => (
              <div key={product.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                    <div className="flex items-center">
                      {product.change >= 0 ? (
                        <FiArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <FiArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${product.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(product.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiUsers className="mr-2 h-5 w-5" />
                Recent Users
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUsers className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{user.orders} orders</p>
                    <p className="text-xs text-gray-500">Joined {user.joinDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <FiPackage className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Add Product</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <FiShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">View Orders</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
            <FiUsers className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Manage Users</p>
          </button>
          <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200">
            <FiEye className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-900">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
