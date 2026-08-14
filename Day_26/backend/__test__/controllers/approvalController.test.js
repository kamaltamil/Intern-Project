jest.mock('../../services/approvalService', () => ({ getPendingApprovals: jest.fn(), changeApprovalStatus: jest.fn() }));
const service = require('../../services/approvalService');
const controller = require('../../controllers/approvalController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

describe('approvalController', () => {
  beforeEach(() => jest.clearAllMocks());
  test('returns pending bookings', async () => {
    const res = response(); service.getPendingApprovals.mockResolvedValue(['b']);
    await controller.getPending({}, res);
    expect(res.status).toHaveBeenCalledWith(200); expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ bookings: ['b'] }));
  });
  test('handles pending booking errors', async () => {
    const res = response(); service.getPendingApprovals.mockRejectedValue({ statusCode: 404, message: 'missing' });
    await controller.getPending({}, res); expect(res.status).toHaveBeenCalledWith(404); expect(res.json).toHaveBeenCalledWith({ message: 'missing' });
  });
  test('approves booking', async () => {
    const res = response(); service.changeApprovalStatus.mockResolvedValue('b');
    await controller.approveBooking({ params: { id: '1' } }, res);
    expect(service.changeApprovalStatus).toHaveBeenCalledWith('1', 'approve'); expect(res.status).toHaveBeenCalledWith(200);
  });
  test('handles approval errors', async () => {
    const res = response(); service.changeApprovalStatus.mockRejectedValue(new Error('fail'));
    await controller.approveBooking({ params: { id: '1' } }, res); expect(res.status).toHaveBeenCalledWith(500);
  });
  test('rejects booking', async () => {
    const res = response(); service.changeApprovalStatus.mockResolvedValue('b');
    await controller.rejectBooking({ params: { id: '1' } }, res);
    expect(service.changeApprovalStatus).toHaveBeenCalledWith('1', 'reject'); expect(res.status).toHaveBeenCalledWith(200);
  });
  test('handles rejection errors', async () => {
    const res = response(); service.changeApprovalStatus.mockRejectedValue(new Error('fail'));
    await controller.rejectBooking({ params: { id: '1' } }, res); expect(res.status).toHaveBeenCalledWith(500);
  });
});
