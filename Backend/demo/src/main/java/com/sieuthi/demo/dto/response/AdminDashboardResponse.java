package com.sieuthi.demo.dto.response;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminDashboardResponse {
    private Double totalRevenue;
    private Integer todaysOrders;
    private Integer activeStaff;
    private Integer lowStockAlerts;
    private List<Map<String, Object>> revenueData;
    private List<Map<String, Object>> recentTransactions;
}
