const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('GET /users returns users without passwords', async () => {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/users`);
    assert.equal(response.status, 200);

    const users = await response.json();
    assert.ok(Array.isArray(users));
    assert.equal(users.length > 0, true);
    assert.ok(users.every((user) => !('password' in user)));
  } finally {
    server.close();
  }
});

test('GET /tasks supports filtering by userId query', async () => {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/tasks?userId=user_01`);
    assert.equal(response.status, 200);

    const tasks = await response.json();
    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.every((task) => String(task.userId) === 'user_01'));
  } finally {
    server.close();
  }
});

test('PATCH /tasks/:taskId updates task status', async () => {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/tasks/task_101`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });

    assert.equal(response.status, 200);
    const task = await response.json();
    assert.equal(task.status, 'Completed');
  } finally {
    server.close();
  }
});
