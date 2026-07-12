import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from '../proxy/service/proxy.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cart/checkout')
  async checkout(@Body() body: any, @Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'checkout',
      'POST',
      '/cart/checkout',
      body,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Get('orders')
  async getOrders(@Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'checkout',
      'GET',
      '/orders',
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string, @Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'checkout',
      'GET',
      `/orders/${id}`,
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }
}
