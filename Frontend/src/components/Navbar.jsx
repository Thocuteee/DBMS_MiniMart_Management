import React from 'react';

function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'pos', name: '🛒 Quầy POS (Thọ)' },
    { id: 'nhap', name: '📦 Nhập Kho (Duy)' },
    { id: 'kho', name: '📊 Đối Soát Kho (Vỹ)' },
    { id: 'hoadon', name: '🧾 Hóa Đơn & Đổi Trả (Toàn)' },
    { id: 'user', name: '👥 Khách Hàng & Nhân Viên (Bảo)' },
  ];

  return (
    <nav style={{ display: 'flex', gap: '15px', padding: '15px', background: '#2c3e50', marginBottom: '20px' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          style={{
            padding: '10px 15px',
            background: currentTab === tab.id ? '#1abc9c' : '#34495e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
}

export default Navbar;