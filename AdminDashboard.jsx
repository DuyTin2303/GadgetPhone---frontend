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

  { key: 'notifications', label: '🔔 Quản lý thông báo' },

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

  // State cho notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    scheduledAt: ''
  });
  const [notificationStats, setNotificationStats] = useState(null);
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showEditNotification, setShowEditNotification] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const API_BASE = 'http://localhost:5000';

  // Functions cho notifications
  const fetchNotifications = async () => {
    setNotificationLoading(true);
    setNotificationError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      } else {
        setNotificationError(data.message || 'Lỗi khi tải thông báo');
      }
    } catch (error) {
      setNotificationError('Lỗi kết nối khi tải thông báo');
    } finally {
      setNotificationLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotificationStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const createNotification = async () => {
    console.log('Creating notification with data:', newNotification);
    
    // Validate form data
    if (!newNotification.title.trim()) {
      alert('Vui lòng nhập tiêu đề thông báo');
      return;
    }
    if (!newNotification.message.trim()) {
      alert('Vui lòng nhập nội dung thông báo');
      return;
    }
    
    setIsCreatingNotification(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn cần đăng nhập để tạo thông báo');
        return;
      }
      
      const notificationData = {
        ...newNotification,
        targetAudience: 'all',
        priority: 'medium',
        scheduledAt: newNotification.scheduledAt || new Date().toISOString(),
        expiresAt: null,
        metadata: {}
      };

      console.log('Sending notification data:', notificationData);

      const response = await fetch(`${API_BASE}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Hiển thị thông báo thành công
        alert('✅ Tạo thông báo thành công!');
        
        // Chèn ngay item mới vào bảng để hiển thị tức thì
        const createdNotification = (data.data && (data.data.notification || data.data)) || null;
        if (createdNotification) {
          setNotifications(prev => [createdNotification, ...(Array.isArray(prev) ? prev : [])]);
        }
        // Chuyển sang tab thông báo (nếu đang ở tab khác)
        setActive && setActive('notifications');

        // Cập nhật thống kê tại chỗ (không đợi backend)
        setNotificationStats(prev => {
          const base = prev || { total: 0, active: 0, inactive: 0 };
          return {
            ...base,
            total: (base.total || 0) + 1,
            active: (base.active || 0) + 1
          };
        });
        
        // Reset form
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          scheduledAt: ''
        });
        
        // Đóng modal
        setShowCreateNotification(false);
        
        // Không refetch ngay để tránh mất item vừa chèn do backend trả rỗng
        // Có thể refetch sau một khoảng thời gian nếu cần đồng bộ
        // setTimeout(() => { fetchNotifications(); fetchNotificationStats(); }, 1500);
      } else {
        alert(data.message || 'Lỗi khi tạo thông báo');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Lỗi kết nối khi tạo thông báo: ' + error.message);
    } finally {
      setIsCreatingNotification(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/admin/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Xóa thông báo thành công!');
        fetchNotifications();
        fetchNotificationStats();
      } else {
        alert(data.message || 'Lỗi khi xóa thông báo');
      }
    } catch (error) {
      alert('Lỗi kết nối khi xóa thông báo');
    }
  };

  const toggleNotificationStatus = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/admin/${notificationId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchNotifications();
        fetchNotificationStats();
      } else {
        alert(data.message || 'Lỗi khi thay đổi trạng thái thông báo');
      }
    } catch (error) {
      alert('Lỗi kết nối khi thay đổi trạng thái thông báo');
    }
  };

  const editNotification = (notification) => {
    setEditingNotification(notification);
    setNewNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      scheduledAt: notification.scheduledAt ? new Date(notification.scheduledAt).toISOString().slice(0, 16) : ''
    });
    setShowEditNotification(true);
  };

  const updateNotification = async () => {
    if (!editingNotification) return;
    
    setIsCreatingNotification(true);
    try {
      const token = localStorage.getItem('token');
      const notificationData = {
        ...newNotification,
        targetAudience: 'all',
        priority: 'medium',
        scheduledAt: newNotification.scheduledAt || new Date().toISOString(),
        expiresAt: null,
        metadata: {}
      };

      const response = await fetch(`${API_BASE}/api/notifications/admin/${editingNotification._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Cập nhật thông báo thành công!');
        
        // Cập nhật thông báo trong state
        setNotifications(prev => prev.map(notif => 
          notif._id === editingNotification._id ? { ...notif, ...data.data } : notif
        ));
        
        // Reset form và đóng modal
        setEditingNotification(null);
        setShowEditNotification(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          scheduledAt: ''
        });
      } else {
        alert(data.message || 'Lỗi khi cập nhật thông báo');
      }
    } catch (error) {
      alert('Lỗi kết nối khi cập nhật thông báo: ' + error.message);
    } finally {
      setIsCreatingNotification(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = !filterType || notification.type === filterType;
    const statusMatch = !filterStatus || 
      (filterStatus === 'active' && notification.isActive) ||
      (filterStatus === 'inactive' && !notification.isActive);
    return typeMatch && statusMatch;
  });

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
  };

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
    } else if (active === 'notifications') {
      fetchNotifications();
      fetchNotificationStats();
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
            {/* Action Bar - Đơn giản */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                  📦 Danh sách sản phẩm ({filteredProducts.length}{filteredProducts.length !== products.length ? ` / ${products.length}` : ''})
                </h3>
                {loading && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6b7280',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #667eea',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Đang tải...
                  </div>
                )}
              </div>
              
              {/* Search Input - Đơn giản */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                justifyContent: 'center',
                maxWidth: '500px'
              }}>
                {/* Search by name */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '200px' }}>
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    🔍
                  </div>
                </div>
                
                {/* Search by quantity */}
                <div style={{ position: 'relative', maxWidth: '120px' }}>
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
                      padding: '8px 12px 8px 32px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontSize: '14px'
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
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowAddForm(f => !f)}
                style={{
                  background: showAddForm ? '#ef4444' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showAddForm ? '✕ Đóng' : '➕ Thêm sản phẩm'}
              </button>
            </div>

            {/* Add Product Form - Đơn giản */}
            {showAddForm && (
              <div style={{
                background: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>➕ Thêm sản phẩm mới</h4>
                <form onSubmit={handleAddProduct}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Tên sản phẩm *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Giá *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Danh mục *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
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
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Số lượng</label>
                      <input
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
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
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ Thêm sản phẩm
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
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead style={{
                    background: '#f9fafb'
                  }}>
                    <tr>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>ID</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>Hình ảnh</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>Tên sản phẩm</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>Giá</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>Số lượng</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>Danh mục</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
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
                                background: '#667eea',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Sửa
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p._id || p.id)}
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Xóa
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
              marginBottom: '20px',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                👥 Quản lý người dùng ({users.length})
              </h3>
              <button 
                onClick={() => setShowAddUserForm(f => !f)}
                style={{
                  background: showAddUserForm ? '#ef4444' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showAddUserForm ? '✕ Đóng' : '➕ Thêm người dùng mới'}
              </button>
            </div>


            {/* Users Table */}
            {userError ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#dc2626',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                fontSize: '14px'
              }}>
                {userError}
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead style={{
                    background: '#f9fafb'
                  }}>
                    <tr>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>👤 Tên đăng nhập</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>📧 Email</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>👑 Vai trò</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}>⚙️ Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <td style={{
                          padding: '12px',
                          fontWeight: '500',
                          color: '#374151',
                          fontSize: '14px'
                        }}>{user.username}</td>
                        <td style={{
                          padding: '12px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>{user.email}</td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                            color: user.role === 'admin' ? '#1e40af' : '#374151'
                          }}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                              }}
                              title="Xóa người dùng"
                            >
                              🗑️
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

      case 'notifications':
        return (
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px 4px 0 4px'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700', letterSpacing: '0.2px' }}>
                  🔔 Quản lý thông báo
                </h3>
                <div style={{ marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                  Đang hiển thị {filteredNotifications.length} / {notifications.length} thông báo
                </div>
              </div>
              <button 
                onClick={() => setShowCreateNotification(true)}
                style={{
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 16px rgba(16,185,129,0.25)'
                }}
              >
                ➕ Tạo thông báo mới
              </button>
            </div>

            {/* Filter Controls */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15,23,42,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Lọc theo loại:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#fff'
                  }}
                >
                  <option value="">Tất cả loại</option>
                  <option value="success">Thành công</option>
                  <option value="error">Lỗi</option>
                  <option value="order">Đơn hàng</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Lọc theo trạng thái:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#fff'
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã tắt</option>
                </select>
              </div>

              {(filterType || filterStatus) && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(14,165,233,0.25)'
                  }}
                >
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Stats Cards */}
            {notificationStats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                    {notificationStats.total}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Tổng thông báo</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                    {notificationStats.active}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Đang hoạt động</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                    {notificationStats.inactive}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Đã tắt</div>
                </div>
              </div>
            )}

            {/* Notifications Table */}
            {notificationLoading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Đang tải thông báo...
              </div>
            ) : notificationError ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#dc2626',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                fontSize: '14px'
              }}>
                {notificationError}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {notifications.length === 0 ? 
                  '📭 Chưa có thông báo nào. Hãy tạo thông báo đầu tiên!' :
                  '🔍 Không tìm thấy thông báo nào phù hợp với bộ lọc'
                }
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(15,23,42,0.06)'
              }}>
                <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
                {/* Table Header */}
                <div style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  background: '#f8fafc',
                  padding: '12px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  gap: '16px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxShadow: 'inset 0 -1px 0 rgba(226,232,240,0.8)'
                }}>
                  <div>Tiêu đề & Nội dung</div>
                  <div>Loại</div>
                  <div>Trạng thái</div>
                  <div>Thời gian tạo</div>
                  <div>Thao tác</div>
                </div>

                {/* Table Body */}
                {filteredNotifications.map((notification, idx) => (
                  <div key={notification._id} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '16px',
                    alignItems: 'center',
                    background: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f9fafb'; }}
                  >
                    <div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {notification.message}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        background: notification.type === 'error' ? '#fee2e2' : 
                                   notification.type === 'success' ? '#dcfce7' :
                                   notification.type === 'warning' ? '#fef3c7' :
                                   notification.type === 'promotion' ? '#ede9fe' :
                                   notification.type === 'order' ? '#dbeafe' :
                                   notification.type === 'system' ? '#e5e7eb' : '#dcfce7',
                        color: notification.type === 'error' ? '#b91c1c' : 
                               notification.type === 'success' ? '#065f46' :
                               notification.type === 'warning' ? '#92400e' :
                               notification.type === 'promotion' ? '#6d28d9' :
                               notification.type === 'order' ? '#1d4ed8' :
                               notification.type === 'system' ? '#374151' : '#065f46',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}>
                        {notification.type === 'success' ? 'Thành công' :
                         notification.type === 'error' ? 'Lỗi' :
                         notification.type === 'order' ? 'Đơn hàng' : notification.type}
                      </span>
                    </div>

                    <div>
                      <span style={{
                        background: notification.isActive ? '#dcfce7' : '#e5e7eb',
                        color: notification.isActive ? '#065f46' : '#374151',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}>
                        {notification.isActive ? 'Hoạt động' : 'Tắt'}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={() => editNotification(notification)}
                        style={{
                          background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(59,130,246,0.25)'
                        }}
                        title="Sửa thông báo"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => toggleNotificationStatus(notification._id)}
                        style={{
                          background: notification.isActive ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#10b981,#059669)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: notification.isActive ? '0 4px 12px rgba(245,158,11,0.25)' : '0 4px 12px rgba(16,185,129,0.25)'
                        }}
                        title={notification.isActive ? 'Tắt thông báo' : 'Bật thông báo'}
                      >
                        {notification.isActive ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        style={{
                          background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(239,68,68,0.25)'
                        }}
                        title="Xóa thông báo"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* Edit Notification Modal */}
            {showEditNotification && (
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
                  borderRadius: '12px',
                  padding: '24px',
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                      Sửa thông báo
                    </h3>
                    <button
                      onClick={() => {
                        setShowEditNotification(false);
                        setEditingNotification(null);
                        setNewNotification({
                          title: '',
                          message: '',
                          type: 'info',
                          scheduledAt: ''
                        });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); updateNotification(); }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Tiêu đề *
                      </label>
                      <input
                        type="text"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        required
                        placeholder="Nhập tiêu đề thông báo"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Nội dung *
                      </label>
                      <textarea
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                        required
                        rows={4}
                        placeholder="Nhập nội dung thông báo"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Loại thông báo
                      </label>
                      <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="success">Thành công</option>
                        <option value="error">Lỗi</option>
                        <option value="order">Đơn hàng</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Thời gian gửi
                      </label>
                      <input
                        type="datetime-local"
                        value={newNotification.scheduledAt}
                        onChange={(e) => setNewNotification({...newNotification, scheduledAt: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditNotification(false);
                          setEditingNotification(null);
                          setNewNotification({
                            title: '',
                            message: '',
                            type: 'info',
                            scheduledAt: ''
                          });
                        }}
                        style={{
                          background: '#6b7280',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingNotification}
                        style={{
                          background: isCreatingNotification ? '#9ca3af' : '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          cursor: isCreatingNotification ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isCreatingNotification ? 'Đang cập nhật...' : 'Cập nhật thông báo'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Create Notification Modal */}
            {showCreateNotification && (
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
                  borderRadius: '12px',
                  padding: '24px',
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                      Tạo thông báo mới
                    </h3>
                    <button
                      onClick={() => setShowCreateNotification(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    console.log('Form submitted with data:', newNotification);
                    createNotification(); 
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Tiêu đề *
                      </label>
                      <input
                        type="text"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        required
                        placeholder="Nhập tiêu đề thông báo"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Nội dung *
                      </label>
                      <textarea
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                        required
                        rows={4}
                        placeholder="Nhập nội dung thông báo"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Loại thông báo
                      </label>
                      <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="success">Thành công</option>
                        <option value="error">Lỗi</option>
                        <option value="order">Đơn hàng</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                        Thời gian gửi
                      </label>
                      <input
                        type="datetime-local"
                        value={newNotification.scheduledAt}
                        onChange={(e) => setNewNotification({...newNotification, scheduledAt: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        type="button"
                        onClick={() => setShowCreateNotification(false)}
                        style={{
                          background: '#6b7280',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingNotification}
                        style={{
                          background: isCreatingNotification ? '#9ca3af' : '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          cursor: isCreatingNotification ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isCreatingNotification ? 'Đang tạo...' : 'Tạo thông báo'}
                      </button>
                    </div>
                  </form>
                </div>
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
      {/* Sidebar - Đơn giản */}
      <div style={{
        width: '220px',
        background: '#667eea',
        color: '#fff',
        padding: '16px 0'
      }}>
        <div style={{
          padding: '0 16px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff'
          }}>
            👑 Admin Dashboard
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
                padding: '10px 16px',
                background: active === item.key ? '#5a67d8' : 'transparent',
                color: '#fff',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {item.key === 'products' && '📦'}
              {item.key === 'categories' && '🏷️'}
              {item.key === 'users' && '👥'}
              {item.key === 'orders' && '📋'}
              {item.key === 'revenue' && '📊'}
              {item.key === 'logout' && '🚪'}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content - Đơn giản */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto',
        background: '#fff'
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

      {/* Add User Popup */}
      {showAddUserForm && (
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
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '18px', fontWeight: '600' }}>
                👤 Thêm người dùng mới
              </h3>
              <button
                onClick={() => setShowAddUserForm(false)}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUser}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Mật khẩu *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Vai trò</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Địa chỉ</label>
                  <input
                    type="text"
                    value={newUser.address}
                    onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Số điện thoại</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              
              {addUserError && (
                <div style={{ 
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  border: '1px solid #fecaca'
                }}>
                  {addUserError}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  style={{
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  style={{
                    background: isAddingUser ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isAddingUser ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isAddingUser ? 'Đang thêm...' : '➕ Thêm người dùng'}
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