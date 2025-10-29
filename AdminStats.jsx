import React, { useState, useEffect } from 'react';

const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }

        const response = await fetch('http://localhost:5000/api/stats/overview', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.');
          } else if (response.status === 403) {
            throw new Error('Bạn không có quyền truy cập tính năng này.');
          } else {
            throw new Error(`Lỗi server: ${response.status}`);
          }
        }

        const data = await response.json();
        setStats(data.data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
            Đang tải dữ liệu thống kê...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#f8d7da',
        color: '#721c24',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #f5c6cb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
          Lỗi tải dữ liệu
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
          Không có dữ liệu thống kê
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#f8f9fa',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef',
        marginBottom: '20px'
      }}>
        <h1 style={{
          margin: 0,
          color: '#495057',
          fontSize: '28px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📊 Thống kê hệ thống
        </h1>
        <p style={{
          margin: '8px 0 0 0',
          color: '#6c757d',
          fontSize: '16px'
        }}>
          Dashboard thống kê tổng quan cho quản trị viên
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Users */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Tổng người dùng
              </h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#495057' }}>
                {formatNumber(stats.overview?.totalUsers)}
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              👥
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Tổng sản phẩm
              </h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#495057' }}>
                {formatNumber(stats.overview?.totalProducts)}
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📦
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Tổng đơn hàng
              </h3>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#495057' }}>
                {formatNumber(stats.overview?.totalOrders)}
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🛒
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px', fontWeight: '500' }}>
                Tổng doanh thu
              </h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#28a745' }}>
                {formatCurrency(stats.overview?.totalRevenue)}
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#495057', fontSize: '18px', fontWeight: '600' }}>
          Trạng thái đơn hàng
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center', padding: '16px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#856404' }}>
              {formatNumber(stats.overview?.pendingOrders)}
            </div>
            <div style={{ fontSize: '12px', color: '#856404' }}>Chờ xử lý</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#155724' }}>
              {formatNumber(stats.overview?.completedOrders)}
            </div>
            <div style={{ fontSize: '12px', color: '#155724' }}>Hoàn thành</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#721c24' }}>
              {formatNumber(stats.overview?.cancelledOrders)}
            </div>
            <div style={{ fontSize: '12px', color: '#721c24' }}>Đã hủy</div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminStats;