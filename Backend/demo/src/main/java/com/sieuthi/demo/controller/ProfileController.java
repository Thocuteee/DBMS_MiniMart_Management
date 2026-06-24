package com.sieuthi.demo.controller;

import com.sieuthi.demo.repository.NhanVienRepository;
import com.sieuthi.demo.repository.KhachHangRepository;
import com.sieuthi.demo.model.NhanVien;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/profile")
@CrossOrigin("*")
public class ProfileController {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String username = authentication.getName();
        boolean isCustomer = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_KHACH_HANG"));

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("username", username);

        try {
            if (isCustomer) {
                try (java.sql.Connection con = com.sieuthi.demo.config.DatabaseConnection.getConnection();
                     java.sql.PreparedStatement ps = con.prepareStatement("SELECT * FROM KhachHang WHERE UserName = ?")) {
                    ps.setString(1, username);
                    try (java.sql.ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            profileData.put("fullName", username); // No name column in DB
                            profileData.put("phone", rs.getString("Phone"));
                            profileData.put("points", rs.getInt("DiemTichLuy"));
                            profileData.put("roleDisplay", "Khách hàng");
                        }
                    }
                }
            } else {
                NhanVien nv = nhanVienRepository.findByUserName(username);
                if (nv != null) {
                    profileData.put("fullName", nv.getHoTen());
                    profileData.put("phone", nv.getPhone());
                    profileData.put("roleDisplay", nv.getRole());
                    profileData.put("status", nv.getStatus());
                } else {
                    profileData.put("fullName", "Admin");
                    profileData.put("roleDisplay", "Quản trị viên");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok(profileData);
    }
}
