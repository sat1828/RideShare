package com.rideshare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long riderId;

    private String riderName;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "start_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "start_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "start_address", length = 500))
    })
    private Location startLocation;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "end_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "end_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "end_address", length = 500))
    })
    private Location endLocation;

    @ElementCollection(fetch = FetchType.EAGER)  // IMPORTANT: EAGER fetch for routes
    @CollectionTable(name = "ride_routes", joinColumns = @JoinColumn(name = "ride_id"))
    @OrderColumn(name = "route_order")  // Maintain order of route points
    private List<Location> route = new ArrayList<>();

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = RideStatus.ACTIVE;
        }
        // Initialize route list if null
        if (route == null) {
            route = new ArrayList<>();
        }
    }
}