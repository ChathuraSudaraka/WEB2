import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import { useCart } from "../../store";
import {
  FiSearch,
  FiFilter,
  FiShoppingCart,
  FiEye,
  FiStar,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);

  useEffect(() => {
    // Fetch products from backend API
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAllProducts();
      if (response.success && response.data.length > 0) {
        setProducts(response.data);
      } else {
        setProducts([]);
        console.warn("No products found in database");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success && response.data.length > 0) {
        setCategories(response.data);
      } else {
        setCategories([]);
        console.warn("No categories found in database");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleAddToCart = async (product, event) => {
    event.stopPropagation(); // Prevent navigation to product details
    
    try {
      // Prepare product data for cart
      const productData = {
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        image: product.imageUrl,
        stockQuantity: product.stockQuantity
      };

      // Add to cart with default selections
      const result = await addToCart(productData, '', '', 1);
      
      if (result.success) {
        // Show success notification
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: linear-gradient(135deg, #7c3aed, #3b82f6); 
            color: white; 
            padding: 16px 24px; 
            border-radius: 12px; 
            font-weight: 600; 
            box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
          ">
          ✨ ${product.name} added to cart!
          </div>
          <style>
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          </style>
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
          }
        }, 3000);
      } else {
        alert(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    const matchesPriceMin =
      !priceRange.min || product.price >= parseFloat(priceRange.min);
    const matchesPriceMax =
      !priceRange.max || product.price <= parseFloat(priceRange.max);

    return (
      matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price_low":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price_high":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy, productsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Smooth scroll to top of products section
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
            currentPage === 1
              ? "bg-white/5 text-gray-500 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
          }`}
        >
          <FiChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* First page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
              currentPage === number
                ? "bg-gradient-to-r from-white to-gray-200 text-black font-bold"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {number}
          </button>
        ))}

        {/* Last page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-gray-400">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
            currentPage === totalPages
              ? "bg-white/5 text-gray-500 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight size={18} />
        </button>
      </div>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="text-yellow-400 fill-current" size={16} />
      );
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="text-yellow-400" size={16} />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading DYNEX collection...</p>
        </div>
      </div>
    );
  }

  const featuredProducts = sortedProducts.filter((product) => product.featured);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with tech texture - matching Contact page */}
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
      <div className="relative z-20">
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                DYNEX
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Where street culture meets premium craftsmanship. Discover our
                collection of authentic streetwear designed for the modern urban
                lifestyle.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold mb-2">
                  {products.length}+
                </div>
                <div className="text-gray-400">Premium Products</div>
              </div>
              <div className="text-center p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-gray-400">Authentic Street</div>
              </div>
              <div className="text-center p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-gray-400">Style Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products - Home Page Style */}
        {featuredProducts.length > 0 && (
          <div className="relative py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                  Featured Drops
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Our most coveted pieces that define the essence of street
                  culture
                </p>
              </div>

              {/* Home Page Style Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[80vh] mb-16">
                {/* Left Side - Large Featured */}
                <div className="relative group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                  <img
                    src={featuredProducts[0]?.imageUrl}
                    alt={featuredProducts[0]?.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-center p-12">
                    <div className="space-y-6 transform transition-all duration-700 group-hover:translate-x-4">
                      <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                        FEATURED DROP
                      </span>
                      <h3 className="text-4xl md:text-6xl font-black leading-tight">
                        {featuredProducts[0]?.name}
                      </h3>
                      <p className="text-xl text-gray-300 max-w-md leading-relaxed">
                        {featuredProducts[0]?.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold">
                          $
                          {featuredProducts[0]?.discountPrice ||
                            featuredProducts[0]?.price}
                        </div>
                        {featuredProducts[0]?.discountPrice && (
                          <div className="text-lg text-gray-400 line-through">
                            ${featuredProducts[0]?.price}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/product/${featuredProducts[0]?.id}`}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-lg hover:from-gray-100 hover:to-white transition-all duration-300 group"
                      >
                        <span>Shop Now</span>
                        <FiEye className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Side - Split Grid */}
                <div className="grid grid-rows-2 gap-0">
                  {featuredProducts.slice(1, 3).map((product, index) => (
                    <div
                      key={product.id}
                      className="relative group cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent z-10"></div>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
                        <div className="space-y-4 transform transition-all duration-700 group-hover:translate-x-4">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                            {product.category.toUpperCase()}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-black leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-gray-300 text-sm max-w-xs">
                            {product.description}
                          </p>
                          <div className="flex items-center space-x-3">
                            <div className="text-xl font-bold">
                              ${product.discountPrice || product.price}
                            </div>
                            {product.discountPrice && (
                              <div className="text-sm text-gray-400 line-through">
                                ${product.price}
                              </div>
                            )}
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="inline-flex items-center text-white hover:text-gray-300 transition-colors duration-300 group"
                          >
                            <span className="text-sm font-medium">
                              View Details
                            </span>
                            <FiEye className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Zeus Style */}
        <div className="relative py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Find Your Vibe
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Filter through our streetwear collection and discover pieces
                that match your unique style
              </p>
            </div>

            {/* Main Search - Zeus Style */}
            <div className="mb-16">
              <div className="relative max-w-4xl mx-auto">
                <div className="relative backdrop-blur-sm bg-white/5 border border-white/20 rounded-3xl p-2 hover:bg-white/10 transition-all duration-500 group">
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <FiSearch
                        className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors duration-300"
                        size={28}
                      />
                      <input
                        type="text"
                        placeholder="Search the streets... hoodies, tees, jackets, accessories"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-20 pr-8 py-6 bg-transparent text-white placeholder-gray-400 text-xl font-light focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pr-4">
                      <div className="w-px h-12 bg-white/20"></div>
                      <div className="text-sm text-gray-400 font-medium">
                        {sortedProducts.length} found
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Grid - Zeus Style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-16">
              {/* Left Side - Filters */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/70"></div>
                <div className="relative z-20 p-12 h-full min-h-[400px] flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white mb-6">
                        Filter Collection
                      </h3>

                      {/* Category Filter */}
                      <div className="space-y-3">
                        <label className="flex items-center text-sm font-medium text-gray-300 uppercase tracking-wider">
                          <FiTag className="mr-3" size={18} />
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white text-lg transition-all duration-300"
                        >
                          <option value="" className="bg-gray-900">
                            All Categories
                          </option>
                          {categories.map((category) => (
                            <option
                              key={category.id}
                              value={category.name}
                              className="bg-gray-900"
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                          Price Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="number"
                              placeholder="Min $"
                              value={priceRange.min}
                              onChange={(e) =>
                                setPriceRange({
                                  ...priceRange,
                                  min: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white placeholder-gray-400 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Max $"
                              value={priceRange.max}
                              onChange={(e) =>
                                setPriceRange({
                                  ...priceRange,
                                  max: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white placeholder-gray-400 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white text-lg transition-all duration-300"
                        >
                          <option value="name" className="bg-gray-900">
                            Name A-Z
                          </option>
                          <option value="price_low" className="bg-gray-900">
                            Price: Low to High
                          </option>
                          <option value="price_high" className="bg-gray-900">
                            Price: High to Low
                          </option>
                          <option value="rating" className="bg-gray-900">
                            Highest Rated
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Controls & Actions */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-gray-900/50 to-black/70"></div>
                <div className="relative z-20 p-12 h-full min-h-[400px] flex flex-col justify-center">
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-white mb-6">
                      View Options
                    </h3>

                    {/* View Mode Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Display Mode
                      </label>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                            viewMode === "grid"
                              ? "bg-gradient-to-r from-white to-gray-200 text-black font-bold"
                              : "text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <FiGrid size={20} />
                          <span>Grid</span>
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                            viewMode === "list"
                              ? "bg-gradient-to-r from-white to-gray-200 text-black font-bold"
                              : "text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <FiList size={20} />
                          <span>List</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Filters Preview */}
                    {(searchTerm ||
                      selectedCategory ||
                      priceRange.min ||
                      priceRange.max) && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                          Active Filters
                        </label>
                        <div className="space-y-2">
                          {searchTerm && (
                            <div className="flex items-center justify-between px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                              <span className="text-blue-300 text-sm">
                                Search: "{searchTerm}"
                              </span>
                              <button
                                onClick={() => setSearchTerm("")}
                                className="text-blue-300 hover:text-white transition-colors duration-200"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          {selectedCategory && (
                            <div className="flex items-center justify-between px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                              <span className="text-green-300 text-sm">
                                {selectedCategory}
                              </span>
                              <button
                                onClick={() => setSelectedCategory("")}
                                className="text-green-300 hover:text-white transition-colors duration-200"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          {(priceRange.min || priceRange.max) && (
                            <div className="flex items-center justify-between px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                              <span className="text-purple-300 text-sm">
                                ${priceRange.min || "0"} - $
                                {priceRange.max || "∞"}
                              </span>
                              <button
                                onClick={() =>
                                  setPriceRange({ min: "", max: "" })
                                }
                                className="text-purple-300 hover:text-white transition-colors duration-200"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Clear All Button */}
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                        setPriceRange({ min: "", max: "" });
                      }}
                      className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Clear All Filters
                    </button>

                    {/* Results Summary */}
                    <div className="border-t border-white/20 pt-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white font-semibold">
                          {sortedProducts.length} Products Found
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <FiTrendingUp className="text-green-400" />
                          <span>Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div id="products-section" className="relative py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Complete Collection
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-gray-400">
                  Showing {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, sortedProducts.length)} of{" "}
                  {sortedProducts.length} products
                  {currentPage > 1 && (
                    <span className="ml-2 text-sm">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </div>

                {/* Products per page selector */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">Show:</span>
                  <select
                    value={productsPerPage}
                    onChange={(e) => setProductsPerPage(Number(e.target.value))}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white text-sm"
                  >
                    <option value={8} className="bg-gray-900">
                      8 per page
                    </option>
                    <option value={12} className="bg-gray-900">
                      12 per page
                    </option>
                    <option value={16} className="bg-gray-900">
                      16 per page
                    </option>
                    <option value={24} className="bg-gray-900">
                      24 per page
                    </option>
                    <option
                      value={sortedProducts.length}
                      className="bg-gray-900"
                    >
                      All ({sortedProducts.length})
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl transition-all duration-500 hover:scale-105 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10">
                      
                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden rounded-t-2xl">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Discount Badge */}
                        {product.discountPrice && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold backdrop-blur-sm">
                            {Math.round(
                              ((product.price - product.discountPrice) /
                                product.price) *
                                100
                            )}
                            % OFF
                          </div>
                        )}

                        {/* Stock Status Overlay */}
                        {!(product.stockQuantity > 0) && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                            <div className="text-center">
                              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                                Out of Stock
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Rating Badge */}
                        {product.rating && (
                          <div className="absolute bottom-4 right-4">
                            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                              <FiStar className="text-yellow-400 fill-current" size={12} />
                              <span className="text-white text-xs font-medium">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        {/* Category and Stock Status */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                            {product.category}
                          </span>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                (product.stockQuantity > 0) ? "bg-green-400" : "bg-red-400"
                              }`}
                            ></div>
                            <span
                              className={`text-xs font-medium ${
                                (product.stockQuantity > 0)
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(product.stockQuantity > 0) ? `Stock: ${product.stockQuantity}` : "Out of Stock"}
                            </span>
                          </div>
                        </div>

                        {/* Product Name */}
                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xs text-gray-400">Colors:</span>
                            {product.colors.slice(0, 4).map((color) => (
                              <div
                                key={color}
                                className="w-3 h-3 rounded-full border border-white/30"
                                style={{
                                  backgroundColor: 
                                    color === "Black" ? "#000000" :
                                    color === "White" ? "#FFFFFF" :
                                    color === "Gray" ? "#6B7280" :
                                    color === "Navy" ? "#1E3A8A" :
                                    color === "Olive" ? "#365314" :
                                    color === "Red" ? "#DC2626" :
                                    color === "Cream" ? "#FEF3C7" :
                                    color === "Khaki" ? "#A16207" :
                                    "#9CA3AF"
                                }}
                              ></div>
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white">
                                  ${product.discountPrice}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.price}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-white">
                                ${product.price}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex items-center text-white hover:text-gray-300 transition-colors duration-200">
                                <span className="text-sm font-medium mr-1">View</span>
                                <FiEye size={16} />
                              </div>
                            </div>
                            
                            {/* Add to Cart Button */}
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={!(product.stockQuantity > 0)}
                              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-lg ${
                                product.stockQuantity > 0
                                  ? 'bg-white/10 hover:bg-white/20 text-white hover:scale-110'
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                              title={product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                            >
                              <FiShoppingCart size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // List View - Modern Card Style
              <div className="space-y-6">
                {currentProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group block"
                  >
                    <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10">
                      <div className="flex flex-col md:flex-row gap-6">
                        
                        {/* Product Image */}
                        <div className="md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Discount Badge */}
                          {product.discountPrice && (
                            <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-lg text-sm font-bold">
                              {Math.round(
                                ((product.price - product.discountPrice) /
                                  product.price) *
                                  100
                              )}
                              % OFF
                            </div>
                          )}

                          {/* Stock Overlay */}
                          {!(product.stockQuantity > 0) && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm rounded-xl">
                              <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {/* Category and Rating */}
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="text-xs uppercase tracking-wider text-gray-400 font-medium px-2 py-1 bg-white/10 rounded">
                                  {product.category}
                                </span>
                                {product.rating && (
                                  <div className="flex items-center space-x-1">
                                    <FiStar className="text-yellow-400 fill-current" size={14} />
                                    <span className="text-sm text-gray-300">
                                      {product.rating}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Product Name */}
                              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300">
                                {product.name}
                              </h3>

                              {/* Product Description (if available) */}
                              {product.description && (
                                <p className="text-gray-400 mb-4 line-clamp-2">
                                  {product.description}
                                </p>
                              )}

                              {/* Colors and Stock */}
                              <div className="flex items-center justify-between">
                                {/* Colors */}
                                {product.colors && product.colors.length > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400">Colors:</span>
                                    {product.colors.slice(0, 5).map((color) => (
                                      <div
                                        key={color}
                                        className="w-4 h-4 rounded-full border border-white/30"
                                        style={{
                                          backgroundColor: 
                                            color === "Black" ? "#000000" :
                                            color === "White" ? "#FFFFFF" :
                                            color === "Gray" ? "#6B7280" :
                                            color === "Navy" ? "#1E3A8A" :
                                            color === "Olive" ? "#365314" :
                                            color === "Red" ? "#DC2626" :
                                            color === "Cream" ? "#FEF3C7" :
                                            color === "Khaki" ? "#A16207" :
                                            "#9CA3AF"
                                        }}
                                      ></div>
                                    ))}
                                    {product.colors.length > 5 && (
                                      <span className="text-xs text-gray-400">+{product.colors.length - 5}</span>
                                    )}
                                  </div>
                                )}

                                {/* Stock Status */}
                                <div className="flex items-center space-x-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      (product.stockQuantity > 0) ? "bg-green-400" : "bg-red-400"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-sm font-medium ${
                                      (product.stockQuantity > 0)
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {(product.stockQuantity > 0) ? `Stock: ${product.stockQuantity}` : "Out of Stock"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price and Action */}
                            <div className="text-right ml-6">
                              {/* Price */}
                              <div className="mb-4">
                                {product.discountPrice ? (
                                  <div>
                                    <div className="text-3xl font-bold text-white">
                                      ${product.discountPrice}
                                    </div>
                                    <div className="text-lg text-gray-500 line-through">
                                      ${product.price}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-3xl font-bold text-white">
                                    ${product.price}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-3">
                                <div className="flex items-center justify-end text-white hover:text-gray-300 transition-colors duration-200">
                                  <span className="text-sm font-medium mr-2">View Details</span>
                                  <FiEye size={18} />
                                </div>
                                
                                {/* Add to Cart Button */}
                                <button
                                  onClick={(e) => handleAddToCart(product, e)}
                                  disabled={!(product.stockQuantity > 0)}
                                  className={`flex items-center justify-end space-x-2 w-full transition-all duration-300 ${
                                    product.stockQuantity > 0
                                      ? 'text-white hover:text-gray-300 hover:scale-105'
                                      : 'text-gray-400 cursor-not-allowed'
                                  }`}
                                  title={product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                >
                                  <span className="text-sm font-medium">Add to Cart</span>
                                  <FiShoppingCart size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {renderPagination()}

            {/* No Results */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-6">
                  <FiSearch size={64} className="mx-auto opacity-50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No products found
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  We couldn't find any products matching your search criteria.
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setPriceRange({ min: "", max: "" });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-lg hover:from-gray-100 hover:to-white transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
