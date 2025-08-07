import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { useCart } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiMinus, FiPlus, FiArrowLeft, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await productService.getProductById(id);
      if (response.success) {
        const productData = response.data;
        setProduct(productData);
        
        // Initialize with first available color and size
        if (productData.colors && productData.colors.length > 0) {
          // Handle both string array format and object format
          const firstColor = productData.colors[0];
          setSelectedColor(typeof firstColor === 'string' ? firstColor : firstColor.name);
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } else {
        setError(response.error || 'Failed to load product details.');
      }
    } catch (err) {
      setError('Failed to load product details. Please try again.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Check if required selections are made
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    // Check if product is in stock and has sufficient quantity
    if (!isInStock || product.stockQuantity < quantity) {
      toast.error('Sorry, this product is out of stock or insufficient quantity available.');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Prepare product data for cart
      const productData = {
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        image: product.imageUrl || product.images?.[0],
        stockQuantity: product.stockQuantity
      };

      await addToCart(productData, selectedColor, selectedSize, quantity);
      // Toast notification is handled by CartContext
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
    console.log(`${isWishlisted ? 'Removed from' : 'Added to'} wishlist:`, id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < (product?.stockQuantity || 0)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const isInStock = product && (product.stockQuantity || 0) > 0;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="text-yellow-400 fill-current" size={16} />);
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="text-yellow-400" size={16} />);
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" size={16} />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Background with tech texture */}
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
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading DYNEX product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Background with tech texture */}
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
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">Product Not Found</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-xl hover:from-gray-100 hover:to-white transition-all duration-300 transform hover:scale-105"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with tech texture - matching other pages */}
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

      {/* Tech Pattern Overlay */}
      <div className="fixed inset-0 z-10 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3Ccircle cx='7' cy='37' r='1'/%3E%3Ccircle cx='37' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-20 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-white transition-colors duration-200">Products</Link>
            <span>/</span>
            <span className="text-white font-medium">{product.name}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-8 transition-all duration-200 group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" size={18} />
            <span className="font-medium">Back to Collection</span>
          </button>

          {/* Zeus-Style Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-16">
            {/* Left Side - Product Images */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/30 to-black/50"></div>
              
              {/* Main Image Container */}
              <div className="relative z-20 p-8 h-full min-h-[700px] flex flex-col">
                {/* Main Product Image */}
                <div className="flex-1 relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden group-hover:bg-white/10 transition-all duration-500 mb-6">
                  <img
                    src={product.images && product.images[selectedImage] ? product.images[selectedImage] : product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = product.imageUrl;
                    }}
                  />
                  
                  {/* Image overlay effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Discount badge */}
                  {product.discountPrice && (
                    <div className="absolute top-6 right-6 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-lg backdrop-blur-sm">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </div>
                  )}
                  
                  {/* Stock status */}
                  <div className="absolute bottom-6 left-6">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
                      isInStock ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${isInStock ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={`text-sm font-medium ${isInStock ? 'text-green-400' : 'text-red-400'}`}>
                        {isInStock ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Rating badge */}
                  {product.rating && (
                    <div className="absolute top-6 left-6">
                      <div className="flex items-center space-x-1 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-xl">
                        <FiStar className="text-yellow-400 fill-current" size={16} />
                        <span className="text-white font-medium">{product.rating}</span>
                        {product.reviewCount && (
                          <span className="text-gray-300 text-sm">({product.reviewCount})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex items-center justify-center space-x-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                          selectedImage === index 
                            ? 'border-white scale-110 ring-2 ring-white/50' 
                            : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-gray-900/30 to-black/50"></div>
              
              <div className="relative z-20 p-12 h-full min-h-[700px] flex flex-col justify-center">
                <div className="space-y-8">
                  {/* Category and Featured Badge */}
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-300 border border-white/20 uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.featured && (
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl text-sm font-medium text-yellow-400 border border-yellow-500/30 uppercase tracking-wider">
                        Featured Drop
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h1 className="text-4xl md:text-6xl font-black leading-tight bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="flex items-center space-x-4">
                    {product.discountPrice ? (
                      <>
                        <div className="text-4xl font-black text-white">
                          ${product.discountPrice}
                        </div>
                        <div className="text-2xl text-gray-500 line-through">
                          ${product.price}
                        </div>
                        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-bold">
                          SAVE ${(product.price - product.discountPrice).toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <div className="text-4xl font-black text-white">
                        ${product.price}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                      {product.description}
                    </p>
                  )}

                  {/* Colors Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Choose Color
                      </label>
                      <div className="flex items-center space-x-3">
                        {product.colors.map((color) => {
                          // Handle both string and object format
                          const colorName = typeof color === 'string' ? color : color.name;
                          const colorCode = typeof color === 'object' ? color.code : (
                            color === "Black" ? "#000000" :
                            color === "White" ? "#FFFFFF" :
                            color === "Gray" ? "#6B7280" :
                            color === "Navy" ? "#1E3A8A" :
                            color === "Olive" ? "#365314" :
                            color === "Red" ? "#DC2626" :
                            color === "Cream" ? "#FEF3C7" :
                            color === "Khaki" ? "#A16207" :
                            "#9CA3AF"
                          );
                          
                          return (
                          <button
                            key={colorName}
                            onClick={() => setSelectedColor(colorName)}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                              selectedColor === colorName 
                                ? 'border-white ring-2 ring-white/50 ring-offset-2 ring-offset-black scale-110' 
                                : 'border-white/30 hover:border-white/60'
                            }`}
                            style={{
                              backgroundColor: colorCode
                            }}
                            title={colorName}
                          >
                            {selectedColor === colorName && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${colorName === "White" ? "bg-black" : "bg-white"}`}></div>
                              </div>
                            )}
                          </button>
                          );
                        })}
                      </div>
                      <div className="text-sm text-gray-400">
                        Selected: <span className="text-white font-medium">{selectedColor}</span>
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Choose Size
                      </label>
                      <div className="flex items-center flex-wrap gap-3">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 min-w-[60px] ${
                              selectedSize === size 
                                ? 'border-white bg-white text-black font-bold' 
                                : 'border-white/30 text-white hover:border-white/60 hover:bg-white/10'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <div className="text-sm text-gray-400">
                        Selected: <span className="text-white font-medium">{selectedSize || 'None'}</span>
                      </div>
                    </div>
                  )}
             

                  {/* Quantity and Add to Cart */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                          Quantity
                        </label>
                        <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                          <button
                            onClick={() => adjustQuantity(-1)}
                            disabled={quantity <= 1}
                            className="p-3 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="px-6 py-3 text-lg font-bold text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => adjustQuantity(1)}
                            disabled={quantity >= product.stockQuantity}
                            className="p-3 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {product.stockQuantity} available
                      </div>
                    </div>

                    {/* Selection Summary */}
                    {(selectedColor || selectedSize) && (
                      <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-2">Your Selection</h4>
                        <div className="flex items-center space-x-6 text-sm">
                          {selectedColor && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">Color:</span>
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded-full border border-white/30 ${
                                  selectedColor === "Black"
                                    ? "bg-black"
                                    : selectedColor === "White"
                                    ? "bg-white"
                                    : selectedColor === "Gray"
                                    ? "bg-gray-500"
                                    : selectedColor === "Navy"
                                    ? "bg-blue-900"
                                    : selectedColor === "Olive"
                                    ? "bg-green-700"
                                    : selectedColor === "Red"
                                    ? "bg-red-500"
                                    : selectedColor === "Cream"
                                    ? "bg-yellow-100"
                                    : selectedColor === "Khaki"
                                    ? "bg-yellow-600"
                                    : "bg-gray-400"
                                }`}></div>
                                <span className="text-white font-medium">{selectedColor}</span>
                              </div>
                            </div>
                          )}
                          {selectedSize && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">Size:</span>
                              <span className="text-white font-medium">{selectedSize}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleAddToCart}
                        disabled={!isInStock || isAddingToCart}
                        className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                          isInStock && !isAddingToCart
                            ? 'bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-white transform hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isAddingToCart ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <FiShoppingCart size={20} />
                            <span>{isInStock ? 'Add to Cart' : 'Sold Out'}</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleWishlist}
                        className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                          isWishlisted
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        <FiHeart size={20} />
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="p-4 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
                      >
                        <FiShare2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section - DYNEX Style */}
          <div className="relative py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Product Details
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                {['description', 'specifications', 'features'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-3 rounded-xl font-medium capitalize transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-white to-gray-200 text-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
                {activeTab === 'description' && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-6">About This Product</h3>
                    <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
                      {product.description} Our DYNEX collection represents the pinnacle of streetwear design, 
                      combining authentic urban aesthetics with premium materials and construction. Each piece 
                      is carefully crafted to deliver both style and substance for the modern urbanite.
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Materials & Care</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">Material:</span>
                          <span className="text-white font-medium">{product.material}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">Care Instructions:</span>
                          <span className="text-white font-medium">{product.care}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-white font-medium">{product.category}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Product Info</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">Available Sizes:</span>
                          <span className="text-white font-medium">{product.sizes ? product.sizes.join(', ') : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">Available Colors:</span>
                          <span className="text-white font-medium">{product.colors ? product.colors.join(', ') : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400">Rating:</span>
                          <span className="text-white font-medium">{product.rating}/5 ({product.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.features && product.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Features - DYNEX Style */}
          <div className="relative py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Why Choose DYNEX
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <FiTruck className="text-blue-400 w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-white mb-2">Free Shipping</h3>
                <p className="text-gray-400">Complimentary shipping on all orders over $75. Express delivery available.</p>
              </div>

              <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <FiShield className="text-green-400 w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-white mb-2">Authentic Guarantee</h3>
                <p className="text-gray-400">100% authentic streetwear with premium quality assurance and secure checkout.</p>
              </div>

              <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <FiRefreshCw className="text-orange-400 w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-white mb-2">Easy Returns</h3>
                <p className="text-gray-400">30-day hassle-free returns with full refund. No questions asked policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
