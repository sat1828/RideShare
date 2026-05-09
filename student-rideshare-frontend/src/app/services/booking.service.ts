import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  getMyBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  getBookingsForRide(rideId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/ride/${rideId}`);
  }
  
  // NEW: Get all bookings for rider's rides
  getBookingsForRider(riderId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/rider/${riderId}`);
  }
  
  // NEW: Get pending count
  getPendingCountForRider(riderId: number): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/rider/${riderId}/pending-count`);
  }

  updateBookingStatus(id: number, status: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
