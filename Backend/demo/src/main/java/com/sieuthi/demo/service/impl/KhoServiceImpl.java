package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.KhoRequest;
import com.sieuthi.demo.dto.response.KhoResponse;
import com.sieuthi.demo.repository.KhoRepository;
import com.sieuthi.demo.service.KhoService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class KhoServiceImpl implements KhoService {
    private final KhoRepository khoRepository;

    public KhoServiceImpl(KhoRepository khoRepository) {
        this.khoRepository = khoRepository;
    }

    @Override
    public List<KhoResponse> layTatCaKho() {
        try {
            return khoRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi đọc cấu trúc danh mục kho: " + e.getMessage());
        }
    }

    @Override
    public void themKho(KhoRequest request) {
        try {
            khoRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi thêm cấu trúc kho mới: " + e.getMessage());
        }
    }
}