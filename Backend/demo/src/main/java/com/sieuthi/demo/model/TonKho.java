package com.sieuthi.demo.model;

public class TonKho {
    private String maKho;
    private String maSP;
    private Integer soLuongTonKho;

    public TonKho() {}

    public TonKho(String maKho, String maSP, Integer soLuongTonKho) {
        this.maKho = maKho;
        this.maSP = maSP;
        this.soLuongTonKho = soLuongTonKho;
    }

    public String getMaKho() { 
        return maKho; 
    }
    public void setMaKho(String maKho) { 
        this.maKho = maKho; 
    }
    public String getMaSP() { 
        return maSP; 
    }
    public void setMaSP(String maSP) { 
        this.maSP = maSP; 
    }
    public Integer getSoLuongTonKho() { 
        return soLuongTonKho; 
    }
    public void setSoLuongTonKho(Integer soLuongTonKho) { 
        this.soLuongTonKho = soLuongTonKho; 
    }
}
