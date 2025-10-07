import React, { useState, useEffect } from 'react';
import RevenueBarChart from './RevenueBarChart';

const menuItems = [
  { key: 'products', label: 'Quản lý sản phẩm' },
  { key: 'users', label: 'Quản lý người dùng' },
  { key: 'orders', label: 'Quản lý đơn hàng' },
  { key: 'revenue', label: 'Thống kê doanh thu' },
  { key: 'logout', label: 'Đăng xuất' }
];

function AdminDashboard({ onLogout }) {
  const [active, setActive] = useState('products');
  const [products, setProducts] = useState([]);

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
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [editSuccess, setEditSuccess] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // State thêm sản phẩm
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', quantity: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State sửa sản phẩm
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProduct, setEditProduct] = useState({ name: '', price: '', description: '', quantity: '', image: '' });
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
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      setProducts(prev => [...prev, data]);
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', description: '', quantity: '', image: '' });
      setImageFile(null);
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
      image: product.image || ''
    });
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
      const res = await fetch(`http://localhost:5000/api/products/${editProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editProduct.name,
          price: Number(editProduct.price),
          description: editProduct.description,
          quantity: Number(editProduct.quantity) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
      
      setProducts(prev => prev.map(p => (p._id === editProductId || p.id === editProductId) ? data : p));
      setShowEditForm(false);
      setEditProduct({ name: '', price: '', description: '', quantity: '', image: '' });
      setEditError('');
      setEditProductId(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsUpdating(false);
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
                  Danh sách sản phẩm ({products.length})
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
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
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
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                              Xóa
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                {products.length === 0 && (
                  <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <p style={{ margin: 0, fontSize: '16px' }}>Chưa có sản phẩm nào</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Hãy thêm sản phẩm đầu tiên của bạn</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'revenue':
        const labels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'];
        const data = [12000000, 15000000, 9000000, 18000000];
        const totalRevenue = data.reduce((sum, val) => sum + val, 0);
        const averageRevenue = Math.round(totalRevenue / data.length);
        const maxRevenue = Math.max(...data);
        const minRevenue = Math.min(...data);
        
        return (
          <div>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Tổng doanh thu
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {totalRevenue.toLocaleString()}₫
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Doanh thu trung bình
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {averageRevenue.toLocaleString()}₫
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Doanh thu cao nhất
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {maxRevenue.toLocaleString()}₫
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Doanh thu thấp nhất
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {minRevenue.toLocaleString()}₫
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                margin: '0 0 24px 0',
                color: '#495057',
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  📊
                </div>
                Biểu đồ doanh thu theo tháng
              </h3>
            <RevenueBarChart data={data} labels={labels} />
            </div>
          </div>
        );

      case 'users':
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
                  Danh sách người dùng ({users.length})
                </h3>
                {userLoading && (
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
              <button 
                onClick={() => setShowAddUserForm(true)}
                style={{
                  background: '#28a745',
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
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Thêm người dùng
              </button>
            </div>

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
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>STT</th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Username</th>
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
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px'
                      }}>Địa chỉ</th>
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
                  {users.map((u, idx) => (
                      <tr key={u._id} style={{
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center',
                          fontWeight: '500',
                          color: '#6c757d'
                        }}>{idx + 1}</td>
                        <td style={{
                          padding: '16px',
                          fontWeight: '500',
                          color: '#495057'
                        }}>{u.username}</td>
                        <td style={{
                          padding: '16px',
                          color: '#495057'
                        }}>{u.email || 'Chưa cập nhật'}</td>
                        <td style={{
                          padding: '16px',
                          color: '#495057'
                        }}>{u.address || 'Chưa cập nhật'}</td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: u.role === 'admin' ? '#d1ecf1' : '#d4edda',
                            color: u.role === 'admin' ? '#0c5460' : '#155724'
                          }}>
                            {u.role === 'admin' ? 'Admin' : 'Customer'}
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
                              onClick={() => handleDeleteUser(u._id)}
                              title="Xóa người dùng"
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#c82333';
                                e.target.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#dc3545';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                {users.length === 0 && (
                  <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <p style={{ margin: 0, fontSize: '16px' }}>Chưa có người dùng nào</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Hãy thêm người dùng đầu tiên</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'orders':
        return (
          <div>
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>📋</div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#495057' }}>
                Quản lý đơn hàng
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '16px' }}>
                Tính năng đang được phát triển
              </p>
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e9ecef',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  Chức năng quản lý đơn hàng sẽ bao gồm:
                </p>
                <ul style={{ margin: '16px 0 0 0', paddingLeft: '20px', fontSize: '14px', textAlign: 'left' }}>
                  <li>Xem danh sách đơn hàng</li>
                  <li>Cập nhật trạng thái đơn hàng</li>
                  <li>Thống kê đơn hàng theo thời gian</li>
                  <li>Xuất báo cáo đơn hàng</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎯</div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#495057' }}>
              Chào mừng đến với Admin Panel
            </h3>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Hãy chọn một chức năng từ menu bên trái để bắt đầu
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f8f9fa'
      }}>
      {/* Sidebar */}
      <div style={{ 
        width: 280, 
        background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
        padding: '24px 0',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000
      }}>
        {/* Logo/Header */}
        <div style={{
          padding: '0 24px 32px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px'
        }}>
          <h1 style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e3c72',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              GP
            </div>
            Admin Panel
          </h1>
        </div>

        {/* Menu Items */}
        <div style={{ padding: '0 16px' }}>
        {menuItems.map(m => (
          <div key={m.key}
              onClick={() => {
                if (m.key === 'logout') {
                  const confirmLogout = window.confirm('Bạn có chắc muốn đăng xuất?');
                  if (confirmLogout) {
                    if (onLogout) {
                      onLogout();
                    } else {
                      localStorage.removeItem('token');
                      window.location.reload();
                    }
                  }
                } else {
                  setActive(m.key);
                }
              }}
            style={{
                padding: '16px 20px',
                marginBottom: '4px',
              cursor: 'pointer',
                borderRadius: '12px',
                background: active === m.key 
                  ? 'rgba(255,255,255,0.15)' 
                  : m.key === 'logout' 
                    ? 'rgba(220,53,69,0.1)' 
                    : 'transparent',
                color: active === m.key 
                  ? '#fff' 
                  : m.key === 'logout' 
                    ? '#ff6b6b' 
                    : 'rgba(255,255,255,0.8)',
                fontWeight: active === m.key ? '600' : '400',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                borderLeft: active === m.key ? '4px solid #fff' : '4px solid transparent',
                ':hover': {
                  background: m.key === 'logout' 
                    ? 'rgba(220,53,69,0.2)' 
                    : 'rgba(255,255,255,0.1)'
                }
              }}
              onMouseEnter={(e) => {
                if (m.key !== 'logout' && !active === m.key) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                } else if (m.key === 'logout') {
                  e.target.style.background = 'rgba(220,53,69,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (m.key !== 'logout' && !active === m.key) {
                  e.target.style.background = 'transparent';
                } else if (m.key === 'logout') {
                  e.target.style.background = 'rgba(220,53,69,0.1)';
                }
              }}>
              
              {/* Icons */}
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.key === 'products' && (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                )}
                {m.key === 'users' && (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                )}
                {m.key === 'orders' && (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                )}
                {m.key === 'revenue' && (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                )}
                {m.key === 'logout' && (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              
            {m.label}
          </div>
        ))}
      </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          right: '24px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          © 2024 GadgetPhone Admin
        </div>
      </div>

      {/* Main content */}
      <div style={{ 
        flex: 1, 
        padding: '32px',
        background: '#f8f9fa',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px 32px',
          marginBottom: '32px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {active === 'products' && (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  📦
                </div>
                Quản lý sản phẩm
              </>
            )}
            {active === 'users' && (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  👥
                </div>
                Quản lý người dùng
              </>
            )}
            {active === 'orders' && (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  📋
                </div>
                Quản lý đơn hàng
              </>
            )}
            {active === 'revenue' && (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  📊
                </div>
                Thống kê doanh thu
              </>
            )}
          </h2>
        </div>

        {/* Content */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
          minHeight: '600px'
        }}>
        {renderContent()}
      </div>
    </div>

      {/* Add Product Popup */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  📦
                </div>
                Thêm sản phẩm mới
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewProduct({ name: '', price: '', description: '', quantity: '', image: '' });
                  setImageFile(null);
                  setAddError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.color = '#dc3545';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#6c757d';
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProduct} encType="multipart/form-data" style={{
              padding: '32px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Tên sản phẩm *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên sản phẩm"
                    value={newProduct.name}
                    onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Giá (VND) *
                  </label>
                  <input 
                    type="number" 
                    placeholder="Nhập giá sản phẩm"
                    value={newProduct.price}
                    onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Số lượng
                  </label>
                  <input 
                    type="number" 
                    placeholder="Nhập số lượng"
                    value={newProduct.quantity}
                    onChange={e => setNewProduct(p => ({ ...p, quantity: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Hình ảnh
                  </label>
                  <div style={{
                    border: '2px dashed #e9ecef',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'border-color 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#007bff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                  }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setImageFile(e.target.files[0])}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ color: '#6c757d', fontSize: '14px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                      {imageFile ? (
                        <div>
                          <div style={{ fontWeight: '600', color: '#28a745' }}>✓ Đã chọn file</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>{imageFile.name}</div>
                        </div>
                      ) : (
                        <div>
                          <div>Nhấp để chọn hình ảnh</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>JPG, PNG, GIF (tối đa 10MB)</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Mô tả sản phẩm
                  </label>
                  <textarea 
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    value={newProduct.description}
                    onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      minHeight: '100px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit',
                      lineHeight: '1.5'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {addError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {addError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProduct({ name: '', price: '', description: '', quantity: '', image: '' });
                    setImageFile(null);
                    setAddError('');
                  }}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5a6268';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#0056b3';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#007bff';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Popup */}
      {showEditForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  ✏️
                </div>
                Sửa sản phẩm
              </h3>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditProduct({ name: '', price: '', description: '', quantity: '', image: '' });
                  setEditError('');
                  setEditProductId(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.color = '#dc3545';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#6c757d';
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProduct} style={{
              padding: '32px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Tên sản phẩm *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên sản phẩm"
                    value={editProduct.name}
                    onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Giá (VND) *
                  </label>
                  <input 
                    type="number" 
                    placeholder="Nhập giá sản phẩm"
                    value={editProduct.price}
                    onChange={e => setEditProduct(p => ({ ...p, price: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Số lượng
                  </label>
                  <input 
                    type="number" 
                    placeholder="Nhập số lượng"
                    value={editProduct.quantity}
                    onChange={e => setEditProduct(p => ({ ...p, quantity: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                </div>


                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Mô tả sản phẩm
                  </label>
                  <textarea 
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    value={editProduct.description}
                    onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      minHeight: '100px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit',
                      lineHeight: '1.5'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {editError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {editError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditProduct({ name: '', price: '', description: '', quantity: '', image: '' });
                    setEditError('');
                    setEditProductId(null);
                  }}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5a6268';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    background: isUpdating ? '#6c757d' : '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isUpdating ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) {
                      e.target.style.background = '#218838';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpdating) {
                      e.target.style.background = '#28a745';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isUpdating ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Cập nhật sản phẩm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Popup */}
      {showAddUserForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  👤
                </div>
                Thêm người dùng mới
              </h3>
              <button
                onClick={() => {
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
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.color = '#dc3545';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#6c757d';
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUser} style={{
              padding: '32px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Tên đăng nhập *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên đăng nhập"
                    value={newUser.username}
                    onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Email *
                  </label>
                  <input 
                    type="email" 
                    placeholder="Nhập email"
                    value={newUser.email}
                    onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Mật khẩu *
                  </label>
                  <input 
                    type="password" 
                    placeholder="Nhập mật khẩu"
                    value={newUser.password}
                    onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Số điện thoại
                  </label>
                  <input 
                    type="tel" 
                    placeholder="Nhập số điện thoại"
                    value={newUser.phone}
                    onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Vai trò
                  </label>
                  <select 
                    value={newUser.role}
                    onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Địa chỉ
                  </label>
                  <textarea 
                    placeholder="Nhập địa chỉ..."
                    value={newUser.address}
                    onChange={e => setNewUser(p => ({ ...p, address: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      minHeight: '80px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit',
                      lineHeight: '1.5'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {addUserError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {addUserError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button 
                  type="button"
                  onClick={() => {
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
                  }}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5a6268';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isAddingUser}
                  style={{
                    background: isAddingUser ? '#6c757d' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isAddingUser ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isAddingUser ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isAddingUser) {
                      e.target.style.background = '#0056b3';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAddingUser) {
                      e.target.style.background = '#007bff';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isAddingUser ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Thêm người dùng
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Popup */}
      {showEditUserForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  ✏️
                </div>
                Sửa thông tin người dùng
              </h3>
              <button
                onClick={() => {
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
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.color = '#dc3545';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#6c757d';
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateUser} style={{
              padding: '32px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Tên đăng nhập *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên đăng nhập"
                    value={editUser.username}
                    onChange={e => setEditUser(p => ({ ...p, username: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Email *
                  </label>
                  <input 
                    type="email" 
                    placeholder="Nhập email"
                    value={editUser.email}
                    onChange={e => setEditUser(p => ({ ...p, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Số điện thoại
                  </label>
                  <input 
                    type="tel" 
                    placeholder="Nhập số điện thoại"
                    value={editUser.phone}
                    onChange={e => setEditUser(p => ({ ...p, phone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
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
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Vai trò
                  </label>
                  <select 
                    value={editUser.role}
                    onChange={e => setEditUser(p => ({ ...p, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit',
                      background: '#fff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Địa chỉ
                  </label>
                  <textarea 
                    placeholder="Nhập địa chỉ..."
                    value={editUser.address}
                    onChange={e => setEditUser(p => ({ ...p, address: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      minHeight: '80px',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'inherit',
                      lineHeight: '1.5'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef';
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {editUserError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {editUserError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button 
                  type="button"
                  onClick={() => {
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
                  }}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#5a6268';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isUpdatingUser}
                  style={{
                    background: isUpdatingUser ? '#6c757d' : '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isUpdatingUser ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isUpdatingUser ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdatingUser) {
                      e.target.style.background = '#218838';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpdatingUser) {
                      e.target.style.background = '#28a745';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isUpdatingUser ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Cập nhật người dùng
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default AdminDashboard;
