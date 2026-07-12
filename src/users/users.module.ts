import { Module } from '@nestjs/common';
import { AuthProxyController, UsersProxyController } from './users.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [AuthProxyController, UsersProxyController],
})
export class UsersModule {}
