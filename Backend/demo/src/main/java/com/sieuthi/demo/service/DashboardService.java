package com.sieuthi.demo.service;

import com.sieuthi.demo.dto.response.AdminDashboardResponse;
import com.sieuthi.demo.dto.response.CustomerDashboardResponse;
import com.sieuthi.demo.repository.DashboardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;

@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    public AdminDashboardResponse getAdminDashboard() {
        try {
            return dashboardRepository.getAdminDashboard();
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching admin dashboard data: " + e.getMessage());
        }
    }

    public CustomerDashboardResponse getCustomerDashboard(String username) {
        try {
            return dashboardRepository.getCustomerDashboard(username);
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching customer dashboard data: " + e.getMessage());
        }
    }
}
