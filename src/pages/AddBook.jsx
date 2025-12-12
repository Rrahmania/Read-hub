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
  }, [userRole, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.pdf_path) {
      setError("Judul dan PDF wajib diisi");
      return;
    }

    try {
      setLoading(true);
      await addBook(form);
      showToast("✅ Buku berhasil ditambahkan", "success");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("❌ Gagal menambahkan buku");
      showToast("❌ Gagal menambahkan buku", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-container">
      <h2>📚 Tambah Buku Baru</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="add-book-form">
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Penulis</label>
          <input
            id="author"
            type="text"
            name="author"
            placeholder="Masukkan nama penulis"
            value={form.author}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Kategori</label>
          <input
            id="category"
            type="text"
            name="category"
            placeholder="Contoh: Fiksi, Non-Fiksi, Teknologi"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cover_path">URL Cover Buku</label>
          <input
            id="cover_path"
            type="text"
            name="cover_path"
            placeholder="https://example.com/cover.jpg"
            value={form.cover_path}
            onChange={handleChange}
          />
          {form.cover_path && (
            <div className="preview-cover">
              <img src={form.cover_path} alt="Preview Cover" />
            </div>
          )}
        </div>

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
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "💾 Simpan Buku"}
        </button>
      </form>
    </div>
  );
}

export default AddBook;
