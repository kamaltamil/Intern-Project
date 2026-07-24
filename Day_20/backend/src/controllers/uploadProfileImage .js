const User = require("../models/User");

const uploadProfileImage = async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            profileImage:
                `/uploads/profile/${req.file.filename}`,
        },
        {
            new: true,
        }
    );

    return successResponse(
        res,
        user,
        "Profile image uploaded"
    );
};