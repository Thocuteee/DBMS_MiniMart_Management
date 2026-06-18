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

    public void delete(String maKH) throws SQLException {
        String sql = "DELETE FROM KhachHang WHERE MaKH = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, maKH);
            ps.executeUpdate();
        }
    }

    public String generateNewMaKH() throws SQLException {
        String sql = "SELECT MAX(MaKH) as maxMaKH FROM KhachHang";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                String maxMaKH = rs.getString("maxMaKH");
                if (maxMaKH != null && maxMaKH.startsWith("KH")) {
                    try {
                        int currentNum = Integer.parseInt(maxMaKH.substring(2));
                        return String.format("KH%03d", currentNum + 1);
                    } catch (NumberFormatException e) {
                        // ignore and default
                    }
                }
            }
        }
        return "KH001";
    }
}
