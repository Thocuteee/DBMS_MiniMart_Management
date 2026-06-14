package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.request.NhanVienRequest;
import com.sieuthi.demo.dto.response.NhanVienResponse;

public interface NhanVienService {
    List<NhanVienResponse> layTatCaNhanVien();
    void themNhanVien(NhanVienRequest request);
}
