import reducer, { startUserLoading, setUsers, setSearchUser, setUserError } from "../../../store/slices/userSlice";

test("handles user loading and data", () => {
  let state = reducer(undefined, startUserLoading(true));
  expect(state.loading).toBe(true);
  state = reducer(state, setUsers([{ _id: "1" }]));
  expect(state.users).toEqual([{ _id: "1" }]);
  state = reducer(state, setSearchUser([{ _id: "2" }]));
  expect(state.searchList).toEqual([{ _id: "2" }]);
});

test("handles falsy payloads and errors", () => {
  let state = reducer(undefined, startUserLoading());
  expect(state.loading).toBe(false);
  state = reducer(state, setUsers());
  expect(state.users).toEqual([]);
  state = reducer(state, setSearchUser());
  expect(state.searchList).toEqual([]);
  state = reducer(state, setUserError("bad"));
  expect(state.error).toBe("bad");
  state = reducer(state, setUserError());
  expect(state.error).toBeNull();
});
