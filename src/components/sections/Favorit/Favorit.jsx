// src/components/sections/Favorit/Favorit.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { getBookReviews } from "../../../services/reviewService";
import "./Favorit.css";

const Favorit = ({
  isLoggedIn,
  favoriteList,
  onRemoveFavorite,
  onDownload,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookRatings, setBookRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Load ratings untuk semua buku favorit
  useEffect(() => {
    if (favoriteList.length > 0) {
      loadBookRatings();
    }
  }, [favoriteList]);

  const loadBookRatings = async () => {
    setLoadingRatings(true);
    try {
      const ratings = {};
      for (const book of favoriteList) {
        try {
          const data = await getBookReviews(book.id);
          if (data.statistics) {
            ratings[book.id] = data.statistics;
          }
        } catch (err) {
          console.error(`Error loading rating for book ${book.id}:`, err);
        }
      }
      setBookRatings(ratings);
    } catch (err) {
      console.error("Error loading book ratings:", err);
    } finally {
      setLoadingRatings(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: "2px", fontSize: "0.9rem" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= Math.round(rating) ? "#ffc107" : "#ddd",
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="favorit-container">
      <div className="favorit-header">
        <h2>Rak Buku Favorit</h2>
        <p>Koleksi buku pilihan Anda tersimpan di sini.</p>
      </div>

      {!isLoggedIn ? (
        <div className="favorit-locked">
          <div className="lock-icon">🔒</div>
          <h3>Akses Terbatas</h3>
          <p>
            Silakan <Link to="/login">Login</Link> terlebih dahulu.
          </p>
          <Link to="/login">
            <button className="btn-login-redirect">Masuk ke Akun</button>
          </Link>
        </div>
      ) : (
        <div className="favorit-content">
          {favoriteList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Belum ada buku favorit</h3>
              <p>Simpan buku yang Anda suka agar mudah ditemukan nanti.</p>
              <Link to="/books">
                <button className="btn-cari">Cari Buku Sekarang</button>
              </Link>
            </div>
          ) : (
            <div className="books-grid">
              {favoriteList.map((book) => (
                <div key={book.id} className="book-card">
                  <div className="card-image-area">
                    <img
                      src={book.cover_path || "/images/placeholder.png"}
                      alt={book.title}
                      className="cover-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                  </div>

                  <div className="card-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    <span className="category-tag">
                      {book.category || "Umum"}
                    </span>
                    {bookRatings[book.id] && (
                      <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {renderStars(bookRatings[book.id].average_rating || 0)}
                        <span style={{ fontSize: "0.85rem", color: "#666" }}>
                          {parseFloat(bookRatings[book.id].average_rating || 0).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-buttons">
                    <button
                      className="btn btn-read"
                      onClick={() => navigate(`/read/${book.id}`)}
                    >
                      📖 Baca
                    </button>
                    <button
                      className="btn btn-remove"
                      onClick={() => onRemoveFavorite(book, showToast)}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorit;

