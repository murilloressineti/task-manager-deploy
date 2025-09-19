import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class TeamsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      description: z.string().trim().optional(),
    });

    const { name, description } = bodySchema.parse(request.body);

    const teamWithSameName = await prisma.team.findFirst({ where: { name } });

    if (teamWithSameName) {
      throw new AppError("Team with same name already exists");
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
      },
    });

    return response.status(201).json(team);
  }

  async index(request: Request, response: Response) {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return response.status(200).json(teams);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const bodySchema = z.object({
      name: z.string().trim().min(2).optional(),
      description: z.string().trim().optional(),
    });

    const { name, description } = bodySchema.parse(request.body);

    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new AppError("Team not found", 404);
    }

    if (name && name !== team.name) {
      const teamWithSameName = await prisma.team.findFirst({
        where: { name },
      });

      if (teamWithSameName) {
        throw new AppError("Team with same name already exists");
      }
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name: name ?? team.name,
        description: description ?? team.description,
      },
    });

    return response.status(200).json(updatedTeam);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new AppError("Team not found", 404);
    }

    await prisma.team.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async addMember(request: Request, response: Response) {
    const { id } = request.params;
    const bodySchema = z.object({
      userId: z.string().uuid(),
    });

    const { userId } = bodySchema.parse(request.body);

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new AppError("Team not found", 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId: id,
      },
    });

    if (existingMember) {
      throw new AppError("User is already a member of this team", 409);
    }

    const newMember = await prisma.teamMember.create({
      data: {
        userId,
        teamId: id,
      },
    });

    return response.status(201).json(newMember);
  }

  async removeMember(request: Request, response: Response) {
    const { id: teamId, userId } = request.params;

    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!member) {
      throw new AppError("Member not found in this team", 404);
    }

    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    return response.status(204).send();
  }
}

export { TeamsController };
