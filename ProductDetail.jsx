import React, { useEffect, useState } from 'react'
import ReviewSection from './ReviewSection'

function ProductDetail({ productId, onBack, onAddToCart, user }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const buildImageUrl = (raw) => {
    if (!raw) return ''
    let path = String(raw).replace(/\\/g, '/').trim()
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('uploads')) path = '/' + path
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`
  }

  useEffect(() => {
    if (!productId) return
    
    setLoading(true)
    setError(null)
    
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Không tìm thấy sản phẩm')
        }
        return res.json()
      })
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [productId])

  // Kiểm tra sản phẩm đã trong wishlist chưa
  useEffect(() => {
    if (!productId) return
    const token = localStorage.getItem('token')
    if (!token) {
      setIsInWishlist(false)
      return
    }
    fetch(`http://localhost:5000/api/wishlist/check/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : { isInWishlist: false })
      .then(data => {
        if (typeof data.isInWishlist === 'boolean') setIsInWishlist(data.isInWishlist)
      })
      .catch(() => {})
  }, [productId])

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Vui lòng đăng nhập để sử dụng danh sách yêu thích')
      return
    }
    if (!productId) return
    try {
      setWishlistLoading(true)
      const method = isInWishlist ? 'DELETE' : 'POST'
      const res = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Thao tác thất bại')
      }
      setIsInWishlist(!isInWishlist)
    } catch (err) {
      alert(err.message)
    } finally {
      setWishlistLoading(false)
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
          Đang tải chi tiết sản phẩm...
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
        <h3>Lỗi: {error}</h3>
        <button 
          onClick={onBack}
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
          Quay lại
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Không tìm thấy sản phẩm</h3>
        <button 
          onClick={onBack}
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
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      {/* Nút quay lại */}
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
        Quay lại danh sách
      </button>

      {/* Thông tin sản phẩm */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Hình ảnh sản phẩm */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          {product.image ? (
            <img 
              src={buildImageUrl(product.image)} 
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '12px',
                background: '#f5f5f5'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '400px',
              background: '#f5f5f5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '18px'
            }}>
              Không có hình ảnh
            </div>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1976d2',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            {product.name}
          </h1>

          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#d32f2f',
            marginBottom: '16px'
          }}>
            {product.price.toLocaleString()}₫
          </div>

          {/* Rating và số lượng review */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: '20px',
                    color: star <= (product.averageRating || 0) ? '#ffc107' : '#e0e0e0'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={{
              fontSize: '16px',
              color: '#666',
              fontWeight: '500'
            }}>
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} ({product.totalReviews || 0} đánh giá)
            </span>
          </div>

          {/* Mô tả sản phẩm */}
          {product.description && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#333',
                marginBottom: '12px'
              }}>
                Mô tả sản phẩm
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: '#666',
                lineHeight: '1.6',
                margin: 0
              }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Số lượng còn lại */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '8px'
            }}>
              Tình trạng kho
            </h3>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: '600',
              background: product.quantity > 0 ? '#e8f5e8' : '#ffebee',
              color: product.quantity > 0 ? '#2e7d32' : '#d32f2f'
            }}>
              {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
            </div>
          </div>


          {/* Nút thêm vào giỏ hàng */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                if (!user) {
                  alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
                  return
                }
                onAddToCart && onAddToCart(product)
              }}
              disabled={product.quantity === 0}
              style={{
                padding: '12px 24px',
                background: (product.quantity > 0 && user) ? '#1976d2' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (product.quantity > 0 && user) ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (product.quantity > 0 && user) {
                  e.target.style.background = '#1565c0'
                }
              }}
              onMouseOut={(e) => {
                if (product.quantity > 0 && user) {
                  e.target.style.background = '#1976d2'
                }
              }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M7 20c.828 0 1.5-.672 1.5-1.5S7.828 17 7 17s-1.5.672-1.5 1.5S6.172 20 7 20Zm10 0c.828 0 1.5-.672 1.5-1.5S17.828 17 17 17s-1.5.672-1.5 1.5S16.172 20 17 20ZM7.2 15h9.45c.7 0 1.3-.46 1.46-1.13l1.7-7.03A1 1 0 0 0 18.85 6H6.16l-.31-1.36A1 1 0 0 0 4.88 4H2.75a.75.75 0 0 0 0 1.5h1.55l2.03 8.93c-.62.36-1.03 1.04-1.03 1.82C5.3 17.16 6.14 18 7.2 18h9.6a.75.75 0 0 0 0-1.5H7.2a.3.3 0 0 1-.3-.3c0-.17.13-.3.3-.3Zm10.24-7-1.5 6.22a.25.25 0 0 1-.24.18H7.53l-1.5-6.4h11.41Z" fill="currentColor"/>
              </svg>
              {!user ? 'Cần đăng nhập' : (product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng')}
            </button>

            <button 
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              style={{
                padding: '12px 24px',
                background: isInWishlist ? '#e91e63' : 'white',
                color: isInWishlist ? 'white' : '#1976d2',
                border: isInWishlist ? '2px solid #e91e63' : '2px solid #1976d2',
                borderRadius: '8px',
                cursor: wishlistLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (isInWishlist) return
                e.target.style.background = '#f5f5f5'
              }}
              onMouseOut={(e) => {
                if (isInWishlist) return
                e.target.style.background = 'white'
              }}
              title={isInWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <svg width="20" height="20" fill={isInWishlist ? 'white' : 'currentColor'} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {wishlistLoading ? 'Đang xử lý...' : (isInWishlist ? 'Đã yêu thích' : 'Yêu thích')}
            </button>
          </div>

          {/* Thông tin bổ sung */}
          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Mã sản phẩm:</strong> {product._id}
            </div>
            <div>
              <strong>Ngày tạo:</strong> {new Date(product.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Phần đánh giá */}
      <ReviewSection productId={productId} user={user} />

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

export default ProductDetail

