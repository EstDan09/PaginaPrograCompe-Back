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
     * Get my codeforces account
     * 
     * Previous authentication: Student
     * 
     * Body Output: { _id: string, student_id: string, cf_account: string, is_verified_flag: bool }
     */
    app.get("/cfaccount/me", fstudent_ops, CFAccountController.myCFAccount);

    /**
     * Get CFAccounts by filters
     * 
     * Previous authentication: Admin
     * 
     * UrlQuery Input: student_id? [string], cf_account? [string], is_verified_flag? [string]
     * 
     * Body Output: { _id: string, student_id: string, cf_account: string, is_verified_flag: bool }[]
     */
    app.get("/cfaccount/get", admin_ops, CFAccountController.getCFAccounts);

    /**
     * Get CFAccount by id
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, student_id: string, cf_account: string, is_verified_flag: bool }
     */
    app.get("/cfaccount/get/:id", admin_ops, CFAccountController.getCFAccount);

    /**
     * Start verify codeforces account
     * 
     * Previous authentication: Student
     * 
     * Body Output: { verification_token: string, cf_code: string }
     */
    app.get("/cfaccount/start_verify", fstudent_ops, CFAccountController.startVerifyCFAccount);

    /**
     * End verify codeforces account
     * 
     * Previous authentication: Student
     * 
     * UrlParam Input: :verify_token [string]
     * 
     * Body Output: { _id: string, student_id: string, cf_account: string, is_verified_flag: bool }
     */
    app.put("/cfaccount/end_verify/:verify_token", fstudent_ops, CFAccountController.endVerifyCFAccount);
    
    /**
     * Update codeforces account
     * 
     * Previous authentication: Admin/Student
     * 
     * Body Input: {cf_account?: string}
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, student_id: string, cf_account: string, is_verified_flag: bool }
     */
    app.put("/cfaccount/update/:id", student_ops, CFAccountController.updateCFAccount);
}