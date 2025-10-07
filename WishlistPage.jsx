import React, { useEffect, useState } from 'react'

function WishlistPage({ user, onViewDetail, onBack }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const buildImageUrl = (raw) => {
    if (!raw) return ''
    let path = String(raw).replace(/\\/g, '/').trim()
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('uploads')) path = '/' + path
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`
  }

  useEffect(() => {
    if (!user) {
      setError('Vui lòng đăng nhập để xem danh sách yêu thích')
      setLoading(false)
      return
    }

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setWishlist(data)
        } else {
          setError('Không thể tải danh sách yêu thích')
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        setError('Có lỗi xảy ra khi tải danh sách yêu thích')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user])

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setWishlist(prev => prev.filter(product => product._id !== productId))
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Có lỗi xảy ra khi xóa khỏi danh sách yêu thích')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '18px',
        color: '#1976d2'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Đang tải danh sách yêu thích...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#d32f2f'
      }}>
        {/* Nút quay lại */}
        {onBack && (
          <button 
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1976d2'
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Quay lại danh sách sản phẩm
          </button>
        )}
        <h3>Lỗi: {error}</h3>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#666'
      }}>
        {/* Nút quay lại */}
        {onBack && (
          <button 
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1976d2',
              margin: '0 auto 24px'
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Quay lại danh sách sản phẩm
          </button>
        )}
        
        <svg width="80" height="80" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 24px', opacity: 0.5 }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
        </svg>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
          Danh sách yêu thích trống
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '24px' }}>
          Bạn chưa có sản phẩm nào trong danh sách yêu thích
        </p>
        <button 
          onClick={onBack || (() => window.location.reload())}
          style={{
            padding: '12px 24px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Khám phá sản phẩm
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Nút quay lại */}
      {onBack && (
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#1976d2'
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại danh sách sản phẩm
        </button>
      )}
      
      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#1976d2',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Danh sách yêu thích ({wishlist.length})
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        padding: '0 10px'
      }}>
        {wishlist.map(product => (
          <div key={product._id} style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #e0e0e0',
            position: 'relative'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
          }}
          >
            {/* Hình ảnh sản phẩm */}
            <div style={{ marginBottom: '16px', textAlign: 'center', position: 'relative' }}>
              {product.image ? (
                <img 
                  src={buildImageUrl(product.image)} 
                  alt={product.name} 
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    background: '#f5f5f5'
                  }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '16px'
                }}>
                  Không có hình ảnh
                </div>
              )}
              
              {/* Nút xóa khỏi wishlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFromWishlist(product._id)
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(233, 30, 99, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(233, 30, 99, 1)'
                  e.target.style.transform = 'scale(1.1)'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(233, 30, 99, 0.9)'
                  e.target.style.transform = 'scale(1)'
                }}
                title="Xóa khỏi yêu thích"
              >
                <svg 
                  width="20" 
                  height="20" 
                  fill="white" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            {/* Thông tin sản phẩm */}
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#333',
                marginBottom: '8px',
                lineHeight: '1.3',
                height: '2.6em',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {product.name}
              </h3>
              
              <div style={{ 
                color: '#d32f2f', 
                fontWeight: '700', 
                fontSize: '20px',
                marginBottom: '8px'
              }}>
                {product.price.toLocaleString()}₫
              </div>
              
              {product.description && (
                <p style={{ 
                  color: '#666', 
                  fontSize: '14px',
                  marginBottom: '12px',
                  height: '2.8em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4'
                }}>
                  {product.description}
                </p>
              )}
              
              <div style={{ 
                color: product.quantity > 0 ? '#2e7d32' : '#d32f2f', 
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: product.quantity > 0 ? '#4caf50' : '#f44336'
                }}></div>
                {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
              </div>

              {/* Nút xem chi tiết */}
              <button 
                onClick={() => onViewDetail && onViewDetail(product._id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#1565c0'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#1976d2'
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
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

export default WishlistPage
