import { Router } from "express";
import { refreshAccessToken, registeredUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/user.controllers.js";
import { logoutUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router();
router.route("/register").post(
     upload.fields([{name:"avatar",maxCount:1},{name:"coveredimage",maxCount:1}]),
    registeredUser)
router.route("/login").post(
    loginUser)
    router.route("/logout").post(
    verifyJWT,logoutUser)
     router.route("/refresh-token").post(
        refreshAccessToken
)





export default router