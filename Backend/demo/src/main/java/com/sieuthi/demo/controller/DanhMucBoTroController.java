package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.response.NhaCungCapResponse;
import com.sieuthi.demo.dto.response.LoaiSanPhamResponse;
import com.sieuthi.demo.dto.response.KhoResponse;
import com.sieuthi.demo.service.NhaCungCapService;
import com.sieuthi.demo.service.LoaiSanPhamService;
import com.sieuthi.demo.service.KhoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/danh-muc")
@CrossOrigin("*")
public class DanhMucBoTroController {

    private final NhaCungCapService nhaCungCapService;
    private final LoaiSanPhamService loaiSanPhamService;
    private final KhoService khoService;

    public DanhMucBoTroController(NhaCungCapService nhaCungCapService, LoaiSanPhamService loaiSanPhamService, KhoService khoService) {
        this.nhaCungCapService = nhaCungCapService;
        this.loaiSanPhamService = loaiSanPhamService;
        this.khoService = khoService;
    }

    @GetMapping("/nha-cung-cap")
    public ResponseEntity<List<NhaCungCapResponse>> layTatCaNCC() {
        return ResponseEntity.ok(nhaCungCapService.layTatCaNCC());
    }

    @GetMapping("/loai-san-pham")
    public ResponseEntity<List<LoaiSanPhamResponse>> layTatCaLoai() {
        return ResponseEntity.ok(loaiSanPhamService.layTatCaLoaiSP());
    }

    @GetMapping("/kho-hang")
    public ResponseEntity<List<KhoResponse>> layTatCaKho() {
        return ResponseEntity.ok(khoService.layTatCaKho());
    }
}