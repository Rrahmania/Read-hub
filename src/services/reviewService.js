import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE.replace(/\/$/, "")}/api/reviews`;

// Helper: ambil token Firebase terbaru
const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User belum login");
  return await user.getIdToken();
};

// GET reviews untuk buku tertentu (public)
export const getBookReviews = async (bookId) => {
  const res = await fetch(`${API_URL}/book/${bookId}`);
  if (!res.ok) throw new Error("Gagal mengambil reviews");
  return res.json();
};

// GET review user untuk buku tertentu (authenticated)
export const getUserReview = async (bookId) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/book/${bookId}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Gagal mengambil review");
  return res.json();
};

// POST/PUT review (authenticated)
export const saveReview = async (bookId, rating, reviewText) => {
  const token = await getToken();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      book_id: bookId,
      rating,
      review_text: reviewText,
    }),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("SaveReview Error:", errMsg);
    throw new Error("Gagal menyimpan review");
  }

  return res.json();
};

// DELETE review (authenticated)
export const deleteReview = async (reviewId) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("DeleteReview Error:", errMsg);
    throw new Error("Gagal menghapus review");
  }

  return res.json();
};

// PATCH update review (owner or admin)
export const updateReview = async (reviewId, rating, reviewText) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, review_text: reviewText }),
  });

  if (!res.ok) {
    const errMsg = await res.text();
    console.error("UpdateReview Error:", errMsg);
    throw new Error("Gagal mengupdate review");
  }

  return res.json();
};

// GET current authenticated user info
export const getCurrentUser = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE.replace(/\/$/, "")}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil data user");
  return res.json();
};
