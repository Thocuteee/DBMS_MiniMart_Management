package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.KhachHangRequest;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import com.sieuthi.demo.repository.KhachHangRepository;
import com.sieuthi.demo.service.KhachHangService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;

@Service
public class KhachHangServiceImpl implements KhachHangService {
    private final KhachHangRepository khachHangRepository;

    public KhachHangServiceImpl(KhachHangRepository khachHangRepository) {
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public KhachHangResponse timKhachHangTheoPhone(String phone) {
        try {
            return khachHangRepository.findByPhone(phone);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi truy vấn khách hàng: " + e.getMessage());
        }
    }

    @Override
    public void themKhachHang(KhachHangRequest request) {
        try {
            khachHangRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi đăng ký khách hàng: " + e.getMessage());
        }
    }
}