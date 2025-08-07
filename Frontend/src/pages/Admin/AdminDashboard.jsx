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

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    lowStockProducts: [],
    topProducts: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      setDashboardData({
        recentOrders: [
          {
            id: '1001',
            customer: 'John Doe',
            email: 'john@example.com',
            total: 125.99,
            status: 'pending',
            date: '2024-01-15'
          },
          {
            id: '1002',
            customer: 'Jane Smith',
            email: 'jane@example.com',
            total: 89.50,
            status: 'completed',
            date: '2024-01-14'
          },
          {
            id: '1003',
            customer: 'Bob Johnson',
            email: 'bob@example.com',
            total: 234.75,
            status: 'processing',
            date: '2024-01-14'
          }
        ],
        lowStockProducts: [
          {
            id: 1,
            name: 'Classic White T-Shirt',
            stock: 5,
            price: 29.99,
            image: '/images/placeholder-product.jpg'
          },
          {
            id: 2,
            name: 'Denim Jacket',
            stock: 2,
            price: 89.99,
            image: '/images/placeholder-product.jpg'
          },
          {
            id: 3,
            name: 'Running Shoes',
            stock: 3,
            price: 129.99,
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
          },
          {
            id: 2,
            name: 'Designer Jeans',
            sales: 89,
            revenue: 7120.00,
            change: -3.2
          },
          {
            id: 3,
            name: 'Summer Dress',
            sales: 145,
            revenue: 5800.00,
            change: 8.7
          }
        ],
        recentUsers: [
          {
            id: 1,
            name: 'Alice Brown',
            email: 'alice@example.com',
            joinDate: '2024-01-15',
            orders: 3
          },
          {
            id: 2,
            name: 'Charlie Wilson',
            email: 'charlie@example.com',
            joinDate: '2024-01-14',
            orders: 1
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
