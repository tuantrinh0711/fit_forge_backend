import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

describe("AuthService.signIn", () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    service = new AuthService(prisma as any);
  });

  it("returns the user when email and password are correct", async () => {
    const passwordHash = await (service as any).hashPassword(
      "correct-password",
    );
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "alex@example.com",
      name: "Alex",
      passwordHash,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = await service.signIn({
      email: "Alex@Example.com",
      password: "correct-password",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "alex@example.com" },
    });
    expect(result).toEqual({
      idToken: expect.any(String),
      accessToken: expect.any(String),
      user: {
        id: "user-1",
        email: "alex@example.com",
        name: "Alex",
        givenName: null,
        familyName: null,
        photo: null,
      },
    });
  });

  it("throws NotFoundException when the email does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.signIn({ email: "missing@example.com", password: "password" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("throws UnauthorizedException when the password is incorrect", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "alex@example.com",
      name: "Alex",
      passwordHash: await (service as any).hashPassword("correct-password"),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expect(
      service.signIn({ email: "alex@example.com", password: "wrong-password" }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
