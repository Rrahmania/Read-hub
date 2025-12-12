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
  return res.json();
};

// GET buku by ID (public)
export const getBookById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Buku tidak ditemukan");
  return res.json();
};

// POST tambah buku (hanya admin)
export const addBook = async (book) => {
  const token = await getToken();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(book),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("AddBook Error:", errMsg);
    throw new Error("Gagal menambahkan buku");
  }

  return res.json();
};

// PUT update buku (hanya admin)
export const updateBook = async (id, book) => {
  const token = await getToken();

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(book),
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
