jest.mock('../../models/booking',()=>({find:jest.fn()}));
jest.mock('../../models/user',()=>({countDocuments:jest.fn()}));
jest.mock('../../models/rooms',()=>({countDocuments:jest.fn()}));
const Booking=require('../../models/booking');const User=require('../../models/user');const Room=require('../../models/rooms');const {getReports}=require('../../services/reportService');
const chain=(value)=>{const q={populate:jest.fn(),sort:jest.fn()};q.populate.mockReturnValue(q);q.sort.mockResolvedValue(value);return q;};

describe('reportService',()=>{beforeEach(()=>{jest.clearAllMocks();});
 test('builds report summary, status counts, monthly stats and room usage',async()=>{const now=new Date();const bookings=[
 {_id:'b1',createdAt:now,startDate:new Date(now-2*86400000),endDate:now,bookingStatus:'Booked',roomStatus:'Occupied',room:{_id:'r1',roomNumber:'101',type:'Double',price:100},user:{name:'A'}},
 {_id:'b2',createdAt:now,startDate:now,endDate:new Date(now.getTime()+86400000),bookingStatus:'Pending Approval',roomStatus:'Occupied',room:{_id:'r1',roomNumber:'101',type:'Double',price:100},user:{name:'B'}},
 {_id:'b3',createdAt:now,startDate:now,endDate:now,bookingStatus:'CheckedOut',roomStatus:'Available',room:null,user:null},
 {_id:'b4',createdAt:now,startDate:now,endDate:now,bookingStatus:'Cancelled',roomStatus:'Available'},
 ];Booking.find.mockReturnValue(chain(bookings));User.countDocuments.mockResolvedValueOnce(10).mockResolvedValueOnce(7);Room.countDocuments.mockResolvedValue(5);const report=await getReports();expect(report.summary.totalBookings).toBe(4);expect(report.summary.activeBookings).toBe(2);expect(report.summary.completedBookings).toBe(1);expect(report.summary.cancelledBookings).toBe(1);expect(report.summary.revenue).toBe(200);expect(report.summary.totalUsers).toBe(10);expect(report.summary.activeUsers).toBe(7);expect(report.summary.totalRooms).toBe(5);expect(report.statusCounts.Booked).toBe(1);expect(report.statusCounts['Pending Approval']).toBe(1);expect(report.roomUsage[0].bookings).toBe(2);expect(report.bookings).toHaveLength(4);});
 test('returns zero average booking value for empty bookings',async()=>{Booking.find.mockReturnValue(chain([]));User.countDocuments.mockResolvedValue(0);Room.countDocuments.mockResolvedValue(0);const report=await getReports();expect(report.summary.averageBookingValue).toBe(0);expect(report.summary.activeBookings).toBe(0);});
});
