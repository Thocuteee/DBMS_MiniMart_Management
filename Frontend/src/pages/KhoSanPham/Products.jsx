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
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', width: '80px', textAlign: 'center' }}>Ảnh</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Mã SP</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Tên Sản Phẩm</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Danh Mục</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Giá Bán</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569' }}>Đơn Vị</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                  {p.hinhAnh ? (
                    <img src={p.hinhAnh} alt={p.tenSP} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <span className="text-muted" style={{fontSize: '10px'}}>N/A</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 500, color: '#0f172a' }}>{p.maSP}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155' }}>{p.tenSP}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{getCategoryName(p.maLoai)}</span>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#10b981' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.giaBan)}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{p.donVi}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3" onClick={() => handleEdit(p)}><Edit2 size={14}/></button>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(p.maSP)}><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  Chưa có sản phẩm nào
                </td>
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
