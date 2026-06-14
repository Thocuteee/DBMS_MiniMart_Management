-- 1. TẠO GIAO TÁC BÁN HÀNG
CREATE PROCEDURE sp_GiaoTacBanHang
    @MaHD VARCHAR(15),        
    @MaNV VARCHAR(10),        
    @MaKH VARCHAR(10),       
    @MaKho VARCHAR(10),       
    @MaSP VARCHAR(10),       
    @SoLuong INT,             
    @DonGiaBan MONEY
AS
BEGIN
    SET XACT_ABORT ON;
    BEGIN TRY
        BEGIN TRAN;
        -- b1. Kiểm tra xem sản phẩm có đủ hàng tồn để bán không
        DECLARE @TonKhoHienTai INT;

        SELECT @TonKhoHienTai = SoLuongTonKho 
        FROM TonKho 
        WHERE MaKho = @MaKho AND MaSP = @MaSP;

        IF @TonKhoHienTai IS NULL OR @TonKhoHienTai < @SoLuong
        BEGIN
            RAISERROR(N'Lỗi: Số lượng tồn kho không đủ để bán mặt hàng này!', 16, 1);
        END

        --b2. Tạo Hóa đơn tổng nếu chưa tồn tại (Dành cho giỏ hàng có nhiều món)
        IF NOT EXISTS (SELECT 1 FROM HOADON WHERE MaHD = @MaHD)
        BEGIN
            INSERT INTO HOADON (MaHD, NgayLap, MaNV, MaKH, TongTien, GiamGia, ThanhTien)
            VALUES (@MaHD, GETDATE(), @MaNV, @MaKH, 0, 0, 0);
        END

        --b3. Thêm sản phẩm vào Chi tiết hóa đơn
        -- (ThanhTienNhap/ThanhTien trong chi tiết sẽ được Trigger tự tính ở dưới)
        INSERT INTO ChiTietHoaDon(MaHD, MaSP, SoLuong, DonGiaBan)
        VALUES (@MaHD, @MaSP, @SoLuong, @DonGiaBan);

        --b4. Khấu trừ số lượng tồn kho của sản phẩm
        UPDATE TonKho
        SET SoLuongTonkho = SoLuongTonKho - @SoLuong 
        WHERE MaKho = @MaKho AND MaSP = @MaSP;

        COMMIT TRAN; 
        PRINT N'Giao tác bán hàng hoàn tất thành công!';
    END TRY

    BEGIN CATCH
        ROLLBACK TRAN; 
        -- In ra thông báo lỗi chi tiết để debug hoặc hiện lên App
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 2. TẠO TRIGGER TỰ ĐỘNG TÍNH TIỀN TRONG CHI TIẾT HÓA ĐƠN
CREATE TRIGGER trg_TinhThanhTienChiTietHD
ON ChiTietHoaDon
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE ChiTietHoaDon
    SET ThanhTien = inserted.SoLuong * inserted.DonGiaBan
    FROM ChiTietHoaDon
    JOIN inserted ON ChiTietHoaDon.MaHD = inserted.MaHD AND ChiTietHoaDon.MaSP = inserted.MaSP;
    
    -- cập nhật tổng tiền của bảng HOADON
    UPDATE HOADON
    SET TongTien = (SELECT SUM(ThanhTien) FROM ChiTietHoaDon WHERE ChiTietHoaDon.MaHD = HOADON.MaHD),
        ThanhTien = (SELECT SUM(ThanhTien) FROM ChiTietHoaDon WHERE ChiTietHoaDon.MaHD = HOADON.MaHD) - ISNULL(GiamGia, 0)
    WHERE MaHD IN (SELECT MaHD FROM inserted);
END;
GO

-- Test case
-- 1. Xem tồn kho quầy (K02) trước khi bán (VIEW)
SELECT * FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP01';

-- 2. Chạy giao tác mua món đầu tiên (STORED PROCEDURE)
EXEC sp_GiaoTacBanHang 
    @MaHD = 'HD_TEST_01', @MaNV = 'NV01', @MaKH = 'KH01', 
    @MaKho = 'K02', @MaSP = 'SP01', @SoLuong = 2, @DonGiaBan = 50000;

-- 3. Kiểm tra kết quả đã trừ tiền hay chưa?
SELECT * FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP01'; -- Số tồn phải giảm đi 2
SELECT * FROM HOADON WHERE MaHD = 'HD_TEST_01';        -- TongTien và ThanhTien phải là 100,000
SELECT * FROM ChiTietHoaDon WHERE MaHD = 'HD_TEST_01'; -- Xuất hiện 1 dòng SP01



-- ACID
-- 1. Tính nguyên tử (ATOMICITY)
BEGIN TRY
    BEGIN TRAN;

    INSERT INTO HOADON (MaHD, NgayLap, MaNV, MaKH, TongTien, GiamGia, ThanhTien)
    VALUES ('HD_ATOMIC_99', GETDATE(), 'NV01', 'KH01', 0, 0, 0);

    SELECT 1 / 0; 

    UPDATE TonKho SET SoLuongTonKho = SoLuongTonKho - 2 WHERE MaKho = 'K02' AND MaSP = 'SP01';

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN; 
    PRINT N'Đã xảy ra lỗi! Hệ thống tự động ROLLBACK sạch sẽ, không để lại rác.';
END CATCH;
GO


-- KIỂM TRA: Bảng HoaDon vẫn sạch sẽ, không có mã 'HD_ATOMIC_99'
SELECT * FROM HOADON WHERE MaHD = 'HD_ATOMIC_99';


--2. Tính nhất quán(CONSISTENCY)
-- Bạn cố tình chạy lệnh này với mã nhân viên không tồn tại
DECLARE @MaNV VARCHAR(10) = 'NV_FAKE';

IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE MaNV = @MaNV)
BEGIN
    RAISERROR(N'Lỗi Nhất Quán: Nhân viên này không có trong hệ thống siêu thị!', 16, 1);
END
ELSE
BEGIN
    INSERT INTO HOADON (MaHD, MaNV) VALUES ('HD_TEST_02', @MaNV);
END

-- KIỂM TRA:
SELECT * FROM HOADON WHERE MaHD = 'HD_TEST_02';


--Tính cô lập(ISOLATION)
-- LƯU Ý: 2 TAB 
--Tab1:
UPDATE TonKho 
SET SoLuongTonKho = 50 
WHERE MaKho = 'K02' AND MaSP = 'SP01';
GO

-- CÁCH KHẮC PHỤC: Thêm dòng lệnh khóa cô lập này vào đầu!
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

BEGIN TRAN;
DECLARE @Ton INT;
SELECT @Ton = SoLuongTonKho FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP01'; -- Đọc ra 50

WAITFOR DELAY '00:00:06'; 

UPDATE TonKho SET SoLuongTonKho = @Ton - 2 WHERE MaKho = 'K02' AND MaSP = 'SP01';
COMMIT TRAN;


--Tab2:
-- CÁCH KHẮC PHỤC: Thêm dòng lệnh khóa cô lập này vào đầu!
-- SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

BEGIN TRAN;
DECLARE @Ton INT;
SELECT @Ton = SoLuongTonKho FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP01'; 

UPDATE TonKho SET SoLuongTonKho = @Ton - 5 WHERE MaKho = 'K02' AND MaSP = 'SP01';
COMMIT TRAN;

-- Kết quả:
SELECT * FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP01';



-- Tính bền vững(Durability)
EXEC sp_GiaoTacBanHang     
    @MaHD = 'HD_DURABLE_99', @MaNV = 'NV01', @MaKH = 'KH01', 
    @MaKho = 'K02', @MaSP = 'SP01', @SoLuong = 1, @DonGiaBan = 50000;

-- Kq:
SELECT * FROM HOADON WHERE MaHD = 'HD_DURABLE_99';