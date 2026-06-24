package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.NhaCungCapRequest;
import com.sieuthi.demo.dto.response.NhaCungCapResponse;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class NhaCungCapRepository {
    public List<NhaCungCapResponse> findAll() throws SQLException {
        List<NhaCungCapResponse> list = new ArrayList<>();
        String sql = "SELECT * FROM NhaCungCap";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                NhaCungCapResponse res = new NhaCungCapResponse();
                res.setMaNCC(rs.getString("MaNCC"));
                res.setNameNCC(rs.getString("NameNCC"));
                res.setPhone(rs.getString("Phone"));
                res.setAddress(rs.getString("Address"));
                list.add(res);
            }
        }
        return list;
    }

    public void save(NhaCungCapRequest req) throws SQLException {
        String sql = "INSERT INTO NhaCungCap (MaNCC, NameNCC, Phone, Address) VALUES (?, ?, ?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getMaNCC());
            ps.setString(2, req.getNameNCC());
            ps.setString(3, req.getPhone());
            ps.setString(4, req.getAddress());
            ps.executeUpdate();
        }
    }

    public void update(NhaCungCapRequest req) throws SQLException {
        String sql = "UPDATE NhaCungCap SET NameNCC=?, Phone=?, Address=? WHERE MaNCC=?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getNameNCC());
            ps.setString(2, req.getPhone());
            ps.setString(3, req.getAddress());
            ps.setString(4, req.getMaNCC());
            ps.executeUpdate();
        }
    }

    public void delete(String maNCC) throws SQLException {
        String sql = "DELETE FROM NhaCungCap WHERE MaNCC=?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, maNCC);
            ps.executeUpdate();
        }
    }
}
