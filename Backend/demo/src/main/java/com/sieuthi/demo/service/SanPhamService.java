package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.request.SanPhamRequest;
import com.sieuthi.demo.dto.response.SanPhamResponse;

public interface SanPhamService {
    List<SanPhamResponse> layTatCaSanPham();
    void themSanPham(SanPhamRequest request);
}
