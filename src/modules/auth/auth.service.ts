import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import { AuthServiceInterface } from './interface/auth-service.interface';
import { USER_SERVICE } from '../user/user.constants';
import { UserServiceInterface } from '../user/interface/user-service.interface';
import { AuthInterface } from './interface/auth.interface';
import { SignUpDTO } from './dto/sign-up.dto';
import { SignInDTO } from './dto/sign-in.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { TOKEN_SERVICE } from './auth.constants';
import { TokenService } from './token.service';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: UserServiceInterface,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  public async signUp(dto: SignUpDTO): Promise<AuthInterface> {
    if (await this.userService.findByEmail(dto.email)) {
      throw new BadRequestException('Wrong credentials');
    }

    const user = await this.userService.create(dto);
    const { accessToken, refreshToken } = this.tokenService.signTokens(user);

    return { accessToken, refreshToken, user };
  }

  public async signIn(dto: SignInDTO): Promise<AuthInterface> {
    const { email, password } = dto;

    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('Wrong credentials');

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) throw new BadRequestException('Wrong credentials');

    const { accessToken, refreshToken } = this.tokenService.signTokens(user);

    return { accessToken, refreshToken, user };
  }

  public async refreshToken(dto: RefreshTokenDTO): Promise<AuthInterface> {
    const JWTPayload = this.tokenService.verifyRefreshToken(dto.refreshToken);

    const user = await this.userService.findById(String(JWTPayload.id));

    const { accessToken, refreshToken } = this.tokenService.signTokens(user);

    return { accessToken, refreshToken, user };
  }
}
