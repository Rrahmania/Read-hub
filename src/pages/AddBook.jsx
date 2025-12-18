import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addBook } from "../services/bookService";
import { useToast } from "../context/ToastContext";
import "./AddBook.css";

function AddBook({ userRole }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    author: "",
    categories: [], // Array untuk multiple categories
    cover_path: "",
    pdf_path: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kategori dikelompokkan berdasarkan group
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

  useEffect(() => {
    if (!userRole || userRole !== "admin") {
      navigate("/");
      showToast("Akses ditolak: hanya admin", "error");
    }
  }, [userRole, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Fungsi untuk toggle kategori
  const handleCategoryToggle = (categoryValue) => {
    setForm(prev => {
      if (prev.categories.includes(categoryValue)) {
        // Hapus kategori jika sudah ada
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== categoryValue)
        };
      } else {
        // Tambah kategori jika belum ada
        return {
          ...prev,
          categories: [...prev.categories, categoryValue]
        };
      }
    });
  };

  // Fungsi untuk clear semua kategori
  const clearAllCategories = () => {
    setForm(prev => ({
      ...prev,
      categories: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.pdf_path) {
      setError("Judul dan PDF wajib diisi");
      return;
    }

    if (form.categories.length === 0) {
      setError("Pilih minimal satu kategori");
      return;
    }

    try {
      setLoading(true);
      await addBook(form);
      showToast("✅ Buku berhasil ditambahkan", "success");
      navigate("/manage-books");
    } catch (err) {
      console.error(err);
      setError("❌ Gagal menambahkan buku: " + (err.message || "Terjadi kesalahan"));
      showToast("❌ Gagal menambahkan buku", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage-books");
  };

  return (
    <div className="add-book-container">
      <h2>📚 Tambah Buku Baru</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="add-book-form">
        {/* Judul */}
        <div className="form-group">
          <label htmlFor="title">Judul Buku *</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Masukkan judul buku"
            value={form.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Penulis */}
        <div className="form-group">
          <label htmlFor="author">Penulis</label>
          <input
            id="author"
            type="text"
            name="author"
            placeholder="Masukkan nama penulis"
            value={form.author}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* ========== KATEGORI CHECKBOX ========== */}
        <div className="form-group">
          <label htmlFor="categories">Kategori * (Bisa pilih lebih dari satu)</label>
          
          {/* Container untuk kategori */}
          <div className="categories-checkbox-container">
            
            {/* Loop melalui semua group kategori */}
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
                  {/* Loop melalui kategori dalam group */}
                  {categories.map((category) => (
                    <div key={category.value} className="category-checkbox">
                      <input
                        type="checkbox"
                        id={`cat-${category.value}`}
                        value={category.value}
                        checked={form.categories.includes(category.value)}
                        onChange={() => handleCategoryToggle(category.value)}
                        disabled={loading}
                      />
                      <label htmlFor={`cat-${category.value}`}>
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Menampilkan kategori yang dipilih */}
          {form.categories.length > 0 && (
            <div className="selected-categories">
              <div className="selected-categories-header">
                <strong>Kategori terpilih ({form.categories.length}):</strong>
                <button 
                  type="button" 
                  className="clear-categories-btn"
                  onClick={clearAllCategories}
                  disabled={loading}
                >
                  🗑️ Hapus Semua
                </button>
              </div>
              
              <div className="categories-tags">
                {form.categories.map((catValue) => {
                  // Cari label dari semua kategori
                  let label = catValue;
                  Object.values(categoryGroups).forEach(group => {
                    const found = group.find(cat => cat.value === catValue);
                    if (found) label = found.label;
                  });
                  
                  return (
                    <span key={catValue} className="category-tag">
                      {label}
                      <button 
                        type="button" 
                        className="remove-tag"
                        onClick={() => handleCategoryToggle(catValue)}
                        title="Hapus kategori"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* ========== END KATEGORI CHECKBOX ========== */}

        {/* Cover */}
        <div className="form-group">
          <label htmlFor="cover_path">URL Cover Buku</label>
          <input
            id="cover_path"
            type="text"
            name="cover_path"
            placeholder="https://example.com/cover.jpg"
            value={form.cover_path}
            onChange={handleChange}
            disabled={loading}
          />
          {form.cover_path && (
            <div className="preview-cover">
              <img 
                src={form.cover_path} 
                alt="Preview Cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/200x280?text=Cover+Tidak+Tersedia";
                }} 
              />
            </div>
          )}
        </div>

        {/* PDF */}
        <div className="form-group">
          <label htmlFor="pdf_path">URL PDF Buku *</label>
          <input
            id="pdf_path"
            type="text"
            name="pdf_path"
            placeholder="https://example.com/book.pdf"
            value={form.pdf_path}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={handleCancel}
            disabled={loading}
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "💾 Simpan Buku"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBook;
