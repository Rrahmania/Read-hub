// src/components/sections/KoleksiBuku/KoleksiBuku.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { getBookReviews } from "../../../services/reviewService";
import "./KoleksiBuku.css";

const KoleksiBuku = ({ books = [], onAddToFavorite, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const safeBooks = Array.isArray(books) ? books : [];

  const [ratings, setRatings] = useState({}); // map bookId -> { average, total }

  useEffect(() => {
    let mounted = true;
    const fetchRatings = async () => {
      try {
        const ids = safeBooks.map((b) => b.id).filter(Boolean);
        const promises = ids.map(async (id) => {
          try {
            const res = await getBookReviews(id);
            return { id, statistics: res.statistics };
          } catch (err) {
            return { id, statistics: null };
          }
        });

        const results = await Promise.all(promises);
        if (!mounted) return;
        const map = {};
        results.forEach((r) => {
          if (r && r.id && r.statistics) {
            map[r.id] = r.statistics;
          }
        });
        setRatings(map);
      } catch (err) {
        // ignore
      }
    };

    if (safeBooks.length) fetchRatings();
    return () => {
      mounted = false;
    };
  }, [books]);

  const filteredBooks = safeBooks.filter((book) => {
    const term = searchTerm.toLowerCase();
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.author ? book.author.toLowerCase() : "";
    const category = book.category ? book.category.toLowerCase() : "";
    return (
      title.includes(term) || author.includes(term) || category.includes(term)
    );
  });

  return (
    <section className="koleksi-section">
      <div className="koleksi-container">
        <div className="koleksi-header">
          <h2 className="section-title">Koleksi Buku</h2>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari judul, penulis, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="books-grid">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book, index) => (
              <div key={book.id || index} className="book-card">
                <div className="card-image-area">
                  {book.cover_path ? (
                    <img
                      src={book.cover_path}
                      alt={book.title}
                      className="cover-img"
                    />
                  ) : (
                    <div className="placeholder-box">📚</div>
                  )}
                </div>

                <div className="card-info">
                  <h3 className="book-title" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="book-author">{book.author}</p>
                  <span className="category-tag">{book.category || "Umum"}</span>

                  {/* Rating (if available) */}
                  {((book.average_rating || ratings[book.id]) && (
                    <div className="card-rating">
                      <div className="average-score">
                        {book.average_rating
                          ? parseFloat(book.average_rating).toFixed(1)
                          : ratings[book.id]
                          ? parseFloat(ratings[book.id].average_rating).toFixed(1)
                          : "-"}
                      </div>
                      <div className="stars-inline">
                        {(() => {
                          const avg = book.average_rating
                            ? Math.round(book.average_rating)
                            : ratings[book.id]
                            ? Math.round(ratings[book.id].average_rating)
                            : 0;
                          return [1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={s <= avg ? "star filled" : "star"}>★</span>
                          ));
                        })()}
                      </div>
                      <div className="total-reviews-small">
                        {ratings[book.id] && ratings[book.id].total_reviews
                          ? `${ratings[book.id].total_reviews} ulasan`
                          : ""}
                      </div>
                    </div>
                  )) || null}
                </div>

                <div className="card-buttons">
                  <button
                    className="btn btn-read"
                    onClick={() => navigate(`/read/${book.id}`)}
                  >
                    📖 Baca
                  </button>
                  <button
                    className="btn btn-fav"
                    onClick={() =>
                      onAddToFavorite && onAddToFavorite(book, showToast)
                    }
                  >
                    ❤️ Favorit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>😔 Maaf, buku yang Anda cari tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KoleksiBuku;

