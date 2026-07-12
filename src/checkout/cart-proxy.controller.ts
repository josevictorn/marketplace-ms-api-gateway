import {
  Controller,
  Get,
  Post,
  Delete,
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

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('items')
  async addItem(@Body() body: any, @Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'checkout',
      'POST',
      '/cart/items',
      body,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Get()
  async getCart(@Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'checkout',
      'GET',
      '/cart',
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string, @Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'checkout',
      'DELETE',
      `/cart/items/${itemId}`,
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }
}
