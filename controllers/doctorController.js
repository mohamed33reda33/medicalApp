const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const Record = require("../models/recordModel");
const authController = require("./authController");
const asyncWrapper = require("../middlewares/asyncWrapper");
const ApiError = require("../utils/apiError");
const { pdfGenerator } = require("../utils/pdfGenerator");
const { qrGenerator } = require('../utils/qrGenerator');


exports.qrDoctor = qrGenerator;

exports.pdfDoctor = pdfGenerator("Doctor");

exports.createMedicalRecord = asyncWrapper(async (req, res, next) => {
    const { patientId, diseaseName, doctors, tests, medications, communicable, recovered } = req.body;
    const newRecord = await Record.create({
        patientId,
        diseaseName,
        dateDiagnosed: Date.now(),
        doctors,
        tests,
        medications,
        communicable,
        recovered
    });
    await Doctor.findByIdAndUpdate(req.user._id, {
        $push: {
            patientsRecord: newRecord._id
        }
    })

    const patient = await Patient.findByIdAndUpdate(patientId, {
        $push: {
            medicalRecords: newRecord._id
        }
    }, { new: true }).populate('medicalRecords')

    res.status(201).json({ patient });
});

exports.updateMedicalRecord = asyncWrapper(async (req, res, next) => {

    const updatedRecord = await Record.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    if (!updatedRecord)
        return next(new ApiError(`not found any Record`), 404);
    res.status(201).json({ updatedRecord });
});

exports.deleteMedicalRecord = asyncWrapper(async (req, res, next) => {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) {
        return next(new ApiError(`not find any record`, 404));
    }
    res.status(204).json({ msg: `The record has been deleted` });
});

exports.getOneMedicalRecord = asyncWrapper(async (req, res, next) => {
    const record = await Record.findById(req.params.id)
    if (!record) {
        return next(new ApiError("not find any records", 404));
    }
    res.status(200).json({ data: record });
});


exports.signup = authController.signupDoctor;
exports.login = authController.login(Doctor);
exports.forgetPassword = authController.forgetPassword(Doctor, "doctors");
exports.resetPassword = authController.resetPassword(Doctor);


