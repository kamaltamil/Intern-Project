const {
  createNewRoom,
  listRooms,
  deleteExistingRoom,
} = require("../services/roomService");

/* -------------------------------------------------------------------------- */
/*                              Create Room                                   */
/* -------------------------------------------------------------------------- */

const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      type,
      price,
    } = req.body;

    const result =
      await createNewRoom({
        roomNumber,
        type,
        price,
      });

    return res.status(201).json({
      message:
        "Room created successfully",
      result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get Rooms                                     */
/* -------------------------------------------------------------------------- */

const getAllRooms = async (req, res) => {
  try {
    const rooms =
      await listRooms();

    return res.status(200).json({
      message:
        "Rooms fetched successfully",
      rooms,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Delete Room                                   */
/* -------------------------------------------------------------------------- */

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteExistingRoom(id);

    return res.status(200).json({
      message:
        "Room deleted successfully",
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Exports                                       */
/* -------------------------------------------------------------------------- */

module.exports = {
  createRoom,
  getAllRooms,
  deleteRoom,
};