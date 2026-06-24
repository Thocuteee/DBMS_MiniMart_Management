package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.KhachHangRequest;
import com.sieuthi.demo.dto.response.KhachHangResponse;
import com.sieuthi.demo.mapper.KhachHangMapper;
import com.sieuthi.demo.repository.KhachHangRepository;
import com.sieuthi.demo.service.KhachHangService;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

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
            if (request.getMaKH() == null || request.getMaKH().trim().isEmpty()) {
                request.setMaKH(khachHangRepository.generateNewMaKH());
            }
            khachHangRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi đăng ký khách hàng: " + e.getMessage());
        }
    }

    @Override
    public List<KhachHangResponse> layTatCaKhachHang() {
        try {
            return khachHangRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi truy vấn khách hàng: " + e.getMessage());
        }
    }

    public void xoaKhachHang(String maKH) {
        try {
            khachHangRepository.delete(maKH);
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("REFERENCE constraint")) {
                throw new RuntimeException("Không thể xóa: Khách hàng này đã có dữ liệu giao dịch (Hóa đơn).");
            }
            throw new RuntimeException("Lỗi xóa khách hàng: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xóa khách hàng: " + e.getMessage());
        }
    }
}