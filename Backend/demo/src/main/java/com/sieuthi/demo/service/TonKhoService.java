package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.response.TonKhoResponse;
import com.sieuthi.demo.dto.request.DieuChuyenRequest;

public interface TonKhoService {
    List<TonKhoResponse> xemTonKhoTheoKho(String maKho);
    List<TonKhoResponse> layTatCaTonKho();
    void dieuChuyen(DieuChuyenRequest req);
}
