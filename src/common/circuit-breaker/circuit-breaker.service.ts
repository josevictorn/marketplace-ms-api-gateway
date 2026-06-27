import { Injectable, Logger } from '@nestjs/common';
import {
  CircuitBreakerStateEnum,
  type CircuitBreakerOptions,
  type CircuitBreakerState,
} from './circuit-breaker.interface';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger('CircuitBreaker');
  private readonly circuit = new Map<string, CircuitBreakerState>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    timeout: 60000, // 60 seconds
    resetTimeout: 30000, // 30 seconds
  };

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    fallback?: () => T | Promise<T>,
    options: CircuitBreakerOptions = this.defaultOptions,
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const circuit = this.getOrCreateCircuit(key, config);

    if (circuit.state === CircuitBreakerStateEnum.OPEN) {
      if (Date.now() > circuit.nextAttemptTime) {
        this.logger.warn(`Circuit breaker OPEN for ${key}, using fallback`);
        if (fallback) {
          return await fallback();
        }

        throw new Error('Circuit breaker OPEN');
      } else {
        circuit.state = CircuitBreakerStateEnum.HALF_OPEN;
        this.logger.warn(
          `Circuit breaker HALF_OPEN for ${key}, using fallback`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess(circuit, key);
      return result;
    } catch (error: unknown) {
      this.onFailure(circuit, key, config);
      const message =
        error instanceof Error ? error.message : 'Unknown operation error';
      this.logger.error(`Circuit breaker failure for ${key}: ${message}`);
      if (fallback) {
        this.logger.log(`Using fallback for ${key}`);
        return await fallback();
      }
      throw error;
    }
  }

  private getOrCreateCircuit(
    key: string,
    options: CircuitBreakerOptions,
  ): CircuitBreakerState {
    if (!this.circuit.has(key)) {
      this.circuit.set(key, {
        state: CircuitBreakerStateEnum.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: Date.now() + options.timeout,
      });
    }
    return this.circuit.get(key)!;
  }

  private onSuccess(circuit: CircuitBreakerState, key: string): void {
    circuit.failureCount = 0;
    circuit.state = CircuitBreakerStateEnum.CLOSED;
    this.logger.debug(`Circuit breaker SUCCESS for ${key}, state: CLOSED`);
  }

  private onFailure(
    circuit: CircuitBreakerState,
    key: string,
    options: CircuitBreakerOptions,
  ): void {
    circuit.failureCount += 1;
    circuit.lastFailureTime = Date.now();

    if (circuit.failureCount >= options.failureThreshold) {
      circuit.state = CircuitBreakerStateEnum.OPEN;
      circuit.nextAttemptTime = Date.now() + options.resetTimeout;
      this.logger.warn(
        `Circuit breaker OPEN for ${key} after ${circuit.failureCount} failures`,
      );
    }
  }

  getCircuitState(key: string): CircuitBreakerState | undefined {
    return this.circuit.get(key);
  }

  getAllCircuits(): Map<string, CircuitBreakerState> {
    return this.circuit;
  }

  resetCircuit(key: string): void {
    if (this.circuit.has(key)) {
      this.circuit.delete(key);
      this.logger.log(`Circuit breaker RESET for ${key}`);
    }
  }
}
