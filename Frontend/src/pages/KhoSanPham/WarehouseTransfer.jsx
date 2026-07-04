import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowRightLeft, RefreshCw, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
import './KhoSanPham.css'; // Reuse existing styles

const WarehouseTransfer = () => {
  const [products, setProducts] = useState([]);
  const [tonKhoList, setTonKhoList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sourceWarehouse, setSourceWarehouse] = useState('K01');
  const [destinationWarehouse, setDestinationWarehouse] = useState('K02');
  const [quantity, setQuantity] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get products
      const prodRes = await axios.get('http://localhost:8080/api/v1/san-pham', { headers });
      setProducts(prodRes.data);

      // Get current inventory levels
      const tonKhoRes = await axios.get('http://localhost:8080/api/v1/ton-kho', { headers });
      setTonKhoList(tonKhoRes.data);

      if (prodRes.data.length > 0) {
        setSelectedProduct(prodRes.data[0].maSP);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu sản phẩm hoặc tồn kho.");
    } finally {
      setLoading(false);
    }
  };

  const getSourceStock = () => {
    const item = tonKhoList.find(tk => tk.maSP === selectedProduct && tk.maKho === sourceWarehouse);
    return item ? item.soLuongTonKho : 0;
  };

  const getDestinationStock = () => {
    const item = tonKhoList.find(tk => tk.maSP === selectedProduct && tk.maKho === destinationWarehouse);
    return item ? item.soLuongTonKho : 0;
  };

  const handleSourceChange = (val) => {
    setSourceWarehouse(val);
    setDestinationWarehouse(val === 'K01' ? 'K02' : 'K01');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.warning("Vui lòng chọn sản phẩm.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.warning("Số lượng điều chuyển phải lớn hơn 0.");
      return;
    }

    const currentSourceStock = getSourceStock();
    if (Number(quantity) > currentSourceStock) {
      toast.warning(`Số lượng điều chuyển (${quantity}) vượt quá tồn kho hiện tại ở nguồn (${currentSourceStock}).`);
      return;
    }

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/v1/ton-kho/dieu-chuyen', {
        maSP: selectedProduct,
        soLuongChuyen: Number(quantity),
        maKhoNguon: sourceWarehouse,
        maKhoDich: destinationWarehouse
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        toast.success(`[Thành công] ${response.data.message}`);
        setQuantity('');
        await fetchData(); // Refresh data to show updated quantities
      } else {
        toast.error(response.data.message || "Điều chuyển kho thất bại.");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Lỗi kết nối hoặc hệ thống!";
      toast.error(errMsg, { autoClose: 10000 }); // Keep error open longer so they can read the deadlock message
    } finally {
      setSubmitLoading(false);
    }
  };

  const currentProduct = products.find(p => p.maSP === selectedProduct);

  return (
    <div className="kho-san-pham-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Điều Chuyển Kho Nội Bộ</h2>
          <p className="text-muted mb-0 small">Điều chuyển hàng hóa giữa Kho tổng và Quầy trưng bày POS</p>
        </div>
        <button className="btn btn-light border d-flex align-items-center gap-2" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải lại dữ liệu
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Main Transfer Form Card */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                  <ArrowRightLeft size={20} /> Tạo Lệnh Điều Chuyển
                </h5>

                <form onSubmit={handleTransfer}>
                  {/* Product Selection */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">1. Chọn sản phẩm</label>
                    <select 
                      className="form-select border shadow-sm" 
                      value={selectedProduct} 
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      {products.map(p => (
                        <option key={p.maSP} value={p.maSP}>
                          {p.tenSP} ({p.maSP})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warehouses Flow */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-5">
                      <label className="form-label text-muted small fw-bold">2. Kho nguồn (Xuất)</label>
                      <select 
                        className="form-select border shadow-sm" 
                        value={sourceWarehouse} 
                        onChange={(e) => handleSourceChange(e.target.value)}
                      >
                        <option value="K01">Kho tổng siêu thị (K01)</option>
                        <option value="K02">Quầy trưng bày POS (K02)</option>
                      </select>
                    </div>

                    <div className="col-md-2 d-flex align-items-end justify-content-center pb-2">
                      <div className="bg-light p-2 rounded-circle border shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <ArrowRightLeft size={16} className="text-muted" />
                      </div>
                    </div>

                    <div className="col-md-5">
                      <label className="form-label text-muted small fw-bold">3. Kho đích (Nhập)</label>
                      <select 
                        className="form-select border shadow-sm" 
                        value={destinationWarehouse}
                        disabled
                      >
                        <option value="K01">Kho tổng siêu thị (K01)</option>
                        <option value="K02">Quầy trưng bày POS (K02)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">4. Số lượng chuyển</label>
                    <input 
                      type="number" 
                      className="form-control border shadow-sm" 
                      placeholder="Nhập số lượng..."
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  {/* Action Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 fw-semibold shadow d-flex align-items-center justify-content-center gap-2"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                        Đang thực thi giao dịch...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft size={18} /> Xác Nhận Điều Chuyển
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Current Stock Preview Card */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', backgroundColor: '#fafbfe' }}>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-secondary">
                    <Inbox size={20} /> Trạng Thái Tồn Kho Hiện Tại
                  </h5>

                  {currentProduct ? (
                    <div className="mb-4">
                      <div className="bg-white p-3 rounded border mb-4 shadow-sm">
                        <div className="text-muted small fw-bold">SẢN PHẨM ĐANG CHỌN</div>
                        <h5 className="fw-bold text-dark mb-1 mt-1">{currentProduct.tenSP}</h5>
                        <span className="badge bg-secondary">{currentProduct.maSP}</span>
                      </div>

                      <div className="row g-3">
                        {/* Source Stock */}
                        <div className="col-6">
                          <div className="bg-white p-3 rounded border text-center shadow-sm">
                            <div className="text-muted small fw-semibold">KHO NGUỒN ({sourceWarehouse})</div>
                            <h2 className="fw-bold text-danger mt-2 mb-1">{getSourceStock()}</h2>
                            <span className="small text-muted">Cái có sẵn</span>
                          </div>
                        </div>

                        {/* Destination Stock */}
                        <div className="col-6">
                          <div className="bg-white p-3 rounded border text-center shadow-sm">
                            <div className="text-muted small fw-semibold">KHO ĐÍCH ({destinationWarehouse})</div>
                            <h2 className="fw-bold text-success mt-2 mb-1">{getDestinationStock()}</h2>
                            <span className="small text-muted">Cái hiện có</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">Vui lòng chọn sản phẩm để xem tồn kho.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseTransfer;
