import "./HamburgerButton.css";

function HamburgerButton({ isOpen, onClick }) {
  return (
    <button className={`hamburger ${isOpen ? "active" : ""}`} onClick={onClick}>
      {isOpen ? (
        <span className="hamburger-x">✕</span>
      ) : (
        <>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </>
      )}
    </button>
  );
}
export default HamburgerButton;
