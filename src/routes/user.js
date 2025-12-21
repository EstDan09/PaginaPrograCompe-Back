const UserController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/admin/create", admin_ops, UserController.createUser);
    app.get("/admin/get", admin_ops, UserController.getUsers);
    app.get("/admin/get/:id", admin_ops, UserController.getUserById);
    app.put("/admin/update/:id", admin_ops, UserController.updateUser);
    app.delete("/admin/delete/:id", admin_ops, UserController.deleteUser);

    app.get("/admin/get-by-username/:username", admin_ops, UserController.getByUsername);

    app.get("/user/get", normal_ops, UserController.safeGetUsers);
    app.get("/user/get/:id", normal_ops, UserController.safeGetUserById);
    app.put("/user/update", normal_ops, UserController.safeUpdateUser);
    app.delete("/user/delete", normal_ops, UserController.safeDeleteUser);

    app.get("/user/me", normal_ops, UserController.getMyProfile);
    app.get("/user/get-by-username/:username", normal_ops, UserController.safeGetByUsername);
}