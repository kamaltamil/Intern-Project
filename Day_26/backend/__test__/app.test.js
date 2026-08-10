jest.mock('../routes/api/v1/api', () => jest.fn((req, res, next) => next()));
const app = require('../app');

describe('express app', () => {
  test('configures security', () => {
    expect(app.get('x-powered-by')).toBe(false);
  });

  test('cache middleware sets no-store', () => {
    const stack = app._router?.stack || app.router?.stack || [];
    const layer = stack.find((l) => l.handle && l.handle.length === 3 && String(l.handle).includes('Cache-Control'));
    expect(layer).toBeTruthy();
    const res = { set: jest.fn() };
    layer.handle({}, res, jest.fn());
    expect(res.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });

  test('404 handler forwards error', () => {
    const stack = app._router?.stack || app.router?.stack || [];
    const layer = stack.find((l) => l.handle && l.handle.length === 3 && String(l.handle).includes('createError(404)'));
    expect(layer).toBeTruthy();
    const next = jest.fn();
    layer.handle({}, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  test('error handler returns json', () => {
    const stack = app._router?.stack || app.router?.stack || [];
    const layer = stack.find((l) => l.handle && l.handle.length === 4);
    expect(layer).toBeTruthy();
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    layer.handle({ status: 418, message: 'teapot' }, { app: { get: () => 'test' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'teapot' }));
  });
});
