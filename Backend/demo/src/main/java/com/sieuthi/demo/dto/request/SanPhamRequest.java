package com.sieuthi.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamRequest {
    private String maSP;
    private String maVach;
    private String maLoai;
    private String tenSP;
    private String donVi;
    private Double giaBan;
    private String hinhAnh;
}