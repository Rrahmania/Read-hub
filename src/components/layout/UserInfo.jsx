import { useState } from "react";
import { useTutorial } from "../../hooks/useTutorial";
import "./UserInfo.css";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

function UserInfo({ userEmail, onLogout, isMobile = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startTutorial } = useTutorial();

  if (!userEmail) return null;

  const handleLogoutClick = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleConfirm = () => {
    setIsModalOpen(false);
    onLogout();
  };

  return (
    <>
      <div className={isMobile ? "user-info-mobile" : "user-info-desktop"}>
        <span className="user-email">Hi, {userEmail.split("@")[0]}</span>
      </div>

      <ConfirmLogoutModal
        isOpen={isModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default UserInfo;

