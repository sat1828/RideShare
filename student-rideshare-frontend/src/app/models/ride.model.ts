export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Ride {
  id?: number;
  riderId: number;
  riderName?: string;
  startLocation: Location;
  endLocation: Location;
  route?: Location[];
  price: number;
  availableSeats: number;
  departureTime: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
}

export interface Booking {
  id?: number;
  rideId: number;
  pillionId: number;
  pillionName?: string;
  pickupLocation: Location;
  dropLocation: Location;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED';
  bookingTime?: string;
}

export interface RideSearchRequest {
  startLocation: Location;
  endLocation: Location;
  departureTime?: string;
}
