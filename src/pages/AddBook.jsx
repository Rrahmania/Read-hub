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
    category: "",
    cover_path: "",
    pdf_path: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userRole || userRole !== "admin") {
      navigate("/");
      showToast("Akses ditolak: hanya admin", "error");
    }
  }, [userRole, navigate, showToast]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.pdf_path) {
      setError("Judul dan PDF wajib diisi");
      return;
    }

    if (!form.category) {
      setError("Kategori wajib dipilih");
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

        {/* Kategori */}
        <div className="form-group">
          <label htmlFor="category">Kategori *</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">-- Pilih Kategori --</option>
            
            {/* Fiksi */}
            <optgroup label="Fiksi">
              <option value="Novel">Novel</option>
              <option value="Cerpen">Cerpen</option>
              <option value="Fantasi">Fantasi</option>
              <option value="Petualangan">Petualangan</option>
              <option value="Romansa">Romansa</option>
              <option value="Thriller">Thriller</option>
              <option value="Horor">Horor</option>
              <option value="Misteri">Misteri</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Drama">Drama</option>
              <option value="Komedi">Komedi</option>
            </optgroup>
            
            {/* Non-Fiksi */}
            <optgroup label="Non-Fiksi">
              <option value="Biografi">Biografi</option>
              <option value="Sejarah">Sejarah</option>
              <option value="Motivasi">Motivasi</option>
              <option value="Pengembangan Diri">Pengembangan Diri</option>
              <option value="Bisnis">Bisnis</option>
              <option value="Ekonomi">Ekonomi</option>
              <option value="Psikologi">Psikologi</option>
              <option value="Filsafat">Filsafat</option>
              <option value="Agama">Agama</option>
              <option value="Sosial">Sosial</option>
              <option value="Politik">Politik</option>
            </optgroup>
            
            {/* Akademik */}
            <optgroup label="Akademik">
              <option value="Pendidikan">Pendidikan</option>
              <option value="Teknologi">Teknologi</option>
              <option value="Komputer">Komputer</option>
              <option value="Sains">Sains</option>
              <option value="Matematika">Matematika</option>
              <option value="Kedokteran">Kedokteran</option>
              <option value="Hukum">Hukum</option>
              <option value="Karya Ilmiah">Karya Ilmiah</option>
            </optgroup>
            
            {/* Lainnya */}
            <optgroup label="Lainnya">
              <option value="Anak-anak">Anak-anak</option>
              <option value="Komik">Komik</option>
              <option value="Manga">Manga</option>
              <option value="Ensiklopedia">Ensiklopedia</option>
              <option value="Kamus">Kamus</option>
            </optgroup>
          </select>
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
