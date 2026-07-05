import { useEffect, useState } from 'react'
import { Button } from 'antd'
import './App.css'
import AddUser from './components/AddUser'
import ViewData from './components/ViewData'

function App() {
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem('users')) || []
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  const handleSubmit = (payload) => {
    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...payload } : user)))
    } else {
      setUsers([...users, { id: Date.now(), ...payload }])
    }
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const openAddModal = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>UI Libraries</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          Add User
        </Button>
      </div>

      <AddUser
        open={isModalOpen}
        editingUser={editingUser}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        onSubmit={handleSubmit}
      />

      <ViewData users={users} setUsers={setUsers} onEdit={openEditModal} />
    </>
  )
}

export default App
