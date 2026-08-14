jest.mock('../../../../controllers/approvalController',()=>({getPending:jest.fn(),approveBooking:jest.fn(),rejectBooking:jest.fn()}));
jest.mock('../../../../middleware/permissionMiddleware',()=>({requirePermission:jest.fn(()=>jest.fn())}));
test('approval routes register pending, approve and reject endpoints',()=>{const router=require('../../../../routes/api/v1/approval');const routes=router.stack.filter(l=>l.route).map(l=>[l.route.path,Object.keys(l.route.methods)]);expect(routes).toEqual([['/pending',['get']],['/:id/approve',['patch']],['/:id/reject',['patch']]]);});
