import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class TasksController {
  async create(request: Request, response: Response) {
    const { user } = request;

    const bodySchema = z.object({
      title: z.string().trim().min(2),
      description: z.string().trim().optional(),
      status: z.enum(["pending", "in_progress", "completed"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      assignedTo: z.string().uuid(),
      teamId: z.string().uuid(),
    });

    const { title, description, status, priority, assignedTo, teamId } =
      bodySchema.parse(request.body);

    if (user.role === "member") {
      if (assignedTo !== user.id) {
        throw new AppError(
          "A member can only assign a task to themselves",
          403
        );
      }

      if (!teamId) {
        throw new AppError("A member must create a task within a team", 400);
      }

      const teamMember = await prisma.teamMember.findFirst({
        where: {
          userId: user.id,
          teamId,
        },
      });

      if (!teamMember) {
        throw new AppError(
          "You can only create tasks for a team you belong to",
          403
        );
      }
    }

    const assignedUserExists = await prisma.user.findUnique({
      where: { id: assignedTo },
    });
    if (!assignedUserExists) {
      throw new AppError("Assigned user not found", 404);
    }

    const teamExists = await prisma.team.findUnique({ where: { id: teamId } });
    if (!teamExists) {
      throw new AppError("Team not found", 404);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        assignedTo,
        teamId,
      },
    });

    return response.status(201).json(task);
  }

  async index(request: Request, response: Response) {
    const { user } = request;

    if (user.role === "admin") {
      const tasks = await prisma.task.findMany({
        include: {
          user: true,
          team: true,
        },
      });
      return response.status(200).json(tasks);
    }

    if (user.role === "member") {
      const teams = await prisma.teamMember.findMany({
        where: { userId: user.id },
        select: { teamId: true },
      });

      const teamIds = teams.map((team) => team.teamId);

      const tasks = await prisma.task.findMany({
        where: {
          teamId: {
            in: teamIds,
          },
        },
        include: {
          user: true,
          team: true,
        },
      });

      return response.status(200).json(tasks);
    }

    throw new AppError("Unauthorized access", 401);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const { user } = request;

    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        teamId: true,
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (user.role === "admin") {
      return response.status(200).json(task);
    }

    if (!task.teamId) {
      throw new AppError("Access denied", 403);
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId: task.teamId,
      },
    });

    if (!teamMember) {
      throw new AppError("Access denied", 403);
    }

    return response.status(200).json(task);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { user } = request;

    const bodySchema = z.object({
      title: z.string().trim().min(2).optional(),
      description: z.string().trim().optional(),
      status: z.enum(["pending", "in_progress", "completed"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      assignedTo: z.string().uuid().optional(),
    });

    const { title, description, status, priority, assignedTo } =
      bodySchema.parse(request.body);

    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        assignedTo: true,
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (user.role === "member" && user.id !== task.assignedTo) {
      throw new AppError("Access denied", 403);
    }

    if (user.role === "member" && assignedTo) {
      throw new AppError("A member cannot reassign a task", 403);
    }

    if (assignedTo) {
      const assignedUserExists = await prisma.user.findUnique({
        where: { id: assignedTo },
      });
      if (!assignedUserExists) {
        throw new AppError("Assigned user not found", 404);
      }
    }

    const oldStatus = task.status;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
        priority: priority ?? task.priority,
        assignedTo: assignedTo ?? task.assignedTo,
      },
    });

    if (oldStatus !== updatedTask.status) {
      await prisma.taskHistory.create({
        data: {
          taskId: updatedTask.id,
          oldStatus: oldStatus,
          newStatus: updatedTask.status,
          changedBy: user.id,
        },
      });
    }

    return response.status(200).json(updatedTask);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async showHistory(request: Request, response: Response) {
    const { id } = request.params;
    const { user } = request;

    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        teamId: true,
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (user.role === "admin") {
      const history = await prisma.taskHistory.findMany({
        where: { taskId: id },
        orderBy: { changedAt: "desc" },
      });
      return response.status(200).json(history);
    }

    if (!task.teamId) {
      throw new AppError("Access denied", 403);
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId: task.teamId,
      },
    });

    if (!teamMember) {
      throw new AppError("Access denied", 403);
    }

    const history = await prisma.taskHistory.findMany({
      where: { taskId: id },
      orderBy: { changedAt: "desc" },
    });

    return response.status(200).json(history);
  }
}

export { TasksController };
