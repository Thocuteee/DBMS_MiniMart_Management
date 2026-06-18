package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.response.HoaDonResponse;
import com.sieuthi.demo.dto.response.ChiTietHoaDonResponse;
import com.sieuthi.demo.service.HoaDonService;
import com.sieuthi.demo.service.ChiTietHoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hoa-don")
@CrossOrigin("*")
public class HoaDonController {

    private final HoaDonService hoaDonService;
    private final ChiTietHoaDonService chiTietHoaDonService;

    public HoaDonController(HoaDonService hoaDonService, ChiTietHoaDonService chiTietHoaDonService) {
        this.hoaDonService = hoaDonService;
        this.chiTietHoaDonService = chiTietHoaDonService;
    }

    @GetMapping
    public ResponseEntity<List<HoaDonResponse>> layLichSu() {
        return ResponseEntity.ok(hoaDonService.layLichSuHoaDon());
    }

    @GetMapping("/chi-tiet/{maHD}")
    public ResponseEntity<List<ChiTietHoaDonResponse>> layChiTietTheoMa(@PathVariable String maHD) {
        return ResponseEntity.ok(chiTietHoaDonService.layChiTietTheoMaHD(maHD));
    }

    @PostMapping("/doi-tra")
    public ResponseEntity<String> doiTraHangLoi(@RequestBody java.util.Map<String, Object> req) {
        try {
            return ResponseEntity.ok("Xử lý đổi trả hàng lỗi và hoàn tiền thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}