import React, { useState } from 'react'
import './authform.css'

function AuthForm({ onAuth, onShowHomepage, forceShowForm }) {
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [fieldError, setFieldError] = useState({});
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [showLanding, setShowLanding] = useState(forceShowForm ? false : true);

  // Validate helpers
  const validateEmail = email => /^\S+@\S+\.\S+$/.test(email);
  const validatePhone = phone => /^0\d{8,10}$/.test(phone);
  const validateUsername = username => username.length >= 4;
  const validatePassword = password => password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra dữ liệu đầu vào
    if (!username.trim() || !password.trim() || (!isLogin && (!role || !phone.trim() || !email.trim() || !address.trim() || !dob))) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (!validateUsername(username)) return setError('Tên đăng nhập phải từ 4 ký tự trở lên!');
    if (!validatePassword(password)) return setError('Mật khẩu phải từ 6 ký tự trở lên!');

    if (!isLogin) {
      if (!validatePhone(phone)) return setError('Số điện thoại không hợp lệ!');
      if (!validateEmail(email)) return setError('Email không hợp lệ!');
      if (address.length < 5) return setError('Địa chỉ phải từ 5 ký tự trở lên!');
      if (!dob) return setError('Vui lòng chọn ngày sinh!');
    }

    const url = isLogin
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register';

    const body = isLogin
      ? { username, password }
      : { username, password, role, phone, email, address, dob };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(text || 'Lỗi không xác định');
      }

      if (!res.ok) {
        setError(data.error || 'Lỗi không xác định');
        return;
      }

      // Login thành công
      if (isLogin) {
        if (data.token) localStorage.setItem('token', data.token);
        if (onAuth) onAuth(data);
      } else {
        // Sau khi đăng ký -> chuyển sang login
        setIsLogin(true);
        setUsername('');
        setPassword('');
        setPhone('');
        setEmail('');
        setAddress('');
        setDob('');
        setRole('customer');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (showLanding) {
    return (
      <div className="landing-bg">
        <div
          className="landing-center"
          onClick={() => {
            if (typeof onShowHomepage === 'function') onShowHomepage();
            setShowLanding(false);
          }}
        >
          GadgetPhone
        </div>
      </div>
    );
  }

  // Forgot password popup
  if (showForgot) {
    return (
      <div className="auth-bg-split">
        <div className="auth-split-left">
          <div className="auth-container">
            <h2 className="auth-title">Quên mật khẩu</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setForgotLoading(true)
              setForgotMsg('')
              try {
                const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: forgotEmail })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Gửi mã thất bại')
                setForgotMsg('Đã gửi mã xác thực về email của bạn!')
                setShowReset(true)
              } catch (err) {
                setForgotMsg(err.message)
              } finally {
                setForgotLoading(false)
              }
            }}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                className="auth-input"
              />
              {forgotMsg && (
                <div style={{ 
                  color: forgotMsg.includes('Đã gửi') ? 'green' : 'red', 
                  marginBottom: 10, 
                  textAlign: 'center',
                  fontSize: 14
                }}>
                  {forgotMsg}
                </div>
              )}
              <button type="submit" disabled={forgotLoading} className="auth-btn main-btn">
                {forgotLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
              <button type="button" onClick={() => setShowForgot(false)} className="auth-btn switch-btn">
                Quay lại đăng nhập
              </button>
            </form>
          </div>
        </div>
        <div className="auth-split-right" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="auth-split-message">
            GadgetPhone
            <span className="subtitle">Khôi phục mật khẩu</span>
          </div>
        </div>
      </div>
    )
  }

  // Reset password popup
  if (showReset) {
    return (
      <div className="auth-bg-split">
        <div className="auth-split-left">
          <div className="auth-container">
            <h2 className="auth-title">Đặt lại mật khẩu</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setResetLoading(true)
              setResetMsg('')
              try {
                const res = await fetch('http://localhost:5000/api/auth/reset-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    email: forgotEmail, 
                    code: resetCode, 
                    newPassword: resetPassword 
                  })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Đặt lại mật khẩu thất bại')
                setResetMsg('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.')
                setTimeout(() => {
                  setShowReset(false)
                  setShowForgot(false)
                  setResetCode('')
                  setResetPassword('')
                  setForgotEmail('')
                }, 2000)
              } catch (err) {
                setResetMsg(err.message)
              } finally {
                setResetLoading(false)
              }
            }}>
              <input
                type="text"
                placeholder="Mã xác thực (6 chữ số)"
                value={resetCode}
                onChange={e => setResetCode(e.target.value)}
                required
                className="auth-input"
                maxLength={6}
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                required
                className="auth-input"
                minLength={6}
              />
              {resetMsg && (
                <div style={{ 
                  color: resetMsg.includes('thành công') ? 'green' : 'red', 
                  marginBottom: 10, 
                  textAlign: 'center',
                  fontSize: 14
                }}>
                  {resetMsg}
                </div>
              )}
              <button type="submit" disabled={resetLoading} className="auth-btn main-btn">
                {resetLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
              <button type="button" onClick={() => setShowReset(false)} className="auth-btn switch-btn">
                Quay lại
              </button>
            </form>
          </div>
        </div>
        <div className="auth-split-right" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="auth-split-message">
            GadgetPhone
            <span className="subtitle">Tạo mật khẩu mới</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg-split">
      <div className={isLogin ? 'auth-split-left' : 'auth-split-right'}>
        <div className="auth-container">
          <h2 className="auth-title">{isLogin ? 'Login' : 'Register'}</h2>
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            {error && <div style={{ color: 'red', marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
            
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                if (!isLogin) {
                  setFieldError(prev => ({ ...prev, username: validateUsername(e.target.value) ? '' : 'Tên đăng nhập phải từ 4 ký tự trở lên!' }));
                }
              }}
              required
              className="auth-input"
            />
            {!isLogin && fieldError.username && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fieldError.username}</div>}

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (!isLogin) {
                  setFieldError(prev => ({ ...prev, password: validatePassword(e.target.value) ? '' : 'Mật khẩu phải từ 6 ký tự trở lên!' }));
                }
              }}
              required
              className="auth-input"
            />
            {!isLogin && fieldError.password && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fieldError.password}</div>}

            {/* Register thêm field */}
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    setFieldError(prev => ({ ...prev, phone: validatePhone(e.target.value) ? '' : 'Số điện thoại không hợp lệ!' }));
                  }}
                  required
                  className="auth-input"
                />
                {fieldError.phone && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fieldError.phone}</div>}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setFieldError(prev => ({ ...prev, email: validateEmail(e.target.value) ? '' : 'Email không hợp lệ!' }));
                  }}
                  required
                  className="auth-input"
                />
                {fieldError.email && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fieldError.email}</div>}

                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={e => {
                    const val = e.target.value;
                    setAddress(val);
                    setFieldError(prev => ({ ...prev, address: val.length >= 5 ? '' : 'Địa chỉ phải từ 5 ký tự trở lên!' }));
                  }}
                  required
                  className="auth-input"
                />
                {fieldError.address && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fieldError.address}</div>}

                <input
                  type="date"
                  placeholder="Ngày sinh"
                  value={dob}
                  onChange={e => {
                    const val = e.target.value;
                    setDob(val);
                    setFieldError(prev => ({ ...prev, dob: val ? '' : 'Vui lòng chọn ngày sinh!' }));
                  }}
                  required
                  className="auth-input"
                  style={{ color: dob ? '#222' : '#888' }}
                />
                {fieldError.dob && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{fieldError.dob}</div>}

                <select value={role} onChange={e => setRole(e.target.value)} className="auth-input" required>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            <button type="submit" className="auth-btn main-btn">
              {isLogin ? 'Login' : 'Register'}
            </button>

            {isLogin && (
              <div style={{ width: '100%', textAlign: 'center', marginTop: 10 }}>
                <button
                  type="button"
                  className="auth-btn switch-btn"
                  style={{ color: '#1976d2', textDecoration: 'underline', background: 'none', border: 'none', fontSize: 15 }}
                  onClick={() => setShowForgot(true)}
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}
          </form>

          {/* Google Login */}
          <div style={{ width: '100%', textAlign: 'center', marginTop: 28 }}>
            <button
              type="button"
              className="google-login-btn"
              style={{
                background: '#fff',
                color: '#444',
                border: '1.5px solid #e0e0e0',
                borderRadius: 8,
                padding: '10px 0',
                width: '100%',
                fontWeight: 600,
                fontSize: 17,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 2px 8px 0 rgba(60,60,60,0.07)',
                cursor: 'pointer',
                margin: '0 auto',
                maxWidth: 340
              }}
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 22, height: 22, marginRight: 8 }} />
              Đăng nhập bằng Google
            </button>
          </div>

          {/* Toggle login/register */}
          <div style={{ width: '100%', textAlign: 'center', marginTop: 18 }}>
            <button
              type="button"
              className="auth-btn switch-btn"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ color: '#1976d2', textDecoration: 'underline', background: 'none', border: 'none', fontSize: 15 }}
            >
              {isLogin ? 'Bạn chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>

      <div className={isLogin ? 'auth-split-right' : 'auth-split-left'} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="auth-split-message">
          GadgetPhone
          <span className="subtitle">Welcome to GadgetPhone!</span>
        </div>
      </div>
    </div>
  );
}

export default AuthForm
