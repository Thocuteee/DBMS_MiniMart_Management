package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.SanPhamRequest;
import com.sieuthi.demo.dto.response.SanPhamResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class SanPhamRepository {
    public List<SanPhamResponse> findAll() throws SQLException {
        List<SanPhamResponse> list = new ArrayList<>();
        String sql = "SELECT sp.*, lsp.TenLoai FROM SanPham sp LEFT JOIN LoaiSanPham lsp ON sp.MaLoai = lsp.MaLoai";
        try(Connection con = DatabaseConnection.getConnection(); 
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    SanPhamResponse res = new SanPhamResponse(
                        rs.getString("MaSP"), 
                        rs.getString("MaVach"), 
                        rs.getString("TenSP"),
                        rs.getString("DonVi"), 
                        rs.getDouble("GiaBan"), 
                        rs.getString("MaLoai"),
                        rs.getString("TenLoai")
                    );
                    list.add(res);
                }
        }
        return list;
    }

    public void save(SanPhamRequest req) throws SQLException {
        String sql = "INSERT INTO SanPham (MaSP, MaVach, MaLoai, TenSP, DonVi, GiaBan) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getMaSP());
            ps.setString(2, req.getMaVach());
            ps.setString(3, req.getMaLoai());
            ps.setString(4, req.getTenSP());
            ps.setString(5, req.getDonVi());
            ps.setDouble(6, req.getGiaBan());
            ps.executeUpdate();
        }
    }
}
