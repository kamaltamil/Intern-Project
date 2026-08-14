jest.mock('../../models/subscription', () => ({ findOne: jest.fn(), create: jest.fn() }));
jest.mock('../../services/emailService', () => ({ sendSubscriptionConfirmation: jest.fn() }));
const Subscription=require('../../models/subscription'); const {sendSubscriptionConfirmation}=require('../../services/emailService'); const {subscribe}=require('../../controllers/subscriptionController');
const response=()=>({status:jest.fn().mockReturnThis(),json:jest.fn()});

describe('subscriptionController',()=>{
 beforeEach(()=>jest.clearAllMocks());
 test('rejects invalid email',async()=>{const res=response();await subscribe({body:{email:'bad'}},res);expect(res.status).toHaveBeenCalledWith(400);});
 test('rejects existing subscriber',async()=>{const res=response();Subscription.findOne.mockResolvedValue({email:'a@b.com'});await subscribe({body:{email:'A@B.COM'}},res);expect(res.status).toHaveBeenCalledWith(409);});
 test('creates subscription and sends confirmation',async()=>{const res=response();Subscription.findOne.mockResolvedValue(null);Subscription.create.mockResolvedValue({});sendSubscriptionConfirmation.mockResolvedValue();await subscribe({body:{email:'A@B.COM'}},res);expect(Subscription.create).toHaveBeenCalledWith({email:'a@b.com'});expect(sendSubscriptionConfirmation).toHaveBeenCalledWith('a@b.com');expect(res.status).toHaveBeenCalledWith(201);});
 test('returns 502 when confirmation fails',async()=>{const res=response();Subscription.findOne.mockResolvedValue(null);Subscription.create.mockResolvedValue({});sendSubscriptionConfirmation.mockRejectedValue(new Error('mail'));await subscribe({body:{email:'a@b.com'}},res);expect(res.status).toHaveBeenCalledWith(502);});
 test('handles duplicate key race',async()=>{const res=response();Subscription.findOne.mockResolvedValue(null);Subscription.create.mockRejectedValue({code:11000});await subscribe({body:{email:'a@b.com'}},res);expect(res.status).toHaveBeenCalledWith(409);});
 test('handles unexpected database errors',async()=>{const res=response();Subscription.findOne.mockRejectedValue(new Error('db'));await subscribe({body:{email:'a@b.com'}},res);expect(res.status).toHaveBeenCalledWith(500);});
});
