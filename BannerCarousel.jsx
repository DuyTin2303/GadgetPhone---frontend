import React, { useState, useEffect } from 'react'

const bannerItems = [
  {
    title: 'iPhone 15 Pro Max',
    desc: 'Siêu phẩm mới nhất, camera đỉnh cao, hiệu năng vượt trội!',
    color: '#e3f0ff',
    img: 'https://msmobile.vn/upload_images/images/2023/09/13/iPhone-15-Pro-Max-1.jpg',
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    desc: 'Màn hình lớn, pin trâu, chụp đêm cực chất!',
    color: '#fff8f8',
    img: 'https://samcenter.vn/images/thumbs/0012150_samsung-galaxy-s24-ultra-512gb-sao-chep.jpeg',
  },
  {
    title: 'Xiaomi 14 Pro',
    desc: 'Giá tốt, cấu hình mạnh, thiết kế sang trọng!',
    color: '#fcb69f',
    img: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/257/835/products/3-6.png?v=1735288850030',
  },
]

function BannerCarousel() {
  const [index, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setIndex(i => (i + 1) % bannerItems.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  
  const item = bannerItems[index]
  
  return (
    <div style={{
      width: '100%',
      maxWidth: 800,
      margin: '20px auto 0 auto',
      borderRadius: 16,
      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      padding: '20px 24px',
      minHeight: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'inherit',
      transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
      opacity: isAnimating ? 0.8 : 1
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }}></div>
      
      {/* Content */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 24, 
        position: 'relative', 
        zIndex: 1,
        width: '100%'
      }}>
        <div style={{ 
          flex: '0 0 auto',
          transform: isAnimating ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'transform 0.6s ease'
        }}>
          <img 
            src={item.img} 
            alt={item.title} 
            style={{ 
              width: 80, 
              height: 80, 
              objectFit: 'cover', 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.3)'
            }} 
          />
        </div>
        
        <div style={{ 
          textAlign: 'left', 
          flex: 1,
          transform: isAnimating ? 'translateX(-10px)' : 'translateX(0)',
          transition: 'transform 0.6s ease'
        }}>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 900, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8, 
            letterSpacing: 0.8,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {item.title}
          </div>
          <div style={{ 
            fontSize: 14, 
            color: '#4a5568', 
            fontWeight: 600,
            lineHeight: 1.3,
            opacity: 0.9
          }}>
            {item.desc}
          </div>
        </div>
      </div>
      
      {/* Indicators */}
      <div style={{ 
        position: 'absolute', 
        bottom: 12, 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 6,
        zIndex: 2
      }}>
        {bannerItems.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 16 : 6,
              height: 6,
              borderRadius: 3,
              background: i === index ? '#667eea' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => {
              setIsAnimating(true)
              setTimeout(() => {
                setIndex(i)
                setIsAnimating(false)
              }, 300)
            }}
          />
        ))}
      </div>
      
      {/* Counter */}
      <div style={{ 
        position: 'absolute', 
        right: 16, 
        top: 16, 
        fontSize: 12, 
        color: '#667eea', 
        fontWeight: 600,
        background: 'rgba(255,255,255,0.8)',
        padding: '4px 8px',
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        zIndex: 2
      }}>
        {index + 1}/{bannerItems.length}
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default BannerCarousel
