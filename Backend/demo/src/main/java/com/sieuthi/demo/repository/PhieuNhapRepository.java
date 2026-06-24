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
        String insertPN = "INSERT INTO PhieuNhap (MaPN, NgayNhap, MaNCC, MaNV, TongTienNhap) VALUES (?, ?, ?, ?, ?)";
        String insertCT = "INSERT INTO ChiTietPhieuNhap (MaPN, MaSP, SoLuongNhap, DonGiaNhap, HanSuDung) VALUES (?, ?, ?, ?, ?)";
        
        Connection con = null;
        try {
            con = DatabaseConnection.getConnection();
            con.setAutoCommit(false); // Bắt đầu transaction

            // 1. Tính tổng tiền và insert PhieuNhap
            double tongTien = 0;
            if (req.getChiTietList() != null) {
                for (ChiTietPhieuNhapRequest ct : req.getChiTietList()) {
                    tongTien += ct.getSoLuongNhap() * ct.getDonGiaNhap();
                }
            }

            try (PreparedStatement psPN = con.prepareStatement(insertPN)) {
                psPN.setString(1, req.getMaPN());
                psPN.setTimestamp(2, new Timestamp(System.currentTimeMillis())); // Lấy thời gian hiện tại
                psPN.setString(3, req.getMaNCC());
                psPN.setString(4, "NV001"); // Tạm thời hardcode nhân viên kho
                psPN.setDouble(5, tongTien);
                psPN.executeUpdate();
            }

            // 2. Insert ChiTietPhieuNhap (Trigger sẽ tự động kích hoạt sau mỗi dòng insert)
            if (req.getChiTietList() != null && !req.getChiTietList().isEmpty()) {
                try (PreparedStatement psCT = con.prepareStatement(insertCT)) {
                    for (ChiTietPhieuNhapRequest ct : req.getChiTietList()) {
                        psCT.setString(1, req.getMaPN());
                        psCT.setString(2, ct.getMaSP());
                        psCT.setInt(3, ct.getSoLuongNhap());
                        psCT.setDouble(4, ct.getDonGiaNhap());
                        psCT.setDate(5, ct.getHanSuDung());
                        psCT.addBatch();
                    }
                    psCT.executeBatch();
                }
            }

            con.commit();
        } catch (SQLException e) {
            if (con != null) {
                try { con.rollback(); } catch (SQLException ex) {}
            }
            throw e;
        } finally {
            if (con != null) {
                try { con.setAutoCommit(true); con.close(); } catch (SQLException ex) {}
            }
        }
    }
}