const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Train = require("../src/models/Train");
const Station = require("../src/models/Station");
const User = require("../src/models/User");

describe("Train API", () => {
  let adminToken;
  let userToken;
  let sourceStation;
  let destinationStation;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      phone: "1234567890",
      password: "password123",
      role: "admin",
    });

    // Create regular user
    const user = await User.create({
      name: "Regular User",
      email: "user@example.com",
      phone: "0987654321",
      password: "password123",
      role: "user",
    });

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
    await Train.deleteMany({});
  });

  describe("POST /api/trains", () => {
    it("should create a new train (admin only)", async () => {
      const trainData = {
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
          {
            classType: "3A",
            totalSeats: 50,
            farePerKm: 2.5,
          },
        ],
      };

      const res = await request(app)
        .post("/api/trains")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(trainData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trainNumber).toBe(trainData.trainNumber);
    });

    it("should not allow regular users to create trains", async () => {
      const trainData = {
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
      };

      const res = await request(app)
        .post("/api/trains")
        .set("Authorization", `Bearer ${userToken}`)
        .send(trainData);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("GET /api/trains/search", () => {
    beforeEach(async () => {
      await Train.create({
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
    });

    it("should search trains between stations", async () => {
      const res = await request(app)
        .get("/api/trains/search")
        .set("Authorization", `Bearer ${userToken}`)
        .query({
          source: sourceStation._id,
          destination: destinationStation._id,
          date: "2024-01-01",
          classType: "SL",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it("should validate required query parameters", async () => {
      const res = await request(app)
        .get("/api/trains/search")
        .set("Authorization", `Bearer ${userToken}`)
        .query({
          source: "invalid-id",
          destination: destinationStation._id,
          date: "invalid-date",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("GET /api/trains/availability", () => {
    let train;

    beforeEach(async () => {
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
    });

    it("should check train availability", async () => {
      const res = await request(app)
        .get("/api/trains/availability")
        .set("Authorization", `Bearer ${userToken}`)
        .query({
          trainId: train._id,
          date: "2024-01-01",
          classType: "SL",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSeats).toBe(100);
      expect(res.body.data.availableSeats).toBeDefined();
    });

    it("should return 404 for non-existent train", async () => {
      const res = await request(app)
        .get("/api/trains/availability")
        .set("Authorization", `Bearer ${userToken}`)
        .query({
          trainId: new mongoose.Types.ObjectId(),
          date: "2024-01-01",
          classType: "SL",
        });

      expect(res.statusCode).toBe(404);
    });
  });
});
