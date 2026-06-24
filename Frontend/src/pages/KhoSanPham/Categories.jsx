import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import './KhoSanPham.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    maLoai: '',
    tenLoai: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/v1/danh-muc/loai-san-pham', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (isEdit) {
        await axios.put('http://localhost:8080/api/v1/danh-muc/loai-san-pham', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật danh mục thành công!');
      } else {
        await axios.post('http://localhost:8080/api/v1/danh-muc/loai-san-pham', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Thêm danh mục thành công!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert('Lỗi: ' + err.response?.data);
    }
  };

  const handleShow = (cat = null) => {
    if (cat) {
      setIsEdit(true);
      setFormData({ maLoai: cat.maLoai, tenLoai: cat.tenLoai });
    } else {
      setIsEdit(false);
      setFormData({ maLoai: '', tenLoai: '' });
    }
    setShowModal(true);
  };

  const handleDelete = async (maLoai) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/danh-muc/loai-san-pham/${maLoai}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      alert('Lỗi xóa danh mục: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="kho-san-pham-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Danh mục Sản phẩm</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => handleShow()}>
          <Plus size={18} /> Thêm Danh Mục
        </button>
      </div>

      <div className="card">
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Mã Danh Mục</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Tên Danh Mục</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500, color: '#0f172a' }}>{cat.maLoai}</td>
                <td style={{ padding: '16px 24px', color: '#334155' }}>{cat.tenLoai}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3" onClick={() => handleShow(cat)}><i className="bi bi-pencil"></i> Sửa</button>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(cat.maLoai)}><i className="bi bi-trash"></i> Xóa</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <i className="bi bi-inbox fs-1 mb-2 d-block"></i>
                  Không có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="mb-4">{isEdit ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Mã Loại</label>
                <input type="text" className="form-control" name="maLoai" value={formData.maLoai} onChange={handleChange} required disabled={isEdit} />
              </div>
              <div className="mb-3">
                <label className="form-label">Tên Loại</label>
                <input type="text" className="form-control" name="tenLoai" value={formData.tenLoai} onChange={handleChange} required />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
