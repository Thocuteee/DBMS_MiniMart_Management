package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.KhoRequest;
import com.sieuthi.demo.dto.response.KhoResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class KhoRepository {
    public List<KhoResponse> findAll() throws SQLException {
        List<KhoResponse> list = new ArrayList<>();
        String sql = "SELECT * FROM Kho";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                KhoResponse res = new KhoResponse();
                res.setMaKho(rs.getString("MaKho"));
                res.setTenKho(rs.getString("TenKho"));
                res.setDiaChi(rs.getString("DiaChi"));
                list.add(res);
            }
        }
        return list;
    }

    public void save(KhoRequest req) throws SQLException {
        String sql = "INSERT INTO Kho (MaKho, TenKho, DiaChi) VALUES (?, ?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getMaKho());
            ps.setString(2, req.getTenKho());
            ps.setString(3, req.getDiaChi());
            ps.executeUpdate();
        }
    }
}
