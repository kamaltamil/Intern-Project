const MODULES=require('../constants/modules');
describe('modules constants',()=>test('contains all RBAC resources',()=>{expect(MODULES).toEqual({USERS:'users',ROLES:'roles',BOOKINGS:'bookings',REPORTS:'reports',APPROVAL:'approval',PROFILE:'profile',DASHBOARD:'dashboard'});}));
