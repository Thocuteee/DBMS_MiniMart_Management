package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.response.HoaDonResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
}