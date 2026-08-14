jest.mock('../../models/booking', () => ({ find: jest.fn(), findById: jest.fn() }));
jest.mock('../../services/emailService', () => ({ sendBookingNotification: jest.fn() }));

const Booking = require('../../models/booking');
const { sendBookingNotification } = require('../../services/emailService');
const service = require('../../services/approvalService');

const query = (value) => {
  const chain = {
    populate: jest.fn(),
    sort: jest.fn(),
  };
  chain.populate.mockReturnValue(chain);
  chain.sort.mockResolvedValue(value);
  return chain;
};

describe('approvalService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('gets pending approvals with room and user population', async () => {
    Booking.find.mockReturnValue(query(['booking']));
    await expect(service.getPendingApprovals()).resolves.toEqual(['booking']);
    expect(Booking.find).toHaveBeenCalledWith({ bookingStatus: 'Pending Approval' });
  });

  test('rejects an unknown booking', async () => {
    Booking.findById.mockResolvedValue(null);
    await expect(service.changeApprovalStatus('missing', 'approve')).rejects.toMatchObject({
      message: 'Booking not found', statusCode: 404,
    });
  });

  test('rejects a booking that is not pending approval', async () => {
    Booking.findById.mockResolvedValue({ bookingStatus: 'Booked' });
    await expect(service.changeApprovalStatus('b1', 'reject')).rejects.toMatchObject({
      message: "Booking cannot be reject from 'Booked' status.", statusCode: 409,
    });
  });

  test('approves a pending booking and sends notification', async () => {
    const booking = { _id: 'b1', bookingStatus: 'Pending Approval', roomStatus: 'Available', save: jest.fn() };
    Booking.findById.mockResolvedValueOnce(booking).mockReturnValueOnce(query({ _id: 'b1' }));
    sendBookingNotification.mockResolvedValue(undefined);
    await expect(service.changeApprovalStatus('b1', 'approve')).resolves.toEqual({ _id: 'b1' });
    expect(booking.bookingStatus).toBe('Payment Pending');
    expect(booking.roomStatus).toBe('Occupied');
    expect(booking.save).toHaveBeenCalled();
    await new Promise(setImmediate);
    expect(sendBookingNotification).toHaveBeenCalledWith('approved', { _id: 'b1' });
  });

  test('rejects a pending booking and makes the room available', async () => {
    const booking = { _id: 'b2', bookingStatus: 'Pending Approval', roomStatus: 'Occupied', save: jest.fn() };
    Booking.findById.mockResolvedValueOnce(booking).mockReturnValueOnce(query({ _id: 'b2' }));
    await expect(service.changeApprovalStatus('b2', 'reject')).resolves.toEqual({ _id: 'b2' });
    expect(booking.bookingStatus).toBe('Rejected');
    expect(booking.roomStatus).toBe('Available');
  });
});
