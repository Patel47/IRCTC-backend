# IRCTC Backend API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Trains](#trains)
3. [Bookings](#bookings)
4. [Users](#users)
5. [Stations](#stations)

## Authentication

### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "user"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Refresh Token

```http
POST /api/auth/refresh-token
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Trains

### Create Train (Admin Only)

```http
POST /api/trains
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "trainNumber": "12345",
  "trainName": "Test Express",
  "source": "507f1f77bcf86cd799439011",
  "destination": "507f1f77bcf86cd799439012",
  "departureTime": "08:00",
  "arrivalTime": "12:00",
  "duration": "4:00",
  "daysOfOperation": ["Monday", "Wednesday", "Friday"],
  "classes": [
    {
      "classType": "SL",
      "totalSeats": 100,
      "farePerKm": 1.5
    },
    {
      "classType": "3A",
      "totalSeats": 50,
      "farePerKm": 2.5
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "trainNumber": "12345",
    "trainName": "Test Express",
    "source": {
      "id": "507f1f77bcf86cd799439011",
      "stationCode": "DEL",
      "stationName": "New Delhi Railway Station"
    },
    "destination": {
      "id": "507f1f77bcf86cd799439012",
      "stationCode": "CSTM",
      "stationName": "Chhatrapati Shivaji Maharaj Terminus"
    },
    "departureTime": "08:00",
    "arrivalTime": "12:00",
    "duration": "4:00",
    "daysOfOperation": ["Monday", "Wednesday", "Friday"],
    "classes": [
      {
        "classType": "SL",
        "totalSeats": 100,
        "farePerKm": 1.5
      },
      {
        "classType": "3A",
        "totalSeats": 50,
        "farePerKm": 2.5
      }
    ]
  }
}
```

### Search Trains

```http
GET /api/trains/search?source=507f1f77bcf86cd799439011&destination=507f1f77bcf86cd799439012&date=2024-01-01&classType=SL
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "trainNumber": "12345",
      "trainName": "Test Express",
      "source": {
        "stationCode": "DEL",
        "stationName": "New Delhi Railway Station"
      },
      "destination": {
        "stationCode": "CSTM",
        "stationName": "Chhatrapati Shivaji Maharaj Terminus"
      },
      "departureTime": "08:00",
      "arrivalTime": "12:00",
      "duration": "4:00"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

### Check Train Availability

```http
GET /api/trains/availability?trainId=507f1f77bcf86cd799439013&date=2024-01-01&classType=SL
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalSeats": 100,
    "availableSeats": 80,
    "racSeats": 10,
    "waitingList": 10
  }
}
```

## Bookings

### Book Ticket

```http
POST /api/bookings
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "trainId": "507f1f77bcf86cd799439013",
  "journeyDate": "2024-01-01",
  "source": "507f1f77bcf86cd799439011",
  "destination": "507f1f77bcf86cd799439012",
  "passengers": [
    {
      "name": "Passenger 1",
      "age": 25,
      "gender": "Male",
      "berthPreference": "Lower"
    },
    {
      "name": "Passenger 2",
      "age": 30,
      "gender": "Female",
      "berthPreference": "Upper"
    }
  ],
  "classType": "SL"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "pnr": "123456",
    "train": {
      "trainNumber": "12345",
      "trainName": "Test Express"
    },
    "journeyDate": "2024-01-01",
    "source": {
      "stationCode": "DEL",
      "stationName": "New Delhi Railway Station"
    },
    "destination": {
      "stationCode": "CSTM",
      "stationName": "Chhatrapati Shivaji Maharaj Terminus"
    },
    "passengers": [
      {
        "name": "Passenger 1",
        "age": 25,
        "gender": "Male",
        "berthPreference": "Lower"
      },
      {
        "name": "Passenger 2",
        "age": 30,
        "gender": "Female",
        "berthPreference": "Upper"
      }
    ],
    "class": "SL",
    "totalFare": 1500,
    "status": "Confirmed",
    "bookingStatus": "Booked",
    "paymentStatus": "Completed"
  }
}
```

### Cancel Ticket

```http
POST /api/bookings/cancel/507f1f77bcf86cd799439014
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Ticket cancelled successfully",
  "data": {
    "refundAmount": 750,
    "cancellationDate": "2024-01-01T10:00:00.000Z"
  }
}
```

### Get Booking History

```http
GET /api/bookings/history?status=Booked&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "pnr": "123456",
      "train": {
        "trainNumber": "12345",
        "trainName": "Test Express"
      },
      "journeyDate": "2024-01-01",
      "source": {
        "stationCode": "DEL",
        "stationName": "New Delhi Railway Station"
      },
      "destination": {
        "stationCode": "CSTM",
        "stationName": "Chhatrapati Shivaji Maharaj Terminus"
      },
      "class": "SL",
      "totalFare": 1500,
      "status": "Confirmed",
      "bookingStatus": "Booked",
      "paymentStatus": "Completed"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

### Get Booking by PNR

```http
GET /api/bookings/pnr/123456
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "pnr": "123456",
    "train": {
      "trainNumber": "12345",
      "trainName": "Test Express"
    },
    "journeyDate": "2024-01-01",
    "source": {
      "stationCode": "DEL",
      "stationName": "New Delhi Railway Station"
    },
    "destination": {
      "stationCode": "CSTM",
      "stationName": "Chhatrapati Shivaji Maharaj Terminus"
    },
    "passengers": [
      {
        "name": "Passenger 1",
        "age": 25,
        "gender": "Male",
        "berthPreference": "Lower"
      },
      {
        "name": "Passenger 2",
        "age": 30,
        "gender": "Female",
        "berthPreference": "Upper"
      }
    ],
    "class": "SL",
    "totalFare": 1500,
    "status": "Confirmed",
    "bookingStatus": "Booked",
    "paymentStatus": "Completed"
  }
}
```

## Users

### Get Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  }
}
```

### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "9876543210"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "9876543210",
    "role": "user"
  }
}
```

### Change Password

```http
PUT /api/users/change-password
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Stations

### Create Station (Admin Only)

```http
POST /api/stations
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "stationCode": "DEL",
  "stationName": "New Delhi Railway Station",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110002"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "stationCode": "DEL",
    "stationName": "New Delhi Railway Station",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110002",
    "isActive": true
  }
}
```

### Get All Stations

```http
GET /api/stations
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "stationCode": "DEL",
      "stationName": "New Delhi Railway Station",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110002",
      "isActive": true
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "stationCode": "CSTM",
      "stationName": "Chhatrapati Shivaji Maharaj Terminus",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "isActive": true
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "pages": 1
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access forbidden"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Something went wrong!",
  "error": "Error message" // Only in development environment
}
```
