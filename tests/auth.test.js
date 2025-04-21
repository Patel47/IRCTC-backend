const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Authentication API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        password: "password123",
        role: "user",
      };

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
    });

    it("should not register user with existing email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        password: "password123",
      };

      // Create existing user
      await User.create(userData);

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should validate required fields", async () => {
      const userData = {
        name: "",
        email: "invalid-email",
        phone: "123",
        password: "123",
      };

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        password: "password123",
      });
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const res = await request(app).post("/api/auth/login").send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
    });

    it("should not login with invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const res = await request(app).post("/api/auth/login").send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should validate required fields", async () => {
      const loginData = {
        email: "",
        password: "",
      };

      const res = await request(app).post("/api/auth/login").send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should refresh token with valid refresh token", async () => {
      // First register a user
      const userData = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        password: "password123",
      };

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(userData);

      const refreshToken = registerRes.body.refreshToken;

      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it("should not refresh token with invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalid-token" });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
