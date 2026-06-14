package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.response.TonKhoResponse;
import com.sieuthi.demo.repository.TonKhoRepository;
import com.sieuthi.demo.service.TonKhoService;
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
}