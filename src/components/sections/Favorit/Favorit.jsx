// src/components/sections/Favorit/Favorit.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import "./Favorit.css";

const Favorit = ({
  isLoggedIn,
  favoriteList,
  onRemoveFavorite,
  onDownload,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleDownload = (book) => {
    if (onDownload) {
      onDownload(book, showToast);
    }
  };

  const handleRemove = (book) => {
    if (onRemoveFavorite) onRemoveFavorite(book, showToast);
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
                  </div>

                  <div className="card-buttons">
                    <button
                      className="btn btn-read"
                      onClick={() => navigate(`/read/${book.id}`)}
                    >
                      📖 Baca
                    </button>
                    <button
                      className="btn btn-download"
                      onClick={() => handleDownload(book)}
                    >
                      ⬇️ Download
                    </button>
                    <button
                      className="btn btn-remove"
                      onClick={() => handleRemove(book)}
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
