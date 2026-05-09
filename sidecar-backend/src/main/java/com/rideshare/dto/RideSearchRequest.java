package com.rideshare.dto;

import com.rideshare.model.Location;
import lombok.Data;

@Data
public class RideSearchRequest {
    private Location startLocation;
    private Location endLocation;
    private String departureTime;
}
