import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Bell, Moon, Sun, Globe, Maximize, User, LogOut, ChevronDown, Award, Phone } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    roleDisplay: '',
    phone: '',
    points: 0
  });
  const menuRef = useRef(null);
  const notiRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check dark mode
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    setIsDarkMode(isDark);

    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const fallbackUsername = localStorage.getItem('username');
        const rolesString = localStorage.getItem('roles');
        let roles = [];
        try { if(rolesString) roles = JSON.parse(rolesString); } catch(e){}

        let displayRole = "Thành viên";
        if (roles.includes("ROLE_ADMIN")) displayRole = "Admin";
        else if (roles.includes("ROLE_THU_NGAN")) displayRole = "Thu Ngân";
        else if (roles.includes("ROLE_THU_KHO")) displayRole = "Thủ Kho";
        else if (roles.includes("ROLE_NHAN_VIEN")) displayRole = "Nhân viên";
        else if (roles.includes("ROLE_KHACH_HANG")) displayRole = "Khách hàng";

        setProfile(prev => ({...prev, username: fallbackUsername, roleDisplay: displayRole}));

        if (token) {
          const res = await axios.get('http://localhost:8080/api/v1/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(prev => ({
            ...prev,
            fullName: res.data.fullName || fallbackUsername,
            roleDisplay: res.data.roleDisplay || prev.roleDisplay,
            phone: res.data.phone || '',
            points: res.data.points || 0
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();

    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNotiMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    navigate('/login');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="header bg-white border-bottom shadow-sm">
      <div className="header-left">
        <div className="input-group" style={{ width: '300px' }}>
          <span className="input-group-text bg-light border-end-0"><Search size={18} className="text-muted" /></span>
          <input type="text" placeholder="Tìm kiếm..." className="form-control border-start-0 bg-light" />
        </div>
      </div>

      <div className="header-right d-flex align-items-center gap-2">
        <button className="btn btn-light rounded-circle p-2 d-none d-sm-flex align-items-center justify-content-center text-muted hover-shadow" style={{width:'40px', height:'40px'}}>
          <Globe size={18} />
        </button>
        <button className="btn btn-light rounded-circle p-2 d-none d-sm-flex align-items-center justify-content-center text-muted hover-shadow" onClick={toggleFullScreen} style={{width:'40px', height:'40px'}}>
          <Maximize size={18} />
        </button>
        <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-muted hover-shadow" onClick={toggleDarkMode} style={{width:'40px', height:'40px'}}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="position-relative" ref={notiRef}>
          <button 
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-muted position-relative hover-shadow" 
            style={{width:'40px', height:'40px'}}
            onClick={() => setShowNotiMenu(!showNotiMenu)}
          >
            <Bell size={18} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>
          
          {showNotiMenu && (
            <div className="dropdown-menu show shadow-lg border-0 position-absolute end-0 mt-2 p-0" style={{ minWidth: '320px', borderRadius: '12px', animation: 'fadeIn 0.2s ease', zIndex: 1000 }}>
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-light bg-opacity-50" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h6 className="mb-0 fw-bold text-dark">Thông báo</h6>
                <span className="badge bg-primary rounded-pill">2 mới</span>
              </div>
              
              <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {profile.roleDisplay === 'Khách hàng' ? (
                  <>
                    <button className="list-group-item list-group-item-action p-3 border-bottom hover-bg-light">
                      <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                        <strong className="text-primary small">🎉 Ưu đãi mới</strong>
                        <small className="text-muted" style={{fontSize: '11px'}}>Vừa xong</small>
                      </div>
                      <p className="mb-0 text-dark small">Tặng bạn mã giảm giá 15% cho đơn hàng tiếp theo. Đừng bỏ lỡ!</p>
                    </button>
                    <button className="list-group-item list-group-item-action p-3 hover-bg-light">
                      <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                        <strong className="text-success small">📦 Đơn hàng thành công</strong>
                        <small className="text-muted" style={{fontSize: '11px'}}>2 giờ trước</small>
                      </div>
                      <p className="mb-0 text-dark small">Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn!</p>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="list-group-item list-group-item-action p-3 border-bottom hover-bg-light">
                      <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                        <strong className="text-danger small">⚠️ Cảnh báo tồn kho</strong>
                        <small className="text-muted" style={{fontSize: '11px'}}>10 phút trước</small>
                      </div>
                      <p className="mb-0 text-dark small">Sản phẩm sắp hết hàng trong kho. Vui lòng kiểm tra.</p>
                    </button>
                    <button className="list-group-item list-group-item-action p-3 hover-bg-light">
                      <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                        <strong className="text-info small">📝 Báo cáo ngày</strong>
                        <small className="text-muted" style={{fontSize: '11px'}}>Hôm qua</small>
                      </div>
                      <p className="mb-0 text-dark small">Báo cáo doanh thu cuối ngày đã được tổng hợp xong.</p>
                    </button>
                  </>
                )}
              </div>
              
              <div className="p-2 border-top text-center" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <button className="btn btn-link text-decoration-none fw-semibold small py-1 w-100" onClick={() => setShowNotiMenu(false)}>
                  Đánh dấu đã đọc tất cả
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="position-relative ms-3" ref={menuRef}>
          <div 
            className="d-flex align-items-center gap-2 p-1 rounded-pill hover-bg-light transition" 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            style={{cursor: 'pointer', border: '1px solid transparent'}}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e9ebec'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${profile.fullName || 'U'}&background=0d6efd&color=fff&rounded=true&bold=true`} 
              alt="User avatar" 
              className="rounded-circle shadow-sm"
              style={{ width: '38px', height: '38px', objectFit: 'cover' }} 
            />
            <div className="d-none d-md-flex flex-column lh-1 px-1">
              <span className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>{profile.fullName || profile.username}</span>
              <span className="text-muted" style={{ fontSize: '11px', fontWeight: '500' }}>{profile.roleDisplay}</span>
            </div>
            <ChevronDown size={14} className="text-muted me-2 d-none d-md-block" />
          </div>

          {showUserMenu && (
            <div className="dropdown-menu show shadow-lg border-0 position-absolute end-0 mt-2 py-2" style={{ minWidth: '240px', borderRadius: '12px', animation: 'fadeIn 0.2s ease' }}>
              <div className="px-4 py-3 border-bottom mb-2 bg-light bg-opacity-50">
                <p className="mb-0 text-muted small">Xin chào,</p>
                <p className="mb-0 fw-bold fs-6 text-dark text-truncate">{profile.fullName || profile.username}</p>
                {profile.phone && (
                  <p className="mb-0 mt-1 small text-muted d-flex align-items-center gap-1">
                    <Phone size={12} /> {profile.phone}
                  </p>
                )}
                {profile.roleDisplay === 'Khách hàng' && (
                  <span className="badge bg-warning text-dark mt-2 d-flex align-items-center gap-1 w-auto d-inline-block">
                    <Award size={12} /> {profile.points} điểm
                  </span>
                )}
              </div>
              <button 
                className="dropdown-item d-flex align-items-center gap-3 py-2 px-4 text-secondary hover-bg-light"
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                }}
              >
                <User size={16} /> <span className="fw-medium">Hồ sơ cá nhân</span>
              </button>
              <div className="dropdown-divider my-2"></div>
              <button className="dropdown-item d-flex align-items-center gap-3 py-2 px-4 text-danger hover-bg-danger hover-text-white transition" onClick={handleLogout}>
                <LogOut size={16} /> <span className="fw-bold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
