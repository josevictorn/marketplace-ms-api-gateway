import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { Public } from '../decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        accessToken: { type: 'string' },
        sessionToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public()
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user',
  })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @Throttle({ medium: { limit: 3, ttl: 60000 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
