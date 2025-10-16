import React, { useState, useEffect, useCallback } from 'react'

// Styles constants
const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e7ff'
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
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px'
  },
  leftSection: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  rightSection: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    height: 'fit-content'
  },
  vnpaySection: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  vnpayLogo: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  vnpayTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  vnpaySubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px'
  },
  orderSummary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    marginBottom: '24px'
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  summaryLabel: {
    fontSize: '16px',
    opacity: '0.9'
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '600'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderTop: '2px solid rgba(255,255,255,0.3)',
    marginTop: '16px'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '700'
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '700'
  },
  paymentInfo: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #f59e0b',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#92400e',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoText: {
    fontSize: '14px',
    color: '#92400e',
    lineHeight: '1.6',
    marginBottom: '8px'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  payButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cancelButton: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loadingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorMessage: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '1px solid #fca5a5',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    color: '#dc2626',
    fontSize: '14px',
    textAlign: 'center'
  },
  successMessage: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '1px solid #86efac',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    color: '#166534',
    fontSize: '14px',
    textAlign: 'center'
  },
  orderItems: {
    marginBottom: '20px'
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
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
  }
}

function VNPayPage({ orderData, onBack, onPaymentSuccess, onPaymentCancel }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }, [])

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

  const handlePayment = async () => {
    setIsProcessing(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('💳 Creating VNPay payment for order:', orderData.orderId)
      
      // Tạo dữ liệu thanh toán VNPay
      const paymentData = {
        orderId: orderData.orderId,
        amount: orderData.total,
        orderDescription: `Thanh toán đơn hàng ${orderData.orderId}`,
        customerInfo: orderData.customer,
        items: orderData.items
      }

      console.log('📦 Payment data:', paymentData)

      // Gọi API tạo URL thanh toán VNPay
      const response = await fetch('http://localhost:5000/api/payment/vnpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể tạo URL thanh toán')
      }

      const result = await response.json()
      console.log('✅ Payment URL created:', result)
      console.log('✅ Result success:', result.success)
      console.log('✅ Result paymentUrl:', result.paymentUrl)
      console.log('✅ Result paymentUrl type:', typeof result.paymentUrl)
      
      if (result.success && result.paymentUrl) {
        setPaymentUrl(result.paymentUrl)
        setSuccess('URL thanh toán đã được tạo thành công! Bạn có thể bấm nút "Thanh toán VNPay" để chuyển đến trang thanh toán.')
        console.log('🔗 Payment URL set:', result.paymentUrl)
        console.log('🔗 URL contains sandbox:', result.paymentUrl.includes('sandbox.vnpayment.vn'))
      } else {
        console.error('❌ Invalid response:', result)
        throw new Error('Không nhận được URL thanh toán')
      }
    } catch (error) {
      console.error('❌ Payment error:', error)
      setError(error.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Tự động tạo URL thanh toán khi vào trang
  useEffect(() => {
    if (orderData && !paymentUrl && !isProcessing && !error) {
      console.log('🚀 Auto-creating payment URL...')
      handlePayment()
    }
  }, [orderData])

  const handleCancel = () => {
    if (onPaymentCancel) {
      onPaymentCancel()
    } else {
      onBack()
    }
  }

  const handlePayNow = () => {
    console.log('🔘 Pay button clicked')
    console.log('🔗 Current paymentUrl:', paymentUrl)
    console.log('🔗 PaymentUrl type:', typeof paymentUrl)
    console.log('🔗 PaymentUrl length:', paymentUrl?.length)
    
    if (paymentUrl) {
      console.log('🔄 Redirecting to VNPay:', paymentUrl)
      
      // Show warning about potential JavaScript errors
      const confirmRedirect = window.confirm(
        'Bạn sắp chuyển đến trang thanh toán VNPay.\n\n' +
        'Lưu ý: Trang VNPay có thể hiển thị lỗi JavaScript trong console, ' +
        'nhưng điều này không ảnh hưởng đến chức năng thanh toán.\n\n' +
        'Bạn có muốn tiếp tục?'
      )
      
      if (!confirmRedirect) return
      
      // Try multiple methods to ensure redirect works
      try {
        // Method 1: Direct redirect
        window.location.href = paymentUrl
      } catch (error) {
        console.error('❌ Direct redirect failed:', error)
        
        // Method 2: Open in new tab
        try {
          window.open(paymentUrl, '_blank')
        } catch (error2) {
          console.error('❌ New tab redirect failed:', error2)
          
          // Method 3: Create link and click
          const link = document.createElement('a')
          link.href = paymentUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    } else {
      console.error('❌ No payment URL available')
      setError('Không có URL thanh toán. Vui lòng thử lại.')
    }
  }

  // Component cho order item
  const OrderItem = ({ item }) => (
    <div style={styles.orderItem}>
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
        <h1 style={styles.title}>💳 Thanh toán VNPay</h1>
      </div>

      <div style={styles.content}>
        {/* Left Section - Payment Info */}
        <div style={styles.leftSection}>
          {/* VNPay Section */}
          <div style={styles.vnpaySection}>
            <div style={styles.vnpayLogo}>🏦</div>
            <h2 style={styles.vnpayTitle}>Thanh toán qua VNPay</h2>
            <p style={styles.vnpaySubtitle}>
              {isProcessing ? 'Đang tạo URL thanh toán...' : 
               paymentUrl ? 'URL thanh toán đã được tạo thành công!' : 
               error ? 'Có lỗi xảy ra khi tạo thanh toán' :
               'Thanh toán an toàn và nhanh chóng qua hệ thống VNPay'}
            </p>
            {isProcessing && (
              <div style={styles.loadingSpinner}></div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorMessage}>
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={styles.successMessage}>
              ✅ {success}
            </div>
          )}

          {/* Payment Information */}
          <div style={styles.paymentInfo}>
            <h4 style={styles.infoTitle}>
              ℹ️ Thông tin thanh toán
            </h4>
            {paymentUrl ? (
              <>
                <p style={styles.infoText}>
                  ✅ URL thanh toán đã được tạo thành công!
                </p>
                <p style={styles.infoText}>
                  • Nhấn nút "Thanh toán VNPay" để chuyển đến trang thanh toán
                </p>
                <p style={styles.infoText}>
                  • Thanh toán được bảo mật bởi VNPay
                </p>
                <p style={styles.infoText}>
                  • Sau khi thanh toán thành công, bạn sẽ được chuyển về trang xác nhận
                </p>
                <p style={styles.infoText}>
                  ⚠️ Lưu ý: Trang VNPay có thể hiển thị lỗi JavaScript trong console, 
                  nhưng điều này không ảnh hưởng đến chức năng thanh toán
                </p>
              </>
            ) : error ? (
              <>
                <p style={styles.infoText}>
                  ❌ Có lỗi xảy ra khi tạo thanh toán
                </p>
                <p style={styles.infoText}>
                  • Vui lòng thử lại hoặc liên hệ hỗ trợ
                </p>
              </>
            ) : (
              <>
                <p style={styles.infoText}>
                  • Bạn sẽ được chuyển hướng đến trang thanh toán VNPay
                </p>
                <p style={styles.infoText}>
                  • Thanh toán được bảo mật bởi VNPay
                </p>
                <p style={styles.infoText}>
                  • Sau khi thanh toán thành công, bạn sẽ được chuyển về trang xác nhận
                </p>
              </>
            )}
            <p style={styles.infoText}>
              • Nếu có vấn đề, vui lòng liên hệ hotline: 1900 1234
            </p>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            {paymentUrl ? (
              <ButtonWithHover
                onClick={handlePayNow}
                style={styles.payButton}
              >
                💳 Thanh toán VNPay
              </ButtonWithHover>
            ) : (
              <ButtonWithHover
                onClick={handlePayment}
                disabled={isProcessing}
                style={{
                  ...styles.payButton,
                  opacity: isProcessing ? 0.7 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? (
                  <>
                    <div style={styles.loadingSpinner}></div>
                    Đang tạo thanh toán...
                  </>
                ) : (
                  <>
                    💳 Tạo thanh toán VNPay
                  </>
                )}
              </ButtonWithHover>
            )}
            
            <ButtonWithHover
              onClick={handleCancel}
              disabled={isProcessing}
              style={{
                ...styles.cancelButton,
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              ❌ Hủy bỏ
            </ButtonWithHover>
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div style={styles.rightSection}>
          <div style={styles.orderSummary}>
            <h3 style={styles.summaryTitle}>
              📋 Tóm tắt đơn hàng
            </h3>
            
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Mã đơn hàng:</span>
              <span style={styles.summaryValue}>{orderData.orderId}</span>
            </div>
            
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Khách hàng:</span>
              <span style={styles.summaryValue}>{orderData.customer.fullName}</span>
            </div>
            
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Số sản phẩm:</span>
              <span style={styles.summaryValue}>{orderData.items.length} sản phẩm</span>
            </div>
            
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Tổng tiền:</span>
              <span style={styles.totalAmount}>{formatPrice(orderData.total)}</span>
            </div>
          </div>

          {/* Order Items */}
          <div style={styles.orderItems}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
              Sản phẩm đã đặt:
            </h4>
            {orderData.items.map((item, index) => (
              <OrderItem key={index} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* CSS cho animation loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VNPayPage