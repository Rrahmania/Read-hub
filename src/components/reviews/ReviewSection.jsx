import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getBookReviews, getUserReview, saveReview, deleteReview } from "../../services/reviewService";
import "./ReviewSection.css";

const ReviewSection = ({ bookId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
    if (user) {
      loadUserReview();
    }
  }, [bookId, user]);

  const loadReviews = async () => {
    try {
      const data = await getBookReviews(bookId);
      setReviews(data.reviews);
      setStatistics(data.statistics);
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  };

  const loadUserReview = async () => {
    try {
      const data = await getUserReview(bookId);
      if (data.hasReview) {
        setUserReview(data.review);
        setRating(data.review.rating);
        setReviewText(data.review.review_text || "");
      }
    } catch (err) {
      console.error("Error loading user review:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Silakan pilih rating terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await saveReview(bookId, rating, reviewText);
      await loadReviews();
      await loadUserReview();
      setShowReviewForm(false);
      alert("Review berhasil disimpan!");
    } catch (err) {
      console.error("Error saving review:", err);
      alert("Gagal menyimpan review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Yakin ingin menghapus review Anda?")) return;

    setLoading(true);
    try {
      await deleteReview(userReview.id);
      setUserReview(null);
      setRating(0);
      setReviewText("");
      await loadReviews();
      alert("Review berhasil dihapus!");
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Gagal menghapus review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (interactive ? (hoverRating || rating) : count) ? "filled" : ""}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="review-section">
      <h2>Rating & Ulasan</h2>

      {/* Rating Statistics */}
      {statistics && statistics.total_reviews > 0 && (
        <div className="rating-summary">
          <div className="rating-average">
            <div className="average-score">{parseFloat(statistics.average_rating).toFixed(1)}</div>
            {renderStars(Math.round(statistics.average_rating))}
            <div className="total-reviews">{statistics.total_reviews} ulasan</div>
          </div>
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = statistics[`${["five", "four", "three", "two", "one"][5 - star]}_star`] || 0;
              const percentage = statistics.total_reviews > 0 ? (count / statistics.total_reviews) * 100 : 0;
              return (
                <div key={star} className="rating-bar-row">
                  <span className="star-label">{star} ★</span>
                  <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Review Form */}
      {user && (
        <div className="user-review-section">
          {userReview && !showReviewForm ? (
            <div className="user-review-card">
              <h3>Ulasan Anda</h3>
              {renderStars(userReview.rating)}
              <p className="review-text">{userReview.review_text}</p>
              <div className="review-actions">
                <button onClick={() => setShowReviewForm(true)} className="btn-edit">
                  Edit
                </button>
                <button onClick={handleDeleteReview} className="btn-delete" disabled={loading}>
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <>
              {!showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} className="btn-add-review">
                  Tulis Ulasan
                </button>
              )}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="review-form">
                  <h3>{userReview ? "Edit Ulasan" : "Tulis Ulasan"}</h3>
                  <div className="form-group">
                    <label>Rating</label>
                    {renderStars(rating, true)}
                  </div>
                  <div className="form-group">
                    <label>Ulasan (opsional)</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Bagikan pengalaman Anda membaca buku ini..."
                      rows="4"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        if (userReview) {
                          setRating(userReview.rating);
                          setReviewText(userReview.review_text || "");
                        } else {
                          setRating(0);
                          setReviewText("");
                        }
                      }}
                      className="btn-cancel"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* All Reviews */}
      <div className="reviews-list">
        <h3>Semua Ulasan ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="no-reviews">Belum ada ulasan untuk buku ini.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.username || review.email}</span>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.review_text && <p className="review-text">{review.review_text}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;