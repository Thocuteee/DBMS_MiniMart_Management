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
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    sales: false,
    inventory: false,
    hr: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">MiniMart</h2>
      </div>
      
      <div className="sidebar-menu">
        <p className="menu-label">MENU</p>
        
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Sales Menu */}
          <li className="nav-item">
            <div className={`nav-link ${openMenus.sales ? 'open' : ''}`} onClick={() => toggleMenu('sales')}>
              <ShoppingCart size={18} />
              <span>Quản lý Bán hàng</span>
              {openMenus.sales ? <ChevronDown size={16} className="ms-auto" /> : <ChevronRight size={16} className="ms-auto" />}
            </div>
            {openMenus.sales && (
              <ul className="sub-menu">
                <li><NavLink to="/orders">Đơn hàng (Hóa Đơn)</NavLink></li>
                <li><NavLink to="/customers">Khách hàng</NavLink></li>
              </ul>
            )}
          </li>

          {/* Inventory Menu */}
          <li className="nav-item">
            <div className={`nav-link ${openMenus.inventory ? 'open' : ''}`} onClick={() => toggleMenu('inventory')}>
              <Package size={18} />
              <span>Kho & Sản phẩm</span>
              {openMenus.inventory ? <ChevronDown size={16} className="ms-auto" /> : <ChevronRight size={16} className="ms-auto" />}
            </div>
            {openMenus.inventory && (
              <ul className="sub-menu">
                <li><NavLink to="/products">Sản phẩm</NavLink></li>
                <li><NavLink to="/categories">Danh mục</NavLink></li>
                <li><NavLink to="/imports">Nhập kho (Phiếu Nhập)</NavLink></li>
                <li><NavLink to="/warehouse">Tồn kho</NavLink></li>
                <li><NavLink to="/suppliers">Nhà cung cấp</NavLink></li>
              </ul>
            )}
          </li>

          {/* HR Menu */}
          <li className="nav-item">
            <div className={`nav-link ${openMenus.hr ? 'open' : ''}`} onClick={() => toggleMenu('hr')}>
              <Users size={18} />
              <span>Quản lý Nhân sự</span>
              {openMenus.hr ? <ChevronDown size={16} className="ms-auto" /> : <ChevronRight size={16} className="ms-auto" />}
            </div>
            {openMenus.hr && (
              <ul className="sub-menu">
                <li><NavLink to="/employees">Nhân viên</NavLink></li>
              </ul>
            )}
          </li>

        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
