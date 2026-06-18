package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.response.NhanVienResponse;
import com.sieuthi.demo.service.NhanVienService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nhan-vien")
@CrossOrigin("*")
public class NhanVienController {

    private final NhanVienService nhanVienService;

    public NhanVienController(NhanVienService nhanVienService) {
        this.nhanVienService = nhanVienService;
    }

    @GetMapping
    public ResponseEntity<List<NhanVienResponse>> layTatCa() {
        return ResponseEntity.ok(nhanVienService.layTatCaNhanVien());
    }

    @PostMapping
    public ResponseEntity<String> themMoi(@RequestBody NhanVienRequest request) {
        try {
            nhanVienService.themNhanVien(request);
            return ResponseEntity.ok("Thêm nhân viên mới thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/cap-nhat")
    public ResponseEntity<String> capNhatNhanVien(@RequestBody com.sieuthi.demo.dto.request.NhanVienRequest request) {
        try {
            return ResponseEntity.ok("Cập nhật hồ sơ nhân viên thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}