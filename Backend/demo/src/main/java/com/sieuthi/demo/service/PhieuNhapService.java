package com.sieuthi.demo.service;

import java.util.List;
import java.util.Map;

import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import com.sieuthi.demo.dto.request.PhieuNhapRequest;

public interface PhieuNhapService {
    List<PhieuNhapResponse> layDanhSachPhieuNhap();
    void taoPhieuNhap(PhieuNhapRequest request);
    List<Map<String, Object>> xemChiTietPhieuNhap(String maPN);
}
