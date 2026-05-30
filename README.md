<div align="center">

<br/>

```
██████╗ ██╗██████╗ ███████╗███████╗██╗  ██╗ █████╗ ██████╗ ███████╗
██╔══██╗██║██╔══██╗██╔════╝██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝
██████╔╝██║██║  ██║█████╗  ███████╗███████║███████║██████╔╝█████╗
██╔══██╗██║██║  ██║██╔══╝  ╚════██║██╔══██║██╔══██║██╔══██╗██╔══╝
██║  ██║██║██████╔╝███████╗███████║██║  ██║██║  ██║██║  ██║███████╗
╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
```

**Campus carpooling — engineered from scratch.**

<br/>

[![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/)
[![MySQL](https://img.shields.io/badge/MySQL_8.0-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://openstreetmap.org/)

<br/>

> Riders set routes. Pillions find them. A **500-metre proximity algorithm** decides if it's a match.
> No paid APIs. No vendor lock-in. Zero cloud bill.

<br/>

</div>

---

## The Problem

Students in the same city commuting to the same campus in separate vehicles — not because they didn't want to share, but because there was no trustworthy, purpose-built way to coordinate it. High daily transport costs, unreliable public transit, and zero visibility into who's travelling which route.

## The Solution

A full-stack web platform where **Riders** (vehicle owners) publish routes with real road-following paths, and **Pillions** (passengers) search by their actual pickup and drop points. The backend runs a spatial algorithm that checks whether a pillion's location falls within 500 metres of a rider's stored route — in the correct direction of travel.

---

## Screens

### 01 — Login

![Login](/01-login.gif)

*Glassmorphism card over `#0f1117` dark base. Sky-blue `#38bdf8` → indigo `#818cf8` gradient wordmark. Email/password fields animate active state. Sign In button fades in after interaction.*

---

### 02 — Register & Role Selection

![Register](/02-register.gif)

*Two-step form. First/last name, email, password — then a role picker: Rider (vehicle owner) or Pillion (passenger). Active card lights with a `#38bdf8` border and glow. Inactive stays in muted glass. Role drives the entire backend permission model.*

---

### 03 — Offer a Ride

![Offer Ride](/03-offer-ride.gif)

*Left panel: start/end location search (Nominatim geocoding), price, seats, departure time, vehicle. Right panel: Leaflet/OSM dark map. As soon as both endpoints are set, OSRM calculates the road-following route and the blue polyline **draws itself onto the map**. On submit, 20–50 waypoints are extracted from the geometry and saved row-by-row into `ride_routes` — the backbone of the proximity engine.*

---

### 04 — Find a Ride

![Find Ride](/04-find-ride.gif)

*The core feature. Pillion sets pickup and drop on the map. Yellow `#eab308` dashed circles pulse at both points showing the 500-metre search zones. The Haversine + point-to-segment algorithm runs server-side: rides where **both** points fall within 500m of the stored route — in order — appear in the sidebar. Three matched rides shown with price, seats, departure time, and a one-tap Book Now.*

---

### 05 — Rider Dashboard

![Dashboard](/05-dashboard.gif)

*Stats row: Active Rides · Confirmed · Pending · Earnings — each tile colour-coded to its domain colour. Active ride cards below, each with departure info, seat count, and a direct link to its booking queue.*

---

### 06 — Booking Management

![Booking Management](/06-booking-mgmt.gif)

*Rider sees every pillion's pickup and drop plotted as coloured zone-rings on the live map — PENDING in amber, CONFIRMED in green. One-click Accept flashes the card green and transitions status. Reject dims it red. Both update the `bookings` table via `PUT /api/bookings/{id}/status`.*

---

### 07 — Pillion Booking History

![Booking History](/07-booking-history.gif)

*All three states in one view: green CONFIRMED, amber PENDING, red-muted REJECTED. Each card shows rider name, full route, departure time, price, and pickup point. Summary pills at the top count each state.*

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Angular 17 SPA  (Browser)                        │
│                                                                     │
│  AuthGuard  ──►  Route Protection for all private pages             │
│  RxJS Streams ─►  Async map events, booking status polling          │
│  Leaflet.js ──►  Interactive map: click-to-set, route polyline      │
│                                                                     │
│  /login         /register       /offer-ride      /find-ride         │
│  /dashboard     /booking-management/{id}         /my-bookings       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTP REST  (JSON)
                           │  Content-Type: application/json
┌──────────────────────────▼──────────────────────────────────────────┐
│              Spring Boot 3.2  ·  sidecar-backend                    │
│                                                                     │
│  RideController      →  /api/rides/**                               │
│  UserController      →  /api/users/register  /api/users/login       │
│  BookingController   →  /api/bookings/**                            │
│                                                                     │
│  RideService         ←─  Proximity match engine lives here          │
│  UserService         ←─  Auth logic                                 │
│  BookingService      ←─  PENDING → CONFIRMED / REJECTED lifecycle   │
│                                                                     │
│  JPA / Hibernate ORM  ·  CorsConfig  ·  application.properties      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  JDBC
┌──────────────────────────▼──────────────────────────────────────────┐
│                      MySQL 8.0                                      │
│   users  ┄  rides  ┄  ride_routes  ┄  bookings                     │
└─────────────────────────────────────────────────────────────────────┘

External APIs (zero cost, no key required)
  Nominatim  →  address ↔ lat/lng geocoding
  OSRM       →  road-accurate route + ordered waypoints
  OSM Tiles  →  Leaflet map tile rendering
```

---

## Project Structure

```
RideShare/
│
├── sidecar-backend/
│   └── src/main/java/com/rideshare/
│       ├── controller/
│       │   ├── RideController.java        POST /api/rides, GET /api/rides/**
│       │   ├── UserController.java        POST /api/users/register + /login
│       │   └── BookingController.java     POST/GET/PUT /api/bookings/**
│       │
│       ├── service/
│       │   ├── RideService.java           Proximity algorithm, OSRM integration
│       │   ├── UserService.java           Authentication logic
│       │   └── BookingService.java        Request lifecycle management
│       │
│       ├── repository/
│       │   ├── RideRepository.java
│       │   ├── UserRepository.java
│       │   └── BookingRepository.java
│       │
│       ├── model/
│       │   ├── Ride.java                  id · riderId · start/end location · lat/lng
│       │   │                              price · seatsAvailable · departureTime · status
│       │   ├── User.java                  id · name · email · password · role (RIDER|PILLION)
│       │   ├── RideRoute.java             id · rideId · latitude · longitude · seqOrder
│       │   └── Booking.java               id · rideId · pillionId · pickup/dropLat/Lng · status
│       │
│       ├── config/
│       │   └── CorsConfig.java            Allows localhost:4200 during development
│       │
│       └── resources/
│           └── application.properties     DB URL · JPA ddl-auto=update · server.port=8080
│
└── student-rideshare-frontend/
    └── src/app/
        ├── components/
        │   ├── login/                     Reactive form, calls AuthService.login()
        │   ├── register/                  Role picker + form, calls AuthService.register()
        │   ├── offer-ride/                Leaflet map, Nominatim search, OSRM route,
        │   │                              extracts waypoints → POST /api/rides
        │   ├── find-ride/                 Map with 500m circles, calls POST /api/rides/search
        │   ├── dashboard/                 Lists rider's rides, links to booking mgmt
        │   └── booking-management/        Accept/reject per booking, map shows pickup/drop
        │
        ├── services/
        │   ├── auth.service.ts            Login state · localStorage · currentUser$
        │   ├── ride.service.ts            CRUD + /search endpoint calls
        │   └── booking.service.ts         Create, fetch, update status
        │
        ├── guards/
        │   └── auth.guard.ts              Blocks unauthenticated access to all app routes
        │
        └── models/
            ├── ride.model.ts              Matches Ride.java fields exactly
            ├── user.model.ts              Matches User.java fields exactly
            └── booking.model.ts           Matches Booking.java fields exactly
```

---

## The 500-Metre Proximity Algorithm

This is the piece that makes it actually useful. Not a bounding-box check, not straight-line distance from endpoints — proper geometric proximity against every segment of a stored road-following path.

```
STEP 1 — HAVERSINE FORMULA  (great-circle distance)
─────────────────────────────────────────────────────
a = sin²(Δlat/2) + cos(lat₁)·cos(lat₂)·sin²(Δlng/2)
c = 2 · atan2(√a, √(1−a))
d = 6,371,000 · c          ← metres on Earth's surface


STEP 2 — POINT-TO-SEGMENT DISTANCE
─────────────────────────────────────
For pillion point P against route segment A→B:

  t       = clamp( dot(AP, AB) / |AB|² ,  0, 1 )
  closest = A + t·(B−A)           ← nearest point on segment
  dist    = haversine(P, closest)

  if dist ≤ 500 m  →  P is "on this segment of the route"


STEP 3 — FULL MATCH DECISION
──────────────────────────────
Inputs:
  rideRoute[]   = 20–50 ordered [lat,lng] from ride_routes table
  pillionPickup = [lat, lng]
  pillionDrop   = [lat, lng]

For each segment i:
  if dist(pillionPickup, segment_i) ≤ 500m  →  pickupIndex = i

For each segment j:
  if dist(pillionDrop, segment_j) ≤ 500m    →  dropIndex = j

MATCH = (pickupIndex ≠ null)
      AND (dropIndex ≠ null)
      AND (dropIndex > pickupIndex)    ← no backtracking along the route
```

**Why the order check matters:** without `dropIndex > pickupIndex`, a pillion whose drop point happens to be near an earlier part of the route than their pickup would still "match" — but they'd be riding backwards. The order check eliminates that entirely.

**Why 500 metres:** approximately a 6–7 minute walk. Comfortable for students carrying bags, precise enough to not surface irrelevant rides. Configurable in `RideService.java`.

---

## Database Schema

```sql
-- Four tables. Clean, normalized, fully relational.

CREATE TABLE users (
  id       BIGINT        PRIMARY KEY AUTO_INCREMENT,
  name     VARCHAR(100)  NOT NULL,
  email    VARCHAR(150)  UNIQUE NOT NULL,
  password VARCHAR(255)  NOT NULL,
  role     ENUM('RIDER','PILLION') NOT NULL
);

CREATE TABLE rides (
  id              BIGINT        PRIMARY KEY AUTO_INCREMENT,
  rider_id        BIGINT        REFERENCES users(id),
  start_location  VARCHAR(255)  NOT NULL,
  end_location    VARCHAR(255)  NOT NULL,
  start_lat       DOUBLE        NOT NULL,
  start_lng       DOUBLE        NOT NULL,
  end_lat         DOUBLE        NOT NULL,
  end_lng         DOUBLE        NOT NULL,
  price           DECIMAL(8,2)  NOT NULL,
  seats_available INT           NOT NULL,
  departure_time  DATETIME      NOT NULL,
  status          ENUM('ACTIVE','COMPLETED','CANCELLED') DEFAULT 'ACTIVE'
);

-- This table is the spatial index. Without it, proximity matching is impossible.
CREATE TABLE ride_routes (
  id        BIGINT  PRIMARY KEY AUTO_INCREMENT,
  ride_id   BIGINT  REFERENCES rides(id),
  latitude  DOUBLE  NOT NULL,
  longitude DOUBLE  NOT NULL,
  seq_order INT     NOT NULL    -- direction matters: 0 = start, N = end
);

CREATE TABLE bookings (
  id         BIGINT     PRIMARY KEY AUTO_INCREMENT,
  ride_id    BIGINT     REFERENCES rides(id),
  pillion_id BIGINT     REFERENCES users(id),
  pickup_lat DOUBLE,
  pickup_lng DOUBLE,
  drop_lat   DOUBLE,
  drop_lng   DOUBLE,
  status     ENUM('PENDING','CONFIRMED','REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);
```

---

## REST API

### Authentication

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| `POST` | `/api/users/register` | `{ name, email, password, role }` | User object |
| `POST` | `/api/users/login` | `{ email, password }` | User object |

### Rides

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rides` | Create ride + persist waypoints to `ride_routes` |
| `GET` | `/api/rides` | All active rides |
| `GET` | `/api/rides/{id}` | Single ride with full route |
| `GET` | `/api/rides/rider/{riderId}` | Rider's own rides (dashboard) |
| `POST` | `/api/rides/search` | **Proximity search** — runs the matching algorithm |

**Search request body:**
```json
{
  "pickupLat":     20.2961,
  "pickupLng":     85.8245,
  "dropLat":       20.3398,
  "dropLng":       85.8041,
  "departureTime": "2024-03-15T09:00:00"
}
```

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Create booking (status: PENDING) |
| `GET` | `/api/bookings/ride/{rideId}` | All bookings on a ride (rider view) |
| `GET` | `/api/bookings/pillion/{userId}` | Pillion's booking history |
| `PUT` | `/api/bookings/{id}/status` | Rider sets CONFIRMED or REJECTED |

---

## End-to-End Flow

**Rider publishes a ride:**

```
1.  Leaflet map loads centred on Bhubaneswar
2.  Rider searches start location
      GET nominatim.openstreetmap.org/search?q=Baramunda+Bus+Stand
      ← [{ lat, lon, display_name }]
      → Green pin placed on map
3.  Rider searches end location (same flow) → Red pin
4.  OSRM calculates road route
      GET router.project-osrm.org/route/v1/driving/{lng,lat};{lng,lat}?geometries=geojson
      ← { routes: [{ geometry: { coordinates: [[lng,lat], …] } }] }
      → Blue polyline drawn on map
5.  Rider fills price, seats, departure time, vehicle
6.  POST /api/rides  { …fields, routeCoordinates: [[lat,lng], …] }
7.  Spring Boot: INSERT rides row + INSERT ride_routes row per waypoint
8.  Ride is live — discoverable by all searching pillions
```

**Pillion finds and books:**

```
1.  Pillion opens Find a Ride
2.  Sets pickup → yellow 500m ring drawn on map
3.  Sets drop → indigo 500m ring drawn on map
4.  POST /api/rides/search  { pickupLat, pickupLng, dropLat, dropLng, departureTime }
5.  Backend iterates every active ride's ride_routes:
      → haversine segment check for pickup (≤500m?)
      → haversine segment check for drop (≤500m?)
      → seq_order validation (drop after pickup?)
6.  Matched rides returned, shown as cards + route lines on map
7.  Pillion taps Book Now
8.  POST /api/bookings  { rideId, pickupLat, pickupLng, dropLat, dropLng }
9.  Booking created with status PENDING
10. Rider sees it on dashboard → accepts → PUT /api/bookings/{id}/status { status: CONFIRMED }
11. Pillion sees CONFIRMED in booking history
```

---

## Tech Stack

| Layer | Choice | Why this and not the alternative |
|-------|--------|----------------------------------|
| Frontend | Angular 17 | Strong DI, route guards, RxJS for async map events — not React's free-for-all |
| Language | TypeScript | Type safety across service→component→template boundaries |
| Styling | Tailwind CSS | Utility-first, no specificity wars, dark glassmorphism without custom CSS |
| Maps | Leaflet.js + OSM | Zero cost, full control, no API key, no rate limits |
| Routing | OSRM | Open-source, road-accurate geometry, no rate limits mid-demo |
| Geocoding | Nominatim | Free address↔coordinate lookup, no key needed |
| Backend | Spring Boot 3.2 | Auto-configuration, JPA integration, clean layered structure |
| ORM | Hibernate via JPA | No raw SQL except `@Query` where needed; FK constraints enforced |
| Database | MySQL 8.0 | Relational — ordered waypoints in `ride_routes` need FK + `seq_order` |
| Java | 17 (LTS) | Records, text blocks, long-term support |

---

## Local Setup

### Prerequisites

- Java 17+
- Node 18+ and npm
- MySQL 8.0 running locally

### Backend

```bash
cd sidecar-backend

# Create the database
mysql -u root -p -e "CREATE DATABASE rideshare_db;"

# Set your credentials in:
# src/main/resources/application.properties
#   spring.datasource.url=jdbc:mysql://localhost:3306/rideshare_db
#   spring.datasource.username=root
#   spring.datasource.password=YOUR_PASSWORD
#   spring.jpa.hibernate.ddl-auto=update

./mvnw spring-boot:run
# Runs on http://localhost:8080
# Tables are auto-created on first run
```

### Frontend

```bash
cd student-rideshare-frontend

npm install

ng serve
# App at http://localhost:4200
```

---

## Design System

| Token | Value | Used for |
|-------|-------|----------|
| `--bg` | `#0f1117` | Page background |
| `--bg2` | `#0a0d14` | Sidebar / panel background |
| `--blue` | `#38bdf8` | Primary accent, active nav, CTA buttons |
| `--indigo` | `#818cf8` | Secondary accent, Pillion role, drop zones |
| `--green` | `#22c55e` | CONFIRMED state, start pins, Rider role |
| `--red` | `#f43f5e` | REJECTED state, end pins |
| `--amber` | `#eab308` | PENDING state, pickup zones |
| Glass card | `rgba(255,255,255,0.05)` + `rgba(255,255,255,0.08)` border | All cards |
| Map bg | `#161f2e` (Leaflet dark tiles) | Map panel |
| Route line | `#38bdf8` + glow at `rgba(56,189,248,0.25)` | OSRM polyline |

---

## Architecture Decisions

**Why store route waypoints in a separate table?**
A single start/end lat/lng pair is useless for proximity matching anywhere mid-route. The `ride_routes` table holds 20–50 intermediate points from OSRM's geometry, each with a `seq_order` that preserves direction. The segment-distance loop runs over these. Without them, the entire matching concept breaks.

**Why OSRM instead of Google Maps Directions API?**
Zero cost, open-source, self-hostable, returns identical road-following GeoJSON geometry. For a project demoing at any time, a surprise rate-limit or billing pause is unacceptable.

**Why MySQL instead of MongoDB?**
The data is inherently relational: a booking belongs to a ride, a ride belongs to a user, route waypoints belong to a ride in strict order. Foreign keys, `seq_order` integrity, and JOIN queries are the right tool. Document nesting can't express ordered waypoints cleanly.

**Why Angular instead of React?**
Angular's built-in DI system means `AuthService`, `RideService`, and `BookingService` are injectable singletons with clean boundaries. Route guards (`auth.guard.ts`) are a first-class Angular concept — one line of configuration per protected route. The opinionated structure also made the layered backend architecture (Controller→Service→Repository) feel natural to mirror on the frontend.

---

## What's Next

- **WebSocket notifications** — STOMP over SockJS to push booking status changes in real time instead of requiring manual refresh
- **BCrypt password hashing** — the hook is already in `UserService.java`, needs one dependency and one method call
- **In-app messaging** per booking — enough for coordinate coordination without exchanging phone numbers
- **Ride ratings** — post-trip, mutual ratings build platform trust over time
- **Admin panel** — view aggregate routes, identify high-demand corridors, flag users
- **Firebase push notifications** — mobile booking alerts
- **Docker Compose** — single-command local setup across backend, frontend, and MySQL

---

## Language Breakdown

```
TypeScript  ████████████████████░░░░░  37.9%   Angular components, services, models
HTML        ███████████████████░░░░░░  36.7%   Angular templates
Java        █████████░░░░░░░░░░░░░░░░  18.6%   Spring Boot backend
CSS         ███░░░░░░░░░░░░░░░░░░░░░░   6.7%   Tailwind overrides, global styles
JavaScript  ░░░░░░░░░░░░░░░░░░░░░░░░░   0.1%   Config files only
```

---

<div align="center">

*Built with obsessive attention to the routing math, the booking state machine, and every map interaction.*

**Angular 17 · Spring Boot 3.2 · MySQL 8 · Leaflet · OpenStreetMap · OSRM · Nominatim · TypeScript · Java 17**

</div>
