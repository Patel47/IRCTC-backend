const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Booking = require("../src/models/Booking");
const Train = require("../src/models/Train");
const Station = require("../src/models/Station");
const User = require("../src/models/User");

describe("Booking API", () => {
  let userToken;
  let adminToken;
  let train;
  let sourceStation;
  let destinationStation;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create stations
    sourceStation = await Station.create({
      stationCode: "SRC",
      stationName: "Source Station",
      city: "Source City",
      state: "Source State",
      pincode: "123456",
    });

    destinationStation = await Station.create({
      stationCode: "DST",
      stationName: "Destination Station",
      city: "Destination City",
      state: "Destination State",
      pincode: "654321",
    });

    // Create train
    train = await Train.create({
      trainNumber: "12345",
      trainName: "Test Express",
      source: sourceStation._id,
      destination: destinationStation._id,
      departureTime: "08:00",
      arrivalTime: "12:00",
      duration: "4:00",
      daysOfOperation: ["Monday", "Wednesday", "Friday"],
      classes: [
        {
          classType: "SL",
          totalSeats: 100,
          farePerKm: 1.5,
        },
      ],
    });

    // Create users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      phone: "1234567890",
      password: "password123",
      role: "admin",
    });

    const user = await User.create({
      name: "Regular User",
      email: "user@example.com",
      phone: "0987654321",
      password: "password123",
      role: "user",
    });

    // Login to get tokens
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "password123" });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
  });

  describe("POST /api/bookings", () => {
    it("should book a ticket", async () => {
      const bookingData = {
        trainId: train._id,
        journeyDate: "2024-01-01",
        source: sourceStation._id,
        destination: destinationStation._id,
        passengers: [
          {
            name: "Passenger 1",
            age: 25,
            gender: "Male",
            berthPreference: "Lower",
          },
        ],
        classType: "SL",
      };

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pnr).toBeDefined();
      expect(res.body.data.status).toBe("Confirmed");
    });

    it("should validate booking data", async () => {
      const bookingData = {
        trainId: "invalid-id",
        journeyDate: "invalid-date",
        source: sourceStation._id,
        destination: destinationStation._id,
        passengers: [],
        classType: "Invalid",
      };

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("POST /api/bookings/cancel/:bookingId", () => {
    let booking;

    beforeEach(async () => {
      booking = await Booking.create({
        user: (await User.findOne({ email: "user@example.com" }))._id,
        train: train._id,
        journeyDate: new Date("2024-01-01"),
        source: sourceStation._id,
        destination: destinationStation._id,
        passengers: [
          {
            name: "Passenger 1",
            age: 25,
            gender: "Male",
          },
        ],
        class: "SL",
        totalFare: 150,
        status: "Confirmed",
        bookingStatus: "Booked",
        paymentStatus: "Completed",
      });
    });

    it("should cancel a booking", async () => {
      const res = await request(app)
        .post(`/api/bookings/cancel/${booking._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.refundAmount).toBeDefined();
    });

    it("should not allow cancellation less than 4 hours before journey", async () => {
      // Update journey date to less than 4 hours from now
      booking.journeyDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
      await booking.save();

      const res = await request(app)
        .post(`/api/bookings/cancel/${booking._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/bookings/history", () => {
    beforeEach(async () => {
      const userId = (await User.findOne({ email: "user@example.com" }))._id;
      await Booking.create([
        {
          user: userId,
          train: train._id,
          journeyDate: new Date("2024-01-01"),
          source: sourceStation._id,
          destination: destinationStation._id,
          passengers: [{ name: "Passenger 1", age: 25, gender: "Male" }],
          class: "SL",
          totalFare: 150,
          status: "Confirmed",
          bookingStatus: "Booked",
          paymentStatus: "Completed",
        },
        {
          user: userId,
          train: train._id,
          journeyDate: new Date("2024-01-02"),
          source: sourceStation._id,
          destination: destinationStation._id,
          passengers: [{ name: "Passenger 2", age: 30, gender: "Female" }],
          class: "SL",
          totalFare: 150,
          status: "Confirmed",
          bookingStatus: "Cancelled",
          paymentStatus: "Refunded",
        },
      ]);
    });

    it("should get booking history", async () => {
      const res = await request(app)
        .get("/api/bookings/history")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it("should filter booking history by status", async () => {
      const res = await request(app)
        .get("/api/bookings/history?status=Cancelled")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].bookingStatus).toBe("Cancelled");
    });
  });

  describe("GET /api/bookings/pnr/:pnr", () => {
    let booking;

    beforeEach(async () => {
      booking = await Booking.create({
        user: (await User.findOne({ email: "user@example.com" }))._id,
        train: train._id,
        journeyDate: new Date("2024-01-01"),
        source: sourceStation._id,
        destination: destinationStation._id,
        passengers: [
          {
            name: "Passenger 1",
            age: 25,
            gender: "Male",
          },
        ],
        class: "SL",
        totalFare: 150,
        status: "Confirmed",
        bookingStatus: "Booked",
        paymentStatus: "Completed",
      });
    });

    it("should get booking by PNR", async () => {
      const res = await request(app)
        .get(`/api/bookings/pnr/${booking.pnr}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pnr).toBe(booking.pnr);
    });

    it("should not allow unauthorized access to booking", async () => {
      // Create another user
      const anotherUser = await User.create({
        name: "Another User",
        email: "another@example.com",
        phone: "1111111111",
        password: "password123",
        role: "user",
      });

      const anotherUserLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "another@example.com", password: "password123" });

      const res = await request(app)
        .get(`/api/bookings/pnr/${booking.pnr}`)
        .set("Authorization", `Bearer ${anotherUserLogin.body.token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
