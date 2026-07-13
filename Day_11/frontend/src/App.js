import './App.css';
import { Outlet } from 'react-router-dom';
import NavBar from './Components/NavBar';
import { theme } from 'antd';

function App() {
  
  const token = localStorage.getItem('sessionToken');

  const { token: antdToken } = theme.useToken();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Persistent Left App Sidebar Layout */}
      {token && 
      <aside style={{ width: '250px', background: 'var(--secondary)', color: 'white', padding: '20px' }}>
        <NavBar />
      </aside>
      }
      
      {/* Workspace Area where nested routes swap dynamically */}
      <main style={{ flex: 1, padding: '24px', background: '#f5f5f5' }}>
        <Outlet /> 
      </main>
    </div>
  );
}

export default App;
