import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProgress, deleteProgress } from "../services/progressService";
import { useToast } from "../context/ToastContext";
import ConfirmLogoutModal from "../components/layout/ConfirmLogoutModal";
import "./MyProgress.css";

const MyProgress = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait for auth to initialize
    if (!user) {
      navigate("/login");
      return;
    }
    loadProgress();
  }, [user, authLoading, navigate]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await getUserProgress();
      setProgressList(data);
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedProgress, setSelectedProgress] = React.useState(null);

  const openDeleteConfirm = (item) => {
    setSelectedProgress(item);
    setConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setSelectedProgress(null);
    setConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgress) return;
    try {
      await deleteProgress(selectedProgress.book_id);
      await loadProgress();
      showToast("Progres berhasil dihapus", "success");
    } catch (err) {
      console.error("Error deleting progress:", err);
      showToast("Gagal menghapus progres", "error");
    } finally {
      setSelectedProgress(null);
      setConfirmOpen(false);
    }
  };

  const handleContinueReading = (bookId) => {
    navigate(`/baca/${bookId}`);
  };

  if (loading) {
    return <div className="loading">Memuat progres baca...</div>;
  }

  return (
    <div className="my-progress-container">
      <div className="progress-header">
        <h1>Progres Baca Saya</h1>
        <p>Lanjutkan membaca dari halaman terakhir Anda</p>
      </div>

      {progressList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>Belum ada progres baca</h2>
          <p>Mulai membaca buku untuk melihat progres Anda di sini</p>
          <button onClick={() => navigate("/")} className="btn-browse">
            Jelajahi Buku
          </button>
        </div>
      ) : (
        <div className="progress-grid">
          {progressList.map((item) => (
            <div key={item.id} className="progress-card">
              <div className="progress-card-image">
                <img src={item.cover_path} alt={item.title} />
                <div className="progress-overlay">
                  <span className="progress-percentage">
                    {parseFloat(item.progress_percentage).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="progress-card-content">
                <h3>{item.title}</h3>
                <p className="author">{item.author}</p>
                <div className="progress-info">
                  <span className="category">{item.category}</span>
                  <span className="pages">
                    Hal. {item.current_page} / {item.total_pages}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${item.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="last-read">
                  Terakhir dibaca: {new Date(item.last_read_at).toLocaleDateString("id-ID")}
                </div>
                <div className="progress-actions">
                  <button
                    onClick={() => handleContinueReading(item.book_id)}
                    className="btn-continue"
                  >
                    Lanjutkan Membaca
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(item)}
                    className="btn-delete-progress"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmLogoutModal
        isOpen={confirmOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message={
          selectedProgress
            ? `Yakin ingin menghapus progres baca untuk "${selectedProgress.title}"?`
            : "Yakin ingin menghapus progres baca ini?"
        }
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default MyProgress;
