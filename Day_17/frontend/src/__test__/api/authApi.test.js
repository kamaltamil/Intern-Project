import {
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  updateUser,
  deleteUser,
  refreshToken,
} from "../../api/authApi";

import api from "../../api/axios";
import { store } from "../../store";

jest.mock("../../api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../store", () => ({
  store: {
    getState: jest.fn(),
  },
}));

const API_URL = "http://localhost:8080/api";

describe("authApi.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    store.getState.mockReturnValue({
      auth: {
        token: "fake-token",
        refreshToken: "fake-refresh-token",
      },
    });
  });

  describe("registerUser()", () => {
    test("should register user", async () => {
      api.post.mockResolvedValue({
        data: {
          success: true,
          message: "Registered",
        },
      });

      const result = await registerUser(
        "Kamal",
        "kamal@gmail.com",
        "123456"
      );

      expect(api.post).toHaveBeenCalledTimes(1);

      expect(api.post).toHaveBeenCalledWith(
        `${API_URL}/auth/register`,
        {
          name: "Kamal",
          email: "kamal@gmail.com",
          password: "123456",
        }
      );

      expect(result).toEqual({
        success: true,
        message: "Registered",
      });
    });
  });

  describe("loginUser()", () => {
    test("should login successfully", async () => {
      api.post.mockResolvedValue({
        data: {
          token: "jwt-token",
        },
      });

      const result = await loginUser(
        "kamal@gmail.com",
        "123456"
      );

      expect(api.post).toHaveBeenCalledWith(
        `${API_URL}/auth/login`,
        {
          email: "kamal@gmail.com",
          username: "kamal@gmail.com",
          password: "123456",
        }
      );

      expect(result).toEqual({
        token: "jwt-token",
      });
    });
  });

  describe("getProfile()", () => {
    test("should fetch profile with token", async () => {
      api.get.mockResolvedValue({
        data: {
          name: "Kamal",
        },
      });

      const result = await getProfile();

      expect(api.get).toHaveBeenCalledWith(
        `${API_URL}/auth/profile`,
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );

      expect(result).toEqual({
        name: "Kamal",
      });
    });

    test("should fetch profile without token", async () => {
      store.getState.mockReturnValue({
        auth: {
          token: null,
        },
      });

      api.get.mockResolvedValue({
        data: {},
      });

      await getProfile();

      expect(api.get).toHaveBeenCalledWith(
        `${API_URL}/auth/profile`,
        {
          headers: {},
        }
      );
    });
  });

  describe("getUsers()", () => {
    test("should fetch all users", async () => {
      api.get.mockResolvedValue({
        data: [
          {
            id: 1,
            name: "Kamal",
          },
        ],
      });

      const result = await getUsers();

      expect(api.get).toHaveBeenCalledWith(
        `${API_URL}/auth/users`,
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );

      expect(result).toHaveLength(1);
    });
  });

  describe("updateUser()", () => {
    test("should update user", async () => {
      api.patch.mockResolvedValue({
        data: {
          success: true,
        },
      });

      const payload = {
        name: "Kamal",
        email: "kamal@gmail.com",
      };

      const result = await updateUser(
        "1",
        payload
      );

      expect(api.patch).toHaveBeenCalledWith(
        `${API_URL}/auth/users/1`,
        {
          name: "Kamal",
          email: "kamal@gmail.com",
        },
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );

      expect(result).toEqual({
        success: true,
      });
    });

    test("should handle optional payload", async () => {
      api.patch.mockResolvedValue({
        data: {},
      });

      await updateUser("2");

      expect(api.patch).toHaveBeenCalledWith(
        `${API_URL}/auth/users/2`,
        {
          name: undefined,
          email: undefined,
        },
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );
    });
  });

  describe("deleteUser()", () => {
    test("should delete user", async () => {
      api.delete.mockResolvedValue({
        data: {
          message: "Deleted",
        },
      });

      const result = await deleteUser("5");

      expect(api.delete).toHaveBeenCalledWith(
        `${API_URL}/auth/users/5`,
        {
          headers: {
            Authorization: "Bearer fake-token",
          },
        }
      );

      expect(result).toEqual({
        message: "Deleted",
      });
    });
  });

  describe("refreshToken()", () => {
    test("should refresh token", async () => {
      api.post.mockResolvedValue({
        data: {
          token: "new-token",
        },
      });

      const result = await refreshToken();

      expect(api.post).toHaveBeenCalledWith(
        `${API_URL}/auth/refresh`,
        {
          refreshToken: "fake-refresh-token",
        }
      );

      expect(result).toEqual({
        token: "new-token",
      });
    });

    test("should refresh when refresh token is null", async () => {
      store.getState.mockReturnValue({
        auth: {
          token: "fake-token",
          refreshToken: null,
        },
      });

      api.post.mockResolvedValue({
        data: {},
      });

      await refreshToken();

      expect(api.post).toHaveBeenCalledWith(
        `${API_URL}/auth/refresh`,
        {
          refreshToken: null,
        }
      );
    });
  });
});