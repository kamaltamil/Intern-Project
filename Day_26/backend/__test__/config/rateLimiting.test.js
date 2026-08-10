test('creates configured limiter', () => {
  jest.resetModules();
  jest.doMock('express-rate-limit', () => jest.fn((opts) => opts));
  const rateLimit = require('express-rate-limit');
  const { rateLimiter } = require('../../config/rateLimiting');
  expect(rateLimit).toHaveBeenCalledWith(expect.objectContaining({ windowMs: 240000, max: 100, standardHeaders: true, legacyHeaders: false }));
  const options = rateLimit.mock.calls[0][0];
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  options.handler({}, res);
  expect(res.status).toHaveBeenCalledWith(429);
  expect(res.json).toHaveBeenCalledWith({ message: 'Too many attempts, Please try again' });
  expect(rateLimiter).toEqual(options);
});
