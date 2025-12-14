import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { useAuth } from "../context/AuthContext";
import { getBookProgress, saveProgress } from "../services/progressService";
import ReviewSection from "../components/reviews/ReviewSection";
import "./BacaBuku.css";

// Pastikan Worker URL sudah benar
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const BacaBuku = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State untuk data buku dan PDF
  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [showReviews, setShowReviews] = useState(false);
  
  // State untuk Zoom (scale)
  const [scale, setScale] = useState(1.0); // Default scale 1.0

  // Refs
  const pdfContainerRef = useRef(null);
  const touchState = useRef({ 
    startX: 0, 
    startY: 0, 
    isSwiping: false, 
    pinchDist: 0, 
    initialScale: 1 
  });

  // --- 1. Fetch Data Buku ---
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

  // --- 2. Load Saved Progress ---
  useEffect(() => {
    if (user && numPages) {
      loadProgress();
    }
  }, [user, numPages]);

  const loadProgress = async () => {
    try {
      const data = await getBookProgress(id);
      if (data.hasProgress) {
        // Pastikan halaman yang dimuat tidak melebihi total halaman
        const loadedPage = Math.min(data.progress.current_page, numPages);
        setPageNumber(loadedPage);
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  };

  // --- 3. Save Progress (Debounced) ---
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

  // Sinkronisasi input halaman dengan pageNumber
  useEffect(() => {
    setPageInput(pageNumber.toString());
  }, [pageNumber]);

  // Handler saat dokumen PDF berhasil dimuat
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  // --- Control Zoom ---
  const zoomIn = () => setScale((s) => Math.min(3.0, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)));
  const resetZoom = () => setScale(1.0);

  // --- Touch handlers: swipe to change page, pinch to zoom ---
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchState.current.startX = e.touches[0].clientX;
      touchState.current.startY = e.touches[0].clientY;
      touchState.current.isSwiping = true;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current.pinchDist = Math.hypot(dx, dy);
      touchState.current.initialScale = scale;
      touchState.current.isSwiping = false;
    }
  };

  const onTouchMove = (e) => {
    // 1. Logika Swipe (ganti halaman)
    if (e.touches.length === 1 && touchState.current.isSwiping) {
      // Jika sudah di-zoom, biarkan default browser scroll (pan) yang bekerja
      if (scale > 1.05) return; 

      const deltaX = e.touches[0].clientX - touchState.current.startX;
      const deltaY = e.touches[0].clientY - touchState.current.startY;
      const threshold = 80; // pixel
      const angleTolerance = 2; // toleransi untuk gerakan horizontal

      // Cek apakah gerakan dominan horizontal
      if (Math.abs(deltaX) > threshold && Math.abs(deltaX / deltaY) > angleTolerance) {
        
        if (deltaX < 0) changePage(1); // Swipe KIRI -> Halaman BERIKUTNYA
        else changePage(-1); // Swipe KANAN -> Halaman SEBELUMNYA
        
        // Mencegah pemicu ganti halaman berulang kali dalam satu sentuhan
        touchState.current.isSwiping = false; 
        e.preventDefault(); 
      }
    } 
    // 2. Logika Pinch (zoom)
    else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / (touchState.current.pinchDist || dist || 1);
      
      // Batasi skala antara 0.5 dan 3.0
      const newScale = Math.min(3.0, Math.max(0.5, +(touchState.current.initialScale * ratio).toFixed(2)));
      setScale(newScale);
      e.preventDefault(); // Mencegah default browser zoom/scroll saat pinch
    }
  };

  const onTouchEnd = () => {
    touchState.current.isSwiping = false;
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  // --- Input Halaman ---
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
          {/* -------------------- SIDEBAR -------------------- */}
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
                <span>{book.category}</span>
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

          {/* -------------------- CONTENT AREA -------------------- */}
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

              {/* PDF Viewer Area */}
              <div
                className="pdf-container"
                ref={pdfContainerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {book.pdf_path ? (
                  <Document
                    file={book.pdf_path}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="loading-text">Sedang memuat PDF...</div>
                    }
                    error={<div className="error-text">Gagal memuat PDF.</div>}
                  >
                    {/* PERBAIKAN: Menggunakan properti scale bawaan react-pdf */}
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      scale={scale} 
                    />
                  </Document>
                ) : (
                  <div className="paper-placeholder">
                    <h3>{book.title}</h3>
                    <p>⚠️ File PDF belum tersedia untuk buku ini.</p>
                  </div>
                )}
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

          {/* -------------------- SIDE CONTROLS -------------------- */}
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
            {/* Zoom Actions */}
            <div className="zoom-actions">
              <button className="zoom-small" onClick={zoomOut} aria-label="Zoom out">−</button>
              <button className="zoom-small" onClick={resetZoom} aria-label="Reset">1×</button>
              <button className="zoom-small" onClick={zoomIn} aria-label="Zoom in">+</button>
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
