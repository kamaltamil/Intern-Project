const Subscription = require('../../models/subscription');

describe('Subscription model', () => {
  test('defines required unique normalized email', () => { const path=Subscription.schema.path('email'); expect(path.options.required[0]).toBe(true); expect(path.options.unique).toBe(true); expect(path.options.trim).toBe(true); expect(path.options.lowercase).toBe(true); });
  test('accepts a valid email', async () => { await expect(new Subscription({email:'user@example.com'}).validate()).resolves.toBeUndefined(); });
  test('rejects missing and invalid email', async () => { const missing=await new Subscription({}).validate().catch(e=>e); const invalid=await new Subscription({email:'bad'}).validate().catch(e=>e); expect(missing.errors.email).toBeDefined(); expect(invalid.errors.email).toBeDefined(); });
});
