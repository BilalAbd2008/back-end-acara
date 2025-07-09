import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import { ROLES } from "../utils/constant";
import mediaMiddleware from "../middlewares/media.middleware";
import mediaController from "../controllers/media.controller";

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);
router.post("/auth/activation", authController.activation);
router.get("/auth/activation", authController.activation);


router.post('/media/upload-single', [
  authMiddleware,
  aclMiddleware([ROLES.MEMBER, ROLES.ADMIN]),
  mediaMiddleware.single('file')
], mediaController.single);
router.post('/media/upload-multiple', [
  authMiddleware,
  aclMiddleware([ROLES.MEMBER, ROLES.ADMIN]),
  mediaMiddleware.multiple('files')
], mediaController.multiple);
router.delete('/media/remove', [
  authMiddleware,
  aclMiddleware([ROLES.MEMBER, ROLES.ADMIN]),
], mediaController.remove);

export default router;
