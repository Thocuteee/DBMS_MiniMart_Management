import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, Search, Filter, ShoppingBag, TrendingUp, Star, Award, 
  Users, AlertTriangle, FileText, Download, Clock, ShoppingCart 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/v1/dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch admin dashboard", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="container-fluid py-4 bg-body-tertiary" style={{ minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Tổng quan Hệ thống</h4>
          <p className="text-muted mb-0 small">Báo cáo hoạt động kinh doanh hôm nay.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="input-group" style={{ width: '250px' }}>
            <span className="input-group-text bg-body text-muted border-end-0"><Search size={16} /></span>
            <input type="text" placeholder="Tìm kiếm..." className="form-control border-start-0 ps-0" />
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted fw-medium small mb-1">Tổng Doanh Thu</p>
                  <h3 className="fw-bold mb-0">${(data?.totalRevenue || 0).toLocaleString('en-US')}</h3>
                </div>
                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded"><TrendingUp size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="badge bg-success bg-opacity-10 text-success me-2">+12.5%</span>
                <span className="text-muted small">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted fw-medium small mb-1">Đơn hàng hôm nay</p>
                  <h3 className="fw-bold mb-0">{data?.todaysOrders || 0}</h3>
                </div>
                <div className="p-2 bg-info bg-opacity-10 text-info rounded"><ShoppingBag size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="badge bg-success bg-opacity-10 text-success me-2">+5.2%</span>
                <span className="text-muted small">so với hôm qua</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted fw-medium small mb-1">Nhân viên trực</p>
                  <h3 className="fw-bold mb-0">{data?.activeStaff || 0}</h3>
                </div>
                <div className="p-2 bg-success bg-opacity-10 text-success rounded"><Users size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="text-muted small">Đang trong ca làm việc</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted fw-medium small mb-1">Cảnh báo tồn kho</p>
                  <h3 className="fw-bold mb-0">{data?.lowStockAlerts || 0}</h3>
                </div>
                <div className="p-2 bg-danger bg-opacity-10 text-danger rounded"><AlertTriangle size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="badge bg-danger bg-opacity-10 text-danger">Cần xử lý ngay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sales Performance Area Chart */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1">Biểu đồ doanh thu</h5>
                <p className="text-muted small mb-0">Doanh thu trong 12 tháng qua</p>
              </div>
              <select className="form-select form-select-sm w-auto shadow-sm">
                <option>Năm nay</option>
                <option>Năm ngoái</option>
              </select>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #dee2e6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#0d6efd', fontWeight: 'bold' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Doanh thu']}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#0d6efd" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100 p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1">Giao dịch gần đây</h5>
                <p className="text-muted small mb-0">Các đơn hàng thành công mới nhất</p>
              </div>
              <button className="btn btn-sm btn-light text-muted"><Filter size={16}/></button>
            </div>
            
            <div className="flex-grow-1 d-flex flex-column gap-3">
              {data?.recentTransactions?.map((tx, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded hover-bg-light border border-transparent transition">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      {tx.customer.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-body-emphasis small">{tx.customer}</h6>
                      <small className="text-muted" style={{ fontSize: '11px' }}>{new Date(tx.date).toLocaleDateString('vi-VN')}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-body-emphasis small">${tx.amount.toLocaleString('en-US')}</div>
                    <span className="badge bg-success bg-opacity-10 text-success text-uppercase" style={{ fontSize: '10px' }}>Thành công</span>
                  </div>
                </div>
              ))}
              {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                <div className="text-center py-5 text-muted small">Không có giao dịch nào.</div>
              )}
            </div>
            
            <button className="btn btn-outline-primary w-100 mt-4 fw-medium shadow-sm">
              Xem tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const prodRes = await axios.get('http://localhost:8080/api/v1/san-pham', { headers });
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
      }

      try {
        const custRes = await axios.get('http://localhost:8080/api/v1/dashboard/customer', { headers });
        setCustomerData(custRes.data);
      } catch (err) {
        console.error("Lỗi lấy thông tin dashboard khách hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recommendedProducts = products.slice(0, 10);
  const pts = customerData?.rewardPoints || 0;
  const progressToNext = (pts % 1000) / 1000 * 100;

  const handleBuyNow = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username'); // phone
      const headers = { Authorization: `Bearer ${token}` };
      
      // Get maKH
      let maKH = '';
      try {
        const profileRes = await axios.get(`http://localhost:8080/api/v1/profile`, { headers });
        maKH = profileRes.data.maKH;
        if (!maKH) throw new Error("No maKH found");
      } catch (err) {
        console.error("Không tìm thấy mã KH", err);
        alert('Vui lòng cập nhật thông tin hồ sơ trước khi mua hàng!');
        return;
      }
      
      // Create order
      const maHD = 'HD' + Date.now().toString().slice(-6);
      const payload = {
        maHD,
        maKH,
        giamGia: 0,
        chiTietList: [
          {
            maSP: product.maSP,
            soLuong: 1,
            donGiaBan: product.giaBan
          }
        ]
      };
      
      await axios.post('http://localhost:8080/api/v1/ban-hang/thanh-toan', payload, { headers });
      alert('Bạn thêm đơn hàng thành công!');
      navigate('/my-orders');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xử lý đơn hàng!');
    }
  };

  return (
    <div className="container-fluid py-4 bg-body-tertiary" style={{ minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <div className="card shadow-sm border-0 mb-4 p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h3 className="fw-bold text-body-emphasis mb-1">Xin chào, {customerData?.fullName || 'Khách hàng'}! 👋</h3>
            <p className="text-muted mb-0">Chào mừng trở lại. Cùng khám phá các sản phẩm nổi bật hôm nay nhé.</p>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 py-2"
            onClick={() => navigate('/my-orders')}
          >
            <ShoppingCart size={18} /> Xem đơn hàng của tôi
          </button>
        </div>
      </div>

      {/* 3 Grid Cards */}
      <div className="row g-4 mb-5">
        {/* Reward Points */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold text-muted mb-0">Điểm tích lũy</h6>
              <Award className="text-warning" />
            </div>
            <div>
              <h2 className="fw-bold mb-1 text-body-emphasis">{pts.toLocaleString('en-US')} <span className="fs-6 text-muted fw-normal">điểm</span></h2>
              <div className="mt-4">
                <div className="d-flex justify-content-between text-muted small fw-medium mb-2">
                  <span>Hạng {customerData?.membershipTier || 'Đồng'}</span>
                  <span>Hạng tiếp theo</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${progressToNext}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusive Offer */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4 text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}>
            <div className="position-relative z-1">
              <span className="badge bg-white bg-opacity-25 text-uppercase mb-3">Ưu đãi độc quyền</span>
              <h4 className="fw-bold lh-base">GIẢM 15%<br/>Trái cây hữu cơ</h4>
              <button className="btn btn-light btn-sm text-success fw-bold mt-3 shadow-sm px-3">Nhận ngay</button>
            </div>
            <Package className="position-absolute opacity-25" size={160} style={{ right: '-20px', bottom: '-20px' }} />
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold text-muted mb-0">Sản phẩm yêu thích</h6>
              <Star className="text-danger" />
            </div>
            <div className="d-flex flex-column gap-3">
              {products.slice(0, 3).map((p, i) => (
                <div key={i} className="d-flex align-items-center gap-3">
                  <div className="bg-body-secondary border rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                    {p.hinhAnh ? (
                      <img src={p.hinhAnh} alt={p.tenSP} style={{ maxWidth: '30px', maxHeight: '30px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                    ) : null}
                    <Package className="text-muted" size={20} style={{ display: p.hinhAnh ? 'none' : 'block' }} />
                  </div>
                  <div className="flex-grow-1 text-truncate">
                    <p className="fw-semibold text-body-emphasis small mb-0 text-truncate">{p.tenSP}</p>
                    <p className="text-primary fw-bold mb-0" style={{ fontSize: '12px' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.giaBan)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-body-emphasis mb-0">Gợi ý cho bạn</h5>
          <button className="btn btn-link text-decoration-none fw-semibold">Xem tất cả</button>
        </div>
        
        {loading ? (
           <div className="row g-3">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="col-6 col-md-4 col-lg-2">
                 <div className="card shadow-sm border-0 h-100 placeholder-glow">
                   <div className="placeholder bg-light" style={{ height: '140px' }}></div>
                   <div className="card-body p-3">
                     <div className="placeholder col-8 mb-2"></div>
                     <div className="placeholder col-4"></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="row g-3">
            {recommendedProducts.map(product => (
              <div key={product.maSP} className="col-6 col-md-4 col-lg-2">
                <div className="card shadow-sm border-0 h-100 transition hover-shadow" style={{ cursor: 'pointer' }}>
                  <div className="bg-body-secondary d-flex align-items-center justify-content-center border-bottom overflow-hidden" style={{ height: '140px' }}>
                    {product.hinhAnh ? (
                      <img 
                        src={product.hinhAnh} 
                        alt={product.tenSP} 
                        className="img-fluid p-2" 
                        style={{ maxHeight: '100%', objectFit: 'contain' }} 
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
                      />
                    ) : null}
                    <Package className="text-muted" size={48} style={{ display: product.hinhAnh ? 'none' : 'block' }} />
                  </div>
                  <div className="card-body p-3 d-flex flex-column">
                    <div className="flex-grow-1">
                      <h6 className="fw-semibold text-body-emphasis mb-1 text-truncate" title={product.tenSP}>
                        {product.tenSP}
                      </h6>
                      <p className="text-muted small mb-2">{product.donVi}</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <span className="fw-bold text-body-emphasis" style={{ fontSize: '13px' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.giaBan)}
                      </span>
                      <button 
                        className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                        style={{ width: '28px', height: '28px', padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeDashboard = () => (
  <div className="container py-5">
    <div className="bg-primary rounded-4 p-4 p-md-5 text-white shadow mb-5 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #0d6efd, #084298)' }}>
      <div>
        <h2 className="fw-bold mb-2">Cổng thông tin Nhân viên</h2>
        <p className="text-white-50 mb-0">Truy cập công cụ làm việc và quản lý hoạt động hàng ngày.</p>
      </div>
      <div className="d-none d-md-flex bg-white bg-opacity-10 p-3 rounded-3 backdrop-blur">
        <Clock size={40} className="text-white" />
      </div>
    </div>

    <h4 className="fw-bold text-body-emphasis mb-4">Truy cập nhanh</h4>
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card shadow-sm border-0 h-100 p-4 text-center hover-shadow transition" style={{ cursor: 'pointer' }}>
          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '60px', height: '60px' }}>
            <ShoppingCart size={28} />
          </div>
          <h5 className="fw-bold text-body-emphasis mb-2">Bán hàng (POS)</h5>
          <p className="text-muted small mb-0">Xử lý thanh toán cho khách hàng</p>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card shadow-sm border-0 h-100 p-4 text-center hover-shadow transition" style={{ cursor: 'pointer' }}>
          <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '60px', height: '60px' }}>
            <Package size={28} />
          </div>
          <h5 className="fw-bold text-body-emphasis mb-2">Kiểm tra Tồn kho</h5>
          <p className="text-muted small mb-0">Tra cứu số lượng hàng hóa</p>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card shadow-sm border-0 h-100 p-4 text-center hover-shadow transition" style={{ cursor: 'pointer' }}>
          <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '60px', height: '60px' }}>
            <FileText size={28} />
          </div>
          <h5 className="fw-bold text-body-emphasis mb-2">Nhập Hàng hóa</h5>
          <p className="text-muted small mb-0">Ghi nhận hàng mới nhập về kho</p>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const rolesString = localStorage.getItem('roles');
  const roles = rolesString ? JSON.parse(rolesString) : [];
  
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isKhachHang = roles.includes('ROLE_KHACH_HANG');
  const isNhanVien = roles.includes('ROLE_NHAN_VIEN') || roles.includes('ROLE_THU_NGAN') || roles.includes('ROLE_THU_KHO');

  if (isKhachHang) {
    return <CustomerDashboard />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isNhanVien) {
    return <EmployeeDashboard />;
  }

  return <CustomerDashboard />;
};

export default Dashboard;
