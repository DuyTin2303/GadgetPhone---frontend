import React, { useState, useEffect } from 'react'

// Toast notification component
const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        if (onClose) onClose()
      }, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      padding: '16px 24px',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease',
      maxWidth: '400px',
      wordWrap: 'break-word',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        }
      case 'error':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        }
      case 'warning':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }
      case 'info':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        }
      default:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div style={getToastStyles()}>
      <span style={{ fontSize: '20px' }}>{getIcon()}</span>
      <span>{message}</span>
    </div>
  )
}

// Toast Manager Component
export const ToastManager = ({ toasts, onRemoveToast }) => {
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 10000 }}>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginBottom: '10px' }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (message, duration) => addToast(message, 'success', duration)
  const showError = (message, duration) => addToast(message, 'error', duration)
  const showWarning = (message, duration) => addToast(message, 'warning', duration)
  const showInfo = (message, duration) => addToast(message, 'info', duration)

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

export default Toast
