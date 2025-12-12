import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Login.css";

// Sinkron user ke backend dan ambil role
const syncUserToBackend = async (user) => {
  const token = await user.getIdToken();
  localStorage.setItem("token", token);

  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const res = await fetch(`${BASE.replace(/\/$/, "")}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal sinkronisasi user");

  const data = await res.json();
  // data.user harus berisi {email, role, uid, ...}
  return data.user;
};

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email dan password harus diisi!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const syncedUser = await syncUserToBackend(user);

      const userData = {
        name: user.displayName || email.split("@")[0],
        email: user.email,
        uid: user.uid,
        id: user.uid,
        photo: user.photoURL,
        role: syncedUser.role || "user",
      };

      onLogin(userData);
      navigate("/");
    } catch (err) {
      console.error("Error Login:", err);
      setError("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="login-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="login-card">
        <div className="login-header">
          <h1>E-Read Hub</h1>
          <p>Selamat datang kembali!</p>
          <small>Masuk untuk mengakses perpustakaan digital</small>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="form-input has-icon"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
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
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input has-icon"
                disabled={loading}
              />
            </div>
            <div className="forgot-password-link">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                disabled={loading}
              >
                Lupa Password?
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span className="spinner"></span>
                <span>Memproses...</span>
              </div>
            ) : (
              "Masuk Sekarang"
            )}
          </button>


          <div className="form-footer">
            <p>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="link-button"
                disabled={loading}
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
