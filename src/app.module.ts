import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaseTypeModule } from './modules/caseType/caseType.module';
import { CategoryModule } from './modules/category/category.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { CaseMediaModule } from './modules/case-media/case-media.module';
import { CasesModule } from './modules/case/case.module';
import { SupabaseModule } from './modules/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // يجعل المتغيرات متاحة في كل Modules
    }),
    AuthModule,
    UserModule,
    CaseTypeModule,
    CategoryModule,
    OrganizationModule,
    PaymentMethodModule,
    CaseMediaModule,
    SupabaseModule,
    CaseMediaModule,
    CasesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
