package com.rideshare.controller;

import com.rideshare.model.Booking;
import com.rideshare.model.BookingStatus;
import com.rideshare.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        System.out.println("\n=== CREATE BOOKING REQUEST ===");
        System.out.println("Ride ID: " + booking.getRideId());
        System.out.println("Pillion ID: " + booking.getPillionId());
        
        Booking createdBooking = bookingService.createBooking(booking);
        
        System.out.println("=== BOOKING CREATED SUCCESSFULLY ===\n");
        return ResponseEntity.ok(createdBooking);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getMyBookings(@PathVariable Long userId) {
        System.out.println("Getting bookings for pillion user: " + userId);
        List<Booking> bookings = bookingService.getMyBookings(userId);
        System.out.println("Returned " + bookings.size() + " bookings");
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<List<Booking>> getBookingsForRide(@PathVariable Long rideId) {
        System.out.println("Getting bookings for ride: " + rideId);
        List<Booking> bookings = bookingService.getBookingsForRide(rideId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/rider/{riderId}")
    public ResponseEntity<List<Booking>> getBookingsForRider(@PathVariable Long riderId) {
        System.out.println("\n=== GET BOOKINGS FOR RIDER ===");
        System.out.println("Rider ID: " + riderId);
        
        try {
            // Try repository query first
            List<Booking> bookings = bookingService.getBookingsForRider(riderId);
            System.out.println("Repository query returned: " + bookings.size() + " bookings");
            
            // If empty, try manual join
            if (bookings.isEmpty()) {
                System.out.println("Trying manual join method...");
                bookings = bookingService.getBookingsForRiderManual(riderId);
                System.out.println("Manual join returned: " + bookings.size() + " bookings");
            }
            
            System.out.println("=== RETURNING " + bookings.size() + " BOOKINGS ===\n");
            return ResponseEntity.ok(bookings);
            
        } catch (Exception e) {
            System.err.println("ERROR getting bookings for rider: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }
    
    @GetMapping("/rider/{riderId}/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingCount(@PathVariable Long riderId) {
        System.out.println("Getting pending count for rider: " + riderId);
        Long count = bookingService.countPendingBookingsForRider(riderId);
        System.out.println("Pending count: " + count);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        
        System.out.println("\n=== UPDATE BOOKING STATUS ===");
        System.out.println("Booking ID: " + id);
        System.out.println("New Status: " + body.get("status"));
        
        BookingStatus status = BookingStatus.valueOf(body.get("status"));
        Booking updatedBooking = bookingService.updateBookingStatus(id, status);
        
        System.out.println("=== STATUS UPDATED ===\n");
        return ResponseEntity.ok(updatedBooking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        System.out.println("Deleting booking: " + id);
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
    
    // DEBUG ENDPOINT - Remove in production
    @GetMapping("/debug/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        System.out.println("DEBUG: Getting ALL bookings");
        List<Booking> all = bookingService.getMyBookings(0L); // This won't work, need to modify
        return ResponseEntity.ok(all);
    }
}