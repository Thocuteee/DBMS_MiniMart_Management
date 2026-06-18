import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShoppingCart, Users, Phone } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [loginType, setLoginType] = useState('staff'); // 'staff' or 'customer'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // If customer login, backend expects password to be the same as phone
    const submitPassword = loginType === 'customer' ? username : password;

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: submitPassword }),
      });

      if (!response.ok) {
        throw new Error(loginType === 'customer' ? 'Không tìm thấy khách hàng với Số điện thoại này!' : 'Sai tài khoản hoặc mật khẩu!');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('roles', JSON.stringify(data.roles));

      navigate('/');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        {/* Left Side: Brand Image */}
        <div className="login-brand">
          <div className="brand-overlay">
            <div className="brand-logo">
              <ShoppingCart size={48} className="text-white" />
              <div className="leaf-icon">🍃</div>
            </div>
            <h1 className="brand-title">MART<span>MINI</span></h1>
            <p className="brand-subtitle">Quản lý cửa hàng tiện lợi</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-container">
          <div className="login-header text-center">
            <div className="store-icon-wrapper">
              <ShoppingCart size={32} className="text-white" />
            </div>
            <h2>ĐĂNG NHẬP HỆ THỐNG</h2>
            <p>MartMini - Quản lý bán hàng thông minh</p>
          </div>

          <div className="login-type-switch mb-4 d-flex justify-content-center gap-2">
            <button 
              type="button"
              className={`btn btn-sm ${loginType === 'staff' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => { setLoginType('staff'); setError(''); setUsername(''); setPassword(''); }}
              style={{borderRadius: '20px', padding: '5px 15px'}}
            >
              Nhân Viên
            </button>
            <button 
              type="button"
              className={`btn btn-sm ${loginType === 'customer' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => { setLoginType('customer'); setError(''); setUsername(''); }}
              style={{borderRadius: '20px', padding: '5px 15px'}}
            >
              Khách Hàng
            </button>
          </div>

          {error && <div className="login-alert">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <div className="input-icon">
                {loginType === 'customer' ? <Phone size={20} /> : <User size={20} />}
              </div>
              <input 
                type="text" 
                placeholder={loginType === 'customer' ? "Nhập Số điện thoại..." : "Tên đăng nhập"} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            {loginType === 'staff' && (
              <div className="input-group">
                <div className="input-icon"><Lock size={20} /></div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            <div className="form-actions">
              <label className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Ghi nhớ đăng nhập
              </label>
              {loginType === 'staff' && (
                <a href="#" className="forgot-password">Quên mật khẩu?</a>
              )}
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
