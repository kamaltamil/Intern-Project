jest.mock('../../../../controllers/roleController', () => ({ createRoleHandler: jest.fn(), listRoles: jest.fn(), getRole: jest.fn(), updateRoleHandler: jest.fn(), deleteRoleHandler: jest.fn() }));
jest.mock('../../../../middleware/auth', () => ({ hasPermission: jest.fn(() => jest.fn()) }));

test('role routes registers CRUD routes', () => {
  const router = require('../../../../routes/api/v1/roles');
  const routes = router.stack.filter((l) => l.route).map((l) => [l.route.path, Object.keys(l.route.methods)]);
  expect(routes).toEqual([
    ['/', ['get']], ['/:id', ['get']], ['/', ['post']], ['/:id', ['patch']], ['/:id', ['delete']],
  ]);
});
