import React, { useState, useCallback, useMemo } from 'react'

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
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f0f0f0'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
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
  clearButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '16px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  productImage: {
    width: '120px',
    height: '120px',
    background: '#fff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #e2e8f0',
    overflow: 'hidden'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  productDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#dc2626'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    borderRadius: '12px',
    padding: '8px',
    border: '2px solid #e2e8f0'
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'all 0.3s ease'
  },
  quantityDisplay: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    minWidth: '40px',
    textAlign: 'center'
  },
  removeButton: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
  },
  checkoutSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '32px',
    color: '#fff',
    textAlign: 'center'
  },
  totalText: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  productCount: {
    fontSize: '16px',
    opacity: '0.9',
    marginBottom: '24px'
  },
  checkoutButton: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '16px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  }
}

function CartPage({ cart, onRemoveFromCart, onUpdateQuantity, onBack, onClearCart, onGoToCheckout }) {
  const [stockErrors, setStockErrors] = useState([])
  const [showStockErrorPopup, setShowStockErrorPopup] = useState(false)
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

  // Kiểm tra số lượng kho
  const checkStockAvailability = useCallback(async () => {
    const errors = []
    
    // Sử dụng Promise.all để kiểm tra song song
    const stockChecks = cart.map(async (item) => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${item.id}`)
        if (response.ok) {
          const product = await response.json()
          if (item.quantity > product.quantity) {
            return {
              productName: item.name,
              requestedQuantity: item.quantity,
              availableQuantity: product.quantity
            }
          }
        }
        return null
      } catch (error) {
        console.error('Error checking stock:', error)
        return {
          productName: item.name,
          requestedQuantity: item.quantity,
          availableQuantity: 0
        }
      }
    })
    
    const results = await Promise.all(stockChecks)
    return results.filter(Boolean)
  }, [cart])

  // Xử lý thanh toán với kiểm tra kho
  const handleCheckout = useCallback(async () => {
    setStockErrors([])
    setShowStockErrorPopup(false)
    
    try {
      const stockErrors = await checkStockAvailability()
      
      if (stockErrors.length > 0) {
        setStockErrors(stockErrors)
        setShowStockErrorPopup(true)
        return
      }
      
      // Nếu không có lỗi, chuyển đến trang thanh toán
      onGoToCheckout()
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Có lỗi xảy ra khi kiểm tra kho. Vui lòng thử lại.')
    }
  }, [checkStockAvailability, onGoToCheckout])

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

  // Component cho cart item
  const CartItem = ({ item, index }) => (
    <div style={styles.cartItem}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Product Image */}
      <div style={styles.productImage}>
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '10px'
            }}
          />
        ) : (
          <div style={{ fontSize: '32px', color: '#9ca3af' }}>📱</div>
        )}
      </div>

      {/* Product Info */}
      <div style={styles.productInfo}>
        <h3 style={styles.productName}>{item.name}</h3>
        <p style={styles.productDescription}>{item.description}</p>
        <div style={styles.productPrice}>{formatPrice(item.price)}</div>
      </div>

      {/* Quantity Controls */}
      <div style={styles.quantityControls}>
        <ButtonWithHover
          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
          disabled={item.quantity <= 1}
          style={{
            ...styles.quantityButton,
            background: item.quantity <= 1 ? '#f3f4f6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: item.quantity <= 1 ? '#9ca3af' : '#fff',
            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer'
          }}
        >
          −
        </ButtonWithHover>
        
        <span style={styles.quantityDisplay}>{item.quantity}</span>
        
        <ButtonWithHover
          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
          style={{
            ...styles.quantityButton,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff'
          }}
        >
          +
        </ButtonWithHover>
      </div>

      {/* Remove Button */}
      <ButtonWithHover
        onClick={() => onRemoveFromCart(index)}
        style={styles.removeButton}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)'
          e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)'
        }}
      >
        🗑️
      </ButtonWithHover>
    </div>
  )

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <ButtonWithHover onClick={onBack} style={styles.backButton}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Quay lại
            </ButtonWithHover>
            <h1 style={styles.title}>🛒 Giỏ hàng</h1>
          </div>
        </div>

        {/* Empty Cart */}
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '20px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '12px'
          }}>
            Giỏ hàng trống
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Bạn chưa có sản phẩm nào trong giỏ hàng.<br/>
            Hãy thêm sản phẩm yêu thích vào giỏ hàng nhé!
          </p>
          <ButtonWithHover 
            onClick={onBack}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            🛍️ Tiếp tục mua sắm
          </ButtonWithHover>
        </div>
      </div>
    )
  }

  return (
    <>
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <ButtonWithHover onClick={onBack} style={styles.backButton}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Quay lại
          </ButtonWithHover>
          <h1 style={styles.title}>🛒 Giỏ hàng ({cart.length} sản phẩm)</h1>
        </div>
        
        <ButtonWithHover onClick={onClearCart} style={styles.clearButton}>
          🗑️ Xóa tất cả
        </ButtonWithHover>
      </div>

      {/* Cart Items */}
      <div style={{ marginBottom: '32px' }}>
        {cart.map((item, index) => (
          <CartItem key={index} item={item} index={index} />
        ))}
      </div>


      {/* Total and Checkout */}
      <div style={styles.checkoutSection}>
        <div style={styles.totalText}>
          Tổng cộng: {formatPrice(total)}
        </div>
        <div style={styles.productCount}>
          {cart.length} sản phẩm
        </div>
        <ButtonWithHover
          onClick={handleCheckout}
          style={styles.checkoutButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)'
            e.target.style.borderColor = 'rgba(255,255,255,0.5)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)'
            e.target.style.borderColor = 'rgba(255,255,255,0.3)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          💳 Thanh toán
        </ButtonWithHover>
      </div>
    </div>

    {/* Stock Error Popup */}
    {showStockErrorPopup && (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          padding: 0,
          width: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '24px 32px',
            borderRadius: '24px 24px 0 0',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h3 style={{
              margin: 0,
              color: '#fff',
              fontSize: '20px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              ⚠️ Lỗi số lượng kho
            </h3>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '18px',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowStockErrorPopup(false)}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)'
              e.target.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)'
              e.target.style.transform = 'scale(1)'
            }}
            >
              ✕
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Các sản phẩm sau đã vượt quá số lượng có sẵn:
              </div>
              
              {stockErrors.map((error, index) => (
                <div key={index} style={{
                  background: '#fff',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#dc2626',
                    marginBottom: '8px'
                  }}>
                    {error.productName}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span>Số lượng yêu cầu: <strong>{error.requestedQuantity}</strong></span>
                    <span>Số lượng có sẵn: <strong>{error.availableQuantity}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#0369a1',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                💡 <strong>Hướng dẫn:</strong> Vui lòng điều chỉnh số lượng hoặc xóa sản phẩm khỏi giỏ hàng để tiếp tục thanh toán.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowStockErrorPopup(false)}
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default CartPage
