const UserController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create user
     * 
     * Previous authentication: Admin
     * 
     * Body Input: {username: string, password: string, email?: string, role?: string}
     * 
     * Body Output: { _id: string, username: string, password_hash: string, email?: string, role: string }
     */
    app.post("/admin/create", admin_ops, UserController.createUser);

    /**
     * Get users by filters
     * 
     * Previous authentication: Admin
     * 
     * UrlQuery Input: username? [string], password_hash? [string], role? [string], email? [string]
     * 
     * Body Output: { _id: string, username: string, password_hash: string, email?: string, role: string }[]
     */
    app.get("/admin/get", admin_ops, UserController.getUsers);

    /**
     * Get user by ID
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, username: string, password_hash: string, email?: string, role: string }
     */
    app.get("/admin/get/:id", admin_ops, UserController.getUserById);

    /**
     * Update user by ID
     * 
     * Previous authentication: Admin
     * 
     * Body Input: { password: string, role: string, email?: string }
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, username: string, password_hash: string, email?: string, role: string }
     */
    app.put("/admin/update/:id", admin_ops, UserController.updateUser);

    /**
     * Delete user by ID
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/admin/delete/:id", admin_ops, UserController.deleteUser);

    /**
     * Get user by username
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :username [string]
     * 
     * Body Output: { _id: string, username: string, password_hash: string, email?: string, role: string }
     */
    app.get("/admin/get-by-username/:username", admin_ops, UserController.getByUsername);

    /**
     * Safely get users by filters
     * 
     * Previous authentication: Basic
     * 
     * UrlQuery Input: username? [string], role? [string], email? [string]
     * 
     * Body Output: { _id: string, username: string, role: string, email?: string }[]
     */
    app.get("/user/get", normal_ops, UserController.safeGetUsers);

    /**
     * Get user by ID safely
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, username: string, role: string, email?: string }
     */
    app.get("/user/get/:id", normal_ops, UserController.safeGetUserById);

    /**
     * Update personal user account safely
     * 
     * Previous authentication: Basic
     * 
     * Body Input: { email?: string, password?: string }
     * 
     * Body Output: { _id: string, username: string, role: string, email?: string }
     */
    app.put("/user/update", normal_ops, UserController.safeUpdateUser);

    /**
     * Delete personal user account safely
     * 
     * Previous authentication: Basic
     * 
     * Body Output: N/A
     */
    app.delete("/user/delete", normal_ops, UserController.safeDeleteUser);

    /**
     * Get personal user profile
     * 
     * Previous authentication: Basic
     * 
     * Body Output: { _id: string, username: string, role: string, email?: string }
     */
    app.get("/user/me", normal_ops, UserController.getMyProfile);

    /**
     * Get user by username safely
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :username [string]
     * 
     * Body Output: { _id: string, username: string, role: string, email?: string }
     */
    app.get("/user/get-by-username/:username", normal_ops, UserController.safeGetByUsername);
}