import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks, deleteBook } from "../services/bookService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import "./ManageBooks.css";

function ManageBooks() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userRole } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (userRole !== "admin") {
      showToast("Akses ditolak: hanya admin", "error");
      navigate("/");
      return;
    }
    fetchBooks();
  }, [userRole]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      showToast("Gagal mengambil data buku", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book) => {
    try {
      setDeleting(book.id);
      await deleteBook(book.id);
      showToast(`Buku "${book.title}" berhasil dihapus`, "success");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      showToast("Gagal menghapus buku", "error");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="manage-books-container">
        <div className="loading">Memuat data buku...</div>
      </div>
    );
  }

  return (
    <div className="manage-books-container">
      <div className="manage-header">
        <h2>📚 Kelola Buku</h2>
        <button className="btn-add-new" onClick={() => navigate("/add-book")}>
          ➕ Tambah Buku Baru
        </button>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada buku. Tambahkan buku pertama Anda!</p>
          <button onClick={() => navigate("/add-book")}>Tambah Buku</button>
        </div>
      ) : (
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Judul</th>
                <th>Penulis</th>
                <th>Kategori</th>
                <th>Ditambahkan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    {book.cover_path ? (
                      <img
                        src={book.cover_path}
                        alt={book.title}
                        className="book-cover-thumb"
                      />
                    ) : (
                      <div className="no-cover">📖</div>
                    )}
                  </td>
                  <td className="book-title">{book.title}</td>
                  <td>{book.author || "-"}</td>
                  <td>
                    <span className="category-badge">
                      {book.category || "Umum"}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(book.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/read/${book.id}`)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/edit-book/${book.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(book)}
                        disabled={deleting === book.id}
                      >
                        {deleting === book.id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="books-summary">Total: {books.length} buku</div>
    </div>
  );
}

export default ManageBooks;
