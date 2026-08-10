import api from "../../api/api";
import { store } from "../../store/store";
import { logout, setTokens } from "../../store/slices/authSlice";

jest.mock("../../store/store", () => ({
  store: {
    getState: jest.fn(() => ({ auth: { token: "access-token", refreshToken: "refresh-token" } })),
    dispatch: jest.fn(),
  },
}));

describe("api interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("adds bearer token to requests", () => {
    const handler = api.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    const result = handler(config);
    expect(result.headers.Authorization).toBe("Bearer access-token");
  });

  test("does not add authorization when token is absent", () => {
    store.getState.mockReturnValueOnce({ auth: { token: null, refreshToken: null } });
    const handler = api.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    expect(handler(config).headers.Authorization).toBeUndefined();
  });

  test("refreshes a token after a 401 response", async () => {
    const response = { data: { token: "new-token", refreshToken: "new-refresh", role: "Manager", permissions: [] } };
    const postSpy = jest.spyOn(api, "post").mockResolvedValueOnce(response);
    const callSpy = jest.spyOn(api, "request").mockResolvedValueOnce({ data: "retried" });
    const handler = api.interceptors.response.handlers[0].rejected;
    const error = { config: { url: "/users/profile", headers: {} }, response: { status: 401 } };

    const result = await handler(error);
    expect(store.dispatch).toHaveBeenCalledWith(
      setTokens({
        token: "new-token",
        refreshToken: "new-refresh",
        role: "Manager",
        permissions: [],
      })
    );
    expect(result).toEqual({ data: "retried" });
    expect(postSpy).toHaveBeenCalledWith("/users/refresh", { refreshToken: "refresh-token" });
    callSpy.mockRestore();
    postSpy.mockRestore();
  });

  test("logs out when refresh token is missing", async () => {
    store.getState.mockReturnValueOnce({ auth: { token: "x", refreshToken: null } });
    const handler = api.interceptors.response.handlers[0].rejected;
    const error = { config: { url: "/users/profile", headers: {} }, response: { status: 401 } };
    await expect(handler(error)).rejects.toBe(error);
    expect(store.dispatch).toHaveBeenCalledWith(logout());
  });

  test("logs out when refresh request fails", async () => {
    store.getState.mockReturnValue({ auth: { token: "x", refreshToken: "r" } });
    jest.spyOn(api, "post").mockRejectedValueOnce(new Error("refresh failed"));
    const handler = api.interceptors.response.handlers[0].rejected;
    const error = { config: { url: "/users/profile", headers: {} }, response: { status: 401 } };
    await expect(handler(error)).rejects.toBe(error);
    expect(store.dispatch).toHaveBeenCalledWith(logout());
    api.post.mockRestore();
  });

  test("does not refresh auth routes", async () => {
    const handler = api.interceptors.response.handlers[0].rejected;
    const error = { config: { url: "/users/login", headers: {} }, response: { status: 401 } };
    await expect(handler(error)).rejects.toBe(error);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test("does not refresh non-401 errors", async () => {
    const handler = api.interceptors.response.handlers[0].rejected;
    const error = { config: { url: "/users/profile", headers: {} }, response: { status: 500 } };
    await expect(handler(error)).rejects.toBe(error);
  });
});
