import { Router } from "express";
import { TeamsController } from "@/controllers/teams-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";

const teamsRoutes = Router();
const teamsController = new TeamsController();

teamsRoutes.use(ensureAuthenticated);

teamsRoutes.get(
  "/",
  verifyUserAuthorization(["admin", "member"]),
  teamsController.index
);

teamsRoutes.post(
  "/",
  verifyUserAuthorization(["admin"]),
  teamsController.create
);

teamsRoutes.put(
  "/:id",
  verifyUserAuthorization(["admin"]),
  teamsController.update
);

teamsRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  teamsController.delete
);

teamsRoutes.post(
  "/:id/members",
  verifyUserAuthorization(["admin"]),
  teamsController.addMember
);

teamsRoutes.delete(
  "/:id/members/:userId",
  verifyUserAuthorization(["admin"]),
  teamsController.removeMember
);

export { teamsRoutes };
