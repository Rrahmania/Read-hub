import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE.replace(/\/$/, "")}/api/progress`;

// Helper: ambil token Firebase terbaru
const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User belum login");
  return await user.getIdToken();
};

// GET reading progress untuk user (authenticated)
export const getUserProgress = async () => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Gagal mengambil progress");
  return res.json();
};

// GET reading progress untuk buku tertentu (authenticated)
export const getBookProgress = async (bookId) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/book/${bookId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Gagal mengambil progress");
  return res.json();
};

// POST/PUT reading progress (authenticated)
export const saveProgress = async (bookId, currentPage, totalPages) => {
  const token = await getToken();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      book_id: bookId,
      current_page: currentPage,
      total_pages: totalPages,
    }),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("SaveProgress Error:", errMsg);
    throw new Error("Gagal menyimpan progress");
  }

  return res.json();
};

// DELETE reading progress (authenticated)
export const deleteProgress = async (bookId) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/book/${bookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("DeleteProgress Error:", errMsg);
    throw new Error("Gagal menghapus progress");
  }

  return res.json();
};