package com.sieuthi.demo.service;

import java.util.List;

import com.sieuthi.demo.dto.request.KhoRequest;
import com.sieuthi.demo.dto.response.KhoResponse;

public interface KhoService {
    List<KhoResponse> layTatCaKho();
    void themKho(KhoRequest request);
}
