import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Calendar, DollarSign, Package, Tag, ArrowRight } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const profileRes = await axios.get('http://localhost:8080/api/v1/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myMaKH = profileRes.data.maKH;
      
      const response = await axios.get('http://localhost:8080/api/v1/hoa-don', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter orders for this customer only
      const myOrders = response.data.filter(o => o.maKH === myMaKH);
      
      // Sort by latest date
      myOrders.sort((a, b) => new Date(b.ngayLap) - new Date(a.ngayLap));
      
      setOrders(myOrders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng.");
      setLoading(false);
    }
  };

  const toggleOrder = (maHD) => {
    if (expandedOrder === maHD) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(maHD);
    }
  };

  if (loading) {
    return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div className="container-fluid py-4 bg-body-tertiary" style={{ minHeight: '100vh' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-body-emphasis d-flex align-items-center gap-2">
          <ShoppingBag className="text-primary" size={28} /> Đơn hàng của tôi
        </h3>
        <p className="text-muted">Lịch sử mua hàng và chi tiết các đơn hàng của bạn.</p>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm border-0 rounded-3">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center">
          <div className="bg-body-secondary rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
            <ShoppingBag size={40} className="text-muted opacity-50" />
          </div>
          <h4 className="fw-bold text-body-emphasis">Bạn chưa có đơn hàng nào</h4>
          <p className="text-muted">Hãy bắt đầu mua sắm để tích điểm và nhận ưu đãi nhé!</p>
          <button className="btn btn-primary px-4 py-2 mt-2 rounded-pill shadow-sm" onClick={() => window.location.href = '/'}>
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map(order => {
            const isExpanded = expandedOrder === order.maHD;
            const orderDate = new Date(order.ngayLap).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
            });

            return (
              <div key={order.maHD} className="col-12">
                <div className={`card shadow-sm border-0 transition ${isExpanded ? 'border-primary' : ''}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  
                  {/* Order Summary Header (Clickable) */}
                  <div 
                    className="card-body p-4 cursor-pointer hover-bg-body-secondary" 
                    onClick={() => toggleOrder(order.maHD)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="row align-items-center">
                      <div className="col-md-3 mb-3 mb-md-0">
                        <div className="text-muted small fw-bold text-uppercase mb-1">Mã Đơn Hàng</div>
                        <div className="fw-bold fs-5 text-body-emphasis">#{order.maHD}</div>
                      </div>
                      
                      <div className="col-md-3 mb-3 mb-md-0">
                        <div className="text-muted small fw-bold text-uppercase mb-1"><Calendar size={14} className="me-1"/> Ngày Mua</div>
                        <div className="fw-medium text-body-emphasis">{orderDate}</div>
                      </div>
                      
                      <div className="col-md-3 mb-3 mb-md-0">
                        <div className="text-muted small fw-bold text-uppercase mb-1"><Package size={14} className="me-1"/> Trạng Thái</div>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold">Hoàn thành</span>
                      </div>
                      
                      <div className="col-md-3 text-md-end">
                        <div className="text-muted small fw-bold text-uppercase mb-1">Tổng Tiền</div>
                        <div className="fw-bold text-primary fs-5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.thanhTien)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="card-footer bg-body border-top p-4">
                      <h6 className="fw-bold mb-3">Chi tiết sản phẩm</h6>
                      
                      <div className="table-responsive mb-4">
                        <table className="table table-borderless align-middle mb-0">
                          <thead className="table-light text-muted small text-uppercase">
                            <tr>
                              <th className="rounded-start">Sản phẩm</th>
                              <th className="text-center">Số lượng</th>
                              <th className="text-end rounded-end">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.chiTietList.map((item, idx) => (
                              <tr key={idx} className="border-bottom border-light">
                                <td className="py-3">
                                  <div className="fw-semibold text-body-emphasis">{item.tenSP}</div>
                                  <div className="text-muted small">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.donGiaBan)}</div>
                                </td>
                                <td className="text-center py-3">x{item.soLuong}</td>
                                <td className="text-end fw-semibold py-3">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.thanhTien)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="row justify-content-end">
                        <div className="col-md-5 col-lg-4">
                          <div className="bg-body-secondary rounded-3 p-3">
                            <div className="d-flex justify-content-between mb-2 small">
                              <span className="text-muted">Cộng tiền hàng:</span>
                              <span className="fw-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongTien)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 small text-success">
                              <span><Tag size={14} className="me-1"/> Giảm giá:</span>
                              <span className="fw-bold">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.giamGia)}</span>
                            </div>
                            <hr className="my-2 opacity-25" />
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-body-emphasis">THÀNH TIỀN:</span>
                              <span className="fs-5 fw-bold text-primary">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.thanhTien)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
