package com.rideshare.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    private Double lat;
    private Double lng;
    private String address;
    
    // Constructor without address
    public Location(Double lat, Double lng) {
        this.lat = lat;
        this.lng = lng;
    }
}
