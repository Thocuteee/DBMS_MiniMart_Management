package com.sieuthi.demo.dto.request;

import java.util.List;

public class PhieuNhapRequest {
    private String maPN;
    private String maNCC;
    private List<ChiTietPhieuNhapRequest> chiTietList;

    public String getMaPN() {
        return maPN;
    }
    public void setMaPN(String maPN) {
        this.maPN = maPN;
    }
    public String getMaNCC() {
        return maNCC;
    }
    public void setMaNCC(String maNCC) {
        this.maNCC = maNCC;
    }
    public List<ChiTietPhieuNhapRequest> getChiTietList() {
        return chiTietList;
    }
    public void setChiTietList(List<ChiTietPhieuNhapRequest> chiTietList) {
        this.chiTietList = chiTietList;
    }
}
