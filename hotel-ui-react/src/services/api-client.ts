import type { Room } from "../types/room";
import type { Reservation } from "../types/reservation";

// Use relative URL for API calls to leverage Vite proxy in development
// In development, the Vite proxy handles /api/* routes
// In production, VITE_API_URL will be set to the production backend URL
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || ""
  : "";

export async function getAllRooms(): Promise<Room[]> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function searchAvailableRooms(
  checkIn: string,
  checkOut: string
): Promise<Room[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/reservations/search?checkIn=${checkIn}&checkOut=${checkOut}`
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function createReservation(
  reservation: Reservation
): Promise<Reservation> {
  const response = await fetch(`${API_BASE_URL}/api/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservation),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
}

export async function getRoomById(id: number): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Room not found");
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function getAllReservations(): Promise<Reservation[]> {
  const response = await fetch(`${API_BASE_URL}/api/reservations`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function createRoom(room: Partial<Room>): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function updateRoom(
  id: number,
  room: Partial<Room>
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

export async function deleteRoom(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}
