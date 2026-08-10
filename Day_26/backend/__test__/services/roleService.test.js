jest.mock('../../models/role',()=>({findOne:jest.fn(),find:jest.fn(),findById:jest.fn(),create:jest.fn(),updateMany:jest.fn(),findByIdAndDelete:jest.fn()}));
jest.mock('../../models/user',()=>({countDocuments:jest.fn()}));
const Role=require('../../models/role'),User=require('../../models/user'); const svc=require('../../services/roleService');
const chain=(v)=>{const p={populate:jest.fn(),sort:jest.fn()};p.populate.mockReturnValue(p);p.sort.mockResolvedValue(v);return p;};
const baseRole={_id:'r1',name:'Manager',isSystem:false,isDefault:false,permissions:[],save:jest.fn()};
describe('roleService',()=>{beforeEach(()=>jest.clearAllMocks());
 test('builds complete permission map',()=>{expect(svc.buildPermissions([{resource:'users',action:{create:true}}])).toHaveLength(7); expect(svc.buildPermissions().every(x=>x.action.view===false)).toBe(true);});
 test('create validates and duplicate',async()=>{await expect(svc.createRole({name:' '})).rejects.toMatchObject({statusCode:400}); Role.findOne.mockResolvedValueOnce({}); await expect(svc.createRole({name:'Manager'})).rejects.toMatchObject({statusCode:409});});
 test('creates default role when none exists',async()=>{Role.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null); Role.create.mockResolvedValue({name:'Manager'}); await expect(svc.createRole({name:'Manager',permissions:[],manageableRoles:'bad'})).resolves.toEqual({name:'Manager'}); expect(Role.create).toHaveBeenCalledWith(expect.objectContaining({isDefault:true,manageableRoles:[]}));});
 test('creates explicit default and resets existing',async()=>{Role.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({}); Role.updateMany.mockResolvedValue({}); Role.create.mockResolvedValue({name:'Admin'}); await svc.createRole({name:'Admin',isDefault:true}); expect(Role.updateMany).toHaveBeenCalled();});
 test('gets roles',async()=>{Role.find.mockReturnValue(chain(['r'])); await expect(svc.getAllRoles()).resolves.toEqual(['r']); Role.findById.mockReturnValue({populate:jest.fn().mockResolvedValue(baseRole)}); await expect(svc.getRoleById('r')).resolves.toBe(baseRole);});
 test('update role not found and duplicate/system name errors',async()=>{Role.findById.mockResolvedValue(null); await expect(svc.updateRole('r',{name:'x'})).rejects.toMatchObject({statusCode:404}); Role.findById.mockResolvedValue({...baseRole}); Role.findOne.mockResolvedValue({}); await expect(svc.updateRole('r',{name:'New'})).rejects.toMatchObject({statusCode:409}); Role.findOne.mockResolvedValue(null); Role.findById.mockResolvedValue({...baseRole,isSystem:true}); await expect(svc.updateRole('r',{name:'New'})).rejects.toMatchObject({statusCode:400});});
 test('normalizes non-array manageableRoles to empty array',async()=>{const r={...baseRole,save:jest.fn()};Role.findById.mockResolvedValueOnce(r).mockReturnValueOnce({populate:jest.fn().mockResolvedValue(r)});await expect(svc.updateRole('r',{manageableRoles:'bad'})).resolves.toBe(r);expect(r.manageableRoles).toEqual([]);});
 test('updates role fields and default',async()=>{const r={...baseRole,save:jest.fn(),permissions:[]}; Role.findById.mockResolvedValue(r); Role.findOne.mockResolvedValue(null); Role.updateMany.mockResolvedValue({}); Role.findById.mockReturnValueOnce(Promise.resolve(r)).mockReturnValueOnce({populate:jest.fn().mockResolvedValue(r)}); await expect(svc.updateRole('r',{name:'Manager',description:'d',color:'#fff',permissions:[{resource:'users',action:{update:true}}],isDefault:true,manageableRoles:['x']})).resolves.toBe(r); expect(r.save).toHaveBeenCalled();});
 test('prevents removing only default',async()=>{const r={...baseRole,isDefault:true,save:jest.fn()}; Role.findById.mockResolvedValue(r); Role.findOne.mockResolvedValue(null); await expect(svc.updateRole('r',{isDefault:false})).rejects.toMatchObject({statusCode:400});});
 test('removes default when another default exists',async()=>{const r={...baseRole,isDefault:true,save:jest.fn()}; Role.findById.mockResolvedValue(r); Role.findOne.mockResolvedValue({isDefault:true}); Role.findById.mockReturnValueOnce(Promise.resolve(r)).mockReturnValueOnce({populate:jest.fn().mockResolvedValue(r)}); await svc.updateRole('r',{isDefault:false}); expect(r.isDefault).toBe(false);});
 test('delete role validations and success',async()=>{Role.findById.mockResolvedValue(null); await expect(svc.deleteRole('r')).rejects.toMatchObject({statusCode:404}); Role.findById.mockResolvedValue({...baseRole,isSystem:true}); await expect(svc.deleteRole('r')).rejects.toMatchObject({statusCode:400}); Role.findById.mockResolvedValue({...baseRole}); User.countDocuments.mockResolvedValue(2); await expect(svc.deleteRole('r')).rejects.toMatchObject({statusCode:400});});
 test('deletes role and promotes next default',async()=>{const r={...baseRole,isDefault:true}; const next={save:jest.fn()}; Role.findById.mockResolvedValue(r); User.countDocuments.mockResolvedValue(0); Role.findOne.mockResolvedValue(next); Role.updateMany.mockResolvedValue({}); Role.findByIdAndDelete.mockResolvedValue(r); await expect(svc.deleteRole('r')).resolves.toBe(true); expect(next.isDefault).toBe(true); expect(Role.findByIdAndDelete).toHaveBeenCalledWith('r');});
 test('default role and permissions',async()=>{const r={permissions:[{resource:'users'}],isDefault:true,save:jest.fn()}; Role.findOne.mockResolvedValue(r); await expect(svc.getDefaultRole()).resolves.toBe(r); await expect(svc.getDefaultPermissions()).resolves.toEqual(r.permissions); Role.findOne.mockReset(); Role.findOne.mockResolvedValue(null); await expect(svc.getDefaultRole()).resolves.toBeNull(); await expect(svc.getDefaultPermissions()).resolves.toEqual([]);});
 test("updates non-system role name successfully", async () => {
  const role = {
    ...baseRole,
    name: "OldRole",
    isSystem: false,
    save: jest.fn(),
  };

  Role.findById
    .mockResolvedValueOnce(role)
    .mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(role),
    });

  Role.findOne.mockResolvedValue(null);

  await expect(
    svc.updateRole("r1", {
      name: "NewRole",
    })
  ).resolves.toBe(role);

  expect(role.name).toBe("NewRole");
  expect(role.save).toHaveBeenCalled();
});

test("keeps non-default role when isDefault is false", async () => {
  const role = {
    ...baseRole,
    isDefault: false,
    save: jest.fn(),
  };

  Role.findById
    .mockResolvedValueOnce(role)
    .mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(role),
    });

  await expect(
    svc.updateRole("r1", {
      isDefault: false,
    })
  ).resolves.toBe(role);

  expect(role.isDefault).toBe(false);
});

test("delete non-default role without another default", async () => {
  const role = {
    ...baseRole,
    isDefault: false,
  };

  Role.findById.mockResolvedValue(role);
  User.countDocuments.mockResolvedValue(0);
  Role.updateMany.mockResolvedValue({});
  Role.findOne.mockResolvedValue(null);
  Role.findByIdAndDelete.mockResolvedValue(role);

  await expect(
    svc.deleteRole("r1")
  ).resolves.toBe(true);

  expect(Role.findByIdAndDelete).toHaveBeenCalledWith("r1");
});

test("getDefaultRole falls back to any role when Member does not exist", async () => {
  const fallbackRole = {
    _id: "fallback-id",
    name: "CustomRole",
    isDefault: false,
    permissions: [],
    save: jest.fn(),
  };

  Role.findOne
    .mockResolvedValueOnce(null) // no default role
    .mockResolvedValueOnce(null) // Member not found
    .mockResolvedValueOnce(fallbackRole); // generic fallback

  await expect(svc.getDefaultRole()).resolves.toBe(fallbackRole);

  expect(Role.findOne).toHaveBeenNthCalledWith(1, {
    isDefault: true,
  });

  expect(Role.findOne).toHaveBeenNthCalledWith(2, {
    name: "Member",
  });

  expect(Role.findOne).toHaveBeenNthCalledWith(3);

  expect(fallbackRole.isDefault).toBe(true);
  expect(fallbackRole.save).toHaveBeenCalled();
});
});
