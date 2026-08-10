jest.mock('../../../../controllers/roomsController', () => ({ createRoom: jest.fn(), getAllRooms: jest.fn() }));
jest.mock('../../../../middleware/permissionMiddleware', () => ({ requirePermission: jest.fn(() => jest.fn()) }));

test('room routes registers routes', () => {
  const router = require('../../../../routes/api/v1/rooms');
  const routes = router.stack.filter((l) => l.route).map((l) => [l.route.path, Object.keys(l.route.methods)]);
  expect(routes).toEqual([['/', ['get']], ['/new', ['post']]]);
});
