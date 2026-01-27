const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
    /**
     * @openapi
     * /auth/login:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Login user with credentials
     *     description: Authenticates a user with username and password, returning a JWT token for subsequent requests.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 description: Username (required, non-empty)
     *               password:
     *                 type: string
     *                 description: Password (required, non-empty)
     *     responses:
     *       '200':
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: JWT token for authentication
     *       '400':
     *         description: Bad request - Missing username or password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '401':
     *         description: Unauthorized - Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/auth/login", AuthController.loginUser);

    /**
     * @openapi
     * /auth/register:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Register new user account
     *     description: Creates a new user account. Students can optionally provide a CodeForces account handle. Coaches and admins cannot be registered through this endpoint.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *               - role
     *             properties:
     *               username:
     *                 type: string
     *                 description: Username (required, non-empty, must be unique)
     *               password:
     *                 type: string
     *                 description: Password (required, min 6 characters recommended)
     *               role:
     *                 type: string
     *                 enum: [student, coach]
     *                 description: User role (required, must be 'student' or 'coach')
     *               email:
     *                 type: string
     *                 description: Email address (optional, must be valid format if provided)
     *               cf_account:
     *                 type: string
     *                 description: CodeForces account handle (optional, only valid if role='student')
     *     responses:
     *       '201':
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: JWT token for authentication
     *       '400':
     *         description: Bad request - Invalid role, duplicate username, or invalid cf_account for non-students
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/auth/register", AuthController.registerUser);

    /**
     * @openapi
     * /auth/refresh-token:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Refresh expired JWT token
     *     description: Generates a new JWT token using the current authentication session. Use this when the current token is about to expire.
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       '200':
     *         description: Token refreshed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: New JWT token
     *       '401':
     *         description: Unauthorized - Invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/auth/refresh-token", authMiddleware.auth, AuthController.refreshToken);
}