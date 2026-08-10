jest.mock('../../../../controllers/bookingController', () => ({ bookRoom: jest.fn(), getBookings: jest.fn(), updateBookingHandler: jest.fn(), deleteBookingHandler: jest.fn() }));
jest.mock('../../../../middleware/permissionMiddleware', () => ({ requirePermission: jest.fn(() => jest.fn()) }));

test('booking routes registers CRUD routes', () => {
  const router = require('../../../../routes/api/v1/booking');
  const routes = router.stack.filter((l) => l.route).map((l) => [l.route.path, Object.keys(l.route.methods)]);
  expect(routes).toEqual([
    ['/', ['get']], ['/new', ['post']], ['/:id', ['patch']], ['/:id', ['delete']],
  ]);
});
