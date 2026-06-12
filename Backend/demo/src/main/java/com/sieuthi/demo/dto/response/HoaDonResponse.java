package com.sieuthi.demo.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HoaDonResponse {
    private String maHD;
    private LocalDateTime ngayLap;
    private String tenNhanVien;  
    private String tenKhachHang; 
    private Double tongTien;
    private Double giamGia;
    private Double thanhTien;
}