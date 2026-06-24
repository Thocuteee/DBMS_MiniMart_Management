package com.sieuthi.demo.dto.request;

import java.sql.Date;

public class ChiTietPhieuNhapRequest {
    private String maSP;
    private Integer soLuongNhap;
    private Double donGiaNhap;
    private Date hanSuDung;

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
    public Date getHanSuDung() {
        return hanSuDung;
    }
    public void setHanSuDung(Date hanSuDung) {
        this.hanSuDung = hanSuDung;
    }
}
