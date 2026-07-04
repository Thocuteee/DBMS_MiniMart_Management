\-- =================================================================================
-- HỆ THỐNG QUẢN LÝ SIÊU THỊ MINI - PHÂN HỆ ĐIỀU CHUYỂN & TIÊU HỦY HÀNG HỎNG
-- =================================================================================

-- 1. SỬ DỤNG CƠ SỞ DỮ LIỆU ĐÃ CÓ
USE QuanLySieuThiMini;
GO

-- =================================================================================
-- 2. ĐỊNH NGHĨA CẤU TRÚC BẢNG (SCHEMA)
-- =================================================================================

-- Bảng SanPham, TonKho đã được tạo trong 01_Init_Database_Full.sql
-- Bảng PhieuHuy, ChiTietPhieuHuy đã được tạo trong 01_Init_Database_Full.sql
-- Script này chỉ tạo Function, Trigger, Procedure, View cho phân hệ Điều chuyển & Hủy hàng.
GO

-- =================================================================================
-- 3. DỮ LIỆU MẪU (đã được nạp sẵn trong 01_Init_Database_Full.sql)
-- =================================================================================
-- Bảng SanPham, TonKho đã có dữ liệu từ file Master.
-- Script này không INSERT thêm để tránh trùng lặp.
GO

-- =================================================================================
-- 4. ĐỊNH NGHĨA CÁC THÀNH PHẦN GIAO TÁC (FUNCTION, TRIGGER, VIEW, PROCEDURES)
-- =================================================================================

-- 📌 [FUNCTION]: Tính toán số tiền lỗ dựa trên giá vốn sản phẩm
CREATE FUNCTION fn_TinhTienLoHuyHang (
    @MaSP VARCHAR(10),
    @SoLuongHuy INT
)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @GiaBan DECIMAL(18, 2) = 0;
    DECLARE @TongTienLo DECIMAL(18, 2) = 0;

    SELECT @GiaBan = ISNULL(GiaBan, 0) FROM SanPham WHERE MaSP = @MaSP;
    SET @TongTienLo = @GiaBan * @SoLuongHuy;
    
    RETURN @TongTienLo;
END;
GO

-- 📌 [TRIGGER]: Chốt chặn kiểm tra tính hợp lệ của số lượng hàng hủy nhập vào
CREATE TRIGGER tg_ChanHuyHangHopLe
ON ChiTietPhieuHuy
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE SoLuongHuy <= 0)
    BEGIN
        RAISERROR(N'Lỗi Hệ Thống (Trigger): Số lượng hàng hóa tiêu hủy bắt buộc phải lớn hơn 0!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- 📌 [PROCEDURE 1]: Điều chuyển hàng nội bộ từ Kho tổng (K01) sang Kho quầy (K02)
-- ============================================================================
-- !! DA SUA LOI CHI MANG !!
-- Phien ban cu: Hardcode K01->K02, dung REPEATABLE READ, khong co chien luoc
--   sap xep thu tu lock -> 2 luong dieu chuyen cheo (K01->K02 va K02->K01)
--   dong thoi se gay DEADLOCK vong tron treo sap Backend Java.
-- Phien ban moi:
--   1. Them tham so @MaKhoNguon, @MaKhoDich linh hoat
--   2. Nang ISOLATION LEVEL len SERIALIZABLE
--   3. Them logic IF/ELSE: luon UPDATE ma kho NHO hon TRUOC -> pha the
--      deadlock vong tron (ordered resource acquisition)
-- LICH SU: 2026-06-18 - Sua deadlock + linh hoat hoa kho nguon/dich
-- ============================================================================
CREATE PROCEDURE sp_DieuChuyenKhoNoiBo
    @MaSP VARCHAR(10),
    @SoLuongChuyen INT,
    @MaKhoNguon VARCHAR(10) = 'K01',    -- Mac dinh: Kho tong
    @MaKhoDich  VARCHAR(10) = 'K02'     -- Mac dinh: Quay POS
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @SoLuongChuyen <= 0
    BEGIN
        RAISERROR(N'So luong dieu chuyen phai lon hon 0.', 16, 1);
        RETURN;
    END

    IF @MaKhoNguon = @MaKhoDich
    BEGIN
        RAISERROR(N'Kho nguon va kho dich khong duoc trung nhau!', 16, 1);
        RETURN;
    END

    -- [I] ISOLATION: SERIALIZABLE ngan phantom read va race condition
    -- (Nang cap tu REPEATABLE READ de bao dam an toan tuyet doi)
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    BEGIN TRANSACTION;
    BEGIN TRY

        DECLARE @TonNguon INT;

        -- ============================================================
        -- CHIEN LUOC CHONG DEADLOCK: ORDERED RESOURCE ACQUISITION
        -- ============================================================
        -- Nguyen tac: Luon lock ma kho co gia tri NHO TRUOC.
        -- Gia su co 2 luong chay dong thoi:
        --   Luong A: Dieu chuyen K01 -> K02 (lock K01 truoc, roi K02)
        --   Luong B: Dieu chuyen K02 -> K01 (lock K01 truoc, roi K02)
        -- Ca 2 luong deu lock K01 truoc -> luong den sau phai cho
        -- -> KHONG bao gio xay ra vong deadlock tron.
        -- ============================================================

        IF @MaKhoNguon < @MaKhoDich
        BEGIN
            -- Ma kho nguon NHO hon -> Xu ly kho NGUON truoc (tru), kho DICH sau (cong)

            -- 1a. Kiem tra & khoa dong kho NGUON (nho hon -> lock truoc)
            SELECT @TonNguon = SoLuongTonKho 
            FROM TonKho WITH (XLOCK, ROWLOCK)
            WHERE MaKho = @MaKhoNguon AND MaSP = @MaSP;

            IF @TonNguon IS NULL OR @TonNguon < @SoLuongChuyen
            BEGIN
                RAISERROR(N'Loi: Kho nguon %s khong du hang de dieu chuyen!', 16, 1, @MaKhoNguon);
            END

            -- 2a. Tru kho nguon
            UPDATE TonKho 
            SET SoLuongTonKho = SoLuongTonKho - @SoLuongChuyen 
            WHERE MaKho = @MaKhoNguon AND MaSP = @MaSP;

            -- 3a. Cong kho dich (lon hon -> lock sau)
            IF EXISTS (SELECT 1 FROM TonKho WHERE MaKho = @MaKhoDich AND MaSP = @MaSP)
            BEGIN
                UPDATE TonKho 
                SET SoLuongTonKho = SoLuongTonKho + @SoLuongChuyen 
                WHERE MaKho = @MaKhoDich AND MaSP = @MaSP;
            END
            ELSE
            BEGIN
                INSERT INTO TonKho (MaKho, MaSP, SoLuongTonKho) 
                VALUES (@MaKhoDich, @MaSP, @SoLuongChuyen);
            END
        END
        ELSE
        BEGIN
            -- Ma kho DICH nho hon kho NGUON -> Lock kho DICH truoc (cong), kho NGUON sau (tru)
            -- VD: Dieu chuyen K02 -> K01 thi lock K01 truoc (K01 < K02)

            -- 1b. Lock kho DICH truoc (nho hon) - chi doc de giu lock
            IF EXISTS (SELECT 1 FROM TonKho WITH (XLOCK, ROWLOCK) WHERE MaKho = @MaKhoDich AND MaSP = @MaSP)
            BEGIN
                -- Kho dich da co san pham -> se UPDATE phia duoi
                DECLARE @dummy INT = 1;
            END

            -- 2b. Kiem tra & khoa kho NGUON (lon hon -> lock sau)
            SELECT @TonNguon = SoLuongTonKho 
            FROM TonKho WITH (XLOCK, ROWLOCK)
            WHERE MaKho = @MaKhoNguon AND MaSP = @MaSP;

            IF @TonNguon IS NULL OR @TonNguon < @SoLuongChuyen
            BEGIN
                RAISERROR(N'Loi: Kho nguon %s khong du hang de dieu chuyen!', 16, 1, @MaKhoNguon);
            END

            -- 3b. Tru kho nguon
            UPDATE TonKho 
            SET SoLuongTonKho = SoLuongTonKho - @SoLuongChuyen 
            WHERE MaKho = @MaKhoNguon AND MaSP = @MaSP;

            -- 4b. Cong kho dich
            IF EXISTS (SELECT 1 FROM TonKho WHERE MaKho = @MaKhoDich AND MaSP = @MaSP)
            BEGIN
                UPDATE TonKho 
                SET SoLuongTonKho = SoLuongTonKho + @SoLuongChuyen 
                WHERE MaKho = @MaKhoDich AND MaSP = @MaSP;
            END
            ELSE
            BEGIN
                INSERT INTO TonKho (MaKho, MaSP, SoLuongTonKho) 
                VALUES (@MaKhoDich, @MaSP, @SoLuongChuyen);
            END
        END

        -- Cam ket luu thay doi vat ly (Atomicity & Durability)
        COMMIT TRANSACTION;
        PRINT N'=== THANH CONG: Dieu chuyen ' + CAST(@SoLuongChuyen AS VARCHAR)
            + N' ' + @MaSP
            + N' tu ' + @MaKhoNguon + N' sang ' + @MaKhoDich + N' ===';
    END TRY
    BEGIN CATCH
        -- Thu hoi toan bo neu phat sinh loi
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO

-- 📌 [PROCEDURE 2]: Giao tác tiêu hủy hàng hỏng (Kiểm tra, trừ kho K02, tính tiền lỗ)
CREATE PROCEDURE sp_GiaoTacHuyHang
    @MaPhieuHuy VARCHAR(50),
    @MaSP VARCHAR(10),
    @SoLuongHuy INT,
    @LyDo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Kiểm tra tồn kho tại quầy K02 (Có khóa hàng độc quyền XLOCK)
        DECLARE @TonK02 INT;
        SELECT @TonK02 = SoLuongTonKho 
        FROM TonKho WITH (XLOCK, ROWLOCK)
        WHERE MaKho = 'K02' AND MaSP = @MaSP;

        IF @TonK02 IS NULL OR @TonK02 < @SoLuongHuy
        BEGIN
            RAISERROR(N'Lỗi: Kho quầy K02 không đủ số lượng hàng để thực hiện hủy!', 16, 1);
        END

        -- 2. Gọi Function tính số tiền thiệt hại (Tính nhất quán Consistency)
        DECLARE @TienThietHai DECIMAL(18, 2);
        SET @TienThietHai = dbo.fn_TinhTienLoHuyHang(@MaSP, @SoLuongHuy);

        -- 3. Cập nhật giảm trừ số lượng tồn kho của món bị hỏng trên kệ
        UPDATE TonKho 
        SET SoLuongTonKho = SoLuongTonKho - @SoLuongHuy 
        WHERE MaKho = 'K02' AND MaSP = @MaSP;

        -- 4. Tạo tiêu đề phiếu hủy nếu là mặt hàng lỗi đầu tiên của phiếu này
        IF NOT EXISTS (SELECT 1 FROM PhieuHuy WHERE MaPhieuHuy = @MaPhieuHuy)
        BEGIN
            INSERT INTO PhieuHuy (MaPhieuHuy, NgayHuy, TongTienLo, GhiChu)
            VALUES (@MaPhieuHuy, GETDATE(), 0, @LyDo);
        END

        -- 5. Thêm thông tin vào bảng chi tiết hủy hàng (Sẽ kích hoạt Trigger kiểm tra)
        INSERT INTO ChiTietPhieuHuy (MaPhieuHuy, MaSP, SoLuongHuy, TienLo)
        VALUES (@MaPhieuHuy, @MaSP, @SoLuongHuy, @TienThietHai);

        -- 6. Tích lũy tổng tiền lỗ cập nhật lại cho Admin theo dõi
        UPDATE PhieuHuy 
        SET TongTienLo = TongTienLo + @TienThietHai 
        WHERE MaPhieuHuy = @MaPhieuHuy;

        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        PRINT N'=== THÀNH CÔNG: Xử lý tiêu hủy hàng hỏng thành công. ===';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO

-- 📌 [VIEW]: Thống kê báo cáo thiệt hại doanh thu hàng tháng dành cho Admin
CREATE VIEW v_DanhSachHuyHang AS
SELECT 
    YEAR(p.NgayHuy) AS NamHuy,
    MONTH(p.NgayHuy) AS ThangHuy,
    ct.MaSP,
    s.TenSP,
    SUM(ct.SoLuongHuy) AS TongSoLuongHuy,
    SUM(ct.TienLo) AS TongThietHaiDoanhThu
FROM PhieuHuy p
INNER JOIN ChiTietPhieuHuy ct ON p.MaPhieuHuy = ct.MaPhieuHuy
INNER JOIN SanPham s ON ct.MaSP = s.MaSP
GROUP BY YEAR(p.NgayHuy), MONTH(p.NgayHuy), ct.MaSP, s.TenSP;
GO


-- =================================================================================
-- 5. KỊCH BẢN CHẠY THỬ NGHIỆM KẾT QUẢ (TESTING RUN)
-- =================================================================================

-- Kịch bản 1: Điều chuyển 20 sản phẩm sữa 'SP001' từ Kho tổng K01 sang Kho quầy K02
EXEC sp_DieuChuyenKhoNoiBo @MaSP = 'SP001', @SoLuongChuyen = 20;

-- Kịch bản 2: Nhân viên phát hiện sữa trên quầy K02 bị móp méo do chuột cắn, thực hiện hủy 3 hộp
EXEC sp_GiaoTacHuyHang 
    @MaPhieuHuy = 'PH001', 
    @MaSP = 'SP001', 
    @SoLuongHuy = 3, 
    @LyDo = N'Hộp móp méo, nghi bị chuột cắn phá';

-- Kịch bản 3: Thử nghiệm vi phạm Trigger (Hủy số lượng nhập sai bằng 0) -> Sẽ văng lỗi chặn lại
-- EXEC sp_GiaoTacHuyHang @MaPhieuHuy = 'PH002', @MaSP = 'SP002', @SoLuongHuy = 0, @LyDo = N'Nhập lỗi';

-- Kịch bản 4: Xem kết quả thống kê thông qua VIEW của hệ thống
SELECT * FROM v_DanhSachHuyHang;

-- Xem lại tình trạng các bảng dữ liệu sau giao tác
SELECT * FROM TonKho;
SELECT * FROM PhieuHuy;
SELECT * FROM ChiTietPhieuHuy;