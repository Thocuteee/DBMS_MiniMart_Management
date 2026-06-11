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
        WHERE MaSP = @MaSP;

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
        ThanhTien = (SELECT SUM(ThanhTien) FROM ChiTietHoaDon WHERE ChiTietHoaDon.MaHD = HOADON.MaHD) - GiamGia
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


