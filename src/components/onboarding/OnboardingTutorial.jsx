import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./OnboardingTutorial.css";

const OnboardingTutorial = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      const hasCompletedTutorial = localStorage.getItem(
        `tutorial_completed_${user.uid}`
      );
      if (!hasCompletedTutorial) {
        // Delay untuk memastikan UI sudah loaded
        const timer = setTimeout(() => {
          setShowTutorial(true);
          setIsAnimating(true);
        }, 500);
        return () => clearTimeout(timer);
      }

      // Listen untuk event custom "startTutorial" dari RestartTutorialButton
      const handleStartTutorial = () => {
        setCurrentStep(0);
        setShowTutorial(true);
        setIsAnimating(true);
      };

      window.addEventListener("startTutorial", handleStartTutorial);
      return () => {
        window.removeEventListener("startTutorial", handleStartTutorial);
      };
    }
  }, [user]);

  const tutorialSteps = [
    {
      title: "📚 Selamat Datang di E-Read Hub!",
      description:
        "Platform perpustakaan digital untuk membaca buku favorit Anda. Mari kita pelajari fitur-fitur utama!",
      target: null,
      highlight: false,
    },
    {
      title: "📖 Jelajahi Koleksi Buku",
      description:
        "Di halaman Home, Anda dapat melihat semua koleksi buku yang tersedia. Cari dan pilih buku yang ingin Anda baca.",
      target: null,
      highlight: false,
    },
    {
      title: "❤️ Tandai Buku Favorit",
      description:
        "Suka buku tertentu? Tambahkan ke daftar Favorit Anda dengan mudah untuk akses cepat di kemudian hari.",
      target: null,
      highlight: false,
    },
    {
      title: "📖 Baca Buku Digital",
      description:
        "Klik buku untuk membuka pembaca PDF. Navigasi halaman, cek progress membaca, dan nikmati pengalaman membaca yang nyaman.",
      target: null,
      highlight: false,
    },
    {
      title: "⭐ Berikan Rating & Ulasan",
      description:
        "Bagikan opini Anda! Berikan rating bintang dan tulis ulasan untuk buku yang telah Anda baca.",
      target: null,
      highlight: false,
    },
    {
      title: "📊 Pantau Progress Membaca",
      description:
        "Lihat statistik membaca Anda di halaman My Progress. Pantau kemajuan dan lihat buku-buku yang sedang dibaca.",
      target: null,
      highlight: false,
    },
    {
      title: "➕ Tambah Buku Sendiri (Jika Admin)",
      description:
        "Sebagai admin, Anda dapat menambahkan buku baru dan mengelola koleksi melalui halaman Manage Books.",
      target: null,
      highlight: false,
    },
    {
      title: "🎉 Mari Mulai!",
      description:
        "Anda sudah siap untuk menjelajahi dunia buku digital. Tutup panduan ini dan mulai petualangan membaca Anda!",
      target: null,
      highlight: false,
    },
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(true);
      }, 300);
    } else {
      completeTutorial();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(true);
      }, 300);
    }
  };

  const completeTutorial = () => {
    if (user) {
      localStorage.setItem(`tutorial_completed_${user.uid}`, "true");
    }
    setShowTutorial(false);
    setIsAnimating(false);
    onComplete?.();
  };

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className={`onboarding-overlay ${isAnimating ? "show" : ""}`}>
      <div className={`onboarding-modal ${isAnimating ? "animate-in" : ""}`}>
        {/* Header */}
        <div className="onboarding-header">
          <div className="header-content">
            <h2 className="onboarding-title">{step.title}</h2>
            <button
              className="close-btn"
              onClick={completeTutorial}
              title="Tutup Tutorial"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar-onboarding">
              <div
                className="progress-fill-onboarding"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {currentStep + 1} dari {tutorialSteps.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="onboarding-content">
          <p className="onboarding-description">{step.description}</p>

          {/* Visual Indicators */}
          <div className="feature-indicators">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentStep ? "active" : ""} ${
                  index < currentStep ? "completed" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <button
            className="tutorial-btn secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            ← Sebelumnya
          </button>

          <button className="skip-tutorial-btn" onClick={completeTutorial}>
            Lewati Tutorial
          </button>

          <button
            className="tutorial-btn primary"
            onClick={handleNext}
          >
            {currentStep === tutorialSteps.length - 1
              ? "Selesai →"
              : "Berikutnya →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
