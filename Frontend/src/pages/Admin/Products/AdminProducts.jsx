import React, { useState, useEffect } from 'react';
import { productService } from '../../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    sku: '',
    stockQuantity: '',
    imageUrl: '',
    categoryId: '',
    brand: '',
    weight: '',
    dimensions: '',
    isFeatured: false,
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts({ admin: true });
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        sku: product.sku || '',
        stockQuantity: product.stockQuantity || '',
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId || '',
        brand: product.brand || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        sku: '',
        stockQuantity: '',
        imageUrl: '',
        categoryId: '',
        brand: '',
        weight: '',
        dimensions: '',
        isFeatured: false,
        isActive: true
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await productService.updateProduct({
          ...formData,
          id: editingProduct.id
        });
        setSuccess('Product updated successfully!');
      } else {
        await productService.createProduct(formData);
        setSuccess('Product created successfully!');
      }
      
      setTimeout(() => {
        handleCloseModal();
        fetchProducts();
      }, 1500);
    } catch (error) {
      setError('Error saving product. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge bg={isActive ? 'success' : 'danger'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="admin-products py-4">
      <Container>
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Product Management</h2>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <FiPlus className="me-2" />
                Add Product
              </Button>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  {products.length > 0 ? (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>SKU</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id}>
                            <td>
                              <img 
                                src={product.imageUrl || 'https://picsum.photos/50/50?random=admin'} 
                                alt={product.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                className="rounded"
                              />
                            </td>
                            <td>
                              <div>
                                <strong>{product.name}</strong>
                                {product.isFeatured && (
                                  <Badge bg="warning" text="dark" className="ms-2">Featured</Badge>
                                )}
                              </div>
                            </td>
                            <td>{product.sku}</td>
                            <td>
                              ${parseFloat(product.price || 0).toFixed(2)}
                              {product.discountPrice && (
                                <div className="small text-danger">
                                  Sale: ${parseFloat(product.discountPrice).toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td>
                              <Badge bg={product.stockQuantity > 5 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'danger'}>
                                {product.stockQuantity || 0}
                              </Badge>
                            </td>
                            <td>{getStatusBadge(product.isActive)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleShowModal(product)}
                                >
                                  <FiEdit />
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <FiTrash2 />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No products found</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Product Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SKU *</Form.Label>
                    <Form.Control
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Discount Price</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dimensions</Form.Label>
                    <Form.Control
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      placeholder="L x W x H"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    name="isFeatured"
                    label="Featured Product"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="mb-3"
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Active"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mb-3"
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminProducts;
