package com.rideshare.repository;

import com.rideshare.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByRideId(Long rideId);
    List<Booking> findByPillionId(Long pillionId);
    
    // OPTION 1: Native SQL Query (Most Reliable)
    @Query(value = "SELECT b.* FROM bookings b " +
                   "INNER JOIN rides r ON b.ride_id = r.id " +
                   "WHERE r.rider_id = :riderId " +
                   "ORDER BY b.booking_time DESC", 
           nativeQuery = true)
    List<Booking> findBookingsForRider(@Param("riderId") Long riderId);
    
    // OPTION 2: Alternative Native Query with explicit columns
    @Query(value = "SELECT b.id, b.ride_id, b.pillion_id, b.pillion_name, " +
                   "b.pickup_lat, b.pickup_lng, b.pickup_address, " +
                   "b.drop_lat, b.drop_lng, b.drop_address, " +
                   "b.status, b.booking_time " +
                   "FROM bookings b " +
                   "INNER JOIN rides r ON b.ride_id = r.id " +
                   "WHERE r.rider_id = :riderId " +
                   "ORDER BY b.booking_time DESC", 
           nativeQuery = true)
    List<Booking> findBookingsForRiderExplicit(@Param("riderId") Long riderId);
    
    // Count pending bookings (Native)
    @Query(value = "SELECT COUNT(*) FROM bookings b " +
                   "INNER JOIN rides r ON b.ride_id = r.id " +
                   "WHERE r.rider_id = :riderId AND b.status = 'PENDING'", 
           nativeQuery = true)
    Long countPendingBookingsForRider(@Param("riderId") Long riderId);
}