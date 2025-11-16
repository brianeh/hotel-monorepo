import { FormEvent, useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import SiteLayout from "./layout/SiteLayout";
import Container from "./ui/Container";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import { createReservation } from "../services/api-client";
import styles from "./ReservationPage.module.css";

export default function ReservationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const roomId = searchParams.get("roomId");
  const checkInDate = searchParams.get("checkIn") || "";
  const checkOutDate = searchParams.get("checkOut") || "";
  const price = parseFloat(searchParams.get("price") || "0");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  // Calculate number of days and total price
  const numberOfDays = (() => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })();

  const totalPrice = numberOfDays * price;

  useEffect(() => {
    if (!roomId || !checkInDate || !checkOutDate || !price) {
      setError("Missing required reservation information");
    }
  }, [roomId, checkInDate, checkOutDate, price]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomId) {
      setError("Room ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createReservation({
        idRoom: parseInt(roomId, 10),
        checkInDate,
        checkOutDate,
        fullName,
        email,
        phone,
        specialRequest: specialRequest || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create reservation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SiteLayout>
        <Container>
          <div className={styles.successMessage}>
            <h1>Reservation Successful!</h1>
            <p>
              Your reservation has been confirmed. Redirecting to home page...
            </p>
          </div>
        </Container>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Container>
        <section className={styles.hero}>
          <h1>Final Reservation</h1>
          <p>Please, fill the form to complete the reservation process.</p>
        </section>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <strong>Room N°:</strong> {roomId}
          </div>
          <div className={styles.summaryItem}>
            <strong>From:</strong> {checkInDate}
          </div>
          <div className={styles.summaryItem}>
            <strong>To:</strong> {checkOutDate}
          </div>
          <div className={styles.summaryItem}>
            <strong>Number of days:</strong> {numberOfDays}
          </div>
          <div className={styles.summaryItem}>
            <strong>Price for one night:</strong> {price} DZD
          </div>
          <div className={styles.summaryItem}>
            <strong>Total price:</strong> {totalPrice.toFixed(2)} DZD
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField label="Full name" htmlFor="fullName">
            <input
              id="fullName"
              className={styles.input}
              type="text"
              name="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Type full name"
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            hint="We'll never share your email with anyone else."
          >
            <input
              id="email"
              className={styles.input}
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your email"
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone">
            <input
              id="phone"
              className={styles.input}
              type="tel"
              name="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Type phone number"
            />
          </FormField>

          <FormField label="Special Request" htmlFor="specialRequest">
            <textarea
              id="specialRequest"
              className={styles.textarea}
              name="specialRequest"
              rows={3}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
            />
          </FormField>

          <div className={styles.actions}>
            <Link to="/">
              <Button type="button" variant="secondary">
                Back to Home
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Container>
    </SiteLayout>
  );
}
