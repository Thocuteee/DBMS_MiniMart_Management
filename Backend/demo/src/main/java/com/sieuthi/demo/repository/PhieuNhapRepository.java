package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.PhieuNhapRequest;
import com.sieuthi.demo.dto.request.ChiTietPhieuNhapRequest;
import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class PhieuNhapRepository {
    public List<PhieuNhapResponse> findAll() throws SQLException {
        List<PhieuNhapResponse> list = new ArrayList<>();
        String sql = "SELECT pn.*, ncc.NameNCC, nv.HoTen FROM PhieuNhap pn " +
                    "LEFT JOIN NhaCungCap ncc ON pn.MaNCC = ncc.MaNCC " +
                    "LEFT JOIN NhanVien nv ON pn.MaNV = nv.MaNV";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                PhieuNhapResponse res = new PhieuNhapResponse();
                res.setMaPN(rs.getString("MaPN"));
                res.setNgayNhap(rs.getTimestamp("NgayNhap").toLocalDateTime());
                res.setNameNCC(rs.getString("NameNCC"));
                res.setTenNhanVienKho(rs.getString("HoTen"));
                res.setTongTienNhap(rs.getDouble("TongTienNhap"));
                list.add(res);
            }
        }
        return list;
    }

    public List<Map<String, Object>> findChiTietByMaPN(String maPN) throws SQLException {
        List<java.util.Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT ct.MaSP, sp.TenSP, ct.SoLuongNhap, ct.DonGiaNhap, ct.HanSuDung " +
                    "FROM ChiTietPhieuNhap ct " +
                    "JOIN SanPham sp ON ct.MaSP = sp.MaSP " +
                    "WHERE ct.MaPN = ?";

        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, maPN);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("maSP", rs.getString("MaSP"));
                    map.put("tenSP", rs.getString("TenSP"));
                    map.put("soLuongNhap", rs.getInt("SoLuongNhap"));
                    map.put("donGiaNhap", rs.getDouble("DonGiaNhap"));
                    map.put("hanSuDung", rs.getDate("HanSuDung"));
                    list.add(map);
                }
            }
        }
        return list;
    }

    public void save(PhieuNhapRequest req) throws SQLException {
        String callSP = "{call sp_GiaoTacNhapKho(?, ?, ?, ?, ?, ?, ?, ?)}";
        
        Connection con = null;
        try {
            con = DatabaseConnection.getConnection();
            con.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE); 
            con.setAutoCommit(false); 

            if (req.getChiTietList() != null && !req.getChiTietList().isEmpty()) {
                try (CallableStatement cs = con.prepareCall(callSP)) {
                    for (ChiTietPhieuNhapRequest ct : req.getChiTietList()) {
                        cs.setString(1, req.getMaPN());
                        cs.setString(2, req.getMaNCC());
                        cs.setString(3, "NV001");
                        cs.setString(4, "K01");
                        cs.setString(5, ct.getMaSP());
                        cs.setInt(6, ct.getSoLuongNhap());
                        cs.setDouble(7, ct.getDonGiaNhap());
                        cs.setDate(8, ct.getHanSuDung());
                        cs.addBatch();
                    }
                    cs.executeBatch();
                }
            }

            con.commit();
        } catch (SQLException e) {
            if (con != null) {
                try { con.rollback(); } catch (SQLException ex) {}
            }
            int errCode = e.getErrorCode();
            String userMsg = e.getMessage();
            if (errCode == 2627 || errCode == 2601) {
                userMsg = "Lỗi: Trùng lặp khóa chính (Mã phiếu nhập đã tồn tại).";
            } else if (errCode == 547) {
                userMsg = "Lỗi: Vi phạm ràng buộc khóa ngoại (Sản phẩm hoặc Nhà cung cấp không tồn tại).";
            } else if (errCode >= 50000) {
                userMsg = e.getMessage(); 
            }
            throw new SQLException(userMsg, e.getSQLState(), errCode);
        } finally {
            if (con != null) {
                try { 
                    con.setAutoCommit(true); 
                    con.close(); 
                } catch (SQLException ex) {}
            }
        }
    }
}