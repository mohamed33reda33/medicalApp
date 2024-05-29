const asyncWrapper = require("../middlewares/asyncWrapper");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require("path");

exports.pdfGenerator = (modelName) => asyncWrapper(async (req, res) => {
    const doc = new PDFDocument();
    fileName = `${req.user.name}_${Date.now()}.pdf`;
    filePath = path.join(__dirname, "..", `reports`, fileName);
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text(`${modelName} Report`, { align: `center` });
    doc.fontSize(16).text(`${modelName} Data`, { underline: true });

    let requiredProps = ['_id', 'name', 'email'];
    let records = req.user.medicalRecords;
    if (req.user.role === "doctor" || req.user.role === "hospitalDirector") {
        requiredProps = ['_id', 'name', 'email', 'specialization', 'role'];
        records = req.user.patientsRecord;
    }
    requiredProps.forEach(prop => {
        if (req.user[prop]) {
            doc.fontSize(12).text(`${prop}:${req.user[prop]}`)
        }
    })
    if (records && records.length > 0) {
        doc.fontSize(14).text('Medical/Patients Records', { underline: true });
        const recordsList = records.map(record => `- ${record}`);
        doc.fontSize(12).list(recordsList);
    }
    doc.end();
    res.status(201).json(req.user);

});