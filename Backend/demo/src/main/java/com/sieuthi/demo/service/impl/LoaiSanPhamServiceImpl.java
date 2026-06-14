package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.LoaiSanPhamRequest;
import com.sieuthi.demo.dto.response.LoaiSanPhamResponse;
import com.sieuthi.demo.repository.LoaiSanPhamRepository;
import com.sieuthi.demo.service.LoaiSanPhamService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class LoaiSanPhamServiceImpl implements LoaiSanPhamService {
    private final LoaiSanPhamRepository loaiSanPhamRepository;

    public LoaiSanPhamServiceImpl(LoaiSanPhamRepository loaiSanPhamRepository) {
        this.loaiSanPhamRepository = loaiSanPhamRepository;
    }

    @Override
    public List<LoaiSanPhamResponse> layTatCaLoaiSP() {
        try {
            return loaiSanPhamRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi danh mục loại sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public void themLoaiSP(LoaiSanPhamRequest request) {
        try {
            loaiSanPhamRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi thêm loại sản phẩm: " + e.getMessage());
        }
    }
}