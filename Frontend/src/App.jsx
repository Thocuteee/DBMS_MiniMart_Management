import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login/Login';
import KhachHangNhanVien from './pages/KhachHangNhanVien';
import Profile from './pages/Profile/Profile';
import Categories from './pages/KhoSanPham/Categories';
import Products from './pages/KhoSanPham/Products';
import Suppliers from './pages/KhoSanPham/Suppliers';
import Imports from './pages/NhapKho/Imports';
import Warehouse from './pages/KhoSanPham/Warehouse';
import POS from './pages/BanHang/POS';
import Orders from './pages/BanHang/Orders';

import MyOrders from './pages/MyOrders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<KhachHangNhanVien defaultTab="khachhang" />} />
          <Route path="products" element={<Products />} />
          <Route path="imports" element={<Imports />} />
          <Route path="warehouse" element={<Warehouse />} />
          <Route path="employees" element={<KhachHangNhanVien defaultTab="nhanvien" />} />
          <Route path="categories" element={<Categories />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;