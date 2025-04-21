# IRCTC-like Backend System

A scalable backend system for an Indian Railway ticket booking platform built with Node.js, Express.js, and MongoDB.

## Features

- 🧑‍💼 Authentication & Authorization

  - User registration with email, phone, password
  - Login with JWT access & refresh tokens
  - Token refresh mechanism
  - Password hashing (bcrypt)
  - Role-based access: admin, agent, user
  - Middleware for role verification

- 🚆 Train Management

  - Add/Edit/Delete trains (Admin only)
  - Get all trains with filters (source, destination, date, class, time)
  - Train schedule and time slots
  - Train seat availability by class
  - Real-time seat update on booking/cancellation

- 🎟️ Ticket Booking System

  - Book ticket (user only)
  - Cancel ticket (user only)
  - View ticket history
  - Ticket pricing by class and distance
  - PNR generation logic
  - Booking status (confirmed, RAC, waiting)

- 🧑‍🤝‍🧑 User Management

  - User profile view/update
  - Admin: view all users, block/unblock users
  - Agent: create bookings for other users

- 📅 Train Routes & Stations

  - Add/Edit/Delete stations
  - Add/Edit/Delete train routes
  - Route-wise pricing logic
  - Search trains between stations

- 📜 Reports and Logs
  - Booking report (date-wise, user-wise, train-wise)
  - Agent commission tracking
  - Booking and cancellation logs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/irctc-backend.git
cd irctc-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/irctc
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

4. Start the development server:

```bash
npm run dev
```

## API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "user"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Refresh Token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
    "refreshToken": "your_refresh_token"
}
```

### Trains

#### Create Train (Admin only)

```http
POST /api/trains
Authorization: Bearer <token>
Content-Type: application/json

{
    "trainNumber": "12345",
    "trainName": "Test Express",
    "source": "station_id",
    "destination": "station_id",
    "departureTime": "08:00",
    "arrivalTime": "12:00",
    "duration": "4:00",
    "daysOfOperation": ["Monday", "Wednesday", "Friday"],
    "classes": [
        {
            "classType": "SL",
            "totalSeats": 100,
            "farePerKm": 1.5
        }
    ]
}
```

#### Search Trains

```http
GET /api/trains/search?source=station_id&destination=station_id&date=2024-01-01&classType=SL
Authorization: Bearer <token>
```

#### Check Train Availability

```http
GET /api/trains/availability?trainId=train_id&date=2024-01-01&classType=SL
Authorization: Bearer <token>
```

### Bookings

#### Book Ticket

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
    "trainId": "train_id",
    "journeyDate": "2024-01-01",
    "source": "station_id",
    "destination": "station_id",
    "passengers": [
        {
            "name": "Passenger 1",
            "age": 25,
            "gender": "Male",
            "berthPreference": "Lower"
        }
    ],
    "classType": "SL"
}
```

#### Cancel Ticket

```http
POST /api/bookings/cancel/:bookingId
Authorization: Bearer <token>
```

#### Get Booking History

```http
GET /api/bookings/history?status=Booked&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Booking by PNR

```http
GET /api/bookings/pnr/:pnr
Authorization: Bearer <token>
```

### Users

#### Get Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
}
```

#### Change Password

```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
    "currentPassword": "old_password",
    "newPassword": "new_password"
}
```

## Testing

Run tests using:

```bash
npm test
```

## Project Structure

```
src/
├── app.js                 # Main application file
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/              # Mongoose models
├── routes/              # API routes
└── tests/               # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
