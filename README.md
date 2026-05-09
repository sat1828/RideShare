A modern, intelligent ride-sharing platform designed exclusively for students to connect, share rides, and travel affordably across campus and city.


📖 Project Overview
Student RideShare is a comprehensive web-based carpooling solution that bridges the gap between students who own vehicles and those seeking affordable transportation. Built with cutting-edge technologies, the platform offers an intuitive interface for creating, discovering, and booking shared rides with smart route matching and real-time map integration.
🎯 Problem Statement
Students often face challenges:

High transportation costs for daily commutes
Limited public transport options
Environmental concerns about individual vehicle usage
Difficulty finding reliable ride-sharing partners
Safety concerns when traveling with strangers

💡 Our Solution
Student RideShare addresses these challenges by providing:

A trusted platform exclusively for verified students
Intelligent route matching within 500-meter proximity
Real-time interactive maps for accurate location setting
Transparent pricing set by riders themselves
Instant booking confirmation system
User-friendly interface with smooth animations
Mobile-responsive design for on-the-go access


✨ Key Features
For Riders (Vehicle Owners)

Create Rides Easily: Set start and end points using interactive maps or location search
Automatic Route Calculation: Smart routing engine calculates optimal paths using real roads
Flexible Pricing: Set your own ride prices based on distance and demand
Booking Management: View, accept, or reject ride requests from pillion riders
Real-time Notifications: Get notified instantly when someone books your ride
Dashboard Analytics: Track all your active rides and booking requests in one place

For Pillion (Passengers)

Smart Ride Discovery: Find rides with advanced 500-meter proximity matching
Time-based Filtering: Search rides by preferred departure time
Visual Route Preview: See exact routes on map before booking
Instant Booking: Book rides with a single click
Booking Status Tracking: Real-time updates on request status (Pending/Confirmed/Rejected)
Multiple Search Options: Search by location name or click directly on map

Platform Intelligence

500m Proximity Algorithm: Ensures pickup and drop points are within practical walking distance from rider's route
Route Order Validation: Automatically verifies that drop-off comes after pickup along the route
Real-time Map Integration: Live visualization of all routes and available rides
Smart Matching: Filters out incompatible rides to show only relevant options
Geocoding Service: Converts addresses to coordinates and vice versa
Route Optimization: Uses OSRM routing engine for accurate, road-following paths


🏗️ Technical Architecture
Frontend (Angular 17)
The client-side application provides a modern, responsive user interface with:

Component-based Architecture: Modular design with reusable components
Reactive Programming: RxJS for handling asynchronous operations
Route Guards: Secure navigation with authentication checks
Services Layer: Centralized business logic and API communication
TypeScript: Strong typing for robust code quality
Tailwind CSS: Utility-first styling for rapid UI development
Custom Animations: Smooth transitions and visual feedback

Backend (Spring Boot 3.2)
The server-side application handles all business logic:

RESTful API: Clean, well-structured endpoints for all operations
Layered Architecture: Controller → Service → Repository pattern
JPA/Hibernate: Object-relational mapping for database operations
Data Validation: Input validation to ensure data integrity
Error Handling: Comprehensive exception management
CORS Configuration: Secure cross-origin resource sharing

Database (MySQL 8.0)
Relational database storing all application data:

Users: Student accounts with role-based access
Rides: Complete ride information with locations and status
Ride Routes: Detailed route coordinates for proximity matching
Bookings: All ride requests and their current status

External Services

OpenStreetMap: Provides map tiles and geographical data
OSRM (Open Source Routing Machine): Calculates optimal driving routes
Nominatim API: Geocoding service for location search


🎨 User Experience Design
Design Philosophy
The platform follows a dark theme with glassmorphism effects, creating a modern and elegant user experience. Key design elements include:


🔐 Security & Privacy

Password Storage: Secure password handling (ready for BCrypt hashing)
Session Management: User authentication with local storage
Route Protection: Guard-based access control to protected routes
Input Sanitization: Server-side validation of all user inputs
SQL Injection Prevention: Parameterized queries via JPA
CORS Policy: Controlled cross-origin access


🌍 How It Works
The Complete Journey
Creating a Ride (Rider Perspective):

Rider logs in and navigates to "Offer a Ride"
Interactive map loads centered on their location (Bhubaneswar)
Rider searches for start location or clicks directly on map
System places a marker and allows route setting
Rider sets end location using same method
System automatically calculates optimal route using real roads
Blue route line appears on map showing exact path
Rider enters ride details (price, seats, departure time)
System extracts route coordinates and saves to database
Ride becomes visible to all searching pillion riders

Finding a Ride (Pillion Perspective):

Pillion logs in and navigates to "Find a Ride"
Map loads with search interface
Pillion sets pickup location (yellow circle shows 500m search radius)
Pillion sets drop location
Optionally selects preferred departure time
System fetches all active rides from database
Smart algorithm filters rides:

Checks if pickup is within 500m of any ride's route
Checks if drop is within 500m of same ride's route
Validates that drop comes after pickup on the route


Matching rides appear on map with their routes shown
Pillion selects desired ride from list
Books ride with one click

Booking Management:

Booking request created with "PENDING" status
Rider receives notification on dashboard
Rider reviews pickup/drop locations on map
Rider accepts or rejects the request
Pillion receives instant status update
If accepted, both parties can proceed with the ride


🎯 The 500-Meter Proximity Algorithm
Why 500 Meters?
This distance represents a comfortable walking range (approximately 5-7 minutes walk) for students to reach pickup points and walk to their final destination from drop points.
How It Works Mathematically
Step 1: Route Representation

Rider's route is stored as array of coordinates (20-50 points)
Each point represents a location along actual roads

Step 2: Distance Calculation

Uses Haversine formula for accurate distance on Earth's curved surface
Calculates shortest distance from pillion's point to nearest route segment

Step 3: Validation
For each route segment (point A to point B):
  1. Calculate perpendicular distance from pillion's point to line AB
  2. If distance < 500m, point is considered "near route"
  3. Repeat for all segments
  
If pickup near route AND drop near route AND (drop_index > pickup_index):
  Result: VALID MATCH
Else:
  Result: NO MATCH
Step 4: Route Order Check

Find closest route point to pickup
Find closest route point to drop
Verify drop point comes after pickup in route sequence
This ensures pillion doesn't need to backtrack
