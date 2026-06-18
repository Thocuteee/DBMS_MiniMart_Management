package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.response.TonKhoResponse;

public interface TonKhoService {
    List<TonKhoResponse> xemTonKhoTheoKho(String maKho);
    List<TonKhoResponse> layTatCaTonKho();
}
