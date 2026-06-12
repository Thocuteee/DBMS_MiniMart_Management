package com.sieuthi.demo.dto.request;

import lombok.Data;

@Data
public class TonKhoRequest {
    private String maKho;
    private String maSP;
    private Integer soLuongTonKho;
}