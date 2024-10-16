import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
} from "../controllers/user.controller";
import * as authController from "../controllers/authController";

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.get("/me", getMe, getOneUser);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.use(authController.restrictTo("admin", "superAdmin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);
router
  .route("/updateUserPassword/:id")
  .patch(authController.updateUserPassword);

export default router;
