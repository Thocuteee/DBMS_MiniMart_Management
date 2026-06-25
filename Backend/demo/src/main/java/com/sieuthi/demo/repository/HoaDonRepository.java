package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.response.HoaDonResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.sieuthi.demo.dto.request.HoaDonRequest;
import com.sieuthi.demo.dto.request.ChiTietHoaDonRequest;
import com.sieuthi.demo.dto.response.ChiTietHoaDonResponse;

@Repository
public class HoaDonRepository {
    public List<HoaDonResponse> findAll() throws SQLException {
        List<HoaDonResponse> list = new ArrayList<>();
        String sql = "SELECT hd.*, nv.HoTen, kh.UserName FROM HoaDon hd " +
                    "LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV " +
                    "LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                HoaDonResponse res = new HoaDonResponse();
                res.setMaHD(rs.getString("MaHD"));
                res.setMaKH(rs.getString("MaKH"));
                res.setNgayLap(rs.getTimestamp("NgayLap").toLocalDateTime());
                res.setTenNhanVien(rs.getString("HoTen"));
                res.setTenKhachHang(rs.getString("UserName"));
                res.setTongTien(rs.getDouble("TongTien"));
                res.setGiamGia(rs.getDouble("GiamGia"));
                res.setThanhTien(rs.getDouble("ThanhTien"));
                list.add(res);
            }
        }
        return list;
    }

    public List<ChiTietHoaDonResponse> findChiTietByMaHD(String maHD) throws SQLException {
        List<ChiTietHoaDonResponse> list = new ArrayList<>();
        String sql = "SELECT ct.MaSP, sp.TenSP, ct.SoLuong, ct.DonGiaBan, ct.ThanhTien " +
                    "FROM ChiTietHoaDon ct " +
                    "JOIN SanPham sp ON ct.MaSP = sp.MaSP " +
                    "WHERE ct.MaHD = ?";

        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, maHD);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ChiTietHoaDonResponse ct = new ChiTietHoaDonResponse();
                    ct.setMaSP(rs.getString("MaSP"));
                    ct.setTenSP(rs.getString("TenSP"));
                    ct.setSoLuong(rs.getInt("SoLuong"));
                    ct.setDonGiaBan(rs.getDouble("DonGiaBan"));
                    ct.setThanhTien(rs.getDouble("ThanhTien"));
                    list.add(ct);
                }
            }
        }
        return list;
    }

    public void save(HoaDonRequest req, String maNV) throws SQLException {
        String insertHD = "INSERT INTO HoaDon (MaHD, NgayLap, MaNV, MaKH, TongTien, GiamGia, ThanhTien) VALUES (?, GETDATE(), ?, ?, ?, ?, ?)";
        String insertCT = "INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong, DonGiaBan, ThanhTien) VALUES (?, ?, ?, ?, ?)";
        String updateTonKho = "UPDATE TonKho SET SoLuongTonKho = SoLuongTonKho - ? WHERE MaKho = 'K02' AND MaSP = ?";
        
        Connection con = null;
        try {
            con = DatabaseConnection.getConnection();
            con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            con.setAutoCommit(false); 

            double tongTien = 0;
            for (ChiTietHoaDonRequest ct : req.getChiTietList()) {
                tongTien += ct.getSoLuong() * ct.getDonGiaBan();
            }
            double thanhTien = tongTien - req.getGiamGia();

            // Insert HoaDon
            try (PreparedStatement psHD = con.prepareStatement(insertHD)) {
                psHD.setString(1, req.getMaHD());
                psHD.setString(2, maNV);
                if (req.getMaKH() != null && !req.getMaKH().isEmpty()) {
                    psHD.setString(3, req.getMaKH());
                } else {
                    psHD.setNull(3, java.sql.Types.VARCHAR);
                }
                psHD.setDouble(4, tongTien);
                psHD.setDouble(5, req.getGiamGia());
                psHD.setDouble(6, thanhTien);
                psHD.executeUpdate();
            }

            // Insert ChiTietHoaDon
            try (PreparedStatement psCT = con.prepareStatement(insertCT)) {
                for (ChiTietHoaDonRequest ct : req.getChiTietList()) {
                    psCT.setString(1, req.getMaHD());
                    psCT.setString(2, ct.getMaSP());
                    psCT.setInt(3, ct.getSoLuong());
                    psCT.setDouble(4, ct.getDonGiaBan());
                    psCT.setDouble(5, ct.getSoLuong() * ct.getDonGiaBan());
                    psCT.addBatch();
                }
                psCT.executeBatch();
            }

            // Update TonKho
            try (PreparedStatement psTK = con.prepareStatement(updateTonKho)) {
                for (ChiTietHoaDonRequest ct : req.getChiTietList()) {
                    psTK.setInt(1, ct.getSoLuong());
                    psTK.setString(2, ct.getMaSP());
                    psTK.addBatch();
                }
                psTK.executeBatch();
            }

            con.commit();
        } catch (SQLException e) {
            if (con != null) {
                try { con.rollback(); } catch (SQLException ex) {}
            }
            int errCode = e.getErrorCode();
            String userMsg = e.getMessage();
            if (errCode == 2627 || errCode == 2601) {
                userMsg = "Lỗi: Trùng lặp khóa chính (Mã hóa đơn đã tồn tại).";
            } else if (errCode == 547) {
                userMsg = "Lỗi: Vi phạm ràng buộc khóa ngoại (Sản phẩm hoặc Khách hàng không tồn tại).";
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