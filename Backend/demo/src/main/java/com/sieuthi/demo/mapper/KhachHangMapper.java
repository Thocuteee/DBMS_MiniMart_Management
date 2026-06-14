package com.sieuthi.demo.mapper;

import com.sieuthi.demo.dto.request.KhachHangRequest;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import com.sieuthi.demo.model.KhachHang;
import org.springframework.stereotype.Component;

@Component
public class KhachHangMapper {
    public KhachHang toModel(KhachHangRequest request) {
        if (request == null) return null;
        return new KhachHang(
            request.getMaKH(), request.getUserName(), request.getPhone(),
            request.getDiemTichLuy() != null ? request.getDiemTichLuy() : 0
        );
    }
}