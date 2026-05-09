import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';
import { BookingService } from '../../services/booking.service';
import { User } from '../../models/user.model';
import { Ride, Booking } from '../../models/ride.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  myRides: Ride[] = [];
  myBookings: Booking[] = [];
  incomingBookings: Booking[] = [];  // NEW: Bookings from pillion riders
  pendingBookingsCount: number = 0;  // NEW: Count of pending requests
  isLoading = true;

  constructor(
    private authService: AuthService,
    private rideService: RideService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    if (!this.currentUser) return;

    // Load my rides (if I'm a rider)
    this.rideService.getMyRides(this.currentUser.id!).subscribe({
      next: (rides) => {
        this.myRides = rides;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rides:', error);
        this.isLoading = false;
      }
    });

    // Load my bookings (if I'm a pillion)
    this.bookingService.getMyBookings(this.currentUser.id!).subscribe({
      next: (bookings) => {
        this.myBookings = bookings;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
    
    // NEW: Load incoming booking requests (for my rides)
    if (this.canBeRider()) {
      this.bookingService.getBookingsForRider(this.currentUser.id!).subscribe({
        next: (bookings) => {
          this.incomingBookings = bookings;
          this.pendingBookingsCount = bookings.filter(b => b.status === 'PENDING').length;
          console.log('Incoming bookings:', bookings);
        },
        error: (error) => {
          console.error('Error loading incoming bookings:', error);
        }
      });
    }
  }

  goToRider(): void {
    this.router.navigate(['/rider']);
  }

  goToPillion(): void {
    this.router.navigate(['/pillion']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  canBeRider(): boolean {
    return this.currentUser?.role === 'RIDER' || this.currentUser?.role === 'BOTH';
  }

  canBePillion(): boolean {
    return this.currentUser?.role === 'PILLION' || this.currentUser?.role === 'BOTH';
  }

  cancelRide(rideId: number): void {
    if (confirm('Are you sure you want to cancel this ride?')) {
      this.rideService.updateRideStatus(rideId, 'CANCELLED').subscribe({
        next: () => {
          this.loadUserData();
        },
        error: (error) => {
          console.error('Error cancelling ride:', error);
        }
      });
    }
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.deleteBooking(bookingId).subscribe({
        next: () => {
          this.loadUserData();
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
        }
      });
    }
  }
  
  // NEW: Accept booking request
  acceptBooking(bookingId: number): void {
    if (confirm('Accept this booking request?')) {
      this.bookingService.updateBookingStatus(bookingId, 'CONFIRMED').subscribe({
        next: () => {
          alert('Booking accepted!');
          this.loadUserData();
        },
        error: (error) => {
          console.error('Error accepting booking:', error);
          alert('Failed to accept booking');
        }
      });
    }
  }
  
  // NEW: Reject booking request
  rejectBooking(bookingId: number): void {
    if (confirm('Reject this booking request?')) {
      this.bookingService.updateBookingStatus(bookingId, 'REJECTED').subscribe({
        next: () => {
          alert('Booking rejected');
          this.loadUserData();
        },
        error: (error) => {
          console.error('Error rejecting booking:', error);
          alert('Failed to reject booking');
        }
      });
    }
  }
  
  // NEW: Get ride details for a booking
  getRideForBooking(rideId: number): Ride | undefined {
    return this.myRides.find(r => r.id === rideId);
  }
}
