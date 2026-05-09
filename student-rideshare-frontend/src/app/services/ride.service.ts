import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ride, RideSearchRequest } from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = 'http://localhost:8080/api/rides';

  constructor(private http: HttpClient) {}

  createRide(ride: Ride): Observable<Ride> {
    return this.http.post<Ride>(this.apiUrl, ride);
  }

  searchRides(searchRequest: RideSearchRequest): Observable<Ride[]> {
    return this.http.post<Ride[]>(`${this.apiUrl}/search`, searchRequest);
  }

  getRideById(id: number): Observable<Ride> {
    return this.http.get<Ride>(`${this.apiUrl}/${id}`);
  }

  getMyRides(userId: number): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.apiUrl}/user/${userId}`);
  }

  updateRideStatus(id: number, status: string): Observable<Ride> {
    return this.http.patch<Ride>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteRide(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}