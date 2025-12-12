import React from "react";
import "./ConfirmLogoutModal.css";

export default function ConfirmLogoutModal({
  isOpen,
  onCancel,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah kamu yakin?",
  confirmText = "Ya",
  cancelText = "Batal",
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
