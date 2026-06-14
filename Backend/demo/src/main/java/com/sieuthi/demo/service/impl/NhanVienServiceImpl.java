package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.response.NhanVienResponse;
import com.sieuthi.demo.repository.NhanVienRepository;
import com.sieuthi.demo.service.NhanVienService;
import org.springframework.stereotype.Service;
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
            nhanVienRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi thêm mới nhân viên: " + e.getMessage());
        }
    }
}