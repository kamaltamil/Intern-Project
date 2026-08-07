const {
    varifyAndBookRoom,
    getAllBookings,
    getMemberBookings,
    getBookingsByUserId,
} = require('../services/bookingService')

const bookRoom = async (req, res) => {
    try{
        // userId comes from the authenticated JWT, not the request body
        const userId = req.user?.userId || req.user?.sub;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: user not identified' });
        }

        const { roomId, startDate, endDate } = req.body;

        if (!roomId || !startDate || !endDate) {
            return res.status(400).json({ message: 'roomId, startDate and endDate are required' });
        }

        const booking = await varifyAndBookRoom({ roomId, userId, startDate, endDate });

        if (!booking) {
            return res.status(400).json({ message: 'Booking failed' });
        }

        return res.status(201).json({
            message: 'Your booking is created successfully',
            booking,
        })
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Error booking room' });
    }
}

const getBookings = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id || req.user?.sub;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Route already confirmed 'bookings:view'. Scope is then derived from
        // permissions an Admin can configure per role:
        //  - full booking control (bookings:delete)  -> see every booking
        //  - can review/approve bookings (approval:view) -> see bookings made by members
        //  - otherwise                                -> see only your own bookings
        const canViewAll = req.permissions?.bookings?.delete;
        const canReview = req.permissions?.approval?.view;

        let bookings;
        if (canViewAll) {
            bookings = await getAllBookings();
        } else if (canReview) {
            bookings = await getMemberBookings();
        } else {
            bookings = await getBookingsByUserId(userId);
        }

        return res.status(200).json({
            message: 'Bookings fetched successfully',
            bookings,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
}

module.exports = {
    bookRoom,
    getBookings
}