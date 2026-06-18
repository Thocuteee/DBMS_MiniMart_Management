package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.KhachHangRequest;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class KhachHangRepository {
    public KhachHangResponse findByPhone(String phone) throws SQLException{
        String sql = "SELECT * FROM KhachHang WHERE Phone = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, phone);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    KhachHangResponse res = new KhachHangResponse();
                    res.setMaKH(rs.getString("MaKH"));
                    res.setUserName(rs.getString("UserName"));
                    res.setPhone(rs.getString("Phone"));
                    res.setDiemTichLuy(rs.getInt("DiemTichLuy"));
                    return res;
                }
            }
        }
        return null;
    }

    public void save(KhachHangRequest req) throws SQLException {
        String sql = "INSERT INTO KhachHang (MaKH, UserName, Phone, DiemTichLuy) VALUES (?, ?, ?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getMaKH());
            ps.setString(2, req.getUserName());
            ps.setString(3, req.getPhone());
            ps.setInt(4, req.getDiemTichLuy() != null ? req.getDiemTichLuy() : 0);
            ps.executeUpdate();
        }
    }

    public List<KhachHangResponse> findAll() throws SQLException {
        List<KhachHangResponse> danhSach = new ArrayList<>();
        String sql = "SELECT * FROM KhachHang";

        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                KhachHangResponse res = new KhachHangResponse();
                res.setMaKH(rs.getString("MaKH"));
                res.setUserName(rs.getString("UserName"));
                res.setPhone(rs.getString("Phone"));
                res.setDiemTichLuy(rs.getInt("DiemTichLuy"));
                
                danhSach.add(res);
            }
        }
        return danhSach;
    }
}
