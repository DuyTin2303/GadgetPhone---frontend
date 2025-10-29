# Chức năng Review - Hướng dẫn sử dụng

## Tổng quan
Chức năng review cho phép khách hàng đánh giá và nhận xét về sản phẩm đã mua, giúp tăng tính minh bạch và tin cậy cho cửa hàng.

## Tính năng chính

### 1. Đánh giá sản phẩm
- **Điều kiện**: Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá
- **Thang điểm**: 1-5 sao
- **Nội dung**: Bình luận chi tiết về trải nghiệm sử dụng
- **Hình ảnh**: Có thể đính kèm hình ảnh (tính năng tương lai)

### 2. Hiển thị đánh giá
- **Trang sản phẩm**: Hiển thị rating trung bình và số lượng đánh giá
- **Danh sách sản phẩm**: Hiển thị rating ngắn gọn
- **Chi tiết đánh giá**: Danh sách đầy đủ các đánh giá với phân trang

### 3. Quản lý đánh giá (Admin)
- **Xem tất cả đánh giá**: Danh sách đầy đủ với bộ lọc
- **Tìm kiếm**: Theo tên sản phẩm, người dùng, nội dung
- **Xóa đánh giá**: Admin có thể xóa đánh giá không phù hợp
- **Thống kê**: Phân bố điểm đánh giá, rating trung bình

### 4. Tương tác đánh giá
- **Đánh giá hữu ích**: Khách hàng có thể đánh giá review có hữu ích hay không
- **Phân trang**: Hiển thị đánh giá theo trang để tối ưu hiệu suất

## Cách sử dụng

### Cho khách hàng

#### Đánh giá sản phẩm
1. Vào trang chi tiết sản phẩm
2. Cuộn xuống phần "Đánh giá sản phẩm"
3. Nhấn "Viết đánh giá"
4. Chọn số sao (1-5)
5. Nhập nội dung đánh giá
6. Nhấn "Gửi đánh giá"

#### Đánh giá từ lịch sử đơn hàng
1. Vào "Lịch sử đơn hàng"
2. Chọn đơn hàng đã giao
3. Xem chi tiết đơn hàng
4. Nhấn "Đánh giá" bên cạnh sản phẩm
5. Điền thông tin đánh giá

### Cho admin

#### Quản lý đánh giá
1. Đăng nhập với tài khoản admin
2. Vào "Quản lý đánh giá"
3. Sử dụng bộ lọc để tìm đánh giá cần quản lý
4. Xóa đánh giá không phù hợp nếu cần

## API Endpoints

### Backend API
- `POST /api/reviews` - Tạo đánh giá mới
- `GET /api/reviews/product/:productId` - Lấy đánh giá của sản phẩm
- `GET /api/reviews/user` - Lấy đánh giá của user
- `PUT /api/reviews/:reviewId` - Cập nhật đánh giá
- `DELETE /api/reviews/:reviewId` - Xóa đánh giá
- `POST /api/reviews/:reviewId/helpfulness` - Đánh giá hữu ích
- `GET /api/reviews/product/:productId/stats` - Thống kê đánh giá
- `GET /api/reviews` - Lấy tất cả đánh giá (admin)

### Frontend Components
- `ReviewSection.jsx` - Hiển thị đánh giá trong trang sản phẩm
- `AdminReviewManagement.jsx` - Quản lý đánh giá cho admin
- `ReviewButton.jsx` - Nút đánh giá trong lịch sử đơn hàng

## Cấu trúc dữ liệu

### Review Model
```javascript
{
  productId: ObjectId,    // ID sản phẩm
  userId: ObjectId,       // ID người dùng
  rating: Number,         // Điểm đánh giá (1-5)
  comment: String,        // Nội dung đánh giá
  images: [String],       // Hình ảnh đính kèm
  isVerified: Boolean,    // Đã xác minh mua hàng
  helpful: Number,        // Số lượt đánh giá hữu ích
  notHelpful: Number,     // Số lượt đánh giá không hữu ích
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

### Product Model (cập nhật)
```javascript
{
  // ... các trường khác
  averageRating: Number,  // Điểm đánh giá trung bình
  totalReviews: Number    // Tổng số đánh giá
}
```

## Bảo mật

### Xác thực
- Chỉ user đã đăng nhập mới có thể tạo đánh giá
- Chỉ user đã mua sản phẩm mới có thể đánh giá
- Mỗi user chỉ có thể đánh giá một sản phẩm một lần

### Phân quyền
- User chỉ có thể xóa/sửa đánh giá của mình
- Admin có thể xóa bất kỳ đánh giá nào
- Admin có thể xem tất cả đánh giá

## Tối ưu hiệu suất

### Database
- Index trên `productId` và `createdAt` để tối ưu truy vấn
- Index trên `userId` để tìm đánh giá của user

### Frontend
- Phân trang đánh giá để giảm tải
- Lazy loading cho hình ảnh
- Caching thống kê đánh giá

## Tính năng tương lai

### Đã lên kế hoạch
- [ ] Upload hình ảnh đánh giá
- [ ] Phản hồi đánh giá từ admin
- [ ] Báo cáo đánh giá spam
- [ ] Gửi email thông báo khi có đánh giá mới
- [ ] Thống kê đánh giá chi tiết hơn

### Có thể mở rộng
- [ ] Đánh giá theo tiêu chí (chất lượng, giá cả, giao hàng)
- [ ] Video đánh giá
- [ ] Đánh giá từ ảnh sản phẩm
- [ ] Tích hợp AI để phân tích sentiment

## Troubleshooting

### Lỗi thường gặp

#### "Bạn cần mua sản phẩm này trước khi đánh giá"
- Kiểm tra đơn hàng đã được giao chưa
- Đảm bảo sản phẩm có trong đơn hàng

#### "Bạn đã đánh giá sản phẩm này rồi"
- Mỗi user chỉ có thể đánh giá một sản phẩm một lần
- Cần xóa đánh giá cũ trước khi tạo mới

#### "Token không hợp lệ"
- Đăng nhập lại để lấy token mới
- Kiểm tra token có hết hạn không

### Debug
- Kiểm tra console browser để xem lỗi API
- Kiểm tra network tab để xem request/response
- Kiểm tra server logs để xem lỗi backend

## Liên hệ hỗ trợ
Nếu gặp vấn đề với chức năng review, vui lòng liên hệ team phát triển.




