package com.sieuthi.demo.model;

public class NhanVien {
    private String maNV;
    private String hoTen;
    private String phone;
    private String role;
    private String userName;
    private String password;
    private String status;

    public NhanVien() {}

    public NhanVien(String maNV, String hoTen, String phone, String role, String userName, String password, String status) {
        this.maNV = maNV;
        this.hoTen = hoTen;
        this.phone = phone;
        this.role = role;
        this.userName = userName;
        this.password = password;
        this.status = status;
    }

    public String getMaNV() { 
        return maNV; 
    }
    public void setMaNV(String maNV) { 
        this.maNV = maNV; 
    }
    public String getHoTen() { 
        return hoTen; 
    }
    public void setHoTen(String hoTen) { 
        this.hoTen = hoTen; 
    }
    public String getPhone() { 
        return phone; 
    }
    public void setPhone(String phone) { 
        this.phone = phone; 
    }
    public String getRole() { 
        return role; 
    }
    public void setRole(String role) { 
        this.role = role; 
    }
    public String getUserName() { 
        return userName; 
    }
    public void setUserName(String userName) { 
        this.userName = userName; 
    }
    public String getPassword() { 
        return password; 
    }
    public void setPassword(String password) { 
        this.password = password; 
    }
    public String getStatus() { 
        return status; 
    }
    public void setStatus(String status) { 
        this.status = status; 
    }
    
}
