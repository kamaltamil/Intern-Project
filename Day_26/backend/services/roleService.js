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
    const isRoomExist =
      await Room.findOne({
        roomNumber,
      });

    if (isRoomExist) {
      throw new Error(
        "Room with this number already exists"
      );
    }

    const newRoom =
      await Room.create({
        roomNumber,
        type,
        price,
      });

    return newRoom;
  } catch (error) {
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
    const rooms =
      await Room.find().sort({
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

const deleteExistingRoom = async (id) => {
  try {
    const room =
      await Room.findById(id);

    if (!room) {
      const error = new Error(
        "Room not found"
      );

      error.statusCode = 404;

      throw error;
    }

    /*
     * Do not delete a room that already has
     * booking records.
     *
     * This prevents existing booking documents
     * from pointing to a deleted room.
     */
    const bookingCount =
      await Booking.countDocuments({
        room: id,
      });

    if (bookingCount > 0) {
      const error = new Error(
        "Cannot delete this room because booking records exist for this room."
      );

      error.statusCode = 409;

      throw error;
    }

    await Room.findByIdAndDelete(id);

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