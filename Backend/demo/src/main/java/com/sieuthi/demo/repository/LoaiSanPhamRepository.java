package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.LoaiSanPhamRequest;
import com.sieuthi.demo.dto.response.LoaiSanPhamResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class LoaiSanPhamRepository {
    public List<LoaiSanPhamResponse> findAll() throws SQLException {
        List<LoaiSanPhamResponse> list = new ArrayList<>();
        String sql = "SELECT * FROM LoaiSanPham";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                LoaiSanPhamResponse res = new LoaiSanPhamResponse();
                res.setMaLoai(rs.getString("MaLoai"));
                res.setTenLoai(rs.getString("TenLoai"));
                list.add(res);
            }
        }
        return list;
    }

    public void save(LoaiSanPhamRequest req) throws SQLException {
        String sql = "INSERT INTO LoaiSanPham (MaLoai, TenLoai) VALUES (?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getMaLoai());
            ps.setString(2, req.getTenLoai());
            ps.executeUpdate();
        }
    }

    public void update(LoaiSanPhamRequest req) throws SQLException {
        String sql = "UPDATE LoaiSanPham SET TenLoai = ? WHERE MaLoai = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getTenLoai());
            ps.setString(2, req.getMaLoai());
            ps.executeUpdate();
        }
    }

    public void delete(String maLoai) throws SQLException {
        String sql = "DELETE FROM LoaiSanPham WHERE MaLoai = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, maLoai);
            ps.executeUpdate();
        }
    }
}
