
# 🎟️ EventFlow – Ứng dụng Quản Lý Sự Kiện & Đặt Vé Trực Tuyến

> **Đồ án môn học – Backend: Django Rest Framework · Frontend: React Native**  
> Phát triển bởi nhóm sinh viên – 2025  

---

## 📑 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Tính năng chính](#tính-năng-chính)
3. [Kiến trúc & Công nghệ](#kiến-trúc--công-nghệ)
4. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
5. [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
6. [Cấu hình môi trường](#cấu-hình-môi-trường)
7. [Chạy thử & Kiểm thử](#chạy-thử--kiểm-thử)
8. [Triển khai](#triển-khai)
9. [API & Tài liệu](#api--tài-liệu)
10. [Đóng góp](#đóng-góp)
11. [Giấy phép](#giấy-phép)
12. [Liên hệ](#liên-hệ)

---

## Giới thiệu

**EventFlow** là nền tảng **quản lý sự kiện** và **đặt vé trực tuyến** toàn diện, hỗ trợ ba vai trò:

| Vai trò | Chức năng cốt lõi |
|---------|-------------------|
| **Người tham gia** | Tìm kiếm sự kiện, đặt vé, thanh toán, lưu vé (QR), đánh giá sự kiện. |
| **Nhà tổ chức** | Tạo & quản lý sự kiện, phê duyệt từ admin, quét QR check‑in, theo dõi doanh thu. |
| **Quản trị viên** | Phê duyệt nhà tổ chức, thống kê toàn hệ thống, quản lý user / sự kiện / báo cáo. |

Mục tiêu dự án:  
*Đưa trải nghiệm đặt vé trực tuyến nhanh chóng – an toàn – minh bạch đến cả nhà tổ chức và người tham gia.*

---

## Tính năng chính

| Nhóm chức năng | Mô tả chi tiết |
|----------------|---------------|
| **Xác thực & Phân quyền** | • OAuth2 Password & Client Credentials – JWT  
 • Đăng nhập/đăng ký qua **email, Facebook, Google**  
 • Ba cấp vai trò (Participant / Organizer / Admin) & Scopes. |
| **Nhà tổ chức** | • Gửi yêu cầu xác minh → Admin duyệt  
 • Tạo sự kiện (tên, mô tả, poster, video, thời gian, địa điểm, loại vé, giá)  
 • Quản lý đơn vé, export CSV, quét QR check‑in. |
| **Tìm kiếm & Duyệt sự kiện** | • Bộ lọc từ khóa, danh mục, địa điểm, khung thời gian  
 • Sắp xếp theo **phổ biến – ngày – giá**  
 • Trang chi tiết hiển thị gallery (ảnh/video). |
| **Đặt vé & Thanh toán** | • Chọn hạng vé (Standard / VIP / …)  
 • Tích hợp **Momo Pay**, **ZaloPay**, **Stripe Card**  
 • Webhook xác nhận – Sinh **vé điện tử (QR)**, gửi email tự động. |
| **Quản lý vé cá nhân** | • Xem lịch sử vé, hủy vé *(nếu quy định cho phép)*  
 • Lưu vé offline, thêm vào Apple/Google Wallet (*\*optional*). |
| **Đánh giá & Phản hồi** | • Người tham gia đánh giá ★ và bình luận  
 • Organizer phản hồi, cải thiện sự kiện. |
| **Thông báo & Nhắc nhở** | • Push Notification (FCM/Expo) & Email  
 • Thông báo sự kiện sắp diễn ra, vé sắp hết hạn. |
| **Thống kê & Báo cáo** | • Organizer xem **vé đã bán, doanh thu, phản hồi** (biểu đồ)  
 • Admin xem **tổng event, người dùng, doanh thu hệ thống theo tháng/quý**. |

> Các mục đánh dấu **\*** là tính năng nâng cao, hoàn thành sẽ được cộng điểm khi vấn đáp.

---

## Kiến trúc & Công nghệ

### Sơ đồ tổng quan

```
┌──────────────┐       HTTPS/REST        ┌──────────────┐
│ React Native │  ◀────────────────────► │  Django API  │
│   (Expo)     │     OAuth2 / JSON       │  DRF + JWT   │
└──────────────┘                         └──────────────┘
        ▲                                     ▲
        │ Push Notify (FCM)                   │ Celery Tasks
        ▼                                     ▼
┌──────────────┐                         ┌──────────────┐
│  Firebase    │                         │   PostgreSQL │
│ (FCM/Auth)   │                         │   Redis      │
└──────────────┘                         └──────────────┘
```

### Backend  
- **Python 3.12**, **Django 4**, **Django Rest Framework**  
- **django-oauth-toolkit** (OAuth2), **djangorestframework-simplejwt**  
- **Celery** + **Redis** (jobs: gửi email, thông báo)  
- **PostgreSQL 15** (ACID, JSONB)  

### Frontend  
- **React Native 0.74** (Expo)  
- **React Navigation**, **Redux Toolkit**, **Axios**  
- **Expo Dev Client** + **EAS Build**  

### Thanh toán  
- **Momo Partner API**, **ZaloPay API**, **Stripe Payment Intent**  
- Webhook → cập nhật trạng thái đơn vé, gửi email **SendGrid**.  

### DevOps  
- **Docker Compose**, **Nginx** reverse proxy  
- **GitHub Actions** CI – lint, test, build  
- **Sentry** logging, **Dotenv** config.

---

## Cấu trúc thư mục

```
eventflow/
├── backend/
│   ├── manage.py
│   ├── eventflow/          # Core settings
│   ├── apps/
│   │   ├── users/
│   │   ├── events/
│   │   ├── orders/
│   │   └── reports/
│   └── requirements/
│       ├── base.txt
│       ├── dev.txt
│       └── prod.txt
├── mobile/
│   ├── App.tsx
│   ├── src/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── components/
│   │   └── store/
└── docs/
    ├── api_openapi.yaml
    └── diagrams/
```

---

## Hướng dẫn cài đặt

### Prerequisites
| Công cụ | Phiên bản đề xuất |
|---------|------------------|
| Docker | 24.x |
| Node | ≥ 18 |
| Python | ≥ 3.12 |

### 1. Clone Repo
```bash
git clone https://github.com/<YOUR_USERNAME>/eventflow.git
cd eventflow
```

### 2. Chạy nhanh bằng Docker
```bash
docker compose up --build
# Backend: http://localhost:8000
# Docs (Swagger): http://localhost:8000/api/docs/
# Frontend expo dev: run separately (mobile/)
```

### 3. Chạy Backend thủ công
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements/dev.txt
cp .env.example .env            # chỉnh sửa biến môi trường
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 4. Chạy Mobile App
```bash
cd mobile
npm i
npx expo start
```

Mở **Expo Go** quét QR, hoặc chạy `emulator`.

---

## Cấu hình môi trường

**backend/.env.example**
```dotenv
DJANGO_SECRET_KEY=supersecret
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:pass@localhost:5432/eventflow
REDIS_URL=redis://localhost:6379
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=...
STRIPE_SECRET_KEY=...
MOMO_PARTNER_CODE=...
ZALOPAY_APP_ID=...
```

---

## Chạy thử & Kiểm thử
```bash
# Backend
pytest -q
# Mobile (Jest)
npm test
```

Pre‑commit hook sử dụng **ruff**, **black**, **isort**.

---

## Triển khai

| Môi trường | Hướng dẫn |
|------------|-----------|
| **Production** | Dùng `docker-compose.prod.yml` – Nginx + Gunicorn. |
| **Mobile** | EAS Build → Android AAB & iOS IPA phát hành TestFlight. |
| **CD** | GitHub Actions → Render.com / Fly.io. |

---

## API & Tài liệu

| Loại | Đường dẫn |
|------|-----------|
| **Swagger UI** | `/api/docs/` |
| **ReDoc** | `/api/redoc/` |
| **OpenAPI spec** | `docs/api_openapi.yaml` |

Toàn bộ endpoint đều tuân thủ **/api/v1/**, trả về JSON (CamelCase).

---

## Đóng góp

1. Fork → tạo nhánh `feature/xyz`  
2. Commit theo Conventional Commits  
3. Mở Pull Request kèm mô tả.  
4. Đảm bảo **CI xanh**.

Mọi issue, bug, đề xuất vui lòng tạo tại **Issues** tab.

---


