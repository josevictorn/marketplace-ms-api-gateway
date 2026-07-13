import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { register } from 'prom-client';
import { MetricsService } from './metrics.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  }
}
