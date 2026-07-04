-- =================================================================================
-- HỆ THỐNG QUẢN LÝ SIÊU THỊ MINI - SCRIPT DEMO GIAO TÁC & ĐIỀU KHIỂN TƯƠNG TRANH
-- =================================================================================
-- Hướng dẫn chạy thử nghiệm:
-- 1. Sử dụng công cụ SQL Server Management Studio (SSMS) hoặc Azure Data Studio.
-- 2. Mở hai cửa sổ Query (Tab 1 và Tab 2) kết nối vào cùng một cơ sở dữ liệu.
-- 3. Copy mã tương ứng của từng Tab và chạy theo thứ tự mô tả dưới đây.
-- =================================================================================

USE QuanLySieuThiMini;
GO

-- Khôi phục dữ liệu mẫu chuẩn về trạng thái ban đầu trước khi chạy demo
UPDATE TonKho SET SoLuongTonKho = 50 WHERE MaKho = 'K02' AND MaSP = 'SP001';
UPDATE KhachHang SET DiemTichLuy = 200 WHERE MaKH = 'KH002';
UPDATE HoaDon SET TongTien = 800000, GiamGia = 0, ThanhTien = 800000 WHERE MaHD = 'HD004';
GO


-- =================================================================================
-- KỊCH BẢN 1: LỖI ĐỌC BẨN (DIRTY READ) VÀ GIẢI PHÁP
-- =================================================================================
-- Mô tả: Giao tác 1 đang cập nhật tồn kho nhưng chưa COMMIT. 
--        Giao tác 2 đọc dữ liệu này (khi dùng NOLOCK/READ UNCOMMITTED).
--        Nếu Giao tác 1 bị ROLLBACK, dữ liệu Giao tác 2 đã đọc là dữ liệu ảo (bẩn).
-- ---------------------------------------------------------------------------------

/*
--- [TAB 1] ---
BEGIN TRAN;
    UPDATE TonKho 
    SET SoLuongTonKho = 999 
    WHERE MaKho = 'K02' AND MaSP = 'SP001';

    -- Đợi 8 giây để Tab 2 chạy đọc bẩn
    WAITFOR DELAY '00:00:08';
ROLLBACK TRAN;
PRINT N'Đã ROLLBACK giao tác 1!';
*/

/*
--- [TAB 2 - LỖI: ĐỌC BẨN] ---
-- Thiết lập mức cô lập cho phép đọc bẩn
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN TRAN;
    -- Sẽ đọc ra số lượng 999 (dữ liệu chưa commit của Tab 1)
    SELECT SoLuongTonKho AS 'Tồn kho đọc bẩn (Lỗi)' 
    FROM TonKho 
    WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
-- Chờ Tab 1 rollback xong, chạy lại câu lệnh dưới sẽ thấy tồn kho thực tế vẫn là 50
-- Dẫn đến báo cáo kinh doanh bị sai lệch nghiêm trọng.
*/

/*
--- [TAB 2 - GIẢI PHÁP: NGĂN ĐỌC BẨN] ---
-- Thiết lập mức cô lập mặc định, chỉ đọc dữ liệu đã COMMIT
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRAN;
    -- Câu lệnh này sẽ bị BLOCK (chờ) cho đến khi Tab 1 kết thúc (COMMIT/ROLLBACK)
    SELECT SoLuongTonKho AS 'Tồn kho đọc chuẩn (Giải pháp)' 
    FROM TonKho 
    WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
-- Kết quả hiển thị đúng giá trị thực tế: 50
*/


-- =================================================================================
-- KỊCH BẢN 2: LỖI ĐỌC KHÔNG LẶP LẠI (NON-REPEATABLE READ) VÀ GIẢI PHÁP
-- =================================================================================
-- Mô tả: Giao tác 1 đọc điểm tích lũy của khách hàng để tính phân hạng thành viên.
--        Giao tác 2 thực hiện cập nhật điểm của khách hàng đó và COMMIT.
--        Giao tác 1 đọc lại lần nữa thì thấy điểm đã thay đổi so với lần đầu.
-- ---------------------------------------------------------------------------------

/*
--- [TAB 1 - LỖI: ĐỌC KHÔNG LẶP LẠI] ---
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRAN;
    -- Lần đọc 1: Đọc ra điểm của KH002 (ví dụ: 200 điểm)
    SELECT DiemTichLuy AS 'Điểm đọc lần 1' 
    FROM KhachHang 
    WHERE MaKH = 'KH002';

    -- Đợi 8 giây để Tab 2 cập nhật điểm và commit
    WAITFOR DELAY '00:00:08';

    -- Lần đọc 2: Đọc ra điểm đã thay đổi (250 điểm) -> Lỗi mất tính nhất quán dữ liệu đọc
    SELECT DiemTichLuy AS 'Điểm đọc lần 2 (Bị đổi)' 
    FROM KhachHang 
    WHERE MaKH = 'KH002';
COMMIT TRAN;
*/

/*
--- [TAB 2] ---
BEGIN TRAN;
    UPDATE KhachHang 
    SET DiemTichLuy = DiemTichLuy + 50 
    WHERE MaKH = 'KH002';
COMMIT TRAN;
PRINT N'Tab 2 đã cập nhật điểm thành công!';
*/

/*
--- [TAB 1 - GIẢI PHÁP: REPEATABLE READ] ---
-- Đặt lại điểm về 200 để chạy lại demo
-- UPDATE KhachHang SET DiemTichLuy = 200 WHERE MaKH = 'KH002';

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRAN;
    -- Lần đọc 1: Đọc ra điểm của KH002 (đang giữ Shared Lock trên dòng này)
    SELECT DiemTichLuy AS 'Điểm đọc lần 1' 
    FROM KhachHang 
    WHERE MaKH = 'KH002';

    -- Đợi 8 giây (Tab 2 lúc này chạy cập nhật sẽ bị BLOCK do kẹt khóa Shared Lock)
    WAITFOR DELAY '00:00:08';

    -- Lần đọc 2: Đọc ra điểm giữ nguyên không đổi (200 điểm)
    SELECT DiemTichLuy AS 'Điểm đọc lần 2 (Đúng chuẩn)' 
    FROM KhachHang 
    WHERE MaKH = 'KH002';
COMMIT TRAN;
-- Sau khi Tab 1 COMMIT, Tab 2 mới được thực thi và cập nhật điểm của KH.
*/


-- =================================================================================
-- KỊCH BẢN 3: LỖI MẤT CẬP NHẬT (LOST UPDATE) VÀ GIẢI PHÁP
-- =================================================================================
-- Mô tả: Hai quầy POS cùng lúc bán sản phẩm sữa SP001. Cả hai đọc tồn kho là 50, 
--        cùng thực hiện bán và trừ kho. Cập nhật của giao tác 1 bị giao tác 2 đè lên.
-- ---------------------------------------------------------------------------------

/*
--- [TAB 1 - LỖI: LOST UPDATE] ---
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRAN;
    DECLARE @Ton INT;
    -- Đọc ra tồn kho hiện tại (50)
    SELECT @Ton = SoLuongTonKho FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP001';
    
    WAITFOR DELAY '00:00:06'; -- Chờ Tab 2 đọc tồn kho cùng thời điểm
    
    -- Trừ kho và cập nhật (50 - 2 = 48)
    UPDATE TonKho SET SoLuongTonKho = @Ton - 2 WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
-- Chạy xong cả 2 Tab, kiểm tra tồn kho thấy: còn 45 (Lỗi! Mất cập nhật trừ 2 của Tab 1)
*/

/*
--- [TAB 2 - LỖI: LOST UPDATE] ---
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRAN;
    DECLARE @Ton INT;
    -- Đọc ra tồn kho cùng thời điểm (vẫn đọc ra 50)
    SELECT @Ton = SoLuongTonKho FROM TonKho WHERE MaKho = 'K02' AND MaSP = 'SP001';
    
    -- Trừ kho và cập nhật (50 - 5 = 45)
    UPDATE TonKho SET SoLuongTonKho = @Ton - 5 WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
*/

/*
--- [TAB 1 - GIẢI PHÁP: DÙNG HINT KHÓA UPDLOCK] ---
-- Đặt lại tồn kho về 50 để chạy lại demo
-- UPDATE TonKho SET SoLuongTonKho = 50 WHERE MaKho = 'K02' AND MaSP = 'SP001';

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRAN;
    DECLARE @Ton INT;
    -- Khóa cập nhật UPDLOCK trên dòng kiểm tra
    SELECT @Ton = SoLuongTonKho FROM TonKho WITH (UPDLOCK, ROWLOCK) WHERE MaKho = 'K02' AND MaSP = 'SP001';
    
    WAITFOR DELAY '00:00:06'; -- Tab 2 chạy SELECT cũng với UPDLOCK sẽ bị BLOCK, phải đợi
    
    UPDATE TonKho SET SoLuongTonKho = @Ton - 2 WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
*/

/*
--- [TAB 2 - GIẢI PHÁP: DÙNG HINT KHÓA UPDLOCK] ---
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRAN;
    DECLARE @Ton INT;
    -- Tab 2 bị bắt buộc dừng tại câu lệnh này để chờ Tab 1 kết thúc
    SELECT @Ton = SoLuongTonKho FROM TonKho WITH (UPDLOCK, ROWLOCK) WHERE MaKho = 'K02' AND MaSP = 'SP001';
    
    -- Sau khi Tab 1 commit (tồn kho còn 48), Tab 2 mới đọc được giá trị 48 và trừ tiếp
    UPDATE TonKho SET SoLuongTonKho = @Ton - 5 WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
-- Kết quả cuối cùng chính xác: Tồn kho còn 43 (50 - 2 - 5 = 43)
*/


-- =================================================================================
-- KỊCH BẢN 4: LỖI KHÓA CHẾT (DEADLOCK) VÀ GIẢI PHÁP SẮP XẾP THỨ TỰ KHÓA
-- =================================================================================
-- Mô tả: Hai luồng điều chuyển nội bộ chéo nhau chạy đồng thời.
--        Luồng 1 chuyển K01 -> K02 (cố khóa K01 trước, rồi K02).
--        Luồng 2 chuyển K02 -> K01 (cố khóa K02 trước, rồi K01).
-- ---------------------------------------------------------------------------------

/*
--- [TAB 1 - LỖI: DEADLOCK] ---
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN TRAN;
    -- Bước 1: Khóa kho K01 trước
    SELECT SoLuongTonKho FROM TonKho WITH (XLOCK, ROWLOCK) WHERE MaKho = 'K01' AND MaSP = 'SP001';
    
    WAITFOR DELAY '00:00:06'; -- Đợi Tab 2 khóa K02
    
    -- Bước 2: Cố gắng khóa kho K02 -> Bị block (chờ Tab 2) -> Gây DEADLOCK
    SELECT SoLuongTonKho FROM TonKho WITH (XLOCK, ROWLOCK) WHERE MaKho = 'K02' AND MaSP = 'SP001';
COMMIT TRAN;
*/

/*
--- [TAB 2 - LỖI: DEADLOCK] ---
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN TRAN;
    -- Bước 1: Khóa kho K02 trước
    SELECT SoLuongTonKho FROM TonKho WITH (XLOCK, ROWLOCK) WHERE MaKho = 'K02' AND MaSP = 'SP001';
    
    -- Bước 2: Cố gắng khóa kho K01 -> Bị block (chờ Tab 1)
    SELECT SoLuongTonKho FROM TonKho WITH (XLOCK, ROWLOCK) WHERE MaKho = 'K01' AND MaSP = 'SP001';
COMMIT TRAN;
-- SQL Server phát hiện Deadlock, chọn một giao tác làm nạn nhân (Deadlock Victim) và Rollback.
*/

/*
--- [TAB 1 - GIẢI PHÁP: GỌI THỦ TỤC ĐÃ ĐƯỢC CHỐNG DEADLOCK] ---
-- Cả hai luồng gọi thủ tục sp_DieuChuyenKhoNoiBo đã được sửa thuật toán:
-- Thuật toán: Luôn sắp xếp khóa mã kho có giá trị nhỏ hơn trước (K01 < K02).
-- Vì thế, cả 2 luồng đều xếp hàng khóa K01 trước, luồng vào sau sẽ đợi một cách có trật tự.

EXEC sp_DieuChuyenKhoNoiBo @MaSP = 'SP001', @SoLuongChuyen = 5, @MaKhoNguon = 'K01', @MaKhoDich = 'K02';
*/

/*
--- [TAB 2 - GIẢI PHÁP: GỌI THỦ TỤC ĐÃ ĐƯỢC CHỐNG DEADLOCK] ---
-- Chạy đồng thời, luồng này sẽ đợi luồng 1 hoàn thành mà không gây deadlock.
EXEC sp_DieuChuyenKhoNoiBo @MaSP = 'SP001', @SoLuongChuyen = 3, @MaKhoNguon = 'K02', @MaKhoDich = 'K01';
*/


-- =================================================================================
-- KỊCH BẢN 5: LỖI DEADLOCK NGƯỢC THỨ TỰ KHÓA (TÍCH ĐIỂM VS POS HÓA ĐƠN)
-- =================================================================================
-- Mô tả: Luồng 1 (đổi điểm) khóa KhachHang -> HoaDon.
--        Luồng 2 (trigger POS) khóa HoaDon -> KhachHang.
-- ---------------------------------------------------------------------------------

/*
--- [TAB 1 - LỖI: DEADLOCK NGƯỢC THỨ TỰ KHÓA] ---
-- Giả lập logic sp_GiaoTacDoiDiem phiên bản cũ (Khách hàng trước, Hóa đơn sau)
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRAN;
    -- 1. Khóa dòng khách hàng KH002
    SELECT DiemTichLuy FROM KhachHang WITH (UPDLOCK, ROWLOCK) WHERE MaKH = 'KH002';
    
    WAITFOR DELAY '00:00:06'; -- Chờ Tab 2 khóa hóa đơn
    
    -- 2. Cố gắng khóa dòng hóa đơn HD004 -> Bị block (chờ Tab 2) -> Gây DEADLOCK vòng tròn
    SELECT TongTien FROM HoaDon WITH (UPDLOCK, ROWLOCK) WHERE MaHD = 'HD004';
COMMIT TRAN;
*/

/*
--- [TAB 2 - LỖI: DEADLOCK NGƯỢC THỨ TỰ KHÓA] ---
-- Giả lập luồng POS thanh toán và trigger tự động cộng điểm
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRAN;
    -- 1. Cập nhật hóa đơn trước (Khóa dòng HD004)
    UPDATE HoaDon SET ThanhTien = 850000 WHERE MaHD = 'HD004';
    
    -- 2. Trigger tự động chạy và cố gắng cập nhật tích điểm khách hàng KH002 -> Bị block (chờ Tab 1)
    UPDATE KhachHang SET DiemTichLuy = DiemTichLuy + 8 WHERE MaKH = 'KH002';
COMMIT TRAN;
*/

/*
--- [TAB 1 - GIẢI PHÁP: ĐỒNG BỘ THỨ TỰ KHÓA] ---
-- Chạy thủ tục sp_GiaoTacDoiDiem đã được chỉnh sửa thứ tự khóa dòng (HoaDon trước, KhachHang sau)
-- Cách này giúp đồng bộ hóa với luồng cập nhật của POS và Trigger, loại bỏ deadlock.

DECLARE @ket_qua VARCHAR(200);
EXEC sp_GiaoTacDoiDiem @p_MaHD = 'HD004', @p_MaKH = 'KH002', @p_SoDiemMuonDoi = 10, @p_KetQua = @ket_qua OUTPUT;
SELECT @ket_qua AS 'Kết quả';
*/

/*
--- [TAB 2 - GIẢI PHÁP: ĐỒNG BỘ THỨ TỰ KHÓA] ---
-- Chạy đồng thời, luồng này sẽ xếp hàng đợi một cách an toàn
UPDATE HoaDon SET ThanhTien = 900000 WHERE MaHD = 'HD004';
*/
