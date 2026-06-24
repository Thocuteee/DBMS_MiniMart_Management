package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.SanPhamRequest;
import com.sieuthi.demo.dto.response.SanPhamResponse;
import com.sieuthi.demo.service.SanPhamService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/san-pham")
public class SanPhamController {
    private final SanPhamService sanPhamService;

    public SanPhamController(SanPhamService sanPhamService) {
        this.sanPhamService = sanPhamService;
    }

    @GetMapping
    public ResponseEntity<List<SanPhamResponse>> layTatCa() {
        return ResponseEntity.ok(sanPhamService.layTatCaSanPham());
    }

    @PostMapping
    public ResponseEntity<String> themMoi(@RequestBody SanPhamRequest request) {
        try {
            sanPhamService.themSanPham(request);
            return ResponseEntity.ok("Thêm sản phẩm thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<String> capNhatSanPham(@RequestBody SanPhamRequest request) {
        try {
            sanPhamService.suaSanPham(request);
            return ResponseEntity.ok("Cập nhật sản phẩm thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{maSP}")
    public ResponseEntity<String> xoaSanPham(@PathVariable String maSP) {
        try {
            sanPhamService.xoaSanPham(maSP);
            return ResponseEntity.ok("Xóa sản phẩm thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}