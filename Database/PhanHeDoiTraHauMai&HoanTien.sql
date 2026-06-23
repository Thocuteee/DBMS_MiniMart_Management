USE QuanLySieuThiMini;
GO

-- =======================================================
-- PHÂN HỆ ĐỔI TRẢ HẬU MÃI & HOÀN TIỀN
-- =======================================================
-- Các bảng (KhachHang, NhanVien, LoaiSanPham, NhaCungCap, Kho,
-- SanPham, TonKho, HoaDon, ChiTietHoaDon, PhieuNhap, ChiTietPhieuNhap,
-- PhieuDoiTra) và dữ liệu mẫu đã được tạo sẵn trong 01_Init_Database_Full.sql.
-- Script này chỉ tạo Function, View, Trigger, Stored Procedure cho phân hệ Đổi trả.
-- =======================================================

-- =======================================================
-- PHẦN 1: CÀI ĐẶT TÍNH NĂNG ACID (ĐỔI TRẢ HÀNG)
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
-- !! CANH BAO QUAN TRONG !!
-- TUYET DOI phai lay DonGiaBan tu bang ChiTietHoaDon (gia tai thoi diem mua).
-- KHONG DUOC lay tu bang SanPham.GiaBan (gia hien hanh co the da thay doi).
-- VD: Khach mua khuyen mai 40k, tuan sau het KM gia tang 60k,
--     neu lay SanPham.GiaBan = 60k -> thoi tien 60k thay vi 40k -> THAT THOAT!
-- LICH SU: 2026-06-18 - Xac nhan dung nguon gia tu ChiTietHoaDon
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

        SELECT @SoLuongDaMua = cthd.SoLuong,
               @DonGiaBan    = cthd.DonGiaBan    -- Gia lich su tai thoi diem khach mua
        FROM [dbo].[ChiTietHoaDon] AS cthd
        WHERE cthd.MaHD = @MaHD AND cthd.MaSP = @MaSP;

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
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        PRINT N'Thành công: Đã xử lý hoàn tiền, thu hồi điểm và cất hàng vào kho!';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- =======================================================
-- PHẦN 2: KỊCH BẢN CHẠY THỬ NGHIỆM (TEST CASES)
-- =======================================================

-- Kiểm tra dữ liệu trước khi đổi trả
SELECT * FROM SanPham;

SELECT DiemTichLuy, UserName FROM KhachHang WHERE MaKH = 'KH001';
SELECT TongTien, GhiChu FROM HoaDon WHERE MaHD = 'HD2606010001';
SELECT SoLuongTonKho FROM TonKho WHERE MaSP = 'SP001' AND MaKho = 'K01';

-- Thực hiện giao tác đổi trả
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
