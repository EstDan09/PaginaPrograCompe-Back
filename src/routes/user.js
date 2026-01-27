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
     *     description: Creates a new user with specified role. Authentication Admin
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/admin/create", admin_ops, UserController.createUser);

    /**
     * @openapi
     * /admin/get:
     *   get:
     *     tags:
     *       - Admin Users
     *     summary: Get users by filters
     *     description: Retrieves users with sensitive info. Authentication Admin
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
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/admin/get", admin_ops, UserController.getUsers);

    /**
     * @openapi
     * /admin/get/{id}:
     *   get:
     *     tags:
     *       - Admin Users
     *     summary: Get user by ID (sensitive info)
     *     description: Retrieves user with sensitive information. Authentication Admin
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/admin/get/:id", admin_ops, UserController.getUserById);

    /**
     * @openapi
     * /admin/update/{id}:
     *   put:
     *     tags:
     *       - Admin Users
     *     summary: Update user
     *     description: Updates user details. Authentication Admin
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.put("/admin/update/:id", admin_ops, UserController.updateUser);

    /**
     * @openapi
     * /admin/delete/{id}:
     *   delete:
     *     tags:
     *       - Admin Users
     *     summary: Delete user
     *     description: Permanently deletes a user. Authentication Admin
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
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.delete("/admin/delete/:id", admin_ops, UserController.deleteUser);

    /**
     * @openapi
     * /admin/get-by-username/{username}:
     *   get:
     *     tags:
     *       - Admin Users
     *     summary: Get user by username (sensitive)
     *     description: Retrieves user by username with sensitive info. Authentication Admin
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/admin/get-by-username/:username", admin_ops, UserController.getByUsername);

    /**
     * @openapi
     * /user/get:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get users (public info)
     *     description: Retrieves users with only public information. Authentication Basic
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
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/SafeUser'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/user/get", normal_ops, UserController.safeGetUsers);

    /**
     * @openapi
     * /user/get/{id}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get user by ID (public info)
     *     description: Retrieves user with only public information. Authentication Basic
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SafeUser'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/user/get/:id", normal_ops, UserController.safeGetUserById);

    /**
     * @openapi
     * /user/update:
     *   put:
     *     tags:
     *       - Users
     *     summary: Update own profile
     *     description: Allows user to update their own email or password. Authentication Basic
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SafeUser'
     *       404:
     *         description: Not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.put("/user/update", normal_ops, UserController.safeUpdateUser);

    /**
     * @openapi
     * /user/delete:
     *   delete:
     *     tags:
     *       - Users
     *     summary: Delete own account
     *     description: Permanently deletes the authenticated user's account. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Account deleted
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.delete("/user/delete", normal_ops, UserController.safeDeleteUser);

    /**
     * @openapi
     * /user/me:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get own profile
     *     description: Retrieves the authenticated user's complete profile. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SafeUser'
     *       404:
     *         description: Not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/user/me", normal_ops, UserController.getMyProfile);

    /**
     * @openapi
     * /user/get-by-username/{username}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get user by username (public info)
     *     description: Retrieves user by username with public information. Authentication Basic
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
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SafeUser'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/user/get-by-username/:username", normal_ops, UserController.safeGetByUsername);
}