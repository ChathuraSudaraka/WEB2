import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../store';
import { userService } from '../../services/api';
import { orderService } from '../../services/orderService';
import { useToast } from '../../contexts/ToastContext';
import { FiShoppingCart, FiUser, FiTruck, FiLock, FiArrowLeft } from 'react-icons/fi';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, getCartTotals, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fullUserData, setFullUserData] = useState(null);

  const { subtotal, shipping, tax, total, totalItems } = getCartTotals();

  // Checkout form data - start with empty form
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Order Notes
    orderNotes: ''
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/products');
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [cartItems, isAuthenticated, navigate]);

  // Fetch full user data when user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await userService.getCurrentUser();
          if (response.success) {
            console.log('Full user data fetched:', response.data); // Debug log
            setFullUserData(response.data);
          } else {
            console.error('Failed to fetch user data:', response.error);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  // Update form data when full user data becomes available
  useEffect(() => {
    if (fullUserData) {
      console.log('Updating form with user data:', fullUserData); // Debug log
      setFormData(prev => ({
        ...prev,
        firstName: fullUserData.firstName || prev.firstName,
        lastName: fullUserData.lastName || prev.lastName,
        email: fullUserData.email || prev.email,
        phone: fullUserData.phone || prev.phone,
        address: fullUserData.address || prev.address,
        city: fullUserData.city || prev.city,
        zipCode: fullUserData.postalCode || prev.zipCode, // Backend uses postalCode
        country: fullUserData.country || prev.country,
      }));
    }
  }, [fullUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare shipping address
      const shippingAddress = `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      
      // Prepare order items for backend
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.color || 'Default',
        size: item.size || 'M'
      }));

      // Create order data for backend
      const orderData = {
        userId: user.id,
        totalAmount: total,
        shippingAddress: shippingAddress,
        paymentMethod: 'STRIPE',
        items: orderItems
      };

      toast.success('Processing your order...');

      // Call backend API to create order
      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Clear cart on successful order
        clearCart();
        
        toast.success('Order placed successfully!');
        
        // Navigate to success page with order details
        navigate('/payment-success', { 
          state: { 
            order: {
              id: response.data.id,
              orderNumber: response.data.orderNumber,
              total: total,
              items: cartItems,
              shipping: formData
            }
          } 
        });
      } else {
        throw new Error(response.error || 'Failed to create order');
      }

    } catch (error) {
      console.error('Error processing order:', error);
      toast.error(error.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23333' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
      </div>

      <div className="relative z-20 py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors duration-200 group"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" size={18} />
              <span>Back</span>
            </button>
            
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Checkout
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"></div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-8">
              {[
                { number: 1, title: 'Shipping', icon: FiTruck },
                { number: 2, title: 'Review', icon: FiShoppingCart }
              ].map(({ number, title, icon: Icon }) => (
                <div key={number} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= number
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-400 text-white'
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-400">Step {number}</div>
                    <div className={`font-semibold ${currentStep >= number ? 'text-white' : 'text-gray-500'}`}>
                      {title}
                    </div>
                  </div>
                  {number < 2 && (
                    <div className={`w-16 h-0.5 ml-8 transition-colors duration-300 ${
                      currentStep > number ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-600'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Steps */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <FiTruck className="mr-3 text-blue-400" size={24} />
                      <h2 className="text-2xl font-bold">Shipping Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                      >
                        Review Order
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Order Review */}
                {currentStep === 2 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <FiShoppingCart className="mr-3 text-purple-400" size={24} />
                      <h2 className="text-2xl font-bold">Review Your Order</h2>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            {item.color && <p className="text-sm text-gray-400">Color: {item.color}</p>}
                            {item.size && <p className="text-sm text-gray-400">Size: {item.size}</p>}
                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-white/20 pt-6">
                      <div className="flex items-center text-green-400 mb-4">
                        <FiLock className="mr-2" size={16} />
                        <span className="text-sm">Your order information is secure</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-8">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between text-white font-bold text-xl">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {shipping === 0 && (
                  <div className="mt-4 text-green-400 text-sm bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                    🎉 You've qualified for free shipping!
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
