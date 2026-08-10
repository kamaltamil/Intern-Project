jest.mock('multer', () => {
  const multer = jest.fn((options) => ({ options, single: jest.fn() }));
  multer.diskStorage = jest.fn((options) => options);
  return multer;
});

test('configures disk storage, image filter and size limit', () => {
  jest.resetModules();
  const multer = require('multer');
  const profileUpload = require('../../middleware/profileUpload');
  expect(multer.diskStorage).toHaveBeenCalledTimes(1);
  expect(multer).toHaveBeenCalledTimes(1);
  const options = multer.mock.calls[0][0];
  const cb = jest.fn();
  options.storage.destination({}, {}, cb);
  expect(cb).toHaveBeenCalledWith(null, 'public/uploads/profile');
  const cb2 = jest.fn();
  options.storage.filename({}, { originalname: 'photo.png' }, cb2);
  expect(cb2.mock.calls[0][0]).toBeNull();
  expect(cb2.mock.calls[0][1]).toMatch(/\.png$/);
  options.fileFilter({}, { mimetype: 'image/jpeg' }, cb);
  expect(cb).toHaveBeenCalledWith(null, true);
  options.fileFilter({}, { mimetype: 'application/pdf' }, cb);
  expect(cb).toHaveBeenCalledWith(expect.any(Error));
  expect(options.limits.fileSize).toBe(2 * 1024 * 1024);
  expect(profileUpload).toBeDefined();
});
