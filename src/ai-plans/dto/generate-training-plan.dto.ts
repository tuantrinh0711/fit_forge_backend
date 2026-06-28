import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class GenerateTrainingPlanDto {
  @ApiProperty({ example: "Build muscle" })
  @IsString()
  @IsNotEmpty()
  goal!: string;

  @ApiProperty({
    example: "beginner",
    enum: ["beginner", "intermediate", "advanced"],
  })
  @IsString()
  @IsIn(["beginner", "intermediate", "advanced"])
  experienceLevel!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek!: number;
}
