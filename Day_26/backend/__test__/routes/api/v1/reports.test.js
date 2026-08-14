jest.mock('../../../../controllers/reportController',()=>({getReport:jest.fn()}));
jest.mock('../../../../middleware/permissionMiddleware',()=>({requirePermission:jest.fn(()=>jest.fn())}));
test('reports route registers report endpoint',()=>{const router=require('../../../../routes/api/v1/reports');const routes=router.stack.filter(l=>l.route).map(l=>[l.route.path,Object.keys(l.route.methods)]);expect(routes).toEqual([['/',['get']]]);});
