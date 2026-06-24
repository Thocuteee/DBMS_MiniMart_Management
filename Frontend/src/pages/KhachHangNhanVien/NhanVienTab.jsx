import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1/nhan-vien';

const NhanVienTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    maNV: '',
    hoTen: '',
    phone: '',
    role: 'Thu Ngân',
    userName: '',
    password: '',
    status: true
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Không thể tải dữ liệu Nhân viên');
      const data = await response.json();
      setStaff(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(s => {
    const nameMatch = s.hoTen ? s.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const userMatch = s.userName ? s.userName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return nameMatch || userMatch;
  });

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({ ...staffMember, password: '' }); // Don't show real password
    } else {
      setEditingStaff(null);
      setFormData({
        maNV: '', // Backend should generate or allow input
        hoTen: '',
        phone: '',
        role: 'Thu Ngân',
        userName: '',
        password: '',
        status: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'status') {
      finalValue = value === 'true';
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingStaff ? `${API_BASE_URL}/cap-nhat` : API_BASE_URL;
    const method = editingStaff ? 'PUT' : 'POST';
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
      
      alert(editingStaff ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      handleCloseModal();
      fetchStaff(); // Refresh the list
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (maNV) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${maNV} không?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${maNV}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Lỗi khi xóa nhân viên');
      }
      
      alert('Xóa nhân viên thành công!');
      fetchStaff();
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
            placeholder="Tìm theo tên hoặc Username..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light d-flex align-items-center gap-2" onClick={fetchStaff} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Tải lại
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Thêm Nhân Viên
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3 p-3 bg-danger-light text-danger rounded">{error}</div>}

      <div className="card table-responsive p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ Tên</th>
              <th>Số Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Tài Khoản</th>
              <th>Trạng Thái</th>
              <th className="text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td></tr>
            ) : filteredStaff.length > 0 ? (
              filteredStaff.map(s => (
                <tr key={s.maNV}>
                  <td><strong>{s.maNV}</strong></td>
                  <td>{s.hoTen}</td>
                  <td>{s.phone}</td>
                  <td><span className={`badge ${s.role === 'Quản Lý' ? 'bg-primary-light text-primary' : 'bg-info-light text-info'}`}>{s.role}</span></td>
                  <td>{s.userName}</td>
                  <td>
                    <span className={`badge ${s.status === true ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                      {s.status === true ? 'Hoạt động' : 'Nghỉ việc'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns justify-content-end">
                      <button className="btn-icon edit" onClick={() => handleOpenModal(s)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(s.maNV)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">Không tìm thấy nhân viên nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="page-btn">1</button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{editingStaff ? 'Sửa thông tin Nhân Viên' : 'Thêm Nhân Viên mới'}</h4>
              <button type="button" className="modal-close btn-icon" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="modal-body">
                <div className="d-flex gap-3">
                  <div className="form-group flex-1 w-100">
                    <label className="form-label">Vai Trò</label>
                    <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                      <option value="Quản Lý">Quản Lý</option>
                      <option value="Thu Ngân">Thu Ngân</option>
                      <option value="Thủ Kho">Thủ Kho</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Họ Tên</label>
                  <input type="text" className="form-control" name="hoTen" value={formData.hoTen} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số Điện Thoại</label>
                  <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="d-flex gap-3">
                  <div className="form-group flex-1 w-100">
                    <label className="form-label">Tài Khoản (Username)</label>
                    <input type="text" className="form-control" name="userName" value={formData.userName} onChange={handleChange} required />
                  </div>
                  <div className="form-group flex-1 w-100">
                    <label className="form-label">Mật khẩu</label>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder={editingStaff ? "Bỏ trống nếu không đổi" : "Nhập mật khẩu..."} />
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Trạng Thái</label>
                  <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                    <option value="true">Hoạt động</option>
                    <option value="false">Nghỉ việc</option>
                  </select>
                </div>

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

export default NhanVienTab;
