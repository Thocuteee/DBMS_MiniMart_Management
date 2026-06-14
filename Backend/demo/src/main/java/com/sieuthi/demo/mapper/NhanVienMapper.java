package com.sieuthi.demo.mapper;

import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.response.NhanVienResponse;
import com.sieuthi.demo.model.NhanVien;
import org.springframework.stereotype.Component;

@Component
public class NhanVienMapper {
    public NhanVien toModel(NhanVienRequest request) {
        if (request == null) return null;
        return new NhanVien(
            request.getMaNV(), request.getHoTen(), request.getPhone(),
            request.getRole(), request.getUserName(), request.getPassword(),
            request.getStatus() != null ? String.valueOf(request.getStatus()) : "1"
        );
    }
}