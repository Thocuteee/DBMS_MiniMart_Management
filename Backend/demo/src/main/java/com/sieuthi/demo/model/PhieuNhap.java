package com.sieuthi.demo.model;

import java.time.LocalDateTime;

public class PhieuNhap {
    private String maPN;
    private LocalDateTime ngayNhap;
    private String maNV;
    private String maNCC;
    private Double tongTienNhap;

    public PhieuNhap() {}

    public PhieuNhap(String maPN, LocalDateTime ngayNhap, String maNV, String maNCC, Double tongTienNhap) {
        this.maPN = maPN;
        this.ngayNhap = ngayNhap;
        this.maNV = maNV;
        this.maNCC = maNCC;
        this.tongTienNhap = tongTienNhap;
    }

    public String getMaPN() { 
        return maPN; 
    }
    public void setMaPN(String maPN) { 
        this.maPN = maPN; 
    }
    public LocalDateTime getNgayNhap() { 
        return ngayNhap; 
    }
    public void setNgayNhap(LocalDateTime ngayNhap) { 
        this.ngayNhap = ngayNhap; 
    }
    public String getMaNV() { 
        return maNV; 
    }
    public void setMaNV(String maNV) { 
        this.maNV = maNV; 
    }
    public String getMaNCC() { 
        return maNCC; 
    }
    public void setMaNCC(String maNCC) { 
        this.maNCC = maNCC; 
    }
    public Double getTongTienNhap() { 
        return tongTienNhap; 
    }
    public void setTongTienNhap(Double tongTienNhap) { 
        this.tongTienNhap = tongTienNhap; 
    }
}
