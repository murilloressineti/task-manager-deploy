import { Request, Response } from "express";
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { UsersController } from "@/controllers/users-controller";

// 1. Mocka as dependências que o método create utiliza.
jest.mock("@/database/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

// 2. Cria mocks para os objetos de resposta do Express.
const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("UsersController (Testes Básicos)", () => {
  let usersController: UsersController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    usersController = new UsersController();
    mockReq = {};
    mockRes = mockResponse();

    jest.clearAllMocks();
  });

  // Teste: Criação de um novo usuário com sucesso
  it("should create a new user successfully", async () => {
    // Dados da requisição
    const requestBody = {
      name: "Teste",
      email: "teste@example.com",
      password: "senha123",
    };
    mockReq.body = requestBody;

    // Configura o comportamento dos mocks para o cenário de sucesso
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue("hashedPassword-teste");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "id-do-usuario-teste",
      ...requestBody,
      password: "hashedPassword-teste",
    });

    // Chama o método create
    await usersController.create(mockReq as Request, mockRes as Response);

    // 3. Verifica se as funções foram chamadas com os dados corretos
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: "teste@example.com" },
    });
    expect(hash).toHaveBeenCalledWith("senha123", 8);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: requestBody.name,
        email: requestBody.email,
        password: "hashedPassword-teste",
      },
    });

    // 4. Verifica a resposta da API (status e corpo)
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      id: "id-do-usuario-teste",
      name: requestBody.name,
      email: requestBody.email,
    });
  });
});
