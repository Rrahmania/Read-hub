// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import BacaBuku from "./pages/BacaBuku";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import ManageBooks from "./pages/ManageBooks";
import MyProgress from "./pages/MyProgress";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";

import KoleksiBuku from "./components/sections/KoleksiBuku/KoleksiBuku";
import Favorit from "./components/sections/Favorit/Favorit";

import { getBooks } from "./services/bookService";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const auth = getAuth();

  // Cek login Firebase saat app mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User masih login, simpan ke state
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: localStorage.getItem("role") || "user", // Ambil role dari localStorage
        });
      } else {
        setUser(null);
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Ambil semua buku saat app load
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (error) {
        console.error("Gagal mengambil buku:", error);
      }
    };
    fetchBooks();
  }, []);

  // Ambil favorit user setiap login
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return setFavorites([]);
      const userId = user.uid || user.id;
      if (!userId) return setFavorites([]);

      try {
        const res = await fetch(`${BASE.replace(/\/$/, "")}/api/favorites/${userId}`);
        if (!res.ok) return setFavorites([]);
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error("Gagal mengambil favorit:", err);
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [user]);

  // Login / Logout
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("role", userData.role || "user"); // Simpan role agar persisten
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    localStorage.removeItem("role"); // Hapus role saat logout
  };

  // Download buku
  const handleDownload = (book, showToast) => {
    if (!user) return showToast("Silakan login untuk mengunduh", "error");
    if (book.pdf_path) {
      const link = document.createElement("a");
      link.href = book.pdf_path;
      link.download = `${book.title}.pdf`;
      link.click();
    } else {
      showToast("PDF belum tersedia", "error");
    }
  };

  // Tambah favorit
  const handleAddFav = async (book, showToast) => {
    if (!user) return showToast("Silakan login terlebih dahulu", "error");
    if (favorites.find((f) => f.id === book.id)) {
      return showToast("Buku sudah ada di favorit", "info");
    }

    try {
      const userId = user.uid || user.id;
      const res = await fetch(`${BASE.replace(/\/$/, "")}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, book_id: book.id }),
      });

      if (!res.ok) return showToast("Gagal menambahkan favorit", "error");

      const favRes = await fetch(`${BASE.replace(/\/$/, "")}/api/favorites/${userId}`);
      const data = await favRes.json();
      setFavorites(data);
      showToast("Buku berhasil ditambahkan ke favorit", "success");
    } catch (err) {
      console.error("Gagal menambahkan favorit:", err);
      showToast("Terjadi kesalahan saat menambahkan favorit", "error");
    }
  };

  // Hapus favorit
  const handleRemoveFav = async (book, showToast) => {
    if (!user) return;
    try {
      const userId = user.uid || user.id;
      await fetch(`${BASE.replace(/\/$/, "")}/api/favorites/${userId}/${book.id}`, {
        method: "DELETE",
      });

      const favRes = await fetch(`${BASE.replace(/\/$/, "")}/api/favorites/${userId}`);
      const data = await favRes.json();
      setFavorites(data);
      showToast("Buku dihapus dari favorit", "success");
    } catch (err) {
      console.error("Gagal menghapus favorit:", err);
      showToast("Terjadi kesalahan saat menghapus favorit", "error");
    }
  };

  // Protect route untuk admin
  const RequireAdmin = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.role !== "admin") return <Navigate to="/" />;
    return children;
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar
            userEmail={user?.email}
            userRole={user?.role}
            isAuthenticated={!!user}
            onLogout={handleLogout}
          />

          <div className="main-content" style={{ minHeight: "80vh" }}>
            <Routes>
            <Route
              path="/"
              element={
                <Home
                  user={user}
                  books={books}
                  favorites={favorites}
                  onAddFav={handleAddFav}
                  onRemoveFav={handleRemoveFav}
                />
              }
            />
            <Route
              path="/books"
              element={
                <KoleksiBuku
                  books={books}
                  onDownload={handleDownload}
                  onAddToFavorite={handleAddFav}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorit
                  isLoggedIn={!!user}
                  favoriteList={favorites}
                  onRemoveFavorite={handleRemoveFav}
                  onDownload={handleDownload}
                />
              }
            />
            <Route path="/baca/:id" element={<BacaBuku />} />
            <Route path="/read/:id" element={<BacaBuku />} />
            <Route 
              path="/my-progress" 
              element={
                user ? <MyProgress /> : <Navigate to="/login" />
              } 
            />
            <Route
              path="/add-book"
              element={
                <RequireAdmin>
                  <AddBook userRole={user?.role} />
                </RequireAdmin>
              }
            />
            <Route
              path="/edit-book/:id"
              element={
                <RequireAdmin>
                  <EditBook userRole={user?.role} />
                </RequireAdmin>
              }
            />
            <Route
              path="/manage-books"
              element={
                <RequireAdmin>
                  <ManageBooks userRole={user?.role} />
                </RequireAdmin>
              }
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
            </div>

            <Footer />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    );
  }

export default App;
