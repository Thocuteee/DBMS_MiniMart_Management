package com.sieuthi.demo.model;

public class NhaCungCap {
    private String maNCC;
    private String nameNCC;
    private String phone;
    private String address;

    public NhaCungCap() {}
    public NhaCungCap(String maNCC, String nameNCC, String phone, String address) {
        this.maNCC = maNCC;
        this.nameNCC = nameNCC;
        this.phone = phone;
        this.address = address;
    }

    public String getMaNCC() { 
        return maNCC; 
    }
    public void setMaNCC(String maNCC) { 
        this.maNCC = maNCC; 
    }
    public String getNameNCC() { 
        return nameNCC; 
    }
    public void setNameNCC(String nameNCC) {
        this.nameNCC = nameNCC; 
    }
    public String getPhone() {
        return phone; 
    }
    public void setPhone(String phone) {
        this.phone = phone; 
    }
    public String getAddress() {
        return address; 
    }
    public void setAddress(String address) {
        this.address = address;   
    }
}
