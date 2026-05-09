package com.rideshare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long rideId;

    @Column(nullable = false)
    private Long pillionId;

    private String pillionName;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "pickup_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "pickup_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "pickup_address", length = 500))
    })
    private Location pickupLocation;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "drop_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "drop_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "drop_address", length = 500))
    })
    private Location dropLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime bookingTime = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        bookingTime = LocalDateTime.now();
        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }
}