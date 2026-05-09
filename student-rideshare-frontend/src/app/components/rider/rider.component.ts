
import { Component, OnInit, AfterViewInit, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';
import { MapService } from '../../services/map.service';
import { Location, Ride } from '../../models/ride.model';

declare var L: any;

@Component({
  selector: 'app-rider',
  templateUrl: './rider.component.html',
  styleUrls: ['./rider.component.css']
})
export class RiderComponent implements OnInit, AfterViewInit {
  map: any;
  startMarker: any;
  endMarker: any;
  routeControl: any;
  rideForm: FormGroup;
  
  startLocation: Location | null = null;
  endLocation: Location | null = null;
  startSearchResults: any[] = [];
  endSearchResults: any[] = [];
  
  settingLocation: 'start' | 'end' | null = null;
  isCreatingRide = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private rideService: RideService,
    private mapService: MapService,
    private router: Router
  ) {
    this.rideForm = this.fb.group({
      startSearch: [''],
      endSearch: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      availableSeats: [1, [Validators.required, Validators.min(1), Validators.max(2)]],
      departureTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    // Initialize map centered on Bhubaneswar
    this.map = L.map('ride-map').setView([20.2961, 85.8245], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Handle map clicks for setting locations
    this.map.on('click', (e: any) => {
      if (this.settingLocation === 'start') {
        this.setStartLocation(e.latlng.lat, e.latlng.lng);
      } else if (this.settingLocation === 'end') {
        this.setEndLocation(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  searchStartLocation(event: any): void {
    const query = event.target.value;
    if (query.length < 3) {
      this.startSearchResults = [];
      return;
    }

    this.mapService.searchLocation(query + ', Bhubaneswar').subscribe({
      next: (results) => {
        this.startSearchResults = results.slice(0, 5);
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  searchEndLocation(event: any): void {
    const query = event.target.value;
    if (query.length < 3) {
      this.endSearchResults = [];
      return;
    }

    this.mapService.searchLocation(query + ', Bhubaneswar').subscribe({
      next: (results) => {
        this.endSearchResults = results.slice(0, 5);
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  selectStartResult(result: any): void {
    this.setStartLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    this.startSearchResults = [];
    this.rideForm.patchValue({ startSearch: result.display_name });
  }

  selectEndResult(result: any): void {
    this.setEndLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    this.endSearchResults = [];
    this.rideForm.patchValue({ endSearch: result.display_name });
  }

  setStartLocation(lat: number, lng: number, address?: string): void {
    this.startLocation = { lat, lng, address };
    
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
    }
    
    this.startMarker = L.marker([lat, lng], {
      icon: this.createIcon('#a78bfa', 20)
    }).addTo(this.map);
    
    this.map.setView([lat, lng], 14);
    this.settingLocation = null;
    
    if (!address) {
      this.mapService.reverseGeocode(lat, lng).subscribe({
        next: (result) => {
          if (this.startLocation) {
            this.startLocation.address = result.display_name;
            this.rideForm.patchValue({ startSearch: result.display_name });
          }
        }
      });
    }
    
    this.updateRoute();
  }

  setEndLocation(lat: number, lng: number, address?: string): void {
    this.endLocation = { lat, lng, address };
    
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
    }
    
    this.endMarker = L.marker([lat, lng], {
      icon: this.createIcon('#f472b6', 20)
    }).addTo(this.map);
    
    this.map.setView([lat, lng], 14);
    this.settingLocation = null;
    
    if (!address) {
      this.mapService.reverseGeocode(lat, lng).subscribe({
        next: (result) => {
          if (this.endLocation) {
            this.endLocation.address = result.display_name;
            this.rideForm.patchValue({ endSearch: result.display_name });
          }
        }
      });
    }
    
    this.updateRoute();
  }

  updateRoute(): void {
    if (this.startLocation && this.endLocation) {
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }

      this.routeControl = L.routing.control({
        waypoints: [
          L.latLng(this.startLocation.lat, this.startLocation.lng),
          L.latLng(this.endLocation.lat, this.endLocation.lng)
        ],
        router: L.routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: false,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: '#818cf8', weight: 5, opacity: 0.9 }]
        },
        createMarker: () => null
      }).addTo(this.map);
    }
  }

  enableStartLocationSetting(): void {
    this.settingLocation = 'start';
    this.errorMessage = 'Click on the map to set start location';
    setTimeout(() => { this.errorMessage = ''; }, 3000);
  }

  enableEndLocationSetting(): void {
    this.settingLocation = 'end';
    this.errorMessage = 'Click on the map to set end location';
    setTimeout(() => { this.errorMessage = ''; }, 3000);
  }

  createRide(): void {
  if (!this.startLocation || !this.endLocation) {
    this.errorMessage = 'Please set both start and end locations';
    return;
  }

  if (!this.rideForm.valid) {
    this.errorMessage = 'Please fill all required fields';
    return;
  }

  this.isCreatingRide = true;
  this.errorMessage = '';
  
  const currentUser = this.authService.getCurrentUser();
  if (!currentUser) {
    this.errorMessage = 'User not found. Please login again.';
    this.isCreatingRide = false;
    return;
  }

  // Get route from Leaflet routing control
  let routeCoordinates: Location[] = [];
  
  if (this.routeControl) {
    // Extract route from routing control
    const routes = (this.routeControl as any)._routes;
    if (routes && routes.length > 0) {
      routeCoordinates = routes[0].coordinates.map((coord: any) => ({
        lat: coord.lat,
        lng: coord.lng
      }));
      console.log('Route extracted with ' + routeCoordinates.length + ' points');
    }
  }

  const ride: Ride = {
    riderId: currentUser.id!,
    startLocation: this.startLocation,
    endLocation: this.endLocation,
    route: routeCoordinates, // Send route to backend
    price: this.rideForm.value.price,
    availableSeats: this.rideForm.value.availableSeats,
    departureTime: this.rideForm.value.departureTime,
    status: 'ACTIVE'
  };

  console.log('Creating ride with route:', ride);

  this.rideService.createRide(ride).subscribe({
    next: (response) => {
      this.isCreatingRide = false;
      console.log('Ride created:', response);
      this.successMessage = 'Ride created successfully!';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    },
    error: (error) => {
      this.isCreatingRide = false;
      this.errorMessage = error.error?.message || 'Failed to create ride. Please try again.';
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
}

// ----------------------------------------
// 17. src/app/components/rider/rider.component.html
// ----------------------------------------
/*
<div class="h-screen bg-gray-900 text-white flex flex-col md:flex-row">
  <!-- Map Section -->
  <div class="flex-grow flex flex-col p-4 md:p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Offer a Ride</h1>
      <button (click)="goBack()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
        ← Back
      </button>
    </div>
    <div id="ride-map" class="w-full h-full bg-gray-800 rounded-xl shadow-lg"></div>
  </div>

  <!-- Controls Section -->
  <div class="w-full md:w-96 bg-gray-800 p-6 overflow-y-auto space-y-6">
    <h2 class="text-xl font-semibold text-indigo-400">Ride Details</h2>

    <form [formGroup]="rideForm" (ngSubmit)="createRide()" class="space-y-4">
      <!-- Start Location -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Start Location</label>
        <input 
          type="text" 
          formControlName="startSearch"
          (input)="searchStartLocation($event)"
          (focus)="enableStartLocationSetting()"
          placeholder="Search or click map"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500">
        
        <div *ngIf="startSearchResults.length > 0" class="mt-2 bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
          <div *ngFor="let result of startSearchResults" 
               (click)="selectStartResult(result)"
               class="p-2 hover:bg-gray-600 cursor-pointer text-sm border-b border-gray-600 last:border-0">
            {{ result.display_name }}
          </div>
        </div>
        
        <p *ngIf="startLocation" class="mt-1 text-xs text-green-400">
          ✓ Location set: {{ startLocation.lat.toFixed(4) }}, {{ startLocation.lng.toFixed(4) }}
        </p>
      </div>

      <!-- End Location -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">End Location</label>
        <input 
          type="text" 
          formControlName="endSearch"
          (input)="searchEndLocation($event)"
          (focus)="enableEndLocationSetting()"
          placeholder="Search or click map"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500">
        
        <div *ngIf="endSearchResults.length > 0" class="mt-2 bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
          <div *ngFor="let result of endSearchResults" 
               (click)="selectEndResult(result)"
               class="p-2 hover:bg-gray-600 cursor-pointer text-sm border-b border-gray-600 last:border-0">
            {{ result.display_name }}
          </div>
        </div>
        
        <p *ngIf="endLocation" class="mt-1 text-xs text-green-400">
          ✓ Location set: {{ endLocation.lat.toFixed(4) }}, {{ endLocation.lng.toFixed(4) }}
        </p>
      </div>

      <!-- Price -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Price (₹)</label>
        <input 
          type="number" 
          formControlName="price"
          min="1"
          placeholder="Enter price"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500">
      </div>

      <!-- Available Seats -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Available Seats</label>
        <select 
          formControlName="availableSeats"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500">
          <option value="1">1 Seat</option>
          <option value="2">2 Seats</option>
        </select>
      </div>

      <!-- Departure Time -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Departure Time</label>
        <input 
          type="datetime-local" 
          formControlName="departureTime"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500">
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        [disabled]="!rideForm.valid || !startLocation || !endLocation || isCreatingRide"
        class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg">
        <span *ngIf="!isCreatingRide">Create Ride & Go Online</span>
        <span *ngIf="isCreatingRide">Creating...</span>
      </button>
    </form>

    <!-- Legend -->
    <div class="border-t border-gray-700 pt-4">
      <h3 class="text-sm font-semibold mb-2">Map Legend</h3>
      <div class="space-y-2 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-purple-400"></div>
          <span>Start Location</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-pink-400"></div>
          <span>End Location</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-1 bg-indigo-400"></div>
          <span>Your Route</span>
        </div>
      </div>
    </div>
  </div>
</div>
*/