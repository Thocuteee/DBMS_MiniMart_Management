import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login/Login';
import KhachHangNhanVien from './pages/KhachHangNhanVien';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Placeholder = ({ title }) => (
  <div className="card p-4">
    <h4>{title}</h4>
    <p>This page is under construction.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Placeholder title="Quản lý Hóa Đơn" />} />
          <Route path="customers" element={<KhachHangNhanVien defaultTab="khachhang" />} />
          <Route path="products" element={<Placeholder title="Quản lý Sản Phẩm" />} />
          <Route path="imports" element={<Placeholder title="Quản lý Nhập Kho" />} />
          <Route path="warehouse" element={<Placeholder title="Kiểm kê Kho" />} />
          <Route path="employees" element={<KhachHangNhanVien defaultTab="nhanvien" />} />
          <Route path="categories" element={<Placeholder title="Danh mục Sản Phẩm" />} />
          <Route path="suppliers" element={<Placeholder title="Nhà Cung Cấp" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;