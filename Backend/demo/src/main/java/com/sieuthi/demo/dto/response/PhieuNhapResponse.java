package com.sieuthi.demo.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PhieuNhapResponse {
    private String maPN;
    private LocalDateTime ngayNhap;
    private String nameNCC;
    private String tenNhanVienKho;
    private Double tongTienNhap;
}