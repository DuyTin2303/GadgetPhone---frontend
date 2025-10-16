import React, { useEffect, useState } from 'react'

function ProductList({ search, onViewDetail }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  // Hàm xử lý đường dẫn ảnh
  const buildImageUrl = (raw) => {
    if (!raw) return ''
    let path = String(raw).replace(/\\/g, '/').trim()
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('uploads')) path = '/' + path
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`
    return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`
  }

  useEffect(() => {
    console.log('ProductList: Fetching products...')
    setLoading(true)
    
    // Load products
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        console.log('ProductList: Products loaded:', data)
        setProducts(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('ProductList: Error loading products:', error)
        setLoading(false)
      })
    
    // Load categories
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data.filter(cat => cat.isActive))
      })
      .catch(() => {})
  }, [])

  const filtered = products.filter(p => {
    // Filter by search
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    
    // Filter by category
    const matchesCategory = !selectedCategory || 
      (p.category && (p.category._id === selectedCategory || p.category === selectedCategory))
    
    return matchesSearch && matchesCategory
  })

  if (loading) return <p>Đang tải danh sách sản phẩm...</p>
  if (!filtered.length) return <p>Không có sản phẩm nào.</p>

  return (
    <div>
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px',
          letterSpacing: '0.5px'
        }}>
          🛍️ Danh sách sản phẩm
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500',
          margin: 0
        }}>
          Khám phá những sản phẩm công nghệ tuyệt vời
        </p>
      </div>

      {/* Filter Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '12px 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🏷️ Danh mục:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease',
              minWidth: '180px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        padding: '0 8px'
      }}>
        {filtered.map(p => (
          <div key={p._id} style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
              e.currentTarget.style.background = 'rgba(255,255,255,1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
            }}
          >
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px 20px 0 0'
            }}></div>
            {/* Hình ảnh sản phẩm */}
            <div style={{ marginBottom: '12px', textAlign: 'center', position: 'relative' }}>
              {p.image ? (
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  padding: '8px'
                }}>
                  <img
                    src={buildImageUrl(p.image)}
                    alt={p.name}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.05)'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  📱 Không có hình ảnh
                </div>
              )}
            </div>

            {/* Thông tin sản phẩm */}
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                lineHeight: '1.3',
                height: '2.6em',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {p.name}
              </h3>

              {/* Category Badge */}
              {p.category && (
                <div style={{
                  marginBottom: '8px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {p.category.name || p.category}
                  </span>
                </div>
              )}

              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800',
                fontSize: '18px',
                marginBottom: '8px'
              }}>
                {p.price.toLocaleString()}₫
              </div>

              {p.description && (
                <p style={{
                  color: '#6b7280',
                  fontSize: '12px',
                  marginBottom: '10px',
                  height: '2.4em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.2'
                }}>
                  {p.description}
                </p>
              )}

              <div style={{
                color: p.quantity > 0 ? '#059669' : '#dc2626',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: p.quantity > 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${p.quantity > 0 ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: p.quantity > 0 ? '#10b981' : '#ef4444'
                }}></div>
                {p.quantity > 0 ? `Còn ${p.quantity}` : 'Hết hàng'}
              </div>

              {/* Nút xem chi tiết */}
              <button
                onClick={() => onViewDetail && onViewDetail(p._id)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
                Xem Chi Tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
