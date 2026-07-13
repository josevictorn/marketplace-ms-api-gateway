import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: promClient.Counter<string>;
  private readonly httpRequestDuration: promClient.Histogram<string>;

  constructor() {
    promClient.collectDefaultMetrics();

    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total de requisições recebidas pelo gateway',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duração das requisições em segundos',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5, 10],
    });
  }

  getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }

  incrementHttpRequestsTotal(
    method: string,
    route: string,
    statusCode: number,
  ) {
    this.httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
  }

  observeHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }
}
