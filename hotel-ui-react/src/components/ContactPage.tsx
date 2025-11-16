import { FormEvent, useState } from "react";
import SiteLayout from "./layout/SiteLayout";
import Container from "./ui/Container";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import styles from "./ContactPage.module.css";

function preventDefault(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  return (
    <SiteLayout>
      <Container>
        <section className={styles.hero}>
          <h1>Contact Us</h1>
          <p>
            For information about our best rates, rooms, food and drink, and
            what to do in the area.
          </p>
        </section>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Get in touch</h2>
            <ul className={styles.infoList}>
              <li>
                <strong>Address:</strong> 101 Main St, Suite 500, Metropolis, NY
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                <a href="tel:+12345551234">+1 (234) 555‑1234</a>
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:stay@abbassidhotel.example">
                  stay@abbassidhotel.example
                </a>
              </li>
              <li>
                <strong>Hours:</strong> 24/7 Front Desk
              </li>
            </ul>

            <div className={styles.mapContainer} aria-label="Map">
              <img
                src="/images/map.jpg"
                alt="Hotel location map"
                className={styles.mapImage}
              />
            </div>
          </div>

          <div className={styles.card}>
            <h2>Get in Touch</h2>
            <form className={styles.form} onSubmit={preventDefault}>
              <FormField label="Your name" htmlFor="name">
                <input
                  id="name"
                  className="input-reset"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormField>

              <FormField
                label="Email"
                htmlFor="email"
                hint="We’ll reply to this address."
              >
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Subject" htmlFor="subject">
                <input
                  id="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </FormField>

              <FormField label="Message" htmlFor="message">
                <textarea
                  id="message"
                  required
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </FormField>

              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                I consent to having this website store my submitted information.
              </label>

              <div className={styles.actions}>
                <Button type="reset" variant="secondary">
                  Clear
                </Button>
                <Button type="submit">Send message</Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </SiteLayout>
  );
}
