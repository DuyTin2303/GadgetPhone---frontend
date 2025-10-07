import React, { useEffect } from 'react'

function Snowfall() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.className = 'snow-canvas'
    canvas.style.position = 'fixed'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '0'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight
    let animationId
    canvas.width = width
    canvas.height = height

    const snowflakes = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 2.5,
      d: 1 + Math.random() * 1.5,
      opacity: 0.6 + Math.random() * 0.4
    }))

    function draw() {
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.globalAlpha = 0.8
      snowflakes.forEach(flake => {
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.r, 0, 2 * Math.PI)
        ctx.fillStyle = '#fff'
        ctx.globalAlpha = flake.opacity
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 8
        ctx.fill()
      })
      ctx.restore()
      update()
      animationId = requestAnimationFrame(draw)
    }

    function update() {
      snowflakes.forEach(flake => {
        flake.y += flake.d
        flake.x += Math.sin(flake.y / 30) * 0.7
        if (flake.y > height) {
          flake.y = -flake.r
          flake.x = Math.random() * width
        }
      })
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', resize)
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
      document.body.removeChild(canvas)
    }
  }, [])

  return null
}

export default Snowfall
