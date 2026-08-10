const { validatePermissionsPayload } = require('../../validators/roleValidator');
const MODULES = require('../../constants/modules');

const run = (permissions) => {
  const req = { body: { permissions } };
  const json = jest.fn();
  const res = { status: jest.fn(() => ({ json })) };
  const next = jest.fn();
  validatePermissionsPayload(req, res, next);
  return { req, res, json, next };
};

describe('validatePermissionsPayload', () => {
  test('allows omitted permissions', () => {
    const req = { body: {} }, next = jest.fn();
    validatePermissionsPayload(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
  test.each([
    [null, 'permissions must be an array'],
    ['bad', 'permissions must be an array'],
    [{}, 'permissions must be an array'],
  ])('rejects non-array permissions', (permissions, message) => {
    const r = run(permissions); expect(r.res.status).toHaveBeenCalledWith(400); expect(r.json).toHaveBeenCalledWith({ message });
  });
  test('rejects non-object entry', () => {
    const r = run([null]); expect(r.json).toHaveBeenCalledWith({ message: 'Each permission entry must be an object' });
  });
  test('rejects invalid module', () => {
    const r = run([{ resource: 'invalid', action: {} }]); expect(r.json).toHaveBeenCalledWith({ message: 'Invalid module: invalid' });
  });
  test('rejects invalid action name', () => {
    const r = run([{ resource: MODULES.USERS, action: { execute: true } }]); expect(r.json).toHaveBeenCalledWith({ message: 'Invalid permission action: execute' });
  });
  test('rejects non-boolean action', () => {
    const r = run([{ resource: MODULES.USERS, action: { view: 'yes' } }]); expect(r.json).toHaveBeenCalledWith({ message: 'Permission action "view" must be true or false' });
  });
  test.each(['create', 'update', 'delete'])('requires view when %s is enabled', (action) => {
    const r = run([{ resource: MODULES.USERS, action: { [action]: true, view: false } }]);
    expect(r.json).toHaveBeenCalledWith({ message: '"users": view must be enabled if create, update, or delete is enabled' });
  });
  test('accepts valid permissions and missing action', () => {
    const r = run([{ resource: MODULES.USERS, action: { view: true } }, { resource: MODULES.ROLES }]);
    expect(r.next).toHaveBeenCalled();
  });
});
