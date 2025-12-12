import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import "./Register.css";

const syncUserToBackend = async (user) => {
  const token = await user.getIdToken();
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  await fetch(`${BASE.replace(/\/$/, "")}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi dasar
    if (!username || !email || !password || !confirmPassword) {
      setError("Semua field harus diisi!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok!");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Buat akun di Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Update nama user
      await updateProfile(user, {
        displayName: username,
      });

      await syncUserToBackend(user);

      setSuccess("Akun berhasil dibuat! Mengalihkan...");

      // 3. Redirect ke Login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error Register:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email ini sudah terdaftar. Silakan login.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email salah.");
      } else {
        setError("Gagal mendaftar: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="register-card">
        <div className="register-header">
          <h1>E-Read Hub</h1>
          <p>Buat akun baru Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <span className="input-icon">
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input has-icon"
                placeholder="Username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input has-icon"
                placeholder="Email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
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
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input has-icon"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Konfirmasi Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
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
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input has-icon"
                placeholder="Ulangi Password"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Daftar Sekarang"}
          </button>

          <div className="form-footer">
            <span>Sudah punya akun?</span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="link-button"
            >
              Masuk di sini
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
