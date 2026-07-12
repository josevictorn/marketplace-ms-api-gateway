import {
  Controller,
  Get,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from '../proxy/service/proxy.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../guard/auth.guard';

interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get(':orderId')
  async getPayment(@Param('orderId') orderId: string, @Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'payments',
      'GET',
      `/payments/${orderId}`,
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }
}
