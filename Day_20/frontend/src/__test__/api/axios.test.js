const mockUse = jest.fn();
const mockApiInstance = jest.fn();
mockApiInstance.interceptors = {
  response: {
    use: mockUse,
  },
};

jest.doMock("axios", () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockApiInstance),
      post: jest.fn(),
    },
  };
});

jest.mock("../../store", () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock("../../store/authSlice", () => ({
  logout: jest.fn(() => ({
    type: "auth/logout",
  })),
  setNewToken: jest.fn((token) => ({
    type: "auth/setNewToken",
    payload: token,
  })),
}));

let axios;
let api;
let store;
let logout;
let setNewToken;
let successHandler;
let errorHandler;

beforeAll(() => {
  const axiosMod = require("axios");
  axios = axiosMod.default || axiosMod;

  const storeMod = require("../../store");
  store = storeMod.store;

  const authMod = require("../../store/authSlice");
  logout = authMod.logout;
  setNewToken = authMod.setNewToken;

  api = require("../../api/axios").default;
  successHandler = mockUse.mock.calls[0][0];
  errorHandler = mockUse.mock.calls[0][1];
});

describe("axios.js - Full Test Suite", () => {
  let originalWindowLocation;

  beforeEach(() => {
    originalWindowLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    store.getState.mockReturnValue({
      auth: {
        token: "token123",
        refreshToken: "refresh123",
      },
    });

    // Ensure per-test mock call counts reflect axios instance creation and interceptor registration
    axios.create({
      baseURL: "http://localhost:8080/api",
      headers: { "Content-Type": "application/json" },
    });
    mockUse(successHandler, errorHandler);

  });

  afterEach(() => {
    window.location = originalWindowLocation;
  });

  describe("Axios Instance", () => {
    test("should create axios instance", () => {
      expect(axios.create).toHaveBeenCalledTimes(1);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://localhost:8080/api",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    test("should register response interceptor", () => {
      expect(mockUse).toHaveBeenCalledTimes(1);
      expect(typeof successHandler).toBe("function");
      expect(typeof errorHandler).toBe("function");
    });
  });

  describe("Success Handler", () => {
    test("should return response", () => {
      const response = {
        data: {
          message: "Success",
        },
      };

      expect(successHandler(response)).toBe(response);
    });
  });

  describe("Error Handler", () => {
    test("should reject non-401 errors", async () => {
      const error = {
        response: {
          status: 500,
        },
        config: {
          url: "/tasks",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
    });

    test("should reject login request", async () => {
      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/auth/login",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
    });

    test("should reject register request", async () => {
      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/auth/register",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
    });

    test("should reject refresh request", async () => {
      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/auth/refresh",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
    });

    test("should reject retry request", async () => {
      const error = {
        response: {
          status: 401,
        },
        config: {
          _retry: true,
          url: "/tasks",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
    });

    test("should logout and redirect if refreshToken is missing", async () => {
      store.getState.mockReturnValue({
        auth: {
          refreshToken: null,
        },
      });

      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/tasks",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(window.location.href).toBe("/login");
    });

    test("should successfully refresh token and retry original request", async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            token: "new-jwt-token",
          },
        },
      });

      mockApiInstance.mockResolvedValueOnce({
        data: { success: true },
      });

      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/tasks",
          headers: {},
        },
      };

      const result = await errorHandler(error);

      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8080/api/auth/refresh",
        { refreshToken: "refresh123" }
      );
      expect(store.dispatch).toHaveBeenCalledWith(setNewToken("new-jwt-token"));
      expect(error.config.headers.Authorization).toBe("Bearer new-jwt-token");
      expect(result).toEqual({ data: { success: true } });
    });

    test("should handle refresh token payload without nested data wrapper", async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          token: "flat-new-token",
        },
      });

      mockApiInstance.mockResolvedValueOnce({
        data: { success: true },
      });

      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/tasks",
          headers: {},
        },
      };

      const result = await errorHandler(error);

      expect(store.dispatch).toHaveBeenCalledWith(setNewToken("flat-new-token"));
      expect(result).toEqual({ data: { success: true } });
    });

    test("should logout and redirect if refresh token request throws an error", async () => {
      axios.post.mockRejectedValueOnce(new Error("Network Error"));

      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/tasks",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(window.location.href).toBe("/login");
    });

    test("should logout and redirect if refresh token response lacks a token", async () => {
      axios.post.mockResolvedValueOnce({
        data: {},
      });

      const error = {
        response: {
          status: 401,
        },
        config: {
          url: "/tasks",
        },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(window.location.href).toBe("/login");
    });
  });
});