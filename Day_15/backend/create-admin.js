const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./src/models/user');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const username = 'admin';
    const password = 'admin@123';
    const email = 'admin@local.dev';

    let user = await User.findOne({ $or: [{ username }, { email }] });

    if (user) {
      user.name = 'Admin';
      user.username = username;
      user.email = email;
      user.password = await bcrypt.hash(password, 10);
      user.role = 'Admin';
      await user.save();
      console.log('Updated admin user:', JSON.stringify({ username: user.username, email: user.email, role: user.role }, null, 2));
    } else {
      const created = await User.create({
        name: 'Admin',
        email,
        username,
        password: await bcrypt.hash(password, 10),
        role: 'Admin',
      });
      console.log('Created admin user:', JSON.stringify({ username: created.username, email: created.email, role: created.role }, null, 2));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
