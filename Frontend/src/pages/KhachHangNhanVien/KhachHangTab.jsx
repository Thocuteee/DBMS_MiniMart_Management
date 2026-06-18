import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1/khach-hang';

const KhachHangTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rolesString = localStorage.getItem('roles');
  const roles = rolesString ? JSON.parse(rolesString) : [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isNhanVien = roles.includes('ROLE_NHAN_VIEN');

  // Form State
  const [formData, setFormData] = useState({
    maKH: '',
    userName: '',
    phone: '',
    diemTichLuy: 0
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Không thể tải dữ liệu Khách hàng');
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const nameMatch = c.userName ? c.userName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const phoneMatch = c.phone ? c.phone.includes(searchTerm) : false;
    return nameMatch || phoneMatch;
  });

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        maKH: customer.maKH || '',
        userName: customer.userName || '',
        phone: customer.phone || '',
        diemTichLuy: customer.diemTichLuy || 0
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        maKH: '', // Backend should generate or allow input
        userName: '',
        phone: '',
        diemTichLuy: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'diemTichLuy' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingCustomer ? `${API_BASE_URL}/sua` : `${API_BASE_URL}/dang-ky`;
    const method = editingCustomer ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Lỗi khi lưu dữ liệu');
      }
      
      alert(editingCustomer ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      handleCloseModal();
      fetchCustomers(); // Refresh the list
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (maKH) => {
    if (!window.confirm(`Bạn có chắc muốn xóa Khách hàng ${maKH} không?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${maKH}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Lỗi khi xóa dữ liệu');
      }
      
      alert('Xóa khách hàng thành công!');
      fetchCustomers();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="tab-content">
      <div className="toolbar">
        <div className="search-box small">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc SĐT..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light d-flex align-items-center gap-2" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Tải lại
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Thêm Khách Hàng
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 p-3 bg-danger-light text-danger rounded">{error}</div>}

      <div className="card table-responsive p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Tên Khách Hàng</th>
              <th>Số Điện Thoại</th>
              <th>Điểm Tích Lũy</th>
              <th className="text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => (
                <tr key={c.maKH}>
                  <td><strong>{c.maKH}</strong></td>
                  <td>{c.userName}</td>
                  <td>{c.phone}</td>
                  <td><span className="badge bg-success-light text-success">{c.diemTichLuy} đ</span></td>
                  <td>
                    <div className="action-btns justify-content-end">
                      <button className="btn-icon edit" onClick={() => handleOpenModal(c)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(c.maKH)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">Không tìm thấy khách hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Mock */}
      <div className="pagination">
        <button className="page-btn">1</button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{editingCustomer ? 'Sửa thông tin Khách Hàng' : 'Thêm Khách Hàng mới'}</h4>
              <button type="button" className="modal-close btn-icon" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Mã KH is auto-generated by Backend, hidden from UI */}
                <div className="form-group">
                  <label className="form-label">Tên Khách Hàng</label>
                  <input type="text" className="form-control" name="userName" value={formData.userName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số Điện Thoại</label>
                  <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                {isAdmin && (
                  <div className="form-group mb-0">
                    <label className="form-label">Điểm Tích Lũy</label>
                    <input type="number" className="form-control" name="diemTichLuy" value={formData.diemTichLuy} onChange={handleChange} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhachHangTab;
