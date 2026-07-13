import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, route, url } = req;

    // Ignore metrics and health endpoints
    if (url === '/metrics' || url === '/health') {
      return next.handle();
    }

    const path = route ? route.path : url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const statusCode = res.statusCode;
          const duration = (Date.now() - startTime) / 1000;

          this.metricsService.incrementHttpRequestsTotal(
            method,
            path,
            statusCode,
          );
          this.metricsService.observeHttpRequestDuration(
            method,
            path,
            statusCode,
            duration,
          );
        },
        error: (error) => {
          const statusCode = error.status || 500;
          const duration = (Date.now() - startTime) / 1000;

          this.metricsService.incrementHttpRequestsTotal(
            method,
            path,
            statusCode,
          );
          this.metricsService.observeHttpRequestDuration(
            method,
            path,
            statusCode,
            duration,
          );
        },
      }),
    );
  }
}
