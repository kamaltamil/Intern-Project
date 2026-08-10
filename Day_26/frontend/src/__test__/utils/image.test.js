import { resolveProfileImage } from "../../utils/image";

jest.mock("../../api/api", () => ({
  __esModule: true,
  default: { defaults: { baseURL: "http://localhost:8000/api/v1" } },
}));

test("returns null for missing image", () => {
  expect(resolveProfileImage(null)).toBeNull();
  expect(resolveProfileImage("")).toBeNull();
});

test("returns absolute image URLs unchanged", () => {
  expect(resolveProfileImage("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
});

test("resolves relative image paths against API origin", () => {
  expect(resolveProfileImage("/uploads/a.png")).toBe("http://localhost:8000/uploads/a.png");
});

test("falls back to original value for invalid base URL", () => {
  jest.resetModules();
  jest.doMock("../../api/api", () => ({
    __esModule: true,
    default: { defaults: { baseURL: "not-a-url" } },
  }));
  const { resolveProfileImage: resolve } = require("../../utils/image");
  expect(resolve("/uploads/a.png")).toBe("/uploads/a.png");
});
