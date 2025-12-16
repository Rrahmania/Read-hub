import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { useAuth } from "../context/AuthContext";
import { getBookProgress, saveProgress } from "../services/progressService";
import ReviewSection from "../components/reviews/ReviewSection";
import "./BacaBuku.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const BacaBuku = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [showReviews, setShowReviews] = useState(false);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${BASE.replace(/\/$/, "")}/books/${id}`);
        if (!res.ok) throw new Error("Buku tidak ditemukan");
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    }
    fetchBook();
  }, [id, navigate]);

  // Load saved progress when user is logged in
  useEffect(() => {
    if (user && numPages) {
      loadProgress();
    }
  }, [user, numPages]);

  const loadProgress = async () => {
    try {
      const data = await getBookProgress(id);
      if (data.hasProgress) {
        setPageNumber(data.progress.current_page);
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  };

  // Save progress when page changes (debounced)
  useEffect(() => {
    if (user && numPages && pageNumber > 0) {
      const timer = setTimeout(() => {
        saveProgressToDb();
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [pageNumber, numPages, user]);

  const saveProgressToDb = async () => {
    try {
      await saveProgress(id, pageNumber, numPages);
      console.log("Progress saved:", pageNumber, "/", numPages);
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  useEffect(() => {
    setPageInput(pageNumber.toString());
  }, [pageNumber]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  // touch handlers removed; keep pdfContainerRef for potential future use

  const goToPage = (page) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page);
    } else {
      setPageInput(pageNumber.toString());
    }
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput);
    if (isNaN(page) || page < 1 || page > numPages) {
      setPageInput(pageNumber.toString());
    }
  };

  if (!book) return <div className="loading">Memuat...</div>;

  const progress = numPages ? ((pageNumber / numPages) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="read-mode-container">
      <div className="read-layout">
        <div className="read-sidebar">
          <div className="sidebar-cover-wrapper">
            <img
              src={book.cover_path}
              alt={book.title}
              className="sidebar-cover"
            />
          </div>
          <div className="sidebar-text">
            <h1 className="sidebar-title">{book.title}</h1>
            <p className="sidebar-author">{book.author}</p>
            <div className="sidebar-meta">
              <span className="meta-item">{book.category}</span>
              {book.language && (
                <span className="meta-item">• {book.language}</span>
              )}
              {!book.language && book.language_code && (
                <span className="meta-item">• {book.language_code}</span>
              )}
            </div>
            
            {/* Progress Reading */}
            {numPages && (
              <div className="reading-progress">
                <div className="progress-label">
                  <span>Progress Baca</span>
                  <span className="progress-percent">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-pages">
                  Halaman {pageNumber} dari {numPages}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="read-content-area">
          <div className="white-paper">
            {/* Page Navigation Top */}
            {numPages && (
              <div className="page-nav-top">
                <button
                  className="page-nav-btn"
                  onClick={() => goToPage(1)}
                  disabled={pageNumber === 1}
                  title="Halaman Pertama"
                >
                  ⏮️
                </button>
                <button
                  className="page-nav-btn"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  title="Halaman Sebelumnya"
                >
                  ◀️
                </button>
                
                <form onSubmit={handlePageInputSubmit} className="page-jump">
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    className="page-input"
                  />
                  <span className="page-separator">/</span>
                  <span className="total-pages">{numPages}</span>
                </form>

                <button
                  className="page-nav-btn"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  title="Halaman Berikutnya"
                >
                  ▶️
                </button>
                <button
                  className="page-nav-btn"
                  onClick={() => goToPage(numPages)}
                  disabled={pageNumber === numPages}
                  title="Halaman Terakhir"
                >
                  ⏭️
                </button>
              </div>
            )}

            <div className="pdf-container" ref={pdfContainerRef}>
              {book.pdf_path ? (
                <Document
                  file={book.pdf_path}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="loading-text">Sedang memuat PDF...</div>
                  }
                  error={<div className="error-text">Gagal memuat PDF.</div>}
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={500}
                  />
                </Document>
              ) : (
                <div className="paper-placeholder">
                  <h3>{book.title}</h3>
                  <p>⚠️ File PDF belum tersedia untuk buku ini.</p>
                </div>
              )}

              {/* Zoom controls moved to side controls to avoid blocking view */}
            </div>

            {/* Page Navigation Bottom */}
            {numPages && (
              <div className="page-nav-bottom">
                <div className="page-info">
                  <span className="current-page">Halaman {pageNumber}</span>
                  <span className="page-divider">•</span>
                  <span className="total-info">{numPages} halaman total</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Controls */}
        <div className="read-controls">
          <button
            className="nav-btn up"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            title="Halaman Sebelumnya (↑)"
          >
            ↑
          </button>
          <div className="page-indicator">
            {pageNumber}/{numPages || "?"}
          </div>
          <button
            className="nav-btn down"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            title="Halaman Berikutnya (↓)"
          >
            ↓
          </button>
        </div>
      </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-container">
        <button 
          className="toggle-reviews-btn"
          onClick={() => setShowReviews(!showReviews)}
        >
          {showReviews ? "Sembunyikan Ulasan" : "Lihat Rating & Ulasan"}
        </button>
        {showReviews && <ReviewSection bookId={id} />}
      </div>
    </div>
  );
};

export default BacaBuku;
