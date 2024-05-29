const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const { signJWT } = require("../utils/signJWT");
const asyncWrapper = require("../middlewares/asyncWrapper");
const ApiError = require("../utils/apiError");
const { sendEmail } = require("../utils/email");
const crypto = require("crypto");


exports.signupDoctor = asyncWrapper(async (req, res) => {
    const newDoctor = await Doctor.create({
        name: req.body.name,
        email: req.body.email,
        specialization: req.body.specialization,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signJWT(newDoctor._id)

    res.status(201).json({
        status: `success`,
        token,
        data: {
            doctor: newDoctor
        }
    })
});

exports.signupPatient = asyncWrapper(async (req, res, next) => {
    const newPatient = await Patient.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const token = signJWT(newPatient._id)

    res.status(201).json({
        status: `success`,
        token,
        data: {
            patient: newPatient
        }
    })
});

exports.login = (Model) => asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email && !password)
        return next(new ApiError(`Please enter your email and password`, 400));

    const model = await Model.findOne({ email }).select(`+password`);

    if (!model || !await model.correctPassword(password, model.password))
        return next(new ApiError(`Check your email and password`, 401));

    const token = signJWT(model._id);
    return res.status(200).json({
        status: "success",
        token
    });
});

exports.forgetPassword = (Model, modelName) => asyncWrapper(async (req, res, next) => {
    const model = await Model.findOne({ email: req.body.email });
    if (!model)
        return next(new ApiError(`${modelName} not found`, 404));
    const resetToken = await model.generateResetPasswordToken();
    await model.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get(`host`)}/api/${modelName}/resetPassword/${resetToken}`
    const message = `please go to this URL to reset password (${resetURL})`;
    try {
        await sendEmail({
            email: model.email,
            subject: `reset password token (valid for 10m)`,
            message
        });
        return res.status(201).json({ msg: "reset url send to your email" });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({ validateBeforeSave: false });
        return next(new ApiError(err, 500));
    }
});

exports.resetPassword = (Model) => asyncWrapper(async (req, res, next) => {
    const hashedToken = crypto.createHash(`sha256`).update(req.params.ResetToken).digest(`hex`);
    const model = await Model.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!model)
        return next(new ApiError(`Invaled token, please try agin liter`), 400);

    model.passwordConfirm = req.body.passwordConfirm;
    model.password = req.body.password;
    model.passwordResetToken = undefined;
    model.passwordResetExpires = undefined;
    await model.save();

    const token = signJWT(model._id);
    return res.status(200).json({
        status: "success",
        token
    });
});
