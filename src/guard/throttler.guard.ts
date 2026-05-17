import { Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  type ThrottlerRequest,
} from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Promise.resolve(`${req.ip}-${req.headers['user-agent']}`);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, ttl, limit } = requestProps;
    const { req, res } = this.getRequestResponse(context);
    const throttles = this.reflector.get('throttles', context.getHandler());
    const throttlerName = throttles ? Object.keys(throttles)[0] : 'default';
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, throttlerName);

    const totalHits = this.storageService.increment(
      key,
      ttl,
      limit,
      1,
      throttlerName,
    );

    if (Number(totalHits) > limit) {
      res.setHeader('Retry-After', Math.round(ttl / 1000));
      throw new ThrottlerException();
    }

    res.setHeader(`${this.headerPrefix}-Limit`, limit);
    res.setHeader(
      `${this.headerPrefix}-Remaining`,
      Math.max(limit - Number(totalHits), 0),
    );
    res.setHeader(`${this.headerPrefix}-Reset`, Math.round(ttl / 1000));
    return true;
  }
}
