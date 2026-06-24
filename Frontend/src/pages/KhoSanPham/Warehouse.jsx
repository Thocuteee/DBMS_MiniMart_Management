import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertTriangle, Box, Truck, BarChart2, Search, Filter } from 'lucide-react';
import './KhoSanPham.css'; // Reuse existing CSS for container

const Warehouse = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouse = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/ton-kho', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarehouseData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const totalItems = warehouseData.reduce((acc, curr) => acc + curr.soLuongTonKho, 0);
  const totalValueMock = totalItems * 15; // Mock average price
  const spaceUtil = 68; // Mock percentage

  return (
    <div className="kho-san-pham-container">
      
      {/* Top Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Quản lý Tồn Kho</h2>
          <p className="text-muted mb-0 small">Theo dõi và quản lý hàng hóa trong kho</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-light border d-flex align-items-center gap-2 shadow-sm">
            <ArrowDownToLine size={16} /> Nhập kho
          </button>
          <button className="btn btn-light border d-flex align-items-center gap-2 shadow-sm">
            <ArrowUpFromLine size={16} /> Xuất kho
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <RefreshCw size={16} /> Báo cáo
          </button>
        </div>
      </div>

      {/* Middle Section: Metric Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">Tổng giá trị tồn</p>
                  <h3 className="fw-bold mb-0">${totalValueMock.toLocaleString('en-US')}</h3>
                </div>
                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded"><Box size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="text-success fw-bold small">+2.4%</span>
                <span className="text-muted small ms-2">so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">Sắp hết hạn</p>
                  <h3 className="fw-bold mb-0">12 Món</h3>
                </div>
                <div className="p-2 bg-danger bg-opacity-10 text-danger rounded"><AlertTriangle size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="text-danger fw-bold small">Cần xử lý ngay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">Đang giao đến</p>
                  <h3 className="fw-bold mb-0">5 Đơn</h3>
                </div>
                <div className="p-2 bg-warning bg-opacity-10 text-warning rounded"><Truck size={20}/></div>
              </div>
              <div className="mt-3">
                <span className="text-muted fw-medium small">Dự kiến hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted text-uppercase small fw-bold mb-1">Công suất kho</p>
                  <h3 className="fw-bold mb-0">{spaceUtil}%</h3>
                </div>
                <div className="p-2 bg-success bg-opacity-10 text-success rounded"><BarChart2 size={20}/></div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" role="progressbar" style={{ width: `${spaceUtil}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Inventory Tracking Table */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <h5 className="fw-bold mb-0">Chi tiết Tồn kho</h5>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0"><Search size={16} /></span>
              <input type="text" className="form-control border-start-0 ps-0" placeholder="Tìm kiếm SKU..." />
            </div>
            <button className="btn btn-light border text-muted"><Filter size={18} /></button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3">Sản phẩm</th>
                <th className="py-3">Phân loại / Khu vực</th>
                <th className="py-3" style={{width: '200px'}}>Mức tồn kho</th>
                <th className="py-3 text-center">Trạng thái</th>
                <th className="pe-4 py-3 text-end">Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : warehouseData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Không có dữ liệu tồn kho.</td></tr>
              ) : (
                warehouseData.map((item, idx) => {
                  const maxCapacity = 100;
                  const percentage = Math.min((item.soLuongTonKho / maxCapacity) * 100, 100);
                  const isLow = item.soLuongTonKho < 10;
                  const mockDate = new Date();
                  mockDate.setDate(mockDate.getDate() + (idx * 5) - 2);
                  const isExpired = mockDate < new Date();

                  return (
                    <tr key={idx}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted flex-shrink-0" style={{width: '40px', height: '40px'}}>
                            <Package size={20}/>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{item.tenSP}</div>
                            <div className="text-muted small">{item.maSP}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="fw-medium text-dark">Hàng tiêu dùng</div>
                        <div className="text-muted small">Khu vực: {item.tenKho}</div>
                      </td>
                      <td className="py-3">
                        <div className="d-flex justify-content-between align-items-center mb-1 small fw-bold">
                          <span className="text-dark">{item.soLuongTonKho} Cái</span>
                          <span className={isLow ? "text-danger" : "text-primary"}>{Math.round(percentage)}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div className={`progress-bar ${isLow ? 'bg-danger' : 'bg-primary'}`} role="progressbar" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`badge ${isLow ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'} text-uppercase`}>
                          {isLow ? 'Sắp hết' : 'Đầy đủ'}
                        </span>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <span className={`fw-semibold small ${isExpired ? 'text-danger' : 'text-secondary'}`}>
                          {mockDate.toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Warehouse;
