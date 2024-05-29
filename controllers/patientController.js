const Patient = require("../models/patientModel");
const authController = require("./authController");
const { pdfGenerator } = require("../utils/pdfGenerator");
const { qrGenerator } = require('../utils/qrGenerator');


exports.qrPatient = qrGenerator;
exports.pdfPatient = pdfGenerator("Patient");
exports.signup = authController.signupPatient;
exports.login = authController.login(Patient);
exports.forgetPassword = authController.forgetPassword(Patient, "patients");
exports.resetPassword = authController.resetPassword(Patient);