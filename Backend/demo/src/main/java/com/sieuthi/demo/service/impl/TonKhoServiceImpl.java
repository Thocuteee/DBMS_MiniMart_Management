package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.response.TonKhoResponse;
import com.sieuthi.demo.repository.TonKhoRepository;
import com.sieuthi.demo.service.TonKhoService;
import com.sieuthi.demo.dto.request.DieuChuyenRequest;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class TonKhoServiceImpl implements TonKhoService {
    private final TonKhoRepository tonKhoRepository;

    public TonKhoServiceImpl(TonKhoRepository tonKhoRepository) {
        this.tonKhoRepository = tonKhoRepository;
    }

    @Override
    public List<TonKhoResponse> xemTonKhoTheoKho(String maKho) {
        try {
            return tonKhoRepository.findByKho(maKho);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi truy vấn tồn kho kệ: " + e.getMessage());
        }
    }

    @Override
    public List<TonKhoResponse> layTatCaTonKho() {
        try {
            return tonKhoRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi truy vấn toàn bộ tồn kho: " + e.getMessage());
        }
    }

    @Override
    public void dieuChuyen(DieuChuyenRequest req) {
        try {
            tonKhoRepository.dieuChuyen(req.getMaSP(), req.getSoLuongChuyen(), req.getMaKhoNguon(), req.getMaKhoDich());
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}