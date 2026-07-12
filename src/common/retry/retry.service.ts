import { Injectable, Logger, HttpException } from '@nestjs/common';
import type { RetryOptions, RetryResult } from './retry.interface';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  private readonly defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 3,
    jitter: true,
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
  ): Promise<RetryResult<T>> {
    const config = {
      ...this.defaultOptions,
      ...options,
    };
    const startTime = Date.now();

    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Retry attempt ${attempt + 1}/${config.maxRetries + 1}`,
        );

        const data = await operation();
        const totalTime = Date.now() - startTime;

        this.logger.log(
          `Operation succeeded on attempt ${attempt + 1} after ${totalTime} ms`,
        );

        return {
          success: true,
          data,
          attempts: attempt + 1,
          localTime: totalTime,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `Attempt ${attempt + 1} failed: ${lastError.message}`,
        );

        if (error instanceof HttpException && error.getStatus() < 500) {
          throw error;
        }

        if (attempt < config.maxRetries) {
          const delay = this.calculateDelay(attempt, config);
          this.logger.debug(`Waiting for ${delay} ms before next attempt`);
          await this.delay(delay);
        }
      }
    }

    const totalTime = Date.now() - startTime;
    this.logger.error(
      `All ${config.maxRetries + 1} attempts failed after ${totalTime} ms`,
    );

    return {
      success: false,
      error: lastError!,
      attempts: config.maxRetries + 1,
      localTime: totalTime,
    };
  }

  private calculateDelay(attempt: number, options: RetryOptions): number {
    let delay =
      options.baseDelay * Math.pow(options.backoffMultiplier, attempt);

    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5); // Randomize delay between 50% and 100%
    }

    return Math.min(delay, options.maxDelay);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    const result = await this.executeWithRetry(operation, {
      maxRetries,
    });

    if (!result.success) {
      throw result.error!;
    }

    return result.data!;
  }
}
