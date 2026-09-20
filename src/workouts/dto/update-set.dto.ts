import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, Max, Min } from "class-validator";

export class UpdateSetDto {
  @ApiProperty({ example: 12, minimum: 1, maximum: 1000 })
  @IsInt()
  @Min(1)
  @Max(1000)
  reps!: number;

  @ApiProperty({
    example: 55,
    minimum: 0,
    maximum: 100000,
    description: "Weight in the user's chosen unit.",
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100000)
  weight!: number;
}
