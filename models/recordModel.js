const mongoose = require("mongoose");

const recordSchema = mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    diseaseName: {
        type: String,
        required: true
    },
    dateDiagnosed: {
        type: Date,
        required: true
    },
    doctors: [{
        doctorId: { type: String, required: true }
    }],
    tests: [{
        testName: { type: String, required: true },
        testDate: { type: Date, required: true },
        testResults: { type: String }
    }],
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        dates: [{ type: Date, required: true }]
    }],
    communicable: { type: String, enum: ['Communicable', 'Non-Communicable'], required: true },
    recovered: { type: Boolean, required: true }
});

recordSchema.pre("findOneAndUpdate", async function (next) {
    if (this._update.doctors) {
        const record = await this.model.findOne(this.getQuery());
        if (record) {
            record.doctors = this._update.doctors;
            await record.save();
        }
    }
    next();
});

module.exports = mongoose.model("Record", recordSchema);