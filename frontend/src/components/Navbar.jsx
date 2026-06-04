import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <nav className="topnav">
      <div className="topnav-brand">
        <span>✦</span> StudyCopilot AI
      </div>

      {/* Desktop links */}
      <div className="topnav-links">
        <a href="#features" className="nav-link">Features</a>
        <a href="#about"    className="nav-link">About</a>
        <a
          href="https://github.com/Harsha07r/AI_StudyCopilot"
          className="nav-link nav-link-github"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </div>

      {/* Hamburger (mobile only) */}
      <button
        className={`hamburger${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span className="ham-line" />
        <span className="ham-line" />
        <span className="ham-line" />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <a href="#features" className="mobile-link" onClick={close}>Features</a>
          <a href="#about"    className="mobile-link" onClick={close}>About</a>
          <a
            href="https://github.com/Harsha07r/AI_StudyCopilot"
            className="mobile-link mobile-link-github"
            target="_blank"
            rel="noreferrer"
            onClick={close}
          >
            GitHub ↗
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
