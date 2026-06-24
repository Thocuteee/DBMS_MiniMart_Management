package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.request.SanPhamRequest;
import com.sieuthi.demo.dto.response.SanPhamResponse;
import com.sieuthi.demo.repository.SanPhamRepository;
import com.sieuthi.demo.service.SanPhamService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class SanPhamServiceImpl implements SanPhamService {
    private final SanPhamRepository sanPhamRepository;

    public SanPhamServiceImpl(SanPhamRepository sanPhamRepository) {
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    public List<SanPhamResponse> layTatCaSanPham() {
        try {
            return sanPhamRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi lấy danh sách sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public void themSanPham(SanPhamRequest request) {
        try {
            sanPhamRepository.save(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi thêm sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public void suaSanPham(SanPhamRequest request) {
        try {
            sanPhamRepository.update(request);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi sửa sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public void xoaSanPham(String maSP) {
        try {
            sanPhamRepository.delete(maSP);
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi xóa sản phẩm: " + e.getMessage());
        }
    }
}