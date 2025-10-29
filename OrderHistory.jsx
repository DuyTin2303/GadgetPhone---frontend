import React, { useState, useEffect } from 'react';
import ReviewButton from './ReviewButton';

const OrderHistory = ({ user, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const API_BASE = 'http://localhost:5000';

  // Fetch orders from API
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem lịch sử đơn hàng');
        return;
      }

      const response = await fetch(`${API_BASE}/api/orders?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tải lịch sử đơn hàng');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order detail
  const fetchOrderDetail = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setShowOrderDetail(true);
      } else {
        setError(data.error || 'Không thể tải chi tiết đơn hàng');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Fetch order detail error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Build image URL
  const buildImageUrl = (raw) => {
    if (!raw) return '';
    let path = String(raw).replace(/\\/g, '/').trim();
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('uploads')) path = '/' + path;
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`;
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: '#f59e0b', text: 'Chờ xử lý', icon: '⏳' },
      processing: { color: '#3b82f6', text: 'Đang xử lý', icon: '🔄' },
      shipped: { color: '#8b5cf6', text: 'Đang giao', icon: '🚚' },
      delivered: { color: '#10b981', text: 'Đã giao', icon: '✅' },
      cancelled: { color: '#ef4444', text: 'Đã hủy', icon: '❌' }
    };
    return statusMap[status] || { color: '#6b7280', text: 'Không xác định', icon: '❓' };
  };

  // Get payment status color and text
  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      pending: { color: '#f59e0b', text: 'Chờ thanh toán', icon: '⏳' },
      paid: { color: '#10b981', text: 'Đã thanh toán', icon: '✅' },
      failed: { color: '#ef4444', text: 'Thanh toán thất bại', icon: '❌' },
      refunded: { color: '#6b7280', text: 'Đã hoàn tiền', icon: '↩️' },
      cancelled: { color: '#ef4444', text: 'Đã hủy', icon: '❌' }
    };
    return statusMap[status] || { color: '#6b7280', text: 'Không xác định', icon: '❓' };
  };

  // Get payment method color and text
  const getPaymentMethodInfo = (method) => {
    const methodMap = {
      cod: { color: '#3b82f6', text: 'Thanh toán khi nhận hàng (COD)', icon: '💰' },
      vnpay: { color: '#10b981', text: 'Thanh toán qua VNPay', icon: '🏦' }
    };
    return methodMap[method] || { color: '#6b7280', text: 'Không xác định', icon: '❓' };
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchOrders(newPage);
    }
  };

  // Handle back from order detail
  const handleBackFromDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      'Bạn có chắc chắn muốn hủy đơn hàng này?\n' +
      'Hành động này không thể hoàn tác!'
    );

    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Hủy đơn hàng thành công!');
        // Refresh danh sách đơn hàng
        fetchOrders(currentPage);
      } else {
        alert(data.error || 'Có lỗi xảy ra khi hủy đơn hàng');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('Không thể kết nối đến server');
    }
  };

  if (showOrderDetail && selectedOrder) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={handleBackFromDetail} style={styles.backButton}>
            ← Quay lại
          </button>
          <h2 style={styles.title}>Chi tiết đơn hàng</h2>
        </div>

        <div style={styles.orderDetailContainer}>
          {/* Order Info */}
          <div style={styles.orderInfoCard}>
            <h3 style={styles.cardTitle}>Thông tin đơn hàng</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Mã đơn hàng:</span>
                <span style={styles.infoValue}>{selectedOrder.orderId}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Ngày đặt:</span>
                <span style={styles.infoValue}>{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Trạng thái:</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusInfo(selectedOrder.status).color
                }}>
                  {getStatusInfo(selectedOrder.status).icon} {getStatusInfo(selectedOrder.status).text}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phương thức thanh toán:</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getPaymentMethodInfo(selectedOrder.paymentMethod).color
                }}>
                  {getPaymentMethodInfo(selectedOrder.paymentMethod).icon} {getPaymentMethodInfo(selectedOrder.paymentMethod).text}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Trạng thái thanh toán:</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getPaymentStatusInfo(selectedOrder.paymentStatus).color
                }}>
                  {getPaymentStatusInfo(selectedOrder.paymentStatus).icon} {getPaymentStatusInfo(selectedOrder.paymentStatus).text}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div style={styles.orderInfoCard}>
            <h3 style={styles.cardTitle}>Thông tin giao hàng</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Địa chỉ:</span>
                <span style={styles.infoValue}>{selectedOrder.shippingAddress}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Số điện thoại:</span>
                <span style={styles.infoValue}>{selectedOrder.phone}</span>
              </div>
              {selectedOrder.notes && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Ghi chú:</span>
                  <span style={styles.infoValue}>{selectedOrder.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div style={styles.orderInfoCard}>
            <h3 style={styles.cardTitle}>Sản phẩm đã đặt</h3>
            <div style={styles.itemsList}>
              {selectedOrder.items.map((item, index) => (
                <div key={index} style={styles.orderItem}>
                  <img 
                    src={buildImageUrl(item.product.image)} 
                    alt={item.product.name}
                    style={styles.itemImage}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                    }}
                  />
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemName}>{item.product.name}</h4>
                    <p style={styles.itemDescription}>{item.product.description}</p>
                    <div style={styles.itemDetails}>
                      <span style={styles.itemQuantity}>Số lượng: {item.quantity}</span>
                      <span style={styles.itemPrice}>{formatCurrency(item.price)}</span>
                    </div>
                    <ReviewButton 
                      product={item.product} 
                      orderStatus={selectedOrder.status}
                      onReviewSubmitted={() => {
                        // Có thể thêm logic refresh data nếu cần
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.totalAmount}>
              <span style={styles.totalLabel}>Tổng cộng:</span>
              <span style={styles.totalValue}>{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
            
            {/* Action Buttons */}
            {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && 
             selectedOrder.paymentStatus !== 'cancelled' && (
              <div style={styles.detailActionButtons}>
                <button 
                  onClick={() => handleCancelOrder(selectedOrder.orderId)}
                  style={styles.detailCancelButton}
                >
                  ❌ Hủy đơn hàng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Quay lại
        </button>
        <h2 style={styles.title}>Lịch sử đơn hàng</h2>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Đang tải lịch sử đơn hàng...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => fetchOrders()} style={styles.retryButton}>
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📦</div>
          <h3 style={styles.emptyTitle}>Chưa có đơn hàng nào</h3>
          <p style={styles.emptyText}>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
        </div>
      ) : (
        <>
          <div style={styles.ordersList}>
            {orders.map((order) => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div style={styles.orderIdContainer}>
                    <span style={styles.orderIdLabel}>Mã đơn hàng:</span>
                    <span style={styles.orderIdValue}>{order.orderId}</span>
                  </div>
                  <div style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                <div style={styles.orderItems}>
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} style={styles.orderItemPreview}>
                      <img 
                        src={buildImageUrl(item.product.image)} 
                        alt={item.product.name}
                        style={styles.itemImagePreview}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNSAxNUgyNVYyNUgxNVYxNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                      <div style={styles.itemInfoPreview}>
                        <span style={styles.itemNamePreview}>{item.product.name}</span>
                        <span style={styles.itemQuantityPreview}>x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={styles.moreItems}>
                      +{order.items.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>

                <div style={styles.orderFooter}>
                  <div style={styles.orderStatus}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusInfo(order.status).color
                    }}>
                      {getStatusInfo(order.status).icon} {getStatusInfo(order.status).text}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getPaymentMethodInfo(order.paymentMethod).color
                    }}>
                      {getPaymentMethodInfo(order.paymentMethod).icon} {getPaymentMethodInfo(order.paymentMethod).text}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getPaymentStatusInfo(order.paymentStatus).color
                    }}>
                      {getPaymentStatusInfo(order.paymentStatus).icon} {getPaymentStatusInfo(order.paymentStatus).text}
                    </span>
                  </div>
                  <div style={styles.orderActions}>
                    <span style={styles.totalAmountPreview}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => fetchOrderDetail(order.orderId)}
                        style={styles.viewDetailButton}
                      >
                        Xem chi tiết
                      </button>
                      {(order.status === 'pending' || order.status === 'processing') && 
                       order.paymentStatus !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelOrder(order.orderId)}
                          style={styles.cancelButton}
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...styles.paginationButton,
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Trước
              </button>
              <span style={styles.paginationInfo}>
                Trang {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.paginationButton,
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  backButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  errorText: {
    fontSize: '16px',
    color: '#ef4444',
    marginBottom: '20px',
    textAlign: 'center'
  },
  retryButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center',
    margin: 0
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  orderCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  orderIdContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  orderIdLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600'
  },
  orderIdValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '700'
  },
  orderDate: {
    fontSize: '14px',
    color: '#6b7280'
  },
  orderItems: {
    marginBottom: '16px'
  },
  orderItemPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  itemImagePreview: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  itemInfoPreview: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemNamePreview: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600'
  },
  itemQuantityPreview: {
    fontSize: '14px',
    color: '#6b7280'
  },
  moreItems: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '8px'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb'
  },
  orderStatus: {
    display: 'flex',
    gap: '8px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  orderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  totalAmountPreview: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  viewDetailButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s ease'
  },
  cancelButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s ease'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px'
  },
  paginationButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600'
  },
  // Order Detail Styles
  orderDetailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderInfoCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px'
  },
  orderItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  itemImage: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },
  itemDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  itemDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemQuantity: {
    fontSize: '14px',
    color: '#6b7280'
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937'
  },
  totalAmount: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    color: '#fff'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '600'
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '700'
  },
  // Detail Action Buttons
  detailActionButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  detailCancelButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
  }
};

export default OrderHistory;
