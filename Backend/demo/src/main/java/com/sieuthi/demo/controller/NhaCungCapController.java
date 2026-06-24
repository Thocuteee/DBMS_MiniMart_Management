package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.request.NhaCungCapRequest;
import com.sieuthi.demo.dto.response.NhaCungCapResponse;
import com.sieuthi.demo.service.NhaCungCapService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nha-cung-cap")
public class NhaCungCapController {
    private final NhaCungCapService nhaCungCapService;

    public NhaCungCapController(NhaCungCapService nhaCungCapService) {
        this.nhaCungCapService = nhaCungCapService;
    }

    @GetMapping
    public ResponseEntity<List<NhaCungCapResponse>> layTatCa() {
        return ResponseEntity.ok(nhaCungCapService.layTatCaNCC());
    }

    @PostMapping
    public ResponseEntity<String> themMoi(@RequestBody NhaCungCapRequest request) {
        try {
            nhaCungCapService.themNhaCungCap(request);
            return ResponseEntity.ok("Thêm nhà cung cấp thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<String> capNhat(@RequestBody NhaCungCapRequest request) {
        try {
            nhaCungCapService.suaNhaCungCap(request);
            return ResponseEntity.ok("Cập nhật nhà cung cấp thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{maNCC}")
    public ResponseEntity<String> xoa(@PathVariable String maNCC) {
        try {
            nhaCungCapService.xoaNhaCungCap(maNCC);
            return ResponseEntity.ok("Xóa nhà cung cấp thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
