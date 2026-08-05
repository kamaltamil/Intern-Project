const Room = require('../models/rooms');

const createNewRoom = async ({ roomNumber, type, price }) => {
    try {

        const isRoomExist = await Room.findOne({ roomNumber });
        if (isRoomExist) {
            throw new Error('Room with this number already exists');
        }

        const newRoom = await Room.create({ roomNumber, type, price });

        return newRoom;
    } catch (error) {
        throw new Error(`Validation error: ${error.message}`);
    }
}

const listRooms = async () => {
    try {
        const rooms = await Room.find();
        return rooms;
    } catch (error) {
        throw new Error(`Error fetching rooms: ${error.message}`);
    }
}

module.exports = {
    createNewRoom,
    listRooms
};