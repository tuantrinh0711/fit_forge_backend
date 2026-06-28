import { Controller, Get } from "@nestjs/common";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("weekly")
  weeklyReport() {
    return this.reportsService.weeklyReport();
  }
}
