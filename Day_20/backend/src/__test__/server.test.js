// We mock the entire app module first to control app.listen behavior
jest.mock("../app", () => {
  const express = require("express");
  const mockApp = express();
  jest.spyOn(mockApp, "listen").mockImplementation((port, cb) => {
    if (cb) cb();
    return { close: jest.fn() };
  });
  return mockApp;
});

const app = require("../app");
const connectDB = require("../config/db");

// We mock the connectDB module
jest.mock("../config/db", () => jest.fn().mockResolvedValue());

describe("server.js", () => {
  const originalLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    process.env.PORT = "4000";
  });

  afterEach(() => {
    console.log = originalLog;
  });

  test("should start the server and connect to DB", async () => {
    jest.isolateModules(() => {
      require("../server");
    });

    // Wait for the async connection/start to trigger
    await new Promise((r) => setTimeout(r, 100));

    expect(connectDB).toHaveBeenCalled();
  });

  test("should use PORT from env", async () => {
    process.env.PORT = "9000";

    jest.isolateModules(() => {
      require("../server");
    });

    await new Promise((r) => setTimeout(r, 100));

    expect(app.listen).toHaveBeenCalledWith("9000", expect.any(Function));
  });
});
