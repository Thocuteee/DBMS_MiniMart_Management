package com.sieuthi.demo.mapper;

import com.sieuthi.demo.dto.request.SanPhamRequest;
import com.sieuthi.demo.dto.response.SanPhamResponse;
import com.sieuthi.demo.model.SanPham;
import org.springframework.stereotype.Component;

@Component
public class SanPhamMapper {
    public SanPham toModel(SanPhamRequest request) {
        if (request == null) return null;
        return new SanPham(
            request.getMaSP(), request.getMaVach(), request.getMaLoai(),
            request.getTenSP(), request.getDonVi(), request.getGiaBan()
        );
    }
}