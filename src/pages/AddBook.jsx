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
    categories: [], // Ganti dari category menjadi categories (array)
    cover_path: "",
    pdf_path: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Daftar kategori tersedia
  const availableCategories = [
    // Fiksi
    { value: "Novel", label: "Novel", group: "Fiksi" },
    { value: "Cerpen", label: "Cerpen", group: "Fiksi" },
    { value: "Fantasi", label: "Fantasi", group: "Fiksi" },
    { value: "Petualangan", label: "Petualangan", group: "Fiksi" },
    { value: "Romansa", label: "Romansa", group: "Fiksi" },
    { value: "Thriller", label: "Thriller", group: "Fiksi" },
    { value: "Horor", label: "Horor", group: "Fiksi" },
    { value: "Misteri", label: "Misteri", group: "Fiksi" },
    { value: "Sci-Fi", label: "Sci-Fi", group: "Fiksi" },
    { value: "Drama", label: "Drama", group: "Fiksi" },
    { value: "Komedi", label: "Komedi", group: "Fiksi" },
    
    // Non-Fiksi
    { value: "Biografi", label: "Biografi", group: "Non-Fiksi" },
    { value: "Sejarah", label: "Sejarah", group: "Non-Fiksi" },
    { value: "Motivasi", label: "Motivasi", group: "Non-Fiksi" },
    { value: "Pengembangan Diri", label: "Pengembangan Diri", group: "Non-Fiksi" },
    { value: "Bisnis", label: "Bisnis", group: "Non-Fiksi" },
    { value: "Ekonomi", label: "Ekonomi", group: "Non-Fiksi" },
    { value: "Psikologi", label: "Psikologi", group: "Non-Fiksi" },
    { value: "Filsafat", label: "Filsafat", group: "Non-Fiksi" },
    { value: "Agama", label: "Agama", group: "Non-Fiksi" },
    { value: "Sosial", label: "Sosial", group: "Non-Fiksi" },
    { value: "Politik", label: "Politik", group: "Non-Fiksi" },
    
    // Akademik
    { value: "Pendidikan", label: "Pendidikan", group: "Akademik" },
    { value: "Teknologi", label: "Teknologi", group: "Akademik" },
    { value: "Komputer", label: "Komputer", group: "Akademik" },
    { value: "Sains", label: "Sains", group: "Akademik" },
    { value: "Matematika", label: "Matematika", group: "Akademik" },
    { value: "Kedokteran", label: "Kedokteran", group: "Akademik" },
    { value: "Hukum", label: "Hukum", group: "Akademik" },
    { value: "Karya Ilmiah", label: "Karya Ilmiah", group: "Akademik" },
    
    // Lainnya
    { value: "Anak-anak", label: "Anak-anak", group: "Lainnya" },
    { value: "Komik", label: "Komik", group: "Lainnya" },
    { value: "Manga", label: "Manga", group: "Lainnya" },
    { value: "Ensiklopedia", label: "Ensiklopedia", group: "Lainnya" },
    { value: "Kamus", label: "Kamus", group: "Lainnya" },
  ];

  useEffect(() => {
    if (!userRole || userRole !== "admin") {
      navigate("/");
      showToast("Akses ditolak: hanya admin", "error");
    }
  }, [userRole, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "categories") {
      // Untuk multiple select, kita perlu mengambil semua option yang selected
      const selectedOptions = Array.from(e.target.selectedOptions);
      const selectedValues = selectedOptions.map(option => option.value);
      setForm({ ...form, categories: selectedValues });
    } else {
      setForm({ ...form, [name]: value });
    }
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
      // Kirim categories sebagai array
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

        {/* Kategori - MULTIPLE SELECT */}
        <div className="form-group">
          <label htmlFor="categories">Kategori * (Bisa pilih lebih dari satu)</label>
          <div className="select-hint">Tahan Ctrl (Windows) atau Cmd (Mac) untuk memilih multiple</div>
          <select
            id="categories"
            name="categories"
            value={form.categories}
            onChange={handleChange}
            multiple
            required
            disabled={loading}
            size="6" // Menampilkan 6 baris sekaligus
            className="multi-select"
          >
            {availableCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          
          {/* Menampilkan kategori yang dipilih */}
          {form.categories.length > 0 && (
            <div className="selected-categories">
              <strong>Kategori terpilih:</strong>
              <div className="categories-tags">
                {form.categories.map((catValue) => {
                  const category = availableCategories.find(c => c.value === catValue);
                  return (
                    <span key={catValue} className="category-tag">
                      {category?.label || catValue}
                      <button 
                        type="button" 
                        className="remove-tag"
                        onClick={() => {
                          setForm({
                            ...form,
                            categories: form.categories.filter(c => c !== catValue)
                          });
                        }}
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
              <img src={form.cover_path} alt="Preview Cover" onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/200x280?text=Cover+Tidak+Tersedia";
              }} />
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
