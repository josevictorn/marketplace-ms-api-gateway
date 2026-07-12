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

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Post('register')
  async register(@Body() body: any) {
    return this.proxyService.proxyRequest(
      'users',
      'POST',
      '/auth/register',
      body,
    );
  }

  @Public()
  @Post('login')
  async login(@Body() body: any) {
    return this.proxyService.proxyRequest('users', 'POST', '/auth/login', body);
  }

  @Get('validate-token')
  async validateToken(@Req() req: CustomRequest) {
    const headers = {
      authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      '/auth/validate-token',
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }
}

@Controller('users')
export class UsersProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('profile')
  async getProfile(@Req() req: CustomRequest) {
    const headers = {
      authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      '/users/profile',
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Get('sellers')
  async getSellers(@Req() req: CustomRequest) {
    const headers = {
      authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      '/users/sellers',
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: CustomRequest) {
    const headers = {
      authorization: req.headers.authorization,
    };
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      `/users/${id}`,
      undefined,
      headers as Record<string, string>,
      req.user,
    );
  }
}
