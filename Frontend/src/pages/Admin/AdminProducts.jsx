import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiEye,
  FiPackage,
  FiX,
  FiSave
} from 'react-icons/fi';
import { productService, categoryService } from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    sku: '',
    categoryId: '',
    stock: '', // This will map to stockQuantity in backend
    imageUrl: '',
    brand: 'DYNEX',
    material: '',
    color: '',
    gender: 'UNISEX',
    season: 'ALL_SEASON',
    fitType: '',
    pattern: '',
    careInstructions: '',
    isActive: true,
    isFeatured: false
  });

  useEffect(() => {
    fetchCategories().then(() => {
      fetchProducts();
    });
  }, []);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'N/A';
    const category = categories.find(cat => cat.id == categoryId);
    return category ? category.name : 'N/A';
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products with admin=true...');
      const response = await productService.getAllProducts({ admin: 'true' }); // Add admin parameter to get all products including inactive
      console.log('Products response:', response);
      
      if (response.success) {
        // Ensure we have a valid array and each product has required properties
        const validProducts = (response.data || []).map(product => ({
          id: product.id || 0,
          name: product.name || 'Unnamed Product',
          description: product.description || '',
          sku: product.sku || '',
          category: product.category || 'Uncategorized',
          categoryId: product.categoryId || null,
          price: product.price || 0,
          discountPrice: product.discountPrice || null,
          stock: product.stockQuantity || product.stock || 0, // Handle both field names
          stockQuantity: product.stockQuantity || product.stock || 0, // Keep both for compatibility
          status: product.isActive ? 'active' : 'inactive',
          isActive: product.isActive !== false,
          isFeatured: product.isFeatured || false,
          imageUrl: product.imageUrl || '/images/placeholder-product.jpg',
          image: product.imageUrl || '/images/placeholder-product.jpg', // For backward compatibility
          brand: product.brand || 'DYNEX',
          // DYNEX clothing specific fields
          material: product.material || '',
          color: product.color || '',
          gender: product.gender || 'UNISEX',
          season: product.season || 'ALL_SEASON',
          fitType: product.fitType || '',
          pattern: product.pattern || '',
          careInstructions: product.careInstructions || '',
          weight: product.weight || null,
          dimensions: product.dimensions || ''
        }));
        setProducts(validProducts);
        console.log('Loaded products:', validProducts);
      } else {
        console.error('Error fetching products:', response.error);
        // Fallback to mock data if backend fails
        setProducts([
          {
            id: 1,
            name: 'Premium Cotton T-Shirt',
            categoryId: 1,
            category: 'T-Shirts',
            price: 29.99,
            stock: 45,
            stockQuantity: 45,
            status: 'active',
            isActive: true,
            image: '/images/placeholder-product.jpg',
            description: 'High-quality cotton t-shirt',
            material: 'Cotton',
            color: 'White,Black,Navy',
            gender: 'UNISEX'
          },
          {
            id: 2,
            name: 'Denim Jacket',
            categoryId: 5,
            category: 'Jackets',
            price: 89.99,
            stock: 12,
            stockQuantity: 12,
            status: 'active',
            isActive: true,
            image: '/images/placeholder-product.jpg',
            description: 'Classic denim jacket',
            material: 'Denim',
            color: 'Blue',
            gender: 'UNISEX'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await categoryService.getAllCategories();
      console.log('Categories response:', response);
      
      if (response.success) {
        setCategories(response.data || []);
        console.log('Categories set:', response.data);
      } else {
        console.error('Error fetching categories:', response.error);
        // Fallback to some basic categories if backend fails
        setCategories([
          { id: 1, name: 'T-Shirts' },
          { id: 2, name: 'Hoodies' },
          { id: 3, name: 'Jeans' },
          { id: 4, name: 'Dresses' },
          { id: 5, name: 'Jackets' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { id: 1, name: 'T-Shirts' },
        { id: 2, name: 'Hoodies' },
        { id: 3, name: 'Jeans' },
        { id: 4, name: 'Dresses' },
        { id: 5, name: 'Jackets' }
      ]);
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      sku: '',
      categoryId: '',
      stock: '',
      imageUrl: '',
      brand: 'DYNEX',
      material: '',
      color: '',
      gender: 'UNISEX',
      season: 'ALL_SEASON',
      fitType: '',
      pattern: '',
      careInstructions: '',
      isActive: true,
      isFeatured: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // CRUD operations
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        alert('Please fill in all required fields (Name, Price, Stock)');
        return;
      }

      // Convert form data to match backend expected format
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        sku: formData.sku.trim() || null,
        stockQuantity: parseInt(formData.stock), // Backend expects stockQuantity
        imageUrl: formData.imageUrl.trim() || null,
        categoryId: formData.categoryId || null,
        brand: formData.brand.trim() || 'DYNEX',
        // DYNEX clothing specific fields
        material: formData.material.trim() || null,
        color: formData.color.trim() || null,
        gender: formData.gender || 'UNISEX',
        season: formData.season || 'ALL_SEASON',
        fitType: formData.fitType.trim() || null,
        pattern: formData.pattern.trim() || null,
        careInstructions: formData.careInstructions.trim() || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured
      };

      console.log('Sending product data:', productData);

      const response = await productService.createProduct(productData);
      if (response.success) {
        // Refresh products list
        await fetchProducts();
        setShowAddModal(false);
        resetForm();
        alert('Product added successfully!');
      } else {
        alert('Error adding product: ' + response.error);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        alert('Please fill in all required fields (Name, Price, Stock)');
        return;
      }

      // Convert form data to match backend expected format
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        sku: formData.sku.trim() || null,
        stockQuantity: parseInt(formData.stock), // Backend expects stockQuantity
        imageUrl: formData.imageUrl.trim() || null,
        categoryId: formData.categoryId || null,
        brand: formData.brand.trim() || 'DYNEX',
        // DYNEX clothing specific fields
        material: formData.material.trim() || null,
        color: formData.color.trim() || null,
        gender: formData.gender || 'UNISEX',
        season: formData.season || 'ALL_SEASON',
        fitType: formData.fitType.trim() || null,
        pattern: formData.pattern.trim() || null,
        careInstructions: formData.careInstructions.trim() || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured
      };

      console.log('Updating product data:', productData);

      const response = await productService.updateProduct(selectedProduct.id, productData);
      if (response.success) {
        // Refresh products list
        await fetchProducts();
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        alert('Product updated successfully!');
      } else {
        alert('Error updating product: ' + response.error);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await productService.deleteProduct(selectedProduct.id);
      if (response.success) {
        setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
        setShowDeleteModal(false);
        setSelectedProduct(null);
        alert('Product deleted successfully!');
      } else {
        alert('Error deleting product: ' + response.error);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  // Modal handlers
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ? product.price.toString() : '',
      discountPrice: product?.discountPrice ? product.discountPrice.toString() : '',
      sku: product?.sku || '',
      categoryId: product?.categoryId?.toString() || product?.category?.id?.toString() || '',
      stock: (product?.stockQuantity || product?.stock || 0).toString(),
      imageUrl: product?.imageUrl || product?.image || '',
      brand: product?.brand || 'DYNEX',
      material: product?.material || '',
      color: product?.color || '',
      gender: product?.gender || 'UNISEX',
      season: product?.season || 'ALL_SEASON',
      fitType: product?.fitType || '',
      pattern: product?.pattern || '',
      careInstructions: product?.careInstructions || '',
      isActive: product?.isActive !== false,
      isFeatured: product?.isFeatured || false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status, stock, isActive) => {
    const stockQuantity = stock || 0;
    
    if (!isActive || status === 'inactive') {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    } else if (stockQuantity === 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Out of Stock</span>;
    } else if (stockQuantity < 10) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Low Stock</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">In Stock</span>;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    const matchesCategory = filterCategory === 'all' || 
                           product.categoryId == filterCategory || 
                           product.category === filterCategory ||
                           (product.category && product.category.id == filterCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory ({categories.length} categories loaded)</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={openAddModal}
        >
          <FiPlus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <FiFilter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <FiPackage className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: #{product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(product.categoryId) || product.category?.name || product.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stockQuantity || product.stock || 0} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status, product.stockQuantity || product.stock, product.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Product"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit Product"
                        onClick={() => openEditModal(product)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Product"
                        onClick={() => openDeleteModal(product)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new product.'
              }
            </p>
            <div className="mt-6">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
                onClick={openAddModal}
              >
                <FiPlus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiSave className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiSave className="h-4 w-4" />
                  <span>Update Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
