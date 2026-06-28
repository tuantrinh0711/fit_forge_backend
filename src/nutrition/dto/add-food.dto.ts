import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class AddFoodDto {
  @ApiProperty({ example: "Greek yogurt", maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 170,
    minimum: 0,
    description: "Serving size in grams.",
  })
  @IsNumber()
  @Min(0)
  servingSize!: number;

  @ApiProperty({ example: 130, minimum: 0 })
  @IsNumber()
  @Min(0)
  calories!: number;

  @ApiProperty({ example: 17, minimum: 0 })
  @IsNumber()
  @Min(0)
  protein!: number;

  @ApiProperty({ example: 8, minimum: 0 })
  @IsNumber()
  @Min(0)
  carbs!: number;

  @ApiProperty({ example: 3, minimum: 0 })
  @IsNumber()
  @Min(0)
  fat!: number;
}
