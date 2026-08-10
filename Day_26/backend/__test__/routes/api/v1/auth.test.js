const express = require('express');
jest.mock('../../../../controllers/authController', () => ({ register: jest.fn(), login: jest.fn(), refresh: jest.fn(), profile: jest.fn(), logout: jest.fn() }));
jest.mock('../../../../middleware/auth', () => ({ authenticateToken: jest.fn() }));

describe('auth routes', () => {
  test('registers public and protected routes', () => {
    const router = require('../../../../routes/api/v1/auth');
    const routes = router.stack.filter((layer) => layer.route).map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));
    expect(routes).toEqual([
      { path: '/signup', methods: ['post'] },
      { path: '/login', methods: ['post'] },
      { path: '/refresh', methods: ['post'] },
      { path: '/profile', methods: ['get'] },
      { path: '/logout', methods: ['post'] },
    ]);
  });
});
