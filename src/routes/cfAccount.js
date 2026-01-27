const CFAccountController = require("../controllers/cfAccountController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");
const studentMiddleware = require("../middlewares/studentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /cfaccount/me:
     *   get:
     *     tags:
     *       - CodeForces Account
     *     summary: Get authenticated student's CodeForces account
     *     description: Retrieves the CodeForces account information linked to the authenticated student. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       '200':
     *         description: CodeForces account found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CFAccount'
     *       403:
     *         description: Unauthorized
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
    app.get("/cfaccount/me", fstudent_ops, CFAccountController.myCFAccount);

    /**
     * @openapi
     * /cfaccount/get:
     *   get:
     *     tags:
     *       - CodeForces Account
     *     summary: Get CodeForces accounts by filters
     *     description: Retrieves CodeForces accounts matching optional filter criteria. Authentication Admin
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: student_id
     *         schema:
     *           type: string
     *         description: Filter by student ID
     *       - in: query
     *         name: cf_account
     *         schema:
     *           type: string
     *         description: Filter by CodeForces username
     *       - in: query
     *         name: is_verified_flag
     *         schema:
     *           type: string
     *         description: Filter by verification status (true/false)
     *     responses:
     *       '200':
     *         description: Array of matching CodeForces accounts
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CFAccount'
     *       403:
     *         description: Unauthorized
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
    app.get("/cfaccount/get", admin_ops, CFAccountController.getCFAccounts);

    /**
     * @openapi
     * /cfaccount/get/{id}:
     *   get:
     *     tags:
     *       - CodeForces Account
     *     summary: Get CodeForces account by ID
     *     description: Retrieves a specific CodeForces account by its ID. Authentication Admin
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: CFAccount ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: CodeForces account found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CFAccount'
     *       '404':
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
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/cfaccount/get/:id", admin_ops, CFAccountController.getCFAccount);

    /**
     * @openapi
     * /cfaccount/start_verify:
     *   get:
     *     tags:
     *       - CodeForces Account
     *     summary: Start CodeForces account verification process
     *     description: Initiates verification of a CodeForces account. Returns a verification token and code to submit. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       '200':
     *         description: Verification process started
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 verification_token:
     *                   type: string
     *                   description: Token to complete verification
     *                 cf_code:
     *                   type: string
     *                   description: Problem to submit to CodeForces
     *       403:
     *         description: Unauthorized
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
    app.get("/cfaccount/start_verify", fstudent_ops, CFAccountController.startVerifyCFAccount);

    /**
     * @openapi
     * /cfaccount/end_verify/{verify_token}:
     *   put:
     *     tags:
     *       - CodeForces Account
     *     summary: Complete CodeForces account verification
     *     description: Completes the verification process using the verification token received from start_verify endpoint. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: verify_token
     *         required: true
     *         schema:
     *           type: string
     *         description: Verification token from start_verify endpoint
     *     responses:
     *       '200':
     *         description: Account verified successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CFAccount'
     *       '400':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '401':
     *         description: Invalid token
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
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.put("/cfaccount/end_verify/:verify_token", fstudent_ops, CFAccountController.endVerifyCFAccount);
    
    /**
     * @openapi
     * /cfaccount/update/{id}:
     *   put:
     *     tags:
     *       - CodeForces Account
     *     summary: Update CodeForces account handle
     *     description: Updates the CodeForces username for a student's account. Students can only update their own, admins can update any. Authentication Admin/Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: CFAccount ID (must be valid MongoDB ObjectId)
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               cf_account:
     *                 type: string
     *                 description: New CodeForces username (optional, must be non-empty if provided)
     *     responses:
     *       '200':
     *         description: CFAccount updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CFAccount'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '404':
     *         description: Not found
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
    app.put("/cfaccount/update/:id", student_ops, CFAccountController.updateCFAccount);
}