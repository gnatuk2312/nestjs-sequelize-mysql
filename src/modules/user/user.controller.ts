import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { CreateUserDTO } from './dto/create-user.dto';
import { USER_MAPPER, USER_SERVICE } from './user.constants';
import { UserServiceInterface } from './interface/user-service.interface';
import { UserMapperInterface } from './interface/user-mapper.interface';
import { UserDTO } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: UserServiceInterface,
    @Inject(USER_MAPPER) private readonly userMapper: UserMapperInterface,
  ) {}

  @Post()
  public async create(@Body() dto: CreateUserDTO): Promise<UserDTO> {
    return this.userMapper.mapToUserDTO(await this.userService.create(dto));
  }

  @Get()
  public async findAll(): Promise<UserDTO[]> {
    return this.userMapper.mapAllToUserDTO(await this.userService.findAll());
  }

  @Get('/:id')
  public async findById(@Param('id') id: string): Promise<UserDTO> {
    return this.userMapper.mapToUserDTO(await this.userService.findById(id));
  }
}
