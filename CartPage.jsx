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
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover',
    background: '#e5e7eb'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  itemPrice: {
    fontSize: '16px',
    color: '#059669',
    fontWeight: '600'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  quantityInput: {
    width: '60px',
    height: '32px',
    textAlign: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600'
  },
  removeButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '16px',
    marginBottom: '24px'
  },
  continueShoppingButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  summary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff'
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  summaryLabel: {
    fontSize: '16px',
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '600'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '2px solid rgba(255,255,255,0.3)',
    marginTop: '16px'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '700'
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '700'
  },
  checkoutButton: {
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
    width: '100%',
    marginTop: '20px'
  }
}

function CartPage({ cart, onRemoveFromCart, onUpdateQuantity, onBack, onClearCart, onGoToCheckout }) {
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }, [])

  const total = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cart])

  const handleQuantityChange = useCallback((index, newQuantity) => {
    if (newQuantity < 1) {
      onRemoveFromCart(index)
    } else {
      onUpdateQuantity(index, newQuantity)
    }
  }, [onRemoveFromCart, onUpdateQuantity])

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button onClick={onBack} style={styles.backButton}>
              ← Quay lại
            </button>
            <h1 style={styles.title}>Giỏ hàng</h1>
          </div>
        </div>

        <div style={styles.emptyCart}>
          <div style={styles.emptyIcon}>🛒</div>
          <div style={styles.emptyTitle}>Giỏ hàng trống</div>
          <div style={styles.emptyText}>
            Bạn chưa có sản phẩm nào trong giỏ hàng.<br />
            Hãy thêm sản phẩm để tiếp tục mua sắm!
          </div>
          <button onClick={onBack} style={styles.continueShoppingButton}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backButton}>
            ← Quay lại
          </button>
          <h1 style={styles.title}>Giỏ hàng ({cart.length})</h1>
        </div>
        <button onClick={onClearCart} style={styles.clearButton}>
          🗑️ Xóa tất cả
        </button>
      </div>

      <div style={styles.cartItems}>
        {cart.map((item, index) => (
          <div key={index} style={styles.cartItem}>
            <img 
              src={item.image} 
              alt={item.name}
              style={styles.itemImage}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div style={{...styles.itemImage, display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
              📱
            </div>
            
            <div style={styles.itemInfo}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemPrice}>{formatPrice(item.price)}</div>
            </div>

            <div style={styles.quantityControls}>
              <button 
                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                style={styles.quantityButton}
              >
                -
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                style={styles.quantityInput}
                min="1"
              />
              <button 
                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                style={styles.quantityButton}
              >
                +
              </button>
            </div>

            <div style={{...styles.itemPrice, minWidth: '120px', textAlign: 'right'}}>
              {formatPrice(item.price * item.quantity)}
            </div>

            <button 
              onClick={() => onRemoveFromCart(index)}
              style={styles.removeButton}
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <h2 style={styles.summaryTitle}>
          📋 Tóm tắt đơn hàng
        </h2>
        
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Tạm tính:</span>
          <span style={styles.summaryValue}>{formatPrice(total)}</span>
        </div>
        
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Phí vận chuyển:</span>
          <span style={styles.summaryValue}>Miễn phí</span>
        </div>
        
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Tổng cộng:</span>
          <span style={styles.totalValue}>{formatPrice(total)}</span>
        </div>

        <button onClick={onGoToCheckout} style={styles.checkoutButton}>
          🛒 Thanh toán
        </button>
      </div>
    </div>
  )
}

export default CartPage
