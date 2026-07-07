import { Button, Flex, Item } from 'antd'
import React from 'react'

const Navbar = () => {
  return (
    <>
        <Flex className='navbar-container' align='center' justify='space-between'>
            <Flex>
                <h4 style={{ margin: 0 }}>Movies</h4>
            </Flex>
            <Flex gap='var(--space-sm)'>
                <Button type='primary' style={{ background: 'var(--primary)' }}>Sign In</Button>
                <Button type='default' style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>Login</Button>
            </Flex>
        </Flex>
    </>
  )
}

export default Navbar