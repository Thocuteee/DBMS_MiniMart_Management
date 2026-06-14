package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.request.SanPhamRequest; 
import org.springframework.stereotype.Repository;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

@Repository
public class BanHangRepository {
    public void GiaoTacBanHang(String maHD, String maNV, String maKH, String maKho, String maSP, int soLuong, double donGia) throws SQLException {
        String sql = "{call sp_GiaoTacBanHang(?, ?, ?, ?, ?, ?, ?)}";
        try(Connection con = DatabaseConnection.getConnection(); CallableStatement cstmt = con.prepareCall(sql)) {
            // Set tham so maHD, maNV, maKH, maKho, maSP, soLuong, donGia
            cstmt.setString(1, maHD);
            cstmt.setString(2, maNV);
            cstmt.setString(3, maKH);
            cstmt.setString(4, maKho);
            cstmt.setString(5, maSP);
            cstmt.setInt(6, soLuong);
            cstmt.setDouble(7, donGia);
            cstmt.execute();
        }
    }

}
