import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Warehouse = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [error, setError] = useState(null);

  const fetchWarehouse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/ton-kho', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouseData(response.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách tồn kho');
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0"><i className="bi bi-building-gear me-2"></i>Kiểm kê Tồn Kho</h2>
          <button className="btn btn-outline-primary rounded-pill px-4" onClick={fetchWarehouse}>
            <i className="bi bi-arrow-clockwise me-2"></i>Làm mới
          </button>
        </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Khu vực kho</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Sản Phẩm</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Số Lượng Tồn</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {warehouseData.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                <td style={{ padding: '16px 24px', fontWeight: 500, color: '#0f172a' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-box-seam" style={{ color: '#64748b' }}></i>
                    {item.tenKho} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({item.maKho})</span>
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>{item.tenSP}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mã: {item.maSP}</div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600,
                    backgroundColor: item.soLuongTonKho < 10 ? '#fee2e2' : '#dcfce3',
                    color: item.soLuongTonKho < 10 ? '#ef4444' : '#10b981'
                  }}>
                    {item.soLuongTonKho}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  {item.soLuongTonKho < 10 ? (
                    <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <i className="bi bi-exclamation-circle-fill"></i> Sắp hết
                    </span>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <i className="bi bi-check-circle-fill"></i> Ổn định
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {warehouseData.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <i className="bi bi-inbox fs-1 mb-2 d-block"></i>
                  Chưa có dữ liệu tồn kho.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default Warehouse;
