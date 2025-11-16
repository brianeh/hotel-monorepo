import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import SiteLayout from "./layout/SiteLayout";
import Container from "./ui/Container";
import Button from "./ui/Button";
import { searchAvailableRooms } from "../services/api-client";
import type { Room } from "../types/room";
import styles from "./AvailableRoomsPage.module.css";

export default function AvailableRoomsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkInDate = searchParams.get("checkIn") || "";
  const checkOutDate = searchParams.get("checkOut") || "";

  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      setError("Check-in and check-out dates are required");
      setLoading(false);
      return;
    }

    async function fetchRooms() {
      try {
        setLoading(true);
        setError(null);
        const availableRooms = await searchAvailableRooms(
          checkInDate,
          checkOutDate
        );
        setRooms(availableRooms);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load available rooms"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, [checkInDate, checkOutDate]);

  const handleReserve = (room: Room) => {
    navigate(
      `/reservation?roomId=${room.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&price=${room.price}`
    );
  };

  return (
    <SiteLayout>
      <Container>
        <section className={styles.hero}>
          <h1>Available Rooms</h1>
          <p>
            from <span>{checkInDate}</span> to <span>{checkOutDate}</span>
          </p>
        </section>

        <div className={styles.actions}>
          <Link to="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>

        {loading && (
          <div className={styles.message}>Loading available rooms...</div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        {!loading && !error && rooms.length === 0 && (
          <div className={styles.message}>There is no available room!</div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <ul className={styles.roomList}>
            {rooms.map((room) => (
              <li key={room.id} className={styles.roomCard}>
                <div className={styles.roomHeader}>Room #{room.id}</div>
                <div className={styles.roomBody}>
                  <h3>
                    Room for {room.numberOfPerson} adult
                    {room.numberOfPerson !== 1 ? "s" : ""}
                  </h3>
                  <p className={styles.description}>{room.description}</p>
                  <p className={styles.price}>Price: {room.price} DZD</p>
                  <Button onClick={() => handleReserve(room)}>
                    I'll Reserve
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </SiteLayout>
  );
}
