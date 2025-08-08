import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { FiPackage, FiCalendar, FiDollarSign, FiTruck, FiCheck, FiClock, FiX } from 'react-icons/fi';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      if (user && user.id) {
        // Fetch user's orders from API
        const result = await orderService.getUserOrders(user.id);
        
        if (result.success && result.data && Array.isArray(result.data)) {
          // Transform the backend data to match frontend format
          const transformedOrders = result.data.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: order.status ? order.status.toLowerCase() : 'pending',
            total: parseFloat(order.totalAmount || 0),
            items: parseItems(order.items || '[]'),
            shippingAddress: parseAddress(order.shippingAddress || '{}'),
            paymentMethod: order.paymentMethod || 'STRIPE'
          }));
          
          setOrders(transformedOrders);
          console.log('✅ User orders loaded:', transformedOrders.length);
        } else {
          console.warn('⚠️ No orders found for user');
          setOrders([]);
        }
      } else {
        console.warn('⚠️ No user ID available');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to parse JSON strings from backend
  const parseItems = (itemsString) => {
    try {
      const items = JSON.parse(itemsString);
      return Array.isArray(items) ? items.map(item => ({
        name: item.productName || 'Unknown Product',
        quantity: item.quantity || 1,
        price: parseFloat(item.price || 0),
        color: item.color || 'Default',
        size: item.size || 'M'
      })) : [];
    } catch {
      return [];
    }
  };

  const parseAddress = (addressString) => {
    try {
      return JSON.parse(addressString);
    } catch {
      return {};
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return <FiCheck className="text-green-600" size={16} />;
      case 'shipped':
        return <FiTruck className="text-blue-600" size={16} />;
      case 'confirmed':
      case 'processing':
        return <FiClock className="text-yellow-600" size={16} />;
      case 'cancelled':
        return <FiX className="text-red-600" size={16} />;
      case 'pending':
      default:
        return <FiPackage className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColorDark = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return 'bg-green-600/20 text-green-400 border border-green-600/30';
      case 'shipped':
        return 'bg-blue-600/20 text-blue-400 border border-blue-600/30';
      case 'confirmed':
        return 'bg-purple-600/20 text-purple-400 border border-purple-600/30';
      case 'processing':
        return 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30';
      case 'cancelled':
        return 'bg-red-600/20 text-red-400 border border-red-600/30';
      case 'pending':
      default:
        return 'bg-gray-600/20 text-gray-400 border border-gray-600/30';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center">
          {/* Background with tech texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23333' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12">
              <h2 className="text-4xl font-bold text-white mb-6">Access Denied</h2>
              <p className="text-gray-400 text-lg">Please log in to view your orders.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background with tech texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23333' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                MY ORDERS
              </h1>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-4"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Track and manage your DYNEX orders
            </p>
          </div>

          {/* Filters */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    filter === status
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'all' && ` (${orders.length})`}
                  {status !== 'all' && ` (${orders.filter(o => o.status.toLowerCase() === status).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
              <p className="text-gray-300 text-lg">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12 text-center">
              <FiPackage className="mx-auto h-16 w-16 text-gray-500 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No orders found</h3>
              <p className="text-gray-400 text-lg">
                {filter === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No ${filter} orders found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-all duration-300">
                  {/* Order Header */}
                  <div className="px-8 py-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.status)}
                          <span className="font-bold text-white text-lg">
                            {order.orderNumber}
                          </span>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColorDark(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                        <div className="flex items-center text-gray-400">
                          <FiCalendar className="mr-2" size={16} />
                          <span className="text-sm">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-white font-bold text-lg">
                          <FiDollarSign className="mr-1" size={18} />
                          {order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-8 py-6">
                    <div className="space-y-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-lg mb-2">{item.name}</h4>
                            <div className="text-sm text-gray-400 space-y-1">
                              <p className="flex items-center">
                                <span className="mr-2">Quantity:</span>
                                <span className="text-white font-medium">{item.quantity}</span>
                              </p>
                              {item.color && item.color !== 'Default' && (
                                <p className="flex items-center">
                                  <span className="mr-2">Color:</span>
                                  <span className="text-white font-medium">{item.color}</span>
                                </p>
                              )}
                              {item.size && item.size !== 'M' && (
                                <p className="flex items-center">
                                  <span className="mr-2">Size:</span>
                                  <span className="text-white font-medium">{item.size}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-xl">${item.price.toFixed(2)}</p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-400">
                                ${(item.price / item.quantity).toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                        <div className="flex space-x-4">
                          <button className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                            View Details
                          </button>
                          {order.status.toLowerCase() === 'delivered' && (
                            <button className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors">
                              Write Review
                            </button>
                          )}
                          {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'confirmed') && (
                            <button className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                              Cancel Order
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          {order.status.toLowerCase() === 'shipped' && (
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                              Track Package
                            </button>
                          )}
                          {order.shippingAddress && order.shippingAddress.street && (
                            <div className="text-sm text-gray-400 max-w-xs">
                              <span className="mr-2">Ships to:</span>
                              <span className="text-white">{order.shippingAddress.street}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
