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
  errorIcon: {
    fontSize: '80px',
    marginBottom: '24px',
    color: '#ef4444'
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
  errorInfo: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '1px solid #fca5a5',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(239, 68, 68, 0.1)'
  },
  infoLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#dc2626'
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
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }
}

function PaymentFail() {
  const [errorInfo, setErrorInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lấy thông tin từ URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId')
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    console.log('❌ Payment failed - Order ID:', orderId, 'Code:', code, 'Error:', error)

    setErrorInfo({
      orderId: orderId,
      code: code,
      error: error
    })
    setLoading(false)
  }, [])

  const getErrorMessage = (code, error) => {
    if (error === 'invalid_signature') {
      return 'Chữ ký không hợp lệ'
    }
    if (error === 'server_error') {
      return 'Lỗi server'
    }
    if (code) {
      const errorCodes = {
        '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
        '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
        '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
        '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
        '12': 'Giao dịch bị hủy',
        '24': 'Khách hàng hủy giao dịch',
        '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
        '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
        '75': 'Ngân hàng thanh toán đang bảo trì.',
        '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.'
      }
      return errorCodes[code] || `Lỗi thanh toán với mã: ${code}`
    }
    return 'Thanh toán thất bại'
  }

  const handleRetryPayment = () => {
    // Quay lại trang checkout để thử lại
    window.location.href = '/?page=checkout'
  }

  const handleBackToHome = () => {
    window.location.href = '/'
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
      {/* Error Icon */}
      <div style={styles.errorIcon}>❌</div>
      
      {/* Title */}
      <h1 style={styles.title}>Thanh toán thất bại!</h1>
      
      {/* Subtitle */}
      <p style={styles.subtitle}>
        Rất tiếc, giao dịch của bạn không thể hoàn thành.<br/>
        Vui lòng kiểm tra lại thông tin và thử lại.
      </p>

      {/* Error Information */}
      {errorInfo && (
        <div style={styles.errorInfo}>
          {errorInfo.orderId && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mã đơn hàng:</span>
              <span style={styles.infoValue}>{errorInfo.orderId}</span>
            </div>
          )}
          {errorInfo.code && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mã lỗi:</span>
              <span style={styles.infoValue}>{errorInfo.code}</span>
            </div>
          )}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Lý do:</span>
            <span style={styles.infoValue}>{getErrorMessage(errorInfo.code, errorInfo.error)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          onClick={handleRetryPayment}
          style={styles.primaryButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)'
          }}
        >
          🔄 Thử lại thanh toán
        </button>
        
        <button
          onClick={handleBackToHome}
          style={styles.secondaryButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)'
          }}
        >
          🏠 Về trang chủ
        </button>
      </div>
    </div>
  )
}

export default PaymentFail