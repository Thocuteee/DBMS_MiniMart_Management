package com.sieuthi.demo.dto.request;

import lombok.Data;

@Data
public class NhanVienRequest {
    private String maNV;
    private String hoTen;
    private String phone;
    private String role;
    private String userName;
    private String password;
    private Boolean status;
}