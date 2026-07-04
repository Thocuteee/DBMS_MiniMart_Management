package com.sieuthi.demo.dto.request;

import lombok.Data;

@Data
public class DieuChuyenRequest {
    private String maSP;
    private Integer soLuongChuyen;
    private String maKhoNguon;
    private String maKhoDich;
}
