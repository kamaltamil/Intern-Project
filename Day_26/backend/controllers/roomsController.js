const {createNewRoom, listRooms} = require('../services/roomService');

const createRoom = async (req, res) => {
    try {
        const { roomNumber, type, price } = req.body;
        const result = await createNewRoom({ roomNumber, type, price });
        res.status(201).json({ 
            message: 'Room created successfully',
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getAllRooms = async (req, res) => {
    try {
        const rooms = await listRooms();
        res.status(200).json({
            message: 'Rooms fetched successfully',
            rooms
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = {
    createRoom,
    getAllRooms
};