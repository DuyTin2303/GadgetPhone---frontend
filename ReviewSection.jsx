import React, { useState, useEffect } from 'react';

function ReviewSection({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Lấy danh sách review
  const fetchReviews = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}?page=${page}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Lỗi khi tải review:', error);
    }
  };

  // Lấy thống kê review
  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setReviewStats(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê review:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchReviews(),
        fetchReviewStats()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [productId]);

  // Gửi review mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: newReview.rating,
          comment: newReview.comment,
          images: newReview.images
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Đánh giá đã được gửi thành công!');
        setNewReview({ rating: 5, comment: '', images: [] });
        setShowReviewForm(false);
        fetchReviews();
        fetchReviewStats();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch (error) {
      console.error('Lỗi khi gửi review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };


  // Render sao đánh giá
  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            style={{
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              padding: '0',
              fontSize: '20px',
              color: star <= rating ? '#ffc107' : '#e0e0e0'
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // Render thanh tiến trình đánh giá
  const renderRatingBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ minWidth: '20px', fontSize: '14px' }}>{rating}</span>
        <div style={{ 
          flex: 1, 
          height: '8px', 
          background: '#e0e0e0', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: '#ffc107',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ minWidth: '30px', fontSize: '12px', color: '#666' }}>{count}</span>
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
        Đang tải đánh giá...
      </div>
    );
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#333',
        marginBottom: '24px',
        borderBottom: '2px solid #1976d2',
        paddingBottom: '8px'
      }}>
        Đánh giá sản phẩm
      </h2>

      {/* Thống kê đánh giá */}
      {reviewStats && (
        <div style={{ 
          display: 'flex', 
          gap: '40px', 
          marginBottom: '32px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Điểm trung bình */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#1976d2' }}>
              {reviewStats.averageRating.toFixed(1)}
            </div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {reviewStats.totalReviews} đánh giá
            </div>
          </div>

          {/* Phân bố đánh giá */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
              Phân bố đánh giá
            </h4>
            {[5, 4, 3, 2, 1].map((rating) => 
              renderRatingBar(rating, reviewStats.ratingDistribution[rating], reviewStats.totalReviews)
            )}
          </div>
        </div>
      )}

      {/* Nút viết đánh giá */}
      {user && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              padding: '12px 24px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {showReviewForm ? 'Hủy đánh giá' : 'Viết đánh giá'}
          </button>
        </div>
      )}

      {/* Form đánh giá */}
      {showReviewForm && (
        <div style={{ 
          marginBottom: '32px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
            Viết đánh giá của bạn
          </h3>
          
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Đánh giá:
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nội dung đánh giá:
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: submitting ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách đánh giá */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
          Đánh giá từ khách hàng ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            Chưa có đánh giá nào cho sản phẩm này
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <div key={review._id} style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '16px',
                background: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                      {review.userId?.name || 'Khách hàng'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    {renderStars(review.rating)}
                  </div>
                </div>

                <p style={{ 
                  color: '#333', 
                  lineHeight: '1.6', 
                  marginBottom: '12px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {review.comment}
                </p>

              </div>
            ))}

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
          </div>
        )}
      </div>

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

export default ReviewSection;
