import React, { useState, useEffect } from 'react';
import RevenueBarChart from './RevenueBarChart';
import AdminOrderManagement from './AdminOrderManagement';
import AdminStats from './AdminStats';

const menuItems = [
  { key: 'products', label: 'Quản lý sản phẩm' },
  { key: 'categories', label: 'Quản lý danh mục' },
  { key: 'users', label: 'Quản lý người dùng' },
  { key: 'orders', label: 'Quản lý đơn hàng' },
  { key: 'stats', label: 'Thống kê hệ thống' },
  { key: 'revenue', label: 'Thống kê doanh thu' },
  { key: 'logout', label: 'Đăng xuất' }
];

function AdminDashboard({ onLogout }) {
  const [active, setActive] = useState('products');
  const [products, setProducts] = useState([]);
  
  // State cho search
  const [searchTerm, setSearchTerm] = useState('');
  const [quantitySearch, setQuantitySearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Hàm xử lý đường dẫn ảnh
  const buildImageUrl = (raw) => {
    if (!raw) return '';
    let path = String(raw).replace(/\\/g, '/').trim();
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('uploads')) path = '/' + path;
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`;
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
  };

  // State quản lý user
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    role: 'customer'
  });
  const [addUserError, setAddUserError] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // State sửa người dùng
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    address: '',
    phone: '',
    role: 'customer'
  });
  const [editUserError, setEditUserError] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  // State thêm sản phẩm
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', quantity: '', category: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State quản lý category
  const [categories, setCategories] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', isActive: true });
  const [categoryError, setCategoryError] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  
  // State sửa category
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [editCategory, setEditCategory] = useState({ name: '', description: '', isActive: true });
  const [editCategoryError, setEditCategoryError] = useState('');
  const [editCategoryImageFile, setEditCategoryImageFile] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  
  // State xem sản phẩm theo danh mục
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  // State sửa sản phẩm
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProduct, setEditProduct] = useState({ name: '', price: '', description: '', quantity: '', category: '', image: '' });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // Sửa người dùng
  const handleEditUser = (user) => {
    setEditUserId(user._id);
    setEditUser({
      username: user.username || '',
      email: user.email || '',
      address: user.address || '',
      phone: user.phone || '',
      role: user.role || 'customer'
    });
    setEditUserError('');
    setShowEditUserForm(true);
  };

  // Cập nhật người dùng
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditUserError('');
    setIsUpdatingUser(true);
    
    if (!editUser.username || !editUser.email) {
      setEditUserError('Tên đăng nhập và email là bắt buộc!');
      setIsUpdatingUser(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${editUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      
      setUsers(prev => prev.map(u => u._id === editUserId ? data : u));
      setShowEditUserForm(false);
      setEditUser({
        username: '',
        email: '',
        address: '',
        phone: '',
        role: 'customer'
      });
      setEditUserError('');
      setEditUserId(null);
    } catch (err) {
      setEditUserError(err.message);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Xóa người dùng
  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa người dùng này?');
    if (!confirmDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể xóa người dùng');
      
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Thêm người dùng
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setIsAddingUser(true);
    
    if (!newUser.username || !newUser.email || !newUser.password) {
      setAddUserError('Tên đăng nhập, email và mật khẩu là bắt buộc!');
      setIsAddingUser(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      
      setUsers(prev => [...prev, data]);
      setShowAddUserForm(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        role: 'customer'
      });
      setAddUserError('');
    } catch (err) {
      setAddUserError(err.message);
    } finally {
      setIsAddingUser(false);
    }
  };

  // Fetch data khi đổi menu
  useEffect(() => {
    if (active === 'products') {
      setLoading(true);
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Không thể tải sản phẩm');
          setLoading(false);
        });
      
      // Load categories
      fetch('http://localhost:5000/api/categories')
        .then(res => res.json())
        .then(data => {
          setCategories(data);
        })
        .catch(() => {
          console.error('Không thể tải danh mục');
        });
    } else if (active === 'users') {
      setUserLoading(true);
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/users', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            setUserError(data.error || 'Không thể tải người dùng');
            setUserLoading(false);
            return;
          }
          setUsers(data);
          setUserLoading(false);
        })
        .catch(err => {
          setUserError('Không thể tải người dùng: ' + err.message);
          setUserLoading(false);
        });
    }
  }, [active]);

  // Filter products function
  const filterProducts = () => {
    let filtered = [...products];
    
    // Filter by name
    if (searchTerm.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by quantity
    if (quantitySearch.trim()) {
      const quantity = parseInt(quantitySearch);
      if (!isNaN(quantity)) {
        filtered = filtered.filter(product => product.quantity === quantity);
      }
    }
    
    setFilteredProducts(filtered);
  };

  // Update filtered products when products, searchTerm, or quantitySearch changes
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, quantitySearch]);

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    if (!id) return;
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa sản phẩm này?');
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể xóa sản phẩm');
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      
      // Cập nhật danh sách sản phẩm trong category view nếu đang xem
      if (showCategoryProducts && selectedCategory) {
        setCategoryProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Thêm sản phẩm
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newProduct.name || !newProduct.price) {
      setAddError('Tên và giá sản phẩm là bắt buộc!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', Number(newProduct.price));
      formData.append('description', newProduct.description);
      formData.append('quantity', Number(newProduct.quantity) || 0);
      formData.append('category', newProduct.category);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      setProducts(prev => [...prev, data]);
      
      // Cập nhật danh sách sản phẩm trong category view nếu đang xem và sản phẩm thuộc category đó
      if (showCategoryProducts && selectedCategory && data.category === selectedCategory._id) {
        setCategoryProducts(prev => [...prev, data]);
      }
      
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', description: '', quantity: '', category: '', image: '' });
      setImageFile(null);
      setImagePreview(null);
      setAddError('');
    } catch (err) {
      setAddError(err.message);
    }
  };

  // Mở form sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditProductId(product._id || product.id);
    setEditProduct({
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      quantity: product.quantity || '',
      category: product.category?._id || product.category || '',
      image: product.image || ''
    });
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditError('');
    setShowEditForm(true);
  };

  // Sửa sản phẩm
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsUpdating(true);
    
    if (!editProduct.name || !editProduct.price) {
      setEditError('Tên và giá sản phẩm là bắt buộc!');
      setIsUpdating(false);
      return;
    }
    
    try {
      let res;
      if (editImageFile) {
        // Nếu có file ảnh mới, gửi FormData
        const formData = new FormData();
        formData.append('name', editProduct.name);
        formData.append('price', Number(editProduct.price));
        formData.append('description', editProduct.description);
        formData.append('quantity', Number(editProduct.quantity) || 0);
        formData.append('category', editProduct.category);
        formData.append('image', editImageFile);

        res = await fetch(`http://localhost:5000/api/products/${editProductId}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // Nếu không có file ảnh mới, gửi JSON
        res = await fetch(`http://localhost:5000/api/products/${editProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editProduct.name,
            price: Number(editProduct.price),
            description: editProduct.description,
            quantity: Number(editProduct.quantity) || 0,
            category: editProduct.category
          })
        });
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      
      setProducts(prev => prev.map(p => (p._id === editProductId || p.id === editProductId) ? data : p));
      
      // Cập nhật danh sách sản phẩm trong category view nếu đang xem
      if (showCategoryProducts && selectedCategory) {
        setCategoryProducts(prev => prev.map(p => (p._id === editProductId || p.id === editProductId) ? data : p));
      }
      
      setShowEditForm(false);
      setEditProduct({ name: '', price: '', description: '', quantity: '', category: '', image: '' });
      setEditImageFile(null);
      setEditImagePreview(null);
      setEditError('');
      setEditProductId(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quản lý category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    
    if (!newCategory.name) {
      setCategoryError('Tên danh mục không được để trống');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description);
      formData.append('isActive', newCategory.isActive);
      
      if (categoryImageFile) {
        formData.append('image', categoryImageFile);
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi không xác định');
      
      setCategories(prev => [...prev, data]);
      setNewCategory({ name: '', description: '', isActive: true });
      setCategoryImageFile(null);
      setShowAddCategoryForm(false);
    } catch (err) {
      setCategoryError(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa danh mục này?');
    if (!confirmDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi không xác định');
      }
      
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setEditCategoryId(category._id);
    setEditCategoryImageFile(null);
    setEditCategoryError('');
    setShowEditCategoryForm(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setEditCategoryError('');
    
    if (!editCategory.name) {
      setEditCategoryError('Tên danh mục không được để trống');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', editCategory.name);
      formData.append('description', editCategory.description);
      formData.append('isActive', editCategory.isActive);
      
      if (editCategoryImageFile) {
        formData.append('image', editCategoryImageFile);
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${editCategoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi không xác định');
      
      setCategories(prev => prev.map(c => c._id === editCategoryId ? data : c));
      setShowEditCategoryForm(false);
      setEditCategory({ name: '', description: '', isActive: true });
      setEditCategoryImageFile(null);
      setEditCategoryId(null);
    } catch (err) {
      setEditCategoryError(err.message);
    }
  };

  const handleViewCategoryProducts = async (category) => {
    try {
      setSelectedCategory(category);
      setShowCategoryProducts(true);
      
      // Load products của category này
      const response = await fetch(`http://localhost:5000/api/products?category=${category._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategoryProducts(data);
      } else {
        setCategoryProducts([]);
      }
    } catch (err) {
      console.error('Error loading category products:', err);
      setCategoryProducts([]);
    }
  };

  // Render nội dung theo tab
  const renderContent = () => {
    switch (active) {
      case 'products':
        return (
          <div>
            {/* Action Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '16px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <h3 style={{ margin: 0, color: '#495057', fontSize: '18px', fontWeight: '600' }}>
                  Danh sách sản phẩm ({filteredProducts.length}{filteredProducts.length !== products.length ? ` / ${products.length}` : ''})
                </h3>
                {loading && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6c757d',
                    fontSize: '14px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #e9ecef',
                      borderTop: '2px solid #007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Đang tải...
                  </div>
                )}
              </div>
              
              {/* Search Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: 1,
                justifyContent: 'center',
                maxWidth: '600px'
              }}>
                {/* Search by name */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 16px 10px 40px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d',
                    fontSize: '16px'
                  }}>
                    🔍
                  </div>
                </div>
                
                {/* Search by quantity */}
                <div style={{ position: 'relative', maxWidth: '150px' }}>
                  <input
                    type="number"
                    placeholder="Số lượng"
                    min="0"
                    value={quantitySearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && !isNaN(parseInt(value)))) {
                        setQuantitySearch(value);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px 10px 40px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d',
                    fontSize: '16px'
                  }}>
                    📦
                  </div>
                </div>
                
                {/* Clear search */}
                {(searchTerm || quantitySearch) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setQuantitySearch('');
                    }}
                    style={{
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#5a6268';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#6c757d';
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowAddForm(f => !f)}
                style={{
                  background: showAddForm ? '#dc3545' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {showAddForm ? (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Đóng
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Thêm sản phẩm mới
                  </>
                )}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <div style={{
                background: '#f8f9fa',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Thêm sản phẩm mới</h4>
                <form onSubmit={handleAddProduct}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tên sản phẩm *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Giá *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Danh mục *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.filter(cat => cat.isActive).map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Số lượng</label>
                      <input
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Mô tả</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px',
                        minHeight: '80px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Hình ảnh</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setImageFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setImagePreview(e.target.result);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    {imagePreview && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 8px 0' }}>Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e9ecef',
                            background: '#f8f9fa'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {addError && (
                    <div style={{ color: '#dc3545', marginBottom: '16px', fontSize: '14px' }}>
                      {addError}
                    </div>
                  )}
                  <button
                    type="submit"
                    style={{
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Thêm sản phẩm
                  </button>
                </form>
              </div>
            )}

            {/* Products Table */}
            {error ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#dc3545',
                background: '#f8d7da',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e9ecef'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead style={{
                    background: '#f8f9fa'
                  }}>
                    <tr>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>ID</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Hình ảnh</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Tên sản phẩm</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Giá</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Số lượng</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Danh mục</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, index) => (
                      <tr key={p._id || p.id} style={{
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <td style={{
                          padding: '16px',
                          fontSize: '13px',
                          color: '#6c757d',
                          fontFamily: 'monospace',
                          fontWeight: '600'
                        }}>{index + 1}</td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          {p.image ? (
                            <img
                              src={buildImageUrl(p.image)}
                              alt={p.name}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #e9ecef',
                                background: '#f8f9fa'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            border: '2px solid #e9ecef',
                            display: p.image ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d',
                            fontSize: '12px',
                            textAlign: 'center'
                          }}>
                            📷
                          </div>
                        </td>
                        <td style={{
                          padding: '16px',
                          fontWeight: '500',
                          color: '#495057'
                        }}>{p.name}</td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#28a745'
                        }}>{p.price.toLocaleString()}₫</td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: p.quantity > 0 ? '#d4edda' : '#f8d7da',
                            color: p.quantity > 0 ? '#155724' : '#721c24'
                          }}>
                            {p.quantity ?? 0}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'left'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#e3f2fd',
                            color: '#1976d2'
                          }}>
                            {p.category?.name || 'Chưa phân loại'}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <button 
                              onClick={() => handleEditProduct(p)}
                              style={{
                                background: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#0056b3';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#007bff';
                              }}
                            >
                              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                              Sửa
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p._id || p.id)}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#c82333';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#dc3545';
                              }}
                            >
                              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                              </svg>
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'categories':
        return (
          <div>
            {/* Action Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: 0, color: '#495057' }}>Quản lý danh mục</h3>
              <button
                onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                style={{
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#218838';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#28a745';
                }}
              >
                {showAddCategoryForm ? (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Hủy
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Thêm danh mục mới
                  </>
                )}
              </button>
            </div>

            {/* Add Category Form */}
            {showAddCategoryForm && (
              <div style={{
                background: '#f8f9fa',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Thêm danh mục mới</h4>
                <form onSubmit={handleAddCategory}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tên danh mục *</label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Mô tả</label>
                      <input
                        type="text"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Hình ảnh</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCategoryImageFile(e.target.files[0])}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input
                          type="checkbox"
                          checked={newCategory.isActive}
                          onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                          style={{ margin: 0 }}
                        />
                        <span style={{ fontWeight: '500' }}>Kích hoạt</span>
                      </label>
                    </div>
                  </div>
                  
                  {categoryError && (
                    <div style={{
                      background: '#f8d7da',
                      color: '#721c24',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '16px',
                      border: '1px solid #f5c6cb'
                    }}>
                      {categoryError}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Thêm danh mục
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategoryForm(false);
                        setNewCategory({ name: '', description: '', isActive: true });
                        setCategoryImageFile(null);
                        setCategoryError('');
                      }}
                      style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Category Form */}
            {showEditCategoryForm && (
              <div style={{
                background: '#f8f9fa',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Sửa danh mục</h4>
                <form onSubmit={handleUpdateCategory}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tên danh mục *</label>
                      <input
                        type="text"
                        value={editCategory.name}
                        onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Mô tả</label>
                      <input
                        type="text"
                        value={editCategory.description}
                        onChange={(e) => setEditCategory({...editCategory, description: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Hình ảnh mới (tùy chọn)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditCategoryImageFile(e.target.files[0])}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input
                          type="checkbox"
                          checked={editCategory.isActive}
                          onChange={(e) => setEditCategory({...editCategory, isActive: e.target.checked})}
                          style={{ margin: 0 }}
                        />
                        <span style={{ fontWeight: '500' }}>Kích hoạt</span>
                      </label>
                    </div>
                  </div>
                  
                  {editCategoryError && (
                    <div style={{
                      background: '#f8d7da',
                      color: '#721c24',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '16px',
                      border: '1px solid #f5c6cb'
                    }}>
                      {editCategoryError}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cập nhật danh mục
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditCategoryForm(false);
                        setEditCategory({ name: '', description: '', isActive: true });
                        setEditCategoryImageFile(null);
                        setEditCategoryError('');
                        setEditCategoryId(null);
                      }}
                      style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Hình ảnh</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Tên danh mục</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Mô tả</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Trạng thái</th>
                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '16px' }}>
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '50px',
                            height: '50px',
                            background: '#e9ecef',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d',
                            fontSize: '12px'
                          }}>
                            No Image
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{category.name}</td>
                      <td style={{ padding: '16px', color: '#6c757d' }}>{category.description || 'Không có mô tả'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: category.isActive ? '#d4edda' : '#f8d7da',
                          color: category.isActive ? '#155724' : '#721c24'
                        }}>
                          {category.isActive ? 'Kích hoạt' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleViewCategoryProducts(category)}
                            style={{
                              background: '#28a745',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleEditCategory(category)}
                            style={{
                              background: '#007bff',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            style={{
                              background: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category Products View */}
            {showCategoryProducts && selectedCategory && (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginTop: '24px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#f8f9fa',
                  padding: '16px 24px',
                  borderBottom: '1px solid #dee2e6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h4 style={{ margin: 0, color: '#495057' }}>
                    Sản phẩm thuộc danh mục: <span style={{ color: '#007bff' }}>{selectedCategory.name}</span>
                  </h4>
                  <button
                    onClick={() => {
                      setShowCategoryProducts(false);
                      setSelectedCategory(null);
                      setCategoryProducts([]);
                    }}
                    style={{
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Đóng
                  </button>
                </div>

                {categoryProducts.length > 0 ? (
                  <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>STT</th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Hình ảnh</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Tên sản phẩm</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Giá</th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Số lượng</th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryProducts.map((product, index) => (
                          <tr key={product._id || product.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid #e9ecef'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  background: '#f8f9fa',
                                  borderRadius: '6px',
                                  border: '1px solid #e9ecef',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#6c757d',
                                  fontSize: '12px'
                                }}>
                                  📷
                                </div>
                              )}
                              <div style={{
                                width: '50px',
                                height: '50px',
                                background: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef',
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6c757d',
                                fontSize: '12px'
                              }}>
                                📷
                              </div>
                            </td>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{product.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>
                              {product.price?.toLocaleString()}₫
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: product.quantity > 0 ? '#d4edda' : '#f8d7da',
                                color: product.quantity > 0 ? '#155724' : '#721c24'
                              }}>
                                {product.quantity ?? 0}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  style={{
                                    background: '#007bff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product._id || product.id)}
                                  style={{
                                    background: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h5 style={{ margin: '0 0 8px 0', color: '#495057' }}>Chưa có sản phẩm</h5>
                    <p style={{ margin: 0 }}>Danh mục này chưa có sản phẩm nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '16px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: 0, color: '#495057', fontSize: '18px', fontWeight: '600' }}>
                Quản lý người dùng ({users.length})
              </h3>
              <button 
                onClick={() => setShowAddUserForm(f => !f)}
                style={{
                  background: showAddUserForm ? '#dc3545' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showAddUserForm ? 'Đóng' : 'Thêm người dùng mới'}
              </button>
            </div>

            {/* Add User Form */}
            {showAddUserForm && (
              <div style={{
                background: '#f8f9fa',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Thêm người dùng mới</h4>
                <form onSubmit={handleAddUser}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tên đăng nhập *</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email *</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Mật khẩu *</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Vai trò</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Địa chỉ</label>
                      <input
                        type="text"
                        value={newUser.address}
                        onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Số điện thoại</label>
                      <input
                        type="text"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                  {addUserError && (
                    <div style={{ color: '#dc3545', marginBottom: '16px', fontSize: '14px' }}>
                      {addUserError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isAddingUser}
                    style={{
                      background: isAddingUser ? '#6c757d' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isAddingUser ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isAddingUser ? 'Đang thêm...' : 'Thêm người dùng'}
                  </button>
                </form>
              </div>
            )}

            {/* Users Table */}
            {userError ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#dc3545',
                background: '#f8d7da',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>
                {userError}
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e9ecef'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead style={{
                    background: '#f8f9fa'
                  }}>
                    <tr>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Tên đăng nhập</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Email</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Vai trò</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <td style={{
                          padding: '16px',
                          fontWeight: '500',
                          color: '#495057'
                        }}>{user.username}</td>
                        <td style={{
                          padding: '16px',
                          color: '#6c757d',
                          fontSize: '14px'
                        }}>{user.email}</td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: user.role === 'admin' ? '#d1ecf1' : '#d4edda',
                            color: user.role === 'admin' ? '#0c5460' : '#155724'
                          }}>
                            {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <button 
                              onClick={() => handleEditUser(user)}
                              style={{
                                background: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Sửa
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'orders':
        return <AdminOrderManagement />;

      case 'stats':
        return <AdminStats />;

      case 'revenue':
        return <RevenueBarChart />;

      default:
        return <div>Chức năng đang phát triển...</div>;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#343a40',
        color: '#fff',
        padding: '20px 0'
      }}>
        <div style={{
          padding: '0 20px',
          marginBottom: '30px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#fff'
          }}>
            Admin Dashboard
          </h2>
        </div>
        
        <nav>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'logout') {
                  onLogout();
                } else {
                  setActive(item.key);
                }
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: active === item.key ? '#007bff' : 'transparent',
                color: '#fff',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (active !== item.key) {
                  e.target.style.background = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (active !== item.key) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '30px',
        overflow: 'auto'
      }}>
        {renderContent()}
      </div>

      {/* Edit Product Modal */}
      {showEditForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Sửa sản phẩm</h4>
            <form onSubmit={handleUpdateProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Giá *</label>
                  <input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Số lượng</label>
                  <input
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) => setEditProduct({...editProduct, quantity: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Danh mục *</label>
                  <select
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.filter(cat => cat.isActive).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Mô tả</label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '80px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Hình ảnh mới (tùy chọn)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setEditImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setEditImagePreview(e.target.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setEditImagePreview(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                
                {/* Hiển thị ảnh preview hoặc ảnh hiện tại */}
                {editImagePreview ? (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 8px 0' }}>Preview ảnh mới:</p>
                    <img
                      src={editImagePreview}
                      alt="New Preview"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #28a745',
                        background: '#f8f9fa'
                      }}
                    />
                  </div>
                ) : editProduct.image && !editImageFile ? (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 8px 0' }}>Ảnh hiện tại:</p>
                    <img
                      src={buildImageUrl(editProduct.image)}
                      alt="Current"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #e9ecef',
                        background: '#f8f9fa'
                      }}
                    />
                  </div>
                ) : null}
              </div>
              {editError && (
                <div style={{ color: '#dc3545', marginBottom: '16px', fontSize: '14px' }}>
                  {editError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    background: isUpdating ? '#6c757d' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS cho animation loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;