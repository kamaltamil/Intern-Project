import userReducer, { setUsersData, clearUsers } from "../../store/userSlice";

describe("userSlice.js", () => {
  const initialState = { users: [] };

  describe("setUsersData reducer", () => {
    test("should set users array", () => {
      const payload = [
        { _id: "1", name: "Kamal" },
        { _id: "2", name: "Tamil" },
      ];

      const state = userReducer(initialState, setUsersData(payload));

      expect(state.users).toEqual(payload);
      expect(state.users).toHaveLength(2);
    });

    test("should replace existing users", () => {
      const existingState = {
        users: [{ _id: "1", name: "Old" }],
      };

      const payload = [{ _id: "2", name: "New" }];
      const state = userReducer(existingState, setUsersData(payload));

      expect(state.users).toEqual([{ _id: "2", name: "New" }]);
    });
  });

  describe("clearUsers reducer", () => {
    test("should reset users to empty array", () => {
      const existingState = {
        users: [{ _id: "1", name: "User" }],
      };

      const state = userReducer(existingState, clearUsers());

      expect(state.users).toEqual([]);
    });
  });
});
