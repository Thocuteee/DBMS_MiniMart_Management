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
        String sql = "SELECT tk.MaKho, k.TenKho, tk.MaSP, sp.TenSP, tk.SoLuongTonKho, sp.GiaBan, lsp.TenLoai, " +
                    "(SELECT MIN(HanSuDung) FROM ChiTietPhieuNhap WHERE MaSP = tk.MaSP) AS HanSuDung " +
                    "FROM TonKho tk WITH (NOLOCK) " +
                    "JOIN Kho k WITH (NOLOCK) ON tk.MaKho = k.MaKho " +
                    "JOIN SanPham sp WITH (NOLOCK) ON tk.MaSP = sp.MaSP " +
                    "LEFT JOIN LoaiSanPham lsp WITH (NOLOCK) ON sp.MaLoai = lsp.MaLoai " +
                    "WHERE tk.MaKho = ?";
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
                    res.setGiaBan(rs.getDouble("GiaBan"));
                    res.setHanSuDung(rs.getDate("HanSuDung"));
                    res.setTenLoai(rs.getString("TenLoai"));
                    list.add(res);
                }
            }
        }
        return list;
    }

    public List<TonKhoResponse> findAll() throws SQLException {
        List<TonKhoResponse> list = new ArrayList<>();
        String sql = "SELECT tk.MaKho, k.TenKho, tk.MaSP, sp.TenSP, tk.SoLuongTonKho, sp.GiaBan, lsp.TenLoai, " +
                    "(SELECT MIN(HanSuDung) FROM ChiTietPhieuNhap WHERE MaSP = tk.MaSP) AS HanSuDung " +
                    "FROM TonKho tk WITH (NOLOCK) " +
                    "JOIN Kho k WITH (NOLOCK) ON tk.MaKho = k.MaKho " +
                    "JOIN SanPham sp WITH (NOLOCK) ON tk.MaSP = sp.MaSP " +
                    "LEFT JOIN LoaiSanPham lsp WITH (NOLOCK) ON sp.MaLoai = lsp.MaLoai";
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
                res.setGiaBan(rs.getDouble("GiaBan"));
                res.setHanSuDung(rs.getDate("HanSuDung"));
                res.setTenLoai(rs.getString("TenLoai"));
                list.add(res);
            }
        }
        return list;
    }

    public void dieuChuyen(String maSP, int soLuongChuyen, String maKhoNguon, String maKhoDich) throws SQLException {
        String sql = "{call sp_DieuChuyenKhoNoiBo(?, ?, ?, ?)}";
        try (Connection con = DatabaseConnection.getConnection();
             CallableStatement cs = con.prepareCall(sql)) {
            cs.setString(1, maSP);
            cs.setInt(2, soLuongChuyen);
            cs.setString(3, maKhoNguon);
            cs.setString(4, maKhoDich);
            cs.execute();
        } catch (SQLException e) {
            if (e.getErrorCode() == 1205) {
                throw new SQLException("Lỗi khóa chết (Deadlock): Giao dịch bị chọn làm nạn nhân (Deadlock Victim). Vui lòng thử lại!", e);
            }
            throw e;
        }
    }
}
