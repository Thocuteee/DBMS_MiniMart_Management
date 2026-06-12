package com.sieuthi.demo.dto.response;

import lombok.Data;

@Data
public class TonKhoResponse {
    private String maKho;
    private String tenKho;
    private String maSP;
    private String tenSP;
    private Integer soLuongTonKho;
}