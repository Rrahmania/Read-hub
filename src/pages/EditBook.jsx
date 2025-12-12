import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookById, updateBook } from "../services/bookService";
import { useToast } from "../context/ToastContext";
import "./AddBook.css";

function EditBook({ userRole }) {
  const { id } = useParams();
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
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userRole || userRole !== "admin") {
      navigate("/");
      showToast("Akses ditolak: hanya admin", "error");
      return;
    }
    fetchBook();
  }, [userRole, navigate, id]);

  const fetchBook = async () => {
    try {
      setFetching(true);
      const data = await getBookById(id);
      setForm({
        title: data.title || "",
        author: data.author || "",
        category: data.category || "",
        cover_path: data.cover_path || "",
        pdf_path: data.pdf_path || "",
      });
    } catch (err) {
      console.error(err);
      showToast("Gagal mengambil data buku", "error");
      navigate("/manage-books");
    } finally {
      setFetching(false);
    }
  };

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
      await updateBook(id, form);
      showToast("✅ Buku berhasil diupdate", "success");
      navigate("/manage-books");
    } catch (err) {
      console.error(err);
      setError("❌ Gagal mengupdate buku");
      showToast("❌ Gagal mengupdate buku", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage-books");
  };

  if (fetching) {
    return (
      <div className="add-book-container">
        <div className="loading">Memuat data buku...</div>
      </div>
    );
  }

  return (
    <div className="add-book-container">
      <h2>✏️ Edit Buku</h2>
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

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Batal
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBook;