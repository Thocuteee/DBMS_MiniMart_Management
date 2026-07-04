package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.response.TonKhoResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TonKhoRepository {
    public List<TonKhoResponse> findByKho(String maKho) throws SQLException {
        List<TonKhoResponse> list = new ArrayList<>();
        String sql = "SELECT tk.*, k.TenKho, sp.TenSP FROM TonKho tk WITH (NOLOCK) " +
                    "JOIN Kho k WITH (NOLOCK) ON tk.MaKho = k.MaKho " +
                    "JOIN SanPham sp WITH (NOLOCK) ON tk.MaSP = sp.MaSP WHERE tk.MaKho = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, maKho);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    TonKhoResponse res = new TonKhoResponse();
                    res.setMaKho(rs.getString("MaKho"));
                    res.setTenKho(rs.getString("TenKho"));
                    res.setMaSP(rs.getString("MaSP"));
                    res.setTenSP(rs.getString("TenSP"));
                    res.setSoLuongTonKho(rs.getInt("SoLuongTonKho"));
                    list.add(res);
                }
            }
        }
        return list;
    }

    public List<TonKhoResponse> findAll() throws SQLException {
        List<TonKhoResponse> list = new ArrayList<>();
        String sql = "SELECT tk.*, k.TenKho, sp.TenSP FROM TonKho tk WITH (NOLOCK) " +
                    "JOIN Kho k WITH (NOLOCK) ON tk.MaKho = k.MaKho " +
                    "JOIN SanPham sp WITH (NOLOCK) ON tk.MaSP = sp.MaSP";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                TonKhoResponse res = new TonKhoResponse();
                res.setMaKho(rs.getString("MaKho"));
                res.setTenKho(rs.getString("TenKho"));
                res.setMaSP(rs.getString("MaSP"));
                res.setTenSP(rs.getString("TenSP"));
                res.setSoLuongTonKho(rs.getInt("SoLuongTonKho"));
                list.add(res);
            }
        }
        return list;
    }
}
