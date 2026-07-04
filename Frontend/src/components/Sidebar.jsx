import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Layers, 
  Truck, 
  Warehouse, 
  FileBox, 
  Briefcase,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  ShoppingBag,
  Menu
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const rolesString = localStorage.getItem('roles');
  const roles = rolesString ? JSON.parse(rolesString) : [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isNhanVien = roles.includes('ROLE_NHAN_VIEN');
  const isThuNgan = roles.includes('ROLE_THU_NGAN') || isNhanVien;
  const isThuKho = roles.includes('ROLE_THU_KHO') || isNhanVien;
  const isKhachHang = roles.includes('ROLE_KHACH_HANG');
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const [openMenus, setOpenMenus] = useState({
    sales: false,
    inventory: false,
    hr: false
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar-collapsed', String(newVal));
      return newVal;
    });
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleParentClick = (menu) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('sidebar-collapsed', 'false');
      setOpenMenus(prev => ({
        ...prev,
        [menu]: true
      }));
    } else {
      toggleMenu(menu);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 className="logo">MiniMart</h2>}
        <button 
          className="collapse-toggle" 
          onClick={toggleCollapse}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          <Menu size={20} />
        </button>
      </div>
      
      <div className="sidebar-menu">
        {!isCollapsed && <p className="menu-label">MENU</p>}
        
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"} 
              end
              title={isCollapsed ? "Dashboard" : ""}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Customer Menu */}
          {isKhachHang && (
            <>
              <li className="nav-item">
                <NavLink 
                  to="/profile" 
                  className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
                  title={isCollapsed ? "Hồ sơ cá nhân" : ""}
                >
                  <UserIcon size={18} />
                  <span>Hồ sơ cá nhân</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/my-orders" 
                  className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
                  title={isCollapsed ? "Đơn hàng của tôi" : ""}
                >
                  <ShoppingBag size={18} />
                  <span>Đơn hàng của tôi</span>
                </NavLink>
              </li>
            </>
          )}

          {/* Admin & Employees Menu */}
          {(isAdmin || isThuNgan || isThuKho) && (
            <>
              {/* Sales Menu */}
              {(isAdmin || isThuNgan) && (
                <li className="nav-item">
                  <div 
                    className={`nav-link ${openMenus.sales ? 'open' : ''}`} 
                    onClick={() => handleParentClick('sales')}
                    title={isCollapsed ? "Quản lý Bán hàng" : ""}
                  >
                    <ShoppingCart size={18} />
                    <span>Quản lý Bán hàng</span>
                    {openMenus.sales ? <ChevronDown size={16} className="ms-auto" /> : <ChevronRight size={16} className="ms-auto" />}
                  </div>
                  {!isCollapsed && openMenus.sales && (
                    <ul className="sub-menu">
                      <li><NavLink to="/pos">Bán hàng (POS)</NavLink></li>
                      <li><NavLink to="/orders">Lịch sử Hóa Đơn</NavLink></li>
                      <li><NavLink to="/customers">Khách hàng</NavLink></li>
                    </ul>
                  )}
                </li>
              )}

              {/* Inventory Menu */}
              {(isAdmin || isThuKho) && (
                <li className="nav-item">
                  <div 
                    className={`nav-link ${openMenus.inventory ? 'open' : ''}`} 
                    onClick={() => handleParentClick('inventory')}
                    title={isCollapsed ? "Kho & Sản phẩm" : ""}
                  >
                    <Package size={18} />
                    <span>Kho & Sản phẩm</span>
                    {openMenus.inventory ? <ChevronDown size={16} className="ms-auto" /> : <ChevronRight size={16} className="ms-auto" />}
                  </div>
                  {!isCollapsed && openMenus.inventory && (
                    <ul className="sub-menu">
                      <li><NavLink to="/products">Sản phẩm</NavLink></li>
                      <li><NavLink to="/categories">Danh mục</NavLink></li>
                      <li><NavLink to="/imports">Nhập kho (Phiếu Nhập)</NavLink></li>
                      <li><NavLink to="/warehouse">Tồn kho</NavLink></li>
                      <li><NavLink to="/suppliers">Nhà cung cấp</NavLink></li>
                    </ul>
                  )}
                </li>
              )}
            </>
          )}

          {/* HR Menu - Only for Admin */}
          {isAdmin && (
            <li className="nav-item">
              <div 
                className={`nav-link ${openMenus.hr ? 'open' : ''}`} 
                onClick={() => handleParentClick('hr')}
                title={isCollapsed ? "Quản lý Nhân sự" : ""}
              >
                <Users size={18} />
                <span>Quản lý Nhân sự</span>
                {openMenus.hr ? <ChevronDown size={16} className="ms-auto" /> : <ChevronRight size={16} className="ms-auto" />}
              </div>
              {!isCollapsed && openMenus.hr && (
                <ul className="sub-menu">
                  <li><NavLink to="/employees">Nhân viên</NavLink></li>
                </ul>
              )}
            </li>
          )}

        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
