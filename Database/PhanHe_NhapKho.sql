/*
================================================================================
  PHÂN HỆ QUẢN LÝ NHẬP KHO - DUYỆT HÀNG TỪ NHÀ CUNG CẤP
  Người thực hiện : Duy
  Cơ sở dữ liệu   : QuanLySieuThiMini
  Mô tả           : Quản lý đầu vào siêu thị – Duyệt hóa đơn nhập hàng,
                    chặn hàng hết HSD, tự động cập nhật TonKho.
================================================================================
  Danh sách đối tượng:
    [1] FUNCTION   : fn_KiemTraHanSuDung   – Kiểm tra & tính số ngày còn lại HSD
    [2] VIEW       : v_BaoCaoNhapKho        – Báo cáo lô hàng nhập & đối soát NCC
    [3] PROCEDURE  : sp_GiaoTacNhapKho     – Giao tác nhập kho (ACID-compliant)
    [4] TRIGGER    : trg_CapNhatTonKho      – Tự động cộng dồn vào TonKho

  Tính chất ACID:
    A – Atomicity    : BEGIN TRANSACTION + TRY/CATCH + ROLLBACK
    C – Consistency  : CHECK CONSTRAINT, RAISERROR, fn kiểm tra HSD
    I – Isolation    : SERIALIZABLE (SET TRANSACTION ISOLATION LEVEL)
    D – Durability   : COMMIT; dữ liệu ghi vào đĩa vĩnh viễn sau COMMIT
================================================================================
*/

USE [QuanLySieuThiMini];
GO

-- ============================================================
-- XÓA ĐỐI TƯỢNG CŨ (nếu tồn tại) để chạy lại script an toàn
-- ============================================================
IF OBJECT_ID('dbo.trg_CapNhatTonKho',     'TR') IS NOT NULL DROP TRIGGER  dbo.trg_CapNhatTonKho;
IF OBJECT_ID('dbo.sp_GiaoTacNhapKho',     'P')  IS NOT NULL DROP PROCEDURE dbo.sp_GiaoTacNhapKho;
IF OBJECT_ID('dbo.v_BaoCaoNhapKho',       'V')  IS NOT NULL DROP VIEW      dbo.v_BaoCaoNhapKho;
IF OBJECT_ID('dbo.fn_KiemTraHanSuDung',   'FN') IS NOT NULL DROP FUNCTION  dbo.fn_KiemTraHanSuDung;
GO


-- ============================================================
--  [1] FUNCTION: fn_KiemTraHanSuDung
-- ============================================================
-- Mục đích : Tính số ngày còn lại từ hôm nay đến HSD.
--            Trả về số ngày còn lại (< 0 = đã hết hạn).
-- Tính chất ACID liên quan: Consistency – hàm này được gọi
--   bên trong sp_GiaoTacNhapKho để bảo đảm tính nhất quán
--   nghiệp vụ: không cho nhập hàng đã hoặc sắp hết hạn.
-- ============================================================
CREATE FUNCTION dbo.fn_KiemTraHanSuDung
(
    @HanSuDung   DATE,
    @NgayNhap    DATE
)
RETURNS INT
AS
BEGIN
    RETURN DATEDIFF(DAY, @NgayNhap, @HanSuDung);
END;
GO


-- ============================================================
--  [2] VIEW: v_BaoCaoNhapKho
-- ============================================================
-- Mục đích : Hiển thị toàn bộ lô hàng đã nhập kèm HSD và tên
--            NCC để kế toán/thủ kho đối soát công nợ.
-- ============================================================
CREATE VIEW dbo.v_BaoCaoNhapKho
AS
SELECT
    pn.MaPN                                          AS [Ma Phieu Nhap],
    CONVERT(VARCHAR(16), pn.NgayNhap, 120)            AS [Ngay Nhap],
    ncc.MaNCC                                         AS [Ma NCC],
    ncc.NameNCC                                       AS [Ten Nha Cung Cap],
    ncc.Phone                                         AS [SDT NCC],
    nv.HoTen                                          AS [Nhan Vien Duyet],
    ctpn.MaSP                                         AS [Ma SP],
    sp.TenSP                                          AS [Ten San Pham],
    sp.DonVi                                          AS [DVT],
    ctpn.SoLuongNhap                                  AS [So Luong Nhap],
    ctpn.DonGiaNhap                                   AS [Don Gia Nhap VND],
    ctpn.SoLuongNhap * ctpn.DonGiaNhap               AS [Thanh Tien Nhap VND],
    ctpn.HanSuDung                                    AS [Han Su Dung],
    dbo.fn_KiemTraHanSuDung(ctpn.HanSuDung, CAST(GETDATE() AS DATE))
                                                      AS [So Ngay Con Lai],
    CASE
        WHEN dbo.fn_KiemTraHanSuDung(ctpn.HanSuDung, CAST(GETDATE() AS DATE)) > 0
             THEN N'CON HAN'
        ELSE N'HET HAN'
    END                                               AS [Trang Thai HSD],
    pn.TongTienNhap                                   AS [Tong Tien Phieu VND]
FROM
    dbo.PhieuNhap               pn
    INNER JOIN dbo.NhaCungCap   ncc  ON pn.MaNCC  = ncc.MaNCC
    INNER JOIN dbo.NhanVien     nv   ON pn.MaNV   = nv.MaNV
    INNER JOIN dbo.ChiTietPhieuNhap ctpn ON pn.MaPN = ctpn.MaPN
    INNER JOIN dbo.SanPham      sp   ON ctpn.MaSP = sp.MaSP;
GO


-- ============================================================
--  [3] STORED PROCEDURE: sp_GiaoTacNhapKho
-- ============================================================
-- Tính chất ACID:
-- [A] ATOMICITY  : BEGIN TRAN + TRY/CATCH + ROLLBACK
--                  (tất cả bước thành công hoặc không bước nào)
-- [C] CONSISTENCY: fn_KiemTraHanSuDung + RAISERROR chặn HSD
--                  + kiểm tra SL > 0 và đơn giá > 0
-- [I] ISOLATION  : SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
--                  ngăn phantom read khi 2 session cùng MaPN
-- [D] DURABILITY : COMMIT đảm bảo WAL đã flush trước khi trả về
-- ============================================================
CREATE PROCEDURE dbo.sp_GiaoTacNhapKho
    @MaPN        VARCHAR(15),
    @MaNCC       VARCHAR(10),
    @MaNV        VARCHAR(10),
    @MaSP        VARCHAR(10),
    @SoLuongNhap INT,
    @DonGiaNhap  MONEY,
    @HanSuDung   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- [I] ISOLATION: ngăn phantom read / duplicate key race condition
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    -- [A] ATOMICITY: mở giao tác
    BEGIN TRANSACTION;

    BEGIN TRY

        -- Bước 0: Kiểm tra tham số đầu vào
        IF @SoLuongNhap <= 0
        BEGIN
            RAISERROR(N'[LOI NGHIEP VU] So luong nhap phai lon hon 0.', 16, 1);
            RETURN;
        END;

        IF @DonGiaNhap <= 0
        BEGIN
            RAISERROR(N'[LOI NGHIEP VU] Don gia nhap phai lon hon 0.', 16, 1);
            RETURN;
        END;

        -- [C] CONSISTENCY: kiem tra han su dung bang Function
        DECLARE @NgayConLai INT;
        SET @NgayConLai = dbo.fn_KiemTraHanSuDung(@HanSuDung, CAST(GETDATE() AS DATE));

        IF @NgayConLai <= 0
        BEGIN
            RAISERROR(
                N'[TU CHOI NHAP] San pham %s da het han su dung (HSD: %s). Hang khong du dieu kien nhap kho!',
                16, 1,
                @MaSP,
                CONVERT(VARCHAR(10), @HanSuDung, 103)
            );
            RETURN;
        END;

        -- Bước 1: Tạo PhieuNhap header (nếu chưa có – hỗ trợ nhiều SP/phiếu)
        IF NOT EXISTS (SELECT 1 FROM dbo.PhieuNhap WHERE MaPN = @MaPN)
        BEGIN
            INSERT INTO dbo.PhieuNhap (MaPN, NgayNhap, MaNCC, MaNV, TongTienNhap)
            VALUES (@MaPN, GETDATE(), @MaNCC, @MaNV, 0);
        END;

        -- Bước 2: INSERT chi tiết phiếu nhập
        --         Trigger trg_CapNhatTonKho sẽ tự chạy ngay sau đây
        INSERT INTO dbo.ChiTietPhieuNhap (MaPN, MaSP, SoLuongNhap, DonGiaNhap, HanSuDung)
        VALUES (@MaPN, @MaSP, @SoLuongNhap, @DonGiaNhap, @HanSuDung);

        -- Bước 3: Cập nhật TongTienNhap trên PhieuNhap
        UPDATE dbo.PhieuNhap
        SET    TongTienNhap = (
                    SELECT ISNULL(SUM(SoLuongNhap * DonGiaNhap), 0)
                    FROM   dbo.ChiTietPhieuNhap
                    WHERE  MaPN = @MaPN
               )
        WHERE  MaPN = @MaPN;

        -- [D] DURABILITY: commit – SQL Server đảm bảo WAL đã flush
        COMMIT TRANSACTION;

        PRINT N'NHAP KHO THANH CONG!'
            + N' | Phieu: ' + @MaPN
            + N' | SP: '    + @MaSP
            + N' | SL: '    + CAST(@SoLuongNhap AS VARCHAR)
            + N' | HSD con: '+ CAST(@NgayConLai AS VARCHAR) + N' ngay';

    END TRY
    BEGIN CATCH

        -- [A] ATOMICITY: rollback toàn bộ khi có lỗi bất kỳ
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE
            @ErrMsg   NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrSev   INT            = ERROR_SEVERITY(),
            @ErrState INT            = ERROR_STATE();

        RAISERROR(N'[SP_GIAOTACNHAPKHO - LOI] %s', @ErrSev, @ErrState, @ErrMsg);

    END CATCH;

    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
END;
GO


-- ============================================================
--  [4] TRIGGER: trg_CapNhatTonKho
-- ============================================================
-- Cài trên : ChiTietPhieuNhap – AFTER INSERT
-- Mục đích : Tự động cộng dồn SoLuongTonKho vào kho tổng K01.
--            Nếu SP chưa có trong TonKho → INSERT bản ghi mới.
-- Tính ACID:
-- [A] Chạy trong cùng giao tác của INSERT → rollback cùng SP
-- [C] Đảm bảo TonKho luôn đúng với thực tế nhập
-- ============================================================
CREATE TRIGGER dbo.trg_CapNhatTonKho
ON  dbo.ChiTietPhieuNhap
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaKhoTong VARCHAR(10) = 'K01';

    BEGIN TRY

        -- MERGE: cộng dồn nếu đã có, INSERT mới nếu chưa có
        MERGE dbo.TonKho AS tk
        USING (
            SELECT MaSP, SUM(SoLuongNhap) AS TongNhap
            FROM   INSERTED
            GROUP BY MaSP
        ) AS src ON (tk.MaKho = @MaKhoTong AND tk.MaSP = src.MaSP)

        WHEN MATCHED THEN
            UPDATE SET tk.SoLuongTonKho = tk.SoLuongTonKho + src.TongNhap

        WHEN NOT MATCHED BY TARGET THEN
            INSERT (MaKho, MaSP, SoLuongTonKho)
            VALUES (@MaKhoTong, src.MaSP, src.TongNhap);

        PRINT N'[TRIGGER] trg_CapNhatTonKho: Da cap nhat TonKho (Kho: ' + @MaKhoTong + N')';

    END TRY
    BEGIN CATCH
        DECLARE @TrigErr NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(N'[TRIGGER LOI - trg_CapNhatTonKho] %s', 16, 1, @TrigErr);
    END CATCH;
END;
GO


-- ============================================================
--  DEMO: 4 KỊCH BẢN KIỂM TRA ACID
-- ============================================================

PRINT N'';
PRINT N'=== DEMO PHAN HE NHAP KHO ===';

-- KB-1: Nhập hợp lệ (A + D + C)
PRINT N'';
PRINT N'[KB-1] Nhap hop le: SP001 – 200 hop – HSD 2027-06-01';
PRINT N'TonKho K01/SP001 TRUOC:';
SELECT MaKho, MaSP, SoLuongTonKho FROM dbo.TonKho WHERE MaKho='K01' AND MaSP='SP001';

EXEC dbo.sp_GiaoTacNhapKho
    @MaPN='PN260612001', @MaNCC='NCC01', @MaNV='NV003',
    @MaSP='SP001', @SoLuongNhap=200, @DonGiaNhap=27000, @HanSuDung='2027-06-01';

PRINT N'TonKho K01/SP001 SAU:';
SELECT MaKho, MaSP, SoLuongTonKho FROM dbo.TonKho WHERE MaKho='K01' AND MaSP='SP001';


-- KB-2: Nhiều SP trên 1 phiếu
PRINT N'';
PRINT N'[KB-2] Nhieu SP tren cung phieu PN260612002';
EXEC dbo.sp_GiaoTacNhapKho
    @MaPN='PN260612002', @MaNCC='NCC02', @MaNV='NV003',
    @MaSP='SP002', @SoLuongNhap=150, @DonGiaNhap=9000, @HanSuDung='2027-09-01';
EXEC dbo.sp_GiaoTacNhapKho
    @MaPN='PN260612002', @MaNCC='NCC02', @MaNV='NV003',
    @MaSP='SP003', @SoLuongNhap=120, @DonGiaNhap=8000, @HanSuDung='2027-08-15';
SELECT MaKho, MaSP, SoLuongTonKho FROM dbo.TonKho WHERE MaKho='K01' AND MaSP IN ('SP002','SP003');


-- KB-3: [C - CONSISTENCY] Từ chối hàng hết HSD
PRINT N'';
PRINT N'[KB-3] [C] Tu choi hang HET HAN (HSD = 2020-01-01)';
BEGIN TRY
    EXEC dbo.sp_GiaoTacNhapKho
        @MaPN='PN260612099', @MaNCC='NCC01', @MaNV='NV003',
        @MaSP='SP001', @SoLuongNhap=50, @DonGiaNhap=27000, @HanSuDung='2020-01-01';
END TRY
BEGIN CATCH
    PRINT N'>>> DUNG: He thong da tu choi – ' + ERROR_MESSAGE();
END CATCH;
PRINT N'Kiem tra PN260612099 (phai rong – khong duoc INSERT):';
SELECT MaPN FROM dbo.PhieuNhap WHERE MaPN='PN260612099';


-- KB-4: [A - ATOMICITY] SP không tồn tại → ROLLBACK
PRINT N'';
PRINT N'[KB-4] [A] SP khong ton tai SPXXX – toan bo ROLLBACK';
BEGIN TRY
    EXEC dbo.sp_GiaoTacNhapKho
        @MaPN='PN260612088', @MaNCC='NCC01', @MaNV='NV003',
        @MaSP='SPXXX', @SoLuongNhap=10, @DonGiaNhap=50000, @HanSuDung='2027-12-01';
END TRY
BEGIN CATCH
    PRINT N'>>> DUNG: Giao tac rollback – ' + ERROR_MESSAGE();
END CATCH;
PRINT N'Kiem tra PN260612088 (phai rong – da rollback):';
SELECT MaPN FROM dbo.PhieuNhap WHERE MaPN='PN260612088';


-- Báo cáo tổng hợp
PRINT N'';
PRINT N'=== BAO CAO NHAP KHO (v_BaoCaoNhapKho) ===';
SELECT * FROM dbo.v_BaoCaoNhapKho ORDER BY [Ngay Nhap] DESC, [Ma Phieu Nhap];
GO

/*
============================================================
  THUYẾT MINH 4 TÍNH CHẤT ACID
============================================================

  A – ATOMICITY (Tính nguyên tử)
  --------------------------------
  VAN DE:
    Nếu INSERT PhieuNhap thành công nhưng INSERT ChiTietPhieuNhap
    thất bại (VD: FK vi phạm, timeout), TonKho sẽ không được cập
    nhật → dữ liệu bị mất đồng bộ.

  KHAC PHUC TRONG CODE:
    BEGIN TRANSACTION → thực hiện INSERT PhieuNhap (Bước 1)
    → INSERT ChiTietPhieuNhap (Bước 2, trigger chạy tại đây)
    → UPDATE TongTienNhap (Bước 3) → COMMIT.
    Nếu bất kỳ bước nào ném exception → CATCH → ROLLBACK.
    => Hoặc cả 3 bước đều được lưu, hoặc không gì được lưu.

  ============================================================

  C – CONSISTENCY (Tính nhất quán)
  ----------------------------------
  VAN DE:
    Siêu thị có thể vô tình nhập hàng hết HSD, hoặc nhập số
    lượng âm, đơn giá = 0 → vi phạm quy tắc kinh doanh.

  KHAC PHUC TRONG CODE:
    • fn_KiemTraHanSuDung(@HanSuDung, GETDATE()): nếu trả về ≤ 0
      → RAISERROR ngay lập tức, không INSERT gì cả.
    • IF @SoLuongNhap <= 0 / @DonGiaNhap <= 0 → RAISERROR.
    • FK CONSTRAINT: MaSP, MaNCC, MaNV phải tồn tại trong bảng cha.
    • Trigger cộng dồn TonKho → kho luôn phản ánh đúng thực tế.

  ============================================================

  I – ISOLATION (Tính cô lập)
  -----------------------------
  VAN DE:
    2 nhân viên cùng lúc tạo phiếu cùng MaPN → race condition
    → cả 2 kiểm tra IF NOT EXISTS đều thấy "chưa có" → cả 2
    cùng INSERT → vi phạm PRIMARY KEY.
    Với READ COMMITTED (mặc định), T2 có thể đọc dữ liệu chưa
    commit của T1 → dirty read / phantom read.

  KHAC PHUC TRONG CODE:
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    → SQL Server đặt range lock trên MaPN trước khi đọc.
    → T2 bị block cho đến khi T1 COMMIT hoặc ROLLBACK xong.
    → Loại bỏ hoàn toàn phantom read và duplicate key race.

  ============================================================

  D – DURABILITY (Tính bền vững)
  --------------------------------
  VAN DE:
    Mất điện, crash server ngay sau COMMIT → dữ liệu chưa kịp
    ghi xuống đĩa có thể bị mất.

  KHAC PHUC TRONG CODE & HE THONG:
    • SQL Server dùng Write-Ahead Log (WAL): mọi thay đổi được
      ghi vào file log (.ldf) TRƯỚC khi ghi ra data file (.mdf).
    • Sau COMMIT TRANSACTION, engine đảm bảo log đã được flush
      xuống đĩa (force log at commit protocol).
    • Khi server restart sau sự cố:
        REDO  → phục hồi các giao tác đã COMMIT chưa kịp ghi .mdf
        UNDO  → hủy các giao tác chưa COMMIT
    • Lệnh COMMIT TRANSACTION trong SP là điểm đảm bảo Durability.
    • Bổ sung tùy chọn: bật SQL Server Always On / Database Mirror
      để Durability cấp độ cao hơn.

============================================================
*/
