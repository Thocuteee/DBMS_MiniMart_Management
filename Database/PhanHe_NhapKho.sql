/*
================================================================================

  Danh sach doi tuong:
    [1] FUNCTION   : fn_KiemTraHanSuDung   - Kiem tra & tinh so ngay con lai HSD
    [2] VIEW       : v_BaoCaoNhapKho        - Bao cao lo hang nhap & doi soat NCC
    [3] PROCEDURE  : sp_GiaoTacNhapKho     - Giao tac nhap kho (ACID-compliant)
    [4] TRIGGER    : DA XOA BO - Ly do: gan cung MaKho = 'K01' trong Trigger
                     khien he thong mat linh hoat. Chuyen logic MERGE truc tiep
                     vao ben trong Stored Procedure voi tham so @MaKho tu Java.

  Tinh chat ACID:
    A - Atomicity    : BEGIN TRANSACTION + TRY/CATCH + ROLLBACK
    C - Consistency  : CHECK CONSTRAINT, RAISERROR, fn kiem tra HSD
    I - Isolation    : SERIALIZABLE (SET TRANSACTION ISOLATION LEVEL)
    D - Durability   : COMMIT; du lieu ghi vao dia vinh vien sau COMMIT
================================================================================

*/

USE [QuanLySieuThiMini];
GO

-- ============================================================
-- XOA DOI TUONG CU (neu ton tai) de chay lai script an toan
-- ============================================================
-- !! XOA TRIGGER CU - KHONG CON SU DUNG !!
IF OBJECT_ID('dbo.trg_CapNhatTonKho',     'TR') IS NOT NULL DROP TRIGGER  dbo.trg_CapNhatTonKho;
IF OBJECT_ID('dbo.sp_GiaoTacNhapKho',     'P')  IS NOT NULL DROP PROCEDURE dbo.sp_GiaoTacNhapKho;
IF OBJECT_ID('dbo.v_BaoCaoNhapKho',       'V')  IS NOT NULL DROP VIEW      dbo.v_BaoCaoNhapKho;
IF OBJECT_ID('dbo.fn_KiemTraHanSuDung',   'FN') IS NOT NULL DROP FUNCTION  dbo.fn_KiemTraHanSuDung;
GO


-- ============================================================
--  [1] FUNCTION: fn_KiemTraHanSuDung
-- ============================================================
-- Muc dich : Tinh so ngay con lai tu hom nay den HSD.
--            Tra ve so ngay con lai (< 0 = da het han).
-- Tinh chat ACID lien quan: Consistency - ham nay duoc goi
--   ben trong sp_GiaoTacNhapKho de bao dam tinh nhat quan
--   nghiep vu: khong cho nhap hang da hoac sap het han.
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
-- Muc dich : Hien thi toan bo lo hang da nhap kem HSD va ten
--            NCC de ke toan/thu kho doi soat cong no.
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
-- !! DA SUA LOI CHI MANG !!
-- Phien ban cu: Trigger trg_CapNhatTonKho gan cung K01 -> mat linh hoat.
-- Phien ban moi: Them tham so @MaKho, logic MERGE nam trong SP,
--                Java/Backend chi dinh kho nao (K01 hoac K02) tuy y.
--
-- Tinh chat ACID:
-- [A] ATOMICITY  : BEGIN TRAN + TRY/CATCH + ROLLBACK
-- [C] CONSISTENCY: fn_KiemTraHanSuDung + RAISERROR chan HSD
-- [I] ISOLATION  : SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
-- [D] DURABILITY : COMMIT dam bao WAL da flush truoc khi tra ve
-- ============================================================
CREATE PROCEDURE dbo.sp_GiaoTacNhapKho
    @MaPN        VARCHAR(15),
    @MaNCC       VARCHAR(10),
    @MaNV        VARCHAR(10),
    @MaKho       VARCHAR(10),       -- !! MOI: Nhan MaKho linh hoat tu Java !!
    @MaSP        VARCHAR(10),
    @SoLuongNhap INT,
    @DonGiaNhap  MONEY,
    @HanSuDung   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- [I] ISOLATION: ngan phantom read / duplicate key race condition
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    -- [A] ATOMICITY: mo giao tac
    BEGIN TRANSACTION;

    BEGIN TRY

        -- Buoc 0: Kiem tra tham so dau vao
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

        -- Kiem tra MaKho co ton tai khong
        IF NOT EXISTS (SELECT 1 FROM dbo.Kho WHERE MaKho = @MaKho)
        BEGIN
            RAISERROR(N'[LOI NGHIEP VU] Ma kho "%s" khong ton tai trong he thong!', 16, 1, @MaKho);
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

        -- Buoc 1: Tao PhieuNhap header (neu chua co - ho tro nhieu SP/phieu)
        IF NOT EXISTS (SELECT 1 FROM dbo.PhieuNhap WHERE MaPN = @MaPN)
        BEGIN
            INSERT INTO dbo.PhieuNhap (MaPN, NgayNhap, MaNCC, MaNV, TongTienNhap)
            VALUES (@MaPN, GETDATE(), @MaNCC, @MaNV, 0);
        END;

        -- Buoc 2: INSERT chi tiet phieu nhap
        INSERT INTO dbo.ChiTietPhieuNhap (MaPN, MaSP, SoLuongNhap, DonGiaNhap, HanSuDung)
        VALUES (@MaPN, @MaSP, @SoLuongNhap, @DonGiaNhap, @HanSuDung);

        -- ============================================================
        -- Buoc 3: CAP NHAT TON KHO (THAY THE TRIGGER CU)
        -- ============================================================
        -- Logic MERGE duoc chuyen tu trigger trg_CapNhatTonKho vao day
        -- de nhan tham so @MaKho linh hoat thay vi gan cung 'K01'.
        -- MERGE xu ly 2 truong hop:
        --   MATCHED     -> SP da co trong kho -> cong don so luong
        --   NOT MATCHED -> SP chua co trong kho -> tao ban ghi moi
        -- ============================================================
        MERGE dbo.TonKho AS tk
        USING (
            SELECT @MaKho AS MaKho, @MaSP AS MaSP, @SoLuongNhap AS SoLuongNhap
        ) AS src ON (tk.MaKho = src.MaKho AND tk.MaSP = src.MaSP)

        WHEN MATCHED THEN
            UPDATE SET tk.SoLuongTonKho = tk.SoLuongTonKho + src.SoLuongNhap

        WHEN NOT MATCHED BY TARGET THEN
            INSERT (MaKho, MaSP, SoLuongTonKho)
            VALUES (src.MaKho, src.MaSP, src.SoLuongNhap);

        -- Buoc 4: Cap nhat TongTienNhap tren PhieuNhap
        UPDATE dbo.PhieuNhap
        SET    TongTienNhap = (
                    SELECT ISNULL(SUM(SoLuongNhap * DonGiaNhap), 0)
                    FROM   dbo.ChiTietPhieuNhap
                    WHERE  MaPN = @MaPN
               )
        WHERE  MaPN = @MaPN;

        -- [D] DURABILITY: commit - SQL Server dam bao WAL da flush
        COMMIT TRANSACTION;

        PRINT N'NHAP KHO THANH CONG!'
            + N' | Phieu: '  + @MaPN
            + N' | Kho: '    + @MaKho
            + N' | SP: '     + @MaSP
            + N' | SL: '     + CAST(@SoLuongNhap AS VARCHAR)
            + N' | HSD con: '+ CAST(@NgayConLai AS VARCHAR) + N' ngay';

    END TRY
    BEGIN CATCH

        -- [A] ATOMICITY: rollback toan bo khi co loi bat ky
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE
            @ErrMsg   NVARCHAR(4000) = ERROR_MESSAGE(),
            @ErrSev   INT            = ERROR_SEVERITY(),
            @ErrState INT            = ERROR_STATE();

        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        RAISERROR(N'[SP_GIAOTACNHAPKHO - LOI] %s', @ErrSev, @ErrState, @ErrMsg);

    END CATCH;
END;
GO

-- ============================================================
--  [4] TRIGGER: trg_CapNhatTonKho  -->  DA XOA BO
-- ============================================================
-- !! KHONG TAO TRIGGER NUA !!
-- LY DO XOA:
--   Phien ban cu gan cung DECLARE @MaKhoTong = 'K01' trong Trigger.
--   Dieu nay khien moi lo hang nhap deu bi ep vao kho K01 bat ke
--   Java/Backend truyen kho nao. Neu sieu thi muon nap hang thang
--   len quay POS (K02) de ban lien thi Trigger se "mu thong tin"
--   va chuyen nguoc hang ve K01 -> sai du lieu nghiem trong.
--
-- GIAI PHAP:
--   Logic MERGE da duoc chuyen vao ben trong sp_GiaoTacNhapKho
--   (Buoc 3) voi tham so @MaKho linh hoat. Java chi can truyen
--   @MaKho = 'K01' (kho tong) hoac @MaKho = 'K02' (quay POS)
--   tuy theo nghiep vu thuc te.
-- ============================================================


-- ============================================================
--  DEMO: 4 KICH BAN KIEM TRA ACID
-- ============================================================

PRINT N'';
PRINT N'=== DEMO PHAN HE NHAP KHO (DA SUA LOI - KHONG CON TRIGGER) ===';

-- KB-1: Nhap hop le vao Kho Tong K01
PRINT N'';
PRINT N'[KB-1] Nhap hop le: SP001 - 200 hop - HSD 2027-06-01 -> KHO K01';
PRINT N'TonKho K01/SP001 TRUOC:';
SELECT MaKho, MaSP, SoLuongTonKho FROM dbo.TonKho WHERE MaKho='K01' AND MaSP='SP001';

EXEC dbo.sp_GiaoTacNhapKho
    @MaPN='PN260612001', @MaNCC='NCC01', @MaNV='NV003',
    @MaKho='K01',        -- Nhap vao kho tong
    @MaSP='SP001', @SoLuongNhap=200, @DonGiaNhap=27000, @HanSuDung='2027-06-01';

PRINT N'TonKho K01/SP001 SAU:';
SELECT MaKho, MaSP, SoLuongTonKho FROM dbo.TonKho WHERE MaKho='K01' AND MaSP='SP001';


-- KB-2: Nhap thang len Quay POS K02 (tinh nang moi - truoc day bi ep K01)
PRINT N'';
PRINT N'[KB-2] Nhap THANG len quay POS K02 (tinh nang moi nho xoa Trigger)';
EXEC dbo.sp_GiaoTacNhapKho
    @MaPN='PN260612002', @MaNCC='NCC02', @MaNV='NV003',
    @MaKho='K02',        -- !! Nhap thang len quay POS - khong qua K01 !!
    @MaSP='SP002', @SoLuongNhap=150, @DonGiaNhap=9000, @HanSuDung='2027-09-01';
EXEC dbo.sp_GiaoTacNhapKho
    @MaPN='PN260612002', @MaNCC='NCC02', @MaNV='NV003',
    @MaKho='K02',
    @MaSP='SP003', @SoLuongNhap=120, @DonGiaNhap=8000, @HanSuDung='2027-08-15';
PRINT N'TonKho K02 sau KB-2 (hang da len thang quay):';
SELECT MaKho, MaSP, SoLuongTonKho FROM dbo.TonKho WHERE MaKho='K02' AND MaSP IN ('SP002','SP003');


-- KB-3: [C - CONSISTENCY] Tu choi hang het HSD
PRINT N'';
PRINT N'[KB-3] [C] Tu choi hang HET HAN (HSD = 2020-01-01)';
BEGIN TRY
    EXEC dbo.sp_GiaoTacNhapKho
        @MaPN='PN260612099', @MaNCC='NCC01', @MaNV='NV003',
        @MaKho='K01',
        @MaSP='SP001', @SoLuongNhap=50, @DonGiaNhap=27000, @HanSuDung='2020-01-01';
END TRY
BEGIN CATCH
    PRINT N'>>> DUNG: He thong da tu choi - ' + ERROR_MESSAGE();
END CATCH;
PRINT N'Kiem tra PN260612099 (phai rong - khong duoc INSERT):';
SELECT MaPN FROM dbo.PhieuNhap WHERE MaPN='PN260612099';


-- KB-4: [A - ATOMICITY] SP khong ton tai -> ROLLBACK
PRINT N'';
PRINT N'[KB-4] [A] SP khong ton tai SPXXX - toan bo ROLLBACK';
BEGIN TRY
    EXEC dbo.sp_GiaoTacNhapKho
        @MaPN='PN260612088', @MaNCC='NCC01', @MaNV='NV003',
        @MaKho='K01',
        @MaSP='SPXXX', @SoLuongNhap=10, @DonGiaNhap=50000, @HanSuDung='2027-12-01';
END TRY
BEGIN CATCH
    PRINT N'>>> DUNG: Giao tac rollback - ' + ERROR_MESSAGE();
END CATCH;
PRINT N'Kiem tra PN260612088 (phai rong - da rollback):';
SELECT MaPN FROM dbo.PhieuNhap WHERE MaPN='PN260612088';


-- Bao cao tong hop
PRINT N'';
PRINT N'=== BAO CAO NHAP KHO (v_BaoCaoNhapKho) ===';
SELECT * FROM dbo.v_BaoCaoNhapKho ORDER BY [Ngay Nhap] DESC, [Ma Phieu Nhap];
GO

/*
============================================================
  THUYET MINH 4 TINH CHAT ACID
============================================================

  A - ATOMICITY (Tinh nguyen tu)
  --------------------------------
  VAN DE:
    Neu INSERT PhieuNhap thanh cong nhung INSERT ChiTietPhieuNhap
    that bai (VD: FK vi pham, timeout), TonKho se khong duoc cap
    nhat -> du lieu bi mat dong bo.

  KHAC PHUC TRONG CODE:
    BEGIN TRANSACTION -> thuc hien INSERT PhieuNhap (Buoc 1)
    -> INSERT ChiTietPhieuNhap (Buoc 2)
    -> MERGE TonKho (Buoc 3 - THAY THE TRIGGER CU)
    -> UPDATE TongTienNhap (Buoc 4) -> COMMIT.
    Neu bat ky buoc nao nem exception -> CATCH -> ROLLBACK.
    => Hoac ca 4 buoc deu duoc luu, hoac khong gi duoc luu.

  ============================================================

  C - CONSISTENCY (Tinh nhat quan)
  ----------------------------------
  VAN DE:
    Sieu thi co the vo tinh nhap hang het HSD, hoac nhap so
    luong am, don gia = 0 -> vi pham quy tac kinh doanh.

  KHAC PHUC TRONG CODE:
    - fn_KiemTraHanSuDung(@HanSuDung, GETDATE()): neu tra ve <= 0
      -> RAISERROR ngay lap tuc, khong INSERT gi ca.
    - IF @SoLuongNhap <= 0 / @DonGiaNhap <= 0 -> RAISERROR.
    - Kiem tra MaKho ton tai truoc khi MERGE.
    - FK CONSTRAINT: MaSP, MaNCC, MaNV phai ton tai trong bang cha.

  ============================================================

  I - ISOLATION (Tinh co lap)
  -----------------------------
  VAN DE:
    2 nhan vien cung luc tao phieu cung MaPN -> race condition
    -> ca 2 kiem tra IF NOT EXISTS deu thay "chua co" -> ca 2
    cung INSERT -> vi pham PRIMARY KEY.

  KHAC PHUC TRONG CODE:
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    -> SQL Server dat range lock tren MaPN truoc khi doc.
    -> T2 bi block cho den khi T1 COMMIT hoac ROLLBACK xong.
    -> Loai bo hoan toan phantom read va duplicate key race.

  ============================================================

  D - DURABILITY (Tinh ben vung)
  --------------------------------
  VAN DE:
    Mat dien, crash server ngay sau COMMIT -> du lieu chua kip
    ghi xuong dia co the bi mat.

  KHAC PHUC TRONG CODE & HE THONG:
    - SQL Server dung Write-Ahead Log (WAL): moi thay doi duoc
      ghi vao file log (.ldf) TRUOC khi ghi ra data file (.mdf).
    - Sau COMMIT TRANSACTION, engine dam bao log da duoc flush
      xuong dia (force log at commit protocol).
    - Khi server restart sau su co:
        REDO  -> phuc hoi cac giao tac da COMMIT chua kip ghi .mdf
        UNDO  -> huy cac giao tac chua COMMIT

============================================================
*/
