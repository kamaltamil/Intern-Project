import reducer, { startRoleLoading, setRoles, addRole, updateRole, removeRole, setRoleError } from "../../../store/slices/roleSlice";

test("handles role lifecycle", () => {
  let state = reducer(undefined, startRoleLoading());
  expect(state.loading).toBe(true);
  state = reducer(state, setRoles([{ _id: "1", name: "Admin" }]));
  state = reducer(state, addRole({ _id: "2", name: "Member" }));
  expect(state.roles).toHaveLength(2);
  state = reducer(state, updateRole({ _id: "2", name: "Manager" }));
  expect(state.roles[1].name).toBe("Manager");
  state = reducer(state, updateRole({ _id: "missing", name: "X" }));
  state = reducer(state, removeRole("1"));
  expect(state.roles).toEqual([{ _id: "2", name: "Manager" }]);
});

test("handles empty role payloads and errors", () => {
  let state = reducer(undefined, setRoles());
  expect(state.roles).toEqual([]);
  state = reducer(state, setRoleError("error"));
  expect(state.error).toBe("error");
  state = reducer(state, setRoleError());
  expect(state.error).toBeNull();
});
