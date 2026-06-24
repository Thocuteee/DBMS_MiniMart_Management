package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.HoaDonRequest;
import com.sieuthi.demo.dto.response.HoaDonResponse;
import com.sieuthi.demo.service.HoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.sieuthi.demo.repository.NhanVienRepository;
import com.sieuthi.demo.model.NhanVien;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/ban-hang")
@CrossOrigin("*")
public class BanHangController {

    private final HoaDonService hoaDonService;
    private final NhanVienRepository nhanVienRepository;

    public BanHangController(HoaDonService hoaDonService, NhanVienRepository nhanVienRepository) {
        this.hoaDonService = hoaDonService;
        this.nhanVienRepository = nhanVienRepository;
    }

    @PostMapping("/thanh-toan")
    public ResponseEntity<?> thanhToan(@RequestBody HoaDonRequest request, Authentication authentication) {
        try {
            String username = authentication.getName();
            NhanVien nv = nhanVienRepository.findByUserName(username);
            String maNV = nv != null ? nv.getMaNV() : username;
            
            hoaDonService.taoHoaDon(request, maNV);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Thanh toán thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/lich-su")
    public ResponseEntity<List<HoaDonResponse>> layLichSu() {
        try {
            return ResponseEntity.ok(hoaDonService.layLichSuHoaDon());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
