package com.sieuthi.demo.model;

public class LoaiSanPham {
    private String MaLoai;
    private String TenLoai;

    public LoaiSanPham() {}

    public LoaiSanPham(String maLoai, String tenLoai) {
        this.MaLoai = maLoai;
        this.TenLoai = tenLoai;
    }

    public String getMaLoai() {
        return MaLoai;
    }
    public String getTenLoai() {
        return TenLoai;
    }
    public void setTenLoai(String tenLoai) {
        this.TenLoai = tenLoai;
    }

    public void setMaLoai(String maLoai) {
        this.MaLoai = maLoai;
    }
}
