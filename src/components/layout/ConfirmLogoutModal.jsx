import React from "react";
import "./ConfirmLogoutModal.css";

export default function ConfirmLogoutModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Konfirmasi Keluar</h2>
        <p>Apakah kamu yakin ingin keluar dari akun?</p>
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            Batal
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
