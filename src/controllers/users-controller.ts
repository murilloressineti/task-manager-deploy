import { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(request.body);

    const userWithSameEmail = await prisma.user.findFirst({ where: { email } });

    if (userWithSameEmail) {
      throw new AppError("User with same email already exists");
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return response.status(201).json(userWithoutPassword);
  }

  async index(request: Request, response: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return response.status(200).json(users);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    if (!request.user) {
      throw new AppError("User not authenticated", 401);
    }

    const { user } = request;

    if (user.role === "member" && user.id !== id) {
      throw new AppError("Access denied", 403);
    }

    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!foundUser) {
      throw new AppError("User not found", 404);
    }

    return response.status(200).json(foundUser);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;

    const bodySchema = z.object({
      name: z.string().trim().min(2).optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "member"]).optional(),
    });

    const { name, email, role } = bodySchema.parse(request.body);
    const { user } = request;

    // Lógica de autorização - Acesso negado para membros que tentam editar outros
    if (user.role === "member" && user.id !== id) {
      throw new AppError("Access denied", 403);
    }

    // Lógica de autorização - Apenas admins podem alterar a role
    if (user.role !== "admin" && role) {
      throw new AppError(
        "Access denied: only admins can change user roles",
        403
      );
    }

    const foundUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!foundUser) {
      throw new AppError("User not found", 404);
    }

    if (email && email !== foundUser.email) {
      const userWithSameEmail = await prisma.user.findFirst({
        where: { email },
      });

      if (userWithSameEmail) {
        throw new AppError("User with same email already exists");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? foundUser.name,
        email: email ?? foundUser.email,
        role: role ?? foundUser.role,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return response.status(200).json(userWithoutPassword);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await prisma.user.delete({
      where: { id },
    });

    return response.status(204).send();
  }
}

export { UsersController };
