package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
}