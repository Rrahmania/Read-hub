import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE.replace(/\/$/, "")}/books`;

// Helper: ambil token Firebase terbaru
const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User belum login");
  return await user.getIdToken();
};

// GET semua buku (public)
export const getBooks = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Gagal mengambil buku");
  const books = await res.json();
  
  // Pastikan setiap buku memiliki categories array
  return books.map(book => ({
    ...book,
    categories: Array.isArray(book.categories) ? book.categories : 
                book.category ? [book.category] : []
  }));
};

// GET buku by ID (public)
export const getBookById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Buku tidak ditemukan");
  const book = await res.json();
  
  // Pastikan buku memiliki categories array
  return {
    ...book,
    categories: Array.isArray(book.categories) ? book.categories : 
                book.category ? [book.category] : []
  };
};

// POST tambah buku (hanya admin) - DIPERBAIKI untuk categories array
export const addBook = async (bookData) => {
  const token = await getToken();

  // Format data untuk dikirim ke backend
  const formattedBook = {
    ...bookData,
    // Pastikan categories selalu array
    categories: Array.isArray(bookData.categories) ? bookData.categories : 
                bookData.category ? [bookData.category] : []
  };

  // Hapus properti category lama jika ada
  delete formattedBook.category;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formattedBook),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("AddBook Error:", errMsg);
    throw new Error("Gagal menambahkan buku");
  }

  return res.json();
};

// PUT update buku (hanya admin) - DIPERBAIKI untuk categories array
export const updateBook = async (id, bookData) => {
  const token = await getToken();

  // Format data untuk dikirim ke backend
  const formattedBook = {
    ...bookData,
    // Pastikan categories selalu array
    categories: Array.isArray(bookData.categories) ? bookData.categories : 
                bookData.category ? [bookData.category] : []
  };

  // Hapus properti category lama jika ada
  delete formattedBook.category;

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formattedBook),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("UpdateBook Error:", errMsg);
    throw new Error("Gagal mengupdate buku");
  }

  return res.json();
};

// DELETE buku (hanya admin)
export const deleteBook = async (id) => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("DeleteBook Error:", errMsg);
    throw new Error("Gagal menghapus buku");
  }

  return res.json();
};

// Pencarian buku dengan filter kategori
export const searchBooks = async (query = "", categories = []) => {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (categories.length > 0) params.append("categories", categories.join(","));

  const url = `${API_URL}/search${params.toString() ? `?${params.toString()}` : ""}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mencari buku");
  
  const books = await res.json();
  return books.map(book => ({
    ...book,
    categories: Array.isArray(book.categories) ? book.categories : 
                book.category ? [book.category] : []
  }));
};
