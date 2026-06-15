USE master;
GO
-- Xóa kho cũ bị lỗi để làm lại từ đầu cho sạch
DROP DATABASE IF EXISTS QuanLySieuThiMini;
GO
CREATE DATABASE QuanLySieuThiMini;
GO
USE QuanLySieuThiMini;
GO

-- =======================================================
-- PHẦN 1: XÂY DỰNG NỀN MÓNG CÁC BẢNG 
-- =======================================================
CREATE TABLE KhachHang(
    MaKH varchar(10) PRIMARY KEY,
    UserName varchar(15),
    Phone varchar(10),
    DiemTichLuy int DEFAULT 0
);

CREATE TABLE NhanVien(
    MaNV varchar(10) PRIMARY KEY,
    HoTen nvarchar(50),
    Phone varchar(10),
    Role nvarchar(30),
    UserName varchar(30),
    Password varchar(255),
    Status bit DEFAULT 1
);

CREATE TABLE LoaiSanPham(
    MaLoai varchar(10) PRIMARY KEY,
    TenLoai nvarchar(50)
);

CREATE TABLE NhaCungCap(
    MaNCC varchar(10) PRIMARY KEY,
    NameNCC nvarchar(100),
    Phone varchar(10),
    Address nvarchar(255)
);

CREATE TABLE Kho(
    MaKho varchar(10) PRIMARY KEY,
    TenKho nvarchar(30),
    DiaChi nvarchar(100)
);

CREATE TABLE SanPham(
    MaSP varchar(10) PRIMARY KEY,
    MaVach varchar(20),
    MaLoai varchar(10) REFERENCES LoaiSanPham(MaLoai),
    TenSP nvarchar(100),
    DonVi nvarchar(20),
    GiaBan money
);

CREATE TABLE TonKho(
    MaKho varchar(10) REFERENCES Kho(MaKho),
    MaSP varchar(10) REFERENCES SanPham(MaSP),
    SoLuongTonKho int DEFAULT 0,
    PRIMARY KEY (MaKho, MaSP)
);

CREATE TABLE HoaDon(
    MaHD varchar(15) PRIMARY KEY,
    NgayLap datetime DEFAULT GETDATE(),
    MaNV varchar(10) REFERENCES NhanVien(MaNV),
    MaKH varchar(10) REFERENCES KhachHang(MaKH),
    TongTien money DEFAULT 0,
    GiamGia money DEFAULT 0,
    ThanhTien money,
    GhiChu nvarchar(255) -- Cột này dùng để đánh dấu nếu khách trả hàng
);

CREATE TABLE ChiTietHoaDon(
    MaHD varchar(15) REFERENCES HoaDon(MaHD),
    MaSP varchar(10) REFERENCES SanPham(MaSP),
    SoLuong int,
    DonGiaBan money,
    ThanhTien money,
    PRIMARY KEY (MaHD, MaSP)
);

CREATE TABLE PhieuNhap(
    MaPN varchar(15) PRIMARY KEY,
    NgayNhap datetime DEFAULT GETDATE(),
    MaNCC varchar(10) REFERENCES NhaCungCap(MaNCC),
    MaNV varchar(10) REFERENCES NhanVien(MaNV),
    TongTienNhap money DEFAULT 0
);

CREATE TABLE ChiTietPhieuNhap(
    MaPN varchar(15) REFERENCES PhieuNhap(MaPN),
    MaSP varchar(10) REFERENCES SanPham(MaSP),
    SoLuongNhap int,
    DonGiaNhap money,
    HanSuDung date,
    PRIMARY KEY (MaPN, MaSP)
);

CREATE TABLE PhieuDoiTra (
    MaPhieuDT varchar(15) PRIMARY KEY,
    MaHD varchar(15) REFERENCES HoaDon(MaHD),
    NgayDoiTra datetime DEFAULT GETDATE(),
    TongTienHoan money,
    LyDo nvarchar(255)
);
GO

-- =======================================================
-- PHẦN 2: ĐỔ DỮ LIỆU MẪU CỦA NHÓM VÀO KHO
-- =======================================================
INSERT INTO KhachHang (MaKH, UserName, Phone, DiemTichLuy) VALUES ('KH001', 'anh_tuan', '0934567890', 120), ('KH002', 'bao_ngoc', '0945678901', 50), ('KH003', 'khach_vl', '0000000000', 0);
INSERT INTO NhanVien (MaNV, HoTen, Phone, Role, UserName, Password, Status) VALUES ('NV001', N'Chềnh Hưng Thọ', '0901234567', 'Admin', 'admin', 'pass123', 1), ('NV002', N'Nguyễn Văn Thu', '0912345678', N'Thu ngân', 'thu_cashier', 'pass123', 1), ('NV003', N'Trần Văn Khoa', '0923456789', 'Kho', 'khoa_warehouse', 'pass123', 1);
INSERT INTO LoaiSanPham (MaLoai, TenLoai) VALUES ('L01', N'Sữa và các sản phẩm từ Sữa'), ('L02', N'Nước giải khát'), ('L03', N'Hóa mỹ phẩm & Tẩy rửa');
INSERT INTO NhaCungCap (MaNCC, NameNCC, Phone, Address) VALUES ('NCC01', N'Công ty Cổ phần Sữa Việt Nam (Vinamilk)', '0283915815', N'10 Tân Trào, Tân Phú, Quận 7, TP.HCM'), ('NCC02', N'Công ty TNHH Nước Giải Khát Suntory Pepsico', '0283821943', N'88 Đồng Khởi, Quận 1, TP.HCM'), ('NCC03', N'Tập đoàn Unilever Việt Nam', '0285413568', N'156 Nguyễn Lương Bằng, Quận 7, TP.HCM');
INSERT INTO Kho (MaKho, TenKho, DiaChi) VALUES ('K01', N'Kho tổng siêu thị', N'Khu vực tầng hầm B1'), ('K02', N'Quầy trưng bày POS', N'Khu vực tầng trệt');
INSERT INTO SanPham (MaSP, MaVach, MaLoai, TenSP, DonVi, GiaBan) VALUES ('SP001', '8934673123456', 'L01', N'Sữa tươi tiệt trùng Vinamilk ít đường 1L', N'Hộp', 32000), ('SP002', '8934588012134', 'L02', N'Nước ngọt Pepsi lon 320ml', 'Lon', 11000), ('SP003', '8934841901222', 'L02', N'Nước tăng lực Sting dâu chai 320ml', 'Chai', 10000), ('SP004', '8934637001452', 'L03', N'Dầu gội Clear mát lạnh bạc hà 630ml', 'Chai', 165000);
INSERT INTO TonKho (MaKho, MaSP, SoLuongTonKho) VALUES ('K01', 'SP001', 150), ('K01', 'SP002', 300), ('K01', 'SP003', 200), ('K01', 'SP004', 50), ('K02', 'SP001', 20), ('K02', 'SP002', 45), ('K02', 'SP003', 30), ('K02', 'SP004', 10);
INSERT INTO HoaDon (MaHD, NgayLap, MaNV, MaKH, TongTien, GiamGia, ThanhTien) VALUES ('HD2606010001', '2026-06-01T10:20:00', 'NV002', 'KH001', 97000, 5000, 92000), ('HD2606010002', '2026-06-01T11:45:00', 'NV002', 'KH003', 33000, 0, 33000);
INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong, DonGiaBan, ThanhTien) VALUES ('HD2606010001', 'SP001', 2, 32000, 64000), ('HD2606010001', 'SP002', 3, 11000, 33000), ('HD2606010002', 'SP002', 1, 11000, 11000), ('HD2606010002', 'SP003', 3, 10000, 30000);
INSERT INTO PhieuNhap (MaPN, NgayNhap, MaNCC, MaNV, TongTienNhap) VALUES ('PN260601001', '2026-06-01T08:30:00', 'NCC01', 'NV003', 4800000), ('PN260601002', '2026-06-01T09:15:00', 'NCC02', 'NV003', 2000000);
INSERT INTO ChiTietPhieuNhap (MaPN, MaSP, SoLuongNhap, DonGiaNhap, HanSuDung) VALUES ('PN260601001', 'SP001', 150, 27000, '2026-12-01'), ('PN260601002', 'SP002', 100, 9000, '2027-03-01'), ('PN260601002', 'SP003', 100, 8000, '2027-02-15');
GO

-- =======================================================
-- PHẦN 3: CÀI ĐẶT TÍNH NĂNG ACID (ĐỔI TRẢ HÀNG)
-- =======================================================

-- 1. Hàm tính điểm thu hồi
CREATE OR ALTER FUNCTION [dbo].[fn_TinhDiemThuHoi] (@TienHoan money)
RETURNS INT
AS
BEGIN
    RETURN CAST(@TienHoan / 100000 AS INT);
END;
GO

-- 2. View báo cáo nhật ký đổi trả
CREATE OR ALTER VIEW [dbo].[v_NhatKyDoiTra] AS
SELECT 
    pdt.MaPhieuDT,
    hd.MaHD,
    kh.UserName AS TenKhachHang,
    pdt.NgayDoiTra,
    pdt.TongTienHoan,
    pdt.LyDo
FROM [dbo].[PhieuDoiTra] pdt
JOIN [dbo].[HoaDon] hd ON pdt.MaHD = hd.MaHD
JOIN [dbo].[KhachHang] kh ON hd.MaKH = kh.MaKH;
GO

-- 3. Cò súng (Trigger) tự động cảnh báo hóa đơn
CREATE OR ALTER TRIGGER [dbo].[trg_SauKhiDoiTra]
ON [dbo].[PhieuDoiTra]
AFTER INSERT
AS
BEGIN
    UPDATE [dbo].[HoaDon]
    SET GhiChu = N'Hóa đơn này đã phát sinh hoàn trả hàng lỗi'
    FROM [dbo].[HoaDon] hd
    JOIN inserted i ON hd.MaHD = i.MaHD;
END;
GO

-- 4. Bộ não xử lý Giao dịch Đổi trả chuẩn ACID
CREATE OR ALTER PROCEDURE [dbo].[sp_GiaoTacTraHang]
    @MaPhieuDT varchar(15),
    @MaHD varchar(15),
    @MaSP varchar(10),
    @SoLuongTra int,
    @MaKho varchar(10),
    @LyDo nvarchar(255)
AS
BEGIN
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @SoLuongDaMua int;
        DECLARE @DonGiaBan money;
        DECLARE @MaKH varchar(10);

        SELECT @SoLuongDaMua = SoLuong, @DonGiaBan = DonGiaBan
        FROM [dbo].[ChiTietHoaDon]
        WHERE MaHD = @MaHD AND MaSP = @MaSP;

        SELECT @MaKH = MaKH FROM [dbo].[HoaDon] WHERE MaHD = @MaHD;

        IF @SoLuongDaMua IS NULL RAISERROR(N'Lỗi: Sản phẩm này không tồn tại trong hóa đơn!', 16, 1);
        IF @SoLuongTra > @SoLuongDaMua RAISERROR(N'Lỗi: Số lượng trả lớn hơn số lượng đã mua!', 16, 1);

        DECLARE @TienHoan money = @SoLuongTra * @DonGiaBan;
        DECLARE @DiemThuHoi int = dbo.fn_TinhDiemThuHoi(@TienHoan);
        DECLARE @DiemHienTai int;
        
        SELECT @DiemHienTai = DiemTichLuy FROM [dbo].[KhachHang] WHERE MaKH = @MaKH;
        IF @DiemHienTai < @DiemThuHoi SET @DiemThuHoi = @DiemHienTai;

        INSERT INTO [dbo].[PhieuDoiTra] (MaPhieuDT, MaHD, NgayDoiTra, TongTienHoan, LyDo)
        VALUES (@MaPhieuDT, @MaHD, GETDATE(), @TienHoan, @LyDo);

        UPDATE [dbo].[HoaDon] SET TongTien = TongTien - @TienHoan, ThanhTien = ThanhTien - @TienHoan WHERE MaHD = @MaHD;
        UPDATE [dbo].[KhachHang] SET DiemTichLuy = DiemTichLuy - @DiemThuHoi WHERE MaKH = @MaKH;
        UPDATE [dbo].[TonKho] SET SoLuongTonKho = SoLuongTonKho + @SoLuongTra WHERE MaSP = @MaSP AND MaKho = @MaKho;

        COMMIT TRANSACTION;
        PRINT N'Thành công: Đã xử lý hoàn tiền, thu hồi điểm và cất hàng vào kho!';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

SELECT * FROM SanPham

SELECT DiemTichLuy, UserName FROM KhachHang WHERE MaKH = 'KH001';
SELECT TongTien, GhiChu FROM HoaDon WHERE MaHD = 'HD2606010001';
SELECT SoLuongTonKho FROM TonKho WHERE MaSP = 'SP001' AND MaKho = 'K01';

EXEC sp_GiaoTacTraHang 
    @MaPhieuDT = 'DT001', 
    @MaHD = 'HD2606010001', 
    @MaSP = 'SP001', 
    @SoLuongTra = 1, 
    @MaKho = 'K01', 
    @LyDo = N'Khách chê hộp sữa bị móp';

    -- 1. Điểm của khách bị trừ đi (không còn 120 điểm nữa)
SELECT DiemTichLuy, UserName FROM KhachHang WHERE MaKH = 'KH001';

-- 2. Tiền hóa đơn bị giảm trừ 32.000đ (giá 1 hộp sữa) và có dòng Cảnh báo chữ "phốt"
SELECT TongTien, GhiChu FROM HoaDon WHERE MaHD = 'HD2606010001';

-- 3. Số lượng sữa trong kho K01 tự động nhảy lên thành 151 hộp
SELECT SoLuongTonKho FROM TonKho WHERE MaSP = 'SP001' AND MaKho = 'K01';

-- 4. View báo cáo cho Admin đã ghi nhận hành động trả hàng này
SELECT * FROM v_NhatKyDoiTra;
