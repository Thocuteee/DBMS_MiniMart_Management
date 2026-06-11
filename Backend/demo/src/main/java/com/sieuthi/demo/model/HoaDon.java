package com.sieuthi.demo.model;

import java.time.LocalDateTime;

public class HoaDon {
    private String maHD;
    private LocalDateTime ngayLap;
    private String maNV;
    private String maKH;
    private Double tongTien;
    private Double giamGia;
    private Double thanhTien;

    public HoaDon() {}

    public HoaDon(String maHD, LocalDateTime ngayLap, String maNV, String maKH, Double tongTien, Double giamGia, Double thanhTien) {
        this.maHD = maHD;
        this.ngayLap = ngayLap;
        this.maNV = maNV;
        this.maKH = maKH;
        this.tongTien = tongTien;
        this.giamGia = giamGia;
        this.thanhTien = thanhTien;
    }

    public String getMaHD() { 
        return maHD; 
    }
    public void setMaHD(String maHD) { 
        this.maHD = maHD; 
    }
    public LocalDateTime getNgayLap() { 
        return ngayLap; 
    }
    public void setNgayLap(LocalDateTime ngayLap) { 
        this.ngayLap = ngayLap; 
    }
    public String getMaNV() { 
        return maNV; 
    }
    public void setMaNV(String maNV) { 
        this.maNV = maNV; 
    }
    public String getMaKH() { 
        return maKH; 
    }
    public void setMaKH(String maKH) { 
        this.maKH = maKH; 
    }
    public Double getTongTien() { 
        return tongTien; 
    }
    public void setTongTien(Double tongTien) { 
        this.tongTien = tongTien; 
    }
    public Double getGiamGia() { 
        return giamGia; 
    }
    public void setGiamGia(Double giamGia) { 
        this.giamGia = giamGia; 
    }
    public Double getThanhTien() { 
        return thanhTien; 
    }
    public void setThanhTien(Double thanhTien) { 
        this.thanhTien = thanhTien; 
    }
}
