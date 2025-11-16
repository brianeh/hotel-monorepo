import styles from "./ExplorePage.module.css";
import SiteLayout from "./layout/SiteLayout";
import Container from "./ui/Container";
import ImageTile from "./ui/ImageTile";
import SectionHeader from "./ui/SectionHeader";

export default function ExplorePage() {
  return (
    <SiteLayout>
      <Container className={styles.container}>
        <section className={`${styles.section} ${styles.heroSmall}`}>
          <SectionHeader
            eyebrow="Discover"
            title="Explore the Hotel"
            description="Spaces to gather, unwind, and feel at home."
          />
          <ul className={styles.stats}>
            <li className={styles.statChip}>200+ Rooms</li>
            <li className={styles.statChip}>24/7 Service</li>
            <li className={styles.statChip}>Pet Friendly</li>
            <li className={styles.statChip}>Free Wi‑Fi</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Featured spaces</h2>
          <ul className={styles.featureGrid}>
            <li className={styles.featureCard}>
              <div className={styles.featureMedia}>
                <ImageTile
                  src="/images/neighborhood-cafe.jpg"
                  alt="Neighborhood Café"
                />
              </div>
              <h3>Neighborhood Café</h3>
              <p>All‑day dishes and home‑grown coffee in the lobby.</p>
            </li>
            <li className={styles.featureCard}>
              <div className={styles.featureMedia}>
                <ImageTile src="/images/piano-bar.jpg" alt="Piano Bar" />
              </div>
              <h3>Piano Bar</h3>
              <p>Easygoing evenings with live sets and classic cocktails.</p>
            </li>
            <li className={styles.featureCard}>
              <div className={styles.featureMedia}>
                <ImageTile src="/images/corner-store.jpg" alt="Corner Store" />
              </div>
              <h3>Corner Store</h3>
              <p>Local goods, Romer collabs, and travel essentials.</p>
            </li>
            <li className={styles.featureCard}>
              <div className={styles.featureMedia}>
                <ImageTile src="/images/study.jpg" alt="The Study" />
              </div>
              <h3>The Study</h3>
              <p>Cozy lounge with fireplace, art, and strong Wi‑Fi.</p>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>See the vibe</h2>
          <ul className={styles.gallery}>
            <li>
              <ImageTile
                src="/images/lobby.jpg"
                alt="Hotel lobby"
                caption="Lobby"
              />
            </li>
            <li>
              <ImageTile
                src="/images/rooftop-pool.jpg"
                alt="Rooftop pool"
                caption="Rooftop pool"
              />
            </li>
            <li>
              <ImageTile
                src="/images/hotel-suite.jpg"
                alt="Hotel suite"
                caption="Suite"
              />
            </li>
            <li>
              <ImageTile
                src="/images/cafe.jpg"
                alt="Hotel cafe"
                caption="Cafe"
              />
            </li>
            <li>
              <ImageTile
                src="/images/fitness-center.jpg"
                alt="Fitness center"
                caption="Fitness"
              />
            </li>
            <li>
              <ImageTile
                src="/images/courtyard.jpg"
                alt="Hotel Courtyard"
                caption="Courtyard"
              />
            </li>
            <li>
              <ImageTile src="/images/spa.jpg" alt="Hotel spa" caption="Spa" />
            </li>
            <li>
              <ImageTile
                src="/images/garden.jpg"
                alt="Garden"
                caption="Garden"
              />
            </li>
            <li>
              <ImageTile
                src="images/studio.jpg"
                alt="Studio"
                caption="Studio"
              />
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Questions?</h2>
          <p>
            Email{" "}
            <a href="mailto:stay@abbassid.example">stay@abbassid.example</a> or
            call <a href="tel:+12345551234">+1 (234) 555‑1212</a>.
          </p>
        </section>

        <div className={styles.cta}>
          <a className={styles.button} href="/">
            Explore rooms & book your stay
          </a>
        </div>
      </Container>
    </SiteLayout>
  );
}
