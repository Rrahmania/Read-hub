// src/components/sections/KoleksiBuku/KoleksiBuku.jsx
import React, { useState, useEffect, useMemo } from "react";
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

  // Daftar kategori yang sama dengan AddBook.jsx
  const categoryGroups = {
    "Fiksi": [
      { value: "Novel", label: "Novel" },
      { value: "Cerpen", label: "Cerpen" },
      { value: "Fantasi", label: "Fantasi" },
      { value: "Petualangan", label: "Petualangan" },
      { value: "Romansa", label: "Romansa" },
      { value: "Thriller", label: "Thriller" },
      { value: "Horor", label: "Horor" },
      { value: "Misteri", label: "Misteri" },
      { value: "Sci-Fi", label: "Sci-Fi" },
      { value: "Drama", label: "Drama" },
      { value: "Komedi", label: "Komedi" },
    ],
    "Non-Fiksi": [
      { value: "Biografi", label: "Biografi" },
      { value: "Sejarah", label: "Sejarah" },
      { value: "Motivasi", label: "Motivasi" },
      { value: "Pengembangan Diri", label: "Pengembangan Diri" },
      { value: "Bisnis", label: "Bisnis" },
      { value: "Ekonomi", label: "Ekonomi" },
      { value: "Psikologi", label: "Psikologi" },
      { value: "Filsafat", label: "Filsafat" },
      { value: "Agama", label: "Agama" },
      { value: "Sosial", label: "Sosial" },
      { value: "Politik", label: "Politik" },
    ],
    "Akademik": [
      { value: "Pendidikan", label: "Pendidikan" },
      { value: "Teknologi", label: "Teknologi" },
      { value: "Komputer", label: "Komputer" },
      { value: "Sains", label: "Sains" },
      { value: "Matematika", label: "Matematika" },
      { value: "Kedokteran", label: "Kedokteran" },
      { value: "Hukum", label: "Hukum" },
      { value: "Karya Ilmiah", label: "Karya Ilmiah" },
    ],
    "Lainnya": [
      { value: "Anak-anak", label: "Anak-anak" },
      { value: "Komik", label: "Komik" },
      { value: "Manga", label: "Manga" },
      { value: "Ensiklopedia", label: "Ensiklopedia" },
      { value: "Kamus", label: "Kamus" },
    ]
  };

  // Ambil semua genre yang tersedia dari books
  const availableGenres = useMemo(() => {
    const genres = new Set();
    safeBooks.forEach(book => {
      if (book.categories && Array.isArray(book.categories)) {
        book.categories.forEach(cat => {
          if (cat) genres.add(cat.trim());
        });
      } else if (book.category) {
        genres.add(book.category.trim());
      }
    });
    return Array.from(genres).sort();
  }, [safeBooks]);

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
    showToast("Filter berhasil direset", "info");
  };

  // Check if a book has selected genres
  const bookHasGenres = (book) => {
    const bookGenres = book.categories || (book.category ? [book.category] : []);
    return selectedGenres.length === 0 || 
           selectedGenres.some(genre => bookGenres.includes(genre));
  };

  // Filter books berdasarkan search term dan genre
  const filteredBooks = safeBooks.filter((book) => {
    const term = searchTerm.toLowerCase();
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.author ? book.author.toLowerCase() : "";
    
    // Cek search term
    const matchesSearch = title.includes(term) || author.includes(term);
    
    // Cek genre filter
    const matchesGenre = bookHasGenres(book);
    
    return matchesSearch && matchesGenre;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortOption) {
      case "terbaru":
        return new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0);
      case "terlama":
        return new Date(a.created_at || a.updated_at || 0) - new Date(b.created_at || b.updated_at || 0);
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
      case "populer":
        const reviewsA = ratings[a.id]?.total_reviews || 0;
        const reviewsB = ratings[b.id]?.total_reviews || 0;
        return reviewsB - reviewsA;
      default:
        return 0;
    }
  });

  // Hitung buku per genre untuk statistik
  const genreStats = useMemo(() => {
    const stats = {};
    safeBooks.forEach(book => {
      const genres = book.categories || (book.category ? [book.category] : []);
      genres.forEach(genre => {
        if (genre) {
          stats[genre] = (stats[genre] || 0) + 1;
        }
      });
    });
    return stats;
  }, [safeBooks]);

  // Genre populer berdasarkan jumlah buku
  const popularGenres = useMemo(() => {
    return Object.entries(genreStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([genre]) => genre);
  }, [genreStats]);

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
                {showFilter ? "✕ Tutup Filter" : "🎯 Filter Buku"}
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
                <option value="populer">🔥 Paling Populer</option>
                <option value="a-z">🔤 A-Z</option>
                <option value="z-a">🔤 Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel dengan Style seperti AddBook.jsx */}
        {showFilter && (
          <div className="filter-panel">
            <div className="filter-header">
              <h3>
                <span className="filter-icon">🎯</span>
                Filter Genre Buku
              </h3>
              <div className="filter-actions">
                {selectedGenres.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={() => setSelectedGenres([])}
                  >
                    🗑️ Hapus Pilihan
                  </button>
                )}
                <button 
                  className="apply-filter-btn"
                  onClick={() => setShowFilter(false)}
                >
                  ✅ Terapkan
                </button>
              </div>
            </div>

            {/* Quick Filter - Genre Populer */}
            {popularGenres.length > 0 && (
              <div className="quick-filter-section">
                <h4>Genre Populer:</h4>
                <div className="quick-filter-chips">
                  {popularGenres.map(genre => (
                    <button
                      key={genre}
                      className={`quick-filter-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                      <span className="genre-count">({genreStats[genre] || 0})</span>
                      {selectedGenres.includes(genre) && (
                        <span className="check-mark">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Genres dengan Grup seperti AddBook.jsx */}
            <div className="all-genres-section">
              <h4>Semua Genre:</h4>
              
              <div className="categories-checkbox-container">
                {Object.entries(categoryGroups).map(([groupName, categories]) => {
                  // Filter hanya kategori yang ada di buku
                  const availableCategories = categories.filter(cat => 
                    availableGenres.includes(cat.value)
                  );
                  
                  if (availableCategories.length === 0) return null;
                  
                  return (
                    <div key={groupName} className="category-group">
                      <span className="categories-group-label">
                        {groupName === "Fiksi" && "📚 "}
                        {groupName === "Non-Fiksi" && "📖 "}
                        {groupName === "Akademik" && "🎓 "}
                        {groupName === "Lainnya" && "📌 "}
                        {groupName}
                        <span className="group-count">({availableCategories.length})</span>
                      </span>
                      
                      <div className="categories-checkbox-group">
                        {availableCategories.map((category) => (
                          <div key={category.value} className="category-checkbox">
                            <input
                              type="checkbox"
                              id={`filter-cat-${category.value}`}
                              checked={selectedGenres.includes(category.value)}
                              onChange={() => toggleGenre(category.value)}
                            />
                            <label htmlFor={`filter-cat-${category.value}`}>
                              {category.label}
                              {genreStats[category.value] && (
                                <span className="book-count">
                                  ({genreStats[category.value]})
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Genres Preview */}
            {selectedGenres.length > 0 && (
              <div className="selected-genres-preview">
                <div className="selected-header">
                  <h4>
                    <span className="selected-icon">✅</span>
                    Genre Terpilih ({selectedGenres.length})
                  </h4>
                  <button 
                    className="remove-all-btn"
                    onClick={() => setSelectedGenres([])}
                  >
                    Hapus Semua
                  </button>
                </div>
                
                <div className="selected-genres-tags">
                  {selectedGenres.map(genre => {
                    // Cari label dari kategori
                    let label = genre;
                    Object.values(categoryGroups).forEach(group => {
                      group.forEach(cat => {
                        if (cat.value === genre) label = cat.label;
                      });
                    });
                    
                    return (
                      <span key={genre} className="selected-genre-tag">
                        {label}
                        {genreStats[genre] && (
                          <span className="tag-count"> ({genreStats[genre]})</span>
                        )}
                        <button 
                          className="remove-genre-btn"
                          onClick={() => toggleGenre(genre)}
                          title="Hapus genre"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter Info */}
            <div className="filter-info">
              <p className="info-text">
                ℹ️ Pilih satu atau lebih genre untuk memfilter koleksi buku.
              </p>
              {selectedGenres.length > 0 && (
                <div className="active-filter-info">
                  <span className="info-icon">📊</span>
                  <span>
                    Menampilkan buku dengan genre:{" "}
                    <strong>{selectedGenres.join(", ")}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stats-left">
            <span className="stats-item">
              📚 Total Buku: <strong>{safeBooks.length}</strong>
            </span>
            <span className="stats-item">
              🔍 Ditemukan: <strong>{sortedBooks.length}</strong>
            </span>
            <span className="stats-item">
              🏷️ Genre Tersedia: <strong>{availableGenres.length}</strong>
            </span>
          </div>
          
          <div className="stats-right">
            {(searchTerm || selectedGenres.length > 0) && (
              <button 
                className="reset-filters-btn"
                onClick={clearFilters}
              >
                ❌ Reset Semua Filter
              </button>
            )}
            {selectedGenres.length > 0 && (
              <span className="active-filters-badge">
                🎯 {selectedGenres.length} Filter Aktif
              </span>
            )}
          </div>
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
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/130x190?text=No+Cover";
                          e.target.className = "cover-img placeholder";
                        }}
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
                    
                    {/* Rating Badge */}
                    {bookRating && (
                      <div className="rating-badge">
                        ⭐ {parseFloat(bookRating).toFixed(1)}
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
                    
                    {/* Categories */}
                    {bookCategories.length > 0 && (
                      <div className="card-categories">
                        {bookCategories.slice(0, 3).map((cat, idx) => (
                          <span key={idx} className="category-chip">
                            {cat}
                          </span>
                        ))}
                        {bookCategories.length > 3 && (
                          <span className="more-categories-chip">
                            +{bookCategories.length - 3} lagi
                          </span>
                        )}
                      </div>
                    )}
                    
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
                      title="Baca buku"
                    >
                      📖 Baca
                    </button>
                    <button
                      className="btn btn-fav"
                      onClick={() =>
                        onAddToFavorite && onAddToFavorite(book, showToast)
                      }
                      title="Tambahkan ke favorit"
                    >
                      ❤️ Favorit
                    </button>
                    <button
                      className="btn btn-details"
                      onClick={() => navigate(`/book/${book.id}`)}
                      title="Lihat detail buku"
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
                  👁️ Tampilkan Semua Buku
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
