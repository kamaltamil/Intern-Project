import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'

const ViewData = ({ users = [], setUsers }) => {
  const [editUserId, setEditUserId] = useState(null)
  const [editValues, setEditValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    location: ''
  })

  const startEdit = (user) => {
    setEditUserId(user.id)
    setEditValues({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      mobile: user.mobile || '',
      location: user.location || ''
    })
  }

  const handleChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const saveEdit = () => {
    const updatedUsers = users.map((user) =>
      user.id === editUserId ? { ...user, ...editValues } : user
    )
    setUsers(updatedUsers)
    setEditUserId(null)
  }

  const cancelEdit = () => {
    setEditUserId(null)
  }

  const deleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)
  }
  return (
    <TableContainer style={{ width: '80%', margin: '24px auto' }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No users added yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                {editUserId === user.id ? (
                  <>
                    <TableCell>
                      <input
                        value={editValues.firstname}
                        onChange={(e) => handleChange('firstname', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editValues.lastname}
                        onChange={(e) => handleChange('lastname', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editValues.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editValues.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editValues.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={saveEdit} style={{ marginRight: 8 }}>
                        Save
                      </Button>
                      <Button size="small" variant="outlined" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => startEdit(user)} style={{ marginRight: 8 }}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => deleteUser(user.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ViewData