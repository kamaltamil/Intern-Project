import React from 'react'
import Button from '@mui/material/Button'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'

const fieldMap = [
  { label: 'First Name', key: 'firstname' },
  { label: 'Last Name', key: 'lastname' },
  { label: 'Email', key: 'email' },
  { label: 'Mobile', key: 'mobile' },
  { label: 'Location', key: 'location' }
]

const ViewData = ({ users = [], setUsers, onEdit }) => {
  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  return (
    <TableContainer style={{ width: '80%', margin: '24px auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Table sx={{ minWidth: 650 }} aria-label="user table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#1976d2' }}>
            {fieldMap.map((field) => (
              <TableCell 
                key={field.key}
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  border: '1px solid #1565c0',
                  padding: '16px'
                }}
              >
                {field.label}
              </TableCell>
            ))}
            <TableCell 
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                border: '1px solid #1565c0',
                padding: '16px'
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={fieldMap.length + 1} align="center" sx={{ padding: '32px', border: '1px solid #e0e0e0' }}>
                No users added yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow 
                key={user.id}
                sx={{ 
                  backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                  '&:hover': {
                    backgroundColor: '#e3f2fd'
                  }
                }}
              >
                {fieldMap.map((field) => (
                  <TableCell 
                    key={`${user.id}-${field.key}`}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      padding: '12px 16px'
                    }}
                  >
                    {user[field.key] || ''}
                  </TableCell>
                ))}
                <TableCell 
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                >
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error" 
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ViewData