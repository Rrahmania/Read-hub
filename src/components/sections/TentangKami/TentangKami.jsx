import React from "react";
import "./TentangKami.css";

const TentangKami = () => {
  return (
    <section className="about-section">
      <div className="container">
        {/* Header Section */}
        <div className="about-header">
          <h2>Tentang E-Read Hub</h2>
          <p>Membangun Generasi Literasi Digital Indonesia</p>
        </div>

        {/* 3 Kartu Utama */}
        <div className="cards-wrapper">
          {/* Kartu 1: Siapa Kami */}
          <div className="about-card">
            <div className="icon-wrapper">📚</div>
            <h3>Siapa Kami?</h3>
            <p>
              E-Read Hub adalah platform perpustakaan digital modern yang
              dirancang untuk memberikan akses tanpa batas ke dunia pengetahuan
              bagi seluruh lapisan masyarakat.
            </p>
          </div>

          {/* Kartu 2: Visi Kami (Highlight) */}
          <div className="about-card highlight">
            <div className="icon-wrapper">🚀</div>
            <h3>Visi Kami</h3>
            <p>
              Menjadi jembatan teknologi terdepan yang menghubungkan pembaca
              dengan jutaan buku berkualitas, menciptakan ekosistem belajar yang
              menyenangkan dan inklusif.
            </p>
          </div>

          {/* Kartu 3: Nilai Kami */}
          <div className="about-card">
            <div className="icon-wrapper">💡</div>
            <h3>Nilai Kami</h3>
            <p>
              Kami menjunjung tinggi kemudahan akses, inovasi teknologi, dan
              kualitas konten untuk mendukung pertumbuhan intelektual bangsa di
              era digital.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TentangKami;
