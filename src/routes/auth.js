const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
    app.post("/auth/login", AuthController.loginUser);
    app.post("/auth/register", AuthController.registerUser);
    app.post("/auth/refresh-token", authMiddleware.auth, AuthController.refreshToken);
}