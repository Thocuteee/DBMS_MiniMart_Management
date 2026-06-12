package com.sieuthi.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietPhieuNhapResponse {
    private String maSP;
    private String tenSP; 
    private int soLuongNhap;
    private double donGiaNhap;
    private double thanhTienNhap; 
    private LocalDate hanSuDung; 
}