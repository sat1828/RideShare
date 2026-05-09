package com.rideshare.controller;

import com.rideshare.dto.RideSearchRequest;
import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import com.rideshare.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "http://localhost:4200")
public class RideController {
    
    @Autowired
    private RideService rideService;

    @PostMapping
    public ResponseEntity<Ride> createRide(@RequestBody Ride ride) {
        System.out.println("Creating ride: " + ride);
        Ride createdRide = rideService.createRide(ride);
        System.out.println("Ride created with ID: " + createdRide.getId());
        return ResponseEntity.ok(createdRide);
    }

    @PostMapping("/search")
    public ResponseEntity<List<Ride>> searchRides(@RequestBody RideSearchRequest searchRequest) {
        System.out.println("Search request received: " + searchRequest);
        List<Ride> rides = rideService.searchRides(searchRequest);
        System.out.println("Found " + rides.size() + " rides");
        rides.forEach(ride -> System.out.println("Ride ID: " + ride.getId() + 
                                                 ", Status: " + ride.getStatus() + 
                                                 ", Time: " + ride.getDepartureTime()));
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ride> getRideById(@PathVariable Long id) {
        Ride ride = rideService.getRideById(id);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ride>> getMyRides(@PathVariable Long userId) {
        List<Ride> rides = rideService.getMyRides(userId);
        return ResponseEntity.ok(rides);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ride> updateRideStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        RideStatus status = RideStatus.valueOf(body.get("status"));
        Ride updatedRide = rideService.updateRideStatus(id, status);
        return ResponseEntity.ok(updatedRide);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRide(@PathVariable Long id) {
        rideService.deleteRide(id);
        return ResponseEntity.noContent().build();
    }
    
    // Add debug endpoint
    @GetMapping("/debug/all")
    public ResponseEntity<List<Ride>> getAllRides() {
        // This is for debugging only - remove in production
        List<Ride> allRides = rideService.searchRides(new RideSearchRequest());
        System.out.println("Total rides in database: " + allRides.size());
        return ResponseEntity.ok(allRides);
    }
}