import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import HamburgerButton from "./HamburgerButton";
import NavMenu from "./NavMenu";
import UserInfo from "./UserInfo";
import logo from "../../assets/logo.png";

function Navbar({ userEmail, userRole, onLogout, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="E-Read Hub Logo" className="brand-image" />
            <h1 className="brand-logo">E-Read Hub</h1>
          </Link>

          {/* Hamburger */}
          <HamburgerButton isOpen={isMenuOpen} onClick={toggleMenu} />

          {/* Mobile nav menu */}
          <NavMenu
            isOpen={isMenuOpen}
            onClose={closeMenu}
            userEmail={userEmail}
            userRole={userRole}
            onLogout={onLogout}
            isAuthenticated={isAuthenticated}
          />

          {/* Desktop auth & admin */}
          <div className="desktop-auth">
            {isAuthenticated && userEmail ? (
              <div className="desktop-user-area">
                {userRole === "admin" && (
                  <>
                    <Link to="/manage-books" className="btn-manage-books">
                      📚 Kelola Buku
                    </Link>
                    <Link to="/add-book" className="btn-add-book">
                      ➕ Tambah Buku
                    </Link>
                  </>
                )}
                <UserInfo
                  userEmail={userEmail}
                  onLogout={onLogout}
                  isMobile={false}
                />
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login">
                  <button className="btn-nav-login">Masuk</button>
                </Link>
                <Link to="/register">
                  <button className="btn-nav-register">Daftar</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
