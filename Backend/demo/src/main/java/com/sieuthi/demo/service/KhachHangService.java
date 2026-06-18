package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.request.KhachHangRequest;
import com.sieuthi.demo.dto.response.KhachHangResponse;

public interface KhachHangService {
    KhachHangResponse timKhachHangTheoPhone(String phone);
    void themKhachHang(KhachHangRequest request);
    List<KhachHangResponse> layTatCaKhachHang();
}
