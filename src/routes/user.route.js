import {Router} from "express"
import {
  logInUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(logInUser)

//secure Route
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-Token").post(refreshAccessToken);

export default router