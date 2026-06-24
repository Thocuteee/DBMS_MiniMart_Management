package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.PhieuNhapRequest;
import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import com.sieuthi.demo.service.PhieuNhapService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nhap-kho")
public class NhapKhoController {
    private final PhieuNhapService phieuNhapService;

    public NhapKhoController(PhieuNhapService phieuNhapService) {
        this.phieuNhapService = phieuNhapService;
    }

    @GetMapping
    public ResponseEntity<List<PhieuNhapResponse>> layDanhSachPhieuNhap() {
        return ResponseEntity.ok(phieuNhapService.layDanhSachPhieuNhap());
    }

    @PostMapping
    public ResponseEntity<String> taoPhieuNhap(@RequestBody PhieuNhapRequest request) {
        try {
            phieuNhapService.taoPhieuNhap(request);
            return ResponseEntity.ok("Tạo phiếu nhập và cập nhật tồn kho thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
