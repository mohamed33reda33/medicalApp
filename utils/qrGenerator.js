const qrcode = require('qrcode');
const asyncWrapper = require("../middlewares/asyncWrapper");
const ApiError = require("./apiError");
const path = require('path');


module.exports.qrGenerator = asyncWrapper(async (req, res, next) => {
    const jsonString = JSON.stringify(req.user);
    fileName = `${req.user.name}_${Date.now()}.png`;
    filePath = path.join(__dirname, "..", `qrCodes`, fileName);

    await qrcode.toFile(filePath, jsonString, (err) => {
        if (err) {
            return next(new ApiError(err, 500));
        }

        else {
            res.status(200).json({ msg: "create qr code successfully" });
        }
    })
});
