package com.sieuthi.demo.service;

import java.util.List;
import com.sieuthi.demo.dto.response.PhieuNhapResponse;
import com.sieuthi.demo.dto.request.PhieuNhapRequest;

public interface PhieuNhapService {
    List<PhieuNhapResponse> layDanhSachPhieuNhap();
    void taoPhieuNhap(PhieuNhapRequest request);
}
