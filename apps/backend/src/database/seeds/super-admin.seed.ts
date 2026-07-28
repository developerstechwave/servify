import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../module/auth/entities/user.entity';

async function seed() {
  const dataSource = new DataSource(
    process.env.DATABASE_URL
      ? {
          type:        'postgres',
          url:         process.env.DATABASE_URL,
          entities:    [User],
          synchronize: true,
          ssl:         { rejectUnauthorized: false },
        }
      : {
          type:        'postgres',
          host:        process.env.DB_HOST     || 'localhost',
          port:        parseInt(process.env.DB_PORT || '5432'),
          username:    process.env.DB_USER     || 'postgres',
          password:    process.env.DB_PASSWORD || '',
          database:    process.env.DB_NAME     || 'servify_db',
          entities:    [User],
          synchronize: true,
        }
  );

  await dataSource.initialize();
  console.log('Connected to database');

  const userRepo = dataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: 'superadmin@servify.com' },
  });

  if (existing) {
    console.log('Super admin already exists — skipping');
    await dataSource.destroy();
    return;
  }

  const superAdmin = userRepo.create({
    email:     'superadmin@servify.com',
    password:  await bcrypt.hash('Admin@1234', 12),
    firstName: 'Super',
    lastName:  'Admin',
    role:      UserRole.SUPER_ADMIN,
    isActive:  true,
  });

  await userRepo.save(superAdmin);
  console.log('Super admin created successfully');
  console.log('Email:    superadmin@servify.com');
  console.log('Password: Admin@1234');

  await dataSource.destroy();
}

seed().catch(console.error);
