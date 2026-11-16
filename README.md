# PrintBatch Studio Pro (In Biểu Mẫu Hàng Loạt Chuyên Nghiệp)

Ứng dụng thiết kế kéo thả trực quan và in ấn biểu mẫu hàng loạt tự động từ danh sách dữ liệu Excel/CSV hoặc nhập tay.

## 🚀 Các tính năng nổi bật

1. **Trường Dữ Liệu Tự Do (Unlimited Dynamic Fields)**:
   - Thêm không giới hạn các trường: Văn bản (Text), Mã QR Code tự sinh động, Mã vạch Barcode (Code128).
   - Tùy chỉnh font chữ (hỗ trợ tiếng Việt: Inter, Playfair Display, Roboto, Merriweather, Space Mono), cỡ chữ, độ đậm, màu sắc, canh lề, chữ nghiêng, in hoa.
   - Thêm tiền tố (Prefix) & hậu tố (Suffix) tự động (ví dụ: `Kính gửi: `, ` VNĐ`).

2. **Quản Lý & Nhập Dữ Liệu Excel / CSV Chuyên Nghiệp**:
   - Nhập trực tiếp file `.xlsx`, `.xls`, `.csv` với tốc độ xử lý nhanh, bảo mật 100% offline trên máy client (không gửi dữ liệu cá nhân lên server).
   - Ánh xạ cột thông minh (Smart Column Mapping): Tự động phát hiện và liên kết cột Excel vào các trường trên phôi, hoặc 1-click tự động tạo trường tương ứng từ file Excel.
   - Hỗ trợ dán trực tiếp vùng dữ liệu từ Excel (Copy & Paste).
   - Tải file Excel mẫu trực tiếp từ cấu hình phôi.

3. **Thư Viện Mẫu Thiết Kế Sẵn (Preset Templates)**:
   - Thiệp Mời Hội Nghị / Khách VIP (A5 Ngang)
   - Giấy Khen / Chứng Nhận Thành Tích (A4 Ngang)
   - Thẻ Đại Biểu / Thẻ Nhân Viên Đeo Cổ (Dọc, kèm QR Code check-in)
   - Phong Bì Thư Bưu Điện (DL / C5, kèm mã vận đơn barcode)

4. **Trình Kéo Thả Trực Quan Hiện Đại**:
   - Đường gióng thông minh (Smart Guides & Snapping) tự động bắt dính tâm và các trường khác.
   - Tinh chỉnh vị trí từng pixel bằng phím mũi tên `↑ ↓ ← →` (hoặc `Shift + mũi tên` để nhảy 10px).
   - Thu phóng (Zoom 40% - 200%) và căn giữa biểu mẫu tự động.
   - Hỗ trợ Lịch sử Hoàn tác / Làm lại (Undo `Ctrl+Z` / Redo `Ctrl+Y`).

5. **Động Cơ Xuất File Đa Dạng**:
   - **Xuất File PDF Hàng Loạt Đa Trang (Multi-page Batch PDF)**: Tự động gom toàn bộ các trang đã điền dữ liệu thành 1 file PDF duy nhất chất lượng cao (300 DPI).
   - **In trực tiếp qua máy in (`window.print`)**: Tối ưu hóa ngắt trang chuẩn khổ in CSS `@media print`.
   - **Lưu trữ dự án (.pbproject)**: Lưu toàn bộ phôi + vị trí + cài đặt + danh sách dữ liệu ra file để mở lại bất cứ lúc nào.

## 🛠️ Cài đặt & Chạy ứng dụng

Yêu cầu: Node.js >= 18

```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển (Dev)
npm run dev

# Đóng gói sản phẩm (Production Build)
npm run build
```
