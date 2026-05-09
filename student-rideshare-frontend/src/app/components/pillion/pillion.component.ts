import { Component, OnInit, AfterViewInit , NgModule} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';
import { BookingService } from '../../services/booking.service';
import { MapService } from '../../services/map.service';
import { Location, Ride, Booking } from '../../models/ride.model';

declare var L: any;

@Component({
  selector: 'app-pillion',
  templateUrl: './pillion.component.html',
  styleUrls: ['./pillion.component.css']
})
export class PillionComponent implements OnInit, AfterViewInit {
  map: any;
  pickupMarker: any;
  dropMarker: any;
  searchRangeCircle: any;
  
  pickupLocation: Location | null = null;
  dropLocation: Location | null = null;
  pickupSearchResults: any[] = [];
  dropSearchResults: any[] = [];
  
  availableRides: Ride[] = [];
  filteredRides: Ride[] = [];
  selectedRide: Ride | null = null;
  rideRoutes: any[] = [];
  
  settingLocation: 'pickup' | 'drop' | null = null;
  isSearching = false;
  isBooking = false;
  successMessage = '';
  errorMessage = '';
  
  searchForm: FormGroup;
  
  // Time filter options
  showTimeFilter = false;
  selectedTimeFilter: string = 'all';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private rideService: RideService,
    private bookingService: BookingService,
    private mapService: MapService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      pickupSearch: [''],
      dropSearch: [''],
      departureTime: ['']  // Add time field
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    
    // Set default time to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.searchForm.patchValue({
      departureTime: now.toISOString().slice(0, 16)
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map('pillion-map').setView([20.2961, 85.8245], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      if (this.settingLocation === 'pickup') {
        this.setPickupLocation(e.latlng.lat, e.latlng.lng);
      } else if (this.settingLocation === 'drop') {
        this.setDropLocation(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  searchPickupLocation(event: any): void {
    const query = event.target.value;
    if (query.length < 3) {
      this.pickupSearchResults = [];
      return;
    }

    this.mapService.searchLocation(query + ', Bhubaneswar').subscribe({
      next: (results) => {
        this.pickupSearchResults = results.slice(0, 5);
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  searchDropLocation(event: any): void {
    const query = event.target.value;
    if (query.length < 3) {
      this.dropSearchResults = [];
      return;
    }

    this.mapService.searchLocation(query + ', Bhubaneswar').subscribe({
      next: (results) => {
        this.dropSearchResults = results.slice(0, 5);
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  selectPickupResult(result: any): void {
    this.setPickupLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    this.pickupSearchResults = [];
    this.searchForm.patchValue({ pickupSearch: result.display_name });
  }

  selectDropResult(result: any): void {
    this.setDropLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    this.dropSearchResults = [];
    this.searchForm.patchValue({ dropSearch: result.display_name });
  }

  setPickupLocation(lat: number, lng: number, address?: string): void {
    this.pickupLocation = { lat, lng, address };
    
    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
    }
    if (this.searchRangeCircle) {
      this.map.removeLayer(this.searchRangeCircle);
    }
    
    this.pickupMarker = L.marker([lat, lng], {
      icon: this.createIcon('#2dd4bf', 20)
    }).addTo(this.map);
    
    this.searchRangeCircle = L.circle([lat, lng], {
      radius: 500,
      color: '#facc15',
      fillOpacity: 0.1,
      weight: 2
    }).addTo(this.map);
    
    this.map.setView([lat, lng], 14);
    this.settingLocation = null;
    
    if (!address) {
      this.mapService.reverseGeocode(lat, lng).subscribe({
        next: (result) => {
          if (this.pickupLocation) {
            this.pickupLocation.address = result.display_name;
            this.searchForm.patchValue({ pickupSearch: result.display_name });
          }
        }
      });
    }
  }

  setDropLocation(lat: number, lng: number, address?: string): void {
    this.dropLocation = { lat, lng, address };
    
    if (this.dropMarker) {
      this.map.removeLayer(this.dropMarker);
    }
    
    this.dropMarker = L.marker([lat, lng], {
      icon: this.createIcon('#f472b6', 20)
    }).addTo(this.map);
    
    this.map.setView([lat, lng], 14);
    this.settingLocation = null;
    
    if (!address) {
      this.mapService.reverseGeocode(lat, lng).subscribe({
        next: (result) => {
          if (this.dropLocation) {
            this.dropLocation.address = result.display_name;
            this.searchForm.patchValue({ dropSearch: result.display_name });
          }
        }
      });
    }
  }

  enablePickupLocationSetting(): void {
    this.settingLocation = 'pickup';
    this.errorMessage = 'Click on the map to set pickup location';
    setTimeout(() => { this.errorMessage = ''; }, 3000);
  }

  enableDropLocationSetting(): void {
    this.settingLocation = 'drop';
    this.errorMessage = 'Click on the map to set drop location';
    setTimeout(() => { this.errorMessage = ''; }, 3000);
  }

  searchRides(): void {
  if (!this.pickupLocation || !this.dropLocation) {
    this.errorMessage = 'Please set both pickup and drop locations';
    return;
  }

  this.isSearching = true;
  this.errorMessage = '';
  this.availableRides = [];
  this.clearRideRoutes();

  const searchRequest = {
    startLocation: this.pickupLocation,
    endLocation: this.dropLocation,
    departureTime: this.searchForm.value.departureTime || ''
  };

  this.rideService.searchRides(searchRequest).subscribe({
    next: (rides) => {
      this.isSearching = false;
      
      console.log('Received rides:', rides.length);
      
      // Filter rides based on 500m proximity using improved algorithm
      this.availableRides = rides.filter(ride => {
        // Check if ride has route data
        if (!ride.route || ride.route.length === 0) {
          console.log(`Ride ${ride.id}: No route data, skipping`);
          return false;
        }

        console.log(`Ride ${ride.id}: Checking with ${ride.route.length} route points`);

        // Use the improved validation method
        const validation = this.mapService.isValidRideMatch(
          ride.route,
          this.pickupLocation!,
          this.dropLocation!,
          500, // pickup radius
          500  // drop radius
        );

        if (validation.valid) {
          console.log(`✓ Ride ${ride.id} MATCHES:`, 
                     `Pickup: ${validation.pickupDistance?.toFixed(0)}m, ` +
                     `Drop: ${validation.dropDistance?.toFixed(0)}m`);
        } else {
          console.log(`✗ Ride ${ride.id} rejected: ${validation.reason}`);
        }

        return validation.valid;
      });

      this.filteredRides = [...this.availableRides];

      if (this.availableRides.length === 0) {
        this.errorMessage = 'No suitable rides found. Make sure your pickup and drop are within 500m of rider routes and in the correct order.';
        console.log('Search completed: 0 matches found');
      } else {
        this.successMessage = `${this.availableRides.length} ride(s) found!`;
        console.log(`Search completed: ${this.availableRides.length} matches found`);
        this.displayRidesOnMap();
        this.showTimeFilter = true;
      }
    },
    error: (error) => {
      this.isSearching = false;
      console.error('Search error:', error);
      this.errorMessage = error.error?.message || 'Failed to search rides. Please try again.';
    }
  });
}

  calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = loc1.lat * Math.PI / 180;
    const φ2 = loc2.lat * Math.PI / 180;
    const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
    const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  applyTimeFilter(filter: string): void {
    this.selectedTimeFilter = filter;
    const now = new Date();

    switch(filter) {
      case 'all':
        this.filteredRides = [...this.availableRides];
        break;
      case 'next1h':
        this.filteredRides = this.availableRides.filter(ride => {
          const rideTime = new Date(ride.departureTime);
          const diff = rideTime.getTime() - now.getTime();
          return diff > 0 && diff <= 3600000; // 1 hour
        });
        break;
      case 'next3h':
        this.filteredRides = this.availableRides.filter(ride => {
          const rideTime = new Date(ride.departureTime);
          const diff = rideTime.getTime() - now.getTime();
          return diff > 0 && diff <= 10800000; // 3 hours
        });
        break;
      case 'today':
        this.filteredRides = this.availableRides.filter(ride => {
          const rideTime = new Date(ride.departureTime);
          return rideTime.toDateString() === now.toDateString();
        });
        break;
    }
  }

  displayRidesOnMap(): void {
    this.clearRideRoutes();
    
    this.filteredRides.forEach(ride => {
      if (ride.route && ride.route.length > 0) {
        const routeLine = L.polyline(
          ride.route.map(loc => [loc.lat, loc.lng]),
          { color: '#818cf8', weight: 4, opacity: 0.7 }
        ).addTo(this.map);
        
        this.rideRoutes.push(routeLine);
      } else {
        // Draw direct line if no route
        const directLine = L.polyline(
          [[ride.startLocation.lat, ride.startLocation.lng],
           [ride.endLocation.lat, ride.endLocation.lng]],
          { color: '#818cf8', weight: 4, opacity: 0.5, dashArray: '5, 10' }
        ).addTo(this.map);
        
        this.rideRoutes.push(directLine);
      }
    });
  }

  clearRideRoutes(): void {
    this.rideRoutes.forEach(route => {
      this.map.removeLayer(route);
    });
    this.rideRoutes = [];
  }

  selectRide(ride: Ride): void {
    this.selectedRide = ride;
  }

  bookRide(): void {
    if (!this.selectedRide || !this.pickupLocation || !this.dropLocation) {
      this.errorMessage = 'Please select a ride and set locations';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not found. Please login again.';
      return;
    }

    this.isBooking = true;
    this.errorMessage = '';

    const booking: Booking = {
      rideId: this.selectedRide.id!,
      pillionId: currentUser.id!,
      pickupLocation: this.pickupLocation,
      dropLocation: this.dropLocation,
      status: 'PENDING'
    };

    this.bookingService.createBooking(booking).subscribe({
      next: (response) => {
        this.isBooking = false;
        this.successMessage = 'Booking request sent successfully!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isBooking = false;
        this.errorMessage = error.error?.message || 'Failed to book ride. Please try again.';
      }
    });
  }

  createIcon(color: string, size: number = 16): any {
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
  
  // Helper method for time status
  getRideTimeStatus(departureTime: string): string {
    const now = new Date();
    const rideTime = new Date(departureTime);
    const diff = rideTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 0) return 'Past';
    if (minutes < 60) return `In ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `In ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `In ${days}d`;
  }
}