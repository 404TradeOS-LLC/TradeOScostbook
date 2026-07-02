import { Router } from "express";
import { customersController, projectFilesController, projectsController, siteVisitsController } from "../controllers/projects.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const customersRouter = Router();
customersRouter.get("/", asyncHandler(customersController.list));
customersRouter.post("/", asyncHandler(customersController.create));
customersRouter.get("/:id", asyncHandler(customersController.getById));
customersRouter.patch("/:id", asyncHandler(customersController.update));
customersRouter.delete("/:id", asyncHandler(customersController.remove));

export const projectsRouter = Router();
projectsRouter.get("/", asyncHandler(projectsController.list));
projectsRouter.post("/", asyncHandler(projectsController.create));
projectsRouter.get("/:id", asyncHandler(projectsController.getById));
projectsRouter.patch("/:id", asyncHandler(projectsController.update));
projectsRouter.patch("/:id/status", asyncHandler(projectsController.updateStatus));
projectsRouter.get("/:id/site-visits", asyncHandler(siteVisitsController.listByProject));
projectsRouter.post("/:id/site-visits", asyncHandler(siteVisitsController.create));
projectsRouter.patch("/:id/site-visits/:siteVisitId", asyncHandler(siteVisitsController.update));
projectsRouter.get("/:id/files", asyncHandler(projectFilesController.listByProject));
projectsRouter.post("/:id/files", asyncHandler(projectFilesController.create));
projectsRouter.delete("/:id/files/:fileId", asyncHandler(projectFilesController.remove));
