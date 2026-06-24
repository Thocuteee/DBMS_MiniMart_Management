package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.response.NhanVienResponse;
import com.sieuthi.demo.repository.NhanVienRepository;
import com.sieuthi.demo.service.NhanVienService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import java.sql.SQLException;
import java.util.List;

@Service
public class NhanVienServiceImpl implements NhanVienService {
    private final NhanVienRepository nhanVienRepository;

    public NhanVienServiceImpl(NhanVienRepository nhanVienRepository) {
        this.nhanVienRepository = nhanVienRepository;
    }

    @Override
    public List<NhanVienResponse> layTatCaNhanVien() {
        try {
            return nhanVienRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi lấy danh sách nhân viên: " + e.getMessage());
        }
    }

    @Override
    public void themNhanVien(NhanVienRequest request) {
        try {
            if (request.getMaNV() == null || request.getMaNV().trim().isEmpty()) {
                request.setMaNV(nhanVienRepository.generateNewMaNV());
            }
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                PasswordEncoder encoder = new BCryptPasswordEncoder();
                request.setPassword(encoder.encode(request.getPassword()));
            }
            nhanVienRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi thêm nhân viên: " + e.getMessage());
        }
    }

    @Override
    public void xoaNhanVien(String maNV) {
        try {
            nhanVienRepository.delete(maNV);
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("REFERENCE constraint")) {
                throw new RuntimeException("Không thể xóa: Nhân viên này đã có dữ liệu giao dịch (Hóa đơn/Phiếu nhập).");
            }
            throw new RuntimeException("Lỗi xóa nhân viên: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xóa nhân viên: " + e.getMessage());
        }
    }
}