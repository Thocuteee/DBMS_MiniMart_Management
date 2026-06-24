import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import './KhoSanPham.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
      await axios.post('http://localhost:8080/api/v1/danh-muc/loai-san-pham', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Thêm danh mục thành công!');
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert('Lỗi: ' + err.response?.data);
    }
  };

  return (
    <div className="kho-san-pham-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Danh mục Sản phẩm</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Thêm Danh Mục
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã Loại</th>
                <th>Tên Loại</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={index}>
                  <td className="fw-medium">{cat.maLoai}</td>
                  <td>{cat.tenLoai}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2"><Edit2 size={14}/></button>
                    <button className="btn btn-sm btn-outline-danger"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">Chưa có danh mục nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="mb-4">Thêm Danh Mục Mới</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Mã Loại</label>
                <input type="text" className="form-control" name="maLoai" value={formData.maLoai} onChange={handleChange} required />
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
