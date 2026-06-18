import React, { useState, useEffect } from 'react';
import KhachHangTab from './KhachHangTab';
import NhanVienTab from './NhanVienTab';
import './KhachHangNhanVien.css';

const KhachHangNhanVien = ({ defaultTab = 'khachhang' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync state if prop changes (e.g. clicking different links in Sidebar)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="page-container">
      <div>
        <h4 className="page-title">Quản lý Khách Hàng & Nhân Viên</h4>
        <p className="text-muted mb-0">Quản lý danh sách, phân quyền và điểm số.</p>
      </div>

      <div className="card">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'khachhang' ? 'active' : ''}`}
            onClick={() => setActiveTab('khachhang')}
          >
            Danh sách Khách Hàng
          </button>
          <button 
            className={`tab-btn ${activeTab === 'nhanvien' ? 'active' : ''}`}
            onClick={() => setActiveTab('nhanvien')}
          >
            Danh sách Nhân Viên
          </button>
        </div>

        {activeTab === 'khachhang' ? <KhachHangTab /> : <NhanVienTab />}
      </div>
    </div>
  );
};

export default KhachHangNhanVien;
