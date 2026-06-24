package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.HoaDonRequest;
import com.sieuthi.demo.dto.response.HoaDonResponse;
import com.sieuthi.demo.repository.HoaDonRepository;
import com.sieuthi.demo.service.HoaDonService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class HoaDonServiceImpl implements HoaDonService {
    private final HoaDonRepository hoaDonRepository;

    public HoaDonServiceImpl(HoaDonRepository hoaDonRepository) {
        this.hoaDonRepository = hoaDonRepository;
    }

    @Override
    public List<HoaDonResponse> layLichSuHoaDon() {
        try {
            List<HoaDonResponse> list = hoaDonRepository.findAll();
            for (HoaDonResponse hd : list) {
                hd.setChiTietList(hoaDonRepository.findChiTietByMaHD(hd.getMaHD()));
            }
            return list;
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi kết xuất lịch sử hóa đơn: " + e.getMessage());
        }
    }

    @Override
    public void taoHoaDon(HoaDonRequest request, String maNV) {
        try {
            hoaDonRepository.save(request, maNV);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi tạo hóa đơn: " + e.getMessage());
        }
    }
}