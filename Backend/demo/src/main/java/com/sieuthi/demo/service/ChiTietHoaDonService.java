package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.response.ChiTietHoaDonResponse;

public interface ChiTietHoaDonService {
    List<ChiTietHoaDonResponse> layChiTietTheoMaHD(String maHD);
}
