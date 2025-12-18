import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { getBookReviews } from "../../../services/reviewService";
import "./KoleksiBuku.css";

const KoleksiBuku = ({ books = [], onAddToFavorite, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("terbaru");
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const safeBooks = Array.isArray(books) ? books : [];

  const [ratings, setRatings] = useState({});

  // Daftar kategori yang SAMA PERSIS dengan AddBook.jsx
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

  // Flatten semua kategori untuk dropdown
  const allCategories = useMemo(() => {
    const categories = [];
    Object.values(categoryGroups).forEach(group => {
      group.forEach(cat => categories.push(cat));
    });
    return categories;
  }, []);

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

  // Toggle kategori selection (SAMA dengan AddBook.jsx)
  const toggleCategory = (categoryValue) => {
    setSelectedCategories(prev =>
      prev.includes(categoryValue)
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSortOption("terbaru");
    showToast("Filter berhasil direset", "info");
  };

  // Filter books berdasarkan search term dan kategori
  const filteredBooks = safeBooks.filter((book) => {
    const term = searchTerm.toLowerCase();
    const title = book.title ? book.title.toLowerCase() : "";
    const author = book.author ? book.author.toLowerCase() : "";
    
    // Cek search term
    const matchesSearch = title.includes(term) || author.includes(term);
    
    // Cek kategori filter
    const bookCategories = book.categories || (book.category ? [book.category] : []);
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.some(cat => bookCategories.includes(cat));
    
    return matchesSearch && matchesCategory;
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
      default:
        return 0;
    }
  });

  // Hitung buku per kategori untuk statistik
  const categoryStats = useMemo(() => {
    const stats = {};
    safeBooks.forEach(book => {
      const categories = book.categories || (book.category ? [book.category] : []);
      categories.forEach(cat => {
        if (cat) {
          stats[cat] = (stats[cat] || 0) + 1;
        }
      });
    });
    return stats;
  }, [safeBooks]);

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
                placeholder="Cari judul atau penulis..."
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
                {showFilter ? "✕ Tutup" : "🏷️ Filter Kategori"}
                {selectedCategories.length > 0 && (
                  <span className="filter-count">{selectedCategories.length}</span>
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

        {/* Filter Panel - SAMA PERSIS dengan AddBook.jsx */}
        {showFilter && (
          <div className="filter-panel">
            <div className="filter-header">
              <h3 className="filter-title">
                <span className="filter-icon">🏷️</span>
                Filter Berdasarkan Kategori
              </h3>
              <div className="filter-actions">
                {selectedCategories.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={() => setSelectedCategories([])}
                  >
                    🗑️ Hapus Semua
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

            {/* Kategori dengan Checkbox Style - SAMA dengan AddBook.jsx */}
            <div className="categories-checkbox-container">
              {Object.entries(categoryGroups).map(([groupName, categories]) => (
                <div key={groupName} className="category-group">
                  <span className="categories-group-label">
                    {groupName === "Fiksi" && "📚 "}
                    {groupName === "Non-Fiksi" && "📖 "}
                    {groupName === "Akademik" && "🎓 "}
                    {groupName === "Lainnya" && "📌 "}
                    {groupName}
                  </span>
                  
                  <div className="categories-checkbox-group">
                    {categories.map((category) => {
                      const bookCount = categoryStats[category.value] || 0;
                      const hasBooks = bookCount > 0;
                      
                      return (
                        <div 
                          key={category.value} 
                          className={`category-checkbox ${!hasBooks ? 'disabled' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={`filter-${category.value}`}
                            value={category.value}
                            checked={selectedCategories.includes(category.value)}
                            onChange={() => hasBooks && toggleCategory(category.value)}
                            disabled={!hasBooks}
                          />
                          <label htmlFor={`filter-${category.value}`}>
                            {category.label}
                            {hasBooks && (
                              <span className="book-count">({bookCount})</span>
                            )}
                            {!hasBooks && (
                              <span className="no-books">(0)</span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Categories Display - SAMA dengan AddBook.jsx */}
            {selectedCategories.length > 0 && (
              <div className="selected-categories-container">
                <div className="selected-categories-header">
                  <strong>
                    <span className="selected-icon">✅</span>
                    Kategori Terpilih ({selectedCategories.length})
                  </strong>
                  <button 
                    type="button" 
                    className="remove-all-btn"
                    onClick={() => setSelectedCategories([])}
                    disabled={selectedCategories.length === 0}
                  >
                    Hapus Semua
                  </button>
                </div>
                
                <div className="categories-tags-grid">
                  {selectedCategories.map((catValue) => {
                    const category = allCategories.find(c => c.value === catValue);
                    const bookCount = categoryStats[catValue] || 0;
                    
                    return (
                      <div key={catValue} className="category-tag-item">
                        <span className="tag-label">{category?.label || catValue}</span>
                        <span className="tag-count">({bookCount})</span>
                        <button 
                          className="remove-tag-btn"
                          onClick={() => toggleCategory(catValue)}
                          title="Hapus kategori"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stats-items">
            <span className="stats-item">
              📚 Total: <strong>{safeBooks.length}</strong> buku
            </span>
            <span className="stats-item">
              🔍 Ditemukan: <strong>{sortedBooks.length}</strong> buku
            </span>
            {selectedCategories.length > 0 && (
              <span className="stats-item">
                🏷️ Filter: <strong>{selectedCategories.length}</strong> kategori
              </span>
            )}
          </div>
          
          {(searchTerm || selectedCategories.length > 0) && (
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
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/130x190/1e3c72/ffffff?text=📚";
                        }}
                      />
                    ) : (
                      <div className="placeholder-box">📚</div>
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
                    
                    {/* Categories Display */}
                    {bookCategories.length > 0 && (
                      <div className="card-categories">
                        {bookCategories.slice(0, 3).map((cat, idx) => (
                          <span key={idx} className="category-chip">
                            {cat}
                          </span>
                        ))}
                        {bookCategories.length > 3 && (
                          <span className="more-categories">
                            +{bookCategories.length - 3}
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
                        <span className="rating-text">
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
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>Buku Tidak Ditemukan</h3>
              <p>
                {searchTerm || selectedCategories.length > 0
                  ? "Tidak ada buku yang sesuai dengan kriteria pencarian Anda."
                  : "Belum ada buku dalam koleksi."}
              </p>
              {(searchTerm || selectedCategories.length > 0) && (
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
