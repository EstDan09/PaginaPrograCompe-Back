const FollowingController = require("../controllers/followingController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/studentMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create following
     * 
     * Previous authentication: Admin/Student
     * 
     * Body Input: { student_1_id?[optional if user is student]: string, student_2_id: string }
     * 
     * Body Output: { _id: string, student_1_id: string, student_2_id: string }
     */
    app.post("/following/create", student_ops, FollowingController.createFollowing);

    /**
     * Get followings by filters
     * 
     * Previous authentication: Admin/Student
     * 
     * UrlQuery Input: student_1_id? [string], student_2_id? [string]
     * 
     * Body Output: { _id: string, student_1_id: string, student_2_id: string }[]
     */
    app.get("/following/get", student_ops, FollowingController.getFollowing);

    /**
     * Get following by id
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, student_1_id: string, student_2_id: string }
     */
    app.get("/following/get/:id", admin_ops, FollowingController.getFollowingById);

    /**
     * Delete following
     * 
     * Previous authentication: Admin/Student
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/following/delete/:id", student_ops, FollowingController.deleteFollowing);

    /**
     * Get follower count for student
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :user_id [string]
     * 
     * Body Output: { count: int }
     */
    app.get("/following/count/:user_id", normal_ops, FollowingController.countFollowers);

    app.get("/following", fstudent_ops, FollowingController.listFollowings);
}