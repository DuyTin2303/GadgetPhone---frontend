import React, { useState, useEffect } from 'react';

function AdminReviewManagement({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách review
  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/reviews?page=${page}&limit=10&filter=${filter}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        console.error('API Error:', data.message || data.error);
      }
    } catch (error) {
      console.error('Lỗi khi tải review:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter, searchTerm]);

  // Xóa review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Đánh giá đã được xóa thành công!');
        fetchReviews(currentPage);
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa đánh giá');
      }
    } catch (error) {
      console.error('Lỗi khi xóa review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  // Render sao đánh giá
  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: '16px',
              color: star <= rating ? '#ffc107' : '#e0e0e0'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        Đang tải danh sách đánh giá...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#333',
        marginBottom: '24px',
        borderBottom: '2px solid #1976d2',
        paddingBottom: '8px'
      }}>
        Quản lý đánh giá
      </h2>

      {/* Bộ lọc và tìm kiếm */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Bộ lọc:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Tìm kiếm:
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm hoặc người dùng..."
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '300px'
            }}
          />
        </div>
      </div>

      {/* Danh sách review */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {reviews.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            Không có đánh giá nào
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <div key={review._id} style={{
                padding: '20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                gap: '16px'
              }}>
                {/* Thông tin sản phẩm */}
                <div style={{ minWidth: '200px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {review.productId?.name || 'Sản phẩm không tồn tại'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ID: {review.productId?._id || 'N/A'}
                  </div>
                </div>

                {/* Thông tin người dùng */}
                <div style={{ minWidth: '150px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {review.userId?.name || 'Người dùng'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {review.userId?.email || 'N/A'}
                  </div>
                </div>

                {/* Đánh giá */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {renderStars(review.rating)}
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    color: '#333',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {review.comment}
                  </p>
                </div>

                {/* Hành động */}
                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px',
          marginTop: '24px'
        }}>
          <button
            onClick={() => fetchReviews(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              background: currentPage === 1 ? '#f5f5f5' : '#1976d2',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Trước
          </button>
          
          <span style={{ 
            padding: '8px 16px',
            background: '#f5f5f5',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => fetchReviews(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              background: currentPage === totalPages ? '#f5f5f5' : '#1976d2',
              color: currentPage === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Sau
          </button>
        </div>
      )}

      {/* CSS cho animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminReviewManagement;
