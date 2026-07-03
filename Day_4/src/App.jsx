import { useEffect, useState } from 'react'
import './App.css'
import AddUser from './components/AddUser'
import ViewData from './components/ViewData'

function App() {
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem('users')) || []
  })

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>UI Libraries</h1>
      <AddUser users={users} setUsers={setUsers} />
      <ViewData users={users} setUsers={setUsers} />
    </>
  )
}

export default App
