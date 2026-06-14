package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.request.LoaiSanPhamRequest;
import com.sieuthi.demo.dto.response.LoaiSanPhamResponse;

public interface LoaiSanPhamService {
    List<LoaiSanPhamResponse> layTatCaLoaiSP();
    void themLoaiSP(LoaiSanPhamRequest request);
}
