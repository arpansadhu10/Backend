const jwt = require("jsonwebtoken");
const User = require("../model/user");
const bigPromise = require("./bigPromise");
const colors = require('colors')

exports.isLoggedIn = bigPromise(async (req, res, next) => {
    const authorizationBearer = req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null
    const token = req.cookies.token || authorizationBearer
    if (!token) {
        return next(new Error("Login first to continue..."));
    }
    const decoded = jwt.decode(token);
    // console.log(colors.red(decoded));
    req.user = await User.findById(decoded.id);
    console.log(colors.green(req.user));

    next();
})

exports.isAdmin = bigPromise(async (req, res, next) => {
    const position = req.user.role;
    if (position === "admin") {
        next();
    }
    else {
        res.status(400).json({
            success: "false",
            message: "Unauthorised Access..only for admins"
        });
    }
})