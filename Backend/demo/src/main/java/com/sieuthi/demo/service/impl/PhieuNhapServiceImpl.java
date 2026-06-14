package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import com.sieuthi.demo.repository.PhieuNhapRepository;
import com.sieuthi.demo.service.PhieuNhapService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class PhieuNhapServiceImpl implements PhieuNhapService {
    private final PhieuNhapRepository phieuNhapRepository;

    public PhieuNhapServiceImpl(PhieuNhapRepository phieuNhapRepository) {
        this.phieuNhapRepository = phieuNhapRepository;
    }

    @Override
    public List<PhieuNhapResponse> layDanhSachPhieuNhap() {
        try {
            return phieuNhapRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi kết xuất danh sách lô hàng nhập: " + e.getMessage());
        }
    }
}