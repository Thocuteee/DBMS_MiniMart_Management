package com.sieuthi.demo.model;

public class ChiTietPhieuNhap {
    private String maPN;
    private String maSP;
    private Integer soLuongNhap;
    private Double donGiaNhap;
    private Double thanhTienNhap;

    public ChiTietPhieuNhap() {}

    public ChiTietPhieuNhap(String maPN, String maSP, Integer soLuongNhap, Double donGiaNhap, Double thanhTienNhap) {
        this.maPN = maPN;
        this.maSP = maSP;
        this.soLuongNhap = soLuongNhap;
        this.donGiaNhap = donGiaNhap;
        this.thanhTienNhap = thanhTienNhap;
    }

    public String getMaPN() { 
        return maPN; 
    }
    public void setMaPN(String maPN) { 
        this.maPN = maPN; 
    }
    public String getMaSP() { 
        return maSP; 
    }
    public void setMaSP(String maSP) { 
        this.maSP = maSP; 
    }
    public Integer getSoLuongNhap() { 
        return soLuongNhap; 
    }
    public void setSoLuongNhap(Integer soLuongNhap) { 
        this.soLuongNhap = soLuongNhap; 
    }
    public Double getDonGiaNhap() { 
        return donGiaNhap; 
    }
    public void setDonGiaNhap(Double donGiaNhap) { 
        this.donGiaNhap = donGiaNhap; 
    }
    public Double getThanhTienNhap() { 
        return thanhTienNhap; 
    }
    public void setThanhTienNhap(Double thanhTienNhap) { 
        this.thanhTienNhap = thanhTienNhap; 
    }
}
