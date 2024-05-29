const router = require("express").Router();
const Doctor = require("../models/doctorModel");
const doctorController = require("../controllers/doctorController");
const { verifyToken } = require("../middlewares/verifyToken");


router.post('/createMedicalRecord', verifyToken(Doctor), doctorController.createMedicalRecord);
router.patch('/updateMedicalRecord/:id', verifyToken(Doctor), doctorController.updateMedicalRecord);
router.delete('/deleteMedicalRecord/:id', verifyToken(Doctor), doctorController.deleteMedicalRecord);
router.get('/getOneMedicalRecord', verifyToken(Doctor), doctorController.getOneMedicalRecord);
router.post('/pdfDoctor', verifyToken(Doctor), doctorController.pdfDoctor);
router.post('/qrDoctor', verifyToken(Doctor), doctorController.qrDoctor);

router.post('/signup', doctorController.signup);
router.post('/login', doctorController.login);
router.post('/forgetPassword', doctorController.forgetPassword);
router.patch('/resetPassword/:ResetToken', doctorController.resetPassword);
module.exports = router;
