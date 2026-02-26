import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard) // كل الراوتات تتطلب توكن
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard) // يجب أن يكون المستخدم مسجلاً
  @Get('me')
  getCurrentUser(@CurrentUser() user) {
    // نرجع نسخة من الـ DTO
    return plainToInstance(UserResponseDto, user);
  }
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can create users');
    }
    const newUser = await this.userService.create(createUserDto);
    return plainToInstance(UserResponseDto, newUser);
  }

  // فقط ADMIN يمكنه رؤية كل المستخدمين
  @Get()
  async findAll(@CurrentUser() user) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can see all users');
    }
    const users = await this.userService.findAll();
    return users.map((u) => plainToInstance(UserResponseDto, u));
  }

  // المستخدم العادي يمكنه رؤية بياناته فقط
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    const u = await this.userService.findOne(id);
    return plainToInstance(UserResponseDto, u);
  }

  // التحديث: ADMIN يمكنه تحديث أي مستخدم، USER يمكنه تحديث نفسه فقط
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user,
  ) {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    const u = await this.userService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, u);
  }

  // الحذف: في الواقع "تعطيل" فقط، ADMIN فقط
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can deactivate users');
    }
    await this.userService.deactivate(id);
    return { message: `User with id ${id} deactivated successfully` };
  }
}
