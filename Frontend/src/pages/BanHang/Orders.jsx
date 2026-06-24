import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/ban-hang/lich-su', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch sử hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleTimeString('vi-VN')} ${d.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0"><i className="bi bi-receipt me-2"></i>Lịch sử Hóa Đơn</h2>
          <button className="btn btn-outline-primary rounded-pill px-4" onClick={fetchOrders}>
            <i className="bi bi-arrow-clockwise me-2"></i>Làm mới
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{ borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Mã Hóa Đơn</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Ngày Bán</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Thu Ngân</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Khách Hàng</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Tổng Tiền</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    Chưa có hóa đơn nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.maHD} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{order.maHD}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{formatDate(order.ngayLap)}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>{order.tenNhanVien || '-'}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>{order.tenKhachHang || 'Khách vãng lai'}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(order.thanhTien)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button 
                        className="btn btn-sm btn-outline-info rounded-pill px-3"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        {order.chiTietList ? order.chiTietList.length : 0} SP
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedOrder(null)}></div>
          
          <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', zIndex: 10000 }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div>
                <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>Chi Tiết Hóa Đơn</h4>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Mã: {selectedOrder.maHD}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', lineHeight: 1, color: '#64748b', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Sản phẩm</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Số lượng</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Đơn giá</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.chiTietList?.map((ct, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{ct.tenSP || ct.maSP}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{ct.soLuong}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{formatCurrency(ct.donGiaBan)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatCurrency(ct.thanhTien)}</td>
                    </tr>
                  ))}
                  {(!selectedOrder.chiTietList || selectedOrder.chiTietList.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>Không có chi tiết.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <div style={{ width: '250px' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: '#64748b' }}>Tổng tiền:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.tongTien)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: '#64748b' }}>Giảm giá:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.giamGia || 0)}</span>
                </div>
                <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>Thanh toán:</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(selectedOrder.thanhTien)}</span>
                </div>
              </div>
            </div>

            <div className="text-end mt-4 pt-3 border-top">
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
