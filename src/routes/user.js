const UserController = require("../controllers/userController");

module.exports = (app) => {
    app.post("/users", UserController.createUser);
    app.get("/users/:id", UserController.getUserById);
    app.put("/users/:id", UserController.updateUser);
    app.delete("/users/:id", UserController.deleteUser);
}