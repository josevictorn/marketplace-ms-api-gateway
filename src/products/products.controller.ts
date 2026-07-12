import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { ProxyService } from '../proxy/service/proxy.service';
import { Public } from '../auth/decorators/public.decorator';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('products')
export class ProductsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  async createProduct(@Body() body: any, @Req() req: CustomRequest) {
    const headers = {
      Authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'products',
      'POST',
      '/products',
      body,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Public()
  @Get()
  async getProducts() {
    return this.proxyService.proxyRequest('products', 'GET', '/products');
  }

  @Public()
  @Get('seller/:sellerId')
  async getProductsBySeller(@Param('sellerId') sellerId: string) {
    return this.proxyService.proxyRequest(
      'products',
      'GET',
      `/products/seller/${sellerId}`,
    );
  }

  @Public()
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.proxyService.proxyRequest('products', 'GET', `/products/${id}`);
  }
}
