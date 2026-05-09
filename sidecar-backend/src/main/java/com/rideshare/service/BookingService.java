package com.rideshare.service;

import com.rideshare.model.Booking;
import com.rideshare.model.BookingStatus;
import com.rideshare.model.Ride;
import com.rideshare.model.User;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RideRepository rideRepository;

    public Booking createBooking(Booking booking) {
        User pillion = userRepository.findById(booking.getPillionId())
            .orElseThrow(() -> new RuntimeException("Pillion user not found"));
        
        Ride ride = rideRepository.findById(booking.getRideId())
            .orElseThrow(() -> new RuntimeException("Ride not found"));
        
        booking.setPillionName(pillion.getUsername());
        booking.setStatus(BookingStatus.PENDING);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        System.out.println("✓ Booking created successfully:");
        System.out.println("  - Booking ID: " + savedBooking.getId());
        System.out.println("  - Ride ID: " + ride.getId());
        System.out.println("  - Rider ID: " + ride.getRiderId());
        System.out.println("  - Rider Name: " + ride.getRiderName());
        System.out.println("  - Pillion ID: " + pillion.getId());
        System.out.println("  - Pillion Name: " + pillion.getUsername());
        System.out.println("  - Status: " + savedBooking.getStatus());
        
        return savedBooking;
    }

    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByPillionId(userId);
    }

    public List<Booking> getBookingsForRide(Long rideId) {
        return bookingRepository.findByRideId(rideId);
    }
    
    // METHOD 1: Using repository query
    public List<Booking> getBookingsForRider(Long riderId) {
        System.out.println("Getting bookings for rider ID: " + riderId);
        List<Booking> bookings = bookingRepository.findBookingsForRider(riderId);
        System.out.println("Found " + bookings.size() + " bookings for rider");
        
        bookings.forEach(b -> {
            System.out.println("  - Booking ID: " + b.getId() + 
                             ", Pillion: " + b.getPillionName() + 
                             ", Status: " + b.getStatus());
        });
        
        return bookings;
    }
    
    // METHOD 2: Manual join in service (FALLBACK if repository query fails)
    public List<Booking> getBookingsForRiderManual(Long riderId) {
        System.out.println("Using manual join for rider ID: " + riderId);
        
        // Get all rides by this rider
        List<Ride> riderRides = rideRepository.findByRiderId(riderId);
        System.out.println("Rider has " + riderRides.size() + " rides");
        
        if (riderRides.isEmpty()) {
            System.out.println("No rides found for this rider");
            return List.of();
        }
        
        // Get all ride IDs
        List<Long> rideIds = riderRides.stream()
            .map(Ride::getId)
            .collect(Collectors.toList());
        
        System.out.println("Ride IDs: " + rideIds);
        
        // Get all bookings
        List<Booking> allBookings = bookingRepository.findAll();
        System.out.println("Total bookings in database: " + allBookings.size());
        
        // Filter bookings that match our ride IDs
        List<Booking> filteredBookings = allBookings.stream()
            .filter(booking -> rideIds.contains(booking.getRideId()))
            .collect(Collectors.toList());
        
        System.out.println("Filtered to " + filteredBookings.size() + " bookings for this rider");
        
        return filteredBookings;
    }
    
    public Long countPendingBookingsForRider(Long riderId) {
        return bookingRepository.countPendingBookingsForRider(riderId);
    }

    public Booking updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        System.out.println("Updating booking " + id + " status from " + 
                          booking.getStatus() + " to " + status);
        
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}
