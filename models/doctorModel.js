const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const doctorSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validat: [validator.isEmail, "Enter valid email"]
    },
    specialization: {
        type: String,
        required: [true, "Specialization is required"],
    },
    patientsRecord: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Record"
    }],
    role: {
        type: String,
        enum: ["doctor", "hospitalDirector"],
        default: "doctor"
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm password"],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: `Password are not the same`
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

});

doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
doctorSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    console.log(this.passwordChangedAt)
    next();
});
doctorSchema.methods.correctPassword = async function (enteredPassword, userPassword) {
    return await bcrypt.compare(enteredPassword, userPassword);
};

doctorSchema.methods.generateResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString(`hex`);

    this.passwordResetToken = crypto.createHash(`sha256`).update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 1000 * 60 * 10;
    return resetToken;
};


module.exports = mongoose.model("Doctor", doctorSchema);