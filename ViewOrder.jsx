import React, { useState, useEffect, useCallback, useMemo } from 'react'

// Styles constants
const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f0f0f0'
  },
  backButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  successMessage: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600'
  },
  gridLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px'
  },
  orderSection: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  infoLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151'
  },
  infoValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500'
  },
  orderItems: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    position: 'sticky',
    top: '20px'
  },
  orderTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0'
  },
  orderItemImage: {
    width: '50px',
    height: '50px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  orderItemInfo: {
    flex: 1
  },
  orderItemName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  orderItemQuantity: {
    fontSize: '12px',
    opacity: '0.8'
  },
  orderItemPrice: {
    fontSize: '14px',
    fontWeight: '700'
  },
  totalSection: {
    padding: '16px 0',
    borderTop: '2px solid rgba(255,255,255,0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '700'
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '700'
  },
  statusBadge: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'inline-block'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    flex: 1
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)',
    flex: 1
  },
  paymentButton: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
    flex: 1
  }
}

function ViewOrder({ orderData, onBack, onContinueShopping }) {
  const [order, setOrder] = useState(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Generate order data if not provided
  useEffect(() => {
    if (!orderData) {
      // Generate sample order data
      const sampleOrder = {
        orderId: `ORD-${Date.now()}`,
        orderDate: new Date().toLocaleString('vi-VN'),
        status: 'Đang xử lý',
        customer: {
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0123456789',
          address: '123 Đường ABC, Quận 1, TP.HCM'
        },
        paymentMethod: 'Thanh toán khi nhận hàng (COD)',
        items: [
          {
            id: 1,
            name: 'iPhone 15 Pro Max',
            price: 29990000,
            quantity: 1,
            image: null
          },
          {
            id: 2,
            name: 'AirPods Pro',
            price: 5990000,
            quantity: 2,
            image: null
          }
        ],
        notes: 'Giao hàng vào buổi chiều'
      }
      setOrder(sampleOrder)
    } else {
      setOrder(orderData)
    }
  }, [orderData])

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }, [])

  const total = useMemo(() => {
    if (!order) return 0
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [order])

  // Function to handle payment for VNPay orders
  const handlePayment = async () => {
    if (!order || order.paymentMethod !== 'vnpay' || order.paymentStatus === 'paid') {
      return
    }

    setIsProcessingPayment(true)
    
      try {
        const token = localStorage.getItem('token')
        
        // Tạo payment URL từ VNPay
        const response = await fetch(`http://localhost:5000/api/payment/vnpay/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: order.orderId,
            amount: order.total || order.items.reduce((total, item) => total + (item.price * item.quantity), 0),
            orderDescription: `Thanh toán đơn hàng ${order.orderId}`
          })
        })

        const result = await response.json()

        if (result.success && result.paymentUrl) {
          // Chuyển hướng đến trang thanh toán VNPay
          window.location.href = result.paymentUrl
        } else {
          alert('Có lỗi xảy ra khi tạo link thanh toán: ' + (result.error || 'Lỗi không xác định'))
        }
      } catch (error) {
        console.error('Payment error:', error)
        alert('Có lỗi xảy ra khi tạo link thanh toán. Vui lòng thử lại.')
      } finally {
        setIsProcessingPayment(false)
      }
  }

  // Component cho nút với hover effects
  const ButtonWithHover = ({ children, style, onClick, disabled = false, ...props }) => (
    <button
      style={style}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-2px)'
          if (style.boxShadow) {
            e.target.style.boxShadow = style.boxShadow.replace('0.3', '0.4')
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0)'
          if (style.boxShadow) {
            e.target.style.boxShadow = style.boxShadow
          }
        }
      }}
      {...props}
    >
      {children}
    </button>
  )

  // Component cho order item
  const OrderItem = ({ item }) => (
    <div style={{
      ...styles.orderItem,
      borderBottom: order.items.indexOf(item) < order.items.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
    }}>
      <div style={styles.orderItemImage}>
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '6px'
            }}
          />
        ) : (
          '📱'
        )}
      </div>
      <div style={styles.orderItemInfo}>
        <div style={styles.orderItemName}>{item.name}</div>
        <div style={styles.orderItemQuantity}>Số lượng: {item.quantity}</div>
      </div>
      <div style={styles.orderItemPrice}>
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  )

  if (!order) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Đang tải thông tin đơn hàng...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <ButtonWithHover onClick={onBack} style={styles.backButton}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Quay lại
        </ButtonWithHover>
        <h1 style={styles.title}>📋 Chi tiết đơn hàng</h1>
      </div>

      {/* Success Message */}
      <div style={styles.successMessage}>
        🎉 Đặt hàng thành công! Đơn hàng của bạn đã được xử lý.
      </div>

      <div style={styles.gridLayout}>
        {/* Order Information */}
        <div>
          {/* Order Details */}
          <div style={styles.orderSection}>
            <h2 style={styles.sectionTitle}>
              📝 Thông tin đơn hàng
            </h2>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mã đơn hàng:</span>
              <span style={styles.infoValue}>{order.orderId}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Ngày đặt hàng:</span>
              <span style={styles.infoValue}>{order.orderDate}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Trạng thái:</span>
              <span style={styles.statusBadge}>{order.status}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Phương thức thanh toán:</span>
              <span style={styles.infoValue}>
                {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua VNPay'}
              </span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Trạng thái thanh toán:</span>
              <span style={{
                ...styles.statusBadge,
                background: order.paymentStatus === 'paid' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : order.paymentStatus === 'pending'
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              }}>
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                 order.paymentStatus === 'pending' ? 'Chưa thanh toán' : 
                 order.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                 order.paymentStatus === 'cancelled' ? 'Đã hủy' : 'Hoàn tiền'}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div style={styles.orderSection}>
            <h2 style={styles.sectionTitle}>
              👤 Thông tin khách hàng
            </h2>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Họ và tên:</span>
              <span style={styles.infoValue}>{order.customer.fullName}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{order.customer.email}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Số điện thoại:</span>
              <span style={styles.infoValue}>{order.customer.phone}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Địa chỉ giao hàng:</span>
              <span style={styles.infoValue}>{order.customer.address}</span>
            </div>
            
            {order.notes && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Ghi chú:</span>
                <span style={styles.infoValue}>{order.notes}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            {/* Payment Button for VNPay orders with pending payment */}
            {order.paymentMethod === 'vnpay' && order.paymentStatus === 'pending' && (
              <ButtonWithHover
                onClick={handlePayment}
                style={styles.paymentButton}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? '⏳ Đang xử lý...' : '💳 Thanh toán ngay'}
              </ButtonWithHover>
            )}
            
            <ButtonWithHover
              onClick={onContinueShopping}
              style={styles.primaryButton}
            >
              🛒 Tiếp tục mua sắm
            </ButtonWithHover>
            
            <ButtonWithHover
              onClick={onBack}
              style={styles.secondaryButton}
            >
              📋 Xem đơn hàng khác
            </ButtonWithHover>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={styles.orderItems}>
            <h2 style={styles.orderTitle}>
              🛍️ Sản phẩm đã đặt
            </h2>

            {/* Order Items */}
            <div style={{ marginBottom: '20px' }}>
              {order.items.map((item, index) => (
                <OrderItem key={index} item={item} />
              ))}
            </div>

            {/* Total */}
            <div style={styles.totalSection}>
              <span style={styles.totalLabel}>
                Tổng cộng:
              </span>
              <span style={styles.totalAmount}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewOrder
