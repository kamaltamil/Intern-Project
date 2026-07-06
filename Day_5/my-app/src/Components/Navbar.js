import { Flex } from 'antd';
import React from 'react'

const Navbar = () => {

  return (
    <>
      <Flex justify="center" align="center" style={{ padding: '10px', backgroundColor: 'var(--primary-color)', color: 'white', gap: '10px' }}>
         <h1 style={{margin: '0'}}>Student Management System</h1> 
      </Flex>
    </>
  )
}

export default Navbar