const mongoose = require("mongoose");

const connectDB = require("../../config/db");

describe("config/db.js", () => {
  const originalExit = process.exit;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URI = "mongodb://localhost:27017/test";
    process.exit = jest.fn();
  });

  afterEach(() => {
    process.exit = originalExit;
    jest.restoreAllMocks();
  });

  test("should connect to MongoDB successfully", async () => {
    jest.spyOn(mongoose, "connect").mockResolvedValue();
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/test");
    expect(consoleSpy).toHaveBeenCalledWith("✅ MongoDB Connected");
  });

  test("should exit process on connection failure", async () => {
    jest.spyOn(mongoose, "connect").mockRejectedValue(new Error("Connection refused"));
    jest.spyOn(console, "error").mockImplementation();

    await connectDB();

    expect(console.error).toHaveBeenCalledWith("❌ MongoDB Connection Failed");
    expect(console.error).toHaveBeenCalledWith("Connection refused");
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
