package com.sieuthi.demo.dto.request;

import lombok.Data;

@Data
public class KhachHangRequest { 
    private String maKH;
    private String userName;
    private String phone;
    private Integer diemTichLuy;
}