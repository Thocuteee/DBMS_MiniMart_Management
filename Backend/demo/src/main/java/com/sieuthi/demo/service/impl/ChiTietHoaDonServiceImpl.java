package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.response.ChiTietHoaDonResponse;
import com.sieuthi.demo.repository.ChiTietHoaDonRepository;
import com.sieuthi.demo.service.ChiTietHoaDonService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class ChiTietHoaDonServiceImpl implements ChiTietHoaDonService {
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    public ChiTietHoaDonServiceImpl(ChiTietHoaDonRepository chiTietHoaDonRepository) {
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
    }

    @Override
    public List<ChiTietHoaDonResponse> layChiTietTheoMaHD(String maHD) {
        try {
            return chiTietHoaDonRepository.findByMaHD(maHD);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi kết xuất chi tiết hóa đơn: " + e.getMessage());
        }
    }
}