import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from 'src/common/circuit-breaker/circuit-breaker.service';
import { CacheFallbackService } from 'src/common/fallback/cache.fallback';
import { DefaultFallbackService } from 'src/common/fallback/default.fallback';
import { serviceConfig } from 'src/config/gateway.config';

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly cacheFallbackService: CacheFallbackService,
    private readonly defaultFallbackService: DefaultFallbackService,
  ) {}

  async proxyRequest<T = unknown>(
    serviceName: keyof typeof serviceConfig,
    method: string,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    userInfo?: UserInfo,
  ): Promise<T> {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    const fallback = this.createServiceFallback(serviceName, method, path) as
      | (() => T)
      | (() => Promise<T>);

    return this.circuitBreakerService.executeWithCircuitBreaker<T>(
      async (): Promise<T> => {
        const enhancedHeaders = {
          ...headers,
          'x-user-id': userInfo?.userId,
          'x-user-email': userInfo?.email,
          'x-user-role': userInfo?.role,
        };

        const response = await firstValueFrom(
          this.httpService.request<T>({
            method: method.toLowerCase(),
            url,
            data,
            headers: enhancedHeaders,
            timeout: service.timeout,
          }),
        );

        if (method.toLowerCase() === 'get') {
          this.cacheFallbackService.setCachedData(
            `${serviceName}-${path}`,
            response.data,
          );
        }

        return response.data;
      },
      `proxy-${serviceName}`,
      fallback,
      {
        failureThreshold: 3,
        timeout: 30000,
        resetTimeout: 30000,
      },
    );
  }

  async getServiceHealth(
    serviceName: keyof typeof serviceConfig,
  ): Promise<
    | { status: 'healthy'; data: unknown }
    | { status: 'unhealthy'; error: string }
  > {
    try {
      const service = serviceConfig[serviceName];

      const response = await firstValueFrom(
        this.httpService.get<unknown>(`${service.url}/health`, {
          timeout: 3000,
        }),
      );

      return { status: 'healthy', data: response.data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown health check error';
      return { status: 'unhealthy', error: message };
    }
  }

  private createServiceFallback(
    serviceName: string,
    method: string,
    path: string,
  ) {
    switch (serviceName) {
      case 'users':
        if (path.includes('/auth/login')) {
          return this.defaultFallbackService.createErrorFallback(
            serviceName,
            'Authentication service unavailable',
          );
        }

        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          'User service unavailable',
        );
      case 'products':
        if (method.toLowerCase() === 'get') {
          return this.cacheFallbackService.createCacheFallback(
            `${serviceName}-${path}`,
            { products: [], total: 0, limit: 10 },
          );
        }

        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          'Product service unavailable',
        );
      case 'checkout':
      case 'payments':
        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          ` ${serviceName} service unavailable`,
        );
      default:
        return this.defaultFallbackService.createErrorFallback(
          serviceName,
          'Service unavailable',
        );
    }
  }
}
