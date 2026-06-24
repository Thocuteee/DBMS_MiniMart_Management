import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import './KhoSanPham.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    maSP: '',
    tenSP: '',
    maLoai: '',
    maVach: '',
    donVi: 'Cái',
    giaBan: 0,
    hinhAnh: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [resProducts, resCategories] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/san-pham', { headers }),
        axios.get('http://localhost:8080/api/v1/danh-muc/loai-san-pham', { headers })
      ]);
      
      setProducts(resProducts.data);
      setCategories(resCategories.data);
      if (resCategories.data.length > 0) {
        setFormData(prev => ({ ...prev, maLoai: resCategories.data[0].maLoai }));
      }
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
      const headers = { Authorization: `Bearer ${token}` };
      
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/v1/san-pham`, formData, { headers });
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await axios.post('http://localhost:8080/api/v1/san-pham', formData, { headers });
        alert('Thêm sản phẩm thành công!');
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + err.response?.data);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (maSP) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/san-pham/${maSP}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Xóa sản phẩm thành công!');
      fetchData();
    } catch (err) {
      alert('Lỗi xóa sản phẩm: ' + err.response?.data);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      maSP: '',
      tenSP: '',
      maLoai: categories.length > 0 ? categories[0].maLoai : '',
      maVach: '',
      donVi: 'Cái',
      giaBan: 0,
      hinhAnh: ''
    });
    setShowModal(true);
  };

  const getCategoryName = (maLoai) => {
    const cat = categories.find(c => c.maLoai === maLoai);
    return cat ? cat.tenLoai : maLoai;
  };

  return (
    <div className="kho-san-pham-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Sản phẩm</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAddModal}>
          <Plus size={18} /> Thêm Sản Phẩm
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã SP</th>
                <th>Mã Vạch</th>
                <th>Tên Sản Phẩm</th>
                <th>Danh mục</th>
                <th>Đơn vị</th>
                <th className="text-end">Giá Bán</th>
                <th className="text-center">Hình Ảnh</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={index}>
                  <td className="fw-medium">{p.maSP}</td>
                  <td>{p.maVach}</td>
                  <td>{p.tenSP}</td>
                  <td>{getCategoryName(p.maLoai)}</td>
                  <td>{p.donVi}</td>
                  <td className="text-end fw-bold text-success">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.giaBan)}
                  </td>
                  <td className="text-center">
                    {p.hinhAnh ? (
                      <img src={p.hinhAnh} alt={p.tenSP} style={{width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px', background: '#f8f9fa', padding: '2px'}} />
                    ) : (
                      <span className="text-muted small">Trống</span>
                    )}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(p)}><Edit2 size={14}/></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.maSP)}><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Chưa có sản phẩm nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <h3 className="mb-4">{isEditing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mã Sản Phẩm</label>
                  <input type="text" className="form-control" name="maSP" value={formData.maSP} onChange={handleChange} required disabled={isEditing} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mã Vạch (Barcode)</label>
                  <input type="text" className="form-control" name="maVach" value={formData.maVach} onChange={handleChange} required />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Tên Sản Phẩm</label>
                  <input type="text" className="form-control" name="tenSP" value={formData.tenSP} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" name="maLoai" value={formData.maLoai} onChange={handleChange} required>
                    {categories.map(c => (
                      <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Đơn vị tính</label>
                  <input type="text" className="form-control" name="donVi" value={formData.donVi} onChange={handleChange} required />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Giá Bán (VNĐ)</label>
                  <input type="number" className="form-control" name="giaBan" value={formData.giaBan} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Link Hình Ảnh (URL)</label>
                  <input type="text" className="form-control" name="hinhAnh" value={formData.hinhAnh} onChange={handleChange} placeholder="https://..." />
                </div>
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

export default Products;
