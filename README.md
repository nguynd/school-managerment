# Dự án Quản lý Điểm THPT

Dự án web sử dụng **PERN Stack** (PostgreSQL, Express.js, React.js, Node.js).

## Chức năng chính

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Cơ sở dữ liệu: PostgreSQL
- Giao tiếp API bằng Axios

## Yêu cầu môi trường

- Node.js (phiên bản 18.x hoặc cao hơn)
- PostgreSQL (phiên bản 17.x hoặc cao hơn)
- npm (phiên bản 9.x hoặc cao hơn) hoặc yarn
- pgAdmin4 để quản lý database

## Tạo và khôi phục cơ sở dữ liệu (PostgreSQL)

Sử dụng **pgAdmin4**

Khôi phục database từ file .backup

Mở pgAdmin4 → Kết nối server.
Tạo database mới
Chuột phải vào Databases → Chọn database đã tạo → Restore.
Chọn file db.backup.
Chọn định dạng: Custom or tar.
Bấm Restore.

## Cấu hình môi trường

- Thay `<tên_database>`, `<tên_user>`, `<mật_khẩu>` theo thông tin database vừa khôi phục.
- `JWT_SECRET`: tự đặt chuỗi bí mật để bảo mật token.

## Cài thư viện

### Cài đặt thư viện cho Backend

dùng terminal, gõ lệnh sau:
cd be
npm install

### Cài đặt thư viện cho Frontend

dùng terminal, gõ lệnh sau:
cd fe
Set-ExecutionPolicy Unrestricted -Scope Process
npm config set registry https://registry.npmjs.org/
npm install

## Chạy dự án

### Chạy Backend

dùng terminal, gõ lệnh sau:
cd be
Set-ExecutionPolicy Unrestricted -Scope Process
npm run dev

### Chạy Frontend

dùng terminal, gõ lệnh sau:
cd fe
Set-ExecutionPolicy Unrestricted -Scope Process
npm run dev

### Đường dẫn dự án

Frontend chạy tại:
 http://localhost:5173/ 

Backend API chạy tại:
 http://localhost:5000/