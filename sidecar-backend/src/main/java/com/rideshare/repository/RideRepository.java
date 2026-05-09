package com.rideshare.repository;

import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByRiderId(Long riderId);
    List<Ride> findByStatus(RideStatus status);
    List<Ride> findByRiderIdAndStatus(Long riderId, RideStatus status);
}
