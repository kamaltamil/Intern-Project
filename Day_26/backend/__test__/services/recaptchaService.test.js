jest.mock('node:https', () => ({ request: jest.fn() }));
const https = require('node:https');
const { verifyRecaptcha } = require('../../services/recaptchaService');

describe('recaptchaService', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.RECAPTCHA_SECRET_KEY='secret'; process.env.RECAPTCHA_URL='https://google.test'; });
  test('returns false when token is missing', async () => { await expect(verifyRecaptcha()).resolves.toBe(false); expect(https.request).not.toHaveBeenCalled(); });
  test('rejects when secret is missing', async () => { delete process.env.RECAPTCHA_SECRET_KEY; await expect(verifyRecaptcha('token')).rejects.toThrow('reCAPTCHA is not configured'); });
  test('verifies successful response and includes remote ip', async () => {
    const request={ on:jest.fn(), write:jest.fn(), end:jest.fn() }; https.request.mockImplementation((url,options,callback)=>{ const response={on:jest.fn((event,fn)=>{ if(event==='data') fn('{"success":true}'); if(event==='end') fn(); })}; callback(response); return request; });
    await expect(verifyRecaptcha('token','127.0.0.1')).resolves.toBe(true); expect(request.write).toHaveBeenCalled(); expect(request.end).toHaveBeenCalled();
  });
  test('returns false for unsuccessful verification', async () => { const request={on:jest.fn(),write:jest.fn(),end:jest.fn()}; https.request.mockImplementation((u,o,cb)=>{cb({on:jest.fn((e,fn)=>{if(e==='end')fn.call(null);})});return request;}); await expect(verifyRecaptcha('token')).resolves.toBe(false); });
  test('rejects invalid response JSON', async () => { const request={on:jest.fn(),write:jest.fn(),end:jest.fn()}; https.request.mockImplementation((u,o,cb)=>{cb({on:jest.fn((e,fn)=>{if(e==='data')fn('bad');if(e==='end')fn();})});return request;}); await expect(verifyRecaptcha('token')).rejects.toThrow('Invalid reCAPTCHA verification response'); });
  test('rejects request errors', async () => { let errorHandler; const request={on:jest.fn((event,fn)=>{if(event==='error')errorHandler=fn;}),write:jest.fn(),end:jest.fn()}; https.request.mockImplementation((u,o,cb)=>{cb({on:jest.fn()});return request;}); const promise=verifyRecaptcha('token'); errorHandler(); await expect(promise).rejects.toThrow('Unable to verify reCAPTCHA'); });
});
