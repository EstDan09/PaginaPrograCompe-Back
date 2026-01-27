const UserController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /admin/create:
     *   post:
     *     tags:
     *       - Admin Users
     *     summary: Create user account
     *     description: Creates a new user with specified role (admin only)
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [username, password]
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *               email:
     *                 type: string
     *               cf_account:
     *                 type: string
     *     responses:
     *       201:
     *         description: User created
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden - Admins only
     *       500:
     *         description: Server error
     */
    app.post("/admin/create", admin_ops, UserController.createUser);

    /**
     * @openapi
     * /admin/get:
     *   get:
     *     tags:
     *       - Admin Users
     *     summary: Get users by filters
     *     description: Retrieves users with sensitive info (admin only)
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: username
     *         schema:
     *           type: string
     *       - in: query
     *         name: role
     *         schema:
     *           type: string
     *       - in: query
     *         name: email
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of users with sensitive info
     *       403:
     *         description: Forbidden - Admins only
     *       500:
     *         description: Server error
     */
    app.get("/admin/get", admin_ops, UserController.getUsers);

    /**
     * @openapi
     * /admin/get/{id}:
     *   get:
     *     tags:
     *       - Admin Users
     *     summary: Get user by ID (sensitive info)
     *     description: Retrieves user with sensitive information (admin only)
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User found
     *       403:
     *         description: Forbidden - Admins only
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.get("/admin/get/:id", admin_ops, UserController.getUserById);

    /**
     * @openapi
     * /admin/update/{id}:
     *   put:
     *     tags:
     *       - Admin Users
     *     summary: Update user
     *     description: Updates user details (admin only)
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: User updated
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden - Admins only
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.put("/admin/update/:id", admin_ops, UserController.updateUser);

    /**
     * @openapi
     * /admin/delete/{id}:
     *   delete:
     *     tags:
     *       - Admin Users
     *     summary: Delete user
     *     description: Permanently deletes a user (admin only)
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User deleted
     *       403:
     *         description: Forbidden - Admins only
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.delete("/admin/delete/:id", admin_ops, UserController.deleteUser);

    /**
     * @openapi
     * /admin/get-by-username/{username}:
     *   get:
     *     tags:
     *       - Admin Users
     *     summary: Get user by username (sensitive)
     *     description: Retrieves user by username with sensitive info (admin only)
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: username
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User found
     *       403:
     *         description: Forbidden - Admins only
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.get("/admin/get-by-username/:username", admin_ops, UserController.getByUsername);

    /**
     * @openapi
     * /user/get:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get users (public info)
     *     description: Retrieves users with only public information
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: username
     *         schema:
     *           type: string
     *       - in: query
     *         name: role
     *         schema:
     *           type: string
     *       - in: query
     *         name: email
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of users with public info
     *       500:
     *         description: Server error
     */
    app.get("/user/get", normal_ops, UserController.safeGetUsers);

    /**
     * @openapi
     * /user/get/{id}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get user by ID (public info)
     *     description: Retrieves user with only public information
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User found
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.get("/user/get/:id", normal_ops, UserController.safeGetUserById);

    /**
     * @openapi
     * /user/update:
     *   put:
     *     tags:
     *       - Users
     *     summary: Update own profile
     *     description: Allows user to update their own email or password
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Profile updated
     *       400:
     *         description: Bad request
     *       500:
     *         description: Server error
     */
    app.put("/user/update", normal_ops, UserController.safeUpdateUser);

    /**
     * @openapi
     * /user/delete:
     *   delete:
     *     tags:
     *       - Users
     *     summary: Delete own account
     *     description: Permanently deletes the authenticated user's account
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Account deleted
     *       500:
     *         description: Server error
     */
    app.delete("/user/delete", normal_ops, UserController.safeDeleteUser);

    /**
     * @openapi
     * /user/me:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get own profile
     *     description: Retrieves the authenticated user's complete profile
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Server error
     */
    app.get("/user/me", normal_ops, UserController.getMyProfile);

    /**
     * @openapi
     * /user/get-by-username/{username}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get user by username (public info)
     *     description: Retrieves user by username with public information
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: username
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User found
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.get("/user/get-by-username/:username", normal_ops, UserController.safeGetByUsername);
}