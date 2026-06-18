package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.ThanhToanRequest;
import com.sieuthi.demo.service.BanHangService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ban-hang")
@CrossOrigin("*")
public class BanHangController {

    private final BanHangService banHangService;

    public BanHangController(BanHangService banHangService) {
        this.banHangService = banHangService;
    }

    @PostMapping("/thanh-toan")
    public ResponseEntity<String> thanhToan(@RequestBody ThanhToanRequest request) {
        try {
            banHangService.thanhToanDonHang(
                request.getMaHD(),
                request.getMaNV(),
                request.getMaKH(),
                request.getMaKho(),
                request.getMaSP(),
                request.getSoLuong(),
                request.getDonGia()
            );
            return ResponseEntity.ok("Thanh toán đơn hàng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thanh toán: " + e.getMessage());
        }
    }
}
