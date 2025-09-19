import { Router } from "express";
import { TasksController } from "@/controllers/tasks-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";

const tasksRoutes = Router();
const tasksController = new TasksController();

tasksRoutes.use(ensureAuthenticated);

tasksRoutes.post("/", tasksController.create);
tasksRoutes.get("/", tasksController.index);
tasksRoutes.get("/:id", tasksController.show);
tasksRoutes.put("/:id", tasksController.update);
tasksRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  tasksController.delete
);
tasksRoutes.get("/:id/history", tasksController.showHistory);


export { tasksRoutes };
