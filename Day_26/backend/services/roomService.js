const mongoose = require("mongoose");
const Room = require("../models/rooms");
const Booking = require("../models/booking");

/* -------------------------------------------------------------------------- */
/*                              Create Room                                   */
/* -------------------------------------------------------------------------- */

const createNewRoom = async ({
  roomNumber,
  type,
  price,
}) => {
  try {
    const isRoomExist = await Room.findOne({
      roomNumber,
    });

    if (isRoomExist) {
      const error = new Error(
        "Room with this number already exists"
      );

      error.statusCode = 409;
      throw error;
    }

    const newRoom = await Room.create({
      roomNumber,
      type,
      price,
    });

    return newRoom;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new Error(
      `Validation error: ${error.message}`
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              List Rooms                                    */
/* -------------------------------------------------------------------------- */

const listRooms = async () => {
  try {
    const rooms = await Room.find().sort({
      roomNumber: 1,
    });

    return rooms;
  } catch (error) {
    throw new Error(
      `Error fetching rooms: ${error.message}`
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              Delete Room                                   */
/* -------------------------------------------------------------------------- */

const deleteExistingRoom = async (roomId) => {
  try {
    /* Validate MongoDB ObjectId */

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      const error = new Error(
        "Invalid room ID"
      );

      error.statusCode = 400;
      throw error;
    }

    /* Find room */

    const room = await Room.findById(roomId);

    if (!room) {
      const error = new Error(
        "Room not found"
      );

      error.statusCode = 404;
      throw error;
    }

    /* -------------------------------------------------------------- */
    /* Prevent deleting rooms that have booking records               */
    /* -------------------------------------------------------------- */

    const bookingCount =
      await Booking.countDocuments({
        room: roomId,
      });

    if (bookingCount > 0) {
      const error = new Error(
        "Cannot delete this room because booking records exist for this room."
      );

      error.statusCode = 409;
      throw error;
    }

    /* Delete room */

    await Room.findByIdAndDelete(roomId);

    return room;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new Error(
      `Error deleting room: ${error.message}`
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              Exports                                       */
/* -------------------------------------------------------------------------- */

module.exports = {
  createNewRoom,
  listRooms,
  deleteExistingRoom,
};