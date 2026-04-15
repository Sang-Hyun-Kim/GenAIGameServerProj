import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthGuard } from '../../notices/guards/admin-auth.guard';
import { AdminMetricsService } from '../services/admin-metrics.service';

@Controller('api/admin/metrics')
@UseGuards(AuthGuard('jwt'), AdminAuthGuard)
export class AdminMetricsController {
  constructor(private readonly adminMetricsService: AdminMetricsService) {}

  @Get('summary')
  async getSummary() {
    return this.adminMetricsService.getSummary();
  }

  @Get('economy')
  async getEconomy() {
    return this.adminMetricsService.getEconomy();
  }

  @Get('activity')
  async getActivity() {
    return this.adminMetricsService.getActivity();
  }
}
