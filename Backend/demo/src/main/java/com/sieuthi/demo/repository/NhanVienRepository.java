package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.response.NhanVienResponse;
import com.sieuthi.demo.model.NhanVien;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class NhanVienRepository {

    public List<NhanVienResponse> findAll() throws SQLException {
        List<NhanVienResponse> list = new ArrayList<>();
        String sql = "SELECT * FROM NhanVien";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                NhanVienResponse res = new NhanVienResponse();
                res.setMaNV(rs.getString("MaNV"));
                res.setHoTen(rs.getString("HoTen"));
                res.setPhone(rs.getString("Phone"));
                res.setRole(rs.getString("Role"));
                res.setUserName(rs.getString("UserName"));
                boolean statusVal = rs.getBoolean("Status");
                res.setStatus(rs.wasNull() ? null : statusVal);
                list.add(res);
            }
        }
        return list;
    }

    public NhanVien findByUserName(String userName) throws SQLException {
        String sql = "SELECT * FROM NhanVien WHERE UserName = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, userName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    NhanVien res = new NhanVien();
                    res.setMaNV(rs.getString("MaNV"));
                    res.setHoTen(rs.getString("HoTen"));
                    res.setPhone(rs.getString("Phone"));
                    res.setRole(rs.getString("Role"));
                    res.setUserName(rs.getString("UserName"));
                    boolean statusVal = rs.getBoolean("Status");
                    res.setStatus(rs.wasNull() ? null : (statusVal ? "Hoạt động" : "Nghỉ việc")); 
                    res.setPassword(rs.getString("Password")); 
                    return res;
                }
            }
        }
        return null;
    }

    public void save(NhanVienRequest req) throws SQLException {
        String sql = "INSERT INTO NhanVien (MaNV, HoTen, Phone, Role, UserName, Password, Status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, req.getMaNV());
            ps.setString(2, req.getHoTen());
            ps.setString(3, req.getPhone());
            ps.setString(4, req.getRole());
            ps.setString(5, req.getUserName());
            ps.setString(6, req.getPassword());
            if (req.getStatus() != null) {
                ps.setBoolean(7, req.getStatus());
            } else {
                ps.setNull(7, Types.BIT);
            }
            ps.executeUpdate();
        }
    }

    public void delete(String maNV) throws SQLException {
        String sql = "DELETE FROM NhanVien WHERE MaNV = ?";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, maNV);
            ps.executeUpdate();
        }
    }

    public String generateNewMaNV() throws SQLException {
        String sql = "SELECT MAX(MaNV) as maxMaNV FROM NhanVien";
        try (Connection con = DatabaseConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                String maxMaNV = rs.getString("maxMaNV");
                if (maxMaNV != null && maxMaNV.startsWith("NV")) {
                    try {
                        int currentNum = Integer.parseInt(maxMaNV.substring(2));
                        return String.format("NV%03d", currentNum + 1);
                    } catch (NumberFormatException e) {
                        // ignore and default
                    }
                }
            }
        }
        return "NV001";
    }
}
