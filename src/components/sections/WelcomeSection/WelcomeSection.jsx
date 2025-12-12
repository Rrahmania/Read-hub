import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomeSection.css";
import heroLogo from "../../../assets/logo.png";

const WelcomeSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Bagian Kiri: Teks */}
        <div className="hero-content">
          <div className="badge-new">✨ Perpustakaan Digital Masa Depan</div>
          <h1>
            Jelajahi Dunia Lewat <br />
            <span className="text-highlight">Genggaman Anda</span>
          </h1>
          <p className="hero-desc">
            E-Read Hub hadir untuk memudahkan Anda mengakses berbagai buku buku
            digital yang dapat diBaca di mana saja, dan kapan saja.
          </p>

          {/* HANYA TERSISA SATU TOMBOL: MULAI MEMBACA */}
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/books")}>
              Mulai Membaca 🚀
            </button>
          </div>
        </div>

        {/* Bagian Kanan: Logo Besar */}
        <div className="hero-visual">
          <div className="visual-circle"></div>
          <img src={heroLogo} alt="Visual Logo" className="hero-logo-img" />
        </div>
      </div>

      {/* Gelombang Bawah */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default WelcomeSection;
