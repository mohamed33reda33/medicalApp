const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");

exports.verifyToken = (Model) => async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith(`Bearer`))
        return next(new ApiError(`token is required`, 401));
    const token = authHeader.split(` `)[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await Model.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json("The user no longer exist");
        }
        req.user = currentUser;
        next();
    } catch (err) {
        return next(new ApiError(`invaled token`, 401));
    }
}