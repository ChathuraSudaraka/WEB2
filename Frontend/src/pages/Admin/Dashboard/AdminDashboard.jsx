import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../../services/api';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Since we don't have dashboard data endpoint yet, we'll use mock data
      // const response = await dashboardService.getDashboardData();
      
      // Mock data for demonstration
      setDashboardData({
        totalUsers: 156,
        totalProducts: 89,
        totalOrders: 234,
        totalRevenue: 15650.75,
        recentOrders: [
          { id: 1, customer: 'John Doe', total: 125.99, status: 'Pending' },
          { id: 2, customer: 'Jane Smith', total: 89.50, status: 'Completed' },
          { id: 3, customer: 'Bob Johnson', total: 234.25, status: 'Processing' },
        ],
        lowStockProducts: [
          { id: 1, name: 'Sample Product 1', stock: 3 },
          { id: 2, name: 'Sample Product 2', stock: 1 },
          { id: 3, name: 'Sample Product 3', stock: 5 },
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
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiUsers size={30} className="text-blue-600 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{dashboardData.totalUsers}</h4>
            <p className="text-gray-500">Total Users</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiShoppingBag size={30} className="text-green-600 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{dashboardData.totalProducts}</h4>
            <p className="text-gray-500">Total Products</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiTrendingUp size={30} className="text-blue-500 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-gray-800 mb-1">{dashboardData.totalOrders}</h4>
            <p className="text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiDollarSign size={30} className="text-yellow-600 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-gray-800 mb-1">${dashboardData.totalRevenue.toFixed(2)}</h4>
            <p className="text-gray-500">Total Revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h5 className="text-lg font-semibold text-gray-800">Recent Orders</h5>
              </div>
              <div className="p-6">
                {dashboardData.recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600 font-medium">Order ID</th>
                          <th className="text-left py-2 text-gray-600 font-medium">Customer</th>
                          <th className="text-left py-2 text-gray-600 font-medium">Total</th>
                          <th className="text-left py-2 text-gray-600 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentOrders.map(order => (
                          <tr key={order.id} className="border-b border-gray-100">
                            <td className="py-3 text-gray-800">#{order.id}</td>
                            <td className="py-3 text-gray-800">{order.customer}</td>
                            <td className="py-3 text-gray-800">${order.total.toFixed(2)}</td>
                            <td className="py-3">{getStatusBadge(order.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No recent orders</p>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h5 className="text-lg font-semibold text-gray-800">Low Stock Alert</h5>
              </div>
              <div className="p-6">
                {dashboardData.lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.lowStockProducts.map(product => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{product.name}</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {product.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">All products are well stocked</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
