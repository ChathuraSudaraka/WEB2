import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-md lg:max-w-lg">
            <div className="bg-white rounded-lg shadow-lg text-center p-8">
              <div className="text-green-500 mb-6">
                <FiCheckCircle size={80} className="mx-auto" />
              </div>
              
              <h2 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h2>
              
              <p className="text-lg text-gray-700 mb-6">
                Thank you for your purchase. Your order has been confirmed and will be processed shortly.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-green-800">
                  <strong>Order Details:</strong><br/>
                  Order confirmation has been sent to your email address.
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Link 
                  to="/"
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Continue Shopping
                </Link>
                <Link 
                  to="/products"
                  className="border border-blue-600 text-blue-600 font-semibold py-2 px-6 rounded-md hover:bg-blue-50 transition duration-200"
                >
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
