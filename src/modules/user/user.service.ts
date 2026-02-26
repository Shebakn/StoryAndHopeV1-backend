/* eslint-disable prettier/prettier */
// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // إنشاء مستخدم جديد
  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  // جلب كل المستخدمين
  async findAll() {
    return this.prisma.user.findMany();
  }

  // جلب مستخدم واحد
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // تحديث بيانات مستخدم
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // تأكد أن المستخدم موجود
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  // تعطيل المستخدم بدل الحذف
  async deactivate(id: string) {
    await this.findOne(id); // تأكد أن المستخدم موجود
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}