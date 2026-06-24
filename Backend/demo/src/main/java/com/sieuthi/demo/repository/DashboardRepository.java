package com.sieuthi.demo.repository;

import com.sieuthi.demo.config.DatabaseConnection;
import com.sieuthi.demo.dto.response.AdminDashboardResponse;
import com.sieuthi.demo.dto.response.CustomerDashboardResponse;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class DashboardRepository {

    public AdminDashboardResponse getAdminDashboard() throws SQLException {
        AdminDashboardResponse res = new AdminDashboardResponse();
        
        try (Connection con = DatabaseConnection.getConnection()) {
            try (PreparedStatement ps = con.prepareStatement("SELECT SUM(ThanhTien) FROM HoaDon");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    res.setTotalRevenue(rs.getDouble(1));
                }
            }

            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM HoaDon WHERE CAST(NgayLap as DATE) = CAST(GETDATE() as DATE)");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    res.setTodaysOrders(rs.getInt(1));
                }
            }

      
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM NhanVien");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    res.setActiveStaff(rs.getInt(1));
                }
            }

       
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM TonKho WHERE SoLuongTonKho < 10");
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    res.setLowStockAlerts(rs.getInt(1));
                }
            }

            List<Map<String, Object>> revenueData = new ArrayList<>();
            String revSql = "SELECT TOP 12 FORMAT(NgayLap, 'MM/yyyy') as MonthName, SUM(ThanhTien) as Earnings, COUNT(MaHD) as Orders " +
                            "FROM HoaDon GROUP BY FORMAT(NgayLap, 'MM/yyyy'), YEAR(NgayLap), MONTH(NgayLap) " +
                            "ORDER BY YEAR(NgayLap) ASC, MONTH(NgayLap) ASC";
            try (PreparedStatement ps = con.prepareStatement(revSql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", rs.getString("MonthName"));
                    map.put("earnings", rs.getDouble("Earnings"));
                    map.put("orders", rs.getInt("Orders"));
                    revenueData.add(map);
                }
            }
            res.setRevenueData(revenueData);

            List<Map<String, Object>> recentTx = new ArrayList<>();
            String txSql = "SELECT TOP 5 hd.MaHD, hd.ThanhTien, hd.NgayLap, kh.HoTen " +
                           "FROM HoaDon hd LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH " +
                           "ORDER BY hd.NgayLap DESC";
            try (PreparedStatement ps = con.prepareStatement(txSql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", rs.getString("MaHD"));
                    map.put("amount", rs.getDouble("ThanhTien"));
                    map.put("date", rs.getTimestamp("NgayLap").toString());
                    map.put("customer", rs.getString("HoTen") != null ? rs.getString("HoTen") : "Khách lẻ");
                    recentTx.add(map);
                }
            }
            res.setRecentTransactions(recentTx);
        }
        
        return res;
    }

    public CustomerDashboardResponse getCustomerDashboard(String username) throws SQLException {
        CustomerDashboardResponse res = new CustomerDashboardResponse();
        
        try (Connection con = DatabaseConnection.getConnection()) {
            // Customer Info
            String infoSql = "SELECT UserName, DiemTichLuy FROM KhachHang WHERE UserName = ?";
            try (PreparedStatement ps = con.prepareStatement(infoSql)) {
                ps.setString(1, username);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        res.setFullName(rs.getString("UserName")); // Use username as full name fallback
                        res.setRewardPoints(rs.getInt("DiemTichLuy"));
                        res.setMembershipTier("Đồng"); // Hardcoded since XepHang doesn't exist
                    }
                }
            }

            // Recent Orders
            List<Map<String, Object>> recentOrders = new ArrayList<>();
            String orderSql = "SELECT TOP 5 hd.MaHD, hd.ThanhTien, hd.NgayLap " +
                              "FROM HoaDon hd JOIN KhachHang kh ON hd.MaKH = kh.MaKH " +
                              "WHERE kh.UserName = ? ORDER BY hd.NgayLap DESC";
            try (PreparedStatement ps = con.prepareStatement(orderSql)) {
                ps.setString(1, username);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", rs.getString("MaHD"));
                        map.put("amount", rs.getDouble("ThanhTien"));
                        map.put("date", rs.getTimestamp("NgayLap").toString());
                        map.put("status", "Delivered");
                        recentOrders.add(map);
                    }
                }
            }
            res.setRecentOrders(recentOrders);
        }
        
        return res;
    }
}
