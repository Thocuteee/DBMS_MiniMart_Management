import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    maNCC: '',
    nameNCC: '',
    phone: '',
    address: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/nha-cung-cap', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách nhà cung cấp');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleShow = (supplier = null) => {
    setError(null);
    if (supplier) {
      setFormData(supplier);
      setIsEdit(true);
    } else {
      setFormData({ maNCC: '', nameNCC: '', phone: '', address: '' });
      setIsEdit(false);
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (isEdit) {
        await axios.put('http://localhost:8080/api/v1/nha-cung-cap', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8080/api/v1/nha-cung-cap', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchSuppliers();
      handleClose();
    } catch (err) {
      console.error(err);
      setError('Lỗi khi lưu nhà cung cấp. Kiểm tra lại dữ liệu.');
    }
  };

  const handleDelete = async (maNCC) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/v1/nha-cung-cap/${maNCC}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSuppliers();
      } catch (err) {
        console.error(err);
        alert('Lỗi xóa nhà cung cấp. Đã có phiếu nhập liên kết?');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0"><i className="bi bi-truck me-2"></i>Quản lý Nhà Cung Cấp</h2>
          <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => handleShow()}>
            <i className="bi bi-plus-circle me-2"></i>Thêm Nhà Cung Cấp
          </button>
        </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Mã NCC</th>
              <th>Tên Nhà Cung Cấp</th>
              <th>Số Điện Thoại</th>
              <th>Địa Chỉ</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(sup => (
              <tr key={sup.maNCC}>
                <td>{sup.maNCC}</td>
                <td>{sup.nameNCC}</td>
                <td>{sup.phone}</td>
                <td>{sup.address}</td>
                <td className="text-center">
                  <button className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3" onClick={() => handleShow(sup)}><i className="bi bi-pencil"></i> Sửa</button>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(sup.maNCC)}><i className="bi bi-trash"></i> Xóa</button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">Chưa có nhà cung cấp nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} onClick={handleClose}></div>
          
          {/* Modal Content */}
          <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '24px', zIndex: 10000, animation: 'fadeIn 0.2s ease-out' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>
                {isEdit ? 'Cập nhật' : 'Thêm'} Nhà Cung Cấp
              </h4>
              <button onClick={handleClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', lineHeight: 1, color: '#64748b', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '8px', display: 'block' }}>Mã NCC</label>
                <input type="text" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s' }} name="maNCC" value={formData.maNCC} onChange={handleChange} required disabled={isEdit} />
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '8px', display: 'block' }}>Tên Nhà Cung Cấp</label>
                <input type="text" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} name="nameNCC" value={formData.nameNCC} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '8px', display: 'block' }}>Số Điện Thoại</label>
                <input type="text" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="mb-4">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '8px', display: 'block' }}>Địa Chỉ</label>
                <textarea style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '80px' }} name="address" value={formData.address} onChange={handleChange}></textarea>
              </div>
              
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" onClick={handleClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#0f172a', fontWeight: 500 }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 500 }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
