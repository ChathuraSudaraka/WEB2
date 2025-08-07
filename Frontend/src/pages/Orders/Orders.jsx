import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiPackage, FiCalendar, FiDollarSign, FiTruck, FiCheck, FiClock, FiX } from 'react-icons/fi';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data. In a real app, you'd fetch from your API
      const mockOrders = [
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 299.99,
          items: [
            { name: 'Wireless Headphones', quantity: 1, price: 199.99 },
            { name: 'Phone Case', quantity: 2, price: 50.00 }
          ]
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          date: '2024-01-20',
          status: 'shipped',
          total: 149.99,
          items: [
            { name: 'Bluetooth Speaker', quantity: 1, price: 149.99 }
          ]
        },
        {
          id: 3,
          orderNumber: 'ORD-2024-003',
          date: '2024-01-25',
          status: 'processing',
          total: 89.99,
          items: [
            { name: 'Wireless Mouse', quantity: 1, price: 89.99 }
          ]
        },
        {
          id: 4,
          orderNumber: 'ORD-2024-004',
          date: '2024-01-28',
          status: 'cancelled',
          total: 199.99,
          items: [
            { name: 'Gaming Keyboard', quantity: 1, price: 199.99 }
          ]
        }
      ];
      
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheck className="text-green-600" size={16} />;
      case 'shipped':
        return <FiTruck className="text-blue-600" size={16} />;
      case 'processing':
        return <FiClock className="text-yellow-600" size={16} />;
      case 'cancelled':
        return <FiX className="text-red-600" size={16} />;
      default:
        return <FiPackage className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'all' && ` (${orders.length})`}
                {status !== 'all' && ` (${orders.filter(o => o.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                      <div className="flex items-center text-gray-600 text-sm">
                        <FiCalendar className="mr-1" size={14} />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-900 font-semibold">
                        <FiDollarSign className="mr-1" size={14} />
                        {order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-600">
                              ${(item.price / item.quantity).toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Write Review
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Cancel Order
                          </button>
                        )}
                      </div>
                      {order.status === 'shipped' && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
