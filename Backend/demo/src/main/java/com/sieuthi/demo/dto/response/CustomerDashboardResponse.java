package com.sieuthi.demo.dto.response;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CustomerDashboardResponse {
    private String fullName;
    private Integer rewardPoints;
    private String membershipTier;
    private List<Map<String, Object>> recentOrders;
}
