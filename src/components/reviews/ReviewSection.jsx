import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmLogoutModal from "../layout/ConfirmLogoutModal";
import {
  getBookReviews,
  getUserReview,
  saveReview,
  deleteReview,
  updateReview,
  getCurrentUser,
} from "../../services/reviewService";
import "./ReviewSection.css";

const ReviewSection = ({ bookId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { type: 'delete', id }
  const [editingReview, setEditingReview] = useState(null); // review object when editing other user's review
  const { showToast } = useToast();

  useEffect(() => {
    loadReviews();
    if (user) {
      loadUserReview();
      loadCurrentUserInfo();
    }
  }, [bookId, user]);

  const loadCurrentUserInfo = async () => {
    try {
      const info = await getCurrentUser();
      setCurrentUserInfo(info);
    } catch (err) {
      console.error("Error loading current user info:", err);
    }
  };

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
      showToast("Silakan pilih rating terlebih dahulu", "info");
      return;
    }

    setLoading(true);
    try {
      await saveReview(bookId, rating, reviewText);
      await loadReviews();
      await loadUserReview();
      setShowReviewForm(false);
      showToast("Review berhasil disimpan!", "success");
    } catch (err) {
      console.error("Error saving review:", err);
      showToast("Gagal menyimpan review", "error");
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (type, id) => {
    setConfirmTarget({ type, id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const { type, id } = confirmTarget;
    setConfirmOpen(false);

    if (type === "delete") {
      setLoading(true);
      try {
        await deleteReview(id);
        // if deleted review was current user's own review, clear local
        if (userReview && userReview.id === id) {
          setUserReview(null);
          setRating(0);
          setReviewText("");
        }
        await loadReviews();
        showToast("Review berhasil dihapus!", "success");
      } catch (err) {
        console.error("Error deleting review:", err);
        showToast("Gagal menghapus review", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const handleStartEdit = (review) => {
    // Open form to edit a review (owner or admin)
    setEditingReview(review);
    setRating(review.rating || 0);
    setReviewText(review.review_text || "");
    setShowReviewForm(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    setLoading(true);
    try {
      await updateReview(editingReview.id, rating, reviewText);
      await loadReviews();
      // if editing own review, refresh userReview
      if (userReview && userReview.id === editingReview.id) {
        await loadUserReview();
      }
      setEditingReview(null);
      setShowReviewForm(false);
      showToast("Ulasan berhasil diupdate", "success");
    } catch (err) {
      console.error("Error updating review:", err);
      showToast("Gagal mengupdate ulasan", "error");
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
                <button onClick={() => openConfirm("delete", userReview.id)} className="btn-delete" disabled={loading}>
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
                <form onSubmit={editingReview ? handleSubmitEdit : handleSubmitReview} className="review-form">
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
                          setEditingReview(null);
                        } else {
                          setRating(0);
                          setReviewText("");
                          setEditingReview(null);
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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {renderStars(review.rating)}
                  {user && ( (currentUserInfo && currentUserInfo.role === "admin") || (user && review.user_id === user.uid) ) && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-edit" onClick={() => handleStartEdit(review)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => openConfirm("delete", review.id)}>
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {review.review_text && <p className="review-text">{review.review_text}</p>}
            </div>
          ))
        )}
      </div>

      <ConfirmLogoutModal
        isOpen={confirmOpen}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirm}
        title="Hapus Ulasan"
        message="Yakin ingin menghapus ulasan ini?"
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default ReviewSection;
