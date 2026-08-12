import AppRoutes from './routes/AppRoutes';
import PermissionSync from './components/PermissionSync';

function App() {
  return (
    <>
      <PermissionSync />
      <AppRoutes />
    </>
  );
}

export default App;
