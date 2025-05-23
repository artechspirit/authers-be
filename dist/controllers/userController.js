"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
const getProfile = async (req, res) => {
    // req.user sudah ada dari middleware authenticate
    return res.json({
        message: "Ini data profile yang aman",
        user: req.user,
    });
};
exports.getProfile = getProfile;
