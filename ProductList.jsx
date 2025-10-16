import React, { useEffect, useState } from 'react'

function ProductList({ search, onViewDetail, user }) {
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


      {/* Filter Section - Đơn giản */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            🏷️ Danh mục:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#fff',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '160px'
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
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
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
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #e5e7eb'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {/* Hình ảnh sản phẩm - Đơn giản */}
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              {p.image ? (
                <img
                  src={buildImageUrl(p.image)}
                  alt={p.name}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  📱 Không có hình ảnh
                </div>
              )}
            </div>

            {/* Thông tin sản phẩm - Đơn giản */}
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                {p.name}
              </h3>

              {/* Category Badge */}
              {p.category && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: '#667eea',
                    color: '#fff'
                  }}>
                    {p.category.name || p.category}
                  </span>
                </div>
              )}

              <div style={{
                color: '#667eea',
                fontWeight: '700',
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
                  lineHeight: '1.4'
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
                gap: '4px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: p.quantity > 0 ? '#10b981' : '#ef4444'
                }}></span>
                {p.quantity > 0 ? `Còn ${p.quantity}` : 'Hết hàng'}
              </div>

              {/* Nút xem chi tiết - Đơn giản */}
              <button
                onClick={() => onViewDetail && onViewDetail(p._id)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                👁️ Xem Chi Tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
