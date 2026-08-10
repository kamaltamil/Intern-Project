jest.mock('../../../../controllers/userController', () => ({ listUsers: jest.fn(), getUserById: jest.fn(), createUser: jest.fn(), updateUser: jest.fn(), deleteUser: jest.fn() }));
jest.mock('../../../../middleware/permissionMiddleware', () => ({ requirePermission: jest.fn(() => jest.fn()) }));
jest.mock('../../../../middleware/profileUpload', () => ({ single: jest.fn(() => jest.fn()) }));

test('user routes registers CRUD routes', () => {
  const router = require('../../../../routes/api/v1/users');
  const routes = router.stack.filter((l) => l.route).map((l) => [l.route.path, Object.keys(l.route.methods)]);
  expect(routes).toEqual([
    ['/', ['get']], ['/:id', ['get']], ['/', ['post']], ['/:id', ['patch']], ['/:id', ['delete']],
  ]);
});
