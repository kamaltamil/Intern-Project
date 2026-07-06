import { useState } from 'react';
import './App.css';
import AddStd from './Components/AddStd';
import Navbar from './Components/Navbar';
import ViewData from './Components/ViewData';

function App() {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingStudent, setEditingStudent] = useState(null)

  const handleCancel = () => {
      setOpen(false)
      setEditingStudent(null)
  }

  const handleDataAdded = () => {
      // Trigger ViewData to refresh
      setRefreshKey(prev => prev + 1)
  }

  return (
    <>
    <Navbar />
    <main style={{ margin: '0 auto', padding: '20px', gap: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AddStd 
        open={open}
        setOpen={setOpen}
        handleCancel={handleCancel}
        onDataAdded={handleDataAdded}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
      />
      <ViewData 
        key={refreshKey} 
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
        setOpen={setOpen}
        onEdit={handleDataAdded}
      />
    </main>
    </>
  );
}

export default App;
