import React, { useState, useEffect } from 'react';
import { User, Phone, Save, Award } from 'lucide-react';
import './Profile.css';

const API_BASE_URL = 'http://localhost:8080/api/v1/khach-hang';

const Profile = () => {
  const [profile, setProfile] = useState({
    maKH: '',
    userName: '',
    phone: '',
    diemTichLuy: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const phone = localStorage.getItem('username'); // Khách hàng login bằng số điện thoại lưu trong username
      
      const response = await fetch(`${API_BASE_URL}/phone/${phone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Không thể tải thông tin hồ sơ.');
      const data = await response.json();
      setProfile({
        maKH: data.maKH || '',
        userName: data.userName || '',
        phone: data.phone || '',
        diemTichLuy: data.diemTichLuy || 0
      });
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/sua`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Cập nhật thất bại');
      }

      setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' });
      // Update local storage if they changed their phone (which acts as username)
      if (profile.phone) {
        localStorage.setItem('username', profile.phone);
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-container"><p>Đang tải thông tin cá nhân...</p></div>;
  }

  return (
    <div className="page-container profile-page">
      <div className="mb-4">
        <h4 className="page-title">Hồ Sơ Cá Nhân</h4>
        <p className="text-muted mb-0">Quản lý và cập nhật thông tin của bạn.</p>
      </div>

      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              {message.text && (
                <div className={`alert alert-${message.type} mb-4`}>
                  {message.text}
                </div>
              )}

              <div className="profile-header text-center mb-5">
                <div className="profile-avatar mb-3 mx-auto d-flex justify-content-center align-items-center bg-primary-light text-primary rounded-circle" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {profile.userName.charAt(0).toUpperCase()}
                </div>
                <h5>{profile.userName}</h5>
                <p className="text-muted mb-0"><Award size={16} className="text-warning me-1" /> Điểm tích lũy: <strong>{profile.diemTichLuy}</strong></p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Mã Khách Hàng</label>
                  <input type="text" className="form-control bg-light" value={profile.maKH} disabled />
                  <small className="text-muted mt-1 d-block">Mã khách hàng không thể tự thay đổi.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Họ và Tên</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><User size={18} className="text-muted" /></span>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="userName" 
                      value={profile.userName} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Số Điện Thoại (Tài khoản đăng nhập)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Phone size={18} className="text-muted" /></span>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="phone" 
                      value={profile.phone} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg d-flex justify-content-center align-items-center gap-2" disabled={saving}>
                    <Save size={20} />
                    {saving ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
