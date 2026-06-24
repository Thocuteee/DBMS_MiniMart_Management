package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.response.HoaDonResponse;

import com.sieuthi.demo.dto.request.HoaDonRequest;

public interface HoaDonService {
    List<HoaDonResponse> layLichSuHoaDon();
    void taoHoaDon(HoaDonRequest request, String maNV);
}
