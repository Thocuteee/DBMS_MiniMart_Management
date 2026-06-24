package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.response.AdminDashboardResponse;
import com.sieuthi.demo.dto.response.CustomerDashboardResponse;
import com.sieuthi.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('KHACH_HANG')")
    public ResponseEntity<CustomerDashboardResponse> getCustomerDashboard(Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(username));
    }
}
