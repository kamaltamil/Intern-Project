jest.mock('../../models/role', () => ({ findOne: jest.fn() }));
const Role = require('../../models/role');
const { getPermissionsForRole, hasPermission } = require('../../services/permissionService');

describe('permissionService', () => {
  beforeEach(() => jest.clearAllMocks());
  test('returns empty map without role', async () => expect(await getPermissionsForRole()).toEqual({}));
  test('returns empty map when role missing', async () => { Role.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }); expect(await getPermissionsForRole('Member')).toEqual({}); });
  test('maps role permissions', async () => { Role.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ permissions: [{ resource: 'users', action: { view: true } }] }) }); expect(await getPermissionsForRole('Member')).toEqual({ users: { view: true } }); });
  test('checks allowed and denied permissions', async () => { Role.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ permissions: [{ resource: 'users', action: { view: true } }] }) }); expect(await hasPermission('Member','users','view')).toBe(true); expect(await hasPermission('Member','users','delete')).toBe(false); });
});
