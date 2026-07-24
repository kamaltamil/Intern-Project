import authReducer, {
  login,
  logout,
  setNewToken,
  normalizeUserData,
} from "../../store/authSlice";

describe("authSlice.js", () => {
  // ── normalizeUserData ─────────────────────────────────────────────

  describe("normalizeUserData()", () => {
    test("should return null when input is null", () => {
      expect(normalizeUserData(null)).toBeNull();
    });

    test("should return null when input is undefined", () => {
      expect(normalizeUserData(undefined)).toBeNull();
    });

    test("should extract data.user when success + data.user exists", () => {
      const input = {
        success: true,
        data: {
          user: { _id: "1", name: "Kamal", email: "k@g.com" },
        },
      };
      expect(normalizeUserData(input)).toEqual({
        _id: "1",
        name: "Kamal",
        email: "k@g.com",
      });
    });

    test("should extract data when success + data but no data.user", () => {
      const input = {
        success: true,
        data: { _id: "2", name: "Tamil" },
      };
      expect(normalizeUserData(input)).toEqual({ _id: "2", name: "Tamil" });
    });

    test("should extract user when user object has name", () => {
      const input = {
        user: { name: "Kamal", email: "k@g.com", _id: "3" },
      };
      expect(normalizeUserData(input)).toEqual({
        name: "Kamal",
        email: "k@g.com",
        _id: "3",
      });
    });

    test("should extract user when user object has email only", () => {
      const input = {
        user: { email: "k@g.com" },
      };
      expect(normalizeUserData(input)).toEqual({ email: "k@g.com" });
    });

    test("should extract user when user object has _id only", () => {
      const input = {
        user: { _id: "5" },
      };
      expect(normalizeUserData(input)).toEqual({ _id: "5" });
    });

    test("should return the object directly when it has name", () => {
      const input = { name: "Direct", email: "d@g.com" };
      expect(normalizeUserData(input)).toEqual({
        name: "Direct",
        email: "d@g.com",
      });
    });

    test("should return the object directly when it has email", () => {
      const input = { email: "e@g.com" };
      expect(normalizeUserData(input)).toEqual({ email: "e@g.com" });
    });

    test("should return the object directly when it has _id", () => {
      const input = { _id: "abc" };
      expect(normalizeUserData(input)).toEqual({ _id: "abc" });
    });

    test("should return input as-is when no known pattern matches", () => {
      const input = { foo: "bar" };
      expect(normalizeUserData(input)).toEqual({ foo: "bar" });
    });
  });

  // ── Reducers ──────────────────────────────────────────────────────

  describe("login reducer", () => {
    test("should set user, token, and refreshToken from payload.data", () => {
      const initialState = { user: null, token: null, refreshToken: null };

      const payload = {
        data: {
          user: { _id: "1", name: "Kamal", email: "k@g.com" },
          token: "access-token",
          refreshToken: "refresh-token",
        },
      };

      const state = authReducer(initialState, login(payload));

      expect(state.user).toEqual({ _id: "1", name: "Kamal", email: "k@g.com" });
      expect(state.token).toBe("access-token");
      expect(state.refreshToken).toBe("refresh-token");
    });

    test("should handle flat payload with user, token, refreshToken", () => {
      const initialState = { user: null, token: null, refreshToken: null };

      const payload = {
        user: { name: "Kamal", _id: "2" },
        token: "t1",
        refreshToken: "r1",
      };

      const state = authReducer(initialState, login(payload));

      expect(state.user).toEqual({ name: "Kamal", _id: "2" });
      expect(state.token).toBe("t1");
      expect(state.refreshToken).toBe("r1");
    });

    test("should handle payload without token", () => {
      const initialState = { user: null, token: null, refreshToken: null };

      const payload = { name: "Kamal" };
      const state = authReducer(initialState, login(payload));

      expect(state.user).toEqual({ name: "Kamal" });
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });
  });

  describe("logout reducer", () => {
    test("should reset state to initial values", () => {
      const loggedInState = {
        user: { name: "Kamal" },
        token: "some-token",
        refreshToken: "some-refresh",
      };

      const state = authReducer(loggedInState, logout());

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });
  });

  describe("setNewToken reducer", () => {
    test("should update only the token", () => {
      const currentState = {
        user: { name: "Kamal" },
        token: "old-token",
        refreshToken: "refresh",
      };

      const state = authReducer(currentState, setNewToken("new-token"));

      expect(state.token).toBe("new-token");
      expect(state.user).toEqual({ name: "Kamal" });
      expect(state.refreshToken).toBe("refresh");
    });
  });
});
