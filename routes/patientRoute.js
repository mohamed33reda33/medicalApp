const router = require("express").Router();
const patientController = require("../controllers/patientController");
const Patient = require("../models/patientModel");
const { verifyToken } = require("../middlewares/verifyToken");

router.post('/pdfPatient', verifyToken(Patient), patientController.pdfPatient);
router.post('/qrPatient', verifyToken(Patient), patientController.qrPatient);

router.post('/signup', patientController.signup);
router.post('/login', patientController.login);
router.post('/forgetPassword', verifyToken, patientController.forgetPassword);
router.patch('/resetPassword/:ResetToken', verifyToken, patientController.resetPassword);
module.exports = router;
