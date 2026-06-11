package com.sieuthi.demo.model;

import java.time.LocalDateTime;

public class PhieuNhap {
    private String maPN;
    private LocalDateTime ngayNhap;
    private String maNV;
    private String nhaCungCap;
    private Double tongTienNhap;

    public PhieuNhap() {}

    public PhieuNhap(String maPN, LocalDateTime ngayNhap, String maNV, String nhaCungCap, Double tongTienNhap) {
        this.maPN = maPN;
        this.ngayNhap = ngayNhap;
        this.maNV = maNV;
        this.nhaCungCap = nhaCungCap;
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
    public String getNhaCungCap() { 
        return nhaCungCap; 
    }
    public void setNhaCungCap(String nhaCungCap) { 
        this.nhaCungCap = nhaCungCap; 
    }
    public Double getTongTienNhap() { 
        return tongTienNhap; 
    }
    public void setTongTienNhap(Double tongTienNhap) { 
        this.tongTienNhap = tongTienNhap; 
    }
}
