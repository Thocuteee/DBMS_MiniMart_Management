-- =============================================================================
--   PHÂN HỆ: KHÁCH HÀNG & TÍCH ĐIỂM THƯỞNG
--   (Đổi điểm thành tiền giảm giá trực tiếp trên hóa đơn)
-- =============================================================================

-- =============================================================================
-- PHẦN 0: THIẾT LẬP CSDL
-- =============================================================================
USE [QuanLySieuThiMini];
GO
IF OBJECT_ID('dbo.trg_TuDongCongDiem',   'TR') IS NOT NULL DROP TRIGGER  dbo.trg_TuDongCongDiem;
IF OBJECT_ID('dbo.sp_GiaoTacDoiDiem',    'P')  IS NOT NULL DROP PROCEDURE dbo.sp_GiaoTacDoiDiem;
IF OBJECT_ID('dbo.v_ViDiemKhachHang',    'V')  IS NOT NULL DROP VIEW      dbo.v_ViDiemKhachHang;
IF OBJECT_ID('dbo.fn_QuyDoiDiem',        'FN') IS NOT NULL DROP FUNCTION  dbo.fn_QuyDoiDiem;
GO


-- =============================================================================
-- PHẦN 1: BẢNG DỮ LIỆU
-- =============================================================================

IF COL_LENGTH('dbo.KhachHang', 'TenKH') IS NULL
BEGIN
    ALTER TABLE dbo.KhachHang ADD TenKH NVARCHAR(100) NULL;
END;
GO

IF COL_LENGTH('dbo.KhachHang', 'DiaChi') IS NULL
BEGIN
    ALTER TABLE dbo.KhachHang ADD DiaChi NVARCHAR(200) NULL;
END;
GO

IF COL_LENGTH('dbo.KhachHang', 'NgayDangKy') IS NULL
BEGIN
    ALTER TABLE dbo.KhachHang ADD NgayDangKy DATE NULL
        CONSTRAINT DF_KhachHang_NgayDangKy DEFAULT (CAST(GETDATE() AS DATE));
END;
GO

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.KhachHang') AND name = 'DiemTichLuy' AND is_nullable = 1
)
BEGIN
    UPDATE dbo.KhachHang SET DiemTichLuy = 0 WHERE DiemTichLuy IS NULL;
    ALTER TABLE dbo.KhachHang ALTER COLUMN DiemTichLuy INT NOT NULL;
    ALTER TABLE dbo.KhachHang ADD CONSTRAINT DF_KhachHang_DiemTichLuy_v2 DEFAULT (0) FOR DiemTichLuy;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CHK_DiemKhongAm' AND parent_object_id = OBJECT_ID('dbo.KhachHang')
)
BEGIN
    ALTER TABLE dbo.KhachHang
        ADD CONSTRAINT CHK_DiemKhongAm CHECK (DiemTichLuy >= 0);
END;
GO


IF COL_LENGTH('dbo.HoaDon', 'TrangThai') IS NULL
BEGIN
    ALTER TABLE dbo.HoaDon ADD TrangThai VARCHAR(20) NULL
        CONSTRAINT DF_HoaDon_TrangThai DEFAULT ('ChuaThanhToan');
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.HoaDon') AND c.name = 'TongTien'
)
BEGIN
    ALTER TABLE dbo.HoaDon ADD CONSTRAINT DF_HoaDon_TongTien_v2 DEFAULT (0) FOR TongTien;
END;
GO
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.HoaDon') AND c.name = 'GiamGia'
)
BEGIN
    ALTER TABLE dbo.HoaDon ADD CONSTRAINT DF_HoaDon_GiamGia_v2 DEFAULT (0) FOR GiamGia;
END;
GO


IF OBJECT_ID('dbo.LichSuDoiDiem', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LichSuDoiDiem (
        MaGiaoDich      INT             NOT NULL IDENTITY(1,1),
        MaKH            VARCHAR(10),
        MaHD            VARCHAR(15),
        SoDiemDoi       INT             NOT NULL,
        SoTienGiam      DECIMAL(15,2)   NOT NULL,
        ThoiGian        DATETIME        DEFAULT (GETDATE()),
        GhiChu          NVARCHAR(300),

        CONSTRAINT PK_LichSuDoiDiem PRIMARY KEY (MaGiaoDich),
        CONSTRAINT FK_LichSu_KhachHang FOREIGN KEY (MaKH)
            REFERENCES dbo.KhachHang(MaKH),
        CONSTRAINT FK_LichSu_HoaDon FOREIGN KEY (MaHD)
            REFERENCES dbo.HoaDon(MaHD)
    );
END;
GO


-- =============================================================================
-- PHẦN 2: FUNCTION - fn_QuyDoiDiem
-- =============================================================================
-- Mục đích : Quy đổi số điểm thành số tiền giảm giá (tỷ lệ: 1 điểm = 1.000đ)
-- Input    : @p_SoDiem (INT)
-- Output   : DECIMAL(15,2)  → số tiền được giảm (VND)
-- Ví dụ   : fn_QuyDoiDiem(50)  → 50.000 VND
--            fn_QuyDoiDiem(200) → 200.000 VND
-- =============================================================================
CREATE FUNCTION dbo.fn_QuyDoiDiem
(
    @p_SoDiem   INT         -- Số điểm cần quy đổi
)
RETURNS DECIMAL(15,2)
AS
BEGIN
    -- Bảo vệ đầu vào: điểm NULL hoặc <= 0 → trả về 0, không gây lỗi
    IF @p_SoDiem IS NULL OR @p_SoDiem <= 0
        RETURN 0.00;

    -- Công thức quy đổi: 1 điểm × 1.000đ/điểm = số tiền giảm
    RETURN CAST(@p_SoDiem AS DECIMAL(15,2)) * 1000.00;
END;
GO


-- =============================================================================
-- PHẦN 3: VIEW - v_ViDiemKhachHang
-- =============================================================================
-- Mục đích : Giao diện đọc tổng hợp về "ví điểm" của từng khách hàng
-- Cách dùng:
--   SELECT * FROM dbo.v_ViDiemKhachHang;
--   SELECT * FROM dbo.v_ViDiemKhachHang WHERE MaKH = 'KH001';
--   SELECT * FROM dbo.v_ViDiemKhachHang WHERE HangThanhVien = 'VIP';
-- =============================================================================
CREATE VIEW dbo.v_ViDiemKhachHang AS
SELECT
    -- Thông tin cơ bản khách hàng
    kh.MaKH,
    kh.TenKH,
    kh.Phone        AS SoDienThoai,
    kh.NgayDangKy,

    -- Thông tin "Ví điểm"
    kh.DiemTichLuy                              AS DiemHienCo,
    dbo.fn_QuyDoiDiem(kh.DiemTichLuy)           AS SoTienCoTheGiam,

    -- Thống kê lịch sử mua hàng (LEFT JOIN → KH chưa mua vẫn hiện)
    COUNT(hd.MaHD)                              AS TongSoHoaDon,
    CAST(COALESCE(SUM(hd.ThanhTien), 0) AS DECIMAL(15,2)) AS TongChiTieu,
    COALESCE(MAX(hd.NgayLap), CAST(kh.NgayDangKy AS DATETIME)) AS LanMuaGanNhat,

    -- Phân hạng thành viên theo điểm
    CASE
        WHEN kh.DiemTichLuy >= 1000 THEN 'VIP'
        WHEN kh.DiemTichLuy >= 500  THEN 'Gold'
        WHEN kh.DiemTichLuy >= 100  THEN 'Silver'
        ELSE                             'Standard'
    END                                         AS HangThanhVien

FROM dbo.KhachHang kh
LEFT JOIN dbo.HoaDon hd ON kh.MaKH = hd.MaKH

GROUP BY
    kh.MaKH, kh.TenKH, kh.Phone,
    kh.NgayDangKy, kh.DiemTichLuy;
GO


-- =============================================================================
-- PHẦN 4: STORED PROCEDURE - sp_GiaoTacDoiDiem
-- =============================================================================
-- Mục đích  : Xử lý toàn bộ luồng đổi điểm lấy tiền giảm giá trên hóa đơn
-- Thể hiện  : ĐẦY ĐỦ 4 tính chất ACID
-- Input     :
--   @p_MaHD          → Mã hóa đơn cần áp dụng giảm giá
--   @p_MaKH          → Mã khách hàng thực hiện đổi điểm
--   @p_SoDiemMuonDoi → Số điểm khách muốn sử dụng
-- Output    :
--   @p_KetQua OUTPUT → Thông báo kết quả
-- Cách gọi  :
--   DECLARE @ket_qua VARCHAR(200);
--   EXEC dbo.sp_GiaoTacDoiDiem 'HD004', 'KH002', 50, @ket_qua OUTPUT;
--   SELECT @ket_qua;
-- =============================================================================
CREATE PROCEDURE dbo.sp_GiaoTacDoiDiem
    @p_MaHD          VARCHAR(15),    -- Mã hóa đơn cần giảm giá
    @p_MaKH          VARCHAR(10),    -- Mã khách hàng đổi điểm
    @p_SoDiemMuonDoi INT,            -- Số điểm muốn đổi
    @p_KetQua        VARCHAR(200) OUTPUT   -- Thông báo kết quả trả về
AS
BEGIN
    SET NOCOUNT ON;

    -- ─── [A] KHAI BÁO BIẾN CỤC BỘ ────────────────────────────────────────────
    DECLARE @v_DiemHienCo    INT             = 0;
    DECLARE @v_TongTienHD    DECIMAL(15,2)   = 0;
    DECLARE @v_SoTienGiam    DECIMAL(15,2)   = 0;
    DECLARE @v_ThanhTienMoi  DECIMAL(15,2)   = 0;
    DECLARE @v_CheckHD       INT             = 0;


    -- ─── [C] KIỂM TRA ĐẦU VÀO (Thực hiện TRƯỚC khi mở transaction) ───────────

    -- Kiểm tra 1: Số điểm yêu cầu phải > 0
    IF @p_SoDiemMuonDoi IS NULL OR @p_SoDiemMuonDoi <= 0
    BEGIN
        SET @p_KetQua = '[LOI] So diem muon doi phai lon hon 0.';
        RETURN;
    END;

    -- Kiểm tra 2: Hóa đơn phải tồn tại và thuộc đúng khách hàng
    SELECT @v_CheckHD = COUNT(*)
    FROM   dbo.HoaDon
    WHERE  MaHD = @p_MaHD AND MaKH = @p_MaKH;

    IF @v_CheckHD = 0
    BEGIN
        SET @p_KetQua = CONCAT(
            '[LOI] Khong tim thay hoa don [', @p_MaHD,
            '] thuoc khach hang [', @p_MaKH, ']. ',
            'Kiem tra lai ma HD va ma KH.'
        );
        RETURN;
    END;


    -- ─── [D] ĐẶT MỨC CÔ LẬP - ACID: ISOLATION ───────────────────────────────
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;


    -- ─── [E] BẮT ĐẦU GIAO TÁC - ACID: ATOMICITY ──────────────────────────────
    BEGIN TRANSACTION;

    BEGIN TRY

        -- BƯỚC 1: Đọc điểm và KHÓA DÒNG khách hàng
        -- ACID - ISOLATION: UPDLOCK đặt row-level lock trên dòng KH này.
        -- Session khác cùng đổi điểm cho KH này phải CHỜ đến khi ta COMMIT.
        SELECT @v_DiemHienCo = DiemTichLuy
        FROM   dbo.KhachHang WITH (UPDLOCK, ROWLOCK)
        WHERE  MaKH = @p_MaKH;

        -- BƯỚC 2: Đọc tổng tiền hóa đơn và khóa dòng
        SELECT @v_TongTienHD = TongTien
        FROM   dbo.HoaDon WITH (UPDLOCK, ROWLOCK)
        WHERE  MaHD = @p_MaHD;

        -- BƯỚC 3: Kiểm tra đủ điểm không?
        -- ACID - CONSISTENCY: Ngăn điểm tích lũy giảm xuống âm
        IF @v_DiemHienCo < @p_SoDiemMuonDoi
        BEGIN
            ROLLBACK TRANSACTION;
            SET @p_KetQua = CONCAT(
                '[THONG BAO] Khong du diem de doi! ',
                'Vi diem hien co: ', CAST(@v_DiemHienCo AS VARCHAR), ' diem | ',
                'So diem can: ', CAST(@p_SoDiemMuonDoi AS VARCHAR), ' diem | ',
                'Con thieu: ', CAST(@p_SoDiemMuonDoi - @v_DiemHienCo AS VARCHAR), ' diem'
            );
            RETURN;
        END;

        -- BƯỚC 4: Tính số tiền giảm bằng cách GỌI FUNCTION fn_QuyDoiDiem
        SET @v_SoTienGiam = dbo.fn_QuyDoiDiem(@p_SoDiemMuonDoi);

        -- BƯỚC 5: Tính thành tiền mới sau khi áp dụng giảm giá
        SET @v_ThanhTienMoi = CASE
                                  WHEN (@v_TongTienHD - @v_SoTienGiam) > 0
                                  THEN (@v_TongTienHD - @v_SoTienGiam)
                                  ELSE 0.00
                              END;

        -- BƯỚC 6: TRỪ ĐIỂM khỏi ví điểm của khách hàng
        UPDATE dbo.KhachHang
        SET    DiemTichLuy = DiemTichLuy - @p_SoDiemMuonDoi
        WHERE  MaKH = @p_MaKH;
        -- Nếu bước này lỗi (vi phạm CHECK constraint) → CATCH → ROLLBACK

        -- BƯỚC 7: CẬP NHẬT hóa đơn - ghi đè GiamGia và ThanhTien
        -- [LƯU Ý TƯƠNG THÍCH VỚI PHÂN HỆ POS - bạn làm trigger
        --  trg_TinhThanhTienChiTietHD]: trigger đó tự tính lại
        --  TongTien/ThanhTien = SUM(ChiTietHoaDon.ThanhTien) - GiamGia
        --  MỖI KHI có INSERT/UPDATE vào ChiTietHoaDon.
        --  → Nếu sau khi đổi điểm (UPDATE GiamGia ở đây), POS lại
        --    INSERT/UPDATE thêm ChiTietHoaDon cho cùng MaHD, trigger
        --    POS sẽ TÍNH LẠI ThanhTien dựa trên GiamGia hiện tại (đã
        --    được cập nhật ở đây) → KHÔNG bị đè ngược, tương thích OK.
        --  → Ngược lại, nếu chạy sp_GiaoTacDoiDiem TRƯỚC khi hóa đơn
        --    hoàn tất (còn thêm món), @v_TongTienHD đọc ở Bước 2 có
        --    thể chưa phải tổng cuối cùng. Khuyến nghị: chỉ gọi
        --    sp_GiaoTacDoiDiem SAU khi hóa đơn đã chốt (đã thêm hết
        --    ChiTietHoaDon, trigger POS đã chạy xong).
        UPDATE dbo.HoaDon
        SET    GiamGia   = @v_SoTienGiam,
               ThanhTien = @v_ThanhTienMoi
        WHERE  MaHD = @p_MaHD;

        -- BƯỚC 8: GHI LOG vào bảng lịch sử (audit trail)
        INSERT INTO dbo.LichSuDoiDiem (MaKH, MaHD, SoDiemDoi, SoTienGiam, GhiChu)
        VALUES (
            @p_MaKH,
            @p_MaHD,
            @p_SoDiemMuonDoi,
            @v_SoTienGiam,
            CONCAT(N'Doi ', CAST(@p_SoDiemMuonDoi AS VARCHAR), N' diem | Giam ',
                   FORMAT(@v_SoTienGiam, 'N0'), N' VND | Con lai: ',
                   CAST(@v_DiemHienCo - @p_SoDiemMuonDoi AS VARCHAR), N' diem')
        );

        -- ─── [F] XÁC NHẬN GIAO TÁC - ACID: ATOMICITY + DURABILITY ───────────
        -- ATOMICITY : Xác nhận TẤT CẢ 3 thay đổi (KhachHang, HoaDon,
        --             LichSuDoiDiem) là một khối thống nhất.
        -- DURABILITY: SQL Server ghi vào WAL trước khi trả kết quả.
        COMMIT TRANSACTION;

        SET @p_KetQua = CONCAT(
            '[THANH CONG] ',
            'Da doi: ',         CAST(@p_SoDiemMuonDoi AS VARCHAR),           ' diem | ',
            'Giam gia: ',       FORMAT(@v_SoTienGiam, 'N0'),                  ' VND | ',
            'Thanh tien moi: ', FORMAT(@v_ThanhTienMoi, 'N0'),                ' VND | ',
            'Diem con lai: ',   CAST(@v_DiemHienCo - @p_SoDiemMuonDoi AS VARCHAR), ' diem'
        );

    END TRY
    -- ─── BẪY LỖI - ACID: ATOMICITY ────────────────────────────────────────────
    -- Bắt mọi lỗi SQL runtime → ROLLBACK → không có thay đổi nào được lưu
    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrMsg   NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrSev   INT            = ERROR_SEVERITY();
        DECLARE @ErrState INT            = ERROR_STATE();

        SET @p_KetQua = CONCAT(
            '[LOI HE THONG] Giao tac that bai - Da ROLLBACK toan bo thay doi. ',
            'Chi tiet: ', @ErrMsg
        );

    END CATCH;

    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
END;
GO


-- =============================================================================
-- PHẦN 5: TRIGGER - trg_TuDongCongDiem
-- =============================================================================
-- Mục đích  : Tự động cộng điểm cho khách thân thiết sau mỗi lần mua hàng
-- Quy tắc   : Cứ mỗi 100.000đ ThanhTien = 1 điểm (FLOOR - làm tròn xuống)
-- Ví dụ     : ThanhTien = 350.000đ → FLOOR(350.000/100.000) = 3 điểm
-- =============================================================================
-- ============================================================================
-- !! DA SUA LOI CHI MANG !!
-- Phien ban cu: AFTER INSERT, UPDATE -> Khi INSERT HoaDon moi (ThanhTien = 0),
--   Trigger tinh diem ngay lap tuc -> Khach mua bao nhieu tien cung tich 0 diem.
--   Vi tai thoi diem INSERT, Trigger cua POS chua kip cap nhat ThanhTien
--   (vi chua co ChiTietHoaDon nao) -> "tich diem ma".
-- Phien ban moi: AFTER UPDATE ONLY -> Chi tich diem khi ThanhTien duoc UPDATE
--   chot so xong xuoi boi trigger POS cua Tho.
-- LICH SU: 2026-06-18 - Sua AFTER INSERT,UPDATE -> AFTER UPDATE
-- ============================================================================
CREATE TRIGGER dbo.trg_TuDongCongDiem
ON  dbo.HoaDon
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ xử lý khi cột ThanhTien thực sự bị thay đổi (tối ưu, tránh
    -- trigger chạy thừa khi UPDATE các cột khác như TrangThai)
    IF NOT UPDATE(ThanhTien)
        RETURN;

    BEGIN TRY

        -- Cộng dồn ĐIỂM CHÊNH LỆCH cho tất cả KH xuất hiện trong INSERTED
        -- (hỗ trợ bulk insert/update). So sánh điểm tính từ ThanhTien MỚI
        -- (INSERTED) với điểm tính từ ThanhTien CŨ (DELETED) - với INSERT
        -- thì DELETED rỗng nên ThanhTien CŨ coi như 0.
        UPDATE dbo.KhachHang
        SET    DiemTichLuy = dbo.KhachHang.DiemTichLuy + src.ChenhLechDiem
        FROM   dbo.KhachHang
        INNER JOIN (
            -- Tính tổng điểm CHÊNH LỆCH cho mỗi KH trong batch INSERT/UPDATE
            SELECT
                i.MaKH,
                SUM(
                    FLOOR(ISNULL(i.ThanhTien, 0) / 100000)
                    - FLOOR(ISNULL(d.ThanhTien, 0) / 100000)
                ) AS ChenhLechDiem
            FROM      INSERTED i
            LEFT JOIN DELETED  d ON i.MaHD = d.MaHD
            WHERE  i.MaKH IS NOT NULL     -- Chỉ KH thân thiết (không phải vãng lai)
            GROUP BY i.MaKH
        ) AS src ON dbo.KhachHang.MaKH = src.MaKH
        WHERE  src.ChenhLechDiem <> 0;   -- Tránh UPDATE tốn tài nguyên khi 0 điểm chênh

        PRINT N'[TRIGGER] trg_TuDongCongDiem: Da tu dong cong diem cho khach hang.';

    END TRY
    BEGIN CATCH
        DECLARE @TrigErr NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(N'[TRIGGER LOI - trg_TuDongCongDiem] %s', 16, 1, @TrigErr);
    END CATCH;
END;
GO


-- =============================================================================
-- PHẦN 6: DỮ LIỆU MẪU (Dùng để chạy test)
-- =============================================================================
UPDATE dbo.KhachHang SET TenKH = N'Nguyen Van An',  DiaChi = N'123 Le Loi, TP.HCM'        WHERE MaKH = 'KH001';
UPDATE dbo.KhachHang SET TenKH = N'Tran Thi Bich',  DiaChi = N'456 Nguyen Hue, TP.HCM'   WHERE MaKH = 'KH002';
UPDATE dbo.KhachHang SET TenKH = N'Le Hoang Cuong', DiaChi = N'789 Dinh Tien Hoang, HN'  WHERE MaKH = 'KH003';
UPDATE dbo.KhachHang SET TenKH = N'Pham Thu Ha',    DiaChi = N'12 Bach Dang, Da Nang'    WHERE MaKH = 'KH004';

-- Nếu KH chưa tồn tại (chưa được tạo bởi phân hệ khác) → INSERT mới
IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKH = 'KH001')
    INSERT INTO dbo.KhachHang (MaKH, UserName, Phone, DiemTichLuy, TenKH, DiaChi) VALUES
    ('KH001', 'KH001', '0901234567', 50, N'Nguyen Van An', N'123 Le Loi, TP.HCM');
IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKH = 'KH002')
    INSERT INTO dbo.KhachHang (MaKH, UserName, Phone, DiemTichLuy, TenKH, DiaChi) VALUES
    ('KH002', 'KH002', '0912345678', 200, N'Tran Thi Bich', N'456 Nguyen Hue, TP.HCM');
IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKH = 'KH003')
    INSERT INTO dbo.KhachHang (MaKH, UserName, Phone, DiemTichLuy, TenKH, DiaChi) VALUES
    ('KH003', 'KH003', '0923456789', 5, N'Le Hoang Cuong', N'789 Dinh Tien Hoang, HN');
IF NOT EXISTS (SELECT 1 FROM dbo.KhachHang WHERE MaKH = 'KH004')
    INSERT INTO dbo.KhachHang (MaKH, UserName, Phone, DiemTichLuy, TenKH, DiaChi) VALUES
    ('KH004', 'KH004', '0934567890', 1050, N'Pham Thu Ha', N'12 Bach Dang, Da Nang');
GO

-- Thêm hóa đơn mẫu
-- !! QUAN TRỌNG: Mỗi lần INSERT hóa đơn với ThanhTien > 0 → Trigger
--    trg_TuDongCongDiem tự kích hoạt (AFTER INSERT, UPDATE)!!
-- → Điểm trong bảng KhachHang sẽ tự động tăng sau các lệnh INSERT dưới đây
-- Cụ thể: HD001(500k→+5đ), HD002(1200k→+12đ), HD003(250k→+2đ),
--         HD004(800k→+8đ), HD005(3000k→+30đ)
INSERT INTO dbo.HoaDon (MaHD, MaNV, MaKH, NgayLap, TongTien, GiamGia, ThanhTien, TrangThai) VALUES
('HD001', NULL, 'KH001', CAST(GETDATE() AS DATE),  500000.00,  0.00,  500000.00,  'DaThanhToan'),
('HD002', NULL, 'KH002', CAST(GETDATE() AS DATE), 1200000.00,  0.00, 1200000.00,  'DaThanhToan'),
('HD003', NULL, 'KH003', CAST(GETDATE() AS DATE),  250000.00,  0.00,  250000.00,  'DaThanhToan'),
('HD004', NULL, 'KH002', CAST(GETDATE() AS DATE),  800000.00,  0.00,  800000.00,  'ChuaThanhToan'),
('HD005', NULL, 'KH004', CAST(GETDATE() AS DATE), 3000000.00,  0.00, 3000000.00,  'DaThanhToan');
GO


-- =============================================================================
-- PHẦN 7: KỊCH BẢN TEST
-- =============================================================================
-- Bôi đen từng đoạn test và nhấn F5 để chạy riêng
-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 1: Kiểm tra VIEW - Xem ví điểm tất cả khách hàng
-- ──────────────────────────────────────────────────────────────────────────────
-- Kết quả mong đợi: Điểm của các KH CAO HƠN giá trị ban đầu (Trigger đã cộng)
-- KH001: 50+5=55đ   KH002: 200+12+8=220đ   KH003: 5+2=7đ   KH004: 1050+30=1080đ
SELECT * FROM dbo.v_ViDiemKhachHang;
GO

-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 2: Kiểm tra FUNCTION
-- ──────────────────────────────────────────────────────────────────────────────
SELECT dbo.fn_QuyDoiDiem(10)   AS 'Doi 10 diem';    -- Kết quả: 10000.00 VND
SELECT dbo.fn_QuyDoiDiem(50)   AS 'Doi 50 diem';    -- Kết quả: 50000.00 VND
SELECT dbo.fn_QuyDoiDiem(200)  AS 'Doi 200 diem';   -- Kết quả: 200000.00 VND
SELECT dbo.fn_QuyDoiDiem(0)    AS 'Doi 0 diem';     -- Kết quả: 0.00
SELECT dbo.fn_QuyDoiDiem(NULL) AS 'Doi NULL';       -- Kết quả: 0.00
GO

-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 3: Kiểm tra TRIGGER (tự động cộng điểm)
-- ──────────────────────────────────────────────────────────────────────────────
SELECT MaKH, TenKH, DiemTichLuy AS 'Diem TRUOC khi them HD'
FROM   dbo.KhachHang WHERE MaKH = 'KH001';

-- ThanhTien = 350.000đ → Trigger sẽ cộng FLOOR(350000/100000) = 3 điểm
INSERT INTO dbo.HoaDon (MaHD, MaNV, MaKH, TongTien, GiamGia, ThanhTien, TrangThai)
VALUES ('HD006', NULL, 'KH001', 350000.00, 0.00, 350000.00, 'DaThanhToan');

SELECT MaKH, TenKH, DiemTichLuy AS 'Diem SAU khi them HD (phai tang 3)'
FROM   dbo.KhachHang WHERE MaKH = 'KH001';
GO

-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 4: Kiểm tra PROCEDURE - Ca THÀNH CÔNG
-- ──────────────────────────────────────────────────────────────────────────────
-- KH002 có 220 điểm → đổi 50 điểm cho HD004 (TongTien = 800.000đ)
DECLARE @ket_qua VARCHAR(200);

PRINT 'TRUOC KHI DOI DIEM:';
SELECT MaHD, TongTien, GiamGia, ThanhTien FROM dbo.HoaDon WHERE MaHD = 'HD004';
SELECT MaKH, TenKH, DiemTichLuy FROM dbo.KhachHang WHERE MaKH = 'KH002';

EXEC dbo.sp_GiaoTacDoiDiem 'HD004', 'KH002', 50, @ket_qua OUTPUT;
SELECT @ket_qua AS KetQua;

PRINT 'SAU KHI DOI DIEM:';
SELECT MaHD, TongTien, GiamGia, ThanhTien FROM dbo.HoaDon WHERE MaHD = 'HD004';
SELECT MaKH, TenKH, DiemTichLuy FROM dbo.KhachHang WHERE MaKH = 'KH002';
SELECT TOP 5 * FROM dbo.LichSuDoiDiem ORDER BY ThoiGian DESC;
GO

-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 5: Kiểm tra PROCEDURE - Ca THẤT BẠI (không đủ điểm)
-- ──────────────────────────────────────────────────────────────────────────────
DECLARE @ket_qua2 VARCHAR(200);
EXEC dbo.sp_GiaoTacDoiDiem 'HD003', 'KH003', 100, @ket_qua2 OUTPUT;
SELECT @ket_qua2 AS KetQua;
-- Kết quả mong đợi: [THONG BAO] Khong du diem!

SELECT MaKH, TenKH, DiemTichLuy AS 'Phai khong doi' FROM dbo.KhachHang WHERE MaKH = 'KH003';
GO

-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 6: Kiểm tra PROCEDURE - Ca THẤT BẠI (hóa đơn không tồn tại)
-- ──────────────────────────────────────────────────────────────────────────────
DECLARE @ket_qua3 VARCHAR(200);
EXEC dbo.sp_GiaoTacDoiDiem 'HD_SAI', 'KH001', 10, @ket_qua3 OUTPUT;
SELECT @ket_qua3 AS KetQua;
-- Kết quả mong đợi: [LOI] Khong tim thay hoa don
GO

-- ──────────────────────────────────────────────────────────────────────────────
-- TEST 7: Xem View sau khi đã thực hiện nhiều thao tác
-- ──────────────────────────────────────────────────────────────────────────────
SELECT * FROM dbo.v_ViDiemKhachHang ORDER BY DiemHienCo DESC;
GO


-- =============================================================================
-- PHẦN 8: MINH HỌA 4 TÍNH CHẤT ACID
-- =============================================================================

-- ════════════════════════════════════════════════════════════════════
-- A - ATOMICITY: "Tất cả hoặc không có gì"
-- ════════════════════════════════════════════════════════════════════
/*
  VẤN ĐỀ: Bước 1 trừ điểm thành công, Bước 2 cập nhật HoaDon lỗi
  → Khách mất điểm nhưng không được giảm giá!

  KHẮC PHỤC: BEGIN TRANSACTION + TRY/CATCH + ROLLBACK TRANSACTION
  → Nếu có 1 lệnh lỗi → tất cả bị hoàn tác về trạng thái ban đầu
*/
BEGIN TRANSACTION;
    UPDATE dbo.KhachHang SET DiemTichLuy = DiemTichLuy - 10 WHERE MaKH = 'KH001';
    -- Giả lập lỗi (bỏ comment để thấy lỗi):
    -- UPDATE BangKhongTonTai SET x = 1 WHERE y = 'z';
ROLLBACK TRANSACTION;  -- Điểm KH001 trở về như cũ

SELECT MaKH, DiemTichLuy AS 'Diem (phai khong doi)' FROM dbo.KhachHang WHERE MaKH = 'KH001';
GO


-- ════════════════════════════════════════════════════════════════════
-- C - CONSISTENCY: "Dữ liệu luôn hợp lệ"
-- ════════════════════════════════════════════════════════════════════
/*
  VẤN ĐỀ: KH003 có 7 điểm → UPDATE SET DiemTichLuy = 7 - 100 = -93 (VÔ LÝ!)

  KHẮC PHỤC (2 lớp):
  Lớp 1 - Logic SP: IF @v_DiemHienCo < @p_SoDiemMuonDoi → ROLLBACK; RETURN
  Lớp 2 - DDL:      CONSTRAINT CHK_DiemKhongAm CHECK (DiemTichLuy >= 0)
*/
-- Bỏ comment dòng dưới để thấy lỗi:
-- UPDATE dbo.KhachHang SET DiemTichLuy = -50 WHERE MaKH = 'KH001';
-- → Msg 547: The UPDATE statement conflicted with the CHECK constraint "CHK_DiemKhongAm"
GO


-- ════════════════════════════════════════════════════════════════════
-- I - ISOLATION: "Các giao tác không ảnh hưởng nhau"
-- ════════════════════════════════════════════════════════════════════
/*
  VẤN ĐỀ: 2 nhân viên cùng đổi điểm KH002 → race condition → mất điểm

  KHẮC PHỤC:
  1. SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
  2. SELECT ... FROM KhachHang WITH (UPDLOCK, ROWLOCK) → row lock
  → Session khác bị BLOCK cho đến khi ta COMMIT/ROLLBACK
*/
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRANSACTION;
    SELECT DiemTichLuy AS 'Dang giu lock - Session khac phai cho'
    FROM   dbo.KhachHang WITH (UPDLOCK, ROWLOCK)
    WHERE  MaKH = 'KH002';
ROLLBACK TRANSACTION;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO


-- ════════════════════════════════════════════════════════════════════
-- D - DURABILITY: "Dữ liệu không bị mất sau COMMIT"
-- ════════════════════════════════════════════════════════════════════
/*
  VẤN ĐỀ: Mất điện ngay sau COMMIT → dữ liệu có thể bị mất

  KHẮC PHỤC (SQL Server):
  SQL Server dùng Write-Ahead Logging (WAL) mặc định:
  → Ghi vào transaction log (.ldf) TRƯỚC khi ghi ra data file (.mdf)
  → Sau COMMIT, engine đảm bảo log đã flush xuống đĩa
  → Khi restart: REDO phục hồi giao tác đã COMMIT, UNDO hủy chưa COMMIT
*/
SELECT name, value_in_use AS GiaTri
FROM   sys.configurations
WHERE  name LIKE '%recovery%';

-- Kiểm tra storage của các bảng (SQL Server: sys.tables thay vì information_schema ENGINE)
SELECT
    t.name              AS TABLE_NAME,
    p.data_compression_desc AS StorageType,
    SUM(a.total_pages) * 8 AS TotalKB
FROM sys.tables t
INNER JOIN sys.indexes    i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE  t.name IN ('KhachHang', 'HoaDon', 'LichSuDoiDiem')
  AND  t.schema_id = SCHEMA_ID('dbo')
GROUP BY t.name, p.data_compression_desc;
GO

-- =============================================================================
-- END OF FILE - PHÂN HỆ KHÁCH HÀNG & TÍCH ĐIỂM THƯỞNG
-- =============================================================================
-- Tóm tắt những gì đã tạo:
--   ✓ Function  dbo.fn_QuyDoiDiem         : Quy đổi điểm → tiền (1đ = 1.000đ)
--   ✓ View      dbo.v_ViDiemKhachHang     : Xem ví điểm + thống kê KH
--   ✓ Procedure dbo.sp_GiaoTacDoiDiem     : Đổi điểm, đầy đủ 4 tính chất ACID
--   ✓ Trigger   dbo.trg_TuDongCongDiem    : Tự cộng điểm khi bán hàng
--   ✓ ACID      Atomicity                 : BEGIN TRAN + TRY/CATCH + ROLLBACK
--   ✓ ACID      Consistency               : CHECK constraint + kiểm tra nghiệp vụ
--   ✓ ACID      Isolation                 : WITH (UPDLOCK,ROWLOCK) + REPEATABLE READ
--   ✓ ACID      Durability                : COMMIT + SQL Server WAL
--   ✓ Database  QuanLySieuThiMini         : Chung với phân hệ NhapKho (bạn Duy)
-- =============================================================================
