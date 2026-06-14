package com.sieuthi.demo.dto.request;

import lombok.Data;

@Data
public class ThanhToanRequest {
    private String maHD;
    private String maNV;
    private String maKH;
    private String maKho;
    private String maSP;
    private int soLuong;
    private double donGia;
}
