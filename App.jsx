import React, { useEffect, useState, useCallback, useMemo } from 'react'
import AuthForm from './AuthForm'
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'
import BannerCarousel from './BannerCarousel'
import AdminDashboard from './AdminDashboard'
import CartPage from './CartPage'
import CheckoutPage from './CheckoutPage'
import WishlistPage from './WishlistPage'
import ViewOrder from './ViewOrder'
import VNPayPage from './VNPayPage'
import OrderHistory from './OrderHistory'
import { ToastManager, useToast } from './Toast'

// Styles constants
const styles = {
  navbar: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: 50,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backdropFilter: 'blur(10px)'
  },
  logoButton: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 1,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
  },
  searchContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '400px'
  },
  searchWrapper: {
    position: 'relative',
    width: '100%'
  },
  searchInput: {
    width: '100%',
    padding: '8px 16px 8px 40px',
    borderRadius: 20,
    border: 'none',
    fontSize: 14,
    background: 'rgba(255,255,255,0.9)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '14px'
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  navButton: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    borderRadius: 15,
    padding: '6px 16px',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff'
  },
  mainContainer: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh',
    paddingBottom: '20px'
  },
  contentWrapper: {
    maxWidth: 1200,
    width: '100%',
    margin: '30px auto 0 auto',
    padding: '0 16px'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.25)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    background: '#fff',
    width: '100%',
    height: '100%'
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 32,
    fontSize: 32,
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer'
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [showHomepage, setShowHomepage] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [search, setSearch] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [editData, setEditData] = useState({ username: '', email: '', address: '', phone: '' })
  const [showChangePw, setShowChangePw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showViewOrder, setShowViewOrder] = useState(false)
  const [showVNPay, setShowVNPay] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Toast management
  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast()
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on initialization
    try {
      const savedCart = localStorage.getItem('cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return []
    }
  })

  const API_BASE = 'http://localhost:5000'

  // Tự đăng nhập lại nếu có token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: 'Bearer ' + token } })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Không thể tải hồ sơ')
        setUser(data)
        setShowHomepage(true)
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
  }, [])

  // Cập nhật editData khi user thay đổi
  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  // Lưu cart vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  // Memoized functions
  const handleSearch = useCallback((value) => {
    setSearch(value)
  }, [])

  const handleViewProductDetail = useCallback((productId) => {
    setSelectedProductId(productId)
    setShowProductDetail(true)
  }, [])

  const handleBackToList = useCallback(() => {
    setShowProductDetail(false)
    setSelectedProductId(null)
  }, [])

  const buildImageUrl = useCallback((raw) => {
    if (!raw) return ''
    let path = String(raw).replace(/\\/g, '/').trim()
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('uploads')) path = '/' + path
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`
  }, [])

  // Cart functions
  const handleAddToCart = useCallback((product) => {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    if (!user) {
      showError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
      setShowAuth(true) // Hiển thị form đăng nhập
      return
    }

    const existingItem = cart.find(item => item.id === product._id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: buildImageUrl(product.image),
        quantity: 1
      }])
    }
    setShowCart(true) // Chuyển sang trang Cart
  }, [cart, buildImageUrl, user, showError])

  const handleRemoveFromCart = useCallback((index) => {
    const removedItem = cart[index]
    setCart(cart.filter((_, i) => i !== index))
    showSuccess(`Đã xóa "${removedItem.name}" khỏi giỏ hàng!`)
  }, [cart, showSuccess])

  const handleUpdateQuantity = useCallback((index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(index)
      return
    }
    setCart(cart.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ))
  }, [cart, handleRemoveFromCart])

  const handleBackFromCart = useCallback(() => {
    setShowCart(false)
  }, [])

  const handleGoToCheckout = useCallback(() => {
    // Kiểm tra đăng nhập trước khi thanh toán
    if (!user) {
      showError('Vui lòng đăng nhập để thực hiện thanh toán!')
      setShowAuth(true) // Hiển thị form đăng nhập
      return
    }
    setShowCheckout(true)
  }, [user, showError])

  const handleBackFromCheckout = useCallback(() => {
    setShowCheckout(false)
  }, [])

  const handleBackFromWishlist = useCallback(() => {
    setShowWishlist(false)
  }, [])

  const handleBackFromOrderHistory = useCallback(() => {
    setShowOrderHistory(false)
  }, [])

  const handleViewOrder = useCallback((orderInfo) => {
    setOrderData(orderInfo)
    setShowViewOrder(true)
    setShowCheckout(false)
    setShowVNPay(false)
  }, [])

  const handleGoToVNPay = useCallback((orderInfo) => {
    setOrderData(orderInfo)
    setShowVNPay(true)
    setShowCheckout(false)
  }, [])

  const handleBackFromVNPay = useCallback(() => {
    setShowVNPay(false)
  }, [])

  const handleVNPaySuccess = useCallback((orderInfo) => {
    setOrderData(orderInfo)
    setShowViewOrder(true)
    setShowVNPay(false)
  }, [])

  const handleVNPayCancel = useCallback(() => {
    setShowVNPay(false)
    setShowCheckout(true)
  }, [])


  const handleBackFromViewOrder = useCallback(() => {
    setShowViewOrder(false)
    setOrderData(null)
  }, [])

  const handleContinueShopping = useCallback(() => {
    setShowViewOrder(false)
    setOrderData(null)
    setShowCart(false)
    setShowCheckout(false)
    setShowVNPay(false)
  }, [])

  const handleClearCart = useCallback(() => {
    const confirmClear = window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')
    if (confirmClear) {
      setCart([])
      showSuccess('Đã xóa tất cả sản phẩm khỏi giỏ hàng!')
    }
  }, [showSuccess])

  const handleClearCartSilent = useCallback(() => {
    setCart([])
  }, [])

  // Navigation handlers
  const handleGoHome = useCallback(() => {
    setShowHomepage(true)
    setShowProductDetail(false)
    setShowCart(false)
    setShowCheckout(false)
    setShowWishlist(false)
    setShowViewOrder(false)
    setShowVNPay(false)
    setShowOrderHistory(false)
    setSelectedProductId(null)
    setOrderData(null)
  }, [])

  // Component cho button với hover effects
  const ButtonWithHover = ({ children, style, onClick, ...props }) => (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (style.background?.includes('rgba(255,255,255,0.2)')) {
          e.target.style.background = 'rgba(255,255,255,0.3)'
          e.target.style.borderColor = 'rgba(255,255,255,0.5)'
        }
        if (style.transform) {
          e.target.style.transform = 'translateY(-2px)'
        } else if (style.fontSize === 20) {
          e.target.style.transform = 'scale(1.05)'
          e.target.style.textShadow = '0 4px 8px rgba(0,0,0,0.4)'
        }
      }}
      onMouseLeave={(e) => {
        if (style.background?.includes('rgba(255,255,255,0.2)')) {
          e.target.style.background = 'rgba(255,255,255,0.2)'
          e.target.style.borderColor = 'rgba(255,255,255,0.3)'
        }
        if (style.transform) {
          e.target.style.transform = 'translateY(0)'
        } else if (style.fontSize === 20) {
          e.target.style.transform = 'scale(1)'
          e.target.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)'
        }
      }}
      {...props}
    >
      {children}
    </button>
  )

  // Navbar component
  const renderNavbar = useCallback((showLoginBtn = true, showProfileBtn = false) => (
    <nav style={styles.navbar}>
      <ButtonWithHover 
        onClick={handleGoHome}
        style={styles.logoButton}
      >
        📱 GadgetPhone
      </ButtonWithHover>
      
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
        <input
          type="text"
            placeholder=" Tìm kiếm..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,1)'
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
              e.target.style.transform = 'scale(1.02)'
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.9)'
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
              e.target.style.transform = 'scale(1)'
            }}
          />
          <div style={styles.searchIcon}>🔍</div>
      </div>
      </div>
      
      <div style={styles.navButtons}>
        <ButtonWithHover 
          onClick={() => {
            if (!user) {
              showError('Vui lòng đăng nhập để xem giỏ hàng!')
              setShowAuth(true)
              return
            }
            setShowCart(true)
          }}
          style={styles.navButton}
        >
          🛒
          {cart.length > 0 && (
            <span style={styles.cartBadge}>
              {cart.length}
            </span>
          )}
        </ButtonWithHover>
        
        {user && (
          <ButtonWithHover 
            onClick={() => setShowWishlist(true)}
            style={styles.navButton}
            title="Danh sách yêu thích"
          >
            ❤️
          </ButtonWithHover>
        )}
        
        {showProfileBtn && user && (
          <ButtonWithHover 
            onClick={() => setShowProfile(true)} 
            style={styles.navButton}
          >
            👤
          </ButtonWithHover>
        )}
        
        {showLoginBtn && (
          <ButtonWithHover 
            onClick={() => setShowAuth(true)} 
            style={styles.navButton}
          >
            🔐
          </ButtonWithHover>
        )}
        
      </div>
    </nav>
  ), [search, cart.length, user, handleSearch, handleGoHome, showError])

  // Content wrapper component
  const ContentWrapper = useCallback(() => (
    <div style={styles.contentWrapper}>
      {showViewOrder ? (
        <ViewOrder 
          orderData={orderData}
          onBack={handleBackFromViewOrder}
          onContinueShopping={handleContinueShopping}
        />
      ) : showVNPay ? (
        <VNPayPage 
          orderData={orderData}
          onBack={handleBackFromVNPay}
          onPaymentSuccess={handleVNPaySuccess}
          onPaymentCancel={handleVNPayCancel}
        />
      ) : showCheckout ? (
        <CheckoutPage 
          cart={cart} 
          user={user}
          onBack={handleBackFromCheckout}
          onClearCart={handleClearCart}
          onClearCartSilent={handleClearCartSilent}
          onViewOrder={handleViewOrder}
          onGoToVNPay={handleGoToVNPay}
          showToast={{ showSuccess, showError, showWarning, showInfo }}
        />
      ) : showCart ? (
        <CartPage 
          cart={cart} 
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onBack={handleBackFromCart}
          onClearCart={handleClearCart}
          onGoToCheckout={handleGoToCheckout}
        />
      ) : showWishlist ? (
        <WishlistPage 
          user={user}
          onViewDetail={handleViewProductDetail}
          onBack={handleBackFromWishlist}
        />
      ) : showOrderHistory ? (
        <OrderHistory 
          user={user}
          onBack={handleBackFromOrderHistory}
        />
      ) : showProductDetail ? (
        <ProductDetail 
          productId={selectedProductId} 
          onBack={handleBackToList}
          onAddToCart={handleAddToCart}
          user={user}
        />
      ) : (
        <ProductList key={refreshKey} search={search} onViewDetail={handleViewProductDetail} />
      )}
    </div>
  ), [
    showViewOrder, showVNPay, showCheckout, showCart, showWishlist, showOrderHistory, showProductDetail, 
    cart, user, selectedProductId, search, orderData, refreshKey,
    handleBackFromViewOrder, handleContinueShopping,
    handleBackFromVNPay, handleVNPaySuccess, handleVNPayCancel,
    handleBackFromCheckout, handleClearCart, handleClearCartSilent, handleViewOrder, handleGoToVNPay,
    handleRemoveFromCart, handleUpdateQuantity,
    handleBackFromCart, handleGoToCheckout,
    handleBackFromWishlist, handleBackFromOrderHistory, handleBackToList, 
    handleAddToCart, handleViewProductDetail
  ])

  // Profile popup component
  const ProfilePopup = useCallback(() => {
    if (!showProfile) return null

    return (
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
          borderRadius: 24, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
          padding: 0, 
          width: 450, 
          maxHeight: '85vh', 
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px 32px',
            borderRadius: '24px 24px 0 0',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              border: '3px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              👤
            </div>
            <h3 style={{ 
              margin: 0, 
              color: '#fff', 
              fontSize: '24px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Thông tin cá nhân
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
            onClick={() => setShowProfile(false)}
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
            {!editProfile ? (
              <>
                {/* User Info Cards */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px'
                      }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Tên đăng nhập
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                          {user?.username}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px'
                      }}>
                        📧
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Email
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                          {user?.email || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px'
                      }}>
                        📍
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Địa chỉ
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                          {user?.address || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px'
                      }}>
                        📱
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Số điện thoại
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                          {user?.phone || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.2)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '18px'
                      }}>
                        {user?.role === 'admin' ? '👑' : '👤'}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Vai trò
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                          {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <button 
                    onClick={() => setEditProfile(true)} 
                    title="Chỉnh sửa thông tin"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    ✏️
                  </button>
                  
                  <button 
                    onClick={() => setShowChangePw(true)} 
                    title="Đổi mật khẩu"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    🔐
                  </button>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: user?.role !== 'admin' ? 'repeat(2, 1fr)' : '1fr', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {user?.role !== 'admin' && (
                    <button 
                      onClick={() => {
                        setShowProfile(false);
                        setShowOrderHistory(true);
                      }} 
                      title="Lịch sử đơn hàng"
                      style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '16px', 
                        padding: '16px', 
                        fontWeight: '600', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      📦
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowWishlist(true)} 
                    title="Danh sách yêu thích"
                    style={{ 
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    ❤️
                  </button>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px'
                }}>
                  <button 
                    onClick={() => { 
                      localStorage.removeItem('token'); 
                      setUser(null); 
                      setShowProfile(false);
                      
                      // Nếu đang ở trang ViewOrder, VNPay hoặc OrderHistory, đưa về trang chủ
                      if (showViewOrder || showVNPay || showOrderHistory) {
                        setShowViewOrder(false);
                        setShowVNPay(false);
                        setShowOrderHistory(false);
                        setOrderData(null);
                        setShowHomepage(true);
                        setShowProductDetail(false);
                        setShowCart(false);
                        setShowCheckout(false);
                        setShowWishlist(false);
                        setSelectedProductId(null);
                      }
                      
                      // Giữ nguyên cart khi logout
                      if (cart.length > 0) {
                        alert(`Đã đăng xuất thành công!\n\nGiỏ hàng của bạn (${cart.length} sản phẩm) vẫn được lưu.\n\nLưu ý: Bạn cần đăng nhập lại để có thể mua sắm và thanh toán.`)
                      }
                    }} 
                    title="Đăng xuất"
                    style={{ 
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    🚪
                  </button>
                  
                  <button 
                    onClick={() => setShowProfile(false)} 
                    title="Đóng"
                    style={{ 
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '16px',
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
                    ✕
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Form Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#fff', 
                    fontSize: '20px',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    ✏️ Chỉnh sửa thông tin
                  </h3>
                </div>

                <form onSubmit={async e => {
                  e.preventDefault()
                  try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('Bạn chưa đăng nhập')
                    const res = await fetch(`${API_BASE}/api/auth/me`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                      body: JSON.stringify(editData)
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại')
                    setUser(data)
                    setEditProfile(false)
                  } catch (err) {
                    alert(err.message)
                  }
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      👤 Tên đăng nhập
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nhập tên đăng nhập" 
                      value={editData.username} 
                      onChange={e => setEditData({...editData, username: e.target.value})} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      📧 Email
                    </label>
                    <input 
                      type="email" 
                      placeholder="Nhập email" 
                      value={editData.email} 
                      onChange={e => setEditData({...editData, email: e.target.value})} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      📍 Địa chỉ
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nhập địa chỉ" 
                      value={editData.address} 
                      onChange={e => setEditData({...editData, address: e.target.value})} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      📱 Số điện thoại
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nhập số điện thoại" 
                      value={editData.phone} 
                      onChange={e => setEditData({...editData, phone: e.target.value})} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '12px' 
                  }}>
                    <button 
                      type="submit" 
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '16px', 
                        padding: '14px 20px', 
                        fontWeight: '700',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      💾 Lưu
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setEditProfile(false)} 
                      style={{ 
                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '16px', 
                        padding: '14px 20px', 
                        fontWeight: '700',
                        fontSize: '16px',
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
                      ❌ Hủy
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }, [showProfile, user, editProfile, editData, cart.length, showViewOrder, showVNPay])

  // Nếu user là admin
  if (user && user.role === 'admin') {
    return <AdminDashboard onLogout={() => {
      localStorage.removeItem('token');
      setUser(null);
      setShowHomepage(false);
      // Reset tất cả trạng thái khi admin logout
      setShowViewOrder(false);
      setShowVNPay(false);
      setShowOrderHistory(false);
      setOrderData(null);
      setShowProductDetail(false);
      setShowCart(false);
      setShowCheckout(false);
      setShowWishlist(false);
      setSelectedProductId(null);
    }} />
  }

  return (
    !user ? (
      showHomepage ? (
        <>
          {renderNavbar(true, false)}
          <div style={styles.mainContainer}>
          <BannerCarousel />
            <ContentWrapper />
          </div>
          {showAuth && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <AuthForm
                  onAuth={(data) => {
                    const token = localStorage.getItem('token')
                    if (!token) { setUser({ role: data.role || 'customer' }); setShowHomepage(true); setShowAuth(false); return }
                    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: 'Bearer ' + token } })
                      .then(r => r.json())
                      .then(profile => { setUser(profile); setShowHomepage(true); setShowAuth(false) })
                      .catch(() => { setUser({ role: data.role || 'customer' }); setShowHomepage(true); setShowAuth(false) })
                  }}
                  onShowHomepage={() => { setShowHomepage(true); setShowAuth(false) }}
                  forceShowForm
                />
              </div>
              <button onClick={() => setShowAuth(false)} style={styles.closeButton}>&times;</button>
            </div>
          )}
        </>
      ) : (
        <AuthForm onAuth={setUser} onShowHomepage={() => setShowHomepage(true)} />
      )
    ) : (
      <>
        {renderNavbar(false, true)}
        <div style={styles.mainContainer}>
        <BannerCarousel />
          <ContentWrapper />
        </div>
        <ProfilePopup />
        {/* Popup đổi mật khẩu */}
        {showChangePw && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            zIndex: 2100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              borderRadius: 24, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
              padding: 0, 
              width: 400,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                  🔐 Đổi mật khẩu
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
                onClick={() => setShowChangePw(false)}
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
              <form onSubmit={async e => {
                e.preventDefault()
                try {
                  const token = localStorage.getItem('token')
                  if (!token) throw new Error('Bạn chưa đăng nhập')
                  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                    body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại')
                  setPwMsg('Đổi mật khẩu thành công')
                  setCurrentPw('')
                  setNewPw('')
                } catch (err) {
                  setPwMsg(err.message)
                }
              }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      🔒 Mật khẩu hiện tại
                    </label>
                    <input 
                      type="password" 
                      placeholder="Nhập mật khẩu hiện tại" 
                      value={currentPw} 
                      onChange={e => setCurrentPw(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f59e0b'
                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      🔑 Mật khẩu mới
                    </label>
                    <input 
                      type="password" 
                      placeholder="Nhập mật khẩu mới" 
                      value={newPw} 
                      onChange={e => setNewPw(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f59e0b'
                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                      required 
                    />
                  </div>

                  {pwMsg && (
                    <div style={{ 
                      color: pwMsg.includes('thành công') ? '#10b981' : '#ef4444', 
                      marginBottom: '20px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: pwMsg.includes('thành công') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${pwMsg.includes('thành công') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {pwMsg.includes('thành công') ? '✅ ' : '❌ '}{pwMsg}
                    </div>
                  )}

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '12px' 
                  }}>
                    <button 
                      type="submit" 
                      style={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '16px', 
                        padding: '14px 20px', 
                        fontWeight: '700',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      💾 Lưu
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setShowChangePw(false)} 
                      style={{ 
                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '16px', 
                        padding: '14px 20px', 
                        fontWeight: '700',
                        fontSize: '16px',
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
                      ❌ Hủy
                    </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast Notifications */}
        <ToastManager toasts={toasts} onRemoveToast={removeToast} />
      </>
    )
  )
}

export default App
