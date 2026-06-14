package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.repository.BanHangRepository;
import com.sieuthi.demo.service.BanHangService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;

@Service
public class BanHangServiceImpl implements BanHangService {
    private final BanHangRepository banHangRepository;

    public BanHangServiceImpl(BanHangRepository banHangRepository) {
        this.banHangRepository = banHangRepository;
    }

    @Override
    public void thanhToanDonHang(String maHD, String maNV, String maKH, String maKho, String maSP, int soLuong, double donGia) {
        try {
            banHangRepository.GiaoTacBanHang(maHD, maNV, maKH, maKho, maSP, soLuong, donGia);
        } catch (SQLException e) {
            throw new RuntimeException("Giao tác POS thất bại: " + e.getMessage());
        }
    }
}
