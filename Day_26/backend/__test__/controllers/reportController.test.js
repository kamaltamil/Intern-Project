jest.mock('../../services/reportService', () => ({ getReports: jest.fn() }));
const service = require('../../services/reportService');
const controller = require('../../controllers/reportController');
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

describe('reportController', () => {
  beforeEach(() => jest.clearAllMocks());
  test('returns reports successfully', async () => { const res=response(); service.getReports.mockResolvedValue({ summary:{} }); await controller.getReport({},res); expect(res.status).toHaveBeenCalledWith(200); expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ report:{ summary:{} } })); });
  test('returns report error', async () => { const res=response(); service.getReports.mockRejectedValue(new Error('db')); await controller.getReport({},res); expect(res.status).toHaveBeenCalledWith(500); expect(res.json).toHaveBeenCalledWith({ message:'db' }); });
  test('uses fallback report error message', async () => { const res=response(); service.getReports.mockRejectedValue({}); await controller.getReport({},res); expect(res.json).toHaveBeenCalledWith({ message:'Error fetching reports' }); });
});
