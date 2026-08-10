const Role=require('../../models/role');

describe('Role model',()=>{
  test('schema defaults',()=>{
    expect(Role.schema.path('name').options.minlength[0]).toBe(2);
    expect(Role.schema.path('description').defaultValue).toBe('');
    expect(Role.schema.path('color').defaultValue).toBe('#722ed1');
    expect(new Role().permissions).toEqual([]);
  });

  test('validates role name and permission resource',async()=>{
    const e=await new Role({name:'x',permissions:[{resource:'bad'}]}).validate().catch(x=>x);
    expect(e.errors.name).toBeDefined();
    expect(e.errors['permissions.0.resource']).toBeDefined();
  });

  test('accepts valid permission action',async()=>{
    const r=new Role({name:'Manager',permissions:[{resource:'users',action:{view:true,create:false}}]});
    await expect(r.validate()).resolves.toBeUndefined();
    expect(r.permissions[0].action.view).toBe(true);
  });
});
