import { Router } from "express";

import { UsersController } from "@/controllers/users-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.use(ensureAuthenticated);
usersRoutes.post(
  "/",
  verifyUserAuthorization(["admin"]),
  usersController.create
);
usersRoutes.get("/", verifyUserAuthorization(["admin"]), usersController.index);
usersRoutes.get("/:id", usersController.show);
usersRoutes.put("/:id", usersController.update);
usersRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  usersController.delete
);

export { usersRoutes };
