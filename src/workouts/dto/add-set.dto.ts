import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, Min } from "class-validator";

export class AddSetDto {
  @ApiProperty({ example: 8, minimum: 1 })
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiProperty({
    example: 60,
    minimum: 0,
    description: "Weight in the user's chosen unit.",
  })
  @IsNumber()
  @Min(0)
  weight!: number;
}
