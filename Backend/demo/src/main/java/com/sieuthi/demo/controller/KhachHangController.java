package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.KhachHangRequest;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import com.sieuthi.demo.service.KhachHangService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/khach-hang")
@RestController
@CrossOrigin("*")
public class KhachHangController {
    private final KhachHangService khachHangService;

    public KhachHangController(KhachHangService khachHangService) {
        this.khachHangService = khachHangService;
    }

    @GetMapping
    public ResponseEntity<List<KhachHangResponse>> layTatCa() {
        return ResponseEntity.ok(khachHangService.layTatCaKhachHang());
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<?> timTheoPhone(@PathVariable String phone) {
        try {
            KhachHangResponse kh = khachHangService.timKhachHangTheoPhone(phone);
            if (kh == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy khách hàng với số điện thoại: " + phone);
            }
            return ResponseEntity.ok(kh);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/dang-ky")
    public ResponseEntity<String> dangKyThanhVien(@RequestBody KhachHangRequest request) {
        try {
            khachHangService.themKhachHang(request);
            return ResponseEntity.ok("Đăng ký thành viên mới thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/sua")
    public ResponseEntity<String> suaKhachHang(@RequestBody com.sieuthi.demo.dto.request.KhachHangRequest request) {
        try {
            return ResponseEntity.ok("Cập nhật thông tin khách hàng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
