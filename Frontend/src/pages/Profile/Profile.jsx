import React, { useState, useEffect } from 'react';
import { User, Phone, Award, Shield, CheckCircle, XCircle } from 'lucide-react';
import './Profile.css';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    phone: '',
    roleDisplay: '',
    points: 0,
    status: null
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Chưa đăng nhập");

      const response = await axios.get('http://localhost:8080/api/v1/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setProfile(response.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Không thể tải thông tin hồ sơ. Lỗi mạng hoặc phiên đăng nhập hết hạn.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>;
  }

  return (
    <div className="page-container profile-page">
      <div className="mb-4">
        <h4 className="page-title">Hồ Sơ Cá Nhân</h4>
        <p className="text-muted mb-0">Thông tin tài khoản của bạn trên hệ thống.</p>
      </div>

      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 p-md-5">
              {message.text && (
                <div className={`alert alert-${message.type} mb-4 rounded-3`}>
                  {message.text}
                </div>
              )}

              <div className="profile-header text-center mb-5">
                <div className="profile-avatar mb-3 mx-auto shadow-sm border border-4 border-white" style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                   <img 
                    src={`https://ui-avatars.com/api/?name=${profile.fullName || profile.username || 'U'}&background=0d6efd&color=fff&size=120&font-size=0.4&bold=true`} 
                    alt="Avatar" 
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <h4 className="fw-bold mb-1">{profile.fullName || profile.username}</h4>
                <p className="text-muted mb-3 d-flex align-items-center justify-content-center gap-1">
                  <Shield size={16} className="text-primary" /> 
                  <span className="fw-medium">{profile.roleDisplay}</span>
                </p>
                {profile.roleDisplay === 'Khách hàng' && (
                  <div className="d-inline-flex align-items-center bg-warning bg-opacity-25 text-dark px-4 py-2 rounded-pill border border-warning shadow-sm">
                    <Award size={20} className="me-2 text-warning" /> 
                    <span>Điểm hạng: <strong className="fs-5 ms-1">{profile.points}</strong></span>
                  </div>
                )}
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Tên tài khoản (Đăng nhập)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><User size={18} className="text-muted" /></span>
                    <input type="text" className="form-control bg-light border-0 fw-medium" value={profile.username} disabled />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Họ và Tên / Biệt danh</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><User size={18} className="text-muted" /></span>
                    <input type="text" className="form-control bg-light border-0 fw-medium" value={profile.fullName || 'Chưa cập nhật'} disabled />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Số Điện Thoại</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><Phone size={18} className="text-muted" /></span>
                    <input type="text" className="form-control bg-light border-0 fw-medium" value={profile.phone || 'Chưa cập nhật'} disabled />
                  </div>
                </div>
                
                {profile.roleDisplay !== 'Khách hàng' && (
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Trạng thái nhân sự</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        {(!profile.status || profile.status === 'Hoạt động') ? <CheckCircle size={18} className="text-success" /> : <XCircle size={18} className="text-danger" />}
                      </span>
                      <input type="text" className={`form-control bg-light border-0 ${(!profile.status || profile.status === 'Hoạt động') ? 'text-success fw-bold' : 'text-danger fw-bold'}`} value={profile.status || 'Hoạt động'} disabled />
                    </div>
                  </div>
                )}
              </div>
              
              <hr className="my-5 opacity-25" />
              <div className="text-center">
                <p className="text-muted small mb-0">Để thay đổi thông tin cá nhân hoặc số điện thoại, vui lòng liên hệ với Quản trị viên hệ thống để được hỗ trợ.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
