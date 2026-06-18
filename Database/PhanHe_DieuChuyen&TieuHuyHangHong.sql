\-- =================================================================================
-- HỆ THỐNG QUẢN LÝ SIÊU THỊ MINI - PHÂN HỆ ĐIỀU CHUYỂN & TIÊU HỦY HÀNG HỎNG
-- =================================================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU THỬ NGHIỆM
CREATE DATABASE QuanLySieuThiMini;
GO
USE QuanLySieuThiMini;
GO

-- =================================================================================
-- 2. ĐỊNH NGHĨA CẤU TRÚC BẢNG (SCHEMA)
-- =================================================================================

-- Bảng Danh mục Sản phẩm
CREATE TABLE SanPham (
    MaSanPham VARCHAR(50) PRIMARY KEY,
    TenSanPham NVARCHAR(100) NOT NULL,
    GiaVon DECIMAL(18, 2) NOT NULL CHECK (GiaVon >= 0)
);

-- Bảng Quản lý Kho (K01: Kho tổng, K02: Kho quầy của Thọ)
CREATE TABLE TonKho (
    MaKho VARCHAR(10) NOT NULL,
    MaSanPham VARCHAR(50) NOT NULL,
    SoLuong INT NOT NULL CHECK (SoLuong >= 0),
    PRIMARY KEY (MaKho, MaSanPham),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);

-- Bảng Tiêu đề Phiếu Hủy Hàng
CREATE TABLE PhieuHuy (
    MaPhieuHuy VARCHAR(50) PRIMARY KEY,
    NgayHuy DATETIME DEFAULT GETDATE(),
    TongTienLo DECIMAL(18, 2) DEFAULT 0 CHECK (TongTienLo >= 0),
    GhiChu NVARCHAR(255)
);

-- Bảng Chi Tiết Phiếu Hủy Hàng
CREATE TABLE ChiTietPhieuHuy (
    MaPhieuHuy VARCHAR(50) NOT NULL,
    MaSanPham VARCHAR(50) NOT NULL,
    SoLuongHuy INT NOT NULL,
    TienLo DECIMAL(18, 2) NOT NULL CHECK (TienLo >= 0),
    PRIMARY KEY (MaPhieuHuy, MaSanPham),
    FOREIGN KEY (MaPhieuHuy) REFERENCES PhieuHuy(MaPhieuHuy),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);
GO

-- =================================================================================
-- 3. CHÈN DỮ LIỆU MẪU ĐỂ KIỂM THỬ (TEST DATA)
-- =================================================================================
INSERT INTO SanPham (MaSanPham, TenSanPham, GiaVon) VALUES 
('SP001', N'Sữa tươi Tiệt Trùng Vinamilk 1L', 28000),
('SP002', N'Bánh Quy Cosy Kinh Đô', 45000),
('SP003', N'Mì tôm Hảo Hảo chua cay', 3800);

-- Nạp tồn kho ban đầu cho Kho Tổng K01
INSERT INTO TonKho (MaKho, MaSanPham, SoLuong) VALUES 
('K01', 'SP001', 100),
('K01', 'SP002', 50),
('K01', 'SP003', 500);

-- Kho quầy K02 ban đầu chỉ có một ít hàng
INSERT INTO TonKho (MaKho, MaSanPham, SoLuong) VALUES 
('K02', 'SP001', 5),
('K02', 'SP002', 2);
GO

-- =================================================================================
-- 4. ĐỊNH NGHĨA CÁC THÀNH PHẦN GIAO TÁC (FUNCTION, TRIGGER, VIEW, PROCEDURES)
-- =================================================================================

-- 📌 [FUNCTION]: Tính toán số tiền lỗ dựa trên giá vốn sản phẩm
CREATE FUNCTION fn_TinhTienLoHuyHang (
    @MaSanPham VARCHAR(50),
    @SoLuongHuy INT
)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @GiaVon DECIMAL(18, 2) = 0;
    DECLARE @TongTienLo DECIMAL(18, 2) = 0;

    SELECT @GiaVon = ISNULL(GiaVon, 0) FROM SanPham WHERE MaSanPham = @MaSanPham;
    SET @TongTienLo = @GiaVon * @SoLuongHuy;
    
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
    @MaSanPham VARCHAR(50),
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
            SELECT @TonNguon = SoLuong 
            FROM TonKho WITH (XLOCK, ROWLOCK)
            WHERE MaKho = @MaKhoNguon AND MaSanPham = @MaSanPham;

            IF @TonNguon IS NULL OR @TonNguon < @SoLuongChuyen
            BEGIN
                RAISERROR(N'Loi: Kho nguon %s khong du hang de dieu chuyen!', 16, 1, @MaKhoNguon);
            END

            -- 2a. Tru kho nguon
            UPDATE TonKho 
            SET SoLuong = SoLuong - @SoLuongChuyen 
            WHERE MaKho = @MaKhoNguon AND MaSanPham = @MaSanPham;

            -- 3a. Cong kho dich (lon hon -> lock sau)
            IF EXISTS (SELECT 1 FROM TonKho WHERE MaKho = @MaKhoDich AND MaSanPham = @MaSanPham)
            BEGIN
                UPDATE TonKho 
                SET SoLuong = SoLuong + @SoLuongChuyen 
                WHERE MaKho = @MaKhoDich AND MaSanPham = @MaSanPham;
            END
            ELSE
            BEGIN
                INSERT INTO TonKho (MaKho, MaSanPham, SoLuong) 
                VALUES (@MaKhoDich, @MaSanPham, @SoLuongChuyen);
            END
        END
        ELSE
        BEGIN
            -- Ma kho DICH nho hon kho NGUON -> Lock kho DICH truoc (cong), kho NGUON sau (tru)
            -- VD: Dieu chuyen K02 -> K01 thi lock K01 truoc (K01 < K02)

            -- 1b. Lock kho DICH truoc (nho hon) - chi doc de giu lock
            IF EXISTS (SELECT 1 FROM TonKho WITH (XLOCK, ROWLOCK) WHERE MaKho = @MaKhoDich AND MaSanPham = @MaSanPham)
            BEGIN
                -- Kho dich da co san pham -> se UPDATE phia duoi
                DECLARE @dummy INT = 1;
            END

            -- 2b. Kiem tra & khoa kho NGUON (lon hon -> lock sau)
            SELECT @TonNguon = SoLuong 
            FROM TonKho WITH (XLOCK, ROWLOCK)
            WHERE MaKho = @MaKhoNguon AND MaSanPham = @MaSanPham;

            IF @TonNguon IS NULL OR @TonNguon < @SoLuongChuyen
            BEGIN
                RAISERROR(N'Loi: Kho nguon %s khong du hang de dieu chuyen!', 16, 1, @MaKhoNguon);
            END

            -- 3b. Tru kho nguon
            UPDATE TonKho 
            SET SoLuong = SoLuong - @SoLuongChuyen 
            WHERE MaKho = @MaKhoNguon AND MaSanPham = @MaSanPham;

            -- 4b. Cong kho dich
            IF EXISTS (SELECT 1 FROM TonKho WHERE MaKho = @MaKhoDich AND MaSanPham = @MaSanPham)
            BEGIN
                UPDATE TonKho 
                SET SoLuong = SoLuong + @SoLuongChuyen 
                WHERE MaKho = @MaKhoDich AND MaSanPham = @MaSanPham;
            END
            ELSE
            BEGIN
                INSERT INTO TonKho (MaKho, MaSanPham, SoLuong) 
                VALUES (@MaKhoDich, @MaSanPham, @SoLuongChuyen);
            END
        END

        -- Cam ket luu thay doi vat ly (Atomicity & Durability)
        COMMIT TRANSACTION;
        PRINT N'=== THANH CONG: Dieu chuyen ' + CAST(@SoLuongChuyen AS VARCHAR)
            + N' ' + @MaSanPham
            + N' tu ' + @MaKhoNguon + N' sang ' + @MaKhoDich + N' ===';
    END TRY
    BEGIN CATCH
        -- Thu hoi toan bo neu phat sinh loi
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH

    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
END;
GO

-- 📌 [PROCEDURE 2]: Giao tác tiêu hủy hàng hỏng (Kiểm tra, trừ kho K02, tính tiền lỗ)
CREATE PROCEDURE sp_GiaoTacHuyHang
    @MaPhieuHuy VARCHAR(50),
    @MaSanPham VARCHAR(50),
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
        SELECT @TonK02 = SoLuong 
        FROM TonKho WITH (XLOCK, ROWLOCK)
        WHERE MaKho = 'K02' AND MaSanPham = @MaSanPham;

        IF @TonK02 IS NULL OR @TonK02 < @SoLuongHuy
        BEGIN
            RAISERROR(N'Lỗi: Kho quầy K02 không đủ số lượng hàng để thực hiện hủy!', 16, 1);
        END

        -- 2. Gọi Function tính số tiền thiệt hại (Tính nhất quán Consistency)
        DECLARE @TienThietHai DECIMAL(18, 2);
        SET @TienThietHai = dbo.fn_TinhTienLoHuyHang(@MaSanPham, @SoLuongHuy);

        -- 3. Cập nhật giảm trừ số lượng tồn kho của món bị hỏng trên kệ
        UPDATE TonKho 
        SET SoLuong = SoLuong - @SoLuongHuy 
        WHERE MaKho = 'K02' AND MaSanPham = @MaSanPham;

        -- 4. Tạo tiêu đề phiếu hủy nếu là mặt hàng lỗi đầu tiên của phiếu này
        IF NOT EXISTS (SELECT 1 FROM PhieuHuy WHERE MaPhieuHuy = @MaPhieuHuy)
        BEGIN
            INSERT INTO PhieuHuy (MaPhieuHuy, NgayHuy, TongTienLo, GhiChu)
            VALUES (@MaPhieuHuy, GETDATE(), 0, @LyDo);
        END

        -- 5. Thêm thông tin vào bảng chi tiết hủy hàng (Sẽ kích hoạt Trigger kiểm tra)
        INSERT INTO ChiTietPhieuHuy (MaPhieuHuy, MaSanPham, SoLuongHuy, TienLo)
        VALUES (@MaPhieuHuy, @MaSanPham, @SoLuongHuy, @TienThietHai);

        -- 6. Tích lũy tổng tiền lỗ cập nhật lại cho Admin theo dõi
        UPDATE PhieuHuy 
        SET TongTienLo = TongTienLo + @TienThietHai 
        WHERE MaPhieuHuy = @MaPhieuHuy;

        COMMIT TRANSACTION;
        PRINT N'=== THÀNH CÔNG: Xử lý tiêu hủy hàng hỏng thành công. ===';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO

-- 📌 [VIEW]: Thống kê báo cáo thiệt hại doanh thu hàng tháng dành cho Admin
CREATE VIEW v_DanhSachHuyHang AS
SELECT 
    YEAR(p.NgayHuy) AS NamHuy,
    MONTH(p.NgayHuy) AS ThangHuy,
    ct.MaSanPham,
    s.TenSanPham,
    SUM(ct.SoLuongHuy) AS TongSoLuongHuy,
    SUM(ct.TienLo) AS TongThietHaiDoanhThu
FROM PhieuHuy p
INNER JOIN ChiTietPhieuHuy ct ON p.MaPhieuHuy = ct.MaPhieuHuy
INNER JOIN SanPham s ON ct.MaSanPham = s.MaSanPham
GROUP BY YEAR(p.NgayHuy), MONTH(p.NgayHuy), ct.MaSanPham, s.TenSanPham;
GO


-- =================================================================================
-- 5. KỊCH BẢN CHẠY THỬ NGHIỆM KẾT QUẢ (TESTING RUN)
-- =================================================================================

-- Kịch bản 1: Điều chuyển 20 sản phẩm sữa 'SP001' từ Kho tổng K01 sang Kho quầy K02
EXEC sp_DieuChuyenKhoNoiBo @MaSanPham = 'SP001', @SoLuongChuyen = 20;

-- Kịch bản 2: Nhân viên phát hiện sữa trên quầy K02 bị móp méo do chuột cắn, thực hiện hủy 3 hộp
EXEC sp_GiaoTacHuyHang 
    @MaPhieuHuy = 'PH001', 
    @MaSanPham = 'SP001', 
    @SoLuongHuy = 3, 
    @LyDo = N'Hộp móp méo, nghi bị chuột cắn phá';

-- Kịch bản 3: Thử nghiệm vi phạm Trigger (Hủy số lượng nhập sai bằng 0) -> Sẽ văng lỗi chặn lại
-- EXEC sp_GiaoTacHuyHang @MaPhieuHuy = 'PH002', @MaSanPham = 'SP002', @SoLuongHuy = 0, @LyDo = N'Nhập lỗi';

-- Kịch bản 4: Xem kết quả thống kê thông qua VIEW của hệ thống
SELECT * FROM v_DanhSachHuyHang;

-- Xem lại tình trạng các bảng dữ liệu sau giao tác
SELECT * FROM TonKho;
SELECT * FROM PhieuHuy;
SELECT * FROM ChiTietPhieuHuy;