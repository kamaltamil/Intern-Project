const express = require('express');
const { getUsers, getTasksByUser, addTask, changeTaskStatus, login } = require('../controllers/taskController');

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:userId', getUsers);
router.get('/tasks', getTasksByUser);
router.get('/tasks/user/:userId', getTasksByUser);
router.post('/tasks', addTask);
router.patch('/tasks/:taskId', changeTaskStatus);
router.post('/login', login);

module.exports = router;