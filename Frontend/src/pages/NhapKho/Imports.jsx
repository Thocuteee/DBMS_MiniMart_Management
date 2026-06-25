import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Imports = () => {
  const [imports, setImports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const [error, setError] = useState(null);

  // Dữ liệu phụ trợ để tạo phiếu nhập
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Form tạo phiếu nhập mới
  const [formData, setFormData] = useState({
    maPN: '',
    maNCC: '',
    chiTietList: [] // mảng chứa các sản phẩm nhập
  });

  const [currentSP, setCurrentSP] = useState({
    maSP: '',
    soLuongNhap: 1,
    donGiaNhap: 0,
    hanSuDung: ''
  });

  const fetchImports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/nhap-kho', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImports(response.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách phiếu nhập');
    }
  };

  const fetchHelpers = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resNcc, resSp] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/nha-cung-cap', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:8080/api/v1/san-pham', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSuppliers(resNcc.data);
      setProducts(resSp.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchImports();
    fetchHelpers();
  }, []);

  const handleShow = () => {
    setFormData({ maPN: `PN${Date.now()}`, maNCC: '', chiTietList: [] });
    setCurrentSP({ maSP: '', soLuongNhap: 1, donGiaNhap: 0, hanSuDung: '' });
    setError(null);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const fetchChiTiet = async (pn) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/v1/phieu-nhap/${pn.maPN}/chi-tiet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedImport({ ...pn, chiTietList: response.data });
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải chi tiết phiếu nhập');
    }
  };

  const addProductToImport = () => {
    if (!currentSP.maSP || currentSP.soLuongNhap <= 0 || currentSP.donGiaNhap < 0 || !currentSP.hanSuDung) {
      toast.warning("Vui lòng điền đầy đủ và hợp lệ thông tin sản phẩm nhập (bao gồm Hạn sử dụng)");
      return;
    }
    setFormData({
      ...formData,
      chiTietList: [...formData.chiTietList, { ...currentSP }]
    });
    // Reset currentSP
    setCurrentSP({ maSP: '', soLuongNhap: 1, donGiaNhap: 0, hanSuDung: '' });
  };

  const removeProductFromImport = (index) => {
    const newList = [...formData.chiTietList];
    newList.splice(index, 1);
    setFormData({ ...formData, chiTietList: newList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.maNCC) {
      toast.warning("Vui lòng chọn nhà cung cấp");
      return;
    }
    if (formData.chiTietList.length === 0) {
      toast.warning("Phiếu nhập phải có ít nhất 1 sản phẩm");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/v1/nhap-kho', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchImports();
      handleClose();
      toast.success("Tạo phiếu nhập thành công! Tồn kho đã được tự động cập nhật.");
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tạo phiếu nhập.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0"><i className="bi bi-box-arrow-in-down me-2"></i>Quản lý Phiếu Nhập</h2>
          <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={handleShow}>
            <i className="bi bi-plus-circle me-2"></i>Tạo Phiếu Nhập
          </button>
        </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Mã Phiếu Nhập</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Ngày Lập</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Người Lập (Nhân Viên)</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Nhà Cung Cấp</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Tổng Tiền</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {imports.map(pn => (
              <tr key={pn.maPN} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500, color: '#0f172a' }}>{pn.maPN}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{new Date(pn.ngayNhap).toLocaleString('vi-VN')}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155' }}>{pn.tenNhanVienKho || '-'}</td>
                <td style={{ padding: '16px 24px', color: '#334155' }}>{pn.nameNCC || '-'}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#10b981' }}>{formatCurrency(pn.tongTienNhap)}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button className="btn btn-sm btn-outline-info rounded-pill px-3" onClick={() => fetchChiTiet(pn)}>
                    <i className="bi bi-eye"></i> Xem
                  </button>
                </td>
              </tr>
            ))}
            {imports.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <i className="bi bi-inbox fs-1 mb-2 d-block"></i>
                  Chưa có phiếu nhập nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} onClick={handleClose}></div>
          
          {/* Modal Content */}
          <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '24px', zIndex: 10000 }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>Tạo Phiếu Nhập Kho</h4>
              <button onClick={handleClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', lineHeight: 1, color: '#64748b', cursor: 'pointer' }}>&times;</button>
            </div>

            <div className="mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '8px', display: 'block' }}>Mã Phiếu Nhập</label>
                  <input type="text" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', outline: 'none' }} value={formData.maPN} disabled />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '8px', display: 'block' }}>Nhà Cung Cấp</label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={formData.maNCC} onChange={(e) => setFormData({...formData, maNCC: e.target.value})}>
                    <option value="">-- Chọn Nhà Cung Cấp --</option>
                    {suppliers.map(sup => (
                      <option key={sup.maNCC} value={sup.maNCC}>{sup.nameNCC}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h6 className="fw-bold" style={{ color: '#0f172a', marginBottom: '12px' }}>Thêm Sản phẩm vào Phiếu</h6>
              <div className="row g-2 align-items-end">
                <div className="col-md-4">
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginBottom: '4px', display: 'block' }}>Sản phẩm</label>
                  <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={currentSP.maSP} onChange={(e) => setCurrentSP({...currentSP, maSP: e.target.value})}>
                    <option value="">-- Chọn Sản Phẩm --</option>
                    {products.map(sp => (
                      <option key={sp.maSP} value={sp.maSP}>{sp.tenSP} ({sp.maSP})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginBottom: '4px', display: 'block' }}>Số lượng</label>
                  <input type="number" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={currentSP.soLuongNhap} onChange={(e) => setCurrentSP({...currentSP, soLuongNhap: parseInt(e.target.value)})} min="1" />
                </div>
                <div className="col-md-3">
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginBottom: '4px', display: 'block' }}>Đơn giá (VNĐ)</label>
                  <input type="number" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={currentSP.donGiaNhap} onChange={(e) => setCurrentSP({...currentSP, donGiaNhap: parseFloat(e.target.value)})} min="0" />
                </div>
                <div className="col-md-2">
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginBottom: '4px', display: 'block' }}>Hạn sử dụng</label>
                  <input type="date" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={currentSP.hanSuDung} onChange={(e) => setCurrentSP({...currentSP, hanSuDung: e.target.value})} />
                </div>
                <div className="col-md-1">
                  <button type="button" onClick={addProductToImport} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600 }}>+</button>
                </div>
              </div>
            </div>

            <h6 className="fw-bold" style={{ color: '#0f172a' }}>Danh sách Sản phẩm nhập</h6>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginTop: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Sản phẩm</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Số lượng</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Đơn giá</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Thành tiền</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Hạn SD</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.chiTietList.map((ct, idx) => {
                    const spName = products.find(p => p.maSP === ct.maSP)?.tenSP || ct.maSP;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{spName}</td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>{ct.soLuongNhap}</td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>{formatCurrency(ct.donGiaNhap)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#10b981' }}>{formatCurrency(ct.soLuongNhap * ct.donGiaNhap)}</td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>{ct.hanSuDung}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button onClick={() => removeProductFromImport(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="bi bi-trash"></i></button>
                        </td>
                      </tr>
                    )
                  })}
                  {formData.chiTietList.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có sản phẩm nào được thêm.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
              Tổng tiền: {formatCurrency(formData.chiTietList.reduce((acc, curr) => acc + (curr.soLuongNhap * curr.donGiaNhap), 0))}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
              <button type="button" onClick={handleClose} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#0f172a', fontWeight: 500 }}>Hủy bỏ</button>
              <button type="button" onClick={handleSubmit} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 500 }}>Lưu & Nhập Kho</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedImport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDetailModal(false)}></div>
          
          <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', zIndex: 10000 }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div>
                <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>Chi Tiết Phiếu Nhập</h4>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Mã: {selectedImport.maPN} - Nhà CC: {selectedImport.nameNCC}</div>
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', lineHeight: 1, color: '#64748b', cursor: 'pointer' }}>&times;</button>
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
                  {selectedImport.chiTietList?.map((ct, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{ct.tenSP || ct.maSP}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{ct.soLuongNhap}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{formatCurrency(ct.donGiaNhap)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatCurrency(ct.soLuongNhap * ct.donGiaNhap)}</td>
                    </tr>
                  ))}
                  {(!selectedImport.chiTietList || selectedImport.chiTietList.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>Không có chi tiết.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <div style={{ width: '250px' }}>
                <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>Tổng tiền:</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(selectedImport.tongTienNhap)}</span>
                </div>
              </div>
            </div>

            <div className="text-end mt-4 pt-3 border-top">
              <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowDetailModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Imports;
