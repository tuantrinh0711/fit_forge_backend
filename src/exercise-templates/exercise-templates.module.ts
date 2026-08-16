import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ExerciseTemplatesController } from "./exercise-templates.controller";
import { ExerciseTemplatesService } from "./exercise-templates.service";

@Module({
  imports: [PrismaModule],
  controllers: [ExerciseTemplatesController],
  providers: [ExerciseTemplatesService],
})
export class ExerciseTemplatesModule {}
