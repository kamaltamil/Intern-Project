const {
  createNewRoom,
  listRooms,
  updateExistingRoom,
  deleteExistingRoom,
} = require("../services/roomService");

const {
  ok,
  created,
  badRequest,
  notFound,
  internalServerError,
} = require("../utils/response");

// Creates a new hotel room in the inventory.
const createRoom = async (req, res) => {
  try {
    const { roomNumber, type, price } = req.body;
    const result = await createNewRoom({ roomNumber, type, price });
    return created(res, "Room created successfully", { result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error creating room");
    if (statusCode === 404) return notFound(res, error.message || "Room not found");
    return internalServerError(res, error.message || "Error creating room");
  }
};

// Returns all rooms sorted by room number.
const getAllRooms = async (req, res) => {
  try {
    const rooms = await listRooms();
    return ok(res, "Rooms fetched successfully", { rooms });
  } catch (error) {
    return internalServerError(res, error.message || "Error fetching rooms");
  }
};

// Updates room details such as pricing, type, or availability status.
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await updateExistingRoom(id, req.body);
    if (!room) return notFound(res, "Room not found");
    return ok(res, "Room updated successfully", { room });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error updating room");
    if (statusCode === 404) return notFound(res, error.message || "Room not found");
    return internalServerError(res, error.message || "Error updating room");
  }
};

// Deletes a room from inventory after checking for active bookings.
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteExistingRoom(id);
    return ok(res, "Room deleted successfully");
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error deleting room");
    if (statusCode === 404) return notFound(res, error.message || "Room not found");
    return internalServerError(res, error.message || "Error deleting room");
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
};