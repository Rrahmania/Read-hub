import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { getBookReviews } from "../../../services/reviewService";
import "./KoleksiBuku.css";

const KoleksiBuku = ({ books = [], onAddToFavorite, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortOption, setSortOption] = useState("terbaru");
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const safeBooks = Array.isArray(books) ? books : [];

  const [ratings, setRatings] = useState({});

  // Daftar genre yang tersedia (ambil dari semua buku)
  const allGenres = React.useMemo(() => {
    const genres = new Set();
    safeBooks.forEach(book => {
      if (book.categories && Array.isArray(book.categories)) {
        book.categories.forEach(cat => genres.add(cat));
      } else if (book.category) {
        genres.add(book.category);
      }
    });
    return Array.from(genres).sort();
  }, [safeBooks]);

  // Genre populer untuk quick filter
  const popularGenres = ["Novel", "Pendidikan", "Teknologi", "Bisnis", "Sejarah", "Anak-anak"];

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

  // Toggle genre selection
  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenres([]);
    setSortOption("terbaru");
  };

  // Filter books berdasarkan search term dan genre
  const filteredBooks = safeBooks.filter((book) => {
    const term = searchTerm.toLowerCase();
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.author ? book.author.toLowerCase() : "";
    
    // Cek search term
    const matchesSearch = title.includes(term) || author.includes(term);
    
    // Cek genre filter
    const matchesGenre = selectedGenres.length === 0 || 
      (book.categories && Array.isArray(book.categories)
        ? book.categories.some(cat => selectedGenres.includes(cat))
        : book.category && selectedGenres.includes(book.category));
    
    return matchesSearch && matchesGenre;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortOption) {
      case "terbaru":
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case "terlama":
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      case "rating-tinggi":
        const ratingA = ratings[a.id]?.average_rating || a.average_rating || 0;
        const ratingB = ratings[b.id]?.average_rating || b.average_rating || 0;
        return ratingB - ratingA;
      case "rating-rendah":
        const ratingA2 = ratings[a.id]?.average_rating || a.average_rating || 0;
        const ratingB2 = ratings[b.id]?.average_rating || b.average_rating || 0;
        return ratingA2 - ratingB2;
      case "a-z":
        return (a.title || "").localeCompare(b.title || "");
      case "z-a":
        return (b.title || "").localeCompare(a.title || "");
      default:
        return 0;
    }
  });

  return (
    <section className="koleksi-section">
      <div className="koleksi-container">
        {/* Header dengan Search */}
        <div className="koleksi-header">
          <h2 className="section-title">📚 Koleksi Buku</h2>
          
          <div className="search-filter-container">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari judul, penulis, atau genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-controls">
              <button 
                className={`filter-toggle-btn ${showFilter ? 'active' : ''}`}
                onClick={() => setShowFilter(!showFilter)}
              >
                🎯 Filter
                {selectedGenres.length > 0 && (
                  <span className="filter-count">{selectedGenres.length}</span>
                )}
              </button>
              
              <select 
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="terbaru">📅 Terbaru</option>
                <option value="terlama">📅 Terlama</option>
                <option value="rating-tinggi">⭐ Rating Tertinggi</option>
                <option value="rating-rendah">⭐ Rating Terendah</option>
                <option value="a-z">🔤 A-Z</option>
                <option value="z-a">🔤 Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filter Genre</h3>
              <div className="filter-actions">
                {selectedGenres.length > 0 && (
                  <button 
                    className="clear-filter-btn"
                    onClick={clearFilters}
                  >
                    🗑️ Hapus Semua
                  </button>
                )}
                <button 
                  className="close-filter-btn"
                  onClick={() => setShowFilter(false)}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* Quick Filter - Genre Populer */}
            <div className="quick-filter-section">
              <h4>Genre Populer:</h4>
              <div className="quick-filter-chips">
                {popularGenres
                  .filter(genre => allGenres.includes(genre))
                  .map(genre => (
                    <button
                      key={genre}
                      className={`quick-filter-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                      {selectedGenres.includes(genre) && <span className="check-mark">✓</span>}
                    </button>
                  ))
                }
              </div>
            </div>

            {/* All Genres */}
            <div className="all-genres-section">
              <h4>Semua Genre ({allGenres.length}):</h4>
              <div className="genres-grid">
                {allGenres.map(genre => (
                  <div key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      id={`genre-${genre}`}
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                    />
                    <label htmlFor={`genre-${genre}`}>
                      {genre}
                      {selectedGenres.includes(genre) && (
                        <span className="selected-indicator">✓</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Genres Preview */}
            {selectedGenres.length > 0 && (
              <div className="selected-genres-preview">
                <h4>Genre Terpilih:</h4>
                <div className="selected-genres-tags">
                  {selectedGenres.map(genre => (
                    <span key={genre} className="selected-genre-tag">
                      {genre}
                      <button 
                        className="remove-genre-btn"
                        onClick={() => toggleGenre(genre)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <span className="stats-item">
            📚 Total Buku: <strong>{safeBooks.length}</strong>
          </span>
          <span className="stats-item">
            🔍 Ditemukan: <strong>{sortedBooks.length}</strong>
          </span>
          {selectedGenres.length > 0 && (
            <span className="stats-item">
              🎯 Filter Aktif: <strong>{selectedGenres.length} genre</strong>
            </span>
          )}
          {(searchTerm || selectedGenres.length > 0) && (
            <button 
              className="reset-filters-btn"
              onClick={clearFilters}
            >
              ❌ Reset Filter
            </button>
          )}
        </div>

        {/* Books Grid */}
        <div className="books-grid">
          {sortedBooks.length > 0 ? (
            sortedBooks.map((book, index) => {
              const bookRating = ratings[book.id]?.average_rating || book.average_rating;
              const bookCategories = book.categories || (book.category ? [book.category] : []);
              
              return (
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
                    
                    {/* Book Categories Badges */}
                    {bookCategories.length > 0 && (
                      <div className="book-categories-badges">
                        {bookCategories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="category-badge-mini">
                            {cat}
                          </span>
                        ))}
                        {bookCategories.length > 2 && (
                          <span className="more-categories">+{bookCategories.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="card-info">
                    <h3 className="book-title" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="book-author">
                      ✍️ {book.author || "Penulis tidak diketahui"}
                    </p>
                    
                    {/* Rating Section */}
                    {bookRating && (
                      <div className="card-rating">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < Math.round(bookRating) ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="rating-value">
                          {parseFloat(bookRating).toFixed(1)}
                          {ratings[book.id]?.total_reviews && (
                            <span className="review-count">
                              ({ratings[book.id].total_reviews})
                            </span>
                          )}
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
                      className="btn btn-fav"
                      onClick={() =>
                        onAddToFavorite && onAddToFavorite(book, showToast)
                      }
                    >
                      ❤️ Favorit
                    </button>
                    <button
                      className="btn btn-details"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      👁️ Detail
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>Buku Tidak Ditemukan</h3>
              <p>
                {searchTerm || selectedGenres.length > 0
                  ? "Tidak ada buku yang sesuai dengan kriteria pencarian Anda."
                  : "Belum ada buku dalam koleksi."}
              </p>
              {(searchTerm || selectedGenres.length > 0) && (
                <button 
                  className="btn btn-primary"
                  onClick={clearFilters}
                >
                  Tampilkan Semua Buku
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KoleksiBuku;
