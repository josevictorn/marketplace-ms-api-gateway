import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckService } from 'src/common/health/health-check.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthStatus } from 'src/common/health/health-check.interface';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly healthCheckService: HealthCheckService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the health status of the API Gateway' })
  @ApiResponse({
    status: 200,
    description: 'The health status of the API Gateway',
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || 'unknown',
    };
  }

  @Get('services')
  @ApiOperation({
    summary: 'Get the health status of all services',
  })
  @ApiResponse({
    status: 200,
    description: 'The health status of all services',
  })
  async getServicesHealth() {
    const services = await this.healthCheckService.checkAllServices();

    const overallStatus = services.every(
      (service) => service.status === HealthStatus.HEALTHY,
    )
      ? 'healthy'
      : services.some((service) => service.status === HealthStatus.HEALTHY)
        ? HealthStatus.DEGRADED
        : HealthStatus.UNHEALTHY;

    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary: {
        total: services.length,
        healthy: services.filter(
          (service) => service.status === HealthStatus.HEALTHY,
        ).length,
        unhealthy: services.filter(
          (service) => service.status === HealthStatus.UNHEALTHY,
        ).length,
        degraded: services.filter(
          (service) => service.status === HealthStatus.DEGRADED,
        ).length,
      },
    };
  }

  @Get('services/:serviceName')
  @ApiOperation({
    summary: 'Get the health status of a specific service',
  })
  @ApiResponse({
    status: 200,
    description: 'The health status of a specific service',
  })
  getServiceHealth(serviceName: string) {
    const cached = this.healthCheckService.getCacheHealth(serviceName);

    if (!cached) {
      return {
        status: 'unknown',
        message: 'Service not found or never checked',
        timestamp: new Date().toISOString(),
      };
    }

    return cached;
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Get the readiness status of the API Gateway',
  })
  @ApiResponse({
    status: 200,
    description: 'The readiness status of the API Gateway',
  })
  getReady() {
    return this.healthService.getReadyStatus();
  }

  @Get('live')
  @ApiOperation({
    summary: 'Get the liveness status of the API Gateway',
  })
  @ApiResponse({
    status: 200,
    description: 'The liveness status of the API Gateway',
  })
  getLive() {
    return this.healthService.getLiveStatus();
  }
}
