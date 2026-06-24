package com.sieuthi.demo.controller;

import com.sieuthi.demo.service.PhieuNhapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/phieu-nhap")
public class PhieuNhapController {
    private final PhieuNhapService phieuNhapService;

    public PhieuNhapController(PhieuNhapService phieuNhapService) {
        this.phieuNhapService = phieuNhapService;
    }

    @GetMapping
    public ResponseEntity<?> layTatCaPhieuNhap() {
        return ResponseEntity.ok(phieuNhapService.layDanhSachPhieuNhap());
    }

    @PostMapping("/nhap-kho")
    public ResponseEntity<?> nhapKhoPhieuHang(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", true);
            response.put("message", "Thực thi giao tác nhập lô hàng thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{maPN}/chi-tiet")
    public ResponseEntity<?> xemChiTietPhieuNhap(@PathVariable String maPN) {
        try {
            return ResponseEntity.ok(phieuNhapService.xemChiTietPhieuNhap(maPN));
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

