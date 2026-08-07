require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const Role = require('./models/role');
const User = require('./models/users');
const MODULE_LIST = require('./constants/modules');

const MODULES = Object.values(MODULE_LIST);
const DEFAULT_ROLE_NAME = 'Member'; // role auto-assigned to new signups

const ROLE_SEEDS = [
  {
    name: 'Admin',
    description: 'Full system access — can manage all modules, users, roles, bookings and reports.',
    color: '#f5222d', // Red
    permissions: {
      dashboard: { view: true,  create: true,  update: true,  delete: true  },
      users:     { view: true,  create: true,  update: true,  delete: true  },
      roles:     { view: true,  create: true,  update: true,  delete: true  },
      bookings:  { view: true,  create: true,  update: true,  delete: true  },
      rooms:     { view: true,  create: true,  update: true,  delete: true  },
      approval:  { view: true,  create: true,  update: true,  delete: true  },
      reports:   { view: true,  create: true,  update: true,  delete: true  },
      profile:   { view: true,  create: false, update: true,  delete: false },
    },
  },
  {
    name: 'Manager',
    description: 'Can manage bookings, approve requests, view reports and manage their profile.',
    color: '#fa8c16', // Orange
    permissions: {
      dashboard: { view: true,  create: false, update: false, delete: false },
      users:     { view: true,  create: false, update: false, delete: false },
      roles:     { view: false, create: false, update: false, delete: false },
      bookings:  { view: true,  create: true,  update: true,  delete: false },
      rooms:     { view: true,  create: false, update: false, delete: false },
      approval:  { view: true,  create: false, update: true,  delete: false },
      reports:   { view: true,  create: false, update: false, delete: false },
      profile:   { view: true,  create: false, update: true,  delete: false },
    },
  },
  {
    name: 'Member',
    description: 'Standard user — can view and create bookings, manage their own profile.',
    color: '#1890ff', // Blue
    permissions: {
      dashboard: { view: true,  create: false, update: false, delete: false },
      users:     { view: false, create: false, update: false, delete: false },
      roles:     { view: false, create: false, update: false, delete: false },
      bookings:  { view: true,  create: true,  update: false, delete: false },
      rooms:     { view: true,  create: false, update: false, delete: false },
      approval:  { view: false, create: false, update: false, delete: false },
      reports:   { view: false, create: false, update: false, delete: false },
      profile:   { view: true,  create: false, update: true,  delete: false },
    },
  },
];

const USER_SEEDS = [
  { name: 'Admin User',   email: 'admin@hotelpro.com',   username: 'admin',   role: 'Admin',   password: 'Password123' },
  { name: 'Manager User', email: 'manager@hotelpro.com', username: 'manager', role: 'Manager', password: 'Password123' },
  { name: 'Member User',  email: 'member@hotelpro.com',  username: 'member',  role: 'Member',  password: 'Password123' },
];

async function seed() {
  await connectDB();

  const force = process.argv.includes('--force');

  if (force) {
    console.log('⚠️  --force: dropping existing seeded roles...');
    await Role.deleteMany({ name: { $in: ROLE_SEEDS.map(r => r.name) } });
    console.log('🗑️  Done.\n');
  }

  for (const roleSeed of ROLE_SEEDS) {
    const isDefault = roleSeed.name === DEFAULT_ROLE_NAME;
    const exists = await Role.findOne({ name: roleSeed.name });

    if (exists && !force) {
      // Backfill new fields on an already-seeded DB without wiping it.
      let changed = false;
      if (!exists.color) { exists.color = roleSeed.color; changed = true; }
      if (exists.isSystem !== true) { exists.isSystem = true; changed = true; }
      if (exists.isDefault !== isDefault) { exists.isDefault = isDefault; changed = true; }
      if (changed) {
        await exists.save();
        console.log(`🔧 "${roleSeed.name}" already existed — backfilled isSystem/isDefault/color.`);
      } else {
        console.log(`⏭️  "${roleSeed.name}" already up to date.`);
      }
      continue;
    }

    await Role.create({
      name: roleSeed.name,
      description: roleSeed.description,
      color: roleSeed.color,
      isSystem: true,
      isDefault,
      permissions: MODULES.map(resource => ({
        resource,
        action: roleSeed.permissions[resource],
      })),
    });

    console.log(`✅ "${roleSeed.name}" seeded with color ${roleSeed.color}`);
  }

  console.log('\n👤 Seeding test users...');
  for (const userSeed of USER_SEEDS) {
    const exists = await User.findOne({ email: userSeed.email });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(userSeed.password, 10);
      await User.create({
        name: userSeed.name,
        email: userSeed.email,
        username: userSeed.username,
        password: hashedPassword,
        role: userSeed.role,
      });
      console.log(`✅ User seeded: ${userSeed.email} (${userSeed.role}) — password: Password123`);
    } else {
      console.log(`⏭️ User "${userSeed.email}" already exists.`);
    }
  }

  console.log('\n✨ Seeding complete.');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });