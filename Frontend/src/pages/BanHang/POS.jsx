import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Trash2, UserPlus, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal In Hóa Đơn
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/san-pham', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchCustomer = async () => {
    if (!customerPhone.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/v1/khach-hang/phone/${customerPhone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCustomer(response.data);
      setError(null);
    } catch (err) {
      setSelectedCustomer(null);
      setError("Không tìm thấy khách hàng với SĐT này.");
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.maSP === product.maSP);
    if (existing) {
      setCart(cart.map(item => item.maSP === product.maSP ? { ...item, soLuong: item.soLuong + 1 } : item));
    } else {
      setCart([...cart, { ...product, soLuong: 1, donGiaBan: product.giaBan || 0 }]);
    }
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const updateQuantity = (maSP, quantity) => {
    if (quantity < 1) return;
    setCart(cart.map(item => item.maSP === maSP ? { ...item, soLuong: quantity } : item));
  };

  const removeFromCart = (maSP) => {
    setCart(cart.filter(item => item.maSP !== maSP));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Giỏ hàng trống!");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        maHD: `HD${Date.now()}`,
        maKH: selectedCustomer ? (selectedCustomer.maKH || selectedCustomer.userName) : null,
        giamGia: usedPoints || 0,
        chiTietList: cart.map(item => ({
          maSP: item.maSP,
          soLuong: item.soLuong,
          donGiaBan: item.donGiaBan
        }))
      };

      await axios.post('http://localhost:8080/api/v1/ban-hang/thanh-toan', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show receipt modal
      setLastOrder({
        maHD: payload.maHD,
        date: new Date().toLocaleString('vi-VN'),
        customerName: selectedCustomer ? selectedCustomer.hoTen : 'Khách vãng lai',
        items: [...cart],
        totalAmount: totalAmount,
        discount: usedPoints,
        finalAmount: finalAmount
      });
      setShowReceipt(true);

      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setCustomerPhone('');
      setUsedPoints(0);
      setSearchTerm('');
    } catch (err) {
      setError(err.response?.data?.error || "Lỗi thanh toán. Vui lòng kiểm tra lại tồn kho.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      const exactMatch = products.find(p => p.maSP.toLowerCase() === searchTerm.trim().toLowerCase() || p.tenSP.toLowerCase() === searchTerm.trim().toLowerCase());
      if (exactMatch) {
        addToCart(exactMatch);
      }
    }
  };

  const filteredProducts = searchTerm.trim() === '' 
    ? [] 
    : products.filter(p => p.tenSP?.toLowerCase().includes(searchTerm.toLowerCase()) || p.maSP?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalAmount = cart.reduce((acc, item) => acc + (item.soLuong * item.donGiaBan), 0);
  const finalAmount = totalAmount - usedPoints;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)', padding: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-shop"></i> Bán Hàng (POS)
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>Hệ thống thu ngân nhanh</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="bi bi-exclamation-circle-fill"></i> {error}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Search & Cart (Spans 8 columns on large screens) */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Search Area */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '4px 16px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
              <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '1.2rem' }}></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm theo tên hoặc mã vạch (Enter để thêm nhanh)..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={searchInputRef}
                style={{ flex: 1, border: 'none', padding: '16px 12px', outline: 'none', backgroundColor: 'transparent', fontSize: '1rem', color: '#0f172a' }}
              />
              {searchTerm && (
                <i className="bi bi-x-circle-fill cursor-pointer" style={{ color: '#cbd5e1', cursor: 'pointer' }} onClick={() => setSearchTerm('')}></i>
              )}
            </div>

            {/* Dropdown Results */}
            {searchTerm.trim() !== '' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', zIndex: 50, maxHeight: '350px', overflowY: 'auto' }}>
                {filteredProducts.length > 0 ? (
                  <div style={{ padding: '8px' }}>
                    {filteredProducts.map(product => (
                      <div 
                        key={product.maSP}
                        onClick={() => addToCart(product)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                            {product.hinhAnh ? <img src={product.hinhAnh} alt="sp" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} /> : <i className="bi bi-box" style={{ color: '#94a3b8', fontSize: '1.5rem' }}></i>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{product.tenSP}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Mã: {product.maSP} &bull; Tồn: {product.soLuongTon}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(product.giaBan || 0)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    <i className="bi bi-emoji-frown fs-2 mb-2 d-block"></i>
                    Không tìm thấy sản phẩm nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)' }}>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Sản phẩm</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center', width: '150px' }}>Số lượng</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right', width: '150px' }}>Thành tiền</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0', width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={item.maSP} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.tenSP}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{formatCurrency(item.donGiaBan)}</div>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                          <button onClick={() => updateQuantity(item.maSP, item.soLuong - 1)} style={{ border: 'none', backgroundColor: '#f8fafc', padding: '6px 12px', color: '#64748b', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#f8fafc'}>-</button>
                          <div style={{ padding: '6px 16px', fontWeight: 600, color: '#0f172a', backgroundColor: '#fff', minWidth: '40px', textAlign: 'center' }}>{item.soLuong}</div>
                          <button onClick={() => updateQuantity(item.maSP, item.soLuong + 1)} style={{ border: 'none', backgroundColor: '#f8fafc', padding: '6px 12px', color: '#64748b', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#f8fafc'}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(item.soLuong * item.donGiaBan)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button onClick={() => removeFromCart(item.maSP)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                          <i className="bi bi-basket" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                        </div>
                        <h5 style={{ fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Chưa có sản phẩm</h5>
                        <p style={{ fontSize: '0.875rem' }}>Quét mã vạch hoặc tìm kiếm để thêm vào giỏ</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cart Footer Summary (Desktop) */}
            {cart.length > 0 && (
              <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Tổng số lượng: <strong style={{ color: '#0f172a' }}>{cart.reduce((a, b) => a + b.soLuong, 0)}</strong>
                </div>
                <div style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }} onClick={() => setCart([])}>
                  <i className="bi bi-x-circle me-1"></i> Xóa tất cả
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Payment Info (Spans 4 columns) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 150px)' }}>
          
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>Thanh Toán</h3>
            
            {/* Customer Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Khách hàng thành viên</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <i className="bi bi-telephone" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input 
                    type="text" 
                    placeholder="Nhập số điện thoại..." 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchCustomer()}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
                <button 
                  onClick={searchCustomer}
                  style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 16px', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={e=>e.currentTarget.style.backgroundColor='#e2e8f0'} 
                  onMouseOut={e=>e.currentTarget.style.backgroundColor='#f1f5f9'}
                >Tìm</button>
              </div>

              {selectedCustomer && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', position: 'relative' }}>
                  <button 
                    onClick={() => { setSelectedCustomer(null); setUsedPoints(0); setCustomerPhone(''); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer' }}
                  ><i className="bi bi-x"></i></button>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.875rem' }}>{selectedCustomer.hoTen}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Điểm tích lũy: <strong style={{ fontSize: '1rem' }}>{selectedCustomer.diemTichLuy || 0}</strong></div>
                </div>
              )}
            </div>

            {/* Calculations Section */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginTop: 'auto', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.875rem', color: '#64748b' }}>
                <span>Tổng tiền hàng</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(totalAmount)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Dùng điểm giảm giá</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={usedPoints}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const maxPoints = selectedCustomer ? (selectedCustomer.diemTichLuy || 0) : 0;
                      if (selectedCustomer && val > maxPoints) {
                        toast.warning(`Khách hàng chỉ có ${maxPoints} điểm!`);
                        setUsedPoints(maxPoints);
                      } else if (val > totalAmount) {
                        setUsedPoints(totalAmount);
                      } else {
                        setUsedPoints(val);
                      }
                    }}
                    style={{ width: '90px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'right', fontWeight: 600, color: '#ef4444', outline: 'none' }}
                  />
                  {selectedCustomer && (
                    <button 
                      onClick={() => setUsedPoints(Math.min(selectedCustomer.diemTichLuy || 0, totalAmount))}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >MAX</button>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '16px 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Khách cần trả</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{formatCurrency(finalAmount > 0 ? finalAmount : 0)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              style={{ width: '100%', padding: '16px', backgroundColor: cart.length === 0 ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.125rem', fontWeight: 700, marginTop: '24px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: cart.length === 0 ? 'none' : '0 4px 6px -1px rgba(15, 23, 42, 0.2)' }}
              onMouseOver={e => { if(cart.length > 0) e.currentTarget.style.backgroundColor = '#1e293b' }}
              onMouseOut={e => { if(cart.length > 0) e.currentTarget.style.backgroundColor = '#0f172a' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-printer"></i>}
              {loading ? 'Đang xử lý...' : 'Thanh Toán & In'}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal (In Hóa Đơn) */}
      {showReceipt && lastOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowReceipt(false)}></div>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', zIndex: 10000, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            
            {/* The Printable Area */}
            <div id="receipt-content" style={{ padding: '32px', fontFamily: '"Courier New", Courier, monospace', color: '#000', backgroundColor: '#fff' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '1px' }}>MINIMART</h2>
                <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}>ĐC: Khu Phố 6, Phường Linh Trung</div>
                <div style={{ fontSize: '0.875rem' }}>ĐT: 0123.456.789</div>
                <div style={{ marginTop: '16px', fontSize: '1.125rem', fontWeight: 700, borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '8px 0' }}>HÓA ĐƠN BÁN HÀNG</div>
              </div>
              
              <div style={{ marginBottom: '24px', fontSize: '0.875rem', lineHeight: '1.5' }}>
                <div><strong>Mã HĐ:</strong> {lastOrder.maHD}</div>
                <div><strong>Ngày:</strong> {lastOrder.date}</div>
                <div><strong>Khách:</strong> {lastOrder.customerName}</div>
              </div>

              <table style={{ width: '100%', marginBottom: '24px', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #000' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 700 }}>Tên SP</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 700 }}>SL</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 700 }}>T.Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {lastOrder.items.map(item => (
                    <tr key={item.maSP}>
                      <td style={{ padding: '8px 0', paddingRight: '8px' }}>
                        <div>{item.tenSP}</div>
                        <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>{formatCurrency(item.donGiaBan)}</div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px 0', verticalAlign: 'top' }}>{item.soLuong}</td>
                      <td style={{ textAlign: 'right', padding: '8px 0', verticalAlign: 'top' }}>{formatCurrency(item.soLuong * item.donGiaBan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '2px dashed #000', paddingTop: '16px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Cộng tiền hàng:</span>
                  <span>{formatCurrency(lastOrder.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>Trừ điểm/Giảm giá:</span>
                  <span>- {formatCurrency(lastOrder.discount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', paddingTop: '16px', borderTop: '1px solid #000' }}>
                  <span>THÀNH TIỀN:</span>
                  <span>{formatCurrency(lastOrder.finalAmount)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px dashed #000', fontSize: '0.875rem' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Cảm ơn Quý Khách!</p>
                <p style={{ margin: 0 }}>Hẹn gặp lại</p>
              </div>
            </div>

            {/* Modal Actions (Not printed) */}
            <div className="print-hide" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowReceipt(false)}
                style={{ padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
              >Đóng</button>
              <button 
                onClick={printReceipt}
                style={{ padding: '10px 20px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              ><i className="bi bi-printer"></i> In Hóa Đơn</button>
            </div>
            
            <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #receipt-content, #receipt-content * {
                    visibility: visible;
                  }
                  #receipt-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0 !important;
                  }
                  .modal-backdrop, .print-hide {
                    display: none !important;
                  }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
