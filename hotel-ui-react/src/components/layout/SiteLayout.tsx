import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./SiteLayout.module.css";
import SearchForm from "../common/SearchForm";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const handleLinkClick = () => {
    closeMenu();
  };

  const handleBackdropClick = () => {
    closeMenu();
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <Link to="/" className={styles.brand}>
          ABBA<span className={styles.brandHighlight}>SSID H</span>otel
        </Link>

        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            <li>
              <Link to="/" className={styles.navLink}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/explore" className={styles.navLink}>
                Explore the Hotel
              </Link>
            </li>
            <li>
              <Link to="/contact" className={styles.navLink}>
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.desktopSearch}>
          <SearchForm />
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <nav
            id="mobile-menu"
            className={`${styles.mobileMenu} ${
              isMenuOpen ? styles.mobileMenuOpen : ""
            }`}
            aria-label="Mobile navigation"
          >
            <ul className={styles.mobileNavLinks}>
              <li>
                <Link
                  to="/"
                  className={styles.mobileNavLink}
                  onClick={handleLinkClick}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className={styles.mobileNavLink}
                  onClick={handleLinkClick}
                >
                  Explore the Hotel
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={styles.mobileNavLink}
                  onClick={handleLinkClick}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
            <div className={styles.mobileSearch}>
              <SearchForm />
            </div>
          </nav>
        </>
      )}

      {children}
    </div>
  );
}
