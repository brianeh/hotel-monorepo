import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import SiteLayout from "./layout/SiteLayout";

export default function HomePage() {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates");
      return;
    }
    navigate(
      `/available-rooms?checkIn=${checkInDate}&checkOut=${checkOutDate}`
    );
  };

  return (
    <SiteLayout>
      <div className={styles.page}>
        <div className={styles.overlay}>
          <main className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Welcome!</h1>
              <p className={styles.heroSubtitle}>
                Discover a peaceful retreat and reserve your next stay with the
                ABBASSID Hotel online.
              </p>

              <form className={styles.dateForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="check-in" className={styles.label}>
                    Check-in date
                  </label>
                  <input
                    id="check-in"
                    type="date"
                    className={styles.dateInput}
                    value={checkInDate}
                    onChange={(event) => setCheckInDate(event.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="check-out" className={styles.label}>
                    Check-out date
                  </label>
                  <input
                    id="check-out"
                    type="date"
                    className={styles.dateInput}
                    value={checkOutDate}
                    onChange={(event) => setCheckOutDate(event.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="check-rooms" className={styles.label}>
                    Check Rooms
                  </label>
                  <button
                    id="check-rooms"
                    type="submit"
                    className={styles.checkButton}
                  >
                    Check Rooms
                  </button>
                </div>
              </form>

              <Link to="/api-test" className={styles.ctaLink}>
                Explore the API test interface →
              </Link>
            </div>
          </main>
        </div>
      </div>
    </SiteLayout>
  );
}
