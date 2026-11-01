import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { PrismaService } from "../prisma/prisma.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

const scrypt = promisify(scryptCallback);
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(dto: SignUpDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Password and confirm password do not match");
    }

    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: { email, name: dto.name.trim(), passwordHash },
      });

      return this.toAuthResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email is already registered");
      }

      throw error;
    }
  }

  async signIn(dto: SignInDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await this.verifyPassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.toAuthResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: "If an account exists for that email, a password reset link has been sent." };
    }

    const plainToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashResetToken(plainToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    await this.sendPasswordResetEmail(email, plainToken);

    return { message: "If an account exists for that email, a password reset link has been sent." };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Password and confirm password do not match");
    }

    const tokenHash = this.hashResetToken(dto.token.trim());
    const now = new Date();

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (await this.verifyPassword(dto.password, resetToken.user.passwordHash)) {
      throw new BadRequestException(
        "New password must be different from your current password",
      );
    }

    const passwordHash = await this.hashPassword(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: now } }),
      this.prisma.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id }, usedAt: null },
        data: { usedAt: now },
      }),
    ]);

    return { message: "Password has been reset successfully." };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) {
      return false;
    }
    const salt = Buffer.from(saltHex, "hex");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedKey = Buffer.from(hashHex, "hex");
    if (storedKey.length !== derivedKey.length) {
      return false;
    }
    return timingSafeEqual(storedKey, derivedKey);
  }

  private hashResetToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const baseUrl = process.env.APP_URL ?? process.env.PUBLIC_APP_URL;

    if (!apiKey || !baseUrl) {
      throw new BadRequestException("Password reset email is not configured. Set RESEND_API_KEY and APP_URL.");
    }

    const resetUrl = new URL("/reset-password", baseUrl);
    resetUrl.searchParams.set("token", token);
    resetUrl.searchParams.set("email", email);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Reset your Fit Forge password",
        html: `<p>We received a password reset request for your Fit Forge account.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new BadRequestException(`Failed to send password reset email: ${details}`);
    }
  }

  private toAuthResponse(user: { id: string; email: string; name: string | null }) {
    const token = this.createAccessToken(user.id);
    return {
      idToken: token,
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        givenName: null,
        familyName: null,
        photo: null,
      },
    };
  }

  verifyAccessToken(token: string): string | undefined {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return undefined;

    const expectedSignature = createHmac("sha256", this.accessTokenSecret())
      .update(encodedPayload)
      .digest("base64url");
    if (signature.length !== expectedSignature.length) return undefined;
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return undefined;
    }

    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
        sub?: unknown;
        exp?: unknown;
      };
      if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return undefined;
      if (payload.exp <= Math.floor(Date.now() / 1000)) return undefined;
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  private createAccessToken(userId: string) {
    const encodedPayload = Buffer.from(
      JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS }),
    ).toString("base64url");
    const signature = createHmac("sha256", this.accessTokenSecret())
      .update(encodedPayload)
      .digest("base64url");
    return `${encodedPayload}.${signature}`;
  }

  private accessTokenSecret() {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET must be configured");
    return secret;
  }
}
