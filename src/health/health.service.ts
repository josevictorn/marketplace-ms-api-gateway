import { Injectable } from '@nestjs/common';
import { HealthStatus } from 'src/common/health/health-check.interface';
import { HealthCheckService } from 'src/common/health/health-check.service';

@Injectable()
export class HealthService {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  async getHealthStatus() {
    const healthChecks = await this.healthCheckService.checkAllServices();

    const result = {
      status: HealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
      gateway: {
        status: HealthStatus.HEALTHY,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      service: {},
    };

    let hasUnhealthyService = false;

    healthChecks.forEach((service) => {
      result.service[service.name] = {
        status: service.status,
        responseTime: service.responseTime,
        lastChecked: service.lastChecked,
        url: service.url,
        ...(service.error && { error: service.error }),
      };

      if (service.status === HealthStatus.UNHEALTHY) {
        hasUnhealthyService = true;
      }
    });

    if (hasUnhealthyService) {
      result.status = HealthStatus.UNHEALTHY;
    }

    return result;
  }

  async getReadyStatus() {
    const healthChecks = await this.getHealthStatus();
    return {
      status:
        healthChecks.status === HealthStatus.HEALTHY ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
    };
  }

  getLiveStatus() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
