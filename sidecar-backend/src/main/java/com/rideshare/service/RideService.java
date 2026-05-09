package com.rideshare.service;

import com.rideshare.dto.RideSearchRequest;
import com.rideshare.model.Location;
import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import com.rideshare.model.User;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {
    
    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Ride createRide(Ride ride) {
        User rider = userRepository.findById(ride.getRiderId())
            .orElseThrow(() -> new RuntimeException("Rider not found"));
        
        ride.setRiderName(rider.getUsername());
        ride.setStatus(RideStatus.ACTIVE);
        
        // Calculate and save route using OSRM
        if (ride.getRoute() == null || ride.getRoute().isEmpty()) {
            List<Location> calculatedRoute = calculateRoute(ride.getStartLocation(), ride.getEndLocation());
            ride.setRoute(calculatedRoute);
            System.out.println("Route calculated with " + calculatedRoute.size() + " points");
        }
        
        Ride savedRide = rideRepository.save(ride);
        System.out.println("Ride saved with ID: " + savedRide.getId() + ", Route points: " + savedRide.getRoute().size());
        return savedRide;
    }
    
    private List<Location> calculateRoute(Location start, Location end) {
        List<Location> routePoints = new ArrayList<>();
        
        try {
            String url = String.format(
                "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson",
                start.getLng(), start.getLat(), end.getLng(), end.getLat()
            );
            
            System.out.println("Fetching route from OSRM: " + url);
            String response = restTemplate.getForObject(url, String.class);
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode coordinates = root.path("routes").get(0).path("geometry").path("coordinates");
            
            if (coordinates.isArray()) {
                for (JsonNode coord : coordinates) {
                    double lng = coord.get(0).asDouble();
                    double lat = coord.get(1).asDouble();
                    routePoints.add(new Location(lat, lng));
                }
                System.out.println("Successfully calculated route with " + routePoints.size() + " points");
            }
        } catch (Exception e) {
            System.err.println("Error calculating route: " + e.getMessage());
            // Fallback: create simple straight line with intermediate points
            routePoints = createStraightLineRoute(start, end);
        }
        
        // If route calculation failed, at least add start and end
        if (routePoints.isEmpty()) {
            routePoints.add(start);
            routePoints.add(end);
        }
        
        return routePoints;
    }
    
    private List<Location> createStraightLineRoute(Location start, Location end) {
        List<Location> points = new ArrayList<>();
        points.add(start);
        
        // Add 10 intermediate points for better proximity checking
        for (int i = 1; i <= 10; i++) {
            double ratio = i / 11.0;
            double lat = start.getLat() + (end.getLat() - start.getLat()) * ratio;
            double lng = start.getLng() + (end.getLng() - start.getLng()) * ratio;
            points.add(new Location(lat, lng));
        }
        
        points.add(end);
        System.out.println("Created fallback straight line route with " + points.size() + " points");
        return points;
    }

    public List<Ride> searchRides(RideSearchRequest searchRequest) {
        List<Ride> activeRides = rideRepository.findByStatus(RideStatus.ACTIVE);
        
        System.out.println("Found " + activeRides.size() + " active rides");
        
        // Filter by departure time if provided
        if (searchRequest.getDepartureTime() != null && !searchRequest.getDepartureTime().isEmpty()) {
            LocalDateTime searchTime = LocalDateTime.parse(searchRequest.getDepartureTime());
            LocalDateTime startWindow = searchTime.minusHours(1);
            LocalDateTime endWindow = searchTime.plusHours(2);
            
            activeRides = activeRides.stream()
                .filter(ride -> {
                    LocalDateTime rideTime = ride.getDepartureTime();
                    return rideTime.isAfter(startWindow) && rideTime.isBefore(endWindow);
                })
                .collect(Collectors.toList());
        } else {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime tomorrow = now.plusHours(24);
            
            activeRides = activeRides.stream()
                .filter(ride -> {
                    LocalDateTime rideTime = ride.getDepartureTime();
                    return rideTime.isAfter(now) && rideTime.isBefore(tomorrow);
                })
                .collect(Collectors.toList());
        }
        
        // Log route information for debugging
        activeRides.forEach(ride -> {
            System.out.println("Ride ID: " + ride.getId() + 
                             ", Route points: " + (ride.getRoute() != null ? ride.getRoute().size() : 0));
        });
        
        return activeRides;
    }

    public Ride getRideById(Long id) {
        return rideRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ride not found"));
    }

    public List<Ride> getMyRides(Long userId) {
        return rideRepository.findByRiderId(userId);
    }

    public Ride updateRideStatus(Long id, RideStatus status) {
        Ride ride = getRideById(id);
        ride.setStatus(status);
        return rideRepository.save(ride);
    }

    public void deleteRide(Long id) {
        rideRepository.deleteById(id);
    }
}
