# 🛒 Dự Án Quản Lý Siêu Thị Mini (DBMS MiniMart Management)

Dự án môn học Hệ Quản Trị Cơ Sở Dữ Liệu. 

Ứng dụng hỗ trợ quản lý toàn diện hoạt động vận hành của một siêu thị mini, tập trung vào việc tối ưu hóa hiệu năng bằng cách đẩy toàn bộ nghiệp vụ kiểm tra dữ liệu, tính toán tiền và bọc giao tác an toàn (ACID) trực tiếp xuống SQL Server thông qua Stored Procedures và Triggers.

---

## 🚀 Các Phân Hệ Chức Năng Chính

Hệ thống bao gồm 4 phân hệ chính hoạt động song hành:
1. **Phân hệ Bán hàng (POS):** Thực thi giao tác bán hàng, tự động bẫy lỗi bẫy ACID kiểm tra số lượng tồn kho quầy kệ, khấu trừ kho và Trigger tự động tính thành tiền hóa đơn.
2. **Phân hệ Nhập kho:** Quản lý các lô hàng nhập, số lượng nhập, đơn giá nhập và theo dõi hạn sử dụng của từng dòng sản phẩm.
3. **Phân hệ Đối tác & Danh mục:** Quản lý thông tin Nhà cung cấp, phân loại Sản phẩm và sơ đồ các Kho hàng vật lý.
4. **Phân hệ Con người:** Quản lý tài khoản/phân quyền Nhân viên (Admin, Thu ngân, Thủ kho) và thông tin điểm tích lũy của Khách hàng thân thiết.
