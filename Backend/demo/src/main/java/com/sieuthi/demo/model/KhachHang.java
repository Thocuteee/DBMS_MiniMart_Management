package com.sieuthi.demo.model;

public class KhachHang {
    private String maKH;
    private String userName;
    private String phone;
    private Integer diemTichLuy;

    public KhachHang() {}

    public KhachHang(String maKH, String userName, String phone, Integer diemTichLuy) {
        this.maKH = maKH;
        this.userName = userName;
        this.phone = phone;
        this.diemTichLuy = diemTichLuy;
    }

    public String getMaKH() { 
        return maKH; 
    }
    public void setMaKH(String maKH) { 
        this.maKH = maKH; 
    }
    public String getUserName() { 
        return userName; 
    }
    public void setUserName(String userName) { 
        this.userName = userName; 
    }
    public String getPhone() { 
        return phone; 
    }
    public void setPhone(String phone) { 
        this.phone = phone; 
    }
    public Integer getDiemTichLuy() { 
        return diemTichLuy; 
    }
    public void setDiemTichLuy(Integer diemTichLuy) { 
        this.diemTichLuy = diemTichLuy; 
    } 
    
}
