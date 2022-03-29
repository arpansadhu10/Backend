const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')


const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        requires: [true, 'Please provide a password'],
        minlength: [5, 'password should be atleast 5 chars'],
        // select: false //the password fiels will not come while returnng object
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
    forgotPasswordToken: { type: String },
    forgotPassword_otp: Number,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }

})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12)
});

//check password if correnct or not
userSchema.methods.isPasswordCorrect = async function (userSentPassword) {
    return await bcrypt.compare(userSentPassword, this.password);
}

userSchema.methods.getJwtToken = function () {

    return jwt.sign({ id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY, }
    )
}

userSchema.methods.getForgotPasswordToken = async function () {
    const forgotToken = crypto.randomBytes(20).toString("hex");
    this.forgotPasswordToken = await crypto.createHash('sha256').update(forgotToken).digest("hex");

    // console.log("FORGOT PASSWORD TOKEN IN DB", this.forgotPasswordToken);
    this.forgotPasswordExpiry = await Date.now() + process.env.FORGOT_PASSWORD_EXPIRY;
    // this.name = "abcd"
    return forgotToken;
}

userSchema.methods.getForgotPassword_6digitOTP = async function () {
    const num = Math.round(parseInt(Math.random() * 1000000))
    this.forgotPassword_otp = num;
    this.forgotPasswordExpiry = new Date(Date.now() + process.env.FORGOT_PASSWORD_EXPIRY);

    return num;
}


module.exports = mongoose.model('User', userSchema);