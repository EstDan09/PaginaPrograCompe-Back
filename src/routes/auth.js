const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
    /**
     * Login User
     * 
     * Previous authentication: N/A
     * 
     * Body Input: { username: string, password: string }
     * 
     * Body Output: { token: string }
     */
    app.post("/auth/login", AuthController.loginUser);

    /**
     * Register User
     * 
     * Previous authentication: N/A
     * 
     * Body Input: { username: string, password: string, role[student,coach]: string, email?: string, cf_account?[if and only if role is student]: string }
     * 
     * Body Output: { token: string }
     */
    app.post("/auth/register", AuthController.registerUser);

    /**
     * Refresh Token
     * 
     * Previous authentication: Basic
     * 
     * Body Output: { token: string }
     */
    app.post("/auth/refresh-token", authMiddleware.auth, AuthController.refreshToken);
}