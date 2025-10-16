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
  gridLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px'
  },
  formSection: {
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
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    lineHeight: '1.5',
    fontFamily: 'inherit'
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    width: '100%'
  },
  orderSummary: {
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
  }
}

function CheckoutPage({ cart, user, onBack, onClearCart }) {
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    paymentMethod: 'cod',
    notes: ''
  })

  // Memoized calculations
  const total = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cart])

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }, [])

  // Cập nhật form khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }))
    }
  }, [user])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const validateForm = useCallback(() => {
    const requiredFields = ['fullName', 'email', 'phone', 'address']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
      return false
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Vui lòng nhập email hợp lệ!')
      return false
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)!')
      return false
    }
    
    return true
  }, [formData])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Simulate payment processing
    const notesText = formData.notes ? `\nGhi chú: ${formData.notes}` : ''
    const confirmPayment = window.confirm(
      `Xác nhận thanh toán?\n\n` +
      `Tổng tiền: ${formatPrice(total)}\n` +
      `Phương thức: ${formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}\n` +
      `Thông tin sẽ được gửi đến email: ${formData.email}${notesText}`
    )

    if (confirmPayment) {
      alert('Đặt hàng thành công!\n\nĐơn hàng của bạn đã được xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.')
      onClearCart() // Clear cart after successful payment
      onBack() // Go back to main page
    }
  }, [formData, total, formatPrice, validateForm, onClearCart, onBack])

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

  // Component cho input field
  const InputField = ({ label, name, type = 'text', required = false, value, onChange, ...props }) => (
    <div>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={styles.input}
        onFocus={(e) => {
          e.target.style.borderColor = '#667eea'
          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb'
          e.target.style.boxShadow = 'none'
        }}
        {...props}
      />
    </div>
  )


  // Component cho payment option
  const PaymentOption = ({ value, checked, onChange, icon, title, description }) => (
    <label style={{
      ...styles.paymentOption,
      background: checked ? 'rgba(102, 126, 234, 0.1)' : '#fff',
      border: `2px solid ${checked ? '#667eea' : '#e5e7eb'}`
    }}>
      <input 
        type="radio" 
        name="paymentMethod" 
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ margin: 0 }}
      />
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          {title}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {description}
        </div>
      </div>
    </label>
  )

  // Component cho order item
  const OrderItem = ({ item }) => (
    <div style={{
      ...styles.orderItem,
      borderBottom: cart.indexOf(item) < cart.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
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
        <h1 style={styles.title}>💳 Thanh toán</h1>
      </div>

      <div style={styles.gridLayout}>
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                👤 Thông tin cá nhân
              </h2>
              
              <div style={styles.inputGrid}>
                <InputField
                  label="Họ và tên"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div style={styles.inputGrid}>
                <InputField
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Địa chỉ giao hàng"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              {/* Ghi chú */}
              <div style={{ marginTop: '16px' }}>
                <label style={styles.label}>Ghi chú (tùy chọn)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  style={styles.textarea}
                  placeholder="Nhập ghi chú của bạn..."
                  maxLength={500}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {formData.notes.length}/500 ký tự
                </div>
              </div>

            </div>

            {/* Payment Method */}
            <div style={styles.formSection}>
              <h2 style={styles.sectionTitle}>
                💳 Phương thức thanh toán
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <PaymentOption
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  icon="💰"
                  title="Thanh toán khi nhận hàng (COD)"
                  description="Thanh toán bằng tiền mặt khi nhận được hàng"
                />

                <PaymentOption
                  value="bank"
                  checked={formData.paymentMethod === 'bank'}
                  onChange={handleInputChange}
                  icon="🏦"
                  title="Chuyển khoản ngân hàng"
                  description="Chuyển khoản trước khi giao hàng"
                />
              </div>
            </div>

            {/* Submit Button */}
            <ButtonWithHover
              type="submit"
              style={styles.submitButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              🛒 Đặt hàng ngay
            </ButtonWithHover>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div style={styles.orderSummary}>
            <h2 style={styles.orderTitle}>
              📋 Tóm tắt đơn hàng
            </h2>

            {/* Cart Items */}
            <div style={{ marginBottom: '20px' }}>
              {cart.map((item, index) => (
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

export default CheckoutPage
