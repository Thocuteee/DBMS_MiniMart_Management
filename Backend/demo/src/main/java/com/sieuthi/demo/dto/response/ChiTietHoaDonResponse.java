package com.sieuthi.demo.dto.response;

import lombok.Data;

@Data
public class ChiTietHoaDonResponse {
    private String maSP;
    private String tenSP;      
    private Integer soLuong;
    private Double donGiaBan;
    private Double thanhTien;
}