package com.sieuthi.demo.dto.response;

import lombok.Data;

@Data
public class NhanVienResponse {
    private String maNV;
    private String hoTen;
    private String phone;
    private String role;
    private String userName;
    private Boolean status;
}