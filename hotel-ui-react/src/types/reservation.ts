export interface Reservation {
  id?: number;
  idRoom: number;
  checkInDate: string;
  checkOutDate: string;
  fullName: string;
  email: string;
  phone: string;
  specialRequest?: string;
}

