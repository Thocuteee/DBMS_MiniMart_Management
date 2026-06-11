package com.sieuthi.demo.model;

public class Kho {
    private String maKho;
    private String tenKho;
    private String diaChi;

    public Kho() {}

    public Kho(String maKho, String tenKho, String diaChi) {
        this.maKho = maKho;
        this.tenKho = tenKho;
        this.diaChi = diaChi;
    }

    public String getMaKho() { 
        return maKho; 
    }
    public void setMaKho(String maKho) { 
        this.maKho = maKho; 
    }
    public String getTenKho() { 
        return tenKho; 
    }
    public void setTenKho(String tenKho) { 
        this.tenKho = tenKho; 
    }
    public String getDiaChi() { 
        return diaChi; 
    }
    public void setDiaChi(String diaChi) { 
        this.diaChi = diaChi; 
    }
}
