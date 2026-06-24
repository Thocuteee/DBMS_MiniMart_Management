package com.sieuthi.demo.dto.request;

import java.util.List;

public class HoaDonRequest {
    private String maHD;
    private String maKH;
    private double giamGia;
    private List<ChiTietHoaDonRequest> chiTietList;

    public HoaDonRequest() {}

    public String getMaHD() { return maHD; }
    public void setMaHD(String maHD) { this.maHD = maHD; }

    public String getMaKH() { return maKH; }
    public void setMaKH(String maKH) { this.maKH = maKH; }

    public double getGiamGia() { return giamGia; }
    public void setGiamGia(double giamGia) { this.giamGia = giamGia; }

    public List<ChiTietHoaDonRequest> getChiTietList() { return chiTietList; }
    public void setChiTietList(List<ChiTietHoaDonRequest> chiTietList) { this.chiTietList = chiTietList; }
}
