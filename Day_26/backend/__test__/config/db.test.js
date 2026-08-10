const mongoose = require("mongoose");

jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

const connectDB = require("../../config/db");

describe("Database Connection", () => {
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test("connects to MongoDB successfully", async () => {
    mongoose.connect.mockResolvedValue({});

    process.env.MONGO_URI = "mongodb://localhost:27017/test";

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/test",
    );

    expect(logSpy).toHaveBeenCalledWith("✅ MongoDB Connected");
  });

  test("handles MongoDB connection failure", async () => {
    const dbError = new Error("Database connection failed");

    mongoose.connect.mockRejectedValue(dbError);

    process.env.MONGO_URI = "mongodb://localhost:27017/test";

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/test",
    );

    expect(errorSpy).toHaveBeenCalledWith("❌ MongoDB Connection Failed");

    expect(errorSpy).toHaveBeenCalledWith("Database connection failed");

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
