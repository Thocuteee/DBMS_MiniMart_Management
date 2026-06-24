package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import com.sieuthi.demo.dto.request.PhieuNhapRequest;
import com.sieuthi.demo.repository.PhieuNhapRepository;
import com.sieuthi.demo.service.PhieuNhapService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

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

    @Override
    public void taoPhieuNhap(PhieuNhapRequest request) {
        try {
            phieuNhapRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi tạo phiếu nhập hàng: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> xemChiTietPhieuNhap(String maPN) {
        try {
            return phieuNhapRepository.findChiTietByMaPN(maPN);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi xem chi tiết phiếu nhập: " + e.getMessage());
        }
    }
}