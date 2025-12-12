import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>E-Read Hub</h2>
          <p>
            Platform literasi digital masa depan untuk Indonesia yang lebih
            cerdas.
          </p>
        </div>
        <div className="footer-contact">
          <h3>Hubungi Kami</h3>
          <p>Email: support@ereadhub.com</p>
          <p>Telepon: +62 812 3456 7890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 E-Read Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}
export default Footer;
