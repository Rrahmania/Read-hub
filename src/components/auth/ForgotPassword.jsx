import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Mohon masukkan email Anda");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      setMessage(
        "Link reset password telah dikirim! Cek inbox atau folder spam email Anda."
      );
      setEmail(""); // Kosongkan email setelah sukses
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("Email tidak terdaftar di sistem kami.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else {
        setError("Gagal mengirim email. Coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="forgot-card">
        <div className="forgot-header">
          <h1>Lupa Password?</h1>
          <p>
            Masukkan email yang terdaftar, kami akan mengirimkan link untuk
            mereset password Anda.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                {/* SVG Mail Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="form-input has-icon"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Kirim Link Reset"}
          </button>
        </form>

        <div className="form-footer">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="back-link-button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "8px" }}
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
