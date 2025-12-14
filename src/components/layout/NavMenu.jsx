import { NavLink, Link } from "react-router-dom";
import "./NavMenu.css";
import UserInfo from "./UserInfo";

function NavMenu({
  isOpen,
  onClose,
  userEmail,
  userRole,
  onLogout,
  isAuthenticated,
}) {
  const menuItems = [
    { to: "/", label: "Beranda" },
    { to: "/books", label: "Koleksi Buku" },
    { to: "/favorites", label: "Favorit Saya" },
    ...(isAuthenticated ? [{ to: "/my-progress", label: "Bookmark" }] : []),
  ];

  return (
    <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.to} className="navbar-item">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mobile-auth">
        {/* Tombol Admin */}
        {isAuthenticated && userRole === "admin" && (
          <Link to="/manage-books" className="mobile-btn" onClick={onClose}>
            📚 Kelola Buku
          </Link>
        )}

        {isAuthenticated && userEmail ? (
          <UserInfo userEmail={userEmail} onLogout={onLogout} isMobile={true} />
        ) : (
          <Link to="/login" onClick={onClose}>
            <button className="navbar-login-btn mobile-btn">Masuk Akun</button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default NavMenu;
