jest.mock('dotenv',()=>({config:jest.fn()}));
jest.mock('../../app',()=>({set:jest.fn(),get:jest.fn()}));
jest.mock('debug',()=>jest.fn(()=>jest.fn()));
jest.mock('../../config/db',()=>jest.fn());
const mockServer={listen:jest.fn(),on:jest.fn(),address:jest.fn(()=>({port:8000}))};
jest.mock('http',()=>({createServer:jest.fn(()=>mockServer)}));
const realProcessExit=process.exit;

describe('bin/www',()=>{
 beforeEach(()=>{jest.clearAllMocks();process.env.PORT='8000';});
 afterAll(()=>{process.exit=realProcessExit;});
 const load=()=>{let app,http,db;jest.isolateModules(()=>{require('../../bin/www');app=require('../../app');http=require('http');db=require('../../config/db');});return {app,http,db};};
 test('creates and starts server',()=>{const {app,http,db}=load();expect(http.createServer).toHaveBeenCalledWith(app);expect(app.set).toHaveBeenCalledWith('port',8000);expect(db).toHaveBeenCalled();expect(mockServer.listen).toHaveBeenCalledWith(8000);});
 test('supports named pipe and negative port',()=>{process.env.PORT='named-pipe';let first;jest.isolateModules(()=>{require('../../bin/www');first=require('../../app');});expect(first.set).toHaveBeenCalledWith('port','named-pipe');process.env.PORT='-1';jest.resetModules();let second;jest.isolateModules(()=>{require('../../bin/www');second=require('../../app');});expect(second.set).toHaveBeenCalledWith('port',false);});
 test('handles listen errors',()=>{load();const errorHandler=mockServer.on.mock.calls.find(c=>c[0]==='error')[1];process.exit=jest.fn();expect(()=>errorHandler({syscall:'other'})).toThrow();});
 test('handles EACCES and EADDRINUSE',()=>{load();const errorHandler=mockServer.on.mock.calls.find(c=>c[0]==='error')[1];process.exit=jest.fn();const spy=jest.spyOn(console,'error').mockImplementation(()=>{});errorHandler({syscall:'listen',code:'EACCES'});errorHandler({syscall:'listen',code:'EADDRINUSE'});expect(process.exit).toHaveBeenCalledTimes(2);expect(process.exit).toHaveBeenLastCalledWith(1);spy.mockRestore();});
 test('throws unknown listen errors and handles listening',()=>{load();const errorHandler=mockServer.on.mock.calls.find(c=>c[0]==='error')[1];expect(()=>errorHandler({syscall:'listen',code:'UNKNOWN'})).toThrow();const listening=mockServer.on.mock.calls.find(c=>c[0]==='listening')[1];expect(()=>listening()).not.toThrow();});
});
