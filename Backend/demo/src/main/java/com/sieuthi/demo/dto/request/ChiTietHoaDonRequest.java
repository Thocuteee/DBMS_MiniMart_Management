package com.sieuthi.demo.dto.request;

public class ChiTietHoaDonRequest {
    private String maSP;
    private int soLuong;
    private double donGiaBan;

    public ChiTietHoaDonRequest() {}

    public String getMaSP() { return maSP; }
    public void setMaSP(String maSP) { this.maSP = maSP; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public double getDonGiaBan() { return donGiaBan; }
    public void setDonGiaBan(double donGiaBan) { this.donGiaBan = donGiaBan; }
}
