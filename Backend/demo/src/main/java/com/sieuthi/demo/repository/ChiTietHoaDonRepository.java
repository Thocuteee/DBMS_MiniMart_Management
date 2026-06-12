package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.response.ChiTietHoaDonResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ChiTietHoaDonRepository {
    public List<ChiTietHoaDonResponse> findByMaHD(String maHD) throws SQLException {
        List<ChiTietHoaDonResponse> list = new ArrayList<>();
        String sql = "SELECT cthd.*, sp.TenSP FROM ChiTietHoaDon cthd JOIN SanPham sp ON cthd.MaSP = sp.MaSP WHERE cthd.MaHD = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, maHD);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ChiTietHoaDonResponse res = new ChiTietHoaDonResponse();
                    res.setMaSP(rs.getString("MaSP"));
                    res.setTenSP(rs.getString("TenSP"));
                    res.setSoLuong(rs.getInt("SoLuong"));
                    res.setDonGiaBan(rs.getDouble("DonGiaBan"));
                    res.setThanhTien(rs.getDouble("ThanhTien"));
                    list.add(res);
                }
            }
        }
        return list;
    }
}