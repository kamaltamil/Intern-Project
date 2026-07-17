const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'task-secret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager_db';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    next();
  };
}

async function seedDatabase() {
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      password: bcrypt.hashSync('admin@123', 10),
      role: 'Admin',
    });
  }

  const demoUsers = ['alice', 'bob', 'carol', 'david', 'emma', 'fahad', 'grace', 'hassan', 'ivy', 'jane'];
  for (const username of demoUsers) {
    const exists = await User.findOne({ username });
    if (!exists) {
      await User.create({
        username,
        password: bcrypt.hashSync('password123', 10),
        role: 'User',
      });
    }
  }

  const taskCount = await Task.countDocuments();
  if (taskCount === 0) {
    const users = await User.find({ role: 'User' });
    const templates = [
      { title: 'Design homepage', description: 'Create a polished landing view', status: 'pending' },
      { title: 'Review API docs', description: 'Check the latest endpoint updates', status: 'completed' },
      { title: 'Fix login bug', description: 'Validate the auth flow for users', status: 'pending' },
      { title: 'Plan sprint goals', description: 'Prepare items for the next sprint', status: 'pending' },
      { title: 'Write release notes', description: 'Draft the summary for the release', status: 'completed' },
    ];

    for (let index = 0; index < templates.length; index += 1) {
      const template = templates[index];
      const assignedUser = users[index % users.length];
      await Task.create({
        title: template.title,
        description: template.description,
        status: template.status,
        assignedTo: assignedUser._id,
      });
    }
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running' });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = await User.create({
    username,
    password: bcrypt.hashSync(password, 10),
    role: 'User',
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: newUser.id, username: newUser.username, role: newUser.role },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = generateToken(user);

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

app.get('/api/tasks', authenticate, authorize('Admin', 'User'), async (req, res) => {
  if (req.user.role === 'Admin') {
    const tasks = await Task.find().populate('assignedTo', 'username role');
    return res.json(tasks);
  }

  const tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedTo', 'username role');
  return res.json(tasks);
});

app.post('/api/tasks', authenticate, authorize('Admin', 'User'), async (req, res) => {
  const { title, description, status = 'pending', assignedTo } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Status must be pending or completed' });
  }

  const targetUser = req.user.role === 'Admin' && assignedTo
    ? await User.findById(assignedTo)
    : await User.findById(req.user.id);

  if (!targetUser) {
    return res.status(404).json({ message: 'Assigned user not found' });
  }

  const task = await Task.create({
    title,
    description,
    status,
    assignedTo: targetUser._id,
  });

  res.status(201).json(task);
});

app.put('/api/tasks/:id', authenticate, authorize('Admin', 'User'), async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (req.user.role === 'User' && task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only modify your own tasks' });
  }

  Object.assign(task, req.body);
  await task.save();
  res.json(task);
});

app.delete('/api/tasks/:id', authenticate, authorize('Admin', 'User'), async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (req.user.role === 'User' && task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own tasks' });
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted successfully' });
});

app.get('/api/users', authenticate, authorize('Admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.put('/api/users/:id/role', authenticate, authorize('Admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { role } = req.body;
  if (!['User', 'Admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be User or Admin' });
  }

  user.role = role;
  await user.save();
  res.json({ message: 'User role updated', user });
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    await seedDatabase();

    const port = Number(process.env.PORT) || 8080;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
