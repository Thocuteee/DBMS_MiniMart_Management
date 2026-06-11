package com.sieuthi.demo.model;

public class ChiTietHoaDon {
    private String maHD;
    private String maSP;
    private Integer soLuong;
    private Double donGiaBan;
    private Double thanhTien;

    public ChiTietHoaDon() {}

    public ChiTietHoaDon(String maHD, String maSP, Integer soLuong, Double donGiaBan, Double thanhTien) {
        this.maHD = maHD;
        this.maSP = maSP;
        this.soLuong = soLuong;
        this.donGiaBan = donGiaBan;
        this.thanhTien = thanhTien;
    }

    public String getMaHD() { 
        return maHD; 
    }
    public void setMaHD(String maHD) { 
        this.maHD = maHD; 
    }
    public String getMaSP() { 
        return maSP; 
    }
    public void setMaSP(String maSP) { 
        this.maSP = maSP; 
    }
    public Integer getSoLuong() { 
        return soLuong; 
    }
    public void setSoLuong(Integer soLuong) { 
        this.soLuong = soLuong; 
    }
    public Double getDonGiaBan() { 
        return donGiaBan; 
    }
    public void setDonGiaBan(Double donGiaBan) { 
        this.donGiaBan = donGiaBan; 
    }
    public Double getThanhTien() { 
        return thanhTien; 
    }
    public void setThanhTien(Double thanhTien) { 
        this.thanhTien = thanhTien; 
    }
}
