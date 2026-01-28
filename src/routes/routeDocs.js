/**
 * @openapi
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message describing the issue
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the assignment
 *         title:
 *           type: string
 *           description: Title of the assignment
 *         description:
 *           type: string
 *           description: Detailed description of the assignment
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Due date of the assignment
 *         parent_group:
 *           type: string
 *           description: ID of the group this assignment belongs to
 */

/**
 * @openapi
 * components:
 *   schemas:
 *      CFAccount:
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: CFAccount ID
 *          student_id:
 *            type: string
 *            description: Associated student ID
 *          cf_account:
 *            type: string
 *            description: CodeForces username
 *          is_verified_flag:
 *            type: boolean
 *            description: Whether account has been verified
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Challenge:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the challenge
 *         cf_code:
 *           type: string
 *           description: CodeForces problem code
 *         student_id:
 *           type: string
 *           description: ID of the student who attempted the challenge
 *         is_completed_flag:
 *           type: boolean
 *           description: Indicates if the challenge has been completed
 *         completion_type:
 *           type: string
 *           enum: [contest, normal]
 *           description: Type of completion ("contest" or "normal")
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     DirectMessage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the direct message
 *         sender_id:
 *           type: string
 *           description: ID of the user who sent the message
 *         receiver_id:
 *           type: string
 *           description: ID of the user who received the message
 *         message:
 *           type: string
 *           description: Content of the direct message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was created
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the exercise
 *         name:
 *           type: string
 *           description: Name of the exercise
 *         cf_code:
 *           type: string
 *           description: CodeForces problem code associated with the exercise
 *         parent_assignment:
 *           type: string
 *           description: ID of the assignment this exercise belongs to
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Following:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the following relationship
 *         student_1_id:
 *           type: string
 *           description: ID of the student who is following
 *         student_2_id:
 *           type: string
 *           description: ID of the student being followed
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the group
 *         name:
 *           type: string
 *           description: Name of the group
 *         description:
 *           type: string
 *           description: Description of the group
 *         parent_coach:
 *           type: string
 *           description: ID of the coach who created the group
 *         group_messages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sender_id:
 *                 type: string
 *                 description: ID of the user who sent the message
 *               message:
 *                 type: string
 *                 description: Content of the message
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp when the message was sent
 *         invite_code:
 *           type: string
 *           description: Invite code for joining the group
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     StudentExercise:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the student exercise record
 *         student_id:
 *           type: string
 *           description: ID of the student
 *         exercise_id:
 *           type: string
 *           description: ID of the exercise
 *         completion_type:
 *           type: string
 *           enum: [contest, normal]
 *           description: Type of completion ("contest" or "normal")
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     StudentGroup:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the student-group relationship
 *         student_id:
 *           type: string
 *           description: ID of the student
 *         group_id:
 *           type: string
 *           description: ID of the group
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     StudentGroupUsername:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the student-group relationship
 *         student_id:
 *           type: string
 *           description: ID of the student
 *         student_username:
 *           type: string
 *           descrption: student username
 *         group_id:
 *           type: string
 *           description: ID of the group
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         username:
 *           type: string
 *           description: Username of the user
 *         password_hash:
 *           type: string
 *           description: Hashed password of the user
 *         email:
 *           type: string
 *           description: Email address of the user
 *         role:
 *           type: string
 *           enum: [student, coach, admin]
 *           description: Role of the user in the system
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     SafeUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         username:
 *           type: string
 *           description: Username of the user
 *         email:
 *           type: string
 *           description: Email address of the user
 *         role:
 *           type: string
 *           enum: [student, coach, admin]
 *           description: Role of the user in the system
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     GroupMessage:
 *       type: object
 *       properties:
 *         sender_id:
 *           type: string
 *           description: ID of the user who sent the message
 *         message:
 *           type: string
 *           description: Content of the message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was sent
 */