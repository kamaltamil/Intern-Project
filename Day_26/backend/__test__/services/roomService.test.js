jest.mock('../../models/rooms', () => ({ findOne: jest.fn(), create: jest.fn(), find: jest.fn() }));
const Room = require('../../models/rooms');
const { createNewRoom, listRooms } = require('../../services/roomService');

describe('roomService', () => {
  beforeEach(() => jest.clearAllMocks());
  test('creates a room', async () => { const room={_id:'1',roomNumber:'101'}; Room.findOne.mockResolvedValue(null); Room.create.mockResolvedValue(room); await expect(createNewRoom({roomNumber:'101',type:'Single',price:100})).resolves.toBe(room); expect(Room.create).toHaveBeenCalledWith({roomNumber:'101',type:'Single',price:100}); });
  test('rejects duplicate room', async () => { Room.findOne.mockResolvedValue({ _id:'1' }); await expect(createNewRoom({roomNumber:'101'})).rejects.toThrow('Validation error: Room with this number already exists'); });
  test('wraps create errors', async () => { Room.findOne.mockResolvedValue(null); Room.create.mockRejectedValue(new Error('bad')); await expect(createNewRoom({roomNumber:'101'})).rejects.toThrow('Validation error: bad'); });
  test('lists rooms', async () => { Room.find.mockResolvedValue([{_id:'1'}]); await expect(listRooms()).resolves.toEqual([{_id:'1'}]); });
  test('wraps list errors', async () => { Room.find.mockRejectedValue(new Error('db')); await expect(listRooms()).rejects.toThrow('Error fetching rooms: db'); });
});
