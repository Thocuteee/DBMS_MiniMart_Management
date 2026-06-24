import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Globe, Maximize, User, LogOut, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check dark mode
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    setIsDarkMode(isDark);

    // Get user from localStorage
    const savedUsername = localStorage.getItem('username');
    const savedRoles = localStorage.getItem('roles');
    if (savedUsername) setUsername(savedUsername);
    if (savedRoles) {
      try {
        setRoles(JSON.parse(savedRoles));
      } catch (e) {
        console.error(e);
      }
    }
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

  // Determine display role
  let displayRole = "Thành viên";
  if (roles.includes("ROLE_ADMIN")) displayRole = "Admin";
  else if (roles.includes("ROLE_THU_NGAN")) displayRole = "Thu Ngân";
  else if (roles.includes("ROLE_THU_KHO")) displayRole = "Thủ Kho";
  else if (roles.includes("ROLE_NHAN_VIEN")) displayRole = "Nhân viên";
  else if (roles.includes("ROLE_KHACH_HANG")) displayRole = "Khách hàng";

  return (
    <header className="header">
      <div className="header-left">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn d-none d-sm-flex">
          <Globe size={20} />
        </button>
        <button className="icon-btn d-none d-sm-flex" onClick={toggleFullScreen}>
          <Maximize size={20} />
        </button>
        <button className="icon-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn position-relative">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile position-relative" onClick={() => setShowUserMenu(!showUserMenu)} style={{cursor: 'pointer'}}>
          <img 
            src="https://ui-avatars.com/api/?name=User&background=random" 
            alt="User avatar" 
            className="avatar" 
          />
          <div className="user-info">
            <span className="user-name">{username || 'Guest'}</span>
            <span className="user-role">{displayRole}</span>
          </div>
          <ChevronDown size={16} className="ms-2" />

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <p className="mb-0"><strong>Chào mừng {username}!</strong></p>
              </div>
              <button className="dropdown-item">
                <User size={16} /> Hồ sơ
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
