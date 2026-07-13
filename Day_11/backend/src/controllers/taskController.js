const { getAllUsers, getUserById, getUserTasks, getTasksByQuery, createTask, updateTaskStatus, loginUser } = require('../models/taskModel');

const getUsers = (req, res) => {
  try {
    if (req.params.userId) {
      const user = getUserById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    }

    const users = getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const getTasksByUser = (req, res) => {
  try {
    const tasks = req.params.userId
      ? getUserTasks(req.params.userId)
      : getTasksByQuery(req.query);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

const addTask = (req, res) => {
  try {
    const { userId, title, status } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: 'userId and title are required' });
    }

    const task = createTask({ userId, title, status });
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

const changeTaskStatus = (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const task = updateTaskStatus(taskId, status);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

const login = (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // Trim whitespace from inputs
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password).trim();

    const result = loginUser({ email: trimmedEmail, password: trimmedPassword });
    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      token: result.session.token,
      userId: result.user.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { getUsers, getTasksByUser, addTask, changeTaskStatus, login };