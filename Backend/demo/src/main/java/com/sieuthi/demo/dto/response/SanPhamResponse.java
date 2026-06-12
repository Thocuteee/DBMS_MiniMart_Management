package com.sieuthi.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamResponse {
    private String maSP;
    private String maVach;
    private String tenSP;
    private String donVi;
    private Double giaBan;
    private String maLoai;
    private String tenLoai;
}
