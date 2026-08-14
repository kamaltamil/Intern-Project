jest.mock('../../../../controllers/subscriptionController',()=>({subscribe:jest.fn()}));
test('subscription route registers POST endpoint',()=>{const router=require('../../../../routes/api/v1/subscriptions');const routes=router.stack.filter(l=>l.route).map(l=>[l.route.path,Object.keys(l.route.methods)]);expect(routes).toEqual([['/',['post']]]);});
