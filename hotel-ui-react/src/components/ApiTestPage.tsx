import { useState, useEffect } from "react";
import {
  getAllRooms,
  getRoomById,
  searchAvailableRooms,
  createReservation,
  getAllReservations,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../services/api-client";
import type { Room } from "../types/room";
import type { Reservation } from "../types/reservation";

const styles = {
  container: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    padding: "20px",
    color: "#333",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    background: "white",
    padding: "30px",
    borderRadius: "10px 10px 0 0",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center" as const,
  },
  h1: {
    color: "#667eea",
    fontSize: "2.5em",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "1.1em",
  },
  section: {
    background: "white",
    padding: "25px",
    marginBottom: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  h2: {
    color: "#667eea",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f0f0f0",
  },
  button: {
    padding: "12px 20px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "none",
    background: "#667eea",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    marginRight: "10px",
  },
  buttonDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  input: {
    padding: "12px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginRight: "10px",
    marginBottom: "10px",
  },
  inputGroup: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "10px",
    marginBottom: "15px",
  },
  status: {
    padding: "8px 15px",
    borderRadius: "5px",
    marginTop: "10px",
    fontWeight: 600,
  },
  statusSuccess: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  statusError: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  statusLoading: {
    background: "#d1ecf1",
    color: "#0c5460",
    border: "1px solid #bee5eb",
  },
  roomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },
  roomCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
  },
  roomTitle: {
    color: "#28a745",
    margin: "0 0 15px 0",
    fontSize: "1.3em",
  },
  roomInfo: {
    margin: "8px 0",
    color: "#555",
  },
  priceTag: {
    display: "inline-block",
    background: "#28a745",
    color: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    margin: "10px 0",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "0.85em",
    fontWeight: 600,
    marginLeft: "8px",
  },
  badgeGreen: {
    background: "#d4edda",
    color: "#155724",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px",
    color: "#999",
  },
  response: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "5px",
    marginTop: "15px",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    whiteSpace: "pre-wrap" as const,
    border: "1px solid #e0e0e0",
    maxHeight: "400px",
    overflowY: "auto" as const,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  deleteButton: {
    background: "#dc3545",
  },
};

export default function ApiTestPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<string>("");
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  // Search form state
  const [checkIn, setCheckIn] = useState("2025-10-15");
  const [checkOut, setCheckOut] = useState("2025-10-20");

  // Reservation form state
  const [reservation, setReservation] = useState<Partial<Reservation>>({
    idRoom: 1,
    checkInDate: "2025-10-15",
    checkOutDate: "2025-10-18",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
    specialRequest: "",
  });

  // Get Room by ID state
  const [roomId, setRoomId] = useState("1");
  const [roomResponse, setRoomResponse] = useState<string>("");
  const [roomStatus, setRoomStatus] = useState<{
    type: string;
    message: string;
  }>({ type: "", message: "" });

  // Get All Reservations state
  const [reservationsResponse, setReservationsResponse] = useState<string>("");
  const [reservationsStatus, setReservationsStatus] = useState<{
    type: string;
    message: string;
  }>({ type: "", message: "" });

  // Create Reservation response
  const [createReservationResponse, setCreateReservationResponse] =
    useState<string>("");

  // Create Room state
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    description: "Deluxe Suite",
    numberOfPerson: 2,
    price: 150.0,
    havePrivateBathroom: true,
  });
  const [createRoomResponse, setCreateRoomResponse] = useState<string>("");
  const [createRoomStatus, setCreateRoomStatus] = useState<{
    type: string;
    message: string;
  }>({ type: "", message: "" });

  // Update Room state
  const [updateRoomId, setUpdateRoomId] = useState("1");
  const [updateRoomData, setUpdateRoomData] = useState<Partial<Room>>({
    description: "",
    numberOfPerson: undefined,
    price: undefined,
    havePrivateBathroom: false,
  });
  const [updateRoomStatus, setUpdateRoomStatus] = useState<{
    type: string;
    message: string;
  }>({ type: "", message: "" });

  // Delete Room state
  const [deleteRoomId, setDeleteRoomId] = useState("");
  const [deleteRoomStatus, setDeleteRoomStatus] = useState<{
    type: string;
    message: string;
  }>({ type: "", message: "" });

  const handleGetAllRooms = async () => {
    setLoading("rooms");
    setStatus({ type: "", message: "" });
    try {
      const data = await getAllRooms();
      setRooms(data);
      setStatus({
        type: "success",
        message: `Success - Found ${data.length} room(s)`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const handleSearchRooms = async () => {
    if (!checkIn || !checkOut) {
      setStatus({ type: "error", message: "Please select both dates" });
      return;
    }
    setLoading("search");
    setStatus({ type: "", message: "" });
    try {
      const data = await searchAvailableRooms(checkIn, checkOut);
      setAvailableRooms(data);
      setStatus({
        type: "success",
        message: `Success - Found ${data.length} available room(s)`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const handleCreateReservation = async () => {
    if (
      !reservation.idRoom ||
      !reservation.checkInDate ||
      !reservation.checkOutDate ||
      !reservation.fullName ||
      !reservation.email ||
      !reservation.phone
    ) {
      setStatus({ type: "error", message: "Please fill all required fields" });
      return;
    }
    setLoading("create");
    setStatus({ type: "", message: "" });
    setCreateReservationResponse("");
    try {
      const data = await createReservation(reservation as Reservation);
      setStatus({ type: "success", message: "Success - Reservation created!" });
      setCreateReservationResponse(JSON.stringify(data, null, 2));
      setReservation({
        idRoom: 1,
        checkInDate: "2025-02-15",
        checkOutDate: "2025-02-18",
        fullName: "John Doe",
        email: "john@example.com",
        phone: "555-0123",
        specialRequest: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const handleGetRoomById = async () => {
    if (!roomId) {
      setRoomStatus({ type: "error", message: "Please enter a room ID" });
      return;
    }
    setLoading("room");
    setRoomResponse("");
    setRoomStatus({ type: "", message: "" });
    try {
      const data = await getRoomById(parseInt(roomId));
      setRoomResponse(JSON.stringify(data, null, 2));
      setRoomStatus({ type: "success", message: "✓ Success - Room found" });
    } catch (error) {
      setRoomStatus({
        type: "error",
        message: `✗ Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const handleGetAllReservations = async () => {
    setLoading("reservations");
    setReservationsResponse("");
    setReservationsStatus({ type: "", message: "" });
    try {
      const data = await getAllReservations();
      setReservationsResponse(JSON.stringify(data, null, 2));
      if (data.length === 0) {
        setReservationsStatus({
          type: "success",
          message: "✓ Success - No reservations found",
        });
      } else {
        setReservationsStatus({
          type: "success",
          message: `✓ Success - Found ${data.length} reservation(s)`,
        });
      }
    } catch (error) {
      setReservationsStatus({
        type: "error",
        message: `✗ Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const handleCreateRoom = async () => {
    if (
      !newRoom.description ||
      !newRoom.numberOfPerson ||
      !newRoom.price
    ) {
      setCreateRoomStatus({
        type: "error",
        message: "Please fill all required fields",
      });
      return;
    }
    setLoading("createRoom");
    setCreateRoomResponse("");
    setCreateRoomStatus({ type: "", message: "" });
    try {
      const data = await createRoom(newRoom);
      setCreateRoomResponse(JSON.stringify(data, null, 2));
      setCreateRoomStatus({ type: "success", message: "✓ Success - Room created!" });
      // Auto-refresh rooms list after successful creation
      setTimeout(() => handleGetAllRooms(), 500);
    } catch (error) {
      setCreateRoomStatus({
        type: "error",
        message: `✗ Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const loadRoomForUpdate = async (id: string) => {
    if (!id) return;
    try {
      const room = await getRoomById(parseInt(id));
      setUpdateRoomData({
        description: room.description || "",
        numberOfPerson: room.numberOfPerson,
        price: room.price,
        havePrivateBathroom: room.havePrivateBathroom || false,
      });
    } catch (error) {
      console.error("Error loading room:", error);
    }
  };

  const handleUpdateRoom = async () => {
    if (!updateRoomId) {
      setUpdateRoomStatus({
        type: "error",
        message: "✗ Error: Please enter a room ID",
      });
      return;
    }

    // Build update object with only provided fields
    const updateData: Partial<Room> = {};
    if (updateRoomData.description?.trim()) {
      updateData.description = updateRoomData.description;
    }
    if (updateRoomData.numberOfPerson) {
      updateData.numberOfPerson = updateRoomData.numberOfPerson;
    }
    if (updateRoomData.price !== undefined) {
      updateData.price = updateRoomData.price;
    }
    updateData.havePrivateBathroom = updateRoomData.havePrivateBathroom || false;

    if (Object.keys(updateData).length === 0) {
      setUpdateRoomStatus({
        type: "error",
        message: "✗ Error: Please enter at least one field to update",
      });
      return;
    }

    setLoading("updateRoom");
    setUpdateRoomStatus({ type: "", message: "" });
    try {
      await updateRoom(parseInt(updateRoomId), updateData);
      setUpdateRoomStatus({
        type: "success",
        message: "✓ Success - Room updated!",
      });
      // Auto-refresh rooms list after successful update
      setTimeout(() => handleGetAllRooms(), 500);
    } catch (error) {
      setUpdateRoomStatus({
        type: "error",
        message: `✗ Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteRoomId) {
      setDeleteRoomStatus({
        type: "error",
        message: "✗ Error: Please enter a room ID",
      });
      return;
    }
    setLoading("deleteRoom");
    setDeleteRoomStatus({ type: "", message: "" });
    try {
      await deleteRoom(parseInt(deleteRoomId));
      setDeleteRoomStatus({
        type: "success",
        message: "✓ Success - Room deleted!",
      });
      // Clear the input
      setDeleteRoomId("");
      // Auto-refresh rooms list after successful deletion
      setTimeout(() => handleGetAllRooms(), 500);
    } catch (error) {
      setDeleteRoomStatus({
        type: "error",
        message: `✗ Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading("");
    }
  };

  // Auto-load room details when update room ID changes
  useEffect(() => {
    if (updateRoomId) {
      loadRoomForUpdate(updateRoomId);
    }
  }, [updateRoomId]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>🏨 Hotel Reservation REST API Test</h1>
        <p style={styles.subtitle}>
          Interactive testing interface for the Hotel Reservation System REST
          API
        </p>
      </div>

      {/* Section 1: Get All Rooms */}
      <div style={styles.section}>
        <h2 style={styles.h2}>1. Get All Rooms</h2>
        <p>Fetch all available rooms from the hotel</p>
        <button
          onClick={handleGetAllRooms}
          disabled={loading === "rooms"}
          style={
            loading === "rooms"
              ? { ...styles.button, ...styles.buttonDisabled }
              : styles.button
          }
        >
          📋 Get All Rooms
        </button>
        {loading === "rooms" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Loading...
          </div>
        )}
        {status.type === "success" && loading === "" && (
          <div style={{ ...styles.status, ...styles.statusSuccess }}>
            ✓ {status.message}
          </div>
        )}
        {status.type === "error" && loading === "" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            ✗ {status.message}
          </div>
        )}
        {rooms.length > 0 && (
          <div style={styles.roomGrid}>
            {rooms.map((room) => (
              <div key={room.id} style={styles.roomCard}>
                <h3 style={styles.roomTitle}>Room #{room.id}</h3>
                <p style={styles.roomInfo}>
                  💬 {room.description || "No description"}
                </p>
                <p style={styles.roomInfo}>
                  👥 Capacity: {room.numberOfPerson} person(s)
                </p>
                <p style={styles.roomInfo}>
                  🚿 Private Bathroom:
                  {room.havePrivateBathroom ? (
                    <span style={{ ...styles.badge, ...styles.badgeGreen }}>
                      Yes
                    </span>
                  ) : (
                    <span style={{ ...styles.badge }}>No</span>
                  )}
                </p>
                <div style={styles.priceTag}>
                  ${room.price.toFixed(2)}/night
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Get Room by ID */}
      <div style={styles.section}>
        <h2 style={styles.h2}>2. Get Room by ID</h2>
        <p>Fetch details of a specific room</p>
        <div style={styles.inputGroup}>
          <input
            type="number"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            min="1"
            style={styles.input}
          />
          <button
            onClick={handleGetRoomById}
            disabled={loading === "room"}
            style={
              loading === "room"
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            🔍 Get Room
          </button>
        </div>
        {loading === "room" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Loading...
          </div>
        )}
        {roomStatus.type === "success" && loading !== "room" && (
          <div style={{ ...styles.status, ...styles.statusSuccess }}>
            {roomStatus.message}
          </div>
        )}
        {roomStatus.type === "error" && loading !== "room" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            {roomStatus.message}
          </div>
        )}
        {roomResponse && (
          <div style={styles.response}>{roomResponse}</div>
        )}
      </div>

      {/* Section 3: Search Available Rooms */}
      <div style={styles.section}>
        <h2 style={styles.h2}>3. Search Available Rooms</h2>
        <p>Find available rooms for specific dates</p>
        <div style={styles.inputGroup}>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={handleSearchRooms}
            disabled={loading === "search"}
            style={
              loading === "search"
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            🔎 Search Available Rooms
          </button>
        </div>
        {loading === "search" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Searching...
          </div>
        )}
        {status.type === "success" &&
          loading === "" &&
          availableRooms.length > 0 && (
            <div style={{ ...styles.status, ...styles.statusSuccess }}>
              ✓ {status.message}
            </div>
          )}
        {status.type === "error" && loading === "" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            ✗ {status.message}
          </div>
        )}
        {availableRooms.length > 0 && (
          <div style={styles.roomGrid}>
            {availableRooms.map((room) => (
              <div key={room.id} style={styles.roomCard}>
                <h3 style={styles.roomTitle}>Room #{room.id}</h3>
                <p style={styles.roomInfo}>
                  💬 {room.description || "No description"}
                </p>
                <p style={styles.roomInfo}>
                  👥 Capacity: {room.numberOfPerson} person(s)
                </p>
                <div style={styles.priceTag}>
                  ${room.price.toFixed(2)}/night
                </div>
              </div>
            ))}
          </div>
        )}
        {availableRooms.length === 0 &&
          status.type === "success" &&
          loading === "" && (
            <div style={styles.emptyState}>
              No available rooms found for these dates
            </div>
          )}
      </div>

      {/* Section 4: Create Reservation */}
      <div style={styles.section}>
        <h2 style={styles.h2}>4. Create Reservation</h2>
        <p>Create a new hotel reservation</p>
        <div style={styles.inputGroup}>
          <input
            type="number"
            placeholder="Room ID"
            value={reservation.idRoom || ""}
            onChange={(e) =>
              setReservation({
                ...reservation,
                idRoom: parseInt(e.target.value),
              })
            }
            style={styles.input}
          />
          <input
            type="date"
            value={reservation.checkInDate}
            onChange={(e) =>
              setReservation({ ...reservation, checkInDate: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="date"
            value={reservation.checkOutDate}
            onChange={(e) =>
              setReservation({ ...reservation, checkOutDate: e.target.value })
            }
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Full Name"
            value={reservation.fullName || ""}
            onChange={(e) =>
              setReservation({ ...reservation, fullName: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={reservation.email || ""}
            onChange={(e) =>
              setReservation({ ...reservation, email: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={reservation.phone || ""}
            onChange={(e) =>
              setReservation({ ...reservation, phone: e.target.value })
            }
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Special Request (optional)"
            value={reservation.specialRequest || ""}
            onChange={(e) =>
              setReservation({ ...reservation, specialRequest: e.target.value })
            }
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            onClick={handleCreateReservation}
            disabled={loading === "create"}
            style={
              loading === "create"
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            ✅ Create Reservation
          </button>
        </div>
        {loading === "create" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Creating reservation...
          </div>
        )}
        {status.type === "success" && loading === "" && (
          <div style={{ ...styles.status, ...styles.statusSuccess }}>
            ✓ {status.message}
          </div>
        )}
        {status.type === "error" && loading === "" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            ✗ {status.message}
          </div>
        )}
        {createReservationResponse && (
          <div style={styles.response}>{createReservationResponse}</div>
        )}
      </div>

      {/* Section 5: Get All Reservations */}
      <div style={styles.section}>
        <h2 style={styles.h2}>5. Get All Reservations</h2>
        <p>View all existing reservations</p>
        <button
          onClick={handleGetAllReservations}
          disabled={loading === "reservations"}
          style={
            loading === "reservations"
              ? { ...styles.button, ...styles.buttonDisabled }
              : styles.button
          }
        >
          📅 Get All Reservations
        </button>
        {loading === "reservations" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Loading...
          </div>
        )}
        {reservationsStatus.type === "success" &&
          loading !== "reservations" && (
            <div style={{ ...styles.status, ...styles.statusSuccess }}>
              {reservationsStatus.message}
            </div>
          )}
        {reservationsStatus.type === "error" &&
          loading !== "reservations" && (
            <div style={{ ...styles.status, ...styles.statusError }}>
              {reservationsStatus.message}
            </div>
          )}
        {reservationsResponse && (
          <div style={styles.response}>{reservationsResponse}</div>
        )}
      </div>

      {/* Section 6: Create New Room */}
      <div style={styles.section}>
        <h2 style={styles.h2}>6. Create New Room</h2>
        <p>Add a new room to the system</p>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Description"
            value={newRoom.description || ""}
            onChange={(e) =>
              setNewRoom({ ...newRoom, description: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={newRoom.numberOfPerson || ""}
            onChange={(e) =>
              setNewRoom({
                ...newRoom,
                numberOfPerson: parseInt(e.target.value) || undefined,
              })
            }
            min="1"
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Price"
            step="0.01"
            value={newRoom.price || ""}
            onChange={(e) =>
              setNewRoom({
                ...newRoom,
                price: parseFloat(e.target.value) || undefined,
              })
            }
            min="0"
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={newRoom.havePrivateBathroom || false}
              onChange={(e) =>
                setNewRoom({
                  ...newRoom,
                  havePrivateBathroom: e.target.checked,
                })
              }
            />
            Private Bathroom
          </label>
          <button
            onClick={handleCreateRoom}
            disabled={loading === "createRoom"}
            style={
              loading === "createRoom"
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            ➕ Create Room
          </button>
        </div>
        {loading === "createRoom" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Creating room...
          </div>
        )}
        {createRoomStatus.type === "success" && loading !== "createRoom" && (
          <div style={{ ...styles.status, ...styles.statusSuccess }}>
            {createRoomStatus.message}
          </div>
        )}
        {createRoomStatus.type === "error" && loading !== "createRoom" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            {createRoomStatus.message}
          </div>
        )}
        {createRoomResponse && (
          <div style={styles.response}>{createRoomResponse}</div>
        )}
      </div>

      {/* Section 7: Update Room */}
      <div style={styles.section}>
        <h2 style={styles.h2}>7. Update Room</h2>
        <p>Modify an existing room's details</p>
        <div style={styles.inputGroup}>
          <input
            type="number"
            placeholder="Room ID"
            value={updateRoomId}
            onChange={(e) => setUpdateRoomId(e.target.value)}
            min="1"
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Description"
            value={updateRoomData.description || ""}
            onChange={(e) =>
              setUpdateRoomData({ ...updateRoomData, description: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={updateRoomData.numberOfPerson || ""}
            onChange={(e) =>
              setUpdateRoomData({
                ...updateRoomData,
                numberOfPerson: parseInt(e.target.value) || undefined,
              })
            }
            min="1"
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <input
            type="number"
            placeholder="Price"
            step="0.01"
            value={updateRoomData.price || ""}
            onChange={(e) =>
              setUpdateRoomData({
                ...updateRoomData,
                price: parseFloat(e.target.value) || undefined,
              })
            }
            min="0"
            style={styles.input}
          />
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={updateRoomData.havePrivateBathroom || false}
              onChange={(e) =>
                setUpdateRoomData({
                  ...updateRoomData,
                  havePrivateBathroom: e.target.checked,
                })
              }
            />
            Private Bathroom
          </label>
          <button
            onClick={handleUpdateRoom}
            disabled={loading === "updateRoom"}
            style={
              loading === "updateRoom"
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            ✏️ Update Room
          </button>
        </div>
        {loading === "updateRoom" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Updating room...
          </div>
        )}
        {updateRoomStatus.type === "success" && loading !== "updateRoom" && (
          <div style={{ ...styles.status, ...styles.statusSuccess }}>
            {updateRoomStatus.message}
          </div>
        )}
        {updateRoomStatus.type === "error" && loading !== "updateRoom" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            {updateRoomStatus.message}
          </div>
        )}
      </div>

      {/* Section 8: Delete Room */}
      <div style={styles.section}>
        <h2 style={styles.h2}>8. Delete Room</h2>
        <p>Remove a room from the system</p>
        <div style={styles.inputGroup}>
          <input
            type="number"
            placeholder="Room ID"
            value={deleteRoomId}
            onChange={(e) => setDeleteRoomId(e.target.value)}
            min="1"
            style={styles.input}
          />
          <button
            onClick={handleDeleteRoom}
            disabled={loading === "deleteRoom"}
            style={
              loading === "deleteRoom"
                ? {
                    ...styles.button,
                    ...styles.buttonDisabled,
                    ...styles.deleteButton,
                  }
                : { ...styles.button, ...styles.deleteButton }
            }
          >
            🗑️ Delete Room
          </button>
        </div>
        {loading === "deleteRoom" && (
          <div style={{ ...styles.status, ...styles.statusLoading }}>
            Deleting room...
          </div>
        )}
        {deleteRoomStatus.type === "success" && loading !== "deleteRoom" && (
          <div style={{ ...styles.status, ...styles.statusSuccess }}>
            {deleteRoomStatus.message}
          </div>
        )}
        {deleteRoomStatus.type === "error" && loading !== "deleteRoom" && (
          <div style={{ ...styles.status, ...styles.statusError }}>
            {deleteRoomStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}
