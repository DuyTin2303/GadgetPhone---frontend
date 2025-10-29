import React, { useState } from 'react';

function ReviewButton({ product, orderStatus, onReviewSubmitted }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({
    rating: 5,
    comment: ''
  });

  // Hiển thị nút đánh giá cho tất cả trạng thái đơn hàng
  // if (orderStatus !== 'delivered') {
  //   return null;
  // }

  // Gửi review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!review.comment.trim()) {
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
          productId: product._id,
          rating: review.rating,
          comment: review.comment
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Đánh giá đã được gửi thành công!');
        setReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        onReviewSubmitted && onReviewSubmitted();
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
              fontSize: '16px',
              color: star <= rating ? '#ffc107' : '#e0e0e0'
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '8px' }}>
      {!showReviewForm ? (
        <button
          onClick={() => setShowReviewForm(true)}
          style={{
            padding: '6px 12px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          ⭐ Đánh giá
        </button>
      ) : (
        <div style={{
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginTop: '8px'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#333'
          }}>
            Đánh giá sản phẩm
          </h4>
          
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500' }}>
                Đánh giá:
              </label>
              {renderStars(review.rating, true, (rating) => 
                setReview({ ...review, rating })
              )}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500' }}>
                Nội dung:
              </label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '6px 12px',
                  background: submitting ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReviewButton;
