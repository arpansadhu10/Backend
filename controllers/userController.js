const bigPromise = require('../middlewares/bigPromise');
const User = require('../model/user');
const cookieToken = require('../utils/cookieToken');
const { mailSender } = require('../utils/mailSender');
const crypto = require('crypto')
const colors = require('colors');

exports.signup = bigPromise(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name) {
        return next(new Error('Please provide name'));
    }
    if (!email) {
        return next(new Error('Please provide email'));
    }
    if (!password) {
        return next(new Error('Please provide password'));
    }

    //images??

    const user = await User.create({
        name,
        email,
        password
    })

    cookieToken(user, res)

})

exports.login = bigPromise(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email) {
        return next(new Error("please give email"));
    }
    if (!password) {
        return next(new Error("please give password"));
    }
    const user = await User.findOne({ email: email })
    console.log(user);
    if (!user) {
        return next(new Error("user not found in db please create an account"))
    }
    const isPasswordRight = await user.isPasswordCorrect(password);
    console.log("isPasswordRight", isPasswordRight);
    if (!isPasswordRight) {
        return next(new Error("incorrect password..."))
    } else {
        cookieToken(user, res)
    }
})

exports.logout = bigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "logged out seccessfully"
    })
})

//in this route a random string is generated and stored to database...and a mail is sent to the user
exports.forgotPassword_classic = bigPromise(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new Error("please enter email"))

    }
    const user = await User.findOne({ email })
    if (!user) {
        return next(new Error("user not present in DB.."))
    }
    const forgotToken = await user.getForgotPasswordToken();
    user.forgotPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);
    user.forgotPassword_otp = undefined;
    await user.save({ validateBeforeSave: false })
    const url = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}}`;
    // console.log(forgotToken);

    let option = {
        email: email,
        subject: "password reset email ||arpanStore",
        message: `paste this link in your browser and press enter\n\n\n ${url}`
    }
    try {
        await mailSender(option)
        console.log(user.forgotPasswordExpiry);
        return res.status(200).json({
            success: true,
            message: "email Sent successfully"
        })

    } catch (err) {
        console.log(err.message);
        user.forgotPasswordToken = undefined
        user.forgotPassword_otp = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })
        console.log("email sending unsuccessfull");
        return next(new Error("email sending unsuccessfull"));
    }
})
exports.passwordReset_classic = bigPromise(async (req, res, next) => {
    const token = req.params.token;
    const encryToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    console.log(encryToken);
    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: { $gt: Date.new() }
    })
    if (user.forgotPasswordExpiry > Date.now()) {
        console.log("not yet expired");
    }
    if (!user) {
        return next(new Error("either token expired or wrong link entered"))
    }
    user.password = req.body.password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save({ validateBeforeSave: false })


    cookieToken(user, res);

})
exports.forgotPassword_6digitOtp = bigPromise(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new Error("please enter email"))

    }
    const user = await User.findOne({ email })
    if (!user) {
        return next(new Error("user not present in DB.."))
    }
    const forgotToken_OTP = await user.getForgotPassword_6digitOTP();
    console.log(colors.red.underline(forgotToken_OTP));
    user.forgotPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);
    user.forgotPasswordToken = undefined;
    await user.save({ validateBeforeSave: false })
    let option = {
        email: email,
        subject: "password reset email ||arpanStore",
        message: `OTP is\n\n\n ${forgotToken_OTP}`
    }
    try {
        await mailSender(option)
        console.log(user.forgotPasswordExpiry);

        return res.status(200).json({
            success: true,
            message: "email Sent successfully"
        })

    } catch (err) {
        console.log(err.message);
        user.forgotPasswordToken = undefined
        user.forgotPassword_otp = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })

        console.log("email sending unsuccessfull");
        return next(new Error("email sending unsuccessfull"));
    }

})
exports.passwordReset_6digitOtp = bigPromise(async (req, res, next) => {
    const otp = req.params.otp;
    const user = await User.findOne({ otp, forgotPasswordExpiry: { $gt: Date.now() } })
    if (!user) {
        return next(new Error("either wrong otp or token expired"));
    }
    if (user.forgotPasswordExpiry < Date.now()) {
        return next(new Error(" token expired...."));

    }
    console.log(colors.red.underline(user.forgotPassword_otp), "user otp");
    console.log(colors.red.underline(req.params.otp), "user entered otp");
    if (parseInt(user.forgotPassword_otp) === parseInt(otp)) {
        user.password = req.body.password;
        await user.save({ validateBeforeSave: "false" })
        user.forgotPasswordToken = undefined
        user.forgotPassword_otp = undefined
        user.forgotPasswordExpiry = undefined
        cookieToken(user, res);
    }
    else {
        return next(new Error("wrong OTP..."))
    }


})
