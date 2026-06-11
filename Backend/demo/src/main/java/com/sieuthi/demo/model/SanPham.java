package com.sieuthi.demo.model;

public class SanPham {
    private String maSP;
    private String maVach;
    private String maLoai;
    private String tenSP;
    private String donVi;
    private Double giaBan;

    public SanPham() {}

    public SanPham(String maSP, String maVach, String maLoai, String tenSP, String donVi, Double giaBan) {
        this.maSP = maSP;
        this.maVach = maVach;
        this.maLoai = maLoai;
        this.tenSP = tenSP;
        this.donVi = donVi;
        this.giaBan = giaBan;
    }

    public String getMaSP() { 
        return maSP; 
    }
    public void setMaSP(String maSP) { 
        this.maSP = maSP; 
    }

    public String getMaVach() { 
        return maVach; 
    }
    public void setMaVach(String maVach) { 
        this.maVach = maVach; 
    }

    public String getMaLoai() { 
        return maLoai; 
    }
    public void setMaLoai(String maLoai) { 
        this.maLoai = maLoai; }

    public String getTenSP() { 
        return tenSP; 
    }
    public void setTenSP(String tenSP) { 
        this.tenSP = tenSP; 
    }

    public String getDonVi() { 
        return donVi; 
    }
    public void setDonVi(String donVi) { 
        this.donVi = donVi; 
    }

    public Double getGiaBan() { 
        return giaBan; 
    }
    public void setGiaBan(Double giaBan) { 
        this.giaBan = giaBan; 
    }
    
}
