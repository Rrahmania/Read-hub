import React from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Hook untuk manage tutorial state
 * Gunakan di komponen manapun untuk trigger tutorial
 */
export const useTutorial = () => {
  const { user } = useAuth();

  const startTutorial = () => {
    if (user) {
      // Hapus flag "tutorial completed" sehingga tutorial muncul lagi
      localStorage.removeItem(`tutorial_completed_${user.uid}`);
      // Trigger custom event untuk reload page atau trigger tutorial
      window.dispatchEvent(new CustomEvent("startTutorial"));
    }
  };

  const resetTutorial = () => {
    if (user) {
      localStorage.removeItem(`tutorial_completed_${user.uid}`);
    }
  };

  return { startTutorial, resetTutorial };
};

/**
 * Komponen button untuk menampilkan tutorial kembali
 */
export const RestartTutorialButton = ({ className = "" }) => {
  const { user } = useAuth();
  const { startTutorial } = useTutorial();

  if (!user) return null;

  return (
    <button
      onClick={startTutorial}
      className={`restart-tutorial-btn ${className}`}
      title="Tampilkan panduan tutorial lagi"
    >
      ❓ Panduan
    </button>
  );
};

export default useTutorial;
