package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.request.NhaCungCapRequest;
import com.sieuthi.demo.dto.response.NhaCungCapResponse;

public interface NhaCungCapService {
    List<NhaCungCapResponse> layTatCaNCC();
    void themNhaCungCap(NhaCungCapRequest request);
    void suaNhaCungCap(NhaCungCapRequest request);
    void xoaNhaCungCap(String maNCC);
}
