const { readDB, writeDB } = require('../utils/db');

const getAllUsers = () => {
  const db = readDB();
  return db.users.map(({ password, ...safeUser }) => safeUser);
};

const getUserById = (userId) => {
  const db = readDB();
  const user = db.users.find((item) => String(item.id) === String(userId));
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const getUserTasks = (userId) => {
  const db = readDB();
  return db.tasks.filter((task) => String(task.userId) === String(userId));
};

const getTasksByQuery = (query = {}) => {
  const db = readDB();
  const { userId } = query;

  if (!userId) {
    return db.tasks;
  }

  return db.tasks.filter((task) => String(task.userId) === String(userId));
};

const createTask = ({ userId, title, status }) => {
  const db = readDB();
  const newTask = {
    id: Math.random().toString(36).substring(2, 11),
    userId,
    title,
    completed: false,
    status: status || 'In Progress'
  };

  db.tasks.push(newTask);
  writeDB(db);
  return newTask;
};

const updateTaskStatus = (taskId, status) => {
  const db = readDB();
  const taskIndex = db.tasks.findIndex((task) => String(task.id) === String(taskId));

  if (taskIndex === -1) {
    return null;
  }

  db.tasks[taskIndex].status = status;
  db.tasks[taskIndex].completed = status === 'Completed';
  writeDB(db);
  return db.tasks[taskIndex];
};

const loginUser = ({ email, password }) => {
  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return null;
  }

  const newSession = {
    id: Math.random().toString(36).substring(2, 13),
    token: 'session_' + Math.random().toString(36).substring(2, 11),
    userId: user.id,
    createdAt: new Date().toISOString()
  };

  db.sessions.push(newSession);
  writeDB(db);

  return { user, session: newSession };
};

module.exports = { getAllUsers, getUserById, getUserTasks, getTasksByQuery, createTask, updateTaskStatus, loginUser };