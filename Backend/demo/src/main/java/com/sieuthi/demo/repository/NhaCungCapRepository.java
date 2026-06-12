package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
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
                res.setDiaChi(rs.getString("Address"));
                list.add(res);
            }
        }
        return list;
    }
}

