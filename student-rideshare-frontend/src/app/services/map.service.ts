import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/ride.model';

declare var L: any;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) {}

  searchLocation(query: string): Observable<any[]> {
    const url = `${this.nominatimUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
    return this.http.get<any[]>(url);
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    const url = `${this.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lng}`;
    return this.http.get<any>(url);
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Calculate shortest distance from point to line segment
  distanceToLineSegment(point: Location, lineStart: Location, lineEnd: Location): number {
    const R = 6371e3; // Earth radius in meters
    
    // Convert to radians
    const p = {
      lat: point.lat * Math.PI / 180,
      lng: point.lng * Math.PI / 180
    };
    const a = {
      lat: lineStart.lat * Math.PI / 180,
      lng: lineStart.lng * Math.PI / 180
    };
    const b = {
      lat: lineEnd.lat * Math.PI / 180,
      lng: lineEnd.lng * Math.PI / 180
    };

    // Vector from A to B
    const ab = {
      lat: b.lat - a.lat,
      lng: b.lng - a.lng
    };
    
    // Vector from A to P
    const ap = {
      lat: p.lat - a.lat,
      lng: p.lng - a.lng
    };

    // Calculate projection parameter t
    const ab_ab = ab.lat * ab.lat + ab.lng * ab.lng;
    const ap_ab = ap.lat * ab.lat + ap.lng * ab.lng;
    
    let t = ap_ab / ab_ab;
    t = Math.max(0, Math.min(1, t)); // Clamp between 0 and 1

    // Find closest point on line segment
    const closest = {
      lat: a.lat + t * ab.lat,
      lng: a.lng + t * ab.lng
    };

    // Calculate distance from point to closest point
    const Δφ = p.lat - closest.lat;
    const Δλ = p.lng - closest.lng;
    
    const x = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(p.lat) * Math.cos(closest.lat) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const distance = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)) * R;

    return distance;
  }

  // Check if point is within maxDistance meters of route
  isPointNearRoute(point: Location, route: Location[], maxDistance: number = 500): boolean {
    if (!route || route.length === 0) {
      return false;
    }

    if (route.length === 1) {
      // If only one point in route, check distance to that point
      return this.calculateDistance(point, route[0]) <= maxDistance;
    }

    // Check distance to each line segment in the route
    for (let i = 0; i < route.length - 1; i++) {
      const distance = this.distanceToLineSegment(point, route[i], route[i + 1]);
      
      if (distance <= maxDistance) {
        console.log(`Point is ${distance.toFixed(0)}m from route segment ${i}`);
        return true;
      }
    }

    return false;
  }

  // Find the closest point on route to given point
  findClosestPointOnRoute(point: Location, route: Location[]): { point: Location, distance: number } {
    let minDistance = Infinity;
    let closestPoint = route[0];

    for (let i = 0; i < route.length - 1; i++) {
      const distance = this.distanceToLineSegment(point, route[i], route[i + 1]);
      if (distance < minDistance) {
        minDistance = distance;
        // Find the actual closest point on this segment
        const t = this.getProjectionParameter(point, route[i], route[i + 1]);
        closestPoint = {
          lat: route[i].lat + t * (route[i + 1].lat - route[i].lat),
          lng: route[i].lng + t * (route[i + 1].lng - route[i].lng)
        };
      }
    }

    return { point: closestPoint, distance: minDistance };
  }

  private getProjectionParameter(point: Location, lineStart: Location, lineEnd: Location): number {
    const p = { lat: point.lat, lng: point.lng };
    const a = { lat: lineStart.lat, lng: lineStart.lng };
    const b = { lat: lineEnd.lat, lng: lineEnd.lng };

    const ab = { lat: b.lat - a.lat, lng: b.lng - a.lng };
    const ap = { lat: p.lat - a.lat, lng: p.lng - a.lng };

    const ab_ab = ab.lat * ab.lat + ab.lng * ab.lng;
    const ap_ab = ap.lat * ab.lat + ap.lng * ab.lng;

    let t = ap_ab / ab_ab;
    return Math.max(0, Math.min(1, t));
  }

  // Check if pillion journey makes sense with rider's route
  isValidRideMatch(
    riderRoute: Location[],
    pillionPickup: Location,
    pillionDrop: Location,
    pickupRadius: number = 500,
    dropRadius: number = 500
  ): { valid: boolean, reason?: string, pickupDistance?: number, dropDistance?: number } {
    
    if (!riderRoute || riderRoute.length === 0) {
      return { valid: false, reason: 'No route data available' };
    }

    // Check if pickup is near route
    const pickupNear = this.isPointNearRoute(pillionPickup, riderRoute, pickupRadius);
    if (!pickupNear) {
      return { valid: false, reason: 'Pickup location too far from rider route' };
    }

    // Check if drop is near route
    const dropNear = this.isPointNearRoute(pillionDrop, riderRoute, dropRadius);
    if (!dropNear) {
      return { valid: false, reason: 'Drop location too far from rider route' };
    }

    // Get closest points on route
    const closestPickup = this.findClosestPointOnRoute(pillionPickup, riderRoute);
    const closestDrop = this.findClosestPointOnRoute(pillionDrop, riderRoute);

    // Find indices of these points on the route
    const pickupIndex = this.findNearestRouteIndex(closestPickup.point, riderRoute);
    const dropIndex = this.findNearestRouteIndex(closestDrop.point, riderRoute);

    // Ensure drop comes after pickup on the route
    if (dropIndex <= pickupIndex) {
      return { 
        valid: false, 
        reason: 'Drop location must be further along the route than pickup',
        pickupDistance: closestPickup.distance,
        dropDistance: closestDrop.distance
      };
    }

    // Valid match!
    return { 
      valid: true, 
      pickupDistance: closestPickup.distance, 
      dropDistance: closestDrop.distance 
    };
  }

  private findNearestRouteIndex(point: Location, route: Location[]): number {
    let minDistance = Infinity;
    let nearestIndex = 0;

    for (let i = 0; i < route.length; i++) {
      const distance = this.calculateDistance(point, route[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }
}
