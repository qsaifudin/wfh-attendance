import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Kept in one place so it can double as the frontend's demo-login source of
// truth — frontend/src/lib/demo-accounts.ts must list the same three.
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'attendance123';

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing'];

const JAKARTA = { lat: -6.2088, lng: 106.8456 };

function jitter(base: number, spread: number) {
  return base + (Math.random() - 0.5) * spread;
}

function randomTimeToday(dateUtc: Date, hour: number, minuteSpread: number): Date {
  const minutes = Math.max(0, Math.round(hour * 60 + (Math.random() - 0.5) * minuteSpread));
  const result = new Date(dateUtc);
  result.setUTCHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return result;
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

async function main() {
  console.log('Seeding...');

  await prisma.attendances.deleteMany();
  await prisma.employees.deleteMany();
  await prisma.users.deleteMany();
  await prisma.departments.deleteMany();
  await prisma.attendance_settings.deleteMany();

  const departments = await Promise.all(
    DEPARTMENTS.map((name) => prisma.departments.create({ data: { name } })),
  );

  await prisma.attendance_settings.create({
    data: { id: 1, late_tolerance_time: '09:30', require_location: true },
  });

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const adminUser = await prisma.users.create({
    data: { email: 'admin@attendance.com', password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' },
  });

  const employeeSeeds = [
    { name: 'Saifudin', position: 'Software Engineer', dept: 0, email: 'saifudin@attendance.com', photo: true },
    { name: 'Budi Santoso', position: 'Backend Engineer', dept: 0, email: 'budi@attendance.com', photo: false },
    { name: 'Siti Rahayu', position: 'QA Engineer', dept: 0, email: 'siti@attendance.com', photo: true },
    { name: 'Agus Wijaya', position: 'HR Specialist', dept: 1, email: 'agus@attendance.com', photo: false },
    { name: 'Rina Kartika', position: 'Recruiter', dept: 1, email: 'rina@attendance.com', photo: true },
    { name: 'Hendra Gunawan', position: 'Accountant', dept: 2, email: 'hendra@attendance.com', photo: false },
    { name: 'Maya Puspita', position: 'Finance Analyst', dept: 2, email: 'maya@attendance.com', photo: true },
    { name: 'Fajar Ramadhan', position: 'Marketing Executive', dept: 3, email: 'fajar@attendance.com', photo: false },
    {
      name: 'Nadia Permata',
      position: 'Content Strategist',
      dept: 3,
      email: 'nadia@attendance.com',
      photo: true,
      inactive: true,
    },
  ];

  const employees = [];
  for (const seed of employeeSeeds) {
    const user = await prisma.users.create({
      data: {
        email: seed.email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        status: seed.inactive ? 'INACTIVE' : 'ACTIVE',
      },
    });
    const employee = await prisma.employees.create({
      data: {
        user_id: user.id,
        full_name: seed.name,
        position: seed.position,
        department_id: departments[seed.dept].id,
        photo_key: seed.photo ? `uploads/demo-${user.id}.png` : null,
        photo_url: seed.photo
          ? `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(seed.name)}`
          : null,
      },
    });
    employees.push({ ...employee, inactive: !!seed.inactive });
  }

  console.log('Seeding ~30 days of attendance history...');
  const activeEmployees = employees.filter((e) => !e.inactive);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const workDate = new Date(todayUtc);
    workDate.setUTCDate(workDate.getUTCDate() - daysAgo);
    if (!isWeekday(workDate)) continue;

    for (const employee of activeEmployees) {
      // A few realistic gaps — nobody has a perfect attendance record.
      if (Math.random() < 0.08) continue;

      const isLate = Math.random() < 0.22;
      const clockInAt = isLate
        ? randomTimeToday(workDate, 10, 90)
        : randomTimeToday(workDate, 8.5, 60);

      await prisma.attendances.create({
        data: {
          employee_id: employee.id,
          work_date: workDate,
          clock_in_at: clockInAt,
          photo_key: `uploads/demo-attendance-${employee.id}-${workDate.toISOString().slice(0, 10)}.jpg`,
          photo_url: `https://picsum.photos/seed/${employee.id}-${daysAgo}/400/400`,
          latitude: jitter(JAKARTA.lat, 0.15),
          longitude: jitter(JAKARTA.lng, 0.15),
          status: isLate ? 'LATE' : 'PRESENT',
          applied_late_tolerance_time: '09:30',
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log('');
  console.log('Demo accounts (password for all: ' + DEMO_PASSWORD + '):');
  console.log('  Admin:              admin@attendance.com');
  console.log('  Employee:           saifudin@attendance.com');
  console.log('  Deactivated (demo): nadia@attendance.com');
  console.log(`Admin user id: ${adminUser.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
