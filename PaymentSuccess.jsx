import React, { useEffect, useState } from 'react'

// Styles constants
const styles = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '40px 20px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  successIcon: {
    fontSize: '80px',
    marginBottom: '24px',
    color: '#10b981'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  orderInfo: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
  },
  infoLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af'
  },
  infoValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500'
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }
}

function PaymentSuccess() {
  const [orderInfo, setOrderInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lấy thông tin từ URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    const amount = urlParams.get('amount')
    const success = urlParams.get('success')

    console.log('🎉 Payment success - Order ID:', orderId, 'Amount:', amount, 'Success:', success)

    if (orderId && amount && success === 'true') {
      setOrderInfo({
        orderId: orderId,
        amount: parseInt(amount)
      })
    } else {
      // Nếu không có thông tin hợp lệ, chuyển về trang lỗi
      window.location.href = '/payment/fail?error=invalid_success_data'
    }
    setLoading(false)
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleContinueShopping = () => {
    window.location.href = '/'
  }

  const handleViewOrder = () => {
    // Chuyển đến trang lịch sử đơn hàng
    window.location.href = '/?page=order-history'
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>
          Đang tải thông tin...
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Success Icon */}
      <div style={styles.successIcon}>✅</div>
      
      {/* Title */}
      <h1 style={styles.title}>Thanh toán thành công!</h1>
      
      {/* Subtitle */}
      <p style={styles.subtitle}>
        Cảm ơn bạn đã mua sắm tại GadgetPhone.<br/>
        Đơn hàng của bạn đã được xử lý và sẽ được giao trong thời gian sớm nhất.
      </p>

      {/* Order Information */}
      {orderInfo && (
        <div style={styles.orderInfo}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Mã đơn hàng:</span>
            <span style={styles.infoValue}>{orderInfo.orderId}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Số tiền đã thanh toán:</span>
            <span style={styles.infoValue}>{formatPrice(orderInfo.amount)}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Phương thức thanh toán:</span>
            <span style={styles.infoValue}>VNPay</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Trạng thái:</span>
            <span style={styles.infoValue}>Đã thanh toán</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          onClick={handleContinueShopping}
          style={styles.primaryButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
        >
          🛒 Tiếp tục mua sắm
        </button>
        
        <button
          onClick={handleViewOrder}
          style={styles.secondaryButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          📋 Xem đơn hàng
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess