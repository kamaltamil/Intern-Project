import api from "../../api/api";
import * as queries from "../../api/queries";

jest.mock("../../api/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("API query functions", () => {
  beforeEach(() => jest.clearAllMocks());

  test("auth queries return response data", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    expect(await queries.loginUser({ email: "a" })).toEqual({ ok: true });
    expect(await queries.signupUser({ name: "A" })).toEqual({ ok: true });
    expect(await queries.logoutUser()).toEqual({ ok: true });
    expect(await queries.refreshToken({ refreshToken: "r" })).toEqual({ ok: true });
    expect(api.post).toHaveBeenCalled();
  });

  test("fetchMe returns profile data", async () => {
    api.get.mockResolvedValue({ data: { user: { name: "A" } } });
    expect(await queries.fetchMe()).toEqual({ user: { name: "A" } });
  });

  test("user queries handle array and fallback responses", async () => {
    api.get.mockResolvedValueOnce({ data: [{ _id: "1" }] });
    expect(await queries.fetchUsers()).toEqual([{ _id: "1" }]);
    api.get.mockResolvedValueOnce({ data: { user: { _id: "1" } } });
    expect(await queries.fetchUserById("1")).toEqual({ user: { _id: "1" } });
    api.post.mockResolvedValueOnce({ data: { user: { _id: "1" } } });
    expect(await queries.createUser({})).toEqual({ _id: "1" });
    api.patch.mockResolvedValueOnce({ data: { user: { _id: "1" } } });
    expect(await queries.updateUser({ id: "1", payload: {} })).toEqual({ _id: "1" });
    api.delete.mockResolvedValueOnce({ data: { deleted: true } });
    expect(await queries.deleteUser("1")).toEqual({ deleted: true });
  });

  test("user and role queries handle non-array and fallback data", async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    expect(await queries.fetchUsers()).toEqual([]);
    api.get.mockResolvedValueOnce({ data: null });
    expect(await queries.fetchUserById("x")).toBeNull();
    api.post.mockResolvedValueOnce({ data: { id: 1 } });
    expect(await queries.createUser({})).toEqual({ id: 1 });
    api.patch.mockResolvedValueOnce({ data: { id: 1 } });
    expect(await queries.updateUser({ id: "1", payload: {} })).toEqual({ id: 1 });
    api.get.mockResolvedValueOnce({ data: [{ _id: "r" }] });
    expect(await queries.fetchRoles()).toEqual([{ _id: "r" }]);
    api.get.mockResolvedValueOnce({ data: {} });
    expect(await queries.fetchRoles()).toEqual([]);
    api.get.mockResolvedValueOnce({ data: { _id: "r" } });
    expect(await queries.fetchRoleById("r")).toEqual({ _id: "r" });
    api.post.mockResolvedValueOnce({ data: { role: { _id: "r" } } });
    expect(await queries.createRole({})).toEqual({ _id: "r" });
    api.patch.mockResolvedValueOnce({ data: { role: { _id: "r" } } });
    expect(await queries.updateRole({ id: "r", payload: {} })).toEqual({ _id: "r" });
    api.delete.mockResolvedValueOnce({ data: { deleted: true } });
    expect(await queries.deleteRole("r")).toEqual({ deleted: true });
  });

  test("booking and room queries support wrapped and direct responses", async () => {
    api.get.mockResolvedValueOnce({ data: { bookings: [{ _id: "b" }] } });
    expect(await queries.fetchBookings()).toEqual([{ _id: "b" }]);
    api.get.mockResolvedValueOnce({ data: [{ _id: "b" }] });
    expect(await queries.fetchBookings()).toEqual([{ _id: "b" }]);
    api.get.mockResolvedValueOnce({ data: { bookings: [] } });
    expect(await queries.fetchBookings()).toEqual([]);
    api.post.mockResolvedValueOnce({ data: { id: "b" } });
    expect(await queries.createBooking({})).toEqual({ id: "b" });
    api.get.mockResolvedValueOnce({ data: { rooms: [{ _id: "r" }] } });
    expect(await queries.fetchRooms()).toEqual([{ _id: "r" }]);
    api.get.mockResolvedValueOnce({ data: [{ _id: "r" }] });
    expect(await queries.fetchRooms()).toEqual([{ _id: "r" }]);
  });
});
